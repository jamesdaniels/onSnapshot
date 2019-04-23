FROM node:10

WORKDIR /usr/src/app

RUN npm install -g firebase-tools@6.3.0

COPY ./angular/package*.json ./angular/
RUN npm i --prefix angular
COPY ./angular/ ./angular/
COPY ./public/ ./public/
RUN npm run build:firebase --prefix angular
RUN rm -rf angular

COPY ./functions/package*.json ./functions/
RUN npm i --prefix functions
COPY ./functions/ ./functions/

COPY firebase.json .
COPY database.rules.json .
COPY firestore.indexes.json .
COPY firestore.rules .
COPY storage.rules .

ENTRYPOINT ["/usr/local/bin/firebase"]