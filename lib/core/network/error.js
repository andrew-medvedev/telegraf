"use strict";
class TelegramError extends Error {
    constructor(payload, on = {}) {
        super(`${payload.error_code}: ${payload.description}`);
        this.on = on;
        this.code = payload.error_code;
        this.response = payload;
        this.description = payload.description;
        this.parameters = payload.parameters;
    }
}
module.exports = TelegramError;
