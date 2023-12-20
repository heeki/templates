import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fnMemory = new cdk.CfnParameter(this, "fnMemory", {
      type: "Number"
    });
    const fnTimeout = new cdk.CfnParameter(this, "fnTimeout", {
      type: "Number"
    });

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
      code: lambda.Code.fromAsset("src"),
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
    cdk.Tags.of(fn).add("application:group", "templates");
    cdk.Tags.of(fn).add("application:subgroup", "cdk");
    cdk.Tags.of(fn).add("application:owner", "heeki");
  };
}
