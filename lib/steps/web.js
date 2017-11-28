"use strict";
/**
 * Steps for web applications.
 *
 * @module
 */

var selenium = require("selenium-standalone");
var U = require("glacejs-utils");
var LOG = U.logger;
/**
 * Steps to manage web application.
 *
 * @mixin WebSteps
 */
module.exports = {
    /**
     * Step to install selenium drivers.
     *
     * @async
     * @method
     * @instance
     * @return {Promise<void>}
     * @throws {Error} - If there was error during drivers installation.
     */
    installSeleniumDrivers: async function () {

        var opts = {
            logger: LOG.debug.bind(LOG),
        };
        await new Promise((resolve, reject) => {

            selenium.install(opts, err => {
                if (err) reject(err);
                LOG.debug("Selenium drivers are installed");
                resolve();
            });
        });
    },
    /**
     * Step to start selenium server. Step recall will be skipped if
     *  selenium server wasn't stopped before.
     *
     * @async
     * @method
     * @instance
     * @return {Promise<void>}
     * @throws {Error} - If there was error on selenium start.
     */
    startSeleniumServer: async function () {

        if (this._seleniumProc) {
            LOG.warn("Step to start selenium server was passed already");
            return;
        };

        var opts = {};
        this._seleniumProc = await new Promise((resolve, reject) => {

            selenium.start(opts, (err, child) => {
                if (err) reject(err);
                LOG.debug(
                    `Selenium server starts with PID ${child.pid}`);
                resolve(child);
            })
        });
    },
    /**
     * Step to stop selenium server. Step call will be skipped if selenium
     *  server wasn't started before.
     *
     * @async
     * @method
     * @instance
     * @return {Promise<void>}
     * @throws {Error} - If there was error on selenium stop.
     */
    stopSeleniumServer: async function () {

        if (!this._seleniumProc) {
            LOG.warn("Step to start selenium server wasn't passed yet");
            return;
        };

        await new Promise((resolve, reject) => {

            this._seleniumProc.on("exit", (code, signal) => {
                LOG.debug(`Selenium server was stopped with`,
                          `code ${code} and signal ${signal}`);
                delete this._seleniumProc;
                resolve();
            });
            this._seleniumProc.on("error", reject);
            var result = this._seleniumProc.kill("SIGINT");
            if (!result) reject("Oops! Can't kill selenium server");
        });
    },
    /**
     * Step to launch browser. Step recall will be skipped if browser
     *  wasn't closed before.
     *
     * @async
     * @method
     * @instance
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that browser was
     *  launched.
     * @return {Promise<void>}
     * @throws {AssertionError} - If browser wasn't launched.
     */
    launchBrowser: async function (opts) {

        if (this._isBrowserLaunched) {
            LOG.debug("Step to launch browser was passed already");
            return;
        };

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

        var proxyOptions = [ "ignore-certificate-errors",
                             `proxy-server=${U.hostname}:${CONF.proxy.globalPort}`,
                             `proxy-bypass-list=localhost,127.0.0.1,${U.hostname}` ];
        var chromeArgs = this._webdriver.desiredCapabilities.chromeOptions.args;

        for (var option of proxyOptions) {
            if (this._isGlobalProxyStarted) {
                if (!chromeArgs.includes(option)) {
                    chromeArgs.push(option);
                };
            } else {
                if (chromeArgs.includes(option)) {
                    var idx = chromeArgs.indexOf(option);
                    chromeArgs.splice(idx, 1);
                };
            };
        };
        await this._webdriver.init();

        if (check) {
            expect(await this._webdriver.session(),
                   "Browser wasn't launched").to.exist;
        };

        this._isBrowserLaunched = true;
    },
    /**
     * Step to close browser. Step will be skipped if browser wasn't launched
     *  before.
     *
     * @async
     * @method
     * @instance
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that browser was closed.
     * @return {Promise<void>}
     * @throws {AssertionError} - If browser wasn't closed.
     */
    closeBrowser: async function (opts) {

        if (!this._isBrowserLaunched) {
            LOG.debug("Step to launch browser wasn't passed yet");
            return;
        };

        opts = U.defVal(opts, {});
        opts.check = U.defVal(opts.check, true);

        await this._webdriver.end();
        await this.pause(1, "webdriver process will be stopped");

        if (opts.check) {
            expect(await this._webdriver.session(),
                   "Browser wasn't closed").to.not.exist;
        };
        this._isBrowserLaunched = false;
    },
    /**
     * Step to restart browser.
     *
     * @async
     * @method
     * @instance
     * @arg {object} [opts] - Step options.
     * @return {Promise<void>}
     */
    restartBrowser: async function (opts) {
        await this.closeBrowser(opts);
        await this.launchBrowser(opts);
    },
    /**
     * Step to open URL in browser.
     *
     * @async
     * @method
     * @instance
     * @arg {string} pageUrl - URL which should be opened in browser.
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that URL is opened.
     * @arg {number} [opts.timeout] - Timeout to wait for URL will be opened
     *  in browser, ms. Default value is `CONF.timeouts.pageLoad`.
     * @return {Promise<void>}
     * @throws {Error} - If URL wasn't opened after timeout.
     */
    openUrl: async function (webUrl, opts) {

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);
        var timeout = U.defVal(opts.timeout, CONF.timeouts.pageLoad);

        await this._webdriver.url(webUrl);

        if (check) {
            var errMsg = `Browser didn't navigate to ${webUrl} ` +
                         `during ${timeout} ms`;

            await this._webdriver.waitUntil(async () => {
                var curUrl = await this._webdriver.getUrl();
                LOG.debug(`Compare current URL ${curUrl}`,
                          `with expected ${webUrl}`);
                return curUrl.startsWith(webUrl);
            }, timeout, errMsg);
        };
    },
    /**
     * Step to open application URL in browser.
     *
     * @async
     * @method
     * @instance
     * @arg {object} [opts] - Step options.
     * @return {Promise<void>}
     * @throws {AssertionError} - If application URL is not defined.
     */
    openApp: async function (opts) {
        expect(this._appUrl,
               "Application url isn't defined").to.exist;
        await this.openUrl(this._appUrl, opts);
    },
};
