import {NodeProperties, Red, NodeId} from 'node-red'
import {Node} from 'node-red'
import { FeishuConfigNode } from './config-node'
import { fetchImage } from '../io/fetch-image'

interface FeishuFetchImageProp extends NodeProperties {
    config: NodeId;
}

interface FeishuFetchImageNode extends Node { 
    config: FeishuConfigNode;
}

export = (RED: Red) => {
    function buildNode(this: FeishuFetchImageNode, prop: FeishuFetchImageProp) {
        RED.nodes.createNode(this, prop);

        this.config = RED.nodes.getNode(prop.config) as FeishuConfigNode

        this.on('input', async (msg, send, done) => {
            let payload = msg.payload as string

            let res = await fetchImage(this.config.tenantToken, payload)
            
            console.log('fetch result:', typeof res)
            
            msg.payload = res

            send(msg)

        })

    }

    RED.nodes.registerType('feishu-fetch-image', buildNode)
}


