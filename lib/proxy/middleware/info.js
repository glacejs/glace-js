"use strict";
/**
 * Contains proxy middlewares
 *
 * @module
 */

var _ = require("lodash");

var CONF = require("../../config");
var logger = require("../../logger");

var info = module.exports = function () {
    if (!this.responsesData) return false;

    var res = this.res;
    var req = this.req;

    var data = { name: req.headers.host + req.url,
                 size: 0,
                 chunkSizes: [] };
    this.responsesData.push(data);

    var resWrite = res.write;
    var resEnd = res.end;

    var addData = chunk => {
        if (!chunk) return;
        data.chunkSizes.push(chunk.length);
        data.size += chunk.length;
    };

    res.write = function (chunk) {
        addData(chunk);
        resWrite.apply(this, arguments);
    };

    res.end = function (chunk) {
        addData(chunk);
        resEnd.apply(this, arguments);
    };

    return false;
};
