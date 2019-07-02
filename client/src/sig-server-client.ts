export class SigServerClient {
    private url: string;
    private ws: WebSocket;

    constructor(url: string) {
        this.url = url;
        this.ws = null;
    }

    public connect(): Promise<Event> {
        return new Promise<Event>((resolve, reject) => {
            this.ws = new WebSocket(this.url);
            this.ws.onopen = resolve;
            this.ws.onerror = reject;
            this.ws.onmessage = this.onMessage;
        });
    }

    private onMessage(msg: MessageEvent): void {
        console.log("got message");
    }
}
