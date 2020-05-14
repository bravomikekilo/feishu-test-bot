const helper = require('node-red-node-test-helper')
const feishuConfigNode = require('../dist/nodes/feishu-config.js')
const feishuFetchImageNode = require('../dist/nodes/feishu-fetch-image.js')
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

describe('feishu-fetch-image-test', () => {


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
                type: 'feishu-fetch-image',
                name: 'fetch-image',
                config: 'n1'
            }

        ]

        helper.load([feishuConfigNode, feishuFetchImageNode], flow, async () => {
            try {
                const n1 = helper.getNode('n1')
                await delay(50);
                expect(n1).to.have.property('tenantToken').to.equal(TEST_TENANT);

                const n2 = helper.getNode('n2')

                expect(n2).to.have.property('name', 'fetch-image')

                done();
            } catch (err) {
                done(err)
                return;
            }
        })

    })

    it('should fetch image', (done) => {
        const TEST_APPID = 'cvjfaioe '
        const TEST_APPSECRET = 'o uoj iowejoijohu10293jio23@ '
        const TEST_TENANT = 'a iojfeoaj  9023  oj1- '
        const TEST_IMAGE_KEY = '2930909@ijio ojo'
        const TEST_BUFFER = fs.readFileSync('./test.png')

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
        
        const image_scope = nock('https://open.feishu.cn/')
                            .get('/open-apis/image/v4/get?image_key=2930909@ijio%20ojo')
                            .reply(function(uri, body) {
                                const headers = this.req.headers;
                                console.log('headers', headers)
                                expect(headers).to.have.property('authorization').to.equal(`Bearer ${TEST_TENANT}`)
                                return [
                                    200,
                                    TEST_BUFFER
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
                type: 'feishu-fetch-image',
                name: 'fetch-image',
                config: 'n1',
                wires: [['n-helper']]
            },
            {
                id: 'n-helper',
                type: 'helper'
            }
        ]

        helper.load([feishuConfigNode, feishuFetchImageNode], flow, async () => {
            try {
                const n1 = helper.getNode('n1')
                await delay(500);
                expect(n1).to.have.property('tenantToken').to.equal(TEST_TENANT);

                const n2 = helper.getNode('n2')

                expect(n2).to.have.property('name', 'fetch-image')

                n2.receive({
                    payload: TEST_IMAGE_KEY 
                })

                const nHelper = helper.getNode('n-helper')

                nHelper.on('input', msg => {
                        try {
                            expect(msg).to.have.property('payload');
                            expect(msg.payload.equals(TEST_BUFFER));
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