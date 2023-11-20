include etc/environment.sh

eventbridge: eventbridge.package eventbridge.deploy
eventbridge.package:
	sam package -t ${EVENTBRIDGE_TEMPLATE} --output-template-file ${EVENTBRIDGE_OUTPUT} --s3-bucket ${BUCKET} --s3-prefix ${EVENTBRIDGE_STACK}
eventbridge.deploy:
	sam deploy -t ${EVENTBRIDGE_OUTPUT} --stack-name ${EVENTBRIDGE_STACK} --parameter-overrides ${EVENTBRIDGE_PARAMS} --capabilities CAPABILITY_NAMED_IAM

lambda.local:
	sam local invoke -t ${EVENTBRIDGE_TEMPLATE} --parameter-overrides ${EVENTBRIDGE_PARAMS} --env-vars etc/envvars.json -e etc/event.json Fn | jq
lambda.invoke.sync:
	aws --profile ${PROFILE} lambda invoke --function-name ${O_FN} --invocation-type RequestResponse --payload file://etc/event.json --cli-binary-format raw-in-base64-out --log-type Tail tmp/fn.json | jq "." > tmp/response.json
	cat tmp/response.json | jq -r ".LogResult" | base64 --decode
	cat tmp/fn.json | jq
lambda.invoke.async:
	aws --profile ${PROFILE} lambda invoke --function-name ${O_FN} --invocation-type Event --payload file://etc/event.json --cli-binary-format raw-in-base64-out --log-type Tail tmp/fn.json | jq "."

emit:
	python3 src/emit.py --file etc/event.json