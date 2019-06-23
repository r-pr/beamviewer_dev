
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
let yourConnection;

const btnSessNew = document.querySelector('#btn_sess_new');
const sessIdLabel = document.querySelector('#session_id_p');
const yourVideo = document.querySelector('#video');

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
    yourVideo.srcObject = stream;

    let configuration = { };
    yourConnection = new RTCPeerConnection(configuration);
    yourConnection.addStream(stream);

    // Setup ice handling
    yourConnection.onicecandidate = function (event) {
        console.log('on ice')
        if (event.candidate) {
            sigServer.send({
                type: "candidate",
                candidate: event.candidate
            });
        }
    };

    const offer = await yourConnection.createOffer();
    console.log('offer created');
    yourConnection.setLocalDescription(offer);

    sigServer.send({
        type: "offer",
        offer: offer
    });

    sessIdLabel.innerHTML = 'Session established. Id=' + sessId;
}



function setupPeerConnection(stream) {

}