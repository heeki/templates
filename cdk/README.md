# Overview
This directory is for deploying a Lambda function using CDK.

## Background
This application directory was initialized using the following command.
```
cdk init app --language typescript
```

## Pre-requisites
If using CDK for the first time with an AWS account, you must first bootstrap CDK.
```
cdk bootstrap aws://{ACCOUNTID}/{REGION}
```

Copy `etc/environment.template` to `etc/environment.sh` and update accordingly.
* `CDK_STACK`: your CloudFormation stack name

## Deployment
Check if the template is valid: `make cdk.synth`

Deploy the Lambda resources: `make cdk.deploy`
