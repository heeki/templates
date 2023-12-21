import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';

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
    cdk.Tags.of(fn).add("application:group", "templates");
    cdk.Tags.of(fn).add("application:subgroup", "cdk");
    cdk.Tags.of(fn).add("application:owner", "heeki");

    const logGroup = new logs.LogGroup(this, "SfLogGroup", {
      logGroupName: "/aws/sf/sf-cdk-template",
      retention: logs.RetentionDays.ONE_WEEK
    });
    const retryPolicy = {
      errors: [
        "Lambda.ServiceException",
        "Lambda.AWSLambdaException",
        "Lambda.SdkClientException",
        "Lambda.TooManyRequestsException"
      ],
      interval: cdk.Duration.seconds(1),
      maxAttempts: 3,
      backoffRate: 2
    };
    const taskBusinessLogic1 = new tasks.LambdaInvoke(this, "BusinessLogic1", {
      lambdaFunction: fn,
      outputPath: '$.Payload'
    });
    taskBusinessLogic1.addRetry(retryPolicy);
    const taskBusinessLogic2 = new tasks.LambdaInvoke(this, "BusinessLogic2", {
      lambdaFunction: fn,
      outputPath: '$.Payload'
    });
    taskBusinessLogic2.addRetry(retryPolicy);
    const taskBusinessLogic3 = new tasks.LambdaInvoke(this, "BusinessLogic3", {
      lambdaFunction: fn,
      outputPath: '$.Payload'
    });
    taskBusinessLogic3.addRetry(retryPolicy);
    const taskBusinessLogic4 = new tasks.LambdaInvoke(this, "BusinessLogic4", {
      lambdaFunction: fn,
      outputPath: '$.Payload'
    });
    taskBusinessLogic4.addRetry(retryPolicy);
    const choice1 = new sfn.Choice(this, "Complete?")
    const definition = sfn.Chain.start(
      taskBusinessLogic1
      .next(choice1
        .when(sfn.Condition.stringEquals('$.status', "SUCCESS"), taskBusinessLogic2)
        .otherwise(taskBusinessLogic3)
        .afterwards()
        .next(taskBusinessLogic4)
      )
    );
    const stateMachine = new sfn.StateMachine(this, "stateMachine", {
      definition,
      logs: {
        destination: logGroup,
        level: sfn.LogLevel.ALL
      },
      timeout: cdk.Duration.minutes(1)
    });

    new cdk.CfnOutput(this, "outStateMachineArn", {
      value: stateMachine.stateMachineArn
    })
  }
}
