import { IObj } from "./interfaces";

interface ISettings {
    WS_SRV_URL: string;
    MAIN_DIV_CLASS: string;
    RTC_CONN_CONDFIG: IObj;
}

const wsProtocol = (window.location.protocol === "https:") ? "wss" : "ws";

const srvUrl = process.env.NODE_ENV === "production" ?
    window.location.host : "localhost:3322";

const RtcConnConfig: IObj = {
    iceServers: [{
        urls: "stun:stun.l.google.com:19302",
    }, {
        // эти сервра получены способом описанным тут:
        // https://stackoverflow.com/questions/52206277/turn-server-appears-to-be-broken
        urls: [
            "turn:64.233.161.127:19305?transport=udp",
            "turn:[2a00:1450:4010:c01::7f]:19305?transport=udp",
            "turn:64.233.161.127:19305?transport=tcp",
            "turn:[2a00:1450:4010:c01::7f]:19305?transport=tcp",
        ],
        username: "CIjz++kFEgazCCVchWoYqvGggqMKIICjBQ",
        credential: "XD41hwV2dl6TRUElG4vd54JKf78=",
        maxRateKbps: "8000",
    }],
};

export const Settings: ISettings = {
    WS_SRV_URL: `${wsProtocol}://${srvUrl}`,
    MAIN_DIV_CLASS: "col-sm-6 col-md-4 col-lg-4 offset-sm-3 offset-md-4 offset-lg-4",
    RTC_CONN_CONDFIG: RtcConnConfig,
};
