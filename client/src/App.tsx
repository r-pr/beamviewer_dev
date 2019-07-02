import React from "react";

import "./App.css";
import Footer from "./Footer";
import "./HrefButton.css";
import InitialScreen from "./InitalScreen";
import logo from "./logo.svg";

export default class App extends React.Component<{}, {}> {
    public render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <h1 className="col-sm-12 App-header2">
                        <img src={logo} className="App-logo" alt="logo" />
                        BeamViewer
                    </h1>
                </div>
                <InitialScreen/>
                <Footer/>
            </div>
        );
    }
}
