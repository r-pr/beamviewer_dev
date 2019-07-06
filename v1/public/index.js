const wsProtocol = (window.location.protocol === 'https:') ? 'wss' : 'ws';

function generateRandomString() {
    const len = 3;
    const numbers = new Uint8Array(len);
    const letters = [];
    window.crypto.getRandomValues(numbers);
    numbers.forEach( n => letters.push(n.toString(16)) );
    return letters.join('')
}

function SignalingServer(url) {

    let ws = null;

    let pendingPromise = {};

    let sessId = null;

    let previousReconnectTime = 0;

    function onMessage(msg){
        let json = {}
        try {
            json = JSON.parse(msg.data);
        } catch (e) {
            console.warn('ws: ' + e.message + '. msg.data=' + msg.data);
            return;
        }
        console.log('ws: ', json);
        switch (json.type) {
        case 'login_resp':
            handleLoginResp(json);
            break;
        case 'candidate':
            handleCandidate(json);
            break;
        case 'offer':
            handleOffer(json);
            break;
        case 'answer':
            handleAnswer(json);
            break;
        }
    }

    function handleLoginResp(resp) {
        if (resp.status === 'ok') {
            pendingPromise.resolve(sessId);
        } else {
            console.warn('ws: ' + JSON.stringify(resp));
            pendingPromise.resolve(null)
        }
        pendingPromise = {};
    }

    const handleCandidate = (msg) => {
        console.log(Date.now() + ' ws: got candidate')
        if (this.onCandidate && typeof this.onCandidate === 'function') {
            this.onCandidate(msg.candidate);
        }
    }

    const handleOffer = (msg) => {
        console.log(Date.now() + ' ws: got offer')
        if (this.onOffer && typeof this.onOffer === 'function') {
            this.onOffer(msg.offer);
        }
    }

    const handleAnswer = (msg) => {
        console.log(Date.now() + ' ws: got answer')
        if (this.onAnswer && typeof this.onAnswer === 'function') {
            this.onAnswer(msg.answer);
        }
    }

    const spleep = (msec) => {
        return new Promise((resolve) => {
            setTimeout(resolve, msec);
        });
    }

    const reconnect = () => {
        previousReconnectTime = Date.now();
        ws = null;
        const minDelay = 1;
        const maxDelay = 10;
        let delay = minDelay;
        (async () => {
            while (true) {
                try {
                    console.log('try reconnect');
                    await this.connect();
                    break;
                } catch (e) {
                    console.warn(e);
                    
                    if (delay < maxDelay) {
                        delay++;
                    }
                    console.log(`reconnect failed, now sleeping ${delay} sec`);
                    await spleep(delay * 1000);
                }
            }
            console.log('reconnected');
            if (sessId) {
                console.log('was logged in before, logging after reconnect');
                await this.logIn(sessId);
                console.log('login after reconnect: ok');
            }
        })();
    }

    this.getSessId = () => sessId;

    this.connect = () => {
        return new Promise((resolve, reject) => {
            try {
                console.log('try construct websocket');
                ws = new WebSocket(url);
                console.log('ws constructed');
            } catch (e) {
                console.log('ws construct:: err');
                reject(e);
                return reconnect();
            }

            ws.onopen = resolve;

            ws.onerror = (e) => {
                console.warn('ws::on_error::'+ e);
            }
            ws.onmessage = onMessage;
            ws.onclose = () => {
                ws.onerror = null;
                ws.onmessage = null;
                console.log("ws closed, gonna reconnect");
                let delta = Date.now() - previousReconnectTime;
                if (delta < 2000) {
                    console.log(`wait 2000 msec before reconnect`);
                    setTimeout(reconnect, 2000);
                } else {
                    reconnect();
                }
                
            }
        });
    }

    this.logIn = (sessionId) => {
        return new Promise((resolve, reject) => {
            pendingPromise = { resolve, reject };
            if (!sessionId) {
                sessionId = generateRandomString();
                sessId = sessionId;
            } else {
                console.log('login, sessId=' + sessionId + ' (' + typeof sessionId + ')')
            }
            this.send({
                type: 'login',
                sess_id: sessionId
            });
        });
    }

    this.send = (obj) => {
        ws.send(JSON.stringify(obj));
    }
}

let sigServer;
let rtcConnection;

const btnSessNew = document.querySelector('#btn_sess_new');
const sessIdLabel = document.querySelector('#session_id_p');
const videoElem = document.querySelector('#video');

const btnJoinSess = document.querySelector('#btn_join_sess');
const inputSessId = document.querySelector('#input_sess_id');
const inputNickname = document.querySelector('#input_nickname');

// dictionary. key = nick; val = rtcpeerconn
const subscribers = {

};

let tmpConn = null;
let candidatesSent = false;

async function setUpPublisher_v2() {

    function createTmpConn(strm) {
        tmpConn = new RTCPeerConnection({});
        tmpConn.addStream(stream);
        if (!candidatesSent) {
            tmpConn.onicecandidate = function (event) {
                console.log('on ice')
                if (event.candidate) {
                    sigServer.send({
                        type: "candidate",
                        candidate: event.candidate
                    });
                }
            };
            candidatesSent = true;
        }
    }

    sigServer = new SignalingServer(`${wsProtocol}://${window.location.host}`);

    console.log('gona connect');
    await sigServer.connect();
    console.log('connected');

    let sessId = await sigServer.logIn();
    console.log('logged in with sess_id=' + sessId);

    const displayMediaOptions = {
        video: {
            cursor: "never"
        },
        audio: false
    };
    const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    videoElem.srcObject = stream;

    createTmpConn(stream);

    const offer = await rtcConnection.createOffer();
    console.log('offer created');
    rtcConnection.setLocalDescription(offer);

    sigServer.onAnswer = (answer) => {
        rtcConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('got answer');
    }

    sigServer.send({
        type: "offer",
        offer: offer
    });

    sessIdLabel.innerHTML = 'Session established. Id=' + sessId;
}



btnSessNew.onclick = setUpPublisher_v1;

btnJoinSess.onclick = async () => {

    const nickname = Date.now().toString();
    
    sigServer = new SignalingServer(`${wsProtocol}://${window.location.host}`);

    console.log('j gona connect');
    await sigServer.connect();
    console.log('j connected');

    rtcConnection = new RTCPeerConnection({});

    rtcConnection.ontrack = function (e) {
        videoElem.srcObject = e.streams[0];
    };

    rtcConnection.onicecandidate = function (event) {
        console.log('on ice')
        if (event.candidate) {
            sigServer.send({
                type: "candidate",
                candidate: event.candidate,
                nickname
            });
        }
    };

    sigServer.onOffer = (offer) => {
        console.log('got offer')
        rtcConnection.setRemoteDescription(new RTCSessionDescription(offer));
        rtcConnection.createAnswer().then(function (answer) {
            rtcConnection.setLocalDescription(answer);
            sigServer.send({
                type: "answer",
                answer: answer,
                nickname
            });
        }, function (error) {
            console.error(error);
        });
    }

    sigServer.onCandidate = (cand) => {
        rtcConnection.addIceCandidate(new RTCIceCandidate(cand));
    }

    sigServer.send({
        type: 'join',
        sess_id: inputSessId.value,
        nickname: nickname
    });
}

async function setUpPublisher_v1() {
    sigServer = new SignalingServer(`${wsProtocol}://${window.location.host}`);

    console.log('gona connect');
    await sigServer.connect();
    console.log('connected');

    let sessId = await sigServer.logIn();
    console.log('logged in with sess_id=' + sessId);

    const displayMediaOptions = {
        video: {
            cursor: "never"
        },
        audio: false
    };
    const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    videoElem.srcObject = stream;

    rtcConnection = new RTCPeerConnection({
        iceServers: [{ 'urls': 'stun:stun.l.google.com:19302' }]
    });
    rtcConnection.addStream(stream);

    // Setup ice handling
    rtcConnection.onicecandidate = function (event) {
        console.log('on ice')
        if (event.candidate) {
            sigServer.send({
                type: "candidate",
                candidate: event.candidate
            });
        }
    };

    const offer = await rtcConnection.createOffer();
    console.log('offer created');
    rtcConnection.setLocalDescription(offer);

    sigServer.onAnswer = (answer) => {
        rtcConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('got answer');
    }

    sigServer.send({
        type: "offer",
        offer: offer
    });

    sessIdLabel.innerHTML = 'Session established. Id=' + sessId;
}