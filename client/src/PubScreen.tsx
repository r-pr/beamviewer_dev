import React, { RefObject } from "react";

import { IObj } from "./interfaces";
import { Settings } from "./settings";
import { SigServerClient } from "./sig-server-client";
import { UserMedia } from "./user-media";

interface IState {
    sessId: string;
    error: string;
}

// dictionary. key = nick; val = rtcpeerconn
const subscribers: IObj = {

};

let tmpConn: any = null;

let candidatesBuff: IObj[] = [];
let offerSent: boolean = false;

export default class PubScreen extends React.Component<{}, IState> {

    private videoRef: RefObject<HTMLVideoElement>;
    private userMedia: UserMedia;

    constructor(props: {}) {
        super(props);
        this.state = {
            sessId: "",
            error: "",
        };
        this.videoRef = React.createRef<HTMLVideoElement>();
        this.userMedia = new UserMedia();
    }

    public componentDidMount() {
        if (!this.userMedia.canGetDisplayMedia()) {
            this.setState({error: "you have an old browser, go get a newer one"});
            return;
        }
        // (async () => {
        //     const sigServer = new SigServerClient(Settings.WS_SRV_URL);

        //     console.log("gona connect");
        //     await sigServer.connect();
        //     console.log("connected");

        //     await sigServer.logIn();
        //     const sessId: string = sigServer.getSessId();
        //     console.log("logged in with sess_id=" + sessId);

        //     const stream = await this.userMedia.getDisplayMedia();
        //     console.log(stream);

        //     if (this.videoRef.current) {
        //         this.videoRef.current.srcObject = stream;
        //     }

        //     const rtcConnection: any = new RTCPeerConnection({});
        //     rtcConnection.addStream(stream);

        //     // Setup ice handling
        //     rtcConnection.onicecandidate = (event: any) => {
        //         console.log("on ice");
        //         if (event.candidate) {
        //             sigServer.send({
        //                 type: "candidate",
        //                 candidate: event.candidate,
        //             });
        //         }
        //     };

        //     const offer = await rtcConnection.createOffer();
        //     console.log("offer created");
        //     rtcConnection.setLocalDescription(offer);

        //     sigServer.onAnswer = (answer: any) => {
        //         rtcConnection.setRemoteDescription(new RTCSessionDescription(answer));
        //         console.log("got answer");
        //     };

        //     sigServer.send({
        //         type: "offer",
        //         offer,
        //     });

        //     this.setState({sessId});
        // })();

        (async () => {
            try {
                const sigServer = new SigServerClient(Settings.WS_SRV_URL);

                const createTmpConn = (strm: any) => {
                    candidatesBuff = [];
                    tmpConn = new RTCPeerConnection({});
                    tmpConn.addStream(stream);
                    tmpConn.onicecandidate = function (event: any) {
                        console.log("on ice");
                        if (event.candidate) {
                            if (offerSent) {
                                sigServer.send({
                                    type: "candidate",
                                    candidate: event.candidate,
                                });
                                console.log("candidate sent");
                            } else {
                                console.log("candidate buffered");
                                candidatesBuff.push(event.candidate);
                            }
                        } else {
                            console.log("no event.candidate::");
                            console.log(event);
                        }
                    };
                };

                const sendOffer = (off: any) => {
                    sigServer.send({
                        type: "offer",
                        offer: off,
                    });
                    offerSent = true;
                    if (candidatesBuff.length) {
                        candidatesBuff.forEach((cand) => {
                            sigServer.send({
                                type: "candidate",
                                candidate: cand,
                            });
                        });
                    }
                };

                console.log("gona connect");
                await sigServer.connect();
                console.log("connected");

                await sigServer.logIn();
                const sessId = sigServer.getSessId();
                console.log("logged in with sess_id=" + sessId);

                const stream = await this.userMedia.getDisplayMedia();

                if (this.videoRef.current) {
                    this.videoRef.current.srcObject = stream;
                }

                createTmpConn(stream);

                const offer = await tmpConn.createOffer();
                console.log("offer created");
                tmpConn.setLocalDescription(offer);

                sigServer.onAnswer = (answer: any) => {
                    tmpConn.onicecandidate = () => {};
                    tmpConn.setRemoteDescription(new RTCSessionDescription(answer));
                    console.log("got answer");
                    subscribers[answer.nickname] = tmpConn;
                    (async () => {
                        console.log("creating new tmp connection...");
                        createTmpConn(stream);
                        const offer = await tmpConn.createOffer();
                        console.log("new offer created");
                        tmpConn.setLocalDescription(offer);
                        sendOffer(offer);
                    })();
                };

                sendOffer(offer);

                this.setState({sessId});
            } catch (e) {
                console.error(e);
                this.setState({error: e.message});
            }
        })();

    }

    public render() {
        return (
            <div className="row">
                <div className="col-sm-6 col-md-4 col-lg-3">
                    <video ref={this.videoRef} autoPlay={true} style={{width: "100%" }}/>
                    <p>Session Id: <b>{this.state.sessId}</b></p>
                    {this.getErrorElement()}
                </div>
            </div>
        );
    }

    private getErrorElement() {
        if (this.state.error !== "") {
            return (
                <div className="alert alert-danger" role="alert">
                    {this.state.error}
                </div>
            );
        }
        return <div/>;
    }
}
