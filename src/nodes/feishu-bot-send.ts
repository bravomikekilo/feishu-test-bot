import {NodeProperties, Red} from 'node-red'
import {Node} from 'node-red'
import axios from 'axios'
import { TenantAccessRes, GetGroupListRes } from '../io/api'
import { getTenantAccess } from '../io/tenant'
import { getGroupList } from '../io/getGroupList'
import { sendText } from '../io/sendMsg'

interface FeishuBotProp extends NodeProperties {
    appID: string;
    appSecret: string;
}

interface FeishuBotNode extends Node {
    appID: string;
    appSecret: string;

}

export = (RED: Red) => {
    function buildNode(this: FeishuBotNode, prop: FeishuBotProp) {
        RED.nodes.createNode(this, prop);

        this.appID = prop.appID;
        this.appSecret = prop.appSecret;

        this.on('input', async (msg, send, done) => {
            let payload = msg.payload as string;

            let tenantToken = await getTenantAccess(
                this.appID,
                this.appSecret
            );

            if(tenantToken.code !== 0) {
                this.error("can't get tenant token", {
                    appID: this.appID,
                    appSecret: this.appSecret,
                    msg: tenantToken.msg
                })
                done(msg);
                return;
            }


            const auth = tenantToken.tenant_access_token;

            let groupListRes: GetGroupListRes;

            try {
                groupListRes = await getGroupList(auth);
            } catch(err) {
                this.error("error when get group list", err)
                return;
            }

            if (groupListRes.code != 0) {
                this.error("can't get group list", groupListRes.msg)
                done(msg);
                return;
            }

            const groupList = groupListRes.data.groups;

            let allSend = groupList.map(group => {
                sendText(auth, 'chat', group.chat_id, payload)
            });

            await Promise.all(allSend);

            done(msg);
        })
    }

    RED.nodes.registerType('feishu-bot-send', buildNode)
}



