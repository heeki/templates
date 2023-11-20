## Overview
This repository contains a set of templates that implement personal best practices that have been cultivated over time and emulates what is produced by cookiecutter templates via `sam init`. Deployments are all conducted using `make` commands which take configuration from an `etc/environment.sh` file. Each component has its own README file which explains how to use each template.

## SAM templates
SAM and CloudFormation are my personal preferences for deploying AWS resources. The examples below use SAM and CloudFormation to define AWS resources.
* `apigw`: template that creates an API Gateway endpoint as defined by a separate OpenAPI specification and integrates with Lambda on the backend
* `bastion`: template that deploys an EC2 instance as a bastion for access to private subnets
* `ecs`: template that deploys an ALB, Fargate cluster, and Fargate service/task
* `eventbridge`: template that deploys an EventBridge bus, rule, and Lambda function target
* `lambda`: templates that deploy a Lambda function
* `sf`: template that deploys a Step Functions workflow with integration to a set of Lambda functions
* `shared`: a set of reusable Python libraries that wrap AWS SDKs

## Alternate templates
The examples below are some alternative infrastructure-as-code options.
* `cdk`: template using CDK that deploys a Lambda function
* `sls`: template using Serverless Framework that deploys a Lambda function
* `terraform`: template using Terraform that deploys a Lambda function