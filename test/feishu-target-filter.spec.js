var helper = require("node-red-node-test-helper");
var feishuTargetFilterNodes = require("../dist/nodes/feishu-target-filter.js");

describe('feishu-target-remove Node', function () {
    var testNodeConfig;
    var testInput;

    function testTemplate(test) {
        it(test.name, function (done) {
            if(test.preprocess) {
                test.preprocess();
            }
            flow = [testNodeConfig, { id: "n2", type: "helper" }];
            helper.load(feishuTargetFilterNodes, flow, function () {
                try {
                    var n1 = helper.getNode("n1");
                    var n2 = helper.getNode("n2");
                    if(test.afterCreateValidate) {
                        test.afterCreateValidate(n1);
                    }
                    n2.on("input", function (msg) {
                        try {
                            test.validate(msg, n1);
                            done();
                        } catch (error) {
                            done(error);
                        }
                    });
                    n1.receive(testInput);
                } catch(error) {
                    done(error);
                }
            });
        });
    }

    beforeEach(function () {
        testNodeConfig = {
            id: "n1",
            type: "feishu-target-remove",
            wires: [["n2"]],
            name: ""
        };
    });

    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{ id: "n1", type: "feishu-target-remove", name: "test name" }];
        helper.load(feishuTargetFilterNodes, flow, function () {
            try {
                var n1 = helper.getNode("n1");
                n1.should.have.property('name', 'test name');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    describe('initialization', function () {
        beforeEach(function () {
            testNodeConfig = {
                ...testNodeConfig,
                ...{
                    evalPropertyClass: "group",
                    evalGroupProperty: "open_chat_id",
                    evalUserProperty: "open_user_id",
                    filterMode: "regex",
                    filterValueList: [""],
                    filterRegexPattern: "",
                    filterRegexIgnoreCase: false
                }
            };
            testInput = {
                payload: "test_message"
            };
        });

        var outputValidateFunction = function(msg) {
            msg.feishu_meta_info.should.deepEqual({
                target: {
                    chat: [],
                    user: []
                }
            });
        };

        var tests = [
            {
                name: "no msg.feishu_meta_info",
                validate: outputValidateFunction
            },
            {
                name: "no msg.feishu_meta_info.target",
                preprocess: function() {
                    testInput.feishu_meta_info = {};
                },
                validate: outputValidateFunction
            },
            {
                name: "no msg.feishu_meta_info.target.chat",
                preprocess: function() {
                    testInput.feishu_meta_info = {
                        target: { user: [] }
                    };
                },
                validate: outputValidateFunction
            },
            {
                name: "no msg.feishu_meta_info.target.user",
                preprocess: function() {
                    testInput.feishu_meta_info = {
                        target: { chat: [] }
                    };
                },
                validate: outputValidateFunction
            },
        ];

        tests.forEach(testTemplate);
    });

    describe('regex filter test', function () {
        beforeEach(function () {
            testNodeConfig = {
                ...testNodeConfig,
                ...{
                    evalPropertyClass: "group",
                    evalGroupProperty: "open_chat_id",
                    evalUserProperty: "open_user_id",
                    filterMode: "regex",
                    filterValueList: [""],
                    filterRegexPattern: "",
                    filterRegexIgnoreCase: false
                }
            };
            testInput = {
                payload: "test_message",
                feishu_meta_info: {
                    target: {
                        chat: [
                            "test_chat_id_1",
                            "TEST_CHAT_ID_1",
                            "test_chat_id_2"
                        ],
                        user: []
                    }
                }
            };
        });

        var tests = [
            {
                name: "normal regex",
                preprocess: function() {
                    testNodeConfig.filterRegexPattern = "id_1";
                },
                validate: function(msg) {
                    var target = msg.feishu_meta_info.target;
                    target.user.should.with.lengthOf(0);
                    target.chat.should.with.lengthOf(2);
                    target.chat[0].should.be.a.String().and.be.exactly("TEST_CHAT_ID_1");
                    target.chat[1].should.be.a.String().and.be.exactly("test_chat_id_2");
                }
            },
            {
                name: "ignore case",
                preprocess: function() {
                    testNodeConfig.filterRegexPattern = "Id_1";
                    testNodeConfig.filterRegexIgnoreCase = true;
                },
                validate: function(msg) {
                    var target = msg.feishu_meta_info.target;
                    target.user.should.with.lengthOf(0);
                    target.chat.should.with.lengthOf(1);
                    target.chat[0].should.be.a.String().and.be.exactly("test_chat_id_2");
                }
            }
        ]

        tests.forEach(testTemplate);
    });

    describe('set filter test', function () {
        beforeEach(function () {
            testNodeConfig = {
                ...testNodeConfig,
                ...{
                    evalPropertyClass: "group",
                    evalGroupProperty: "open_chat_id",
                    evalUserProperty: "open_user_id",
                    filterMode: "set",
                    filterValueList: [""],
                    filterRegexPattern: "",
                    filterRegexIgnoreCase: false
                }
            };
            testInput = {
                payload: "test_message",
                feishu_meta_info: {
                    target: {
                        chat: [
                            "test_chat_id_1",
                            "test_chat_id_2"
                        ],
                        user: []
                    }
                }
            };
        });

        var tests = [
            {
                name: "value list",
                preprocess: function() {
                    testNodeConfig.filterValueList = ["test_chat_id_1"];
                },
                validate: function(msg) {
                    var target = msg.feishu_meta_info.target;
                    target.user.should.with.lengthOf(0);
                    target.chat.should.with.lengthOf(1);
                    target.chat[0].should.be.a.String().and.be.exactly("test_chat_id_2");
                }
            }
        ]

        tests.forEach(testTemplate);
    });

    describe('evaluation property test', function () {
        beforeEach(function () {
            testNodeConfig = {
                ...testNodeConfig,
                ...{
                    evalPropertyClass: "group",
                    evalGroupProperty: "open_chat_id",
                    evalUserProperty: "open_user_id",
                    filterMode: "set",
                    filterValueList: ["test_value"],
                    filterRegexPattern: "",
                    filterRegexIgnoreCase: false
                }
            };
            testInput = {
                payload: "test_message",
                feishu_meta_info: {
                    target: {
                        chat: [],
                        user: []
                    }
                }
            };
        });

        var tests = [
            {
                name: "chat open id in unstructured chat info",
                preprocess: function() {
                    testNodeConfig.evalPropertyClass = "group";
                    testNodeConfig.evalGroupProperty = "open_chat_id";
                    testInput.feishu_meta_info.target.chat = [
                        "test_value",
                        "not_test_value"
                    ];
                },
                validate: function(msg) {
                    var target = msg.feishu_meta_info.target;
                    target.user.should.with.lengthOf(0);
                    target.chat.should.with.lengthOf(1);
                    target.chat[0].should.be.a.String().and.be.exactly("not_test_value");
                }
            },
            {
                name: "chat open id in structured chat info",
                preprocess: function() {
                    testNodeConfig.evalPropertyClass = "group";
                    testNodeConfig.evalGroupProperty = "open_chat_id";
                    testInput.feishu_meta_info.target.chat = [
                        { chat_id: "test_value" },
                        { chat_id: "not_test_value" }
                    ];
                },
                validate: function(msg) {
                    var target = msg.feishu_meta_info.target;
                    target.user.should.with.lengthOf(0);
                    target.chat.should.with.lengthOf(1);
                    target.chat[0].should.be.a.Object().and.deepEqual({ chat_id: "not_test_value" });
                }
            },
            {
                name: "chat name in unstructured chat info",
                preprocess: function() {
                    testNodeConfig.evalPropertyClass = "group";
                    testNodeConfig.evalGroupProperty = "name";
                    testInput.feishu_meta_info.target.chat = [
                        "test_value",
                    ];
                },
                validate: function(msg) {
                    var target = msg.feishu_meta_info.target;
                    target.user.should.with.lengthOf(0);
                    target.chat.should.with.lengthOf(1);
                    target.chat[0].should.be.a.String().and.be.exactly("test_value");
                }
            },
            {
                name: "chat name in structured chat info",
                preprocess: function() {
                    testNodeConfig.evalPropertyClass = "group";
                    testNodeConfig.evalGroupProperty = "name";
                    testInput.feishu_meta_info.target.chat = [
                        { name: "test_value" },
                        { name: "not_test_value" }
                    ];
                },
                validate: function(msg) {
                    var target = msg.feishu_meta_info.target;
                    target.user.should.with.lengthOf(0);
                    target.chat.should.with.lengthOf(1);
                    target.chat[0].should.be.a.Object().and.deepEqual({ name: "not_test_value" });
                }
            },
            {
                name: "user open id in unstructured user info",
                preprocess: function() {
                    testNodeConfig.evalPropertyClass = "user";
                    testNodeConfig.evalGroupProperty = "open_user_id";
                    testInput.feishu_meta_info.target.user = [
                        "test_value",
                        "not_test_value"
                    ];
                },
                validate: function(msg) {
                    var target = msg.feishu_meta_info.target;
                    target.user.should.with.lengthOf(1);
                    target.chat.should.with.lengthOf(0);
                    target.user[0].should.be.a.String().and.be.exactly("not_test_value");
                }
            }
        ];

        tests.forEach(testTemplate);
    });

    describe('abnormal test', function () {
        beforeEach(function () {
            testNodeConfig = {
                ...testNodeConfig,
                ...{
                    evalPropertyClass: "group",
                    evalGroupProperty: "open_chat_id",
                    evalUserProperty: "open_user_id",
                    filterMode: "set",
                    filterValueList: ["test_value"],
                    filterRegexPattern: "",
                    filterRegexIgnoreCase: false
                }
            };
            testInput = {
                payload: "test_message",
                feishu_meta_info: {
                    target: {
                        chat: [],
                        user: []
                    }
                }
            };
        });

        describe("wrong chat info structure", function () {
            var tests = [
                {
                    name: "evaluate by open_chat_id",
                    preprocess: function() {
                        testInput.feishu_meta_info.target.chat = [
                            {},
                            { chat_id: "test_value" }
                        ];
                    },
                    validate: function(msg, node) {
                        var target = msg.feishu_meta_info.target;
                        target.chat.should.with.lengthOf(1);
                        target.chat[0].should.be.an.Object().and.deepEqual({});
                        node.error.should.be.calledWithExactly("Wrong chat info structure detected");
                    }
                },
                {
                    name: "evaluate by name",
                    preprocess: function() {
                        testNodeConfig.evalGroupProperty = "name";
                        testInput.feishu_meta_info.target.chat = [
                            {},
                            { name: "test_value" }
                        ];
                    },
                    validate: function(msg, node) {
                        var target = msg.feishu_meta_info.target;
                        target.chat.should.with.lengthOf(1);
                        target.chat[0].should.be.an.Object().and.deepEqual({});
                        node.error.should.be.calledWithExactly("Wrong chat info structure detected");
                    }
                },
            ];

            tests.forEach(testTemplate);
        });

        describe("wrong user info structure", function () {
            var tests = [
                {
                    name: "evaluate by open_user_id",
                    preprocess: function() {
                        testNodeConfig.evalPropertyClass = "user";
                        testInput.feishu_meta_info.target.user = [
                            {},
                            "test_value"
                        ];
                    },
                    validate: function(msg, node) {
                        var target = msg.feishu_meta_info.target;
                        target.user.should.with.lengthOf(1);
                        target.user[0].should.be.an.Object().and.deepEqual({});
                        node.error.should.be.calledWithExactly("Wrong user info structure detected");
                    }
                }
            ];

            tests.forEach(testTemplate);
        });

        describe("misconfiguration", function () {
            beforeEach(function () {
                testNodeConfig = {
                    ...testNodeConfig,
                    ...{
                        evalPropertyClass: "group",
                        evalGroupProperty: "open_chat_id",
                        evalUserProperty: "open_user_id",
                        filterMode: "set",
                        filterValueList: ["test_value"],
                        filterRegexPattern: "",
                        filterRegexIgnoreCase: false
                    }
                };
                testInput = {
                    payload: "test_message",
                    feishu_meta_info: {
                        target: {
                            chat: ["test_chat_id"],
                            user: ["test_user_id"]
                        }
                    }
                };
            });

            const outputValidateFunction = function(msg) {
                var feishu_meta_info = msg.feishu_meta_info;
                feishu_meta_info.should.deepEqual({
                    target: {
                        chat: ["test_chat_id"],
                        user: ["test_user_id"]
                    }
                });
            };

            var tests = [
                {
                    name: "invalid filter mode",
                    preprocess: function() {
                        testNodeConfig.filterMode = 'invalid';
                    },
                    afterCreateValidate: function(node) {
                        node.error.should.be.calledWithExactly("Unrecognized filterMode: invalid");
                    },
                    validate: outputValidateFunction
                },
                {
                    name: "invalid evalPropertyClass",
                    preprocess: function() {
                        testNodeConfig.evalPropertyClass = 'invalid';
                    },
                    afterCreateValidate: function(node) {
                        node.error.should.be.calledWithExactly("Unrecognized evalPropertyClass: invalid");
                    },
                    validate: outputValidateFunction
                },
                {
                    name: "invalid evalGroupProperty",
                    preprocess: function() {
                        testNodeConfig.evalPropertyClass = 'group';
                        testNodeConfig.evalGroupProperty = 'invalid';
                    },
                    afterCreateValidate: function(node) {
                        node.error.should.be.calledWithExactly("Unrecognized evalGroupProperty: invalid");
                    },
                    validate: outputValidateFunction
                }
                ,
                {
                    name: "invalid evalUserProperty",
                    preprocess: function() {
                        testNodeConfig.evalPropertyClass = 'user';
                        testNodeConfig.evalUserProperty = 'invalid';
                    },
                    afterCreateValidate: function(node) {
                        node.error.should.be.calledWithExactly("Unrecognized evalUserProperty: invalid");
                    },
                    validate: outputValidateFunction
                }
            ];

            tests.forEach(testTemplate);
        });
    });
});

describe('feishu-target-add Node', function () {
    var testNodeConfig;
    var testInput;

    function testTemplate(test) {
        it(test.name, function (done) {
            if(test.preprocess) {
                test.preprocess();
            }
            flow = [testNodeConfig, { id: "n2", type: "helper" }];
            helper.load(feishuTargetFilterNodes, flow, function () {
                try {
                    var n1 = helper.getNode("n1");
                    var n2 = helper.getNode("n2");
                    if(test.afterCreateValidate) {
                        test.afterCreateValidate(n1);
                    }
                    n2.on("input", function (msg) {
                        try {
                            test.validate(msg, n1);
                            done();
                        } catch (error) {
                            done(error);
                        }
                    });
                    n1.receive(testInput);
                } catch(error) {
                    done(error);
                }
            });
        });
    }

    beforeEach(function () {
        testNodeConfig = {
            id: "n1",
            type: "feishu-target-add",
            wires: [["n2"]],
            name: ""
        };
    });

    afterEach(function () {
        helper.unload();
    });

    it('should be loaded', function (done) {
        var flow = [{ id: "n1", type: "feishu-target-add", name: "test name" }];
        helper.load(feishuTargetFilterNodes, flow, function () {
            try {
                var n1 = helper.getNode("n1");
                n1.should.have.property('name', 'test name');
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    describe('initialization', function () {
        beforeEach(function () {
            testNodeConfig = {
                ...testNodeConfig,
                ...{
                    addMode: "direct",
                    directAddProperty: "group",
                    directAddValueList: [],
                    evalPropertyClass: "group",
                    evalGroupProperty: "open_chat_id",
                    evalUserProperty: "open_user_id",
                    filterMode: "regex",
                    filterValueList: [""],
                    filterRegexPattern: "",
                    filterRegexIgnoreCase: false
                }
            };
            testInput = {
                payload: "test_message"
            };
        });

        var outputValidateFunction = function(msg) {
            msg.feishu_meta_info.should.deepEqual({
                target: {
                    chat: [],
                    user: []
                }
            });
        };

        var tests = [
            {
                name: "no msg.feishu_meta_info",
                validate: outputValidateFunction
            },
            {
                name: "no msg.feishu_meta_info.target",
                preprocess: function() {
                    testInput.feishu_meta_info = {};
                },
                validate: outputValidateFunction
            },
            {
                name: "no msg.feishu_meta_info.target.chat",
                preprocess: function() {
                    testInput.feishu_meta_info = {
                        target: { user: [] }
                    };
                },
                validate: outputValidateFunction
            },
            {
                name: "no msg.feishu_meta_info.target.user",
                preprocess: function() {
                    testInput.feishu_meta_info = {
                        target: { chat: [] }
                    };
                },
                validate: outputValidateFunction
            },
        ];

        tests.forEach(testTemplate);
    });

    describe('duplicate add', function () {
        beforeEach(function () {
            testNodeConfig = {
                ...testNodeConfig,
                ...{
                    addMode: "direct",
                    directAddProperty: "group",
                    directAddValueList: ["test_value"],
                    evalPropertyClass: "group",
                    evalGroupProperty: "open_chat_id",
                    evalUserProperty: "open_user_id",
                    filterMode: "regex",
                    filterValueList: [""],
                    filterRegexPattern: "",
                    filterRegexIgnoreCase: false
                }
            };
            testInput = {
                payload: "test_message",
                feishu_meta_info: {
                    target: {
                        chat: [],
                        user: []
                    }
                }
            };
        });

        var tests = [
            {
                name: "duplicate group",
                preprocess: function() {
                    testNodeConfig.directAddProperty = "group";
                    testInput.feishu_meta_info.target.chat = [{chat_id: "test_value"}];
                },
                validate: function(msg) {
                    msg.feishu_meta_info.should.deepEqual({
                        target: {
                            chat: [{chat_id: "test_value"}],
                            user: []
                        }
                    });
                }
            },
            {
                name: "duplicate user",
                preprocess: function() {
                    testNodeConfig.directAddProperty = "user";
                    testInput.feishu_meta_info.target.user = ["test_value"];
                },
                validate: function(msg) {
                    msg.feishu_meta_info.should.deepEqual({
                        target: {
                            chat: [],
                            user: ["test_value"]
                        }
                    });
                }
            },
        ];

        tests.forEach(testTemplate);
    });

    describe('add mode: filter', function () {
        beforeEach(function () {
            testNodeConfig = {
                ...testNodeConfig,
                ...{
                    addMode: "filter",
                    directAddProperty: "group",
                    directAddValueList: [],
                }
            };
        });

        describe('regex filter test', function () {
            beforeEach(function () {
                testNodeConfig = {
                    ...testNodeConfig,
                    ...{
                        evalPropertyClass: "group",
                        evalGroupProperty: "open_chat_id",
                        evalUserProperty: "open_user_id",
                        filterMode: "regex",
                        filterValueList: [""],
                        filterRegexPattern: "",
                        filterRegexIgnoreCase: false
                    }
                };
                testInput = {
                    payload: "test_message",
                    feishu_meta_info: {
                        chat: [
                            "test_chat_id_1",
                            "TEST_CHAT_ID_1",
                            "test_chat_id_2"
                        ],
                        user: []
                    }
                };
            });

            var tests = [
                {
                    name: "normal regex",
                    preprocess: function() {
                        testNodeConfig.filterRegexPattern = "id_1";
                    },
                    validate: function(msg) {
                        var target = msg.feishu_meta_info.target;
                        target.user.should.with.lengthOf(0);
                        target.chat.should.with.lengthOf(1);
                        target.chat[0].should.be.a.String().and.be.exactly("test_chat_id_1");
                    }
                },
                {
                    name: "ignore case",
                    preprocess: function() {
                        testNodeConfig.filterRegexPattern = "Id_2";
                        testNodeConfig.filterRegexIgnoreCase = true;
                    },
                    validate: function(msg) {
                        var target = msg.feishu_meta_info.target;
                        target.user.should.with.lengthOf(0);
                        target.chat.should.with.lengthOf(1);
                        target.chat[0].should.be.a.String().and.be.exactly("test_chat_id_2");
                    }
                }
            ]
    
            tests.forEach(testTemplate);
        });

        describe('set filter test', function () {
            beforeEach(function () {
                testNodeConfig = {
                    ...testNodeConfig,
                    ...{
                        evalPropertyClass: "group",
                        evalGroupProperty: "open_chat_id",
                        evalUserProperty: "open_user_id",
                        filterMode: "set",
                        filterValueList: [""],
                        filterRegexPattern: "",
                        filterRegexIgnoreCase: false
                    }
                };
                testInput = {
                    payload: "test_message",
                    feishu_meta_info: {
                        chat: [
                            "test_chat_id_1",
                            "test_chat_id_2"
                        ],
                        user: []
                    }
                };
            });

            var tests = [
                {
                    name: "value list",
                    preprocess: function() {
                        testNodeConfig.filterValueList = ["test_chat_id_1"];
                    },
                    validate: function(msg) {
                        var target = msg.feishu_meta_info.target;
                        target.user.should.with.lengthOf(0);
                        target.chat.should.with.lengthOf(1);
                        target.chat[0].should.be.a.String().and.be.exactly("test_chat_id_1");
                    }
                },
            ]
    
            tests.forEach(testTemplate);
        });

        describe('evaluation property test', function () {
            beforeEach(function () {
                testNodeConfig = {
                    ...testNodeConfig,
                    ...{
                        evalPropertyClass: "group",
                        evalGroupProperty: "open_chat_id",
                        evalUserProperty: "open_user_id",
                        filterMode: "set",
                        filterValueList: ["test_value"],
                        filterRegexPattern: "",
                        filterRegexIgnoreCase: false
                    }
                };
                testInput = {
                    payload: "test_message",
                    feishu_meta_info: {
                        chat: [],
                        user: []
                    }
                };
            });

            var tests = [
                {
                    name: "chat open id in unstructured chat info",
                    preprocess: function() {
                        testNodeConfig.evalGroupProperty = "open_chat_id";
                        testInput.feishu_meta_info.chat = [
                            "test_value",
                            "not_test_value"
                        ];
                    },
                    validate: function(msg) {
                        var target = msg.feishu_meta_info.target;
                        target.user.should.with.lengthOf(0);
                        target.chat.should.with.lengthOf(1);
                        target.chat[0].should.be.a.String().and.be.exactly("test_value");
                    }
                },
                {
                    name: "chat open id in structured chat info",
                    preprocess: function() {
                        testNodeConfig.evalGroupProperty = "open_chat_id";
                        testInput.feishu_meta_info.chat = [
                            { chat_id: "test_value" },
                            { chat_id: "not_test_value" }
                        ];
                    },
                    validate: function(msg) {
                        var target = msg.feishu_meta_info.target;
                        target.user.should.with.lengthOf(0);
                        target.chat.should.with.lengthOf(1);
                        target.chat[0].should.deepEqual({ chat_id: "test_value" });
                    }
                },
                {
                    name: "chat name in unstructured chat info",
                    preprocess: function() {
                        testNodeConfig.evalGroupProperty = "name";
                        testInput.feishu_meta_info.chat = [
                            "test_value",
                        ];
                    },
                    validate: function(msg) {
                        var target = msg.feishu_meta_info.target;
                        target.user.should.with.lengthOf(0);
                        target.chat.should.with.lengthOf(0);
                    }
                },
                {
                    name: "chat name in structured chat info",
                    preprocess: function() {
                        testNodeConfig.evalGroupProperty = "name";
                        testInput.feishu_meta_info.chat = [
                            { chat_id: "1", name: "test_value" },
                            { chat_id: "2", name: "not_test_value" }
                        ];
                    },
                    validate: function(msg) {
                        var target = msg.feishu_meta_info.target;
                        target.user.should.with.lengthOf(0);
                        target.chat.should.with.lengthOf(1);
                        target.chat[0].should.deepEqual({ chat_id: "1", name: "test_value" });
                    }
                },
                {
                    name: "user open id in unstructured user info",
                    preprocess: function() {
                        testNodeConfig.evalPropertyClass = "user";
                        testNodeConfig.evalUserProperty = "open_user_id";
                        testInput.feishu_meta_info.user = [
                            "test_value",
                            "not_test_value"
                        ];
                    },
                    validate: function(msg) {
                        var target = msg.feishu_meta_info.target;
                        target.chat.should.with.lengthOf(0);
                        target.user.should.with.lengthOf(1);
                        target.user[0].should.be.a.String().and.be.exactly("test_value");
                    }
                },
            ]
    
            tests.forEach(testTemplate);
        });
    });

    describe('add mode: direct', function () {
        beforeEach(function () {
            testNodeConfig = {
                ...testNodeConfig,
                ...{
                    addMode: "direct",
                    directAddValueList: ["test_value"],
                    evalPropertyClass: "group",
                    evalGroupProperty: "open_chat_id",
                    evalUserProperty: "open_user_id",
                    filterMode: "regex",
                    filterValueList: [""],
                    filterRegexPattern: "",
                    filterRegexIgnoreCase: false
                }
            };
            testInput = {
                payload: "test_message",
                feishu_meta_info: {}
            };
        });

        describe('add group test', function () {
            var tests = [
                {
                    name: "normal add",
                    preprocess: function() {
                        testNodeConfig.directAddProperty = "group";
                    },
                    validate: function(msg) {
                        var target = msg.feishu_meta_info.target;
                        target.user.should.with.lengthOf(0);
                        target.chat.should.with.lengthOf(1);
                        target.chat[0].should.be.a.String().and.be.exactly("test_value");
                    }
                },
            ]
    
            tests.forEach(testTemplate);
        });

        describe('add user test', function () {
            var tests = [
                {
                    name: "normal add",
                    preprocess: function() {
                        testNodeConfig.directAddProperty = "user";
                    },
                    validate: function(msg) {
                        var target = msg.feishu_meta_info.target;
                        target.chat.should.with.lengthOf(0);
                        target.user.should.with.lengthOf(1);
                        target.user[0].should.be.a.String().and.be.exactly("test_value");
                    }
                },
            ]
    
            tests.forEach(testTemplate);
        });
    });

    describe('abnormal test', function () {
        describe('add mode: filter', function () {
            beforeEach(function () {
                testNodeConfig = {
                    ...testNodeConfig,
                    ...{
                        addMode: "filter",
                        directAddValueList: [],
                        evalPropertyClass: "group",
                        evalGroupProperty: "open_chat_id",
                        evalUserProperty: "open_user_id",
                        filterMode: "regex",
                        filterValueList: [""],
                        filterRegexPattern: "test_value",
                        filterRegexIgnoreCase: false
                    }
                };
                testInput = {
                    payload: "test_message",
                    feishu_meta_info: {}
                };
            });

            var tests = [
                {
                    name: "no feishu_meta_info.chat field",
                    preprocess: function() {
                        testNodeConfig.evalPropertyClass = "group";
                    },
                    validate: function(msg, node) {
                        var target = msg.feishu_meta_info.target;
                        target.should.deepEqual({ chat: [], user: [] });
                        node.warn.should.be.calledWithExactly("Expect msg to have feishu_meta_info.chat field.");
                    }
                },
                {
                    name: "no feishu_meta_info.user field",
                    preprocess: function() {
                        testNodeConfig.evalPropertyClass = "user";
                    },
                    validate: function(msg, node) {
                        var target = msg.feishu_meta_info.target;
                        target.should.deepEqual({ chat: [], user: [] });
                        node.warn.should.be.calledWithExactly("Expect msg to have feishu_meta_info.user field.");
                    }
                },
            ]
    
            tests.forEach(testTemplate);

            describe('wrong chat info structure in feishu_meta_info.chat', function () {
                var tests = [
                    {
                        name: "evaluate by open_chat_id",
                        preprocess: function() {
                            testNodeConfig.evalPropertyClass = "group";
                            testNodeConfig.evalGroupProperty = "open_chat_id";
                            testInput.feishu_meta_info = {
                                chat: [
                                    {},
                                    "test_value"
                                ],
                                user: []
                            };
                        },
                        validate: function(msg, node) {
                            var target = msg.feishu_meta_info.target;
                            target.chat.should.with.lengthOf(1);
                            target.chat[0].should.be.a.String().and.be.exactly("test_value");
                            node.error.should.be.calledWithExactly("Wrong chat info structure detected");
                        }
                    }
                ]
        
                tests.forEach(testTemplate);

                describe('evaluate by name', function () {
                    var tests = [
                        {
                            name: "no name field",
                            preprocess: function() {
                                testNodeConfig.evalPropertyClass = "group";
                                testNodeConfig.evalGroupProperty = "name";
                                testInput.feishu_meta_info = {
                                    chat: [
                                        {},
                                        { chat_id: "test_chat_id_1", name: "test_value" }
                                    ],
                                    user: []
                                };
                            },
                            validate: function(msg, node) {
                                var target = msg.feishu_meta_info.target;
                                target.chat.should.with.lengthOf(1);
                                target.chat[0].should.be.an.Object().and.deepEqual({ chat_id: "test_chat_id_1", name: "test_value" });
                                node.error.should.be.calledWithExactly("Wrong chat info structure detected");
                            }
                        },
                        {
                            name: "has name field, but no chat_id field",
                            preprocess: function() {
                                testNodeConfig.evalPropertyClass = "group";
                                testNodeConfig.evalGroupProperty = "name";
                                testInput.feishu_meta_info = {
                                    chat: [
                                        { name: "test_value" }
                                    ],
                                    user: []
                                };
                            },
                            validate: function(msg, node) {
                                var target = msg.feishu_meta_info.target;
                                target.chat.should.with.lengthOf(0);
                                node.error.should.be.calledWithExactly("Wrong chat info structure detected");
                            }
                        },
                    ]
            
                    tests.forEach(testTemplate);
                });
            });

            describe('wrong user info structure in feishu_meta_info.user', function () {
                var tests = [
                    {
                        name: "evaluate by open_user_id",
                        preprocess: function() {
                            testNodeConfig.evalPropertyClass = "user";
                            testNodeConfig.evalUserProperty = "open_user_id";
                            testInput.feishu_meta_info = {
                                chat: [],
                                user: [
                                    {},
                                    "test_value"
                                ],
                            };
                        },
                        validate: function(msg, node) {
                            var target = msg.feishu_meta_info.target;
                            target.user.should.with.lengthOf(1);
                            target.user[0].should.be.a.String().and.be.exactly("test_value");
                            node.error.should.be.calledWithExactly("Wrong user info structure detected");
                        }
                    },
                ]
        
                tests.forEach(testTemplate);
            });
        });

        describe('error in feishu_meta_info.target', function () {
            beforeEach(function () {
                testNodeConfig = {
                    ...testNodeConfig,
                    ...{
                        addMode: "direct",
                        directAddProperty: "group",
                        directAddValueList: ["test_value"],
                        evalPropertyClass: "group",
                        evalGroupProperty: "open_chat_id",
                        evalUserProperty: "open_user_id",
                        filterMode: "regex",
                        filterValueList: [""],
                        filterRegexPattern: "",
                        filterRegexIgnoreCase: false
                    }
                };
                testInput = {
                    payload: "test_message",
                    feishu_meta_info: {
                        target: {
                            chat: [],
                            user: []
                        }
                    }
                };
            });

            var tests = [
                {
                    name: "wrong chat info structure in feishu_meta_info.target.chat",
                    preprocess: function() {
                        testNodeConfig.directAddProperty = "group";
                        testInput.feishu_meta_info.target.chat = [
                            {name: "test_value"}
                        ];
                    },
                    validate: function(msg, node) {
                        var target = msg.feishu_meta_info.target;
                        target.chat.should.with.lengthOf(2);
                        target.chat[0].should.deepEqual({name: "test_value"});
                        target.chat[1].should.be.a.String().and.be.exactly("test_value");
                        node.error.should.be.calledWithExactly("Wrong chat info structure detected");
                    }
                },
                {
                    name: "wrong user info structure in feishu_meta_info.target.user",
                    preprocess: function() {
                        testNodeConfig.directAddProperty = "user";
                        testInput.feishu_meta_info.target.user = [
                            {}
                        ];
                    },
                    validate: function(msg, node) {
                        var target = msg.feishu_meta_info.target;
                        target.user.should.with.lengthOf(2);
                        target.user[0].should.deepEqual({});
                        target.user[1].should.be.a.String().and.be.exactly("test_value");
                        node.error.should.be.calledWithExactly("Wrong user info structure detected");
                    }
                }
            ]

            tests.forEach(testTemplate);
        });

        describe('misconfiguration', function () {
            beforeEach(function () {
                testNodeConfig = {
                    ...testNodeConfig,
                    ...{
                        addMode: "direct",
                        directAddProperty: "group",
                        directAddValueList: ["test_value"],
                        evalPropertyClass: "group",
                        evalGroupProperty: "open_chat_id",
                        evalUserProperty: "open_user_id",
                        filterMode: "regex",
                        filterValueList: [""],
                        filterRegexPattern: "",
                        filterRegexIgnoreCase: false
                    }
                };
                testInput = {
                    payload: "test_message",
                    feishu_meta_info: {
                        chat: ["test_chat_id"],
                        user: ["test_user_id"]
                    }
                };
            });

            const outputValidateFunction = function(msg) {
                var feishu_meta_info = msg.feishu_meta_info;
                feishu_meta_info.should.deepEqual({
                    target: {
                        chat: [],
                        user: []
                    },
                    chat: ["test_chat_id"],
                    user: ["test_user_id"]
                });
            };

            var tests = [
                {
                    name: "invalid add mode",
                    preprocess: function() {
                        testNodeConfig.addMode = 'invalid';
                    },
                    afterCreateValidate: function(node) {
                        node.error.should.be.calledWithExactly("Unrecognized addMode: invalid");
                    },
                    validate: outputValidateFunction
                },
                {
                    name: "invalid directAddProperty",
                    preprocess: function() {
                        testNodeConfig.addMode = 'direct';
                        testNodeConfig.directAddProperty = 'invalid';
                    },
                    afterCreateValidate: function(node) {
                        node.error.should.be.calledWithExactly("Unrecognized directAddProperty: invalid");
                    },
                    validate: outputValidateFunction
                },
                {
                    name: "invalid filter mode",
                    preprocess: function() {
                        testNodeConfig.addMode = 'filter';
                        testNodeConfig.filterMode = 'invalid';
                    },
                    afterCreateValidate: function(node) {
                        node.error.should.be.calledWithExactly("Unrecognized filterMode: invalid");
                    },
                    validate: outputValidateFunction
                },
                {
                    name: "invalid evalPropertyClass",
                    preprocess: function() {
                        testNodeConfig.addMode = 'filter';
                        testNodeConfig.evalPropertyClass = 'invalid';
                    },
                    afterCreateValidate: function(node) {
                        node.error.should.be.calledWithExactly("Unrecognized evalPropertyClass: invalid");
                    },
                    validate: outputValidateFunction
                },
                {
                    name: "invalid evalGroupProperty",
                    preprocess: function() {
                        testNodeConfig.addMode = 'filter';
                        testNodeConfig.evalPropertyClass = 'group';
                        testNodeConfig.evalGroupProperty = 'invalid';
                    },
                    afterCreateValidate: function(node) {
                        node.error.should.be.calledWithExactly("Unrecognized evalGroupProperty: invalid");
                    },
                    validate: outputValidateFunction
                },
                {
                    name: "invalid evalUserProperty",
                    preprocess: function() {
                        testNodeConfig.addMode = 'filter';
                        testNodeConfig.evalPropertyClass = 'user';
                        testNodeConfig.evalUserProperty = 'invalid';
                    },
                    afterCreateValidate: function(node) {
                        node.error.should.be.calledWithExactly("Unrecognized evalUserProperty: invalid");
                    },
                    validate: outputValidateFunction
                },
            ]

            tests.forEach(testTemplate);
        });
    });
});