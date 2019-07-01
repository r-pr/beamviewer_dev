const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ port: 8888 }, () => {
    console.log('server started');
});

const users = {};

wss.on('connection', function (connection) {
    console.log("User connected");
    connection.on('message', function (message) {
        var data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.log("Error parsing JSON");
            data = {};
        }
        let conn;
        switch (data.type) {
        case "login":
            console.log("User logged in as", data.name);
            if (users[data.name]) {
                sendTo(connection, {
                    type: "login",
                    success: false
                });
            } else {
                users[data.name] = connection;
                connection.name = data.name;
                sendTo(connection, {
                    type: "login",
                    success: true
                });
            }
            break;
        case "offer":
            console.log("Sending offer to", data.name);
            conn = users[data.name];
            if (conn) {
                connection.otherName = data.name;
                sendTo(conn, {
                    type: "offer",
                    offer: data.offer,
                    name: connection.name
                });
            }
            break;
        case "answer":
            console.log("Sending answer to", data.name);
            conn = users[data.name];
            if (conn) {
                connection.otherName = data.name;
                sendTo(conn, {
                    type: "answer",
                    answer: data.answer
                });
            }
            break;
        case "candidate":
            console.log("Sending candidate to", data.name);
            conn = users[data.name];
            if (conn) {
                sendTo(conn, {
                    type: "candidate",
                    candidate: data.candidate
                });
            }
            break;
        case "leave":
            console.log("Disconnecting user from", data.name);
            conn = users[data.name];
            if (conn) {
                conn.otherName = null;
                sendTo(conn, {
                    type: "leave"
                });
            }
            break;
        default:
            sendTo(connection, {
                type: "error",
                message: "Unrecognized command: " + data.type
            });
            break;
        }
    });
    connection.on('close', function () {
        if (connection.name) {
            delete users[connection.name];
            if (connection.otherName) {
                console.log("Disconnecting user from", connection.otherName);
                conn = users[connection.otherName];
                if (conn) {
                    conn.otherName = null;
                    sendTo(conn, {
                        type: "leave"
                    });
                }
            }
        }
    });
});

function sendTo(conn, message) {
    conn.send(JSON.stringify(message));
}
