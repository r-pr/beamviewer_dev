import React, { RefObject } from "react";

import { IObj } from "./interfaces";
import { Settings } from "./settings";
import { SigServerClient } from "./sig-server-client";
import Spinner from "./Spinner";
import { UserMedia } from "./user-media";

const { MAIN_DIV_CLASS } = Settings;

interface IState {
    sessId: string;
    error: string;
    loading: boolean;
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
            loading: true,
        };
        this.videoRef = React.createRef<HTMLVideoElement>();
        this.userMedia = new UserMedia();
        this.copySessIdToClipboard = this.copySessIdToClipboard.bind(this);
    }

    public componentDidMount() {
        if (!this.userMedia.canGetDisplayMedia()) {
            this.setState({error: "you have an old browser, go get a newer one"});
            return;
        }
        (async () => {
            try {
                const sigServer = new SigServerClient(Settings.WS_SRV_URL);

                const iceServers = await SigServerClient.getIceServers();

                const createTmpConn = (strm: any) => {
                    candidatesBuff = [];
                    tmpConn = new RTCPeerConnection({iceServers});
                    tmpConn.addStream(stream);
                    tmpConn.onicecandidate = (event: any) => {
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

                this.setState({sessId, loading: false});
            } catch (e) {
                console.error(e);
                this.setState({error: e.message});
            }
        })();

    }

    public render() {
        return (
            <div className="row">
                <div className={MAIN_DIV_CLASS}>
                    <video
                        ref={this.videoRef}
                        autoPlay={true}
                        style={{
                            width: "100%",
                            display: this.state.loading ? "none" : "block",
                            border: "1px solid darkgray",
                            borderRadius: "0.5em",
                        }}
                    />
                    {this.getActiveElement()}
                </div>
            </div>
        );
    }

    private copySessIdToClipboard() {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(this.state.sessId);
        }
    }

    private getActiveElement(): JSX.Element {
        if (this.state.error) {
            return (
                <div className="alert alert-danger" role="alert">
                    {this.state.error}
                </div>
            );
        } else {
            if (this.state.loading) {
                return <Spinner/>;
            } else {
                return (
                    <React.Fragment>
                        <h5 style={{marginTop: "2em"}}>
                            Session ID:  <b>{this.state.sessId}</b>
                            &nbsp;&nbsp;
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={this.copySessIdToClipboard}
                            >
                                Copy
                            </button>
                        </h5>
                    </React.Fragment>
                );
            }
        }
    }
}
