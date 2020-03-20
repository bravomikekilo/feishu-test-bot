import { getGroupListURL, GetGroupListRes } from "./api";
import axios from "axios";

interface getGroupListParam {
    pageSize?: number,
    pageToken?: string
}

export async function getGroupList(
    auth: string,
    pageSize?: number,
    pageToken?: string
) {
    let query: getGroupListParam = {}

    if (pageSize !== undefined) {
        query.pageSize = pageSize
    }

    if (pageToken !== undefined) {
        query.pageToken = pageToken
    }

    let authHeader = `Bearer ${auth}`
    console.log('authorization header:', authHeader)

    return await axios.get<GetGroupListRes>(getGroupListURL, {
        headers: {
            Authorization: `Bearer ${auth}`,
            'Content-Type': 'application/json'
        },
    }).then(res => res.data).catch(err => {throw err});
}
