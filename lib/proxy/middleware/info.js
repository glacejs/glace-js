"use strict";
/**
 * Contains proxy middlewares
 *
 * @module
 */

var _ = require("lodash");

var info = module.exports = function () {
    if (!this.responsesData) return false;

    var res = this.res;
    var req = this.req;

    var data = { name: req.headers.host + req.url,
                 reqHeaders: req.headers,
                 resHeaders: {},
                 statusCode: null,
                 statusMessage: null,
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
        data.resHeaders = _.cloneDeep(res.headers);
        data.statusCode = res.statusCode;
        data.statusMessage = data.statusMessage;
        resEnd.apply(this, arguments);
    };

    return false;
};
