interface ISettings {
    WS_SRV_URL: string;
}

const wsProtocol = (window.location.protocol === "https:") ? "wss" : "ws";

const srvUrl = process.env.NODE_ENV === "production" ?
    window.location.host : "localhost:3322";

export const Settings: ISettings = {
    WS_SRV_URL: `${wsProtocol}://${srvUrl}`,
};
