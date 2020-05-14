const helper = require('node-red-node-test-helper')
const readImageNode = require('../dist/nodes/read-image.js')
const fs = require('fs')

describe('read-image-test', () => {

    afterEach(() => {
        helper.unload();
    })

    it('should be loaded', (done) => {
        const flow = [
            {
                id: 'n1',
                type: 'read-image',
                name: 'test name',
                path: 'test.png'
            },
        ]

        helper.load(readImageNode, flow, () => {
            const n1 = helper.getNode('n1');
            try {
                n1.should.have.property('path', 'test.png')
                n1.should.have.property('name', 'test name')
            } catch (err) {
                done(err);
                return;
            }
            
            done();
        })
    })

    it('should load image right', (done) => {

        const TEST_FILE = 'test.png'
        const cwd = process.cwd();
        console.log(cwd);

        const fileBuffer = fs.readFileSync(TEST_FILE);

        const flow = [
            {
                id: 'n1',
                type: 'read-image',
                name: 'test name',
                path: TEST_FILE,
                wires: [['n-helper']]
            },
            {
                id: 'n-helper',
                type: 'helper'
            }
        ]

        helper.load(readImageNode, flow, () => {
            const n1 = helper.getNode('n1');
            const nHelper = helper.getNode('n-helper');

            n1.should.have.property('name', 'test name');
            
            nHelper.on('input', msg => {
                try {
                    msg.should.have.property('payload', fileBuffer);
                    done();
                } catch (err) {
                    done(err);
                }
            })
            n1.receive({payload: 'p'})
        })


    })




}
)