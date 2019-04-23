"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
exports.exportVisitors = functions.database.ref('/articleVisitors/{articleId}/{uid}').onWrite((change, context) => __awaiter(this, void 0, void 0, function* () {
    const { PubSub } = require('@google-cloud/pubsub');
    const pubsub = new PubSub();
    const dataBuffer = Buffer.from(JSON.stringify({
        visitor: context.params.uid,
        left: !change.after.exists() && change.before.exists(),
        article: context.params.articleId
    }));
    yield pubsub.topic('visitors').publish(dataBuffer);
}));
