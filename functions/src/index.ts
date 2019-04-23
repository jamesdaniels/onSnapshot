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

export const exportVisitors = functions.database.ref('/articleVisitors/{articleId}/{uid}').onWrite(async (change, context) => {
    const { PubSub } = require('@google-cloud/pubsub');
    const pubsub = new PubSub();
    const dataBuffer = Buffer.from(JSON.stringify({
        visitor: context.params.uid,
        left: !change.after.exists() && change.before.exists(),
        article: context.params.articleId
    }));
    await pubsub.topic('visitors').publish(dataBuffer);
});