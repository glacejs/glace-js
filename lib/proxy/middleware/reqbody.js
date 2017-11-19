"use strict";
/**
 * Middleware to store request body.
 *
 * @module
 */

var reqbody = module.exports = function () {

    var chunks = [];
    var req = this.req;

    req.on("data", chunk => {
        if (chunk instanceof Buffer) chunks.push(chunk);
    }).on("end", chunk => {
        if (chunk instanceof Buffer) chunks.push(chunk);
        req.body = Buffer.concat(chunks);
    });
};
