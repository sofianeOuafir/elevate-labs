export TAG=latest
export CMD="npm run start"

# Run the container with the specified command in development mode
container.run:
	docker run --name elevate-labs-app_node-backend -v "$$PWD:/usr/src/app" -p 3000:3000 --platform linux/amd64 -e CMD="npm run dev" -it elevate-labs-app_node-backend

# Start the container and follow logs
container.start:
	docker container start elevate-labs-app_node-backend; docker container logs -f elevate-labs-app_node-backend;

# Stop the container
container.stop:
	docker container stop elevate-labs-app_node-backend;

# Remove the container
container.rm:
	docker container rm -f elevate-labs-app_node-backend;

# Build the Docker image locally
image.build.local:
	docker build --platform linux/amd64 --build-arg CMD=$(CMD) -t elevate-labs-app_node-backend:$(TAG) node-backend

# Tag the Docker image for Docker Hub
image.tag.dockerhub:
	docker tag elevate-labs-app_node-backend:$(TAG) souphian/elevate-labs-app_node-backend:$(TAG)

# Tag the Docker image for ECR
image.tag.ecr:
	docker tag elevate-labs-app_node-backend:$(TAG) 381491975528.dkr.ecr.us-east-1.amazonaws.com/elevate-labs-app_node-backend:$(TAG); docker tag 381491975528.dkr.ecr.us-east-1.amazonaws.com/elevate-labs-app_node-backend:$(TAG) 381491975528.dkr.ecr.us-east-1.amazonaws.com/elevate-labs-app_node-backend:latest;

# Push the Docker image to Docker Hub
image.push.dockerhub:
	docker push souphian/elevate-labs-app_node-backend:$(TAG)

# Push the Docker image to ECR
image.push.ecr:
	docker push 381491975528.dkr.ecr.us-east-1.amazonaws.com/elevate-labs-app_node-backend:$(TAG); docker push 381491975528.dkr.ecr.us-east-1.amazonaws.com/elevate-labs-app_node-backend:latest;

# Log in to ECR
ecr.login:
	aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 381491975528.dkr.ecr.us-east-1.amazonaws.com

# Build, tag, and push the Docker image to ECR
image.build-tag-push.ecr:
	make ecr.login;
	make TAG=$(TAG) image.build.local;
	make TAG=$(TAG) image.tag.ecr;
	make TAG=$(TAG) image.push.ecr;
