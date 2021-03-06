"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poll = exports.animation = exports.video_note = exports.photo = exports.sticker = exports.document = exports.video = exports.audio = exports.voice = exports.venue = exports.location = exports.contact = exports.text = exports.copyMethods = void 0;
const markup_1 = __importDefault(require("../markup"));
const { formatHTML } = markup_1.default;
exports.copyMethods = {
    audio: 'sendAudio',
    contact: 'sendContact',
    document: 'sendDocument',
    location: 'sendLocation',
    photo: 'sendPhoto',
    sticker: 'sendSticker',
    text: 'sendMessage',
    venue: 'sendVenue',
    video: 'sendVideo',
    video_note: 'sendVideoNote',
    animation: 'sendAnimation',
    voice: 'sendVoice',
    poll: 'sendPoll',
};
function text(message) {
    return {
        reply_markup: message.reply_markup,
        parse_mode: 'HTML',
        text: formatHTML(message.text, message.entities),
    };
}
exports.text = text;
function contact(message) {
    return {
        reply_markup: message.reply_markup,
        phone_number: message.contact.phone_number,
        first_name: message.contact.first_name,
        last_name: message.contact.last_name,
    };
}
exports.contact = contact;
function location(message) {
    return {
        reply_markup: message.reply_markup,
        latitude: message.location.latitude,
        longitude: message.location.longitude,
    };
}
exports.location = location;
function venue(message) {
    return {
        reply_markup: message.reply_markup,
        latitude: message.venue.location.latitude,
        longitude: message.venue.location.longitude,
        title: message.venue.title,
        address: message.venue.address,
        foursquare_id: message.venue.foursquare_id,
    };
}
exports.venue = venue;
function voice(message) {
    return {
        reply_markup: message.reply_markup,
        voice: message.voice.file_id,
        duration: message.voice.duration,
        caption: formatHTML(message.caption, message.caption_entities),
        parse_mode: 'HTML',
    };
}
exports.voice = voice;
function audio(message) {
    var _a;
    return {
        reply_markup: message.reply_markup,
        audio: message.audio.file_id,
        thumb: (_a = message.audio.thumb) === null || _a === void 0 ? void 0 : _a.file_id,
        duration: message.audio.duration,
        performer: message.audio.performer,
        title: message.audio.title,
        caption: formatHTML(message.caption, message.caption_entities),
        parse_mode: 'HTML',
    };
}
exports.audio = audio;
function video(message) {
    var _a;
    return {
        reply_markup: message.reply_markup,
        video: message.video.file_id,
        thumb: (_a = message.video.thumb) === null || _a === void 0 ? void 0 : _a.file_id,
        caption: formatHTML(message.caption, message.caption_entities),
        parse_mode: 'HTML',
        duration: message.video.duration,
        width: message.video.width,
        height: message.video.height,
    };
}
exports.video = video;
function document(message) {
    return {
        reply_markup: message.reply_markup,
        document: message.document.file_id,
        caption: formatHTML(message.caption, message.caption_entities),
        parse_mode: 'HTML',
    };
}
exports.document = document;
function sticker(message) {
    return {
        reply_markup: message.reply_markup,
        sticker: message.sticker.file_id,
    };
}
exports.sticker = sticker;
function photo(message) {
    return {
        reply_markup: message.reply_markup,
        photo: message.photo[message.photo.length - 1].file_id,
        parse_mode: 'HTML',
        caption: formatHTML(message.caption, message.caption_entities),
    };
}
exports.photo = photo;
// eslint-disable-next-line @typescript-eslint/naming-convention
function video_note(message) {
    var _a;
    return {
        reply_markup: message.reply_markup,
        video_note: message.video_note.file_id,
        thumb: (_a = message.video_note.thumb) === null || _a === void 0 ? void 0 : _a.file_id,
        length: message.video_note.length,
        duration: message.video_note.duration,
    };
}
exports.video_note = video_note;
function animation(message) {
    var _a;
    return {
        reply_markup: message.reply_markup,
        animation: message.animation.file_id,
        thumb: (_a = message.animation.thumb) === null || _a === void 0 ? void 0 : _a.file_id,
        duration: message.animation.duration,
    };
}
exports.animation = animation;
function poll(message) {
    return {
        question: message.poll.question,
        type: message.poll.type,
        is_anonymous: message.poll.is_anonymous,
        allows_multiple_answers: message.poll.allows_multiple_answers,
        correct_option_id: message.poll.correct_option_id,
        options: message.poll.options.map(({ text }) => text),
    };
}
exports.poll = poll;
