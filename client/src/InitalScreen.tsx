import React from "react";
import { IUserAppMode } from "./interfaces";

interface IProps {
    onDecision: (d: IUserAppMode) => void;
}

export default class InitialScreen extends React.Component<IProps, {}> {

    constructor(p: IProps, c: any) {
        super(p, c);
        this.onClickPub = this.onClickPub.bind(this);
        this.onClickSub = this.onClickSub.bind(this);
    }

    public render() {
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-sm-6 col-md-4 col-lg-3">
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Session id"
                            />
                        </div>
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nickname"
                            />
                        </div>
                        <button
                            className="btn btn-primary btn-block"
                            onClick={this.onClickSub}
                        >
                            Join session
                        </button>
                    </div>
                </div>
                <div style={{minHeight: "2em"}}/>
                <div className="row">
                    <div className="col-sm-6 col-md-4 col-lg-3 mb-3">
                        <button
                            className="btn btn-success btn-block"
                            onClick={this.onClickPub}
                        >
                            Create session
                        </button>
                    </div>
                </div>
            </React.Fragment>
        );
    }

    private onClickPub(e: any) {
        this.props.onDecision({
            mode: "pub",
        });
    }

    private onClickSub(e: any) {
        this.props.onDecision({
            mode: "sub",
            nickName: "user" + Date.now(),
            sessionId: Date.now().toString(),
        });
    }
}
