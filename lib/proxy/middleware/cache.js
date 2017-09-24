"use strict";
/**
 * 
 */

var cacheManager = require("cache-manager");
var fsStore = require("cache-manager-fs");
var _ = require("lodash");

var CONF = require("../../config");
var logger = require("../../logger");

if (CONF.useCache) {
    var diskCache = cacheManager.caching(
        { store: fsStore,
          options: { ttl: CONF.cacheTtl,
                     maxsize: CONF.cacheSize,
                     path:"proxyCache",
                     preventfill: !CONF.useExistingCache } });
} else {
    var diskCache = null;
}
/**
 * Middleware to cache server responses and reply them.\
 *
 * @function
 */
module.exports = async function () {
    if (!this.useCache) return;
    if (!(await fromCache(this.req, this.res))) toCache(this.req, this.res);
};
/**
 * Patches http response to send response from cache, if it is there.
 *
 * @function
 * @arg {object} req - http(s) request
 * @arg {object} res - http(s) response
 * @return {Promise.<boolean>} - `true` if response is in cache and
 *  was patched, otherwise `false`
 */
var fromCache = (req, res) => {
    if (_skipCache(req)) return false;

    return new Promise((resolve, reject) => {

        diskCache.get(_getReqKey(req), (err, result) => {
            if (err) reject(err);
            resolve(result);
        });

    }).then(cached => {

        if (!cached) return false;
        fullLog("<<< from cache", _getReqKey(req));
        var response = JSON.parse(cached);
        res.writeHead(response.code, response.headers);
        res.end(Buffer.from(response.data));
        return true;

    });
};
/**
 * Patches http response to put response to cache.
 *
 * @function
 * @arg {object} req - http(s) request
 * @arg {object} res - http(s) response
 */
var toCache = (req, res) => {
    if (_skipCache(req)) return;

    var statusCode = 200, headers = {};

    var resWrite = res.write;
    var resEnd = res.end;
    var resHead = res.writeHead;
    var resHeader = res.setHeader;

    var chunks = [];

    res.writeHead = function (statusCode_, statusMsg_, headers_) {
        statusCode = statusCode_;
        if (typeof(headers_) === "object") _.assign(headers, headers_);
        else if (typeof(statusMsg_) === "object") _.assign(headers, statusMsg_);
        resHead.apply(this, arguments);
    };

    res.setHeader = function(name, value) {
        headers[name] = value;
        resHeader.apply(this, arguments);
    };

    res.write = function (chunk) {
        if (chunk instanceof Buffer) chunks.push(chunk);
        resWrite.apply(this, arguments);
    };

    res.end = function (chunk) {
        if (chunk instanceof Buffer) chunks.push(chunk);
        var resData = JSON.stringify({ data: Buffer.concat(chunks).toJSON(),
                                       code: statusCode,
                                       headers: headers });
        fullLog(">>> to cache", _getReqKey(req));
        diskCache.set(_getReqKey(req), resData);
        resEnd.apply(this, arguments);
    };
};

var _getReqKey = req => req.method + "_" + req.headers.host + req.url;

var _skipCache = req => {
    for (var skippedUrl of skippedUrls)
        if (req.url.startsWith(skippedUrl)) return true;
};
