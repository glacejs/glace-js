"use strict";
/**
 * Steps for proxy.
 *
 * @module
 */

module.exports = {

    startProxy: async function (check) {
        check = U.defVal(check, true);

        this._proxy = new ProxyServer({ useCache: CONF.useCache });
        await this._proxy.start();

        if (check)
            this._proxy.isRunning.should.be.true;
    },

    startProxy: async function (check) {
        check = U.defVal(check, true);

        this._proxy = new ProxyServer({ useCache: CONF.useCache });
        await this._proxy.start();

        if (check)
            this._proxy.isRunning.should.be.true;
    },

    startGlobalProxy: async function (check) {
        check = U.defVal(check, true);

        this._globalProxy = new GlobalProxy(
            { port: CONF.globalProxyPort,
              timeout: CONF.timeout.pageLoad,
              installCertificate: !CONF.disableCertificate,
              rootPath: CONF.rootPath,
              useCache: CONF.useCache });

        await this._globalProxy.start();

        if (check)
            this._globalProxy.isRunning.should.be.true;
    },

    stopGlobalProxy: async function (check) {
        check = U.defVal(check, true);

        await this._globalProxy.stop();

        if (check)
            this._globalProxy.isRunning.should.be.false;
    },

    limitProxySpeed: function (speed, opts) {
        opts = U.defVal(opts, {});
        opts.check = U.defVal(opts.check, true);

        this._checkProxy();

        if (this._proxy) this._proxy.setSpeed(speed);
        if (this._globalProxy) this._globalProxy.setSpeed(speed);

        if (opts.check) {
            if (this._proxy) this._proxy.speed.should.be.equal(speed);
            if (this._globalProxy) this._globalProxy.speed.should.be.equal(speed);
        };
    },

    unlimitProxySpeed: function (opts) {
        opts = U.defVal(opts, {});
        opts.check = U.defVal(opts.check, true);

        this._checkProxy();

        if (this._proxy) this._proxy.resetSpeed();
        if (this._globalProxy) this._globalProxy.resetSpeed();

        if (opts.check) {
            if (this._proxy) this._proxy.speed.should.be.null;
            if (this._globalProxy) this._globalProxy.speed.should.be.null;
        };
    },

    measureResponses: function (opts) {
        opts = U.defVal(opts, {});
        opts.check = U.defVal(opts.check, true);

        this._checkProxy();

        if (this._proxy) this._proxy.measureResponses();
        if (this._globalProxy) this._globalProxy.measureResponses();

        if (opts.check) {
            if (this._proxy) this._proxy.getResponsesData().should.not.be.null;
            if (this._globalProxy) this._globalProxy.getResponsesData()
                                                    .should.not.be.null;
        };
        this._responseTimer = Date.now();
    },

    getResponsesData: function (opts) {
        opts = U.defVal(opts, {});
        opts.check = U.defVal(opts.check, true);

        this._checkProxy();

        var info = [];

        if (this._proxy && this._proxy.getResponsesData()) info = info.concat(this._proxy.getResponsesData());
        if (this._globalProxy && this._globalProxy.getResponsesData()) info = info.concat(this._globalProxy.getResponsesData());

        if (opts.check) {
            _.isEmpty(info).should
                           .withMessage("No responses are captured with proxy")
                           .be.false;
        };

        return { info: info,
            durationTime: Date.now() - this._responseTimer };

    },

    unmeasureResponses: function (opts) {
        opts = U.defVal(opts, {});
        opts.check = U.defVal(opts.check, true);

        this._checkProxy();

        if (this._proxy) this._proxy.unmeasureResponses();
        if (this._globalProxy) this._globalProxy.unmeasureResponses();

        if (opts.check) {
            if (this._proxy) expect(this._proxy.getResponsesData()).to.be.null;
            if (this._globalProxy) expect(this._globalProxy.getResponsesData())
                                                    .to.be.null;
        };
    },

    _checkProxy: function () {
        expect(this._proxy || this._globalProxy)
            .withMessage("No proxy is launched")
            .to.not.be.undefined;
    }
};
