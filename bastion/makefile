include etc/environment.sh

ec2: ec2.package ec2.deploy
ec2.package:
	sam package -t ${EC2_TEMPLATE} --output-template-file ${EC2_OUTPUT} --s3-bucket ${S3BUCKET}
ec2.deploy:
	sam deploy -t ${EC2_OUTPUT} --stack-name ${EC2_STACK} --parameter-overrides ${EC2_PARAMS} --capabilities CAPABILITY_NAMED_IAM
