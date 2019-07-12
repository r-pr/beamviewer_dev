import React from "react";
import { IUserAppMode } from "./interfaces";

interface IProps {
    onDecision: (d: IUserAppMode) => void;
}

interface IState {
    sessId: string;
    nickName: string;
}

export default class InitialScreen extends React.Component<IProps, IState> {

    constructor(p: IProps, c: any) {
        super(p, c);
        this.onClickPub = this.onClickPub.bind(this);
        this.onClickSub = this.onClickSub.bind(this);
        this.handleSessIdChange = this.handleSessIdChange.bind(this);
        this.handleNickNameChnage = this.handleNickNameChnage.bind(this);
        this.state = {
            sessId: "",
            nickName: "",
        };
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
                                value={this.state.sessId}
                                onChange={this.handleSessIdChange}
                            />
                        </div>
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nickname"
                                value={this.state.nickName}
                                onChange={this.handleNickNameChnage}
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

    private handleSessIdChange(e: any) {
        this.setState({sessId: e.target.value.trim()});
    }

    private handleNickNameChnage(e: any) {
        this.setState({nickName: e.target.value.trim()});
    }

    private onClickPub(e: any) {
        this.props.onDecision({
            mode: "pub",
        });
    }

    private onClickSub(e: any) {
        this.props.onDecision({
            mode: "sub",
            nickName:  this.state.nickName,
            sessionId: this.state.sessId,
        });
    }
}
