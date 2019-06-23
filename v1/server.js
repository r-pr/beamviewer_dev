const http = require('http')
const express = require('express')
const WebSocket = require('ws');
const app = express()
const port = process.env.PORT || 3322

// setting up http server

app.use(express.static('public'))
app.get('*', (req, res) => res.send('hello from Beamviewer'))

const httpServer = http.createServer(app);

// setting up ws server

const wsServer = new WebSocket.Server({ server: httpServer });

// id -> conn
const wsConnections = {};

function wsSendJson(json, conn) {
    conn.send(JSON.stringify(json));
}

function handleLogin(msg, conn) {
    if (!msg.sess_id || typeof wsConnections[msg.sess_id] !== 'undefined') {
        wsSendJson({type: 'login_resp', status: 'error', error: 'EEXIST'});
        return;
    }
    conn.__type = 'publisher';
    conn.__sessId = msg.sess_id;
    conn.__candidates = [];
    wsConnections[msg.sess_id] = conn;
    wsSendJson({type: 'login_resp', status: 'ok'}, conn);
    console.log('login: ok: sess_id: ' + msg.sess_id);
}

function handleOffer(msg, conn) {
    conn.__offer = msg.offer;
    console.log('associated offer with sess_id=' + conn.__sessId);
}

function handleCandidate(msg, conn) {
    if (conn.__type === 'publisher') {
        conn.__candidates.push(msg.candidate);
        console.log('handled publisher"s candidate');
    } else if (conn.__type === 'subscriber') {
        console.log('todo: handle subscriber"s candidate');
    } else {
        console.log('err: candidate from wrong connection');
    }

}

function handleDisconnect(conn) {
    if (!conn.__sessId) {
        return;
    }
    delete wsConnections[conn.__sessId];
}

wsServer.on('connection', function connection(ws) {
    console.log('conn opened');

    ws.on('message', function incoming(message) {
        message = message + '';
        let logMessage = message.length > 80 ? message.slice(0, 80) : message;
        console.log('> ' + logMessage);
        let json = {};
        try {
            json = JSON.parse(message);
        } catch (e) {
            console.error(e.message);
            return;
        }
        switch (json.type) {
        case 'login':
            handleLogin(json, ws);
            break;
        case 'offer':
            handleOffer(json, ws);
            break;
        case 'candidate':
            handleCandidate(json, ws);
            break;
        default:
            console.log('unknown msg');
        }
    });

    ws.on('close', () => {
        console.log('conn closed');
        handleDisconnect(ws);
    });
});

// starting

httpServer.listen(port, () => console.log(`server listening on port ${port}`))
