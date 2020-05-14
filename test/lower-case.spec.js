const helper = require('node-red-node-test-helper')
const lowerCaseNode = require('../dist/nodes/lower-case.js')

describe('lower-case-test', () => {

    afterEach(() => {
        helper.unload();
    })

    it('should be loaded', (done) => {
        const flow = [
            {
                id: 'n1',
                type: 'lower-case',
                name: 'test name',
                prefix: ''
            },
            {
                id: 'n-helper',
                type: 'helper'
            }
        ]

        helper.load(lowerCaseNode, flow, () => {
            const n1 = helper.getNode('n1');
            n1.should.have.property('name', 'test name')
            done();
        })
    })


    it('should make payload upper case', (done) => {

        const TEST_PREFIX = 'P'
        const flow = [
            {
                id: 'n1',
                type: 'lower-case',
                name: 'test name',
                prefix: TEST_PREFIX,
                wires: [["n-helper"]]
            },
            {
                id: 'n-helper',
                type: 'helper'
            }
        ]

        helper.load(lowerCaseNode, flow, () => {
            const n1 = helper.getNode('n1');
            const nHelper = helper.getNode('n-helper');

            n1.should.have.property('name', 'test name')
            nHelper.on('input', msg => {
                try {
                    msg.should.have.property('payload', 'PUPPERCASE')
                    done();
                } catch (err) {
                    done(err);
                }
            })
            n1.receive({payload: 'UpperCase'})
        })
    })



}
)