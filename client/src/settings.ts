interface ISettings {
    WS_SRV_URL: string;
    MAIN_DIV_CLASS: string;
}

const wsProtocol = (window.location.protocol === "https:") ? "wss" : "ws";

const srvUrl = process.env.NODE_ENV === "production" ?
    window.location.host : "localhost:3322";

export const Settings: ISettings = {
    WS_SRV_URL: `${wsProtocol}://${srvUrl}`,
    MAIN_DIV_CLASS: "col-sm-6 col-md-4 col-lg-4 offset-sm-3 offset-md-4 offset-lg-4",
};
