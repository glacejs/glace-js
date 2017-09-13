"use strict";
/**
 * Contains global functions and helpers
 *
 * @module
 */

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
global.session = (name, func) => {

    if (!func) {
        func = name;
        name = `Session ${new Date}`;
    };

    scope(name, () => {
        func();
    });
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
                    session(`Retry #${CONF.testRetries - retries}`, () => {
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
