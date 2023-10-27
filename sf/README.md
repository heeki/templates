# Overview
This directory is for deploying a Step Functions workflow and a Lambda function.

## Pre-requisites
Copy `etc/environment.template` to `etc/environment.sh` and update accordingly.
* `PROFILE`: your AWS CLI profile with the appropriate credentials to deploy
* `REGION`: your AWS region
* `BUCKET`: your configuration bucket

For the Lambda and Step Functions stack, update the following accordingly.
* `P_FN_MEMORY`: amount of memory in MB for the Lambda function
* `P_FN_TIMEOUT`: timeout in seconds for the Lambda function

## Deployment
Deploy the Lambda and API Gateway resources: `make apigw`

After completing the deployment, update the following outputs:
* `O_FN`: output Lambda function name
* `O_API_ENDPOINT`: output API Gateway endpoint, e.g. https://<api_id>.execute-api.<region>.amazonaws.com/<stage>

## Testing
Test the function locally: `make lambda.local`

Test the deployed function: `make lambda.invoke.sync`

Test the workflow: `make sf.invoke`