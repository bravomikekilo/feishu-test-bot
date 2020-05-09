import { uploadImageURL, UploadImageRes } from './api'
import fetch from 'node-fetch'
import FormData = require('form-data')
import { createReadStream } from 'fs'
import { Readable, Duplex } from 'stream'
import intoStream from 'into-stream';
import request = require('request');
import feishuSend = require('../nodes/feishu-send')

export function uploadImage(auth: string, image: Buffer, kind: 'message' | 'avatar' = 'message'): Promise<UploadImageRes> {
    const formData = new FormData();

    // const stream = createReadStream('./flow-big.png');
    const readableStream = intoStream(image);
    // readableStream._read = () => {}
    // readableStream.push(image);
    // readableStream.push(null);

    const ret = new Promise((resolve, reject) => {
        request.post({
            url: "https://open.feishu.cn/open-apis/image/v4/put",
            formData: {
                image: {
                    value: image,
                    options: {
                        filename: 'test.png',
                    }
                },
                image_type: 'message'
            },
            headers: {
                'Authorization': `Bearer ${auth}`
            }
        }, function (err, httpResponse, body) {
            if (err) {
                console.log('failed')
                reject(err)
            }

            console.log(`upload success! server response ${body}`)
            resolve(JSON.parse(body));
        })
    })


    /*
    formData.append('image', readableStream);
    formData.append('image_type', kind);

    const headers = formData.getHeaders();
    headers['Authorization'] = `Bearer ${auth}`

    let res = await fetch(uploadImageURL, {
        method: 'POST',
        body: formData,
        headers: {
            Authorization: `Bearer ${auth}`
        }
    }).then(res => res.json())
    */

    return ret as Promise<UploadImageRes>

}




