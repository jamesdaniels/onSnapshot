import 'zone.js/dist/zone-node';
import 'reflect-metadata';
import { readFileSync } from 'fs';

const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main.bundle');
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

import { renderModuleFactory } from '@angular/platform-server';

(global as any).WebSocket = require("ws");
(global as any).XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const index = readFileSync('./dist/index.html', 'utf8');
const assetsToPreload = index.toString().match(/([^"]+\.bundle\.(js|css))/g);
const linkHeader = assetsToPreload.map(asset => {
    const as = asset.split('.').pop() == 'js' ? 'script' : 'style';
    return `</${asset}>;rel=preload;as=${as};nopush`;
}).join(',');

export const app = (req, res) => {
    renderModuleFactory(AppServerModuleNgFactory, {
        document: index,
        url: req.path,
        extraProviders: [
            provideModuleMap(LAZY_MODULE_MAP)
        ]
    }).then(html => {
        res.set('Cache-Control', 'public, max-age=600, s-maxage=1200');
        res.set('Link', linkHeader);
        res.send(html);
    }).catch(console.error); 
}