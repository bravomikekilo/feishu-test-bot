import {NodeProperties, Red, NodeId} from 'node-red'
import {Node} from 'node-red'
import axios from 'axios'
import { FeishuConfigNode } from './config-node'
import { Payload } from './payload'
import { uploadImage } from '../io/upload-image'
import { uploadImageURL } from '../io/api'

interface FeishuUploadImageProp extends NodeProperties {
    config: NodeId;
}

interface FeishuUploadImageNode extends Node { 
    config: FeishuConfigNode;
}

export = (RED: Red) => {
    function buildNode(this: FeishuUploadImageNode, prop: FeishuUploadImageProp) {
        RED.nodes.createNode(this, prop);

        this.config = RED.nodes.getNode(prop.config) as FeishuConfigNode

        this.on('input', async (msg, send, done) => {
            let payload = msg.payload as Buffer
            
            console.log('payload:', payload)

            let res = await uploadImage(this.config.tenantToken, payload, 'message')
            
            if (res.code !== 0) {
                this.error(`error when upload image, message: ${res.msg}`)
                return
            }

            msg.payload = res.data.image_key

            send(msg)

        })

    }

    RED.nodes.registerType('feishu-upload-image', buildNode)
}


