"use strict";
/**
 * Describes global transparent proxy.
 *
 * @module
 */

var fs = require("fs");
var path = require("path");
var util = require("util");

var expect = require("chai").expect;
var MitmProxy = require("http-mitm-proxy").Proxy;
var spawn = require("cross-spawn");

var GlaceError = require("../error").GlaceError;
var U = require("../utils");
var logger = require("../logger");

var BaseProxy = require("./base");
var cache = require("./middleware/cache");
var middleware = require("./middleware");
/**
 * Patch mitm proxy error processing, in order to avoid default response
 * finalizing on reconnect.
 */
var _onError = MitmProxy.prototype._onError;
MitmProxy.prototype._onError = function (kind, ctx, err) {
    var req = ctx.clientToProxyRequest;
    if (req._reconnect > 0 && !req.socket.destroyed) {
        this.onErrorHandlers.forEach(function(handler) {
            return handler(ctx, err, kind);
        });
    } else {
        _onError.apply(this, arguments);
    };
};
/**
 * Creates new instance of `GlobalProxy`.
 *
 * @class
 * @classdesc - Contains methods to run and manage global transparent proxy.
 * @arg {object} [opts] - global proxy options
 * @arg {number} [opts.port=8080] - global proxy port
 * @arg {number} [opts.timeout=0] - global proxy timeout
 * @arg {boolean} [opts.installCertificate=false] - flag to install global
 *  proxy certificate as trusted in order to manage `https` connection or no
 * @arg {?string} [opts.rootPath] - Folder where proxy starts in order to
 *  generate self-signed certificate. By default is `current work directory`.
 * @arg {boolean} [opts.useCache=false] - flag to cache and take from cache responses
 */
var GlobalProxy = module.exports = function (opts) {

    opts = U.defVal(opts, {});
    BaseProxy.call(this, opts);

    this._installCertificate = U.defVal(opts.installCertificate, false);
    this._certificatePath = path.resolve(process.cwd(),
                                         ".http-mitm-proxy",
                                         "certs",
                                         "ca.pem");

    this._proxy = new MitmProxy();

    this._proxy.onError((ctx, err) => {
        var req = ctx.clientToProxyRequest;
        if (req._reconnect > 0 && !req.socket.destroyed) {
            logger.warn("Request reconnected", U.getReqKey(req));
            req._reconnect--;
            this._proxy._onHttpServerRequest(ctx.isSSL,
                                             ctx.clientToProxyRequest,
                                             ctx.proxyToClientResponse);
        } else {
            throw err;
        };
    });

    this._proxy.onRequest(async (ctx, callback) => {

        this.req = ctx.clientToProxyRequest;
        if (this.req._reconnect === undefined) {
            this.req._reconnect = this._reconnect;
        };
        this.res = ctx.proxyToClientResponse;

        for (var mw of middleware) if (await mw.call(this)) return;

        delete this.req;
        delete this.res;

        return callback();
    });

    // FIXME not sure that it works proper
    this._proxy.onRequestData((ctx, chunk, callback) => {
        if (ctx.clientToProxyRequest.body) {
            chunk = new Buffer("");
        };
        return callback(null, chunk);
    });
    this._proxy.onResponse((ctx, callback) => {
        if (ctx.clientToProxyRequest.body) {
            ctx.proxyToServerRequest.end(ctx.clientToProxyRequest.body);
        };
        return callback(null);
    });

    this._proxy.onResponse((ctx, callback) => {
        ctx.proxyToClientResponse.setHeader(
            "Access-Control-Allow-Origin", "*");
        return callback(null);
    });
};
util.inherits(GlobalProxy, BaseProxy);
/**
 * Starts global proxy if it"s not started yet.
 *
 * @method
 */
GlobalProxy.prototype.start = function () {
    if (this.isRunning) return;

    return new Promise((resolve, reject) => {

        this._proxy.listen({ port: this._port,
                             silent: true,
                             timeout: this._timeout },
                           err => {
                               if (err) reject(err);
                               resolve();
                           });

    }).then(() => cache.init()).then(() => {

        this.isRunning = true;

        if (this._installCertificate) {

            if (process.platform !== "win32") {
                throw new GlaceError("For your platform certificate" +
                                     "installation isn't implemented");
            };
            expect(fs.existsSync(this._certificatePath),
                   `Proxy certificate ${this._certificatePath} is absent`)
                .to.be.true;

            var proc = spawn.sync("certutil", [ "-addstore",
                                                "-enterprise",
                                                "-f", "Root",
                                                this._certificatePath ]);

            if (proc.status !== 0) {
                throw new GlaceError(
                    "Can't install proxy certificate as trusted:\n" +
                    proc.stdout.toString());
            };
        };
    });
};
/**
 * Stops global proxy if it"s not stopped yet.
 *
 * @method
 */
GlobalProxy.prototype.stop = function () {
    if (!this.isRunning) return;
    this._proxy.close();
    this.isRunning = false;
};
