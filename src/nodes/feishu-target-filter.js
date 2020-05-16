module.exports = function(RED) {

    function getOpenChatId(group) {
        var openChatId = undefined;
        if (typeof(group) === 'string') {
            openChatId = group;
        } else if(typeof(group.chat_id) === 'string') {
            openChatId = group.chat_id;
        } else {
            throw "Wrong chat info structure detected";
        }
        return openChatId;
    }

    function getChatName(group) {
        var name = undefined;
        if (typeof(group) === 'string') {
            // pass
        } else if(typeof(group.name) === 'string') {
            name = group.name;
        } else {
            throw "Wrong chat info structure detected";
        }
        return name;
    }

    function getOpenUserId(user) {
        var openUserId = undefined;
        if (typeof(user) === 'string') {
            openUserId = user;
        } else {
            throw "Wrong user info structure detected";
        }
        return openUserId;
    }

    function FeishuTargetRemoveNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        node.evalPropertyClass = config.evalPropertyClass;
        node.evalGroupProperty = config.evalGroupProperty;
        node.evalUserProperty = config.evalUserProperty;
        node.filterMode = config.filterMode;
        node.filterValueList = new Set(config.filterValueList);
        node.filterRegexPattern = config.filterRegexPattern;
        node.filterRegexIgnoreCase = config.filterRegexIgnoreCase;

        node.filterFunction = function(value) {return false};

        if(node.filterMode === 'set') {
            node.filterFunction = function(value) {
                return node.filterValueList.has(value);
            };
        } else if(node.filterMode === 'regex') {
            var flags = node.filterRegexIgnoreCase?'i':'';
            node.filterRegex = new RegExp(node.filterRegexPattern, flags);
            node.filterFunction = function(value) {
                return node.filterRegex.test(value);
            };
        } else {
            node.error("Unrecognized filterMode: "+node.filterMode);
        }

        if(node.evalPropertyClass === 'group') {
            if (node.evalGroupProperty === 'open_chat_id') {
                node.extractPropertyFunction = getOpenChatId;
            } else if (node.evalGroupProperty === 'name') {
                node.extractPropertyFunction = getChatName;
            } else {
                node.error("Unrecognized evalGroupProperty: "+node.evalGroupProperty);
            }
        } else if (node.evalPropertyClass === 'user') {
            if (node.evalUserProperty === 'open_user_id') {
                node.extractPropertyFunction = getOpenUserId;
            } else {
                node.error("Unrecognized evalUserProperty: "+node.evalUserProperty);
            }
        } else {
            node.error("Unrecognized evalPropertyClass: "+node.evalPropertyClass);
        }

        node.on('input', function(msg) {
            if(!msg.feishu_meta_info) {
                msg.feishu_meta_info = {};
            }
            if(!msg.feishu_meta_info.target) {
                msg.feishu_meta_info.target = {
                    chat: [],
                    user: []
                }
            }
            var target = msg.feishu_meta_info.target;
            if(!target.chat) {
                target.chat = [];
            }
            if(!target.user) {
                target.user = [];
            }
            if(node.evalPropertyClass === 'group') {
                var filtered = target.chat.filter((group) => {
                    try {
                        var property = node.extractPropertyFunction(group);
                        return !node.filterFunction(property);
                    } catch(err) {
                        node.error(err);
                        return true;
                    }
                });
                target.chat = filtered;
            } else if (node.evalPropertyClass === 'user') {
                var filtered = target.user.filter((user) => {
                    try {
                        var property = node.extractPropertyFunction(user);
                        return !node.filterFunction(property);
                    } catch(err) {
                        node.error(err);
                        return true;
                    }
                });
                target.user = filtered;
            }
            node.send(msg);
        });
    }
    RED.nodes.registerType("feishu-target-remove",FeishuTargetRemoveNode);

    function FeishuTargetAddNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        node.addMode = config.addMode;
        node.directAddProperty = config.directAddProperty;
        node.directAddValueList = new Set(config.directAddValueList);
        node.evalPropertyClass = config.evalPropertyClass;
        node.evalGroupProperty = config.evalGroupProperty;
        node.evalUserProperty = config.evalUserProperty;
        node.filterMode = config.filterMode;
        node.filterValueList = new Set(config.filterValueList);
        node.filterRegexPattern = config.filterRegexPattern;
        node.filterRegexIgnoreCase = config.filterRegexIgnoreCase;

        if(node.addMode === 'direct') {
            if(node.directAddProperty === 'group') {
                // pass
            } else if(node.directAddProperty === 'user') {
                // pass
            } else {
                node.error("Unrecognized directAddProperty: "+node.directAddProperty);
            }
        } else if(node.addMode === 'filter') {
            node.filterFunction = function(value) {return false};
            if(node.filterMode === 'set') {
                node.filterFunction = function(value) {
                    return node.filterValueList.has(value);
                };
            } else if(node.filterMode === 'regex') {
                var flags = node.filterRegexIgnoreCase?'i':'';
                node.filterRegex = new RegExp(node.filterRegexPattern, flags);
                node.filterFunction = function(value) {
                    return node.filterRegex.test(value);
                };
            } else {
                node.error("Unrecognized filterMode: "+node.filterMode);
            }

            if(node.evalPropertyClass === 'group') {
                if (node.evalGroupProperty === 'open_chat_id') {
                    node.extractPropertyFunction = getOpenChatId;
                } else if (node.evalGroupProperty === 'name') {
                    node.extractPropertyFunction = getChatName;
                } else {
                    node.error("Unrecognized evalGroupProperty: "+node.evalGroupProperty);
                }
            } else if (node.evalPropertyClass === 'user') {
                if (node.evalUserProperty === 'open_user_id') {
                    node.extractPropertyFunction = getOpenUserId;
                } else {
                    node.error("Unrecognized evalUserProperty: "+node.evalUserProperty);
                }
            } else {
                node.error("Unrecognized evalPropertyClass: "+node.evalPropertyClass);
            }
        } else {
            node.error("Unrecognized addMode: "+node.addMode);
        }

        node.on('input', function(msg) {
            if(!msg.feishu_meta_info) {
                msg.feishu_meta_info = {};
            }
            if(!msg.feishu_meta_info.target) {
                msg.feishu_meta_info.target = {
                    chat: [],
                    user: []
                };
            }
            var target = msg.feishu_meta_info.target;
            if(!target.chat) {
                target.chat = [];
            }
            if(!target.user) {
                target.user = [];
            }
            if(node.addMode === 'direct') {
                if(node.directAddProperty === 'group') {
                    node.inplaceMergeTarget({chat:node.directAddValueList, user:[]}, target);
                } else if(node.directAddProperty === 'user') {
                    node.inplaceMergeTarget({chat:[], user:node.directAddValueList}, target);
                }
            } else if(node.addMode === 'filter') {
                var meta_info = msg.feishu_meta_info;
                if(node.evalPropertyClass === 'group') {
                    if(meta_info.chat) {
                        var filtered = meta_info.chat.filter((group) => {
                            try {
                                var property = node.extractPropertyFunction(group);
                                return node.filterFunction(property);
                            } catch(err) {
                                node.error(err);
                                return false;
                            }
                        });
                        node.inplaceMergeTarget({chat:filtered, user:[]}, target);
                    } else {
                        node.warn("Expect msg to have feishu_meta_info.chat field.");
                    }
                } else if (node.evalPropertyClass === 'user') {
                    if(meta_info.user) {
                        var filtered = meta_info.user.filter((user) => {
                            try {
                                var property = node.extractPropertyFunction(user);
                                return node.filterFunction(property);
                            } catch(err) {
                                node.error(err);
                                return false;
                            }
                        });
                        node.inplaceMergeTarget({chat:[], user:filtered}, target);
                    } else {
                        node.warn("Expect msg to have feishu_meta_info.user field.");
                    }
                }
            }
            node.send(msg);
        });
    }
    RED.nodes.registerType("feishu-target-add",FeishuTargetAddNode);

    FeishuTargetAddNode.prototype.inplaceMergeTarget = function(from, to) {
        var node = this;
        var toChatOpenIdSet = new Set();
        to.chat.forEach((chat) => {
            try {
                var openChatId = getOpenChatId(chat);
                toChatOpenIdSet.add(openChatId);
            } catch(error) {
                node.error(error);
            }
        });
        from.chat.forEach((chat) => {
            try {
                var openChatId = getOpenChatId(chat);
                if(!toChatOpenIdSet.has(openChatId)) {
                    to.chat.push(chat);
                    toChatOpenIdSet.add(openChatId);
                }
            } catch(error) {
                node.error(error);
            }
        });

        var toUserOpenIdSet = new Set();
        to.user.forEach((user) => {
            try {
                var openUserId = getOpenUserId(user);
                toUserOpenIdSet.add(openUserId);
            } catch(error) {
                node.error(error);
            }
        });
        from.user.forEach((user) => {
            try {
                var openUserId = getOpenUserId(user);
                if(!toUserOpenIdSet.has(openUserId)) {
                    to.user.push(user);
                    toUserOpenIdSet.add(openUserId);
                }
            } catch(error) {
                node.error(error);
            }
        });
    }
}
