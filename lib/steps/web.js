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
     * @this Steps
     */
    installSeleniumDrivers: async function () {

        var opts = {
            logger: message => logger.debug(message)
        };

        await new Promise((resolve, reject) => {

            selenium.install(opts, err => {
                if (err) reject(err);
                logger.debug("Selenium drivers are installed");
                resolve();
            });
        });
    },
    /**
     * Step to start selenium server.
     *
     * @method
     * @instance
     * @async
     * @this Steps
     */
    startSeleniumServer: async function () {

        var opts = {};
        this._seleniumProc = await new Promise((resolve, reject) => {

            selenium.start(opts, (err, child) => {
                if (err) reject(err);
                logger.debug(`Selenium server starts with PID ${child.pid}`);
                resolve(child);
            })
        });
    },
    /**
     * Step to stop selenium server.
     *
     * @method
     * @instance
     * @this Steps
     */
    stopSeleniumServer: function () {
        this._seleniumProc.kill();
    },
    /**
     * Step to launch browser.
     *
     * @method
     * @instance
     * @async
     * @this Steps
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check step result or no.
     * @throws {Error} - if browser isn't launched
     */
    launchBrowser: async function (opts) {

        opts = U.defVal(opts, {});
        opts.check = U.defVal(opts.check, true);

        if (this._isBrowserLaunched) return;
        await this._webdriver.init();

        if (opts.check) {
            expect(await this._webdriver.session(),
                   "Browser isn't launched").to.not.be.null;
        };
        if (CONF.resolution && CONF.platform === "pc") {
            await this._webdriver.setViewportSize({ width: CONF.resolution.width,
                                                 height: CONF.resolution.height });
        };
        this._isBrowserLaunched = true;
    },
    /**
     * Step to close browser.
     *
     * @method
     * @instance
     * @async
     * @this Steps
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check step result or no.
     * @throws {Error} - if browser isn't closed
     */
    closeBrowser: async function (opts) {

        opts = U.defVal(opts, {});
        opts.check = U.defVal(opts.check, true);

        if (!this._isBrowserLaunched) return;
        await this._webdriver.end();

        if (opts.check) {
            expect(await this._webdriver.session(),
                   "Browser isn't closed").to.be.null;
        };
        this._isBrowserLaunched = false;
    },
    /**
     * Step to restart browser.
     *
     * @method
     * @instance
     * @async
     * @this Steps
     * @arg {object} [opts] - step options
     * @arg {boolean} [opts.check=true] - flag to check step result or no
     */
    restartBrowser: async function (opts) {
        await this.closeBrowser(opts);
        await this.pause(1000, "between browser restarting");
        await this.launchBrowser(opts);
    },
    /**
     * Step to open page in browser.
     *
     * @method
     * @instance
     * @async
     * @this Steps
     * @arg {string|object} pageUrl - URL or page.
     */
    openPage: async function (webUrl, opts) {
        await this._webdriver.url(webUrl);
    },
};
