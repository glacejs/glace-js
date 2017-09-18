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
var MitmProxy = require("http-mitm-proxy");
var spawn = require("cross-spawn");

var GlaceError = require("../error").GlaceError;
var U = require("../utils");
var BaseProxy = require("./base");
var middleware = require("./middleware");
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

    this._proxy = MitmProxy();

    this._proxy.onRequest(async (ctx, callback) => {
        this.req = ctx.clientToProxyRequest;
        this.res = ctx.proxyToClientResponse;

        for (var mw of middleware) if (await mw.call(this)) return;

        delete this.req;
        delete this.res;
        return callback();
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

    }).then(() => {

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
