const helper = require('node-red-node-test-helper')
const feishuConfig = require('../dist/nodes/feishu-config.js')
const {delay} = require('./delay')
const nock = require('nock')

const {TenantURL} = require('../dist/io/api')

const chai = require('chai')
const chai_http = require('chai-http')
const expect = chai.expect



chai.use(chai_http)

describe('feishu-config-test', () => {


    afterEach(() => {
        helper.unload();
    })

    it('should be load', (done) => {
        const TEST_APPID = 'cvjfaioe '
        const TEST_APPSECRET = 'o uoj iowejoijohu10293jio23@ '
        const TEST_TENANT = 'a iojfeoaj  9023  oj1- '

        const scope = nock('https://open.feishu.cn/')
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
            }
        ]

        helper.load(feishuConfig, flow, async () => {
            try {
                const n1 = helper.getNode('n1')
                await delay(50);
                expect(n1).to.have.property('tenantToken').to.equal(TEST_TENANT);
            } catch (err) {
                done(err)
                return;
            }
            done()
        })

    })


}
)