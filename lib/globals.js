"use strict";
/**
 * Contains global framework functions and helpers.
 *
 * @module
 */

var fs = require("fs");

var _ = require("lodash");

var hacking = require("./hacking");
var logger = require("./logger");
var TestCase = require("./testing").TestCase;
/**
 * `chaijs` `expect` function.
 *
 * @global
 * @function
 * @arg {*} actualValue - Some actual value which should be checked.
 * @see {@link http://chaijs.com/|chaijs} to get more details about
 *  `expect` usage.
 * @example

expect(1).to.be.equal(1);
expect(2).to.be.gte(0);

 */
global.expect = require("chai").expect;
/**
 * `GlaceJS` config.
 *
 * @global
 * @see {@link module:config|config} to get more details about its options.
 */
global.CONF = require("./config");
/**
 * Atomic steps collection.
 *
 * @global
 * @see {@link module:steps/index|steps} to get more details about its methods.
 */
global.SS = new (require("./steps"));
/**
 * Execute tests scope.
 *
 * @global
 * @function
 * @arg {string} name - Scope name.
 * @arg {function} func - Function with test cases.
 * @example

scope("Some test scope", () => {
    test("Some test name", () => {
        before(() => {
            someFunc();
        });
        chunk("chunk #1", () => {
            someFunc();
        });
        chunk("chunk #2", () => {
            someFunc();
        });
    });
});

 */
global.scope = describe;
/**
 * Executed sessions counter.
 * 
 * @type {Number}
 */
var sessNum = 0;
/**
 * Executes tests session.
 *
 * @global
 * @function
 * @arg {string} [name] - Session name. By default it includes start date time.
 * @arg {object} [ctx] - Session context. By default it's empty.
 * @arg {function} func - Function with test cases.
 * @example

session(() => {
    test("Test #1", () => {
        chunk("Chunk #1", () => {
            someFunc();
        });
        chunk("Chunk #2", () => {
            someFunc();
        });
    });
    test("Test #2", () => {
        chunk("Chunk #1", () => {
            someFunc();
        });
        chunk("Chunk #2", () => {
            someFunc();
        });
    });
});

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
 * Executes before tests session. May be overridden or expanded.
 *
 * @global
 * @function
 * @arg {object} ctx - Session context.
 * @example

var oldBeforeSession = beforeSession;
global.beforeSession = ctx => {
    before(() => {
        someFunc();
    });
    oldBeforeSession(ctx);
};

 */
global.beforeSession = ctx => {

    before(() => {
        CONF.isRunPassed = true;
        logger.setStepLog()
    });

    if (CONF.isWeb) {

        before(() => {
            var wdio = require("webdriverio");
            var webdriver = wdio.remote(CONF.webdriver);
            SS.setWebdriver(webdriver);
        });

        before(async () => {
            if (CONF.useXvfb) await SS.startXvfb();
            if (CONF.useGlobalProxy) await SS.startGlobalProxy();
            if (CONF.useProxy) await SS.startProxy();
            if (CONF.installDrivers) {
                CONF.installDrivers = false;
                await SS.installSeleniumDrivers();
            };
            await SS.startSeleniumServer();
            await SS.launchBrowser();
        });
    };
};
/**
 * Executes after tests session. May be overridden or expanded.
 *
 * @global
 * @function
 * @arg {object} ctx - Session context.
 * @example

var oldAfterSession = afterSession;
global.afterSession = ctx => {
    oldAfterSession(ctx);
    after(() => {
        someFunc();
    });
};

 */
global.afterSession = ctx => {
    if (CONF.isWeb) {
        after(async () => await SS.closeBrowser());
        after(async () => await SS.stopSeleniumServer());
        after(async () => {
            if (CONF.useProxy) await SS.stopProxy();
        });
        after(async () => {
            if (CONF.useGlobalProxy) await SS.stopGlobalProxy();
        });
        after(() => {
            if (CONF.useXvfb) SS.stopXvfb();
        });
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
 * @function
 * @abstract
 * @arg {string} name - Name of test case.
 * @arg {function} func - Test function.
 */
var baseTest = (names => {
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

        var testFunc = ctxs => {
            ctxs = ctxs || [{}];

            scope(name, () => {

                before(() => {
                    testCase.reset();
                    testCase.status = TestCase.IN_PROGRESS;
                    CONF.curTestCase = testCase;
                    logger.setStepLog();
                });

                before(async () => {
                    if (CONF.captureVideo) await SS.startVideo();
                });

                for (var ctx of ctxs) func(ctx);

                after(async () => {
                    if (CONF.captureVideo) await SS.stopVideo();
                });

                after(() => {
                    if (_.isEmpty(testCase.errors)) {
                        testCase.status = TestCase.PASSED;
                    } else {
                        testCase.status = TestCase.FAILED;
                    };

                    if (CONF.captureVideo && 
                            !CONF.forceVideo &&
                            testCase.status !== TestCase.FAILED) {
                        fs.unlinkSync(SS.getVideo());
                    };

                    CONF.curTestCase = null;
                    logger.setStepLog();

                    if (testCase.status !== TestCase.FAILED || retries <= 0) {
                        return;
                    };
                    retries--;

                    var retryNum = CONF.testRetries - retries;
                    var sessName = `Retry #${retryNum}`;
                    /* Hack to pass mocha grep */
                    var mochaRunner = hacking.getRunner();
                    if (mochaRunner._grep !== mochaRunner._defaultGrep) {
                        sessName += " - " + mochaRunner._grep.source;
                    };
                    var ctx = { retryNumber: retryNum };

                    session(sessName, ctx, () => {
                        testFunc(testCase.failedParams);
                    });
                });
            });
        };
        testFunc();
    };
})([]);
/**
 * Executes test case.
 *
 * @global
 * @function
 * @arg {string} name - Name of test case.
 * @arg {function} func - Function with test chunks.
 * @example

test("Some test", () => {
    chunk("Some chunk", () => {
        someFunc();
    });
});

 */
global.test = (name, func) => {
    baseTest(name, ctx => {
        func(ctx);
    });
};
/**
 * Executes test chunk.
 * 
 * Contains actions and verifications, which will be executed separatly
 * from another chunks. This function is used to organize test
 * structure and to allocate independent test actions.
 *
 * @global
 * @function
 * @arg {string} [name] - Name of test case.
 * @arg {function} func - Step function.
 * @example

test("Some test", () => {
    chunk("Some chunk", () => {
        someFunc();
    });
});

 */
global.chunk = (name, func) => {
    if (name instanceof Function) {
        func = name;
        name = "";
    };
    it(name, func);
};
/**
 * Executes before each test chunk.
 *
 * @global
 * @function
 * @arg {string} name - Name of test case.
 * @arg {function} func - Hook function.
 * @example

test("Some test", () => {
    beforeChunk(() => {
        someFunc();
    });
    chunk("Chunk #1", () => {
        someFunc();
    });
    chunk("Chunk #2", () => {
        someFunc();
    });
});

 */
global.beforeChunk = beforeEach;
/**
 * Executes after each test chunk.
 *
 * @global
 * @function
 * @arg {string} name - Name of test case.
 * @arg {function} func - Hook function.
 * @example

test("Some test", () => {
    afterChunk(() => {
        someFunc();
    });
    chunk("Chunk #1", () => {
        someFunc();
    });
    chunk("Chunk #2", () => {
        someFunc();
    });
});

 */
global.afterChunk = afterEach;
/**
 * Iterates test chunks through all languages specifed in config.
 *
 * It's applicable for multilingual application. If list of languages is
 * specified, it will be used firstly. Otherwise from configuration.
 *
 * @global
 * @function
 * @arg {object} [ctx] - Test case context.
 * @arg {function} func - Function with test steps.
 * @example

test("Some test", ctx => {
    forEachLanguage(ctx, lang => {
        beforeChunk(() => {
            someFunc();
        });
        chunk("Chunk #1", () => {
            someFunc();
        });
        chunk("Chunk #2", () => {
            someFunc();
        });
    });
});

 */
global.forEachLanguage = (ctx, func) => {

    if (ctx instanceof Function) {
        func = ctx;
        ctx = {};
    };

    var languages = ctx.language ? [ctx.language] : CONF.languages;
    languages.forEach(lang => {
        scope(`for language "${lang}"`, () => {
            before(() => CONF.curTestCase.testParams.language = lang);
            func(lang);
        });
    });
};
