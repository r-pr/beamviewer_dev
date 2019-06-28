
function generateRandomString() {
    const len = 16;
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

    this.getSessId = () => sessId;

    this.connect = () => {
        return new Promise((resolve, reject) => {
            ws = new WebSocket(url);
            ws.onopen = resolve;
            ws.onerror = reject;
            ws.onmessage = onMessage;
        });
    }

    this.logIn = () => {
        return new Promise((resolve, reject) => {
            pendingPromise = { resolve, reject };
            sessId = generateRandomString();
            this.send({
                type: 'login',
                sess_id: sessId
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

btnSessNew.onclick = async () => {

    sigServer = new SignalingServer('ws://' + window.location.host);

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

    rtcConnection = new RTCPeerConnection({});
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

btnJoinSess.onclick = async () => {
    sigServer = new SignalingServer('ws://' + window.location.host);

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
                candidate: event.candidate
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
                answer: answer
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
        nickname: inputNickname.value
    });
}

function setupPeerConnection(stream) {

}