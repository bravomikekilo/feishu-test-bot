import {NodeProperties, Red, NodeId} from 'node-red'
import {Node} from 'node-red'
import axios from 'axios'
import {TenantAccessRes} from '../io/api'
import { getTenantAccess } from '../io/tenant'
import { FeishuConfigNode } from './config-node'
import { MessageObj, Message } from './msg'
import { Payload, MetaInfo } from './payload'
import { sendMsg } from '../io/sendMsg'

interface FeishuSendProp extends NodeProperties {
    config: NodeId;
}

interface FeishuSendNode extends Node { 
    config: FeishuConfigNode;
}

export = (RED: Red) => {
    function buildNode(this: FeishuSendNode, prop: FeishuSendProp) {
        RED.nodes.createNode(this, prop);

        this.config = RED.nodes.getNode(prop.config) as FeishuConfigNode

        this.on('input', async (msg, send, done) => {
            let payload = msg.payload as Payload
            let metaInfo = msg.feishu_meta_info as MetaInfo

            if (metaInfo === undefined) {
                this.error("can'f get meta info")
                return;
            }

            let allSend = metaInfo.target.chat.map(group => {
                let groupId = typeof group === 'string' ? group : group.chat_id;
                return sendMsg(
                    this.config.tenantToken,
                    'chat',
                    groupId,
                    payload.msg
                )
            })

            let allUserSend = metaInfo.target.user.map(user => {
                return sendMsg(
                    this.config.tenantToken,
                    'open',
                    user,
                    payload.msg
                )
            })

            await Promise.all(allSend);
            await Promise.all(allUserSend);

            done(msg);
        })

    }

    RED.nodes.registerType('feishu-send', buildNode)
}






