"use strict";
/**
 * Contains code, responsible for proxy server implementation.
 *
 * @module
 */

var os = require("os");
var http = require("http");
var https = require("https");
var url = require("url");
var util = require("util");

var _ = require("lodash");
var express = require("express");
var httpProxy = require("http-proxy");

var CONF = require("../config");
var utils = require("../utils");

/**
 * Creates a new instance of ProxyServer.
 *
 * @class
 * @arg {object} [opts] - proxy options
 * @arg {boolean} [opts.useCache=false] - flag to cache and take from cache responses
 */
var ProxyServer = module.exports.ProxyServer = function (opts) {
    BaseProxy.call(this);
    opts = opts || {};

    this._server = null;
    this._proxy = null;
    this._responses = {};
    this.isRunning = false;
    this.useCache = !!opts.useCache;

    var parsedUrl = url.parse(CONF.initUrl);

    if (parsedUrl.protocol === "https:") {

        this._proxy = httpProxy.createProxyServer({
            target: "https://" + parsedUrl.host,
            agent: https.globalAgent,
            headers: { host: parsedUrl.hostname },
            proxyTimeout: CONF.timeout.pageLoad,
        });
    } else if (parsedUrl.protocol === "http:") {

        this._proxy = httpProxy.createProxyServer({
            target: {
                host: parsedUrl.hostname,
                port: parsedUrl.port,
            },
            proxyTimeout: CONF.timeout.pageLoad,
        });
    } else {
        throw new Error("Unexpected URL protocol " + parsedUrl.protocol);
    };

    var app = express();
    app.use(async (req, res) => {
        this.req = req;
        this.res = res;
        for (var mw of middleware) await mw.call(this);
        delete this.req;
        delete this.res;
        this._proxy.web(req, res);
    });
    this._server = http.createServer(app);
};

util.inherits(ProxyServer, BaseProxy);
/**
 * Starts proxy server if it"s not started yet.
 *
 * @method
 */
ProxyServer.prototype.start = function () {
    if (this.isRunning) return;
    this._server.listen(CONF.proxyPort);
    this.isRunning = true;
};
/**
 * Stops proxy server if it"s not stopped yet.
 *
 * @method
 */
ProxyServer.prototype.stop = function () {
    if (!this.isRunning) return;
    this._server.close();
    this._proxy.close();
    this.isRunning = false;
};
