import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { enableProdMode } from '@angular/core';
import * as express from 'express';
import { ngExpressEngine } from '@nguniversal/express-engine';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main.bundle');

(global as any).XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

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
    res.render('index', { req });
});