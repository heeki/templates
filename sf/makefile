include etc/environment.sh

sf: sf.package sf.deploy
sf.package:
	sam package -t ${SF_TEMPLATE} --output-template-file ${SF_OUTPUT} --s3-bucket ${BUCKET} --s3-prefix ${SF_STACK}
sf.deploy:
	sam deploy -t ${SF_OUTPUT} --stack-name ${SF_STACK} --parameter-overrides ${SF_PARAMS} --capabilities CAPABILITY_NAMED_IAM

lambda.local:
	sam local invoke -t ${SF_TEMPLATE} --parameter-overrides ${SF_PARAMS} --env-vars etc/envvars.json -e etc/event.json Fn1 | jq
lambda.invoke.sync:
	aws --profile ${PROFILE} lambda invoke --function-name ${O_FN} --invocation-type RequestResponse --payload file://etc/event.json --cli-binary-format raw-in-base64-out --log-type Tail tmp/fn.json | jq "." > tmp/response.json
	cat tmp/response.json | jq -r ".LogResult" | base64 --decode
	cat tmp/fn.json | jq
lambda.invoke.async:
	aws --profile ${PROFILE} lambda invoke --function-name ${O_FN} --invocation-type Event --payload file://etc/event.json --cli-binary-format raw-in-base64-out --log-type Tail tmp/fn.json | jq "."

sf.invoke:
	aws --profile ${PROFILE} stepfunctions start-execution --state-machine-arn ${O_SF_ARN} --input file://etc/event.json | jq
sf.list-executions:
	aws --profile ${PROFILE} stepfunctions list-executions --state-machine-arn ${O_SF_ARN} | jq
