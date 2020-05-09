import {readFile} from 'fs'
import { NodeProperties, Red, NodeId } from 'node-red'
import { Node } from 'node-red'
import axios from 'axios'
import { TenantAccessRes, RawMsg } from '../io/api'
import { getTenantAccess } from '../io/tenant'
import { FeishuConfigNode } from './config-node'
import feishuSend = require('./feishu-send')

interface ReadImageProp extends NodeProperties {
    path: string;
}

interface ReadImageNode extends Node {
    path: string
}

export = (RED: Red) => {
    function buildNode(this: ReadImageNode, prop: ReadImageProp) {
        RED.nodes.createNode(this, prop);

        this.path = prop.path;

        this.on('input', (msg, send, done) => {
            readFile(this.path, (err, data) => {
                if(err !== null) {
                    this.error(`error when reading file ${err.message}`)
                    return;
                }

                msg.payload = data
                send(msg)
            });
        })


    }

    RED.nodes.registerType('read-image', buildNode)
}

