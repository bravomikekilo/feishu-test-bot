const helper = require('node-red-node-test-helper')
const feishuConfigNode = require('../dist/nodes/feishu-config.js')
const feishuSendNode = require('../dist/nodes/feishu-send.js')
const {delay} = require('./delay')
const {parse, hexToString} = require('./parse-form')
const nock = require('nock')
const buffer = require('buffer')
const fs = require('fs')

const {TenantURL} = require('../dist/io/api')

const chai = require('chai')
const chai_http = require('chai-http')
const expect = chai.expect



chai.use(chai_http)

describe('feishu-send-test', () => {


    afterEach(() => {
        helper.unload();
        nock.cleanAll();
    })

    it('should be load', (done) => {
        const TEST_APPID = 'cvjfaioe '
        const TEST_APPSECRET = 'o uoj iowejoijohu10293jio23@ '
        const TEST_TENANT = 'a iojfeoaj  9023  oj1- '
        const TEST_IMAGE_KEY = '2930909@ijio ojo'

        const scope = nock('https://open.feishu.cn/')
                        .persist()
                        .post('/open-apis/auth/v3/tenant_access_token/internal/')
                        .reply(function(uri, body) {
                            let payload = JSON.parse(body);
                            expect(payload).to.have.property('app_id').to.equal(TEST_APPID);
                            expect(payload).to.have.property('app_secret').to.equal(TEST_APPSECRET);
                            return [
                                200,
                                JSON.stringify({
                                    code: 0,
                                    msg: "ok",
                                    tenant_access_token: TEST_TENANT,
                                    expire: 3000
                                })
                            ]
                        })

        const flow = [
            {
                id: 'n1',
                type: 'feishu-config',
                name: 'test-config',
                appID: TEST_APPID,
                appSecret: TEST_APPSECRET
            },
            {
                id: 'n2',
                type: 'feishu-send',
                name: 'bot-send',
                config: 'n1'
            }

        ]

        helper.load([feishuConfigNode, feishuSendNode], flow, async () => {
            try {
                const n1 = helper.getNode('n1')
                await delay(50);
                expect(n1).to.have.property('tenantToken').to.equal(TEST_TENANT);

                const n2 = helper.getNode('n2')

                expect(n2).to.have.property('name', 'bot-send')

                done();
            } catch (err) {
                done(err)
                return;
            }
        })

    })

    it('should send groups text', (done) => {
        const TEST_APPID = 'cvjfaioe '
        const TEST_APPSECRET = 'o uoj iowejoijohu10293jio23@ '
        const TEST_TENANT = 'a iojfeoaj  9023  oj1- '
        const TEST_GROUP_LIST = ['hello', 'world', ' 10920 239301 KLSDJFwio@']

        const TEST_TEXT = 're oia 1 10L'

        const scope = nock('https://open.feishu.cn/')
                        .persist()
                        .post('/open-apis/auth/v3/tenant_access_token/internal/')
                        .reply(function(uri, body) {
                            let payload = JSON.parse(body);
                            expect(payload).to.have.property('app_id').to.equal(TEST_APPID);
                            expect(payload).to.have.property('app_secret').to.equal(TEST_APPSECRET);
                            return [
                                200,
                                JSON.stringify({
                                    code: 0,
                                    msg: "ok",
                                    tenant_access_token: TEST_TENANT,
                                    expire: 3000
                                })
                            ]
                        })

        const received = []

        const group_scope = nock('https://open.feishu.cn/')
                            .persist()
                            .post('/open-apis/message/v4/send/')
                            .reply(function(uri, body) {
                                const headers = this.req.headers;
                                console.log('headers', headers)
                                expect(headers).to.have.property('authorization').to.equal(`Bearer ${TEST_TENANT}`)

                                received.push(body);

                                return [
                                    200,
                                    {
                                        code: 0,
                                        msg: "ok",
                                        data: {
                                            message_id: 'test message id'
                                        }
                                    }
                                ]
                            })

        const flow = [
            {
                id: 'n1',
                type: 'feishu-config',
                name: 'test-config',
                appID: TEST_APPID,
                appSecret: TEST_APPSECRET
            },
            {
                id: 'n2',
                type: 'feishu-send',
                name: 'send',
                config: 'n1',
                wires: [['n-helper']]
            },
        ]

        helper.load([feishuConfigNode, feishuSendNode], flow, async () => {
            try {
                const n1 = helper.getNode('n1')
                await delay(500);
                expect(n1).to.have.property('tenantToken').to.equal(TEST_TENANT);

                const n2 = helper.getNode('n2')

                expect(n2).to.have.property('name', 'send')

                n2.receive({
                    payload: {
                        msg: {
                            text: TEST_TEXT
                        }
                    },
                    feishu_meta_info: {
                        target: {
                            chat: TEST_GROUP_LIST,
                            user: []
                        },
                        chat: [],
                        user: []
                    }
                })

                await delay(500);

                expect(received).lengthOf(TEST_GROUP_LIST.length)


                for(let i = 0; i < TEST_GROUP_LIST.length; ++i) {

                    const test_group_id = TEST_GROUP_LIST[i];
                    const send = received[i];

                    expect(send.chat_id === test_group_id).true
                    expect(send.content).to.deep.equal({
                        text: TEST_TEXT
                    })
                }

                done();

            } catch (err) {
                done(err)
                return;
            }
        })

    })

    it('should send groups image', (done) => {
        const TEST_APPID = 'cvjfaioe '
        const TEST_APPSECRET = 'o uoj iowejoijohu10293jio23@ '
        const TEST_TENANT = 'a iojfeoaj  9023  oj1- '
        const TEST_GROUP_LIST = ['hello', 'world', ' 10920 239301 KLSDJFwio@']

        const TEST_IMAGE_KEY = 're oia 1 10L'

        const scope = nock('https://open.feishu.cn/')
                        .persist()
                        .post('/open-apis/auth/v3/tenant_access_token/internal/')
                        .reply(function(uri, body) {
                            let payload = JSON.parse(body);
                            expect(payload).to.have.property('app_id').to.equal(TEST_APPID);
                            expect(payload).to.have.property('app_secret').to.equal(TEST_APPSECRET);
                            return [
                                200,
                                JSON.stringify({
                                    code: 0,
                                    msg: "ok",
                                    tenant_access_token: TEST_TENANT,
                                    expire: 3000
                                })
                            ]
                        })

        const received = []

        const group_scope = nock('https://open.feishu.cn/')
                            .persist()
                            .post('/open-apis/message/v4/send/')
                            .reply(function(uri, body) {
                                const headers = this.req.headers;
                                console.log('headers', headers)
                                expect(headers).to.have.property('authorization').to.equal(`Bearer ${TEST_TENANT}`)

                                received.push(body);

                                return [
                                    200,
                                    {
                                        code: 0,
                                        msg: "ok",
                                        data: {
                                            message_id: 'test message id'
                                        }
                                    }
                                ]
                            })

        const flow = [
            {
                id: 'n1',
                type: 'feishu-config',
                name: 'test-config',
                appID: TEST_APPID,
                appSecret: TEST_APPSECRET
            },
            {
                id: 'n2',
                type: 'feishu-send',
                name: 'send',
                config: 'n1',
                wires: [['n-helper']]
            },
        ]

        helper.load([feishuConfigNode, feishuSendNode], flow, async () => {
            try {
                const n1 = helper.getNode('n1')
                await delay(500);
                expect(n1).to.have.property('tenantToken').to.equal(TEST_TENANT);

                const n2 = helper.getNode('n2')

                expect(n2).to.have.property('name', 'send')

                n2.receive({
                    payload: {
                        msg: {
                            image_key: TEST_IMAGE_KEY
                        }
                    },
                    feishu_meta_info: {
                        target: {
                            chat: TEST_GROUP_LIST,
                            user: []
                        },
                        chat: [],
                        user: []
                    }
                })

                await delay(500);

                expect(received).lengthOf(TEST_GROUP_LIST.length)


                for(let i = 0; i < TEST_GROUP_LIST.length; ++i) {

                    const test_group_id = TEST_GROUP_LIST[i];
                    const send = received[i];

                    expect(send.chat_id === test_group_id).true
                    expect(send.msg_type === 'image').true
                    expect(send.content).to.deep.equal({
                        image_key: TEST_IMAGE_KEY
                    })
                }

                done();

            } catch (err) {
                done(err)
                return;
            }
        })

    })

    it('should send users text', (done) => {
        const TEST_APPID = 'cvjfaioe '
        const TEST_APPSECRET = 'o uoj iowejoijohu10293jio23@ '
        const TEST_TENANT = 'a iojfeoaj  9023  oj1- '
        const TEST_USER_LIST = ['hello', 'world', ' 10920 239301 KLSDJFwio@']

        const TEST_TEXT = 're oia 1 10L'

        const scope = nock('https://open.feishu.cn/')
                        .persist()
                        .post('/open-apis/auth/v3/tenant_access_token/internal/')
                        .reply(function(uri, body) {
                            let payload = JSON.parse(body);
                            expect(payload).to.have.property('app_id').to.equal(TEST_APPID);
                            expect(payload).to.have.property('app_secret').to.equal(TEST_APPSECRET);
                            return [
                                200,
                                JSON.stringify({
                                    code: 0,
                                    msg: "ok",
                                    tenant_access_token: TEST_TENANT,
                                    expire: 3000
                                })
                            ]
                        })

        const received = []

        const group_scope = nock('https://open.feishu.cn/')
                            .persist()
                            .post('/open-apis/message/v4/send/')
                            .reply(function(uri, body) {
                                const headers = this.req.headers;
                                console.log('headers', headers)
                                expect(headers).to.have.property('authorization').to.equal(`Bearer ${TEST_TENANT}`)

                                received.push(body);

                                return [
                                    200,
                                    {
                                        code: 0,
                                        msg: "ok",
                                        data: {
                                            message_id: 'test message id'
                                        }
                                    }
                                ]
                            })

        const flow = [
            {
                id: 'n1',
                type: 'feishu-config',
                name: 'test-config',
                appID: TEST_APPID,
                appSecret: TEST_APPSECRET
            },
            {
                id: 'n2',
                type: 'feishu-send',
                name: 'send',
                config: 'n1',
                wires: [['n-helper']]
            },
        ]

        helper.load([feishuConfigNode, feishuSendNode], flow, async () => {
            try {
                const n1 = helper.getNode('n1')
                await delay(500);
                expect(n1).to.have.property('tenantToken').to.equal(TEST_TENANT);

                const n2 = helper.getNode('n2')

                expect(n2).to.have.property('name', 'send')

                n2.receive({
                    payload: {
                        msg: {
                            text: TEST_TEXT
                        }
                    },
                    feishu_meta_info: {
                        target: {
                            chat: [],
                            user: TEST_USER_LIST
                        },
                        chat: [],
                        user: []
                    }
                })

                await delay(500);

                expect(received).lengthOf(TEST_USER_LIST.length)


                for(let i = 0; i < TEST_USER_LIST.length; ++i) {

                    const test_group_id = TEST_USER_LIST[i];
                    const send = received[i];

                    expect(send.open_id === test_group_id).true
                    expect(send.msg_type === 'text').true
                    expect(send.content).to.deep.equal({
                        text: TEST_TEXT
                    })
                }

                done();

            } catch (err) {
                done(err)
                return;
            }
        })

    })

    it('should send users image', (done) => {
        const TEST_APPID = 'cvjfaioe '
        const TEST_APPSECRET = 'o uoj iowejoijohu10293jio23@ '
        const TEST_TENANT = 'a iojfeoaj  9023  oj1- '
        const TEST_USER_LIST = ['hello', 'world', ' 10920 239301 KLSDJFwio@']

        const TEST_IMAGE_KEY = 're oia 1 10L'

        const scope = nock('https://open.feishu.cn/')
                        .persist()
                        .post('/open-apis/auth/v3/tenant_access_token/internal/')
                        .reply(function(uri, body) {
                            let payload = JSON.parse(body);
                            expect(payload).to.have.property('app_id').to.equal(TEST_APPID);
                            expect(payload).to.have.property('app_secret').to.equal(TEST_APPSECRET);
                            return [
                                200,
                                JSON.stringify({
                                    code: 0,
                                    msg: "ok",
                                    tenant_access_token: TEST_TENANT,
                                    expire: 3000
                                })
                            ]
                        })

        const received = []

        const group_scope = nock('https://open.feishu.cn/')
                            .persist()
                            .post('/open-apis/message/v4/send/')
                            .reply(function(uri, body) {
                                const headers = this.req.headers;
                                // console.log('headers', headers)
                                expect(headers).to.have.property('authorization').to.equal(`Bearer ${TEST_TENANT}`)

                                received.push(body);

                                return [
                                    200,
                                    {
                                        code: 0,
                                        msg: "ok",
                                        data: {
                                            message_id: 'test message id'
                                        }
                                    }
                                ]
                            })

        const flow = [
            {
                id: 'n1',
                type: 'feishu-config',
                name: 'test-config',
                appID: TEST_APPID,
                appSecret: TEST_APPSECRET
            },
            {
                id: 'n2',
                type: 'feishu-send',
                name: 'send',
                config: 'n1',
                wires: [['n-helper']]
            },
        ]

        helper.load([feishuConfigNode, feishuSendNode], flow, async () => {
            try {
                const n1 = helper.getNode('n1')
                await delay(500);
                expect(n1).to.have.property('tenantToken').to.equal(TEST_TENANT);

                const n2 = helper.getNode('n2')

                expect(n2).to.have.property('name', 'send')

                n2.receive({
                    payload: {
                        msg: {
                            image_key: TEST_IMAGE_KEY
                        }
                    },
                    feishu_meta_info: {
                        target: {
                            chat: [],
                            user: TEST_USER_LIST
                        },
                        chat: [],
                        user: []
                    }
                })

                await delay(500);

                expect(received).lengthOf(TEST_USER_LIST.length)


                for(let i = 0; i < TEST_USER_LIST.length; ++i) {

                    const test_group_id = TEST_USER_LIST[i];
                    const send = received[i];

                    expect(send.open_id === test_group_id).true
                    expect(send.msg_type === 'image').true
                    expect(send.content).to.deep.equal({
                        image_key: TEST_IMAGE_KEY
                    })
                }

                done();

            } catch (err) {
                done(err)
                return;
            }
        })

    })
})


