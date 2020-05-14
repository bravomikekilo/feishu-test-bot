import {NodeProperties, Red, NodeId} from 'node-red'
import {Node} from 'node-red'
import axios from 'axios'
import {TenantAccessRes} from '../io/api'
import { getTenantAccess } from '../io/tenant'
import { FeishuConfigNode } from './config-node'
import { MessageObj, Message } from './msg'
import { Payload, MetaInfo } from './payload'
import { sendMsg } from '../io/sendMsg'
import { getGroupList } from '../io/getGroupList'

interface FeishuAllGroupProp extends NodeProperties { 
    config: NodeId
} 

interface FeishuAllGroupNode extends Node { 
    config: FeishuConfigNode;
}

export = (RED: Red) => {
    function buildNode(this: FeishuAllGroupNode, prop: FeishuAllGroupProp) {
        RED.nodes.createNode(this, prop);

        this.config = RED.nodes.getNode(prop.config) as FeishuConfigNode;

        this.on('input', async (msg, send, done) => {
            let payload = msg.payload as Payload
            let metaInfo = msg.feishu_meta_info as MetaInfo
            
            let groupListRes = await getGroupList(this.config.tenantToken);

            const groupList = groupListRes.data.groups;

            console.log(`message: ${JSON.stringify(msg)}`)

            msg.feishu_meta_info.chat = groupList.map(g => g.chat_id);


            send(msg);
        })

    }

    RED.nodes.registerType('feishu-all-group', buildNode)
}





