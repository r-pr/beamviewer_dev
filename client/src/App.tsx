import React from "react";

import "./App.css";
import Footer from "./Footer";
import "./HrefButton.css";
import InitialScreen from "./InitalScreen";
import { IUserAppMode } from "./interfaces";
import logo from "./logo.svg";
import PubScreen from "./PubScreen";



interface IState {
    appMode?: IUserAppMode;
}

export default class App extends React.Component<{}, IState> {
    constructor(p: {}, c: any) {
        super(p, c);
        this.state = {};
        this.onUserDecision = this.onUserDecision.bind(this);
        // this.getActiveComponent = this.getActiveComponent.bind(this);
    }
    public render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <h1 className="col-sm-12 App-header2">
                        <img src={logo} className="App-logo" alt="logo" />
                        BeamViewer
                    </h1>
                </div>
                {this.getActiveComponent()}
                <Footer/>
            </div>
        );
    }

    private onUserDecision(decision: IUserAppMode) {
        this.setState({appMode: decision});
    }

    private getActiveComponent(): JSX.Element {
        if (this.state.appMode) {
            return <PubScreen/>;
        } else {
            return <InitialScreen onDecision={this.onUserDecision}/>;
        }
    }
}
