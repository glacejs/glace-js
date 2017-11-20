"use strict";
/**
 * Middleware to store request body.
 *
 * @module
 */

var reqbody = module.exports = function () {

    var chunks = [];
    var req = this.req;

    if (req.body) return;

    var emit = req.emit;
    req.emit = function (ev, chunk) {
        if (ev === "data") {
            if (chunk instanceof Buffer) chunks.push(chunk);
        } else if (ev === "end") {
            if (chunk instanceof Buffer) chunks.push(chunk);
            req.body = Buffer.concat(chunks);
        };
        emit.apply(this, arguments);
    };
};
