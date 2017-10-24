const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.viewCounter = functions.database.ref('/articleVisitors/{articleId}/{uid}').onWrite(event => {
    const countRef = event.data.adminRef.root.child(`articleViewCount/${event.params.articleId}`);
    return countRef.transaction(current => {
        if (event.data.exists() && !event.data.previous.exists()) {
            return (current || 0) + 1;
        } else if (!event.data.exists() && event.data.previous.exists()) {
            return (current || 0) - 1;
        }
    });
});