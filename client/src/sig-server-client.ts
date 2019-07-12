import { IObj } from "./interfaces";

// TODO: finish

function generateRandomString(): string {
    const len = 3;
    const numbers = new Uint8Array(len);
    const letters: string[] = [];
    window.crypto.getRandomValues(numbers);
    numbers.forEach( (n) => letters.push(n.toString(16)) );
    return letters.join("");
}

function spleep(msec: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, msec);
    });
}

export class SigServerClient {

    public onCandidate: any;
    public onOffer: any;
    public onAnswer: any;

    private url: string;
    private ws: any;
    private pendingPromise: any;
    private sessId: string;
    private previousReconnectTime: number;

    constructor(url: string) {
        this.url = url;
        this.ws = null;
        this.pendingPromise = {};
        this.sessId = "";
        this.previousReconnectTime = 0;
    }

    public getSessId() {
        return this.sessId;
    }

    public connect() {
        return new Promise((resolve, reject) => {
            try {
                console.log("try construct websocket");
                this.ws = new WebSocket(this.url);
                console.log("ws constructed");
            } catch (e) {
                console.log("ws construct:: err");
                reject(e);
                return this.reconnect();
            }

            this.ws.onopen = resolve;
            this.ws.onerror = (e: Error) => {
                console.warn("ws::on_error::" + e);
            };
            this.ws.onmessage = this.onMessage.bind(this);
            this.ws.onclose = () => {
                this.ws.onerror = null;
                this.ws.onmessage = null;
                console.log("ws closed, gonna reconnect");
                if (Date.now() - this.previousReconnectTime < 2000) {
                    console.log(`wait 2000 msec before reconnect`);
                    setTimeout(this.reconnect.bind(this), 2000);
                } else {
                    this.reconnect();
                }
            };
        });
    }

    public logIn(sessionId?: string) {
        return new Promise((resolve, reject) => {
            this.pendingPromise = { resolve, reject };
            if (!sessionId) {
                sessionId = generateRandomString();
                this.sessId = sessionId;
            } else {
                console.log(`login, sessId=${sessionId} (${typeof sessionId})`);
            }
            this.send({
                type: "login",
                sess_id: sessionId,
            });
        });
    }

    public send(obj: IObj) {
        this.ws.send(JSON.stringify(obj));
    }

    private onMessage(msg: any) {
        let json: any = {};
        try {
            json = JSON.parse(msg.data);
        } catch (e) {
            console.warn("ws: " + e.message + ". msg.data=" + msg.data);
            return;
        }
        console.log("ws: ", json);
        switch (json.type) {
        case "login_resp":
            this.handleLoginResp(json);
            break;
        case "candidate":
            this.handleCandidate(json);
            break;
        case "offer":
            this.handleOffer(json);
            break;
        case "answer":
            this.handleAnswer(json);
            break;
        }
    }

    private handleLoginResp(resp: any) {
        if (resp.status === "ok") {
            this.pendingPromise.resolve(this.sessId);
        } else {
            console.warn("ws: " + JSON.stringify(resp));
            this.pendingPromise.resolve(null);
        }
        this.pendingPromise = {};
    }

    private handleCandidate(msg: any) {
        console.log(Date.now() + " ws: got candidate");
        if (this.onCandidate && typeof this.onCandidate === "function") {
            this.onCandidate(msg.candidate);
        }
    }

    private handleOffer(msg: any) {
        console.log(Date.now() + " ws: got offer");
        if (!msg.offer) {
            console.warn(".offer is " + msg.offer);
            return;
        }
        if (this.onOffer && typeof this.onOffer === "function") {
            this.onOffer(msg.offer);
        }
    }

    private handleAnswer(msg: any) {
        console.log(Date.now() + " ws: got answer");
        if (this.onAnswer && typeof this.onAnswer === "function") {
            this.onAnswer(msg.answer);
        }
    }

    private reconnect() {
        this.previousReconnectTime = Date.now();
        this.ws = null;
        const minDelay = 1;
        const maxDelay = 10;
        let delay = minDelay;
        (async () => {
            while (true) {
                try {
                    console.log("try reconnect");
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
            console.log("reconnected");
            if (this.sessId) {
                console.log("was logged in before, logging after reconnect");
                await this.logIn(this.sessId);
                console.log("login after reconnect: ok");
            }
        })();
    }
}
