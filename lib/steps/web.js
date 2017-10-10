"use strict";
/**
 * Steps for web applications.
 *
 * @module
 */

var selenium = require("selenium-standalone");

var logger = require("../logger");
var U = require("../utils");
/**
 * Steps to manage web application.
 *
 * @mixin
 */
module.exports = {
    /**
     * Step to install selenium drivers.
     *
     * @method
     * @instance
     * @async
     * @throws {Error} - If there was error during drivers installation.
     */
    installSeleniumDrivers: async function () {

        var opts = {
            logger: message => logger.stepDebug(message)
        };
        await new Promise((resolve, reject) => {

            selenium.install(opts, err => {
                if (err) reject(err);
                logger.stepDebug("Selenium drivers are installed");
                resolve();
            });
        });
    },
    /**
     * Step to start selenium server. Step recall will be skipped if
     *  selenium server wasn't stopped before.
     *
     * @method
     * @instance
     * @async
     * @throws {Error} - If there was error on selenium start.
     */
    startSeleniumServer: async function () {

        if (this._seleniumProc) {
            logger.stepDebug(
                "Step to start selenium server was passed already");
            return;
        };

        var opts = {};
        this._seleniumProc = await new Promise((resolve, reject) => {

            selenium.start(opts, (err, child) => {
                if (err) reject(err);
                logger.stepDebug(
                    `Selenium server starts with PID ${child.pid}`);
                resolve(child);
            })
        });
    },
    /**
     * Step to stop selenium server. Step call will be skipped if selenium
     *  server wasn't started before.
     *
     * @method
     * @instance
     * @async
     * @throws {Error} - If there was error on selenium stop.
     */
    stopSeleniumServer: async function () {

        if (!this._seleniumProc) {
            logger.stepDebug("Step to start selenium server wasn't passed yet");
            return;
        };

        await new Promise((resolve, reject) => {

            this._seleniumProc.on("exit", (code, signal) => {
                logger.stepDebug(`Selenium server was stopped with ` +
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
     * Step to launch browser. Step recall
     *
     * @method
     * @instance
     * @async
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that browser was
     *  launched.
     * @throws {AssertionError} - If browser wasn't launched.
     */
    launchBrowser: async function (opts) {

        if (this._isBrowserLaunched) {
            logger.stepDebug("Step to launch browser was passed already");
            return;
        };

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

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
     * @method
     * @instance
     * @async
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that browser was closed.
     * @throws {AssertionError} - If browser wasn't closed.
     */
    closeBrowser: async function (opts) {

        if (!this._isBrowserLaunched) {
            logger.stepDebug("Step to launch browser wasn't passed yet");
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
     * @method
     * @instance
     * @async
     * @arg {object} [opts] - Step options.
     */
    restartBrowser: async function (opts) {
        await this.closeBrowser(opts);
        await this.launchBrowser(opts);
    },
    /**
     * Step to open URL in browser.
     *
     * @method
     * @instance
     * @async
     * @arg {string} pageUrl - URL which should be opened in browser.
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that URL is opened.
     * @arg {number} [opts.timeout] - Timeout to wait for URL will be opened
     *  in browser, ms. Default value is `CONF.timeouts.pageLoad`.
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
                logger.stepDebug(`Compare current URL ${curUrl} ` +
                                 `with expected ${webUrl}`);
                return curUrl.startsWith(webUrl);
            }, timeout, errMsg);
        };
    },
    /**
     * Step to open application URL in browser.
     *
     * @method
     * @instance
     * @async
     * @arg {object} [opts] - Step options.
     * @throws {AssertionError} - If application URL is not defined.
     */
    openApp: async function (opts) {
        expect(this._appUrl,
               "Application url isn't defined").to.exist;
        await this.openUrl(this._appUrl, opts);
    },
};
