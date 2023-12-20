include etc/environment.sh

cdk.synth:
	cdk synth ${CDK_PARAMS}
cdk.deploy:
	cdk deploy --context stackName=${CDK_STACK} ${CDK_PARAMS}
cdk.destroy:
	cdk destroy --context stackName=${CDK_STACK} ${CDK_PARAMS}
