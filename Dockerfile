# Use the official Node.js 10 image.
# https://hub.docker.com/_/node
FROM node:10

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package.json package*.json ./

# Install dependencies.
RUN npm i

# Copy local code to the container image.
COPY . .

# Build the application
RUN npm run build:all

# # Run the web service on container startup.
CMD [ "npm", "run", "serve:ssr" ]
