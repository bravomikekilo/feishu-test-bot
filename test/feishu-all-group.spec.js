const helper = require('node-red-node-test-helper')
const feishuConfigNode = require('../dist/nodes/feishu-config.js')
const feishuAllGroupNode = require('../dist/nodes/feishu-all-group.js')
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

describe('feishu-all-group-test', () => {


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
                type: 'feishu-all-group',
                name: 'all-group',
                config: 'n1'
            }

        ]

        helper.load([feishuConfigNode, feishuAllGroupNode], flow, async () => {
            try {
                const n1 = helper.getNode('n1')
                await delay(50);
                expect(n1).to.have.property('tenantToken').to.equal(TEST_TENANT);

                const n2 = helper.getNode('n2')

                expect(n2).to.have.property('name', 'all-group')

                done();
            } catch (err) {
                done(err)
                return;
            }
        })

    })

    it('should fetch groups', (done) => {
        const TEST_APPID = 'cvjfaioe '
        const TEST_APPSECRET = 'o uoj iowejoijohu10293jio23@ '
        const TEST_TENANT = 'a iojfeoaj  9023  oj1- '
        const TEST_BUFFER = fs.readFileSync('./test.png')
        const TEST_GROUP_LIST = ['hello', 'world', ' 10920 239301 KLSDJFwio@']
        const TEST_GROUP_RESPONSE = {
            has_more: false,
            groups: [
                {
                    avatar: '12u3o123',
                    description: '3901j ooasja@',
                    chat_id: TEST_GROUP_LIST[0],
                    name: 'test group 1',
                    owner_open_id: 'owner open 1',
                },
                {
                    avatar: '12u3o123',
                    description: '3901j ooasja@',
                    chat_id: TEST_GROUP_LIST[1],
                    name: 'test group 1',
                    owner_open_id: 'owner open 1',
                },
                {
                    avatar: '12u3o123',
                    description: '3901j ooasja@',
                    chat_id: TEST_GROUP_LIST[2],
                    name: 'test group 1',
                    owner_open_id: 'owner open 1',
                },
            ]
        }

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
        
        const group_scope = nock('https://open.feishu.cn/')
                            .get('/open-apis/chat/v4/list')
                            .reply(function(uri, body) {
                                const headers = this.req.headers;
                                console.log('headers', headers)
                                expect(headers).to.have.property('authorization').to.equal(`Bearer ${TEST_TENANT}`)

                                return [
                                    200,
                                    {
                                        code: 0,
                                        msg: "ok",
                                        data: TEST_GROUP_RESPONSE
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
                type: 'feishu-all-group',
                name: 'fetch-image',
                config: 'n1',
                wires: [['n-helper']]
            },
            {
                id: 'n-helper',
                type: 'helper'
            }
        ]

        helper.load([feishuConfigNode, feishuAllGroupNode], flow, async () => {
            try {
                const n1 = helper.getNode('n1')
                await delay(500);
                expect(n1).to.have.property('tenantToken').to.equal(TEST_TENANT);

                const n2 = helper.getNode('n2')

                expect(n2).to.have.property('name', 'fetch-image')

                n2.receive({
                    payload: {
                        msg: {
                            text: 'hello'
                        }
                    },
                    feishu_meta_info: {
                        target: {
                            chat: [],
                            user: []
                        },
                        chat: [],
                        user: []
                    }
                })

                const nHelper = helper.getNode('n-helper')

                nHelper.on('input', msg => {
                        try {
                            expect(msg).to.have.property('payload').to.deep.equal({
                                msg: {
                                    text: 'hello'
                                }
                            });

                            expect(msg).to.have.property('feishu_meta_info').to.deep.equal({
                                target: {
                                    chat: [],
                                    user: [],
                                },
                                chat: TEST_GROUP_LIST,
                                user: [],
                            });
                            done()
                        } catch(err) {
                            done(err)
                        }
                })

            } catch (err) {
                done(err)
                return;
            }
        })

    })


})