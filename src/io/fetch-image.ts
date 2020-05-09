import { fetchImageURL, GetGroupInfoRes } from './api'
import fetch from 'node-fetch'
import axios from 'axios'


export async function fetchImage(auth: string, image_key: string) {

    let res = await fetch(`${fetchImageURL}?image_key=${image_key}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${auth}`
        }
    }).then(res => res.buffer());

    return res;
}