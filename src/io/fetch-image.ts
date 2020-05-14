import { fetchImageURL, GetGroupInfoRes } from './api'
import fetch from 'node-fetch'
import axios from 'axios'


export async function fetchImage(auth: string, image_key: string) {

    let res = await axios.get(`${fetchImageURL}?image_key=${image_key}`, {
        headers: {
            Authorization: `Bearer ${auth}`
        },
        responseType: 'arraybuffer'
    }).then(res => res.data);

    return res;
}