const http = require('http')
const path = require('path')
const express = require('express')
const WebSocket = require('ws');
const app = express()
const port = process.env.PORT || 3322

// setting up http server

app.use(express.static(path.join(__dirname, 'public') ))
app.get('*', (req, res) => res.send('hello from Beamviewer'))

const httpServer = http.createServer(app);

// setting up ws server

const wsServer = new WebSocket.Server({ server: httpServer });

// id -> conn
const wsConnections = {};

function wsSendJson(json, conn) {
    let msg = JSON.stringify(json);
    if (conn.readyState !== 1) {
        console.error(`cannot send ${msg}: conn not open. readyState=${conn.readyState}` +
            `. __type=${conn.__type}. __sessId=${conn.__sessId}`);
    }
    conn.send(msg);
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
    if (conn.__type === 'publisher') {
        conn.__candidates = [];
        console.log('handleOffer::cleared candidates');
    }
}

function handleCandidate(msg, conn) {
    if (conn.__type === 'publisher') {
        conn.__candidates.push(msg.candidate);
        console.log('handled publisher"s candidate');
    } else if (conn.__type === 'subscriber') {
        if (conn.__publisher) {
            wsSendJson(msg, conn.__publisher);
            console.log('candidate from sub sent to pub');
        } else {
            console.error('handleCandidate: subscriber has no publisher')
        }
    } else {
        console.log('err: candidate from wrong connection');
    }
}

function handleAnswer(msg, conn) {
    if (conn.__type === 'publisher') {
        console.error('handleAnswer: error: answer from publisher')
    } else if (conn.__type === 'subscriber') {
        if (conn.__publisher) {
            wsSendJson(msg, conn.__publisher);
            console.log('answer from sub sent to pub');
        } else {
            console.error('handleAnswer: subscriber has no publisher')
        }
    }
}

function handleJoin(msg, conn) {
    let publisherConn = wsConnections[msg.sess_id];
    if (typeof publisherConn === 'undefined') {
        wsSendJson({type: 'join_resp', status: 'error', error: 'ENOTFOUND'}, conn);
        return;
    }
    if (!publisherConn.__candidates || !publisherConn.__candidates.length) {
        wsSendJson({type: 'join_resp', status: 'error', error: 'ENOCAND'}, conn);
        return;
    }
    const nick = msg.nickname || 'anonymous';
    if (!publisherConn.__subscribers){
        publisherConn.__subscribers = [];
    }
    for (let i = 0; i < publisherConn.__subscribers; i++) {
        let sub = publisherConn.__subscribers[i];
        if (sub.__nick === nick) {
            wsSendJson({type: 'join_resp', status: 'error', error: 'ENICK'}, conn);
            return;
        }
    }
    conn.__type = 'subscriber';
    conn.__nick = nick;
    conn.__publisher = publisherConn;
    publisherConn.__subscribers.push(conn);
    wsSendJson({type: 'join_resp', status: 'ok'}, conn);
    wsSendJson({type: 'offer', offer: publisherConn.__offer}, conn);
    publisherConn.__candidates.forEach(cand => {
        wsSendJson({type: 'candidate', candidate: cand}, conn);
    });
}

function handleDisconnect(conn) {
    if (conn.__type === 'publisher') {
        console.log('publisher disconnected');
        if (conn.__subscribers) {
            conn.__subscribers.forEach(subs => {
                try {
                    subs.close();
                } catch (e) {
                    console.error(e);
                }
            });
        }
        delete wsConnections[conn.__sessId];
    } else if (conn.__type === 'subscriber') {
        console.log('subscriber disconnected');
        if (conn.__publisher.__subscribers) {
            conn.__publisher.__subscribers = conn.__publisher.__subscribers.filter(sub => {
                return sub.__nick !== conn.__nick;
            });
        }
    } else {
        console.log('connection without type closed');
    }
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
        case 'join':
            handleJoin(json, ws);
            break;
        case 'answer':
            handleAnswer(json, ws);
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
