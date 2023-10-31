# Overview
This directory is for deploying only a Lambda function using the Serverless Framework

## Pre-requisites
Install the serverless framework:
```
npm install -g serverless
```

## Deployment
Deploy the Lambda resources: `make sls.deploy`

## Testing
Test the function locally: `make sls.local`

Test the deployed function: `make sls.invoke`
