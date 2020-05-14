const helper = require('node-red-node-test-helper')
const feishuConfigNode = require('../dist/nodes/feishu-config.js')
const feishuUploadImageNode = require('../dist/nodes/feishu-upload-image.js')
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

describe('feishu-upload-image-test', () => {


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
        
        const image_scope = nock('https://open.feishu.cn')
                            .post('/open-apis/image/v4/put')
                            .reply(function(uri, body) {
                                const headers = this.req.headers;
                                expect(headers).to.have.property('Authorization').to.equal(`Bearer ${TEST_TENANT}`)

                                const bodyAsStr = hexToString(body);

                                const ret = parse(this.req.headers, bodyAsStr, true)

                                // console.log('ret:', ret)

                                return [
                                    200,
                                    JSON.stringify({
                                        code: 0,
                                        msg: 'ok',
                                        data: {
                                            image_key: TEST_IMAGE_KEY
                                        } 
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
                type: 'feishu-upload-image',
                name: 'upload-image',
                config: 'n1'
            }

        ]

        helper.load([feishuConfigNode, feishuUploadImageNode], flow, async () => {
            try {
                const n1 = helper.getNode('n1')
                await delay(50);
                expect(n1).to.have.property('tenantToken').to.equal(TEST_TENANT);

                const n2 = helper.getNode('n2')

                expect(n2).to.have.property('name', 'upload-image')

                done();
            } catch (err) {
                done(err)
                return;
            }
        })

    })

    it('should upload image', (done) => {
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
        
        const image_scope = nock('https://open.feishu.cn')
                            .post('/open-apis/image/v4/put')
                            .reply(function(uri, body) {
                                const headers = this.req.headers;
                                expect(headers).to.have.property('authorization').to.equal(`Bearer ${TEST_TENANT}`)
                                // console.log('headers', headers)

                                const bodyAsStr = hexToString(body);

                                const form = parse(this.req.headers, bodyAsStr, true);
                                // console.log('parsed form', form);
                                expect(form).to.have.property('image').to.have.property('content');

                                expect(form.image.content.equals(TEST_BUFFER)).true;

                                return [
                                    200,
                                    JSON.stringify({
                                        code: 0,
                                        msg: 'ok',
                                        data: {
                                            image_key: TEST_IMAGE_KEY
                                        } 
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
                type: 'feishu-upload-image',
                name: 'upload-image',
                config: 'n1',
                wires: [['n-helper']]
            },
            {
                id: 'n-helper',
                type: 'helper'
            }
        ]

        helper.load([feishuConfigNode, feishuUploadImageNode], flow, async () => {
            try {
                const n1 = helper.getNode('n1')
                await delay(50);
                expect(n1).to.have.property('tenantToken').to.equal(TEST_TENANT);

                const n2 = helper.getNode('n2')

                expect(n2).to.have.property('name', 'upload-image')

                n2.receive({
                    payload: TEST_BUFFER 
                })

                const nHelper = helper.getNode('n-helper')

                nHelper.on('input', msg => {
                        try {
                            expect(msg).to.have.property('payload').to.equal(TEST_IMAGE_KEY);
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