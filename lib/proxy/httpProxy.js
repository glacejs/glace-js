"use strict";
/**
 * Http Proxy classes and functions.
 *
 * @module
 */

var os = require("os");
var http = require("http");
var https = require("https");
var url = require("url");
var util = require("util");

var _ = require("lodash");
var expect = require("chai").expect;
var express = require("express");
var httpProxy = require("http-proxy");

var CONF = require("../config");
var U = require("../utils");

var BaseProxy = require("./base");
var middleware = require("./middleware");
/**
 * Http Proxy.
 *
 * @class
 * @arg {object} opts - Proxy options.
 * @arg {string} opts.url - URL which should be proxied.
 *  them from cache.
 */
var HttpProxy = module.exports = function (opts) {

    BaseProxy.call(this, opts);

    this._url = opts.url;
    this._server = null;

    var parsedUrl = url.parse(this._url);

    expect(["http:", "https:"],
           "Unsupported protocol").include(parsedUrl.protocol);

    if (parsedUrl.protocol === "https:") {

        this._proxy = httpProxy.createProxyServer({
            target: "https://" + parsedUrl.host,
            agent: https.globalAgent,
            headers: { host: parsedUrl.hostname },
            proxyTimeout: this._timeout,
        });

    } else {

        this._proxy = httpProxy.createProxyServer({
            target: {
                host: parsedUrl.hostname,
                port: parsedUrl.port,
            },
            proxyTimeout: this._timeout,
        });
    };

    var app = express();
    app.use(async (req, res) => {
        this.req = req;
        this.res = res;

        for (var mw of middleware) if (await mw.call(this)) return;

        delete this.req;
        delete this.res;
        this._proxy.web(req, res);
    });
    this._server = http.createServer(app);
};
util.inherits(HttpProxy, BaseProxy);
/**
 * Starts proxy server if it’s not started yet.
 *
 * @method
 */
HttpProxy.prototype.start = function () {
    if (this.isRunning) return;
    this._server.listen(this._port);
    var hostname = os.hostname().toLowerCase();
    var port = this._server.address().port;
    this.proxyUrl = `http://${hostname}:${port}`;
    this.isRunning = true;
};
/**
 * Stops proxy server if it’s not stopped yet.
 *
 * @method
 */
HttpProxy.prototype.stop = function () {
    if (!this.isRunning) return;
    this._server.close();
    this._proxy.close();
    this.proxyUrl = null;
    this.isRunning = false;
};
