import 'zone.js/dist/zone-node';
import * as functions from 'firebase-functions';
import * as express from 'express';
import * as fs from 'fs';
import { renderModuleFactory } from '@angular/platform-server';

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

const AppServerModuleNgFactory = require(__dirname + '/dist/main.bundle').AppServerModuleNgFactory;
const document = fs.readFileSync(__dirname + '/dist/index.html', 'utf8');

const app = express();

app.get('**', (req, res) => {
    const url = req.path;
    renderModuleFactory(AppServerModuleNgFactory, { document, url }).then(html => {
        res.set('Cache-Control', 'public, max-age=600, s-maxage=1200');
        res.send(html);
    });
});

export const ssr = functions.https.onRequest(app);