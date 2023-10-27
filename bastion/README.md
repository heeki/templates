# Overview
This directory is for deploying an EC2 instance in a public subnet as a bastion to access resources in private subnets.

## Pre-requisites
Copy `etc/environment.template` to `etc/environment.sh` and update accordingly.
* `PROFILE`: your AWS CLI profile with the appropriate credentials to deploy
* `REGION`: your AWS region
* `BUCKET`: your configuration bucket

For the EC2 stack, update the following accordingly.
* `P_VPC_ID`: your VPC ID
* `P_SUBNET_IDS`: your comma separated list of public subnet IDs
* `P_INGRESS_CIDR`: your ingress CIDR range
* `P_IMAGE_ID`: your desired EC2 AMI
* `P_INSTANCE_TYPE`: your desired EC2 instance type
* `P_SSH_KEY`: your EC2 SSH keypair name

## Deployment
Deploy the EC2 resources: `make ec2`

## Testing
To connect to your EC2 instance: `ssh -o ServerAliveInterval=30 -i <keypair>.pem ec2-user@<ec2-instance-fqdn>`
