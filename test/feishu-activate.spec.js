const helper = require('node-red-node-test-helper')
const feishuActivate = require('../dist/nodes/feishu-activate.js')

const chai = require('chai')
const chai_http = require('chai-http')
const expect = chai.expect;

chai.use(chai_http);

describe('feishu-activate-test', () => {

    afterEach(() => {
        helper.unload();
    })

    it('should able to activate feishu api', (done) => {

        const TEST_URL = '/activate'
        const TEST_PORT = 60000;
        const TEST_CHALLENGE = 'fjaioefn afej@ 1239'
        const TEST_TOKEN = 'fajiofjo 09j 90 n014'

        const flow = [
            {
                id: 'n1',
                type: 'feishu-activate',
                url: TEST_URL,
                port: TEST_PORT
            },
            {
                id: 'n-helper',
                type: 'helper'
            }
        ]

        helper.load(feishuActivate, flow, () => {
            const n1 = helper.getNode('n1');
            
            chai.request(`http://localhost:${TEST_PORT}`)
                .post(TEST_URL)
                .send({
                    challenge: TEST_CHALLENGE, 
                    token: TEST_TOKEN,
                    type: "url_verification"
                })
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.have.property('challenge').to.equal(TEST_CHALLENGE);
                    console.log('response:', res.body)
                    done();
                })

        })
    })


}
)