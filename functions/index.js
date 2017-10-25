"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
exports.viewCounter = functions.database.ref('/articleVisitors/{articleId}/{uid}').onWrite(event => {
    const countRef = event.data.adminRef.root.child(`articleViewCount/${event.params.articleId}`);
    return countRef.transaction(current => {
        if (event.data.exists() && !event.data.previous.exists()) {
            return (current || 0) + 1;
        }
        else if (!event.data.exists() && event.data.previous.exists()) {
            return (current || 0) - 1;
        }
    });
});
const app = require('./dist/firebase').app;
exports.angularUniversal = functions.https.onRequest(app);
