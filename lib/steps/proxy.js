"use strict";
/**
 * Steps for proxy.
 *
 * @module
 */

var CONF = require("../config");
var U = require("../utils");
var GlobalProxy = require("../proxy").GlobalProxy;
var WebProxy = require("../proxy").WebProxy;
/**
 * Steps to manage proxy.
 *
 * @mixin
 */
module.exports = {
    /**
     * Step to start proxy.
     *
     * @method
     * @instance
     * @async
     * @this Steps
     * @arg {object} [opts] - Step to start proxy.
     * @arg {string} [opts.appUrl] - Web application url which will
     *  be proxied. Default value will be requested from `config.appUrl`
     *  if it is specified.
     * @arg {boolean} [opts.useCache] - Flag to use proxy cache for
     *  responses. Default value will be requested from `config.useCache`
     *  if it is specified.
     * @arg {number} [opts.timeout] - Proxy timeout to break connection.
     *  Default value will be requested from `config.timeout.proxy`.
     * @arg {number} [opts.port] - Proxy port. Default value will be
     *  requested from `config.proxyPort`.
     * @arg {boolean} [opts.check=true] - Flag to check that proxy is launched.
     * @throws {AssertionError} - If proxy is not launched.
     * @return {string} - Proxy url to web application.
     */
    startProxy: async function (opts) {

        opts = U.defVal(opts, {});
        var appUrl = U.defVal(opts.appUrl, CONF.appUrl);
        var useCache = U.defVal(opts.useCache, CONF.useCache);
        var timeout = U.defVal(opts.timeout, CONF.timeout.proxy);
        var port = U.defVal(opts.port, CONF.proxyPort);
        var check = U.defVal(opts.check, true);

        if (!this._proxy) {
            this._proxy = new WebProxy({ url: appUrl,
                                         useCache: useCache,
                                         timeout: timeout,
                                         port: port });
        };
        await this._proxy.start();

        if (check) {
            expect(this._proxy.isRunning,;
                   "Proxy is not launched").be.true;
        };

        this._appUrl = this._proxy.proxyUrl;
    },
    /**
     * Step to stop proxy.
     *
     * @method
     * @instance
     * @async
     * @this Steps
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that proxy is
     *  stopped.
     * @throws {AssertionError} - If proxy is still running.
     */
    stopProxy: async function (opts) {

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

        if (!this._proxy) return;
        await this._proxy.stop();

        if (check) {
            expect(this._proxy.isRunning,
                   "Proxy is still running").be.false;
        };
    },
    /**
     * Step to start global proxy.
     *
     * @method
     * @instance
     * @async
     * @this Steps
     * @arg {object} [opts] - Step to start proxy.
     * @arg {boolean} [opts.useCache] - Flag to use proxy cache for
     *  responses. Default value will be requested from `config.useCache`
     *  if it is specified.
     * @arg {number} [opts.timeout] - Proxy timeout to break connection.
     *  Default value will be requested from `config.timeout.proxy`.
     * @arg {number} [opts.port] - Proxy port. Default value will be
     *  requested from `config.proxyPort`.
     * @arg {boolean} [opts.check=true] - Flag to check that proxy is launched.
     * @throws {AssertionError} - If global proxy is not launched.
     */
    startGlobalProxy: async function (opts) {

        opts = U.defVal(opts, {});
        var useCache = U.defVal(opts.useCache, CONF.useCache);
        var timeout = U.defVal(opts.timeout, CONF.timeout.proxy);
        var port = U.defVal(opts.port, CONF.globalProxyPort);
        var check = U.defVal(opts.check, true);

        if (!this._globalProxy) {
            this._globalProxy = new GlobalProxy({
                useCache: useCache,
                timeout: timeout,
                port: port,
                installCertificate: CONF.installCertificate });
        };

        await this._globalProxy.start();

        if (check) {
            expect(this._globalProxy.isRunning,
                   "Global proxy is not launched")
                .to.be.true;
        };
    },
    /**
     * Step to stop global proxy.
     *
     * @method
     * @instance
     * @async
     * @this Steps
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that global
     *  proxy is stopped.
     * @throws {AssertionError} - If global proxy is still running.
     */
    stopGlobalProxy: async function (opts) {

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

        if (!this._globalProxy) return;
        await this._globalProxy.stop();

        if (check) {
            expect(this._globalProxy.isRunning,
                   "Global proxy is still running").be.false;
        };
    },
    /**
     * Step to limit proxy speed.
     *
     * @method
     * @instance
     * @this Steps
     * @arg {number} speed - Proxy limited speed, kb/s.
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flat to check that proxy speed
     *  is limited.
     * @throws {AssertionError} - If proxy speed is not limited.
     */
    limitProxySpeed: function (speed, opts) {

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

        this._checkProxy();

        if (this._proxy) {
            this._proxy.setSpeed(speed);
        };
        if (this._globalProxy) {
            this._globalProxy.setSpeed(speed);
        };

        if (check) {
            if (this._proxy) {
                expect(this._proxy.speed,
                       "Proxy speed is not limited").be.equal(speed);
            };
            if (this._globalProxy) {
                expect(this._globalProxy.speed,
                       "Global proxy speed is not limited").be.equal(speed);
            };
        };
    },
    /**
     * Step to unlimit proxy speed.
     *
     * @method
     * @instance
     * @this Steps
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that proxy speed
     *  is unlimited.
     * @throws {AssertionError} - If proxy speed is still limited.
     */
    unlimitProxySpeed: function (opts) {

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

        this._checkProxy();

        if (this._proxy) {
            this._proxy.resetSpeed();
        };
        if (this._globalProxy) {
            this._globalProxy.resetSpeed();
        };

        if (check) {
            if (this._proxy) {
                expect(this._proxy.speed,
                       "Proxy speed still has limited value").be.null;
            };
            if (this._globalProxy) {
                expect(this._globalProxy.speed,
                       "Global proxy speed still has limited value").be.null;
            };
        };
    },
    /**
     * Step to start responses measurement.
     *
     * @method
     * @instance
     * @this Steps
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that responses
     *  measurement is launched.
     * @throws {AssertionError} - If responses measurement is not launched.
     */
    measureResponses: function (opts) {

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

        this._checkProxy();

        if (this._proxy) {
            this._proxy.measureResponses();
        };
        if (this._globalProxy) {
            this._globalProxy.measureResponses();
        };

        if (check) {
            if (this._proxy) {
                expect(this._proxy.getResponsesData(),
                       "Proxy responses measurement is not launched")
                    .not.be.null;
            };
            if (this._globalProxy) {
                expect(this._globalProxy.getResponsesData(),
                       "Global proxy responses measurement is not launched")
                    .not.be.null;
            };
        };
    },
    /**
     * Step to get measured responses data.
     *
     * @method
     * @instance
     * @this Steps
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that responses
     *  data are present.
     * @throws {AssertionError} - If responses data are absent.
     */
    getResponsesData: function (opts) {

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

        this._checkProxy();

        var data = [];

        if (this._proxy && this._proxy.getResponsesData()) {
            data = data.concat(this._proxy.getResponsesData());
        };
        if (this._globalProxy && this._globalProxy.getResponsesData()) {
            data = data.concat(this._globalProxy.getResponsesData());
        };

        if (check) {
            expect(_.isEmpty(data),
                   "Responses data are absent").be.false;
        };

        return data;
    },
    /**
     * Step to stop responses measurement.
     *
     * @method
     * @instance
     * @this Steps
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that responses
     *  measurement is stopped.
     * @throws {AssertionError} - If responses measurement is still running.
     */
    unmeasureResponses: function (opts) {

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

        this._checkProxy();

        if (this._proxy) {
            this._proxy.unmeasureResponses();
        };
        if (this._globalProxy) {
            this._globalProxy.unmeasureResponses();
        };

        if (check) {
            if (this._proxy) {
                expect(this._proxy.getResponsesData(),
                       "Proxy responses measurement is still running")
                    .to.be.null;
            };
            if (this._globalProxy) {
                expect(this._globalProxy.getResponsesData(),
                       "Global proxy responses measurement is still running")
                    .to.be.null;
            };
        };
    },
    /**
     * Helper to check that proxy is launched.
     *
     * @method
     * @protected
     * @instance
     * @this Steps
     * @throws {AssertionError} - If no proxy is launched.
     */
    _checkProxy: function () {
        expect(this._proxy || this._globalProxy,
               "No proxy is launched").to.not.be.undefined;
    },
};
