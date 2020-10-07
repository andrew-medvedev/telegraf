"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const util_1 = require("../../util");
const sandwich_stream_1 = __importDefault(require("sandwich-stream"));
const stream_1 = __importDefault(require("stream"));
const CRNL = '\r\n';
class MultipartStream extends sandwich_stream_1.default {
    constructor(boundary) {
        super({
            head: `--${boundary}${CRNL}`,
            tail: `${CRNL}--${boundary}--`,
            separator: `${CRNL}--${boundary}${CRNL}`,
        });
    }
    addPart(part) {
        const partStream = new stream_1.default.PassThrough();
        for (const key in part.headers) {
            const header = part.headers[key];
            partStream.write(`${key}:${header}${CRNL}`);
        }
        partStream.write(CRNL);
        if (MultipartStream.isStream(part.body)) {
            part.body.pipe(partStream);
        }
        else {
            partStream.end(part.body);
        }
        this.add(partStream);
    }
    static isStream(stream) {
        return (stream &&
            typeof stream === 'object' &&
            util_1.hasPropType(stream, 'pipe', 'function'));
    }
}
module.exports = MultipartStream;
