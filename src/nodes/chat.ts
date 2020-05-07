export interface Chat {
    avatar: string,
    chat_id: string,
    description: string,
    i18n_names?: {
        en_us: string,
        ja_jp: string,
        zh_cn: string,
    },
    members: {
        open_id: string,
        user_id: string,
    }[],
    name: string,
    type: "group"
    owner_open_id: string,
    owner_user_id: string
}