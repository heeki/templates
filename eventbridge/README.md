# Overview
This directory is for deploying EventBridge with a Lambda function target

## Pre-requisites
Copy `etc/environment.template` to `etc/environment.sh` and update accordingly.
* `PROFILE`: your AWS CLI profile with the appropriate credentials to deploy
* `REGION`: your AWS region
* `BUCKET`: your configuration bucket

For the EventBridge Lambda stack, update the following accordingly.
* `P_FN_MEMORY`: amount of memory in MB for the Lambda function
* `P_FN_TIMEOUT`: timeout in seconds for the Lambda function

## Deployment
Deploy the EventBridge and Lambda resources: `make eventbridge`

After completing the deployment, update the following outputs:
* `O_FN`: output Lambda function name
* `O_BUS_ARN`: output EventBridge Bus ARN

## Testing
Test the function locally: `make lambda.local`  
Test the deployed function: `make lambda.invoke.sync`  
Send an event to the EventBridge bus: `make emit`
