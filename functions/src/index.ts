import * as functions from 'firebase-functions';

export const viewCounter = functions.database.ref('/articleVisitors/{articleId}/{uid}').onWrite(event => {
    const countRef = event.data.adminRef.root.child(`articleViewCount/${event.params.articleId}`);
    return countRef.transaction(current => {
        if (event.data.exists() && !event.data.previous.exists()) {
            return (current || 0) + 1;
        } else if (!event.data.exists() && event.data.previous.exists()) {
            return (current || 0) - 1;
        }
    });
});

const app = require('./dist/firebase').app;

export const angularUniversal = functions.https.onRequest(app);