
Message 结构
```javascript
// 群名片消息
{
    share_open_chat_id: String //
}

// 图片消息
{
    image_key: String //
}

// 文本消息
{
    text: String //
}

// 富文本消息 使用飞书官网结构

// 
```

payload 结构
```javascript
{
    msg: Message || String, // 如果是字符串就是文本消息
    target: {
        group:  [ String || Group ],
        user:  [ String || User ],
    }
}
```

Chat 结构
```javascript
{
        "avatar": "http://p3.pstatp.com/origin/78c0000676df676a7f6e",
        "chat_id": "oc_eb9e82d5657777ebf1bb5b9024f549ef",
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
            {
                "open_id": "ou_b6671e895da5ef8f84ec8831c26348bd",
                "user_id": "24e1cbff"
            }
        ],
        "name": "中文",
        "type": "group",
        "owner_open_id": "ou_6edde2deccabb76c12b30f0345f19aa1",
        "owner_user_id": "8e17d887"
}
```