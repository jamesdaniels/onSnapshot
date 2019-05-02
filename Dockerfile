FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build:all

RUN npm i -g firebase-tools@6.7.2

CMD node ./server.js