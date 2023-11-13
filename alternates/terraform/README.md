# Overview
This directory is for deploying a Lambda function using Terraform.

## Pre-requisites
Install the Terraform CLI:
```
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

Initialize Terraform state: `make tf.init`

## Deployment
Check the resource deployment plan: `make tf.plan`

Deploy the Lambda resources: `make tf.apply`

View the deployed resource: `make tf.output`
