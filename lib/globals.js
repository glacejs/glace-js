"use strict";
/**
 * Global framework functions and helpers.
 *
 * @module
 */

var _ = require("lodash");

var logger = require("./logger");
var TestCase = require("./testing").TestCase;
/**
 * Verification matcher with expanded abilities.
 *
 * @global
 * @function
 */
global.expect = require("chai").expect;
/**
 * Framework and tests config.
 *
 * @global
 * @namespace
 */
global.CONF = require("./config");
/**
 * Atomic steps collection.
 *
 * @global
 * @namespace
 */
global.SS = new (require("./steps"));
if (CONF.isWeb) {
    var wdio = require("webdriverio");
    var webdriver = wdio.remote(CONF.webdriver);
    SS.setWebdriver(webdriver);
};
/**
 * Tests scope.
 *
 * @global
 * @function
 */
global.scope = describe;
/**
 * Executed sessions counter.
 * 
 * @type {Number}
 */
var sessNum = 0;
/**
 * Tests session.
 *
 * @global
 * @function
 * @arg {string} [name] - Session name. By default it includes start date time.
 * @arg {object} [ctx] - Session context. By default it's empty.
 * @arg {function} func - Function with test cases.
 */
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
 * Hook to execute before tests session. May be overridden.
 *
 * @global
 * @function
 * @arg {object} ctx - Session context.
 */
global.beforeSession = ctx => {
    if (CONF.isWeb) {
        before(async () => {
            if (!CONF.noDriversInstall) {
                CONF.noDriversInstall = true;
                await SS.installSeleniumDrivers();
            };
            await SS.startSeleniumServer();
            await SS.launchBrowser();
        });
    };
};
/**
 * Hook to execute after tests session. May be overridden.
 *
 * @global
 * @function
 * @arg {object} ctx - Session context.
 */
global.afterSession = ctx => {
    if (CONF.isWeb) {
        after(async () => await SS.closeBrowser());
        after(async () => await SS.stopSeleniumServer());
    };
};
/**
 * Basis for any test case.
 *
 * If test with the same was registered already, this test will be omitted
 * with corresponding error in log.
 *
 * If retries amount is specified and this test was failed, the test will be
 * added to queue in separated session with title containing `Retry` and its
 * number.
 *
 * @global
 * @function
 * @arg {string} name - Name of test case.
 * @arg {function} func - Test function.
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

        scope("test: " + name, () => {

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
 * Test case.
 *
 * @global
 * @function
 * @arg {string} name - Name of test case.
 * @arg {function} func - Test function.
 */
global.test = (name, func) => {
    baseTest(name, ctx => {
        func(ctx);
    });
};
/**
 * Test step.
 * 
 * Contains actions and verifications, which will be executed separatly
 * from another steps. It is not the same as `SS`. `SS` is namespace with
 * atomic application actions. But this function is used to organize test
 * structure and to allocate independent test actions.
 *
 * @global
 * @function
 * @arg {string} name - Name of test case.
 * @arg {function} func - Step function.
 */
global.step = (name, func) => it("step: " + name, func);
/**
 * Hook to be executed before each test step.
 *
 * @global
 * @function
 * @arg {string} name - Name of test case.
 * @arg {function} func - Hook function.
 */
global.beforeStep = beforeEach;
/**
 * Hook to be executed after each test step.
 *
 * @global
 * @function
 * @arg {string} name - Name of test case.
 * @arg {function} func - Hook function.
 */
global.afterStep = afterEach;
/**
 * Hook to iterate test steps through all languages specifed in configuration.
 *
 * It's applicable for multilingual application. If list of languages is
 * specified, it will be used firstly. Otherwise from configuration.
 *
 * @global
 * @function
 * @arg {object} ctx - Test case context.
 * @arg {function} func - Function with test steps.
 */
global.forEachLanguage = (ctx, func) => {
    var languages = ctx.language ? [ctx.language] : CONF.languages;
    languages.forEach(lang => {
        scope(`for language "${lang}"`, () => {
            before(() => CONF.curTestCase.testParams.language = lang);
            func(lang);
        });
    });
};
