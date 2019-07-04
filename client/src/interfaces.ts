export interface IUserAppModePub {
    mode: "pub";
}

export interface IUserAppModeSub {
    mode: "sub";
    sessionId: string;
    nickName: string;
}

export type IUserAppMode = IUserAppModePub | IUserAppModeSub;

export interface ISigServerMsg {
    type: "login_resp" | "candidate" | "offer" | "answer";
    status: "ok" | "error";
    error?: string;
}
