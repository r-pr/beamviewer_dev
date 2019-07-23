import React from "react";

import "./App.css";
import InitialScreen from "./InitialScreen";
import { IUserAppMode } from "./interfaces";
import PubScreen from "./PubScreen";
import SubScreen from "./SubScreen";

interface IState {
    appMode?: IUserAppMode;
    error: string;
}

export default class App extends React.Component<{}, IState> {

    constructor(p: {}, c: any) {
        super(p, c);
        this.state = {
            error: "",
        };
        this.onUserDecision = this.onUserDecision.bind(this);
        this.onExit = this.onExit.bind(this);
    }

    public render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <h1 className="col-sm-12 App-header2" style={{textAlign: "center"}}>
                        BeamViewer
                    </h1>
                </div>
                {this.getActiveComponent()}
            </div>
        );
    }

    private onExit(err?: Error) {
        if (err) {
            this.setState({appMode: undefined, error: err.message});
        } else {
            this.setState({appMode: undefined});
        }
    }

    private onUserDecision(decision: IUserAppMode) {
        this.setState({appMode: decision});
    }

    private getActiveComponent(): JSX.Element {
        if (this.state.appMode) {
            if (this.state.appMode.mode === "pub") {
                return <PubScreen/>;
            } else if (this.state.appMode.mode === "sub") {
                return (
                    <SubScreen
                        nickName={this.state.appMode.nickName}
                        sessId={this.state.appMode.sessionId}
                        onExit={this.onExit}
                    />
                );
            } else {
                throw new Error();
            }
        } else {
            return (
                <InitialScreen
                    onDecision={this.onUserDecision}
                    error={this.state.error}
                />
            );
        }
    }
}
