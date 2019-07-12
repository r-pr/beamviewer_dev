import React, { RefObject } from "react";
import { Settings } from "./settings";
import { SigServerClient } from "./sig-server-client";

interface IProps {
    sessId: string;
    nickName: string;
    onExit: () => void;
}

export default class SubScreen extends React.Component<IProps, {}> {

    private videoRef: RefObject<HTMLVideoElement>;

    constructor(p: IProps) {
        super(p);
        this.videoRef = React.createRef<HTMLVideoElement>();
        console.log("sub screen ctor::ws_srv_url:" + Settings.WS_SRV_URL);
    }

    public componentDidMount() {
        const nickname = this.props.nickName;
        const sigServer = new SigServerClient(Settings.WS_SRV_URL);

        (async () => {
            console.log("sub: gona connect");
            await sigServer.connect();
            console.log("sub: connected");

            const rtcConnection = new RTCPeerConnection({});

            rtcConnection.ontrack = (e) => {
                if (this.videoRef.current) {
                    this.videoRef.current.srcObject = e.streams[0];
                    this.videoRef.current.style.position = "absolute";
                    this.videoRef.current.style.top = "0px";
                    this.videoRef.current.style.left = "0px";
                } else {
                    throw new Error("sth went wrong");
                }
            };

            rtcConnection.onicecandidate = (event) => {
                console.log("on ice");
                if (event.candidate) {
                    sigServer.send({
                        type: "candidate",
                        candidate: event.candidate,
                        nickname,
                    });
                }
            };

            sigServer.onOffer = (offer: RTCSessionDescriptionInit) => {
                console.log("sub:: onoffer: ", offer);
                try {
                    rtcConnection.setRemoteDescription(new RTCSessionDescription(offer));
                    rtcConnection.createAnswer().then((answer) => {
                        rtcConnection.setLocalDescription(answer);
                        sigServer.send({
                            type: "answer",
                            answer,
                            nickname,
                        });
                    }, (error) => {
                        console.error(error);
                    });
                } catch (e) {
                    console.error(e);
                }

            };

            sigServer.onCandidate = (cand: RTCIceCandidateInit) => {
                rtcConnection.addIceCandidate(new RTCIceCandidate(cand));
            };

            sigServer.send({
                type: "join",
                sess_id: this.props.sessId,
                nickname,
            });

        })();
    }

    public render() {
        return (
            <div className="row">
                <div className="col-xs-12">
                    <video ref={this.videoRef} autoPlay={true} style={{width: "100%" }}/>
                    <div
                        // tslint:disable-next-line: jsx-no-multiline-js
                        style={{
                            background: "rgba(0, 255, 0, .5)",
                            width: 50,
                            height: 50,
                            position: "absolute",
                            top: 0,
                            right: 0,
                            zIndex: 2,
                            textAlign: "center",
                            fontSize: "2em",
                            cursor: "pointer",
                        }}
                        onClick={this.props.onExit}
                    >X
                    </div>
                </div>
            </div>
        );
    }

}
