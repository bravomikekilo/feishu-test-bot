import * as express from 'express'
import {Express} from 'express'
import { NodeProperties, Red, NodeId } from 'node-red'
import { Node } from 'node-red'
import axios from 'axios'
import { TenantAccessRes } from '../io/api'
import { getTenantAccess } from '../io/tenant'
import { FeishuConfigNode } from './config-node'

interface FeishuActivateProp extends NodeProperties {
    url: string;
    port: number;
}

interface FeishuActivateNode extends Node {
    url: string;
    port: number;
    app: Express;
}

export = (RED: Red) => {
    function buildNode(this: FeishuActivateNode, prop: FeishuActivateProp) {
        RED.nodes.createNode(this, prop);

        this.url = prop.url;
        this.port = prop.port;

        const app = express();
        app.use(express.json());

        app.post(this.url, (req, res) => {
            if (req.body.challenge != undefined) {
                res.status(200);
                res.json({
                    'challenge': req.body.challenge
                });
            } else {
                res.status(403);
            }
            res.end();
        })

        this.app = app

        try {
            let server = app.listen(this.port, () => {
                this.log(`feishu activate node listen on server:${this.port}${this.url}`)
            });

            this.on('close', () => {
                server.close();
            })

        } catch (err) {
            this.error(`can't listen, error: ${err}`)
        }

    }

    RED.nodes.registerType('feishu-activate', buildNode)
}


