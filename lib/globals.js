"use strict";
/**
 * Contains global framework functions and helpers.
 *
 * @module
 */

var fs = require("fs");
var path = require("path");

var _ = require("lodash");
var findProcess = require("find-process");
var U = require("glacejs-utils");
var LOG = U.logger;

require("./fixtures");
require("./matcher");
var hacking = require("./hacking");
var TestCase = require("./testing").TestCase;
/**
 * Helper to set actual log file.
 *
 * @function
 */
var setLog = () => {
    var testName = CONF.curTestCase ? _.kebabCase(CONF.curTestCase.name) : "";
    var logFile = path.resolve(CONF.reportsDir, testName, "logs", "test.log");
    LOG.setFile(logFile);
};
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
        name = `Session ${new Date().toLocaleString()}`;
    } else if (!func) {
        func = ctx;
        ctx = name;
        name = `Session ${new Date().toLocaleString()}`;
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
        setLog();
    });

    if (CONF.isWeb) {
        before(async () => await _killProcs("chromedriver"));

        before(() => {
            var wdio = require("webdriverio");
            var webdriver = wdio.remote(CONF.webdriver);
            SS.setWebdriver(webdriver);
        });

        before(async () => {
            if (CONF.useXvfb) await SS.startXvfb();
            if (CONF.proxy.global) await SS.startGlobalProxy();
            if (CONF.proxy.http) await SS.startProxy();
            if (CONF.installDrivers) {
                CONF.installDrivers = false;
                await SS.installSeleniumDrivers();
            };
            if (!CONF.webdriver.host) await SS.startSeleniumServer();
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
        after(async () => {
            if (!CONF.webdriver.host) await SS.stopSeleniumServer();
        });
        after(async () => {
            if (CONF.proxy.http) await SS.stopProxy();
        });
        after(async () => {
            if (CONF.proxy.global) await SS.stopGlobalProxy();
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
 * @abstract
 * @function
 * @arg {string} name - Name of test case.
 * @arg {object} [opts] - Options.
 * @arg {boolean} [opts.video=false] - Flag to involve video fixture.
 * @arg {boolean} [opts.skip=false] - Flag to skip test.
 * @arg {number} [opts.retry=0] - Number of retries on failure. May be managed
 *  in config.
 * @arg {function[]} [fixtures] - Involved fixtures list.
 * @arg {function} func - Test function.
 */
var baseTest = (names => {
    return (name, opts, fixtures, func) => {

        if (names.includes(name)) {
            LOG.warn(`Test case '${name}' is added already.`,
                     `Test case with the same name will be omitted.`);
            return;
        };

        if (opts instanceof Function) {
            func = opts;
            opts = {};
            fixtures = [];
        };
        if (fixtures instanceof Function) {
            func = fixtures;
            fixtures = [];
        };
        opts = opts || {};
        fixtures = fixtures || [];

        opts.video = U.defVal(opts.video, CONF.captureVideo, false);
        opts.skip = U.defVal(opts.skip, false);
        opts.retry = U.defVal(opts.retry, CONF.testRetries, 0);

        if (opts.skip) {
            LOG.warn(`Test '${name}' is marked as skipped and will be omitted`);
            return;
        };
        names.push(name);

        if (opts.video && !fixtures.includes(fixVideo)) fixtures.push(fixVideo);

        var testCase = new TestCase(name);
        var retries = opts.retry;

        CONF.testCases.push(testCase);

        var testFunc = ctxs => {
            ctxs = ctxs || [{}];

            scope(name, () => {

                before(() => {
                    testCase.reset();
                    testCase.status = TestCase.IN_PROGRESS;
                    CONF.curTestCase = testCase;
                    setLog();
                });

                U.wrap(fixtures, () => {
                    for (var ctx of ctxs) func(ctx);
                })();

                after(() => {
                    if (testCase.errors.length) {
                        testCase.status = TestCase.FAILED;
                    } else {
                        testCase.status = TestCase.PASSED;
                    };

                    CONF.curTestCase = null;
                    setLog();

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
 * @arg {object} [opts] - Options.
 * @arg {boolean} [opts.video=true] - Flag to involve video fixture.
 * @arg {boolean} [opts.skip=false] - Flag to skip test.
 * @arg {number} [opts.retry=0] - Number of retries on failure. May be managed
 *  in config.
 * @arg {function[]} [fixtures] - Involved fixtures list.
 * @arg {function} func - Test function.
 * @example

test("Some test", () => {
    chunk("Some chunk", () => {
        someFunc();
    });
});

 */
global.test = (name, opts, fixtures, func) => {
    baseTest(name, opts, fixtures, ctx => {
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
 * @arg {object} [opts] - Options.
 * @arg {boolean} [opts.video=false] - Flag to involve video fixture. May be
 *  managed in config.
 * @arg {function[]} [fixtures] - Involved fixtures list.
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
global.forEachLanguage = (ctx, opts, fixtures, func) => {

    if (ctx instanceof Function) {
        func = ctx;
        ctx = {};
        opts = {};
        fixtures = [];
    };
    if (opts instanceof Function) {
        func = opts;
        opts = {};
        fixtures = [];
    };
    if (fixtures instanceof Function) {
        func = fixtures;
        fixtures = [];
    };
    ctx = ctx || {};
    opts = opts || {};
    fixtures = fixtures || [];

    opts.video = U.defVal(opts.video, CONF.captureVideo, false);
    if (opts.video && !fixtures.includes(fixVideo)) fixtures.push(fixVideo);

    var languages = ctx.language ? [ctx.language] : CONF.languages;
    languages.forEach(lang => {

        scope(`for language "${lang}"`, () => {
            before(() => CONF.curTestCase.testParams.language = lang);
            U.wrap(fixtures, () => func(lang))();
        });
    });
};
/**
 * Helper to kill processes by name.
 *
 * @function
 * @async
 * @arg {string} procName - Process name or chunk of name.
 */
var _killProcs = (procName) => {

    return findProcess("name", procName).then(procList => {

        return procList.forEach(proc => {
            try {
                process.kill(proc.pid, "SIGTERM");
                LOG.debug(`Kill ${procName} with PID ${proc.pid}`);

            } catch (e) {
                if (e.message !== "kill ESRCH") throw e;
                LOG.error(`Can't kill ${procName} with PID ${proc.pid} ` +
                             `because it doesn't exist`);
            };
        });
    });
};
