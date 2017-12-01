"use strict";
/**
 * `GlaceJS` fixtures.
 *
 * @module
 */

var U = require("glacejs-utils");

var CONF = require("./config");
/**
 * Fixture to capture tests video.
 *
 * @global
 * @function
 * @arg {function} func - Test funciton.
 */
global.fixVideo = func => {
    var isStarted;
    var errNumBefore;

    before(async () => {
        errNumBefore = CONF.curTestCase.errors.length;
        isStarted = await SS.startVideo();
    });

    func();

    after(async () => {
        if (!isStarted) return;
        await SS.stopVideo();
        isStarted = false;

        if (!CONF.forceVideo &&
                CONF.curTestCase.errors.length === errNumBefore) {
            SS.removeVideo();
        };
    });
};
/**
 * Fixture to launch xvfb.
 * 
 * @global
 * @function
 * @arg {function} func - Test funciton.
 */
global.fixXvfb = func => {
    var isStarted;

    before(async () => {
        isStarted = await SS.startXvfb();
    });

    func();

    after(async () => {
        if (!isStarted) return;
        await SS.stopXvfb();
    });
};
/**
 * Fixture to launch selenium server.
 * 
 * @global
 * @function
 * @arg {function} func - Test funciton.
 */
global.fixSelenium = func => {
    var isStarted;

    before(async () => {
        if (CONF.installDrivers) {
            CONF.installDrivers = false;
            await SS.installSeleniumDrivers();
        };
        isStarted = await SS.startSeleniumServer();
    });

    func();

    after(async () => {
        if (!isStarted) return;
        await SS.stopSeleniumServer();
    });
};
/**
 * Fixture to launch browser.
 * 
 * @global
 * @function
 * @arg {function} func - Test funciton.
 */
global.fixBrowser = func => {
    var isStarted;

    before(async () => {
        isStarted = await SS.launchBrowser();
    });

    func();

    after(async () => {
        if (!isStarted) return;
        await SS.closeBrowser();
    });
};
/**
 * Fixture to set webdriver.
 * 
 * @global
 * @function
 * @arg {function} func - Test funciton.
 */
global.fixWebdriver = func => {

    before(() => {
        var wdio = require("webdriverio");
        var webdriver = wdio.remote(CONF.webdriver);
        SS.setWebdriver(webdriver);
    });

    func();
};
/**
 * Fixture to launch http proxy.
 * 
 * @global
 * @function
 * @arg {function} func - Test funciton.
 */
global.fixHttpProxy = func => {
    var isStarted;

    before(async () => {
        isStarted = await SS.startProxy();
    });

    func();

    after(async () => {
        if (!isStarted) return;
        await SS.stopProxy();
    });
};
/**
 * Fixture to launch http proxy.
 * 
 * @global
 * @function
 * @arg {function} func - Test funciton.
 */
global.fixGlobalProxy = func => {
    var isStarted;

    before(async () => {
        isStarted = await SS.startGlobalProxy();
    });

    func();

    after(async () => {
        if (!isStarted) return;
        await SS.stopGlobalProxy();
    });
};
/**
 * Fixture to kill webdriver processes.
 *
 * @global
 * @function
 * @arg {function} func - Test funciton.
 */
global.fixKillWebdriver = func => {

    var webdrivers = [
        "chromedriver",
    ];

    before(async () => {
        for (var procName of webdrivers) await U.killProcs(procName);
    });

    func();
};
