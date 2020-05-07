import { Chat } from "../nodes/chat"

export const TenantURL: string = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/'
export const sendMessageURL: string = 'https://open.feishu.cn/open-apis/message/v4/send/'
export const getGroupListURL = 'https://open.feishu.cn/open-apis/chat/v4/list'
export const getGroupInfoURL: string = 'https://open.feishu.cn/open-apis/chat/v4/info'


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
