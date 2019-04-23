"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
exports.viewCounter = functions.database.ref('/articleVisitors/{articleId}/{uid}').onWrite((change, context) => {
    const countRef = change.after.ref.root.child(`articleViewCount/${context.params.articleId}`);
    return countRef.transaction(current => {
        if (change.after.exists() && !change.before.exists()) {
            return (current || 0) + 1;
        }
        else if (!change.after.exists() && change.before.exists()) {
            return (current || 0) - 1;
        }
    });
});
