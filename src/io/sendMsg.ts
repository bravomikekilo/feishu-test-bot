import {sendMessageURL, SendMsgReq, SendTextMsgReq, SendMsgRes} from './api'
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


