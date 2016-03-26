import http from 'http';
import dgram from 'dgram';
import path from 'path';

import _ from 'lodash';
import express from 'express';
import { Server as WebSocketServer } from 'ws';
import browserify from 'browserify-middleware';
import serveStatic from 'serve-static';
import morgan from 'morgan';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/indicators' });

app.use(morgan('dev'));

app.use(serveStatic(
    path.join(__dirname, '../public')
));

app.get('/js/index.js', browserify(
    path.join(__dirname, 'browser.js')
));

const state = {};

function getState() {
    return {
        indicators:
            _.toPairs(state)
            .map(([port, style]) => {
                return { id: Number(port), style };
            })
    };
}

wss.on('connection', ws => {
    ws.send(JSON.stringify(getState()));
});

const ports = process.argv.slice(2).map(Number);

console.log(ports);

function setupUdp(port) {
    const udpServer = dgram.createSocket('udp4');

    udpServer.on('message', msg => {
        const style = msg.toString('utf8');

        state[port] = style;

        for(const ws of wss.clients) {
            ws.send(JSON.stringify(getState()));
        }
    });

    udpServer.bind(port);
}

for(const port of ports) {
    setupUdp(port);
}

server.listen(8080);
