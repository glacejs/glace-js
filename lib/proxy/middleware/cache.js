"use strict";
/**
 * Middleware to cache responses.
 *
 * @module
 */
var fs = require("fs");
var path = require("path");

var _ = require("lodash");
var cacheManager = require("cache-manager");
var fsStore = require("cache-manager-fs");
var rimraf = require("rimraf");

var CONF = require("../../config");
var logger = require("../../logger");

var cacheFolder = path.resolve(process.cwd(), ".proxy-cache");
if (!CONF.cache.existing && fs.existsSync(cacheFolder)) {
    rimraf.sync(cacheFolder);
};

var diskCache, inited;
var init = opts => {
    opts = opts || {};
    opts.force = opts.force || false;

    if (!inited || opts.force) {;
        inited = new Promise(resolve => {

            var fillcb = null;
            if (CONF.cache.existing) fillcb = resolve;

            diskCache = cacheManager.caching({
                store: fsStore,
                options: {
                    ttl: CONF.cache.ttl,
                    maxsize: CONF.cache.size,
                    path: cacheFolder,
                    preventfill: !CONF.cache.existing,
                    fillcallback: fillcb } });

            if (!CONF.cache.existing) resolve();
        });
    };
    return inited;
};
init();
/**
 * Middleware to cache server responses and reply them.
 *
 * @function
 * @this BaseProxy
 * @return {boolean} - `true` if response was retrieved from cache, `false`
 *  otherwise.
 */
var cache = module.exports = async function () {
    if (!this.useCache) return false;
    if (!diskCache) return false;

    var req = this.req;
    var res = this.res;

    if (await fromCache(req, res)) {
        return true;
    } else {
        toCache(req, res);
        return false;
    };
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
    return new Promise((resolve, reject) => {

        diskCache.get(_getReqKey(req), (err, result) => {
            if (err) reject(err);
            resolve(result);
        });

    }).then(cached => {

        if (!cached) return false;
        logger.debug("<<< from cache:", _getReqKey(req));
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
    var statusCode = null, headers = {};

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
        logger.debug(">>> to cache:", _getReqKey(req));
        diskCache.set(_getReqKey(req), resData);
        resEnd.apply(this, arguments);
    };
};
/**
 * Initializes cache. Does nothing if it is already and no force option.
 *
 * @function
 * @arg {object} [opts] - Initialization options.
 * @arg {boolean} [opts.force=false] - Force reinitialize cache.
 * @return {Promise}
 */
cache.init = init;
/**
 * Helper to generate request key for storage.
 *
 * @function
 * @ignore
 * @arg {Request} req - Client request.
 * @return {string} - Request key according to its method, host, url.
 */
var _getReqKey = req => req.method + "_" + req.headers.host + req.url;
