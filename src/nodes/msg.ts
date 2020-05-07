
export interface MessageObj {
    share_open_id?: string,
    image_key?: string,
    text?: string,
    post?: any,
}

export type Message = string | MessageObj;

