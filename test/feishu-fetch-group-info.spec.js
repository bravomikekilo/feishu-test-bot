

const helper = require('node-red-node-test-helper')
const feishuConfigNode = require('../dist/nodes/feishu-config.js')
const feishuFetchGroupInfoNode = require('../dist/nodes/feishu-fetch-group-info.js')
const { delay } = require('./delay')
const { parse, hexToString } = require('./parse-form')
const nock = require('nock')
const buffer = require('buffer')
const fs = require('fs')
const querystring = require('querystring')
const url = require('url')

const { TenantURL } = require('../dist/io/api')

const chai = require('chai')
const chai_http = require('chai-http')
const expect = chai.expect



chai.use(chai_http)

describe('feishu-fetch-group-info-test', () => {


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
            .reply(function (uri, body) {
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
                type: 'feishu-fetch-group-info',
                name: 'fetch-group',
                config: 'n1'
            }

        ]

        helper.load([feishuConfigNode, feishuFetchGroupInfoNode], flow, async () => {
            try {
                const n1 = helper.getNode('n1')
                await delay(50);
                expect(n1).to.have.property('tenantToken').to.equal(TEST_TENANT);

                const n2 = helper.getNode('n2')

                expect(n2).to.have.property('name', 'fetch-group')

                done();
            } catch (err) {
                done(err)
                return;
            }
        })

    })

    it('should fetch group infos', (done) => {
        const TEST_APPID = 'cvjfaioe '
        const TEST_APPSECRET = 'o uoj iowejoijohu10293jio23@ '
        const TEST_TENANT = 'a iojfeoaj  9023  oj1- '
        const TEST_GROUP_LIST = ['hello', 'world', '_10920_239301_KLSDJFwio@']
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
        const TEST_GROUP_INFOS = [
            {
                "avatar": "http://p3.pstatp.com/origin/78c0000676df676a7f6e",
                "chat_id": TEST_GROUP_LIST[0],
                "description": "group description",
                "i18n_names": {
                    "en_us": "English",
                    "ja_jp": "日本語",
                    "zh_cn": "中文"
                },
                "members": [
                    {
                        "open_id": "ou_6edde2deccabb76c12b30f0345f19aa1",
                        "user_id": "8e17d887"
                    },
                    {
                        "open_id": "ou_194911f90c43ec42d1ba0e93f22b8fb1",
                        "user_id": "ca51d83b"
                    },
                ],
                "name": "test group 1",
                "type": "group",
                "owner_open_id": "ou_6edde2deccabb76c12b30f0345f19aa1",
                "owner_user_id": "8e17d887"
            },
            {
                "avatar": "http://p3.pstatp.com/origin/oe 2391021 @000676df676a7f6e",
                "chat_id": TEST_GROUP_LIST[1],
                "description": "grre dis 2 iojfioaw ioji1",
                "i18n_names": {
                    "en_us": "English",
                    "ja_jp": "日本語",
                    "zh_cn": "中文"
                },
                "members": [
                    {
                        "open_id": "ou_194911f90c43ec42d1ba0e93f22b8fb1",
                        "user_id": "ca51d83b"
                    },
                    {
                        "open_id": "ou_b6671e895da5ef8f84ec8831c26348bd",
                        "user_id": "24e1cbff"
                    }
                ],
                "name": "test group 2 i",
                "type": "group",
                "owner_open_id": "ou_i2w3139-1dl",
                "owner_user_id": "a- 1- 1323"
            },
            {
                "avatar": "http://p3.pstatp.com/origin/oe 2391021 @000676df676a7f6e",
                "chat_id": TEST_GROUP_LIST[2],
                "description": "grre dis 2 iojfioaw ioji1",
                "i18n_names": {
                    "en_us": "English",
                    "ja_jp": "日本語",
                    "zh_cn": "中文"
                },
                "members": [
                    {
                        "open_id": "ou_194911f90c43ec42d1ba0e93f22b8fb1",
                        "user_id": "ca51d83b"
                    },
                    {
                        "open_id": "ou_b6671e895da5ef8f84ec8831c26348bd",
                        "user_id": "24e1cbff"
                    }
                ],
                "name": "test group 2 i",
                "type": "group",
                "owner_open_id": "ou_i2w3139-1dl",
                "owner_user_id": "a- 1- 1323"
            },


        ]

        const scope = nock('https://open.feishu.cn/')
            .persist()
            .post('/open-apis/auth/v3/tenant_access_token/internal/')
            .reply(function (uri, body) {
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
            .get('/open-apis/chat/v4/info')
            .query(q => true)
            .reply(function (uri, body) {
                const headers = this.req.headers;
                console.log('uri', uri)
                console.log('headers', headers)

                const query =  querystring.parse(url.parse(uri).query);
                expect(query).to.have.property('chat_id')
                expect(headers).to.have.property('authorization').to.equal(`Bearer ${TEST_TENANT}`)

                const chat_id = query.chat_id;
                
                const out = TEST_GROUP_INFOS.find((info) => info.chat_id == chat_id)
                expect(out !== undefined).true

                return [
                    200,
                    {
                        code: 0,
                        msg: "ok",
                        data: out
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
                type: 'feishu-fetch-group-info',
                name: 'fetch-group-info',
                config: 'n1',
                wires: [['n-helper']]
            },
            {
                id: 'n-helper',
                type: 'helper'
            }
        ]

        helper.load([feishuConfigNode, feishuFetchGroupInfoNode], flow, async () => {
            try {
                const n1 = helper.getNode('n1')
                await delay(500);
                expect(n1).to.have.property('tenantToken').to.equal(TEST_TENANT);

                const n2 = helper.getNode('n2')

                expect(n2).to.have.property('name', 'fetch-group-info')

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
                        chat: TEST_GROUP_LIST,
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
                            chat: TEST_GROUP_INFOS,
                            user: [],
                        });
                        done()
                    } catch (err) {
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