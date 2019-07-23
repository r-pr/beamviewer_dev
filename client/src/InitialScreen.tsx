import React from "react";
import { IUserAppMode } from "./interfaces";
import { Settings} from "./settings";

const { MAIN_DIV_CLASS } = Settings;

const CHAR_CODE_ENTER = 13;

interface IProps {
    onDecision: (d: IUserAppMode) => void;
    error: string;
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
        this.onKeyPress = this.onKeyPress.bind(this);
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
                    <div className={MAIN_DIV_CLASS}>
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Session ID"
                                value={this.state.sessId}
                                onChange={this.handleSessIdChange}
                                onKeyPress={this.onKeyPress}
                                style={{textAlign: "center"}}
                            />
                        </div>
                        {   // tslint:disable-next-line: jsx-no-multiline-js
                            /* <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nickname"
                                value={this.state.nickName}
                                onChange={this.handleNickNameChnage}
                            />
                        </div> */}
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
                    <div className={MAIN_DIV_CLASS}>
                        <button
                            className="btn btn-success btn-block"
                            onClick={this.onClickPub}
                        >
                            Create session
                        </button>
                    </div>
                </div>
                <div
                    className="row"
                    style={{ display: this.props.error ? "block" : "none" }}
                >
                    <div className={MAIN_DIV_CLASS}>
                        <div
                            className="alert alert-danger"
                            role="alert"
                            style={{marginTop: "1em"}}
                        >
                            {this.props.error}
                        </div>
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

    private onKeyPress(evt: any) {
        evt = evt || window.event;
        const charCode = evt.keyCode || evt.which;
        if (charCode === CHAR_CODE_ENTER) {
            this.onClickSub(null);
        }
    }

    private onClickPub(e: any) {
        this.props.onDecision({
            mode: "pub",
        });
    }

    private onClickSub(e: any) {
        this.props.onDecision({
            mode: "sub",
            // nickName:  this.state.nickName,
            nickName: Date.now().toString(),
            sessionId: this.state.sessId,
        });
    }
}
