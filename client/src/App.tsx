import React from "react";
import "./App.css";
import "./HrefButton.css";

export default class App extends React.Component<{}, {}> {
    public render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-6">
                        <button className="HrefButton">Create session</button>
                        to broadcast your screen
                    </div>
                    <div className="col-sm-6">
                        ...or <button className="HrefButton">join session</button>
                        to watch.
                    </div>
                </div>
            </div>
        );
    }
}
