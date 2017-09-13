"use strict";
/**
 * Contains global functions and helpers
 *
 * @module
 */
var _ = require("lodash");
/**
 * Verification matcher
 *
 * @function
 * @global
 */
global.expect = require("chai").expect;
/**
 * config
 *
 * @global
 */
global.CONF = require("./config");
/**
 * steps
 *
 * @function
 * @global
 */
global.SS = new (require("./steps"));
if (CONF.isWeb) {
    var wdio = require("webdriverio");
    var webdriver = wdio.remote(CONF.webdriver);
    SS.setWebdriver(webdriver);
};
/**
 * Scope
 *
 * @function
 * @global
 */
global.scope = describe;
/**
 * session
 */
var sessNum = 0;
global.session = (name, ctx, func) => {

    if (!func && !ctx) {
        func = name;
        ctx = {};
        name = `Session ${new Date}`;
    } else if (!func) {
        func = ctx;
        ctx = name;
        name = `Session ${new Date}`;
    };

    sessNum++;
    ctx.sessionNumber = sessNum;

    scope(name, () => {
        beforeSession(ctx);
        func();
        afterSession(ctx);
    });
};
/**
 * before session
 */
global.beforeSession = ctx => {
    if (CONF.isWeb) {
        before(async () => {
            if (!CONF.noDriversInstall) await SS.installSeleniumDrivers();
            await SS.startSeleniumServer();
            await SS.launchBrowser();
        });
    };
};
/**
 * after session
 */
global.afterSession = ctx => {
    if (CONF.isWeb) {
        after(async () => await SS.closeBrowser());
        after(async () => await SS.stopSeleniumServer());
    };
};
/**
 * Base Test
 */
global.baseTest = (names => {
    return (name, func) => {

        if (names.includes(name)) {
            logger.warn(`Test case "${name}" is added already. \
                         Test case with the same name will be omitted.`);
            return;
        };
        names.push(name);

        var testCase = new TestCase(name);
        var retries = CONF.testRetries;

        CONF.testCases.push(testCase);

        scope(name, () => {

            var testFunc = ctxs => {
                ctxs = ctxs || [{}];

                before(() => {
                    testCase.reset();
                    CONF.curTestCase = testCase;
                });

                for (var ctx of ctxs) func(ctx);

                after(() => {
                    if (!testCase.isFailed() || retries <= 0) return;
                    retries--;

                    var retryNum = CONF.testRetries - retries;
                    var ctx = { retryNumber: retryNum };

                    session(`Retry #${retryNum}`, ctx, () => {
                        testFunc(testCase.failedParams);
                    });
                });
            };
            testFunc();
        });
    };
})([]);
/**
 * Test
 *
 * @function
 * @global
 */
global.test = (name, func) => {
    baseTest(name, ctx => {
        func(ctx);
    });
};
/**
 * Step
 *
 * @function
 * @global
 */
global.step = it;
/**
 * beforeStep
 *
 * @function
 * @global
 */
global.beforeStep = beforeEach;
/**
 * afterStep
 *
 * @function
 * @global
 */
global.afterStep = afterEach;
/**
 * forEachLanguage
 *
 * @function
 * @global
 */
global.forEachLanguage = (ctx, func) => {
    (ctx.languages || CONF.languages).forEach(lang => {
        scope(`for language "${lang}"`, () => {
            func();
        });
    });
};
