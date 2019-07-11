import { IObj } from "./interfaces";

export class UserMedia {

    public getDisplayMedia(opts?: IObj): Promise<MediaStream> {
        if (!this.canGetDisplayMedia()) {
            throw new Error("old browser");
        }
        if (!opts) {
            opts = {
                audio: false,
                video: {
                    cursor: "never",
                },
            };
        }
        return (navigator.mediaDevices as any).getDisplayMedia(opts);
    }

    public canGetDisplayMedia(): boolean {
        return navigator.mediaDevices && !!(navigator.mediaDevices as any).getDisplayMedia;
    }
}
