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
Deploy the Step Functions and Lambda resources: `make sf`

After completing the deployment, update the following outputs:
* `O_FN`: output Lambda function name (select the one you want to test)
* `O_SFN`: output Step Functions workflow ARN

## Testing
Test one of the functions locally (defaults to `Fn1`, update accordingly): `make lambda.local`

Test one of the deployed functions (function name you saved as `O_FN`): `make lambda.invoke.sync`

Test the workflow (workflow ARN you saved as `O_SFN_ARN`): `make sf.invoke`