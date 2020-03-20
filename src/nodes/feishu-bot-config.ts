import {NodeProperties, Red} from 'node-red'
import {Node} from 'node-red'
import axios from 'axios'
import {TenantAccessRes} from '../io/api'

interface FeishuBotConfigProp extends NodeProperties {
    appID: string;
    appSecret: string;
}

interface FeishuBotConfigNode extends Node {
    appID: string;
    appSecret: string;
    tenantToken?: string;
}

export = (RED: Red) => {
    function buildNode(this: FeishuBotConfigNode, prop: FeishuBotConfigProp) {
        RED.nodes.createNode(this, prop);

        this.appID = prop.appID;

    }
}







