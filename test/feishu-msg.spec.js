const helper = require('node-red-node-test-helper')
const feishuMsg = require('../dist/nodes/feishu-msg.js')

const chai = require('chai')
const chai_http = require('chai-http')
const expect = chai.expect;

chai.use(chai_http);

describe('feishu-msg-test', () => {

    afterEach(() => {
        helper.unload();
    })

    it('should be load', (done) => {
        const TEST_URL = '/listen';
        const TEST_PORT = 60000;

        const flow = [
            {
                id: 'n1',
                type: 'feishu-msg',
                url: TEST_URL,
                port: TEST_PORT
            }
        ]

        helper.load(feishuMsg, flow, () => {
            try {
                const n1 = helper.getNode('n1');
            } catch (err) {
                done(err);
                return;
            }
            done()
        })

    })


    it('should be receive text', (done) => {
        const TEST_URL = '/listen';
        const TEST_PORT = 60000;
        const TEST_TEXT = 'reaiou ou @hello jfoiwejojfoae'
        const TEST_without_at = 'reaiou ou jfoiwejojfoae'
        const TEST_open_id = ' 0-jioj j19j1j jpjpoqjpdjq@'

        const flow = [
            {
                id: 'n1',
                type: 'feishu-msg',
                url: TEST_URL,
                port: TEST_PORT,
                wires: [['n-helper']]
            },
            {
                id: 'n-helper',
                type: 'helper'
            }
        ]

        helper.load(feishuMsg, flow, () => {
            try {
                const n1 = helper.getNode('n1');
                const nHelper = helper.getNode('n-helper')

                nHelper.on('input', msg => {
                    try {
                        const payload = msg.payload;
                        const metaInfo = msg.feishu_meta_info;

                        expect(payload).to.deep.equal({
                            msg: {
                                text: TEST_without_at
                            }
                        })

                        expect(metaInfo).to.deep.equal({
                            target: {
                                chat: [],
                                user: [TEST_open_id]
                            },
                            chat: [],
                            user: [TEST_open_id]
                        })

                        done();

                    } catch (err) {
                        done(err);
                        return;
                    }
                })

                chai.request(`http://localhost:${TEST_PORT}`)
                    .post(TEST_URL)
                    .send(
                        {
                            "uuid": "41b5f371157e3d5341b38b20396e77e3",
                            "token": "2g7als3DgPW6Xp1xEpmcvgVhQG621bFY",//校验Token 
                            "ts": "1550038209.428520",  //时间戳 
                            "type": "event_callback",//事件回调此处固定为event_callback 
                            "event": {
                                "type": "message", // 事件类型 
                                "app_id": "cli_xxx",
                                "tenant_key": "xxx", //企业标识 
                                "root_id": "",
                                "parent_id": "",
                                "open_chat_id": "oc_5ce6d572455d361153b7cb51da133945",
                                "chat_type": "private",//私聊private，群聊group 
                                "msg_type": "text",    //消息类型 
                                "open_id": TEST_open_id,
                                "open_message_id": "om_36686ee62209da697d8775375d0c8e88",
                                "is_mention": false,
                                "text": TEST_TEXT,      // 消息文本 
                                "text_without_at_bot": TEST_without_at //消息内容，会过滤掉at你的机器人的内容 
                            }
                        })
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.be.have.status(200);
                    })

            } catch (err) {
                done(err);
                return;
            }
        })
    })


    it('should be receive image', (done) => {
        const TEST_URL = '/listen';
        const TEST_PORT = 60000;
        const TEST_IMAGE_KEY = 'jreao 12312l)21_@!+'
        const TEST_open_id = ' 0-jioj j19j1j jpjpoqjpdjq@'

        const flow = [
            {
                id: 'n1',
                type: 'feishu-msg',
                url: TEST_URL,
                port: TEST_PORT,
                wires: [['n-helper']]
            },
            {
                id: 'n-helper',
                type: 'helper'
            }
        ]

        helper.load(feishuMsg, flow, () => {
            try {
                const n1 = helper.getNode('n1');
                const nHelper = helper.getNode('n-helper')

                nHelper.on('input', msg => {
                    try {
                        const payload = msg.payload;
                        const metaInfo = msg.feishu_meta_info;

                        expect(payload).to.deep.equal({
                            msg: {
                                image_key: TEST_IMAGE_KEY
                            },
                        })

                        expect(metaInfo).to.deep.equal({
                            target: {
                                chat: [],
                                user: [TEST_open_id],
                            },
                            chat: [],
                            user: [TEST_open_id],
                        })

                        done();

                    } catch (err) {
                        done(err);
                        return;
                    }
                })

                chai.request(`http://localhost:${TEST_PORT}`)
                    .post(TEST_URL)
                    .send(
                        {
                            "uuid": "c58e17e9e84824a48e51a562cf969fb3",
                            "token": "2g7als3DgPW6Xp1xEpmcvgVhQG621bFY",
                            "ts": "1550038110.478493",
                            "type": "event_callback",
                            "event": {
                                "type": "message",
                                "app_id": "cli_xxx",
                                "tenant_key": "xxx", //企业标识 
                                "root_id": "",
                                "parent_id": "",
                                "open_chat_id": "oc_5ce6d572455d361153b7cb51da133945",
                                "chat_type": "private",
                                "msg_type": "image", //图片消息 
                                "image_height": "300",
                                "image_width": "300",
                                "open_id": TEST_open_id,
                                "open_message_id": "om_340057d660022bf141eb470859c6114c",
                                "is_mention": false,
                                "image_key": TEST_IMAGE_KEY, // image_key，获取图片内容请查https://open.feishu.cn/document/ukTMukTMukTM/uYzN5QjL2cTO04iN3kDN
                            }
                        })
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.be.have.status(200);
                    })

            } catch (err) {
                done(err);
                return;
            }
        })
    })

    it('should be receive group text', (done) => {
        const TEST_URL = '/listen';
        const TEST_PORT = 60000;
        const TEST_TEXT = 'reaiou ou @hello jfoiwejojfoae'
        const TEST_without_at = 'reaiou ou jfoiwejojfoae'
        const TEST_open_id = ' 0-jioj j19j1j jpjpoqjpdjq@'
        const TEST_open_chat_id = 'ureiwo12!@=)111'

        const flow = [
            {
                id: 'n1',
                type: 'feishu-msg',
                url: TEST_URL,
                port: TEST_PORT,
                wires: [['n-helper']]
            },
            {
                id: 'n-helper',
                type: 'helper'
            }
        ]

        helper.load(feishuMsg, flow, () => {
            try {
                const n1 = helper.getNode('n1');
                const nHelper = helper.getNode('n-helper')

                nHelper.on('input', msg => {
                    try {
                        const payload = msg.payload;

                        const metaInfo = msg.feishu_meta_info;

                        expect(payload).to.deep.equal({
                            msg: {
                                text: TEST_without_at
                            }
                        })

                        expect(metaInfo).to.deep.equal({
                            target: {
                                chat: [TEST_open_chat_id],
                                user: [],
                            },
                            chat: [TEST_open_chat_id],
                            user: [],
                        })

                        done();

                    } catch (err) {
                        done(err);
                        return;
                    }
                })

                chai.request(`http://localhost:${TEST_PORT}`)
                    .post(TEST_URL)
                    .send(
                        {
                            "uuid": "41b5f371157e3d5341b38b20396e77e3",
                            "token": "2g7als3DgPW6Xp1xEpmcvgVhQG621bFY",//校验Token 
                            "ts": "1550038209.428520",  //时间戳 
                            "type": "event_callback",//事件回调此处固定为event_callback 
                            "event": {
                                "type": "message", // 事件类型 
                                "app_id": "cli_xxx",
                                "tenant_key": "xxx", //企业标识 
                                "root_id": "",
                                "parent_id": "",
                                "open_chat_id": TEST_open_chat_id,
                                "chat_type": "group",//私聊private，群聊group 
                                "msg_type": "text",    //消息类型 
                                "open_id": TEST_open_id,
                                "open_message_id": "om_36686ee62209da697d8775375d0c8e88",
                                "is_mention": false,
                                "text": TEST_TEXT,      // 消息文本 
                                "text_without_at_bot": TEST_without_at //消息内容，会过滤掉at你的机器人的内容 
                            }
                        })
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.be.have.status(200);
                    })

            } catch (err) {
                done(err);
                return;
            }
        })
    })

    it('should be receive group image', (done) => {
        const TEST_URL = '/listen';
        const TEST_PORT = 60000;
        const TEST_IMAGE_KEY = '12090 !@ joi！@'
        const TEST_open_id = ' 0-jioj j19j1j jpjpoqjpdjq@'
        const TEST_open_chat_id = ' rea -102-31j2oiu-@'


        const flow = [
            {
                id: 'n1',
                type: 'feishu-msg',
                url: TEST_URL,
                port: TEST_PORT,
                wires: [['n-helper']]
            },
            {
                id: 'n-helper',
                type: 'helper'
            }
        ]

        helper.load(feishuMsg, flow, () => {
            try {
                const n1 = helper.getNode('n1');
                const nHelper = helper.getNode('n-helper')

                nHelper.on('input', msg => {
                    try {
                        const payload = msg.payload;

                        const metaInfo = msg.feishu_meta_info;

                        expect(payload).to.deep.equal({
                            msg: {
                                image_key: TEST_IMAGE_KEY
                            }
                        })

                        expect(metaInfo).to.deep.equal({
                            target: {
                                chat: [TEST_open_chat_id],
                                user: [],
                            },
                            chat: [TEST_open_chat_id],
                            user: [],
                        })

                        done();

                    } catch (err) {
                        done(err);
                        return;
                    }
                })

                chai.request(`http://localhost:${TEST_PORT}`)
                    .post(TEST_URL)
                    .send(
                        {
                            "uuid": "41b5f371157e3d5341b38b20396e77e3",
                            "token": "2g7als3DgPW6Xp1xEpmcvgVhQG621bFY",//校验Token 
                            "ts": "1550038209.428520",  //时间戳 
                            "type": "event_callback",//事件回调此处固定为event_callback 
                            "event": {
                                "type": "message", // 事件类型 
                                "app_id": "cli_xxx",
                                "tenant_key": "xxx", //企业标识 
                                "root_id": "",
                                "parent_id": "",
                                "open_chat_id": TEST_open_chat_id,
                                "chat_type": "group",//私聊private，群聊group 
                                "msg_type": "image",    //消息类型 
                                "open_id": TEST_open_id,
                                "open_message_id": "om_36686ee62209da697d8775375d0c8e88",
                                "is_mention": false,
                                "image_key": TEST_IMAGE_KEY
                            }
                        })
                    .end((err, res) => {
                        expect(err).to.be.null;
                        expect(res).to.be.have.status(200);
                    })

            } catch (err) {
                done(err);
                return;
            }
        })
    })
})