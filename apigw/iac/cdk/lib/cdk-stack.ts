import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnResource, Fn } from "aws-cdk-lib/core";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as s3 from "aws-cdk-lib/aws-s3-assets";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as path from "path";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hostedZoneId = new cdk.CfnParameter(this, "hostedZoneId", {
      type: "String"
    });
    const domainName = new cdk.CfnParameter(this, "domainName", {
      type: "String"
    });
    const fnMemory = new cdk.CfnParameter(this, "fnMemory", {
      type: "Number"
    });
    const fnTimeout = new cdk.CfnParameter(this, "fnTimeout", {
      type: "Number"
    });

    const rootDomain = domainName.valueAsString.substring(domainName.valueAsString.indexOf(".")+1);
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, "hostedZone", {
      zoneName: rootDomain,
      hostedZoneId: hostedZoneId.valueAsString
    });
    const certificate = new acm.Certificate(this, "certificate", {
      domainName: domainName.valueAsString,
      validation: acm.CertificateValidation.fromDns(hostedZone)
    });
    const basePath = "example";
    const apiStage = this.node.tryGetContext("apiStage");

    const apiAsset = new s3.Asset(this, "apiAsset", {
      path: path.join(__dirname, "../../openapi.yaml")
    });
    const transforms = {
      "Location": apiAsset.s3ObjectUrl
    };
    const transformedAsset = Fn.transform("AWS::Include", transforms);
    const apiDefinition = apigateway.ApiDefinition.fromInline(transformedAsset);
    const apiLogs = new logs.LogGroup(this, "/aws/apigateway/apigw-cdk-template");
    const api = new apigateway.SpecRestApi(this, 'api', {
      restApiName: "apigw-cdk-template",
      // NOTE: can't add asset directly because of the need to use the AWS::Include transform
      // apiDefinition: apigateway.ApiDefinition.fromAsset('../openapi.yaml'),
      apiDefinition: apiDefinition,
      deploy: true,
      domainName: {
        basePath: basePath,
        domainName: domainName.valueAsString,
        certificate: certificate,
        endpointType: apigateway.EndpointType.REGIONAL,
        securityPolicy: apigateway.SecurityPolicy.TLS_1_2
      },
      deployOptions: {
        // NOTE: CfnParameter not available at synthesis time, switched from CfnParameter to context variable
        stageName: apiStage,
        accessLogDestination: new apigateway.LogGroupLogDestination(apiLogs),
        accessLogFormat: apigateway.AccessLogFormat.custom(`{
          "requestId": "${apigateway.AccessLogField.contextRequestId}",
          "ip": "${apigateway.AccessLogField.contextIdentitySourceIp}",
          "requestTime": "${apigateway.AccessLogField.contextRequestTime}",
          "httpMethod": "${apigateway.AccessLogField.contextHttpMethod}",
          "resourcePath": "${apigateway.AccessLogField.contextResourcePath}",
          "status": "${apigateway.AccessLogField.contextStatus}",
          "protocol": "${apigateway.AccessLogField.contextProtocol}",
          "responseLength": "${apigateway.AccessLogField.contextResponseLength}"
        }`.replace(/\n|\r/g, "")),
        dataTraceEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO
      },
      endpointTypes: [
        apigateway.EndpointType.REGIONAL
      ]
    });
    const record = new route53.RecordSet(this, "record", {
      // NOTE: needed to explicitly add this; otherwise was getting a mangled name that caused deployment failures
      recordName: domainName.valueAsString,
      recordType: route53.RecordType.A,
      target: route53.RecordTarget.fromAlias(new targets.ApiGateway(api)),
      zone: hostedZone
    });
    cdk.Tags.of(api).add("application:group", "templates");
    cdk.Tags.of(api).add("application:subgroup", "apigw");
    cdk.Tags.of(api).add("application:owner", "heeki");

    const role = new iam.Role(this, "fnRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com")
    });
    const cloudwatchInsightsPolicy = new iam.Policy(this, "cloudwatchInsightsPolicy", {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "logs:CreateLogGroup"
          ],
          resources: ["*"]
        })
      ]
    });
    const cloudwatchLogsPolicy = new iam.Policy(this, "cloudwatchLogsPolicy", {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "logs:CreateLogStream",
            "logs:PutLogEvents",
            "logs:DescribeLogStreams"
          ],
          resources: ["arn:aws:logs:*:*:log-group:*:*"]
        })
      ]
    });
    const xrayPolicy = new iam.Policy(this, "xrayPolicy", {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "xray:PutTraceSegments",
            "xray:PutTelemetryRecords",
            "xray:GetSamplingRules",
            "xray:GetSamplingTargets",
            "xray:GetSamplingStatisticSummaries"
          ],
          resources: ["*"]
        })
      ]
    });
    role.attachInlinePolicy(cloudwatchInsightsPolicy);
    role.attachInlinePolicy(cloudwatchLogsPolicy);
    role.attachInlinePolicy(xrayPolicy);

    const xrayLayer = lambda.LayerVersion.fromLayerVersionArn(this, "xrayLayer",
      "arn:aws:lambda:us-east-1:546275881527:layer:xray-python3:3"
    );
    const insightsLayer = lambda.LayerVersion.fromLayerVersionArn(this, "insightsLayer",
      "arn:aws:lambda:us-east-1:580247275435:layer:LambdaInsightsExtension:38"
    );
    const fn = new lambda.Function(this, "fn", {
      runtime: lambda.Runtime.PYTHON_3_11,
      memorySize: fnMemory.valueAsNumber,
      timeout: cdk.Duration.seconds(fnTimeout.valueAsNumber),
      code: lambda.Code.fromAsset("../../src"),
      handler: "fn.handler",
      role: role,
      environment: {
        FOO: "bar"
      },
      layers: [
        xrayLayer,
        insightsLayer
      ],
      logRetention: logs.RetentionDays.ONE_WEEK
    });
    fn.addPermission("apiGatewayPermission", {
      principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      action: "lambda:InvokeFunction",
      sourceArn: `arn:aws:execute-api:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:${api.restApiId}/*/*/*`
    });
    (fn.node.defaultChild as CfnResource).overrideLogicalId("Fn");
    cdk.Tags.of(fn).add("application:group", "templates");
    cdk.Tags.of(fn).add("application:subgroup", "apigw");
    cdk.Tags.of(fn).add("application:owner", "heeki");

    new cdk.CfnOutput(this, "outFn", { value: fn.functionName });
    new cdk.CfnOutput(this, "outApiEndpoint", { value: `https://${api.restApiId}.execute-api.${cdk.Aws.REGION}.amazonaws.com/${apiStage}/` });
    new cdk.CfnOutput(this, "outCustomEndpoint", { value: `https://${domainName.valueAsString}/${basePath}` });
  };
}
