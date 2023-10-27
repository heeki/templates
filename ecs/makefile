include etc/environment.sh

# infrastructure for ecs application
infrastructure: infrastructure.package infrastructure.deploy
infrastructure.package:
	sam package --profile ${PROFILE} -t ${INFRASTRUCTURE_TEMPLATE} --output-template-file ${INFRASTRUCTURE_OUTPUT} --s3-bucket ${BUCKET} --s3-prefix ${INFRASTRUCTURE_STACK}
infrastructure.deploy:
	sam deploy --profile ${PROFILE} -t ${INFRASTRUCTURE_OUTPUT} --stack-name ${INFRASTRUCTURE_STACK} --parameter-overrides ${INFRASTRUCTURE_PARAMS} --capabilities CAPABILITY_NAMED_IAM

# fastapi testing
fastapi:
	cd src/application && uvicorn fapi:server --reload
curl.fastapi.get:
	curl -s -XGET http://127.0.0.1:8000/dice/\?name\=test | jq -c '.[]'
curl.fastapi.post:
	curl -s -XPOST -H "content-type: application/json" -d @etc/payload.json http://127.0.0.1:8000/dice/ | jq

# containerize spring application
docker: docker.build docker.login docker.tag docker.push
docker.build:
	docker build -f dockerfile -t ${C_TAG} .
docker.login:
	aws ecr --profile ${PROFILE} get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${C_REPO_BASE}
docker.tag:
	docker tag ${C_TAG} ${C_REPO_URI}
docker.push:
	docker push ${C_REPO_URI}
docker.run:
	# -p hostport:containerport
	docker run -p 8080:8080 --env-file etc/environment.docker ${C_TAG}

# docker testing
curl.docker.get:
	curl -s -XGET http://127.0.0.1:8080/dice/\?name\=test | jq -c '.[]'
curl.docker.post:
	curl -s -XPOST -H "content-type: application/json" -d @etc/payload.json http://127.0.0.1:8080/dice/ | jq

# ecs cluster and service
ecs: ecs.package ecs.deploy
ecs.package:
	sam package --profile ${PROFILE} -t ${ECS_TEMPLATE} --output-template-file ${ECS_OUTPUT} --s3-bucket ${BUCKET} --s3-prefix ${ECS_STACK}
ecs.deploy:
	sam deploy --profile ${PROFILE} -t ${ECS_OUTPUT} --stack-name ${ECS_STACK} --parameter-overrides ${ECS_PARAMS} --capabilities CAPABILITY_NAMED_IAM

# ecs testing
curl.ecs.get:
	curl -s -XGET https://buildit.heeki.cloud/dice/\?name\=test | jq -c '.[]'
curl.ecs.post:
	curl -s -XPOST -H "content-type: application/json" -d @etc/payload.json https://buildit.heeki.cloud/dice/ | jq