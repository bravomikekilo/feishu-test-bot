import { Message } from "./msg";
import { Chat } from './chat';


export interface Payload {
    msg: Message | string,
    target: {
        chat: (string | Chat)[],
        user: string[]
    }
}