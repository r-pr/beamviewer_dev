import React from "react";

export default class InitialScreen extends React.Component<{}, {}> {
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
                        <button className="btn btn-primary btn-block">Join session</button>
                    </div>
                </div>
                <div style={{minHeight: "2em"}}/>
                <div className="row">
                    <div className="col-sm-6 col-md-4 col-lg-3 mb-3">
                        <button className="btn btn-success btn-block">Create session</button>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
