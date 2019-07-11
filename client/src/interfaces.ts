export interface IUserAppModePub {
    mode: "pub";
}

export interface IUserAppModeSub {
    mode: "sub";
    sessionId: string;
    nickName: string;
}

export type IUserAppMode = IUserAppModePub | IUserAppModeSub;

export interface IObj {
    [key: string]: any;
}
