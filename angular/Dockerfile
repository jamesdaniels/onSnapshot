FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

EXPOSE 4200

CMD node ./server.js