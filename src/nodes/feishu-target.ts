import { NodeProperties, Red, NodeId } from 'node-red'
import { Node } from 'node-red'
import axios from 'axios'
import { TenantAccessRes } from '../io/api'
import { getTenantAccess } from '../io/tenant'
import { FeishuConfigNode } from './config-node'
import { MessageObj, Message } from './msg'
import { Payload, MetaInfo } from './payload'
import { sendMsg } from '../io/sendMsg'
import { getGroupList } from '../io/getGroupList'
import { Chat } from './chat'
import feishuSend = require('./feishu-send')

interface FeishuTargetProp extends NodeProperties {
    add: boolean
}

interface FeishuTargetNode extends Node {
    add: boolean
    user: string[]
    chat: string[]
}

function addChatID(origin: (Chat | string)[], newID: string) {
    let found = origin.find((elem) => {
        if (typeof elem === 'string') {
            return newID === elem
        } else {
            return elem.chat_id == newID
        }
    })

    if (found) {
        return
    } else {
        origin.push(newID)
    }
}

function addUserID(origin: string[], newID: string) {
    let found = origin.find(elem => elem === newID);

    if (found) {
        return
    } else {
        origin.push(newID)
    }
}

export = (RED: Red) => {
    function buildNode(this: FeishuTargetNode, prop: FeishuTargetNode) {

        RED.nodes.createNode(this, prop);

        this.add = prop.add;
        this.log(`add: ${this.add}`)

        this.on('input', async (msg, send, done) => {
            let topic = msg.topic as String | undefined
            let payload = msg.payload as Payload
            let metaInfo = msg.feishu_meta_info as MetaInfo

            if (this.context().get('chat') === undefined) {
                this.context().set('chat', [])
                this.chat = []
            } else {
                this.chat = this.context().get('chat')
            }

            if (this.context().get('user') === undefined) {
                this.context().set('user', [])
                this.user = []
            } else {
                this.user = this.context().get('user')
            }


            if (topic === 'add') {
                metaInfo.target.user.forEach(user => {
                    if (this.user.indexOf(user) === -1) {
                        this.user.push(user)
                    }
                })
                
                metaInfo.target.chat.forEach(chat => {
                    let chat_id = typeof(chat) === 'string' ? chat : chat.chat_id;
                    if (this.chat.indexOf(chat_id) === -1) {
                        this.chat.push(chat_id)
                    }
                })

                this.context().set('user', this.user)
                this.context().set('chat', this.chat)

                done()

            } else if (topic === 'remove') {
                metaInfo.target.user.forEach(user => {
                    const index = this.user.indexOf(user);
                    if (index !== -1) {
                        this.user.splice(index, 1);
                    }
                })

                metaInfo.target.chat.forEach(chat => {
                    let chatId = typeof(chat) === 'string' ? chat : chat.chat_id;
                    const index = this.user.indexOf(chatId);
                    if (index !== -1) {
                        this.chat.splice(index, 1);
                    }
                })

                this.context().set('user', this.user)
                this.context().set('chat', this.chat)


                done()

            } else {

                if (this.add) {
                    this.user.forEach((user) => {
                        addUserID(metaInfo.target.user, user)
                    })

                    this.chat.forEach(chat => {
                        addChatID(metaInfo.target.chat, chat)
                    })
                } else {
                    metaInfo.target.user = this.user.slice();
                    metaInfo.target.chat = this.chat.slice();
                }

                send(msg);
                done()
            }


        })

    }

    RED.nodes.registerType('feishu-target', buildNode)
}





