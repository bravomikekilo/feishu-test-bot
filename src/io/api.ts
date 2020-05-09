import { Chat } from "../nodes/chat"

export const TenantURL: string = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/'
export const sendMessageURL: string = 'https://open.feishu.cn/open-apis/message/v4/send/'
export const getGroupListURL = 'https://open.feishu.cn/open-apis/chat/v4/list'
export const getGroupInfoURL: string = 'https://open.feishu.cn/open-apis/chat/v4/info'

export const uploadImageURL: string = 'https://open.feishu.cn/open-apis/image/v4/put/'
export const fetchImageURL: string = 'https://open.feishu.cn/open-apis/image/v4/get'

export interface CommonRes {
    code: number;
    msg: string;
}

export interface TenantAccessRes extends CommonRes {
    tenant_access_token: string,
    expire: number,
}

export interface GroupRes {
    avatar: string,
    description: string,
    chat_id: string,
    name: string,
    owner_open_id: string,
    owner_user_id?: string
}

export interface GroupListRes {
    has_more: boolean,
    page_token?: string,
    groups: GroupRes[],
}

export interface GetGroupListRes extends CommonRes {
    data:  GroupListRes
}

export interface GetGroupInfoRes extends CommonRes {
    data: Chat
}

export interface UploadImageRes extends CommonRes {
    data: {
        image_key: string
    }
}

export interface SendMsgReq {
    open_id?: string;
    chat_id?: string;
    user_id?: string;
    email?: string;

    root_id?: string;
}

export interface SendMsgRes {
    code: number;
    msg: string;
    data: {
        message_id: string
    }
}

export interface SendTextMsgReq extends SendMsgReq {
    msg_type: 'text'
    content: {
        text: string
    }
}

export interface SendImageMsgReq extends SendMsgReq {
    msg_type: 'image',
    content: {
        image_key: string
    }
}

export interface SendPostMsgReq extends SendMsgReq {
    msg_type: 'post',
    content: any
}

export interface SendChatShareMsgReq extends SendMsgReq {
    msg_type: 'share_chat',
    content: {
        share_open_chat_id: string
    }
}

export interface RawMsg {
    uuid: string,
    token: string,
    ts: string,
    type: string,
    event: {
        type: "message",
        app_id: string,
        tenant_key: string,
        root_id: string,
        parent_id: string,
        open_chat_id: string,
        chat_type: 'private' | 'group',
        msg_type: 'text',
        open_id: string,
        open_massage_id: string,
        is_mention: boolean,
        text: string,
        text_without_at_bot: string,
        title?: string,
        image_keys?: string[],
        image_key?: string
    }
}