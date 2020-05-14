import {NodeProperties, Red, NodeId} from 'node-red'
import {Node} from 'node-red'
import { FeishuConfigNode } from './config-node'
import { Payload, MetaInfo } from './payload'
import { getGroupList } from '../io/getGroupList'
import { getGroupInfo} from '../io/getGroupInfo'
import { getGroupInfoURL } from '../io/api'



interface FeishuFetchGroupInfoProp extends NodeProperties { 
    config: NodeId
} 

interface FeishuFetchGroupInfoNode extends Node { 
    config: FeishuConfigNode;
}

export = (RED: Red) => {

    function buildNode(this: FeishuFetchGroupInfoNode, prop: FeishuFetchGroupInfoProp) {
        RED.nodes.createNode(this, prop);

        this.config = RED.nodes.getNode(prop.config) as FeishuConfigNode;

        this.on('input', async (msg, send, done) => {
            let payload = msg.payload as Payload
            let metaInfo = msg.feishu_meta_info as MetaInfo

            if (metaInfo === undefined) {
                msg.feishu_meta_info = {
                    target: {
                        chat: [],
                        user: []
                    },
                    chat: [],
                    user: []
                }

                metaInfo = msg.feishu_meta_info;
            }
            
            let groups = payload.target.chat;
            
            let fetchAll = groups.map(async g => {
                if (typeof(g) === 'string' ) {
                    let res = await getGroupInfo(this.config.tenantToken, g);
                    return res.data
                } else {
                    return g
                }
            })

            let new_groups = await Promise.all(fetchAll);

            msg.feishu_meta_info.chat = new_groups;

            send(msg);
        })

    }

    RED.nodes.registerType('feishu-fetch-group-info', buildNode)
}





