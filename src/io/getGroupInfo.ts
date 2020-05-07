import axios from "axios"
import { GetGroupInfoRes, getGroupInfoURL } from "./api"


export async function getGroupInfo(
    auth: string,
    chatId: string
) {

    let authHeader = `Bearer ${auth}`
    
    return await axios.get<GetGroupInfoRes>(getGroupInfoURL, {
        headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json'
        },
        params: {
            chat_id: chatId
        }
    }).then(res => res.data).catch(err => {throw err})

}
