import { ExtraReplyMessage, ParseMode } from './telegram-types';
import Markup from './markup';
import { Message } from 'typegram';
interface CaptionedExtra extends Omit<Extra, 'caption'> {
    caption: string;
}
declare class Extra {
    reply_to_message_id?: number;
    disable_notification?: boolean;
    disable_web_page_preview?: boolean;
    reply_markup?: ExtraReplyMessage['reply_markup'];
    parse_mode?: ParseMode;
    constructor(opts?: ExtraReplyMessage);
    load(opts?: ExtraReplyMessage): this & Pick<{
        chat_id: string | number;
        text: string;
        parse_mode?: "Markdown" | "MarkdownV2" | "HTML" | undefined;
        disable_web_page_preview?: boolean | undefined;
        disable_notification?: boolean | undefined;
        reply_to_message_id?: number | undefined;
        reply_markup?: import("typegram").InlineKeyboardMarkup | import("typegram").ReplyKeyboardMarkup | import("typegram").ReplyKeyboardRemove | import("typegram").ForceReply | undefined;
    }, "reply_markup" | "parse_mode" | "disable_notification" | "reply_to_message_id" | "disable_web_page_preview">;
    inReplyTo(messageId: Message['message_id']): this;
    notifications(value?: boolean): this;
    webPreview(value?: boolean): this;
    markup(markup: ExtraReplyMessage['reply_markup'] | ((m: Markup) => ExtraReplyMessage['reply_markup'])): this;
    HTML(value?: boolean): this;
    markdown(value?: boolean): this;
    caption(caption: string): CaptionedExtra;
    static inReplyTo(messageId: number): Extra;
    static notifications(value?: boolean): Extra;
    static webPreview(value?: boolean): Extra;
    static load(opts: ExtraReplyMessage): Extra;
    static markup(markup: ExtraReplyMessage['reply_markup']): Extra;
    static HTML(value?: boolean): Extra;
    static markdown(value?: boolean): Extra;
    static caption(caption: string): CaptionedExtra;
    static readonly Markup: typeof Markup;
}
export = Extra;
