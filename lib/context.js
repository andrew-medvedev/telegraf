"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const UpdateTypes = [
    'callback_query',
    'channel_post',
    'chosen_inline_result',
    'edited_channel_post',
    'edited_message',
    'inline_query',
    'shipping_query',
    'pre_checkout_query',
    'message',
    'poll',
    'poll_answer',
];
const MessageSubTypes = [
    'voice',
    'video_note',
    'video',
    'animation',
    'venue',
    'text',
    'supergroup_chat_created',
    'successful_payment',
    'sticker',
    'pinned_message',
    'photo',
    'new_chat_title',
    'new_chat_photo',
    'new_chat_members',
    'migrate_to_chat_id',
    'migrate_from_chat_id',
    'location',
    'left_chat_member',
    'invoice',
    'group_chat_created',
    'game',
    'dice',
    'document',
    'delete_chat_photo',
    'contact',
    'channel_chat_created',
    'audio',
    'connected_website',
    'passport_data',
    'poll',
    'forward_date',
];
const MessageSubTypesMapping = {
    forward_date: 'forward',
};
class Context {
    constructor(update, tg, options = {}) {
        this.update = update;
        this.tg = tg;
        this.options = options;
        this.state = {};
        this.updateType = UpdateTypes.find((key) => key in this.update);
        // prettier-ignore
        if (this.updateType === 'message' || (this.options.channelMode && this.updateType === 'channel_post')) {
            this.updateSubTypes = MessageSubTypes
                .filter((key) => key in this.update[this.updateType])
                .map((type) => MessageSubTypesMapping[type] || type);
        }
        else {
            this.updateSubTypes = [];
        }
        Object.getOwnPropertyNames(Context.prototype)
            .filter((key) => key !== 'constructor' && typeof this[key] === 'function')
            .forEach((key) => (this[key] = this[key].bind(this)));
    }
    get me() {
        return this.options.username;
    }
    get telegram() {
        return this.tg;
    }
    get message() {
        if (!('message' in this.update))
            return undefined;
        return this.update.message;
    }
    get editedMessage() {
        if (!('edited_message' in this.update))
            return undefined;
        return this.update.edited_message;
    }
    get inlineQuery() {
        if (!('inline_query' in this.update))
            return undefined;
        return this.update.inline_query;
    }
    get shippingQuery() {
        if (!('shipping_query' in this.update))
            return undefined;
        return this.update.shipping_query;
    }
    get preCheckoutQuery() {
        if (!('pre_checkout_query' in this.update))
            return undefined;
        return this.update.pre_checkout_query;
    }
    get chosenInlineResult() {
        if (!('chosen_inline_result' in this.update))
            return undefined;
        return this.update.chosen_inline_result;
    }
    get channelPost() {
        if (!('channel_post' in this.update))
            return undefined;
        return this.update.channel_post;
    }
    get editedChannelPost() {
        if (!('edited_channel_post' in this.update))
            return undefined;
        return this.update.edited_channel_post;
    }
    get callbackQuery() {
        if (!('callback_query' in this.update))
            return undefined;
        return this.update.callback_query;
    }
    get poll() {
        if (!('poll' in this.update))
            return undefined;
        return this.update.poll;
    }
    get pollAnswer() {
        if (!('poll_answer' in this.update))
            return undefined;
        return this.update.poll_answer;
    }
    get chat() {
        var _a, _b, _c, _d, _e, _f;
        return (_f = ((_e = (_d = (_b = (_a = this.message) !== null && _a !== void 0 ? _a : this.editedMessage) !== null && _b !== void 0 ? _b : (_c = this.callbackQuery) === null || _c === void 0 ? void 0 : _c.message) !== null && _d !== void 0 ? _d : this.channelPost) !== null && _e !== void 0 ? _e : this.editedChannelPost)) === null || _f === void 0 ? void 0 : _f.chat;
    }
    get from() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return (_j = ((_h = (_g = (_f = (_e = (_d = (_c = (_b = (_a = this.message) !== null && _a !== void 0 ? _a : this.editedMessage) !== null && _b !== void 0 ? _b : this.callbackQuery) !== null && _c !== void 0 ? _c : this.inlineQuery) !== null && _d !== void 0 ? _d : this.channelPost) !== null && _e !== void 0 ? _e : this.editedChannelPost) !== null && _f !== void 0 ? _f : this.shippingQuery) !== null && _g !== void 0 ? _g : this.preCheckoutQuery) !== null && _h !== void 0 ? _h : this.chosenInlineResult)) === null || _j === void 0 ? void 0 : _j.from;
    }
    get inlineMessageId() {
        var _a, _b;
        return (_b = ((_a = this.callbackQuery) !== null && _a !== void 0 ? _a : this.chosenInlineResult)) === null || _b === void 0 ? void 0 : _b.inline_message_id;
    }
    get passportData() {
        var _a;
        if (this.message == null)
            return undefined;
        if (!('passport_data' in this.message))
            return undefined;
        return (_a = this.message) === null || _a === void 0 ? void 0 : _a.passport_data;
    }
    get webhookReply() {
        return this.tg.webhookReply;
    }
    set webhookReply(enable) {
        this.tg.webhookReply = enable;
    }
    assert(value, method) {
        if (value === undefined) {
            throw new Error(`Telegraf: "${method}" isn't available for "${this.updateType}::${this.updateSubTypes.toString()}"`);
        }
    }
    answerInlineQuery(...args) {
        this.assert(this.inlineQuery, 'answerInlineQuery');
        return this.telegram.answerInlineQuery(this.inlineQuery.id, ...args);
    }
    answerCbQuery(...args) {
        this.assert(this.callbackQuery, 'answerCbQuery');
        return this.telegram.answerCbQuery(this.callbackQuery.id, ...args);
    }
    answerGameQuery(...args) {
        this.assert(this.callbackQuery, 'answerGameQuery');
        return this.telegram.answerGameQuery(this.callbackQuery.id, ...args);
    }
    answerShippingQuery(...args) {
        this.assert(this.shippingQuery, 'answerShippingQuery');
        return this.telegram.answerShippingQuery(this.shippingQuery.id, ...args);
    }
    answerPreCheckoutQuery(...args) {
        this.assert(this.preCheckoutQuery, 'answerPreCheckoutQuery');
        return this.telegram.answerPreCheckoutQuery(this.preCheckoutQuery.id, ...args);
    }
    editMessageText(text, extra) {
        var _a, _b, _c, _d;
        this.assert((_a = this.callbackQuery) !== null && _a !== void 0 ? _a : this.inlineMessageId, 'editMessageText');
        return this.telegram.editMessageText((_b = this.chat) === null || _b === void 0 ? void 0 : _b.id, (_d = (_c = this.callbackQuery) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.message_id, this.inlineMessageId, text, extra);
    }
    editMessageCaption(caption, extra) {
        var _a, _b, _c, _d;
        this.assert((_a = this.callbackQuery) !== null && _a !== void 0 ? _a : this.inlineMessageId, 'editMessageCaption');
        return this.telegram.editMessageCaption((_b = this.chat) === null || _b === void 0 ? void 0 : _b.id, (_d = (_c = this.callbackQuery) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.message_id, this.inlineMessageId, caption, extra);
    }
    editMessageMedia(media, extra) {
        var _a, _b, _c, _d;
        this.assert((_a = this.callbackQuery) !== null && _a !== void 0 ? _a : this.inlineMessageId, 'editMessageMedia');
        return this.telegram.editMessageMedia((_b = this.chat) === null || _b === void 0 ? void 0 : _b.id, (_d = (_c = this.callbackQuery) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.message_id, this.inlineMessageId, media, extra);
    }
    editMessageReplyMarkup(markup) {
        var _a, _b, _c, _d;
        this.assert((_a = this.callbackQuery) !== null && _a !== void 0 ? _a : this.inlineMessageId, 'editMessageReplyMarkup');
        return this.telegram.editMessageReplyMarkup((_b = this.chat) === null || _b === void 0 ? void 0 : _b.id, (_d = (_c = this.callbackQuery) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.message_id, this.inlineMessageId, markup);
    }
    editMessageLiveLocation(latitude, longitude, markup) {
        var _a, _b, _c, _d;
        this.assert((_a = this.callbackQuery) !== null && _a !== void 0 ? _a : this.inlineMessageId, 'editMessageLiveLocation');
        return this.telegram.editMessageLiveLocation((_b = this.chat) === null || _b === void 0 ? void 0 : _b.id, (_d = (_c = this.callbackQuery) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.message_id, this.inlineMessageId, latitude, longitude, markup);
    }
    stopMessageLiveLocation(markup) {
        var _a, _b, _c, _d;
        this.assert((_a = this.callbackQuery) !== null && _a !== void 0 ? _a : this.inlineMessageId, 'stopMessageLiveLocation');
        return this.telegram.stopMessageLiveLocation((_b = this.chat) === null || _b === void 0 ? void 0 : _b.id, (_d = (_c = this.callbackQuery) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.message_id, this.inlineMessageId, markup);
    }
    reply(...args) {
        this.assert(this.chat, 'reply');
        return this.telegram.sendMessage(this.chat.id, ...args);
    }
    getChat(...args) {
        this.assert(this.chat, 'getChat');
        return this.telegram.getChat(this.chat.id, ...args);
    }
    exportChatInviteLink(...args) {
        this.assert(this.chat, 'exportChatInviteLink');
        return this.telegram.exportChatInviteLink(this.chat.id, ...args);
    }
    kickChatMember(...args) {
        this.assert(this.chat, 'kickChatMember');
        return this.telegram.kickChatMember(this.chat.id, ...args);
    }
    unbanChatMember(...args) {
        this.assert(this.chat, 'unbanChatMember');
        return this.telegram.unbanChatMember(this.chat.id, ...args);
    }
    restrictChatMember(...args) {
        this.assert(this.chat, 'restrictChatMember');
        return this.telegram.restrictChatMember(this.chat.id, ...args);
    }
    promoteChatMember(...args) {
        this.assert(this.chat, 'promoteChatMember');
        return this.telegram.promoteChatMember(this.chat.id, ...args);
    }
    setChatAdministratorCustomTitle(...args) {
        this.assert(this.chat, 'setChatAdministratorCustomTitle');
        return this.telegram.setChatAdministratorCustomTitle(this.chat.id, ...args);
    }
    setChatPhoto(...args) {
        this.assert(this.chat, 'setChatPhoto');
        return this.telegram.setChatPhoto(this.chat.id, ...args);
    }
    deleteChatPhoto(...args) {
        this.assert(this.chat, 'deleteChatPhoto');
        return this.telegram.deleteChatPhoto(this.chat.id, ...args);
    }
    setChatTitle(...args) {
        this.assert(this.chat, 'setChatTitle');
        return this.telegram.setChatTitle(this.chat.id, ...args);
    }
    setChatDescription(...args) {
        this.assert(this.chat, 'setChatDescription');
        return this.telegram.setChatDescription(this.chat.id, ...args);
    }
    pinChatMessage(...args) {
        this.assert(this.chat, 'pinChatMessage');
        return this.telegram.pinChatMessage(this.chat.id, ...args);
    }
    unpinChatMessage(...args) {
        this.assert(this.chat, 'unpinChatMessage');
        return this.telegram.unpinChatMessage(this.chat.id, ...args);
    }
    leaveChat(...args) {
        this.assert(this.chat, 'leaveChat');
        return this.telegram.leaveChat(this.chat.id, ...args);
    }
    setChatPermissions(...args) {
        this.assert(this.chat, 'setChatPermissions');
        return this.telegram.setChatPermissions(this.chat.id, ...args);
    }
    getChatAdministrators(...args) {
        this.assert(this.chat, 'getChatAdministrators');
        return this.telegram.getChatAdministrators(this.chat.id, ...args);
    }
    getChatMember(...args) {
        this.assert(this.chat, 'getChatMember');
        return this.telegram.getChatMember(this.chat.id, ...args);
    }
    getChatMembersCount(...args) {
        this.assert(this.chat, 'getChatMembersCount');
        return this.telegram.getChatMembersCount(this.chat.id, ...args);
    }
    setPassportDataErrors(errors) {
        this.assert(this.from, 'setPassportDataErrors');
        return this.telegram.setPassportDataErrors(this.from.id, errors);
    }
    replyWithPhoto(...args) {
        this.assert(this.chat, 'replyWithPhoto');
        return this.telegram.sendPhoto(this.chat.id, ...args);
    }
    replyWithMediaGroup(...args) {
        this.assert(this.chat, 'replyWithMediaGroup');
        return this.telegram.sendMediaGroup(this.chat.id, ...args);
    }
    replyWithAudio(...args) {
        this.assert(this.chat, 'replyWithAudio');
        return this.telegram.sendAudio(this.chat.id, ...args);
    }
    replyWithDice(...args) {
        this.assert(this.chat, 'replyWithDice');
        return this.telegram.sendDice(this.chat.id, ...args);
    }
    replyWithDocument(...args) {
        this.assert(this.chat, 'replyWithDocument');
        return this.telegram.sendDocument(this.chat.id, ...args);
    }
    replyWithSticker(...args) {
        this.assert(this.chat, 'replyWithSticker');
        return this.telegram.sendSticker(this.chat.id, ...args);
    }
    replyWithVideo(...args) {
        this.assert(this.chat, 'replyWithVideo');
        return this.telegram.sendVideo(this.chat.id, ...args);
    }
    replyWithAnimation(...args) {
        this.assert(this.chat, 'replyWithAnimation');
        return this.telegram.sendAnimation(this.chat.id, ...args);
    }
    replyWithVideoNote(...args) {
        this.assert(this.chat, 'replyWithVideoNote');
        return this.telegram.sendVideoNote(this.chat.id, ...args);
    }
    replyWithInvoice(...args) {
        this.assert(this.chat, 'replyWithInvoice');
        return this.telegram.sendInvoice(this.chat.id, ...args);
    }
    replyWithGame(...args) {
        this.assert(this.chat, 'replyWithGame');
        return this.telegram.sendGame(this.chat.id, ...args);
    }
    replyWithVoice(...args) {
        this.assert(this.chat, 'replyWithVoice');
        return this.telegram.sendVoice(this.chat.id, ...args);
    }
    replyWithPoll(...args) {
        this.assert(this.chat, 'replyWithPoll');
        return this.telegram.sendPoll(this.chat.id, ...args);
    }
    replyWithQuiz(...args) {
        this.assert(this.chat, 'replyWithQuiz');
        return this.telegram.sendQuiz(this.chat.id, ...args);
    }
    stopPoll(...args) {
        this.assert(this.chat, 'stopPoll');
        return this.telegram.stopPoll(this.chat.id, ...args);
    }
    replyWithChatAction(...args) {
        this.assert(this.chat, 'replyWithChatAction');
        return this.telegram.sendChatAction(this.chat.id, ...args);
    }
    replyWithLocation(...args) {
        this.assert(this.chat, 'replyWithLocation');
        return this.telegram.sendLocation(this.chat.id, ...args);
    }
    replyWithVenue(...args) {
        this.assert(this.chat, 'replyWithVenue');
        return this.telegram.sendVenue(this.chat.id, ...args);
    }
    replyWithContact(...args) {
        this.assert(this.chat, 'replyWithContact');
        return this.telegram.sendContact(this.chat.id, ...args);
    }
    getStickerSet(setName) {
        return this.telegram.getStickerSet(setName);
    }
    setChatStickerSet(setName) {
        this.assert(this.chat, 'setChatStickerSet');
        return this.telegram.setChatStickerSet(this.chat.id, setName);
    }
    deleteChatStickerSet() {
        this.assert(this.chat, 'deleteChatStickerSet');
        return this.telegram.deleteChatStickerSet(this.chat.id);
    }
    setStickerPositionInSet(sticker, position) {
        return this.telegram.setStickerPositionInSet(sticker, position);
    }
    setStickerSetThumb(...args) {
        return this.telegram.setStickerSetThumb(...args);
    }
    deleteStickerFromSet(sticker) {
        return this.telegram.deleteStickerFromSet(sticker);
    }
    uploadStickerFile(...args) {
        this.assert(this.from, 'uploadStickerFile');
        return this.telegram.uploadStickerFile(this.from.id, ...args);
    }
    createNewStickerSet(...args) {
        this.assert(this.from, 'createNewStickerSet');
        return this.telegram.createNewStickerSet(this.from.id, ...args);
    }
    addStickerToSet(...args) {
        this.assert(this.from, 'addStickerToSet');
        return this.telegram.addStickerToSet(this.from.id, ...args);
    }
    getMyCommands() {
        return this.telegram.getMyCommands();
    }
    setMyCommands(commands) {
        return this.telegram.setMyCommands(commands);
    }
    replyWithMarkdown(markdown, extra) {
        return this.reply(markdown, { parse_mode: 'Markdown', ...extra });
    }
    replyWithMarkdownV2(markdown, extra) {
        return this.reply(markdown, { parse_mode: 'MarkdownV2', ...extra });
    }
    replyWithHTML(html, extra) {
        return this.reply(html, { parse_mode: 'HTML', ...extra });
    }
    deleteMessage(messageId) {
        this.assert(this.chat, 'deleteMessage');
        if (typeof messageId !== 'undefined') {
            return this.telegram.deleteMessage(this.chat.id, messageId);
        }
        this.assert(this.message, 'deleteMessage');
        return this.telegram.deleteMessage(this.chat.id, this.message.message_id);
    }
    forwardMessage(chatId, extra) {
        this.assert(this.message, 'forwardMessage');
        return this.telegram.forwardMessage(chatId, this.message.chat.id, this.message.message_id, extra);
    }
}
exports.Context = Context;
exports.default = Context;
