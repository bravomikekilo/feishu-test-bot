import axios from "axios";
import { TenantAccessRes, TenantURL } from "./api";

export async function getTenantAccess(appID: string, appSecret: string): Promise<TenantAccessRes> {
    let res = await axios.post<TenantAccessRes>(TenantURL, {
        "app_id": appID,
        "app_secret": appSecret
    }, {
        headers: {
            'Content-Type': 'application-json'
        }
    }).then(res => res.data);
    return res
}