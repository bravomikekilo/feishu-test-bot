
export const TenantURL: string = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/'
export const sendMessageURL: string = 'https://open.feishu.cn/open-apis/message/v4/send/'
export const getGroupListURL = 'https://open.feishu.cn/open-apis/chat/v4/list'

export interface TenantAccessRes {
    code: number,
    msg: string,
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

export interface GetGroupListRes {
    code: number;
    msg: string;
    data:  GroupListRes
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

}

export interface SendChatShareMsgReq extends SendMsgReq {

}
