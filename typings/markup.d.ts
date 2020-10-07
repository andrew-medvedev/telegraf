export = Markup;
declare class Markup {
    static removeKeyboard(value: any): Markup;
    static forceReply(value: any): Markup;
    static keyboard(buttons: any, options: any): Markup;
    static inlineKeyboard(buttons: any, options: any): Markup;
    static resize(value?: boolean): Markup;
    static selective(value?: boolean): Markup;
    static oneTime(value?: boolean): Markup;
    static button(text: any, hide?: boolean): {
        text: any;
        hide: boolean;
    };
    static contactRequestButton(text: any, hide?: boolean): {
        text: any;
        request_contact: boolean;
        hide: boolean;
    };
    static locationRequestButton(text: any, hide?: boolean): {
        text: any;
        request_location: boolean;
        hide: boolean;
    };
    static pollRequestButton(text: any, type: any, hide?: boolean): {
        text: any;
        request_poll: {
            type: any;
        };
        hide: boolean;
    };
    static urlButton(text: any, url: any, hide?: boolean): {
        text: any;
        url: any;
        hide: boolean;
    };
    static callbackButton(text: any, data: any, hide?: boolean): {
        text: any;
        callback_data: any;
        hide: boolean;
    };
    static switchToChatButton(text: any, value: any, hide?: boolean): {
        text: any;
        switch_inline_query: any;
        hide: boolean;
    };
    static switchToCurrentChatButton(text: any, value: any, hide?: boolean): {
        text: any;
        switch_inline_query_current_chat: any;
        hide: boolean;
    };
    static gameButton(text: any, hide?: boolean): {
        text: any;
        callback_game: {};
        hide: boolean;
    };
    static payButton(text: any, hide?: boolean): {
        text: any;
        pay: boolean;
        hide: boolean;
    };
    static loginButton(text: any, url: any, opts?: {}, hide?: boolean): {
        text: any;
        login_url: {
            url: any;
        };
        hide: boolean;
    };
    static formatHTML(text?: string, entities?: any[]): string;
    forceReply(value?: boolean): Markup;
    force_reply: boolean | undefined;
    removeKeyboard(value?: boolean): Markup;
    remove_keyboard: boolean | undefined;
    selective(value?: boolean): Markup;
    extra(options: any): any;
    keyboard(buttons: any, options: any): Markup;
    resize(value?: boolean): Markup;
    resize_keyboard: boolean | undefined;
    oneTime(value?: boolean): Markup;
    one_time_keyboard: boolean | undefined;
    inlineKeyboard(buttons: any, options: any): Markup;
    inline_keyboard: any[] | undefined;
    button(text: any, hide: any): {
        text: any;
        hide: boolean;
    };
    contactRequestButton(text: any, hide: any): {
        text: any;
        request_contact: boolean;
        hide: boolean;
    };
    locationRequestButton(text: any, hide: any): {
        text: any;
        request_location: boolean;
        hide: boolean;
    };
    urlButton(text: any, url: any, hide: any): {
        text: any;
        url: any;
        hide: boolean;
    };
    callbackButton(text: any, data: any, hide: any): {
        text: any;
        callback_data: any;
        hide: boolean;
    };
    switchToChatButton(text: any, value: any, hide: any): {
        text: any;
        switch_inline_query: any;
        hide: boolean;
    };
    switchToCurrentChatButton(text: any, value: any, hide: any): {
        text: any;
        switch_inline_query_current_chat: any;
        hide: boolean;
    };
    gameButton(text: any, hide: any): {
        text: any;
        callback_game: {};
        hide: boolean;
    };
    payButton(text: any, hide: any): {
        text: any;
        pay: boolean;
        hide: boolean;
    };
    loginButton(text: any, url: any, opts: any, hide: any): {
        text: any;
        login_url: {
            url: any;
        };
        hide: boolean;
    };
}
