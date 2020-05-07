import {sendMessageURL, SendMsgReq, SendTextMsgReq, SendMsgRes, SendImageMsgReq, SendPostMsgReq, SendChatShareMsgReq} from './api'
import {Message} from '../nodes/msg';
import axios from 'axios';

export type TargetType = 'open' | 'email' | 'chat' | 'user';


function setTarget(req: SendMsgReq, targetType: TargetType, target: string) {
    switch (targetType) {
        case 'open':
            req.open_id = target;
            break;
        case 'email':
            req.email = target;
            break;
        case 'chat':
            req.chat_id = target;
            break;
        case 'user':
            req.user_id = target;
            break;
        default:
            throw {
                error: "unknown target type"
            }
    }
    return req;
}


export async function sendText(auth: string, targetType: TargetType, target: string, content: string) {
    let req: SendTextMsgReq = {
        msg_type: 'text',
        content: {
            text: content
        }
    }

    setTarget(req, targetType, target);

    return await axios.post<SendMsgRes>(
        sendMessageURL, req, {
            headers: {
                Authorization: `Bearer ${auth}`
            }
        }
    ).then(res => res.data)

}

export async function sendImage(auth: string, targetType: TargetType, target: string, content: string) {
    let req: SendImageMsgReq = {
        msg_type: 'image',
        content: {
            image_key: content
        }
    }

    setTarget(req, targetType, target);

    return await axios.post<SendMsgRes>(
        sendMessageURL, req, {
            headers: {
                Authorization: `Bearer ${auth}`
            }
        }
    ).then(res => res.data)

} 

export async function sendPost(auth: string, targetType: TargetType, target: string, content: any) {
    let req: SendPostMsgReq = {
        msg_type: 'post',
        content: content,
    }

    setTarget(req, targetType, target);

    return await axios.post<SendMsgRes>(
        sendMessageURL, req, {
            headers: {
                Authorization: `Bearer ${auth}`
            }
        }
    ).then(res => res.data)

}


export async function sendShareChat(auth: string, targetType: TargetType, target: string, content: string) {
    let req: SendChatShareMsgReq = {
        msg_type: 'share_chat',
        content: {
            share_open_chat_id: content
        },
    }

    setTarget(req, targetType, target);

    return await axios.post<SendMsgRes>(
        sendMessageURL, req, {
            headers: {
                Authorization: `Bearer ${auth}`
            }
        }
    ).then(res => res.data)

}


export async function sendMsg(auth: string, targetType: TargetType, target: string, msg: Message) {
    if (typeof(msg) === 'string') {
        sendText(auth, targetType, target, msg);
    } else {
        if (msg.text !== undefined) {
            sendText(auth, targetType, target, msg.text);
        } else if(msg.image_key !== undefined) {
            sendImage(auth, targetType, target, msg.image_key);
        } else if(msg.share_open_id !== undefined) {
            sendShareChat(auth, targetType, target, msg.share_open_id);
        } else {
            sendPost(auth, targetType, target, msg.post);
        }
    }
}