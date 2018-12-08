import * as functions from 'firebase-functions';

export const viewCounter = functions.database.ref('/articleVisitors/{articleId}/{uid}').onWrite((change, context) => {
    const countRef = change.after.ref.root.child(`articleViewCount/${context.params.articleId}`);
    return countRef.transaction(current => {
        if (change.after.exists() && !change.before.exists()) {
            return (current || 0) + 1;
        } else if (!change.after.exists() && change.before.exists()) {
            return (current || 0) - 1;
        }
    });
});

export const angularUniversal = functions.https.onRequest((request, response) => {
    require(`${process.cwd()}/dist/onsnapshot-webpack/server`).app(request, response);
});