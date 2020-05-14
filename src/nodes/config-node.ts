import {NodeProperties, Red} from 'node-red'
import {Node} from 'node-red'

export interface FeishuConfigProp extends NodeProperties {
    appID: string;
    appSecret: string;
}

export interface FeishuConfigNode extends Node {
    appID: string;
    appSecret: string;
    tenantToken: string;
    intervalId?: NodeJS.Timeout
}