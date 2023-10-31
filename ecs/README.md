# Overview
This directory is for deploying an ALB with a backing ECS service.

## Pre-requisites
Copy `etc/environment.template` to `etc/environment.sh` and update accordingly.
* `PROFILE`: your AWS CLI profile with the appropriate credentials to deploy
* `REGION`: your AWS region
* `BUCKET`: your configuration bucket

For the infrastructure stack, update the following accordingly.
* `P_VPC_ID`: VPC ID
* `P_HOSTEDZONE_ID`: the Route 53 private hosted zone ID
* `P_DOMAINNAME`: the custom domain name of your ACM certificate and Route 53 alias
* `P_CLIENT_INGRESS_CIDR`: your ingress CIDR range
* `P_SUBNETIDS_PUBLIC`: a comma separated list of public subnet ids for the ALB

## Deployment
Deploy the infrastructure resources: `make infrastructure`

After completing the deployment, update the following outputs:
* `O_CERT_ARN`: output ACM certificate ARN
* `O_ALB_ARN`: output ALB ARN
* `O_ALB_TGROUP`: output target group ARN
* `O_SGROUP_ALB`: output ALB security group ARN
* `O_SGROUP_TASK`: output task security group ARN
* `O_ECR_REPO`: output ECR repository name

Build the docker file and push it to the ECR repository: `make docker`

Deploy the ECS resources: `make ecs`

## Testing
To run the FastAPI application natively locally: `make fastapi`

To test the native endpoint: `make curl.fastapi.get`

To run the docker container locally: `make docker.run`

To test the docker endpoint: `make curl.docker.get`

To test the deployed endpoint: `make curl.ecs.get`