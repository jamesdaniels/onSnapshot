import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { enableProdMode } from '@angular/core';
import * as express from 'express';
import { readFileSync } from 'fs';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main.bundle');

(global as any).WebSocket = require("ws");
(global as any).XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();


const template = readFileSync('./dist/browser/index.html', 'utf8').toString();
const assetsToPreload = template.match(/([^"]+\.bundle\.(js|css))/g);
const linkHeader = assetsToPreload.map(asset => {
    const as = asset.split('.').pop() == 'js' ? 'script' : 'style';
    return `</${asset}>;rel=preload;as=${as};nopush`;
}).join(',');

export const app = express();

app.engine('html', ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    providers: [
        provideModuleMap(LAZY_MODULE_MAP)
    ]
}));

app.set('view engine', 'html');
app.set('views', './dist/browser');

app.get('**', (req, res) => {
    res.set('Cache-Control', 'public, max-age=600, s-maxage=1200');
    res.set('Link', linkHeader);
    res.render('index', { req });
});