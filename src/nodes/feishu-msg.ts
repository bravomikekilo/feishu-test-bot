import * as express from 'express'
import { Express } from 'express'
import { NodeProperties, Red, NodeId } from 'node-red'
import { Node } from 'node-red'
import axios from 'axios'
import { TenantAccessRes, RawMsg } from '../io/api'
import { getTenantAccess } from '../io/tenant'
import { FeishuConfigNode } from './config-node'

interface FeishuMsgProp extends NodeProperties {
    url: string;
    port: number;
}

interface FeishuMsgNode extends Node {
    url: string;
    port: number;
    app: Express;
}

export = (RED: Red) => {
    function buildNode(this: FeishuMsgNode, prop: FeishuMsgProp) {
        RED.nodes.createNode(this, prop);

        this.url = prop.url;
        this.port = prop.port;

        const app = express();
        app.use(express.json());

        app.post(this.url, (req, res) => {
            let rawMsg = req.body as RawMsg;

            const metaInfo = {
                target: {
                    chat: rawMsg.event.chat_type === 'private' ? [] : [rawMsg.event.open_chat_id],
                    user: rawMsg.event.chat_type === 'private' ? [rawMsg.event.open_id] : [],
                },
                chat: rawMsg.event.chat_type === 'private' ? [] : [rawMsg.event.open_chat_id],
                user: rawMsg.event.chat_type === 'private' ? [rawMsg.event.open_id] : [],
            }


            if (rawMsg.event.image_key !== undefined) {
                // we get a image message
                this.send({
                    payload: {
                        msg: {
                            image_key: rawMsg.event.image_key,
                        },
                    },
                    feishu_meta_info: metaInfo
                })
            } else if(rawMsg.event.text_without_at_bot !== undefined) {
                // we get a text message
                this.send({
                    payload: {
                        msg: {
                            text: rawMsg.event.text_without_at_bot
                        },
                    },
                    feishu_meta_info: metaInfo
                })

            }

            res.sendStatus(200);

        })

        this.app = app

        try {
            let server = app.listen(this.port, () => {
                this.log(`feishu message node listen on server:${this.port}${this.url}`)
            });

            this.on('close', () => {
                server.close();
            })

        } catch (err) {
            this.error(`can't listen, error: ${err}`)
        }

    }

    RED.nodes.registerType('feishu-msg', buildNode)
}

