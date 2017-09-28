"use strict";
/**
 * Contains proxy middlewares
 *
 * @module
 */

var _ = require("lodash");

var CONF = require("../../config");
var logger = require("../../logger");
/**
 * Middleware to gather information about requests and responses.
 *
 * @function
 */
var info module.exports = function () {
    if (!this.responsesData) return false;

    var data = { name: req.headers.host + req.url,
                 encoding: req.headers["content-encoding"] || "identity",
                 size: 0,
                 chunkSizes: [] };
    this.responsesData.push(data);

    var resWrite = this.res.write;
    var resEnd = this.res.end;

    var addData = chunk => {
        if (!chunk) return;
        data.chunkSizes.push(chunk.length);
        data.size += chunk.length;
    };

    this.res.write = function (chunk) {
        addData(chunk);
        resWrite.apply(this, arguments);
    };

    this.res.end = function (chunk) {
        addData(chunk);
        resEnd.apply(this, arguments);
    };

    return false;
};
