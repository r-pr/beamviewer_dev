import React, { RefObject } from "react";

import SigServer from "./sig-server";

interface IState {
    sessId: string;
}

// const SRV_URL = window.location.host;
const SRV_URL = "localhost:3322";

export default class PubScreen extends React.Component<{}, IState> {

    private videoRef: RefObject<HTMLVideoElement>;

    constructor(p: {}, c: any) {
        super(p, c);
        this.state = {
            sessId: "",
        };
        this.videoRef = React.createRef<HTMLVideoElement>();
    }

    public componentDidMount() {
        (async () => {
            const sigServer: any = new SigServer("ws://" + SRV_URL);

            console.log('gona connect');
            await sigServer.connect();
            console.log('connected');

            const sessId: string = await sigServer.logIn();
            console.log('logged in with sess_id=' + sessId);

            const displayMediaOptions = {
                audio: false,
                video: {
                    cursor: "never",
                },
            };

            const stream = await (navigator.mediaDevices as any).getDisplayMedia(displayMediaOptions);
            (this.videoRef as any).srcObject = stream;


            const rtcConnection: any = new RTCPeerConnection({});
            rtcConnection.addStream(stream);

            // Setup ice handling
            rtcConnection.onicecandidate = (event: any) => {
                console.log('on ice');
                if (event.candidate) {
                    sigServer.send({
                        type: "candidate",
                        candidate: event.candidate,
                    });
                }
            };

            const offer = await rtcConnection.createOffer();
            console.log('offer created');
            rtcConnection.setLocalDescription(offer);

            sigServer.onAnswer = (answer: any) => {
                rtcConnection.setRemoteDescription(new RTCSessionDescription(answer));
                console.log('got answer');
            };

            sigServer.send({
                type: "offer",
                offer,
            });

            this.setState({sessId});
        })();

    }

    public render() {
        return (
            <div className="row">
                <div className="col-sm-6 col-md-4 col-lg-3">
                    <video ref={this.videoRef} autoPlay={true}/>
                    <p>Session Id: {this.state.sessId}</p>
                </div>
            </div>
        );
    }
}
