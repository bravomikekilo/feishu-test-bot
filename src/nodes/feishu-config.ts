import {NodeProperties, Red} from 'node-red'
import {Node} from 'node-red'
import axios from 'axios'
import {TenantAccessRes} from '../io/api'
import { getTenantAccess } from '../io/tenant'
import { FeishuConfigNode, FeishuConfigProp } from './config-node'



export = (RED: Red) => {
    function buildNode(this: FeishuConfigNode, prop: FeishuConfigProp) {
        RED.nodes.createNode(this, prop);

        this.appID = prop.appID;
        this.appSecret = prop.appSecret;

        getTenantAccess(this.appID, this.appSecret).then(res => {
            if (res.code === 0) {
                this.tenantToken = res.tenant_access_token;
                console.log('get tenant token')
            } else {
                console.log(`Failed get tenant token ${res.msg}`)
            }
        }).catch(err => {
            console.log("can't get tenant token")
        })

        

        this.intervalId = setInterval(async () => {
            let tenantTokenRes = await getTenantAccess(
                this.appID,
                this.appSecret,
            )
            
            if (tenantTokenRes.code !== 0) {
                this.tenantToken = tenantTokenRes.tenant_access_token;
                console.log('refresh tenant token');
            }


        }, 60 * 1000);

        this.on('close', () => {
            if (this.intervalId !== undefined) {
                clearInterval(this.intervalId)
            }
        })
    }

    RED.nodes.registerType('feishu-config', buildNode);
}







