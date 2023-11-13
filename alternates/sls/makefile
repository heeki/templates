include etc/environment.sh

sls.deploy:
	serverless deploy
sls.local:
	serverless invoke local --function fn --path etc/event.json | jq
sls.invoke:
	serverless invoke --function fn --path etc/event.json | jq
