var name, connectedUser;

var connection = new WebSocket('ws://localhost:8888');

connection.onopen = function () {
    console.log("Connected");
};

// Handle all messages through this callback
connection.onmessage = function (message) {
    console.log("Got message", message.data);
    var data = JSON.parse(message.data);
    switch(data.type) {
    case "login":
        onLogin(data.success);
        break;
    case "offer":
        onOffer(data.offer, data.name);
        break;
    case "answer":
        onAnswer(data.answer);
        break;
    case "candidate":
        onCandidate(data.candidate);
        break;
    case "leave":
        onLeave();
        break;
    }
};

connection.onerror = function (err) {
    console.log("Got error", err);
};

// Alias for sending messages in JSON format
function send(message) {
    if (connectedUser) {
        message.name = connectedUser;
    }
    connection.send(JSON.stringify(message));
};

var loginPage = document.querySelector('#login-page'),
    usernameInput = document.querySelector('#username'),
    loginButton = document.querySelector('#login'),
    callPage = document.querySelector('#call-page'),
    theirUsernameInput = document.querySelector('#their-username'),
    callButton = document.querySelector('#call'),
    hangUpButton = document.querySelector('#hang-up');
    callPage.style.display = "none";

// Login when the user clicks the button
loginButton.addEventListener("click", function (event) {
    name = usernameInput.value;
    if (name.length > 0) {
        send({
            type: "login",
            name: name
        });
    }
});

function onLogin(success) {
    if (success === false) {
        alert("Login unsuccessful, please try a different name.");
    } else {
        loginPage.style.display = "none";
        callPage.style.display = "block";
        // Get the plumbing ready for a call
        startConnection();
    }
};

var yourVideo = document.querySelector('#yours'),
    theirVideo = document.querySelector('#theirs'),
    yourConnection, connectedUser, stream;

function startConnection() {
    if (hasUserMedia()) {
        navigator.getUserMedia({ video: true, audio: false }, (myStream) => {
            stream = myStream;
            yourVideo.srcObject = stream;
            if (hasRTCPeerConnection()) {
                setupPeerConnection(stream);
            } else {
                alert("Sorry, your browser does not support WebRTC.");
            }
        }, function (error) {
            console.log(error);
        });
    } else {
        alert("Sorry, your browser does not support WebRTC.");
    }
}

function setupPeerConnection(stream) {
    var configuration = {
        // "iceServers": [{ "url": "stun:stun.1.google.com:19302" }]
    };
    yourConnection = new RTCPeerConnection(configuration);
    // Setup stream listening
    yourConnection.addStream(stream);
    yourConnection.ontrack = function (e) {
        theirVideo.srcObject = e.streams[0];
    };

    // Setup ice handling
    yourConnection.onicecandidate = function (event) {
        if (event.candidate) {
            send({
                type: "candidate",
                candidate: event.candidate
            });
        }
    };
}

function hasUserMedia() {
    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
    return !!navigator.getUserMedia;
}

function hasRTCPeerConnection() {
    window.RTCPeerConnection = window.RTCPeerConnection ||
        window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    return !!window.RTCPeerConnection;
}

callButton.addEventListener("click", function () {
    var theirUsername = theirUsernameInput.value;
    if (theirUsername.length > 0) {
        startPeerConnection(theirUsername);
    }
});

function startPeerConnection(user) {
    connectedUser = user;
    // Begin the offer
    yourConnection.createOffer({}).then(function (offer) {
        send({
            type: "offer",
            offer: offer
        });
        yourConnection.setLocalDescription(offer);
    }, function (error) {
        alert("An error has occurred.");
    });
}

function onOffer(offer, name) {
    connectedUser = name;
    yourConnection.setRemoteDescription(new RTCSessionDescription(offer));
    yourConnection.createAnswer().then(function (answer) {
        yourConnection.setLocalDescription(answer);
        send({
            type: "answer",
            answer: answer
        });
    }, function (error) {
        alert("An error has occurred");
    });
}

function onAnswer(answer) {
    yourConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

function onCandidate(candidate) {
    yourConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

hangUpButton.addEventListener("click", function () {
    send({
        type: "leave"
    });
    onLeave();
});

function onLeave() {
    connectedUser = null;
    theirVideo.srcObject = null;
    yourConnection.close();
    yourConnection.onicecandidate = () => {};
    yourConnection.onatrack = () => {};
    setupPeerConnection(stream);
}
