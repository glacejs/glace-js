"use strict";
/**
 * Common reporter.
 *
 * @module
 */

var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var util = require("util");

var MochaReporter = require("mocha").reporters.base;

var CONF = require("../config");
var logger = require("../logger");
var U = require("../utils");
/**
 * Registered reporters.
 *
 * @type {object[]}
 */
var reporters = [];
/**
 * `GlaceJS` common reporter.
 *
 * @class
 * @arg {object} runner - `MochaJS` runner.
 */
var BaseReporter = module.exports = function (runner) {
    MochaReporter.call(this, runner);

    runner.on("start", () => {
        for (var reporter of reporters) {
            if (reporter.start) reporter.start();
        };
    });

    runner.on("end", () => {
        U.clearEmptyFolders(CONF.reportsDir)
        for (var reporter of reporters) {
            if (reporter.end) reporter.end();
        };
    });

    runner.on("suite", mochaSuite => {
        var isTest = _isSuiteTest(mochaSuite);
        for (var reporter of reporters) {
            if (isTest) {
                if (reporter.test) reporter.test(mochaSuite);
            } else {
                if (reporter.scope) reporter.scope(mochaSuite);
            };
        };
    });

    runner.on("suite end", mochaSuite => {
        var isTest = _isSuiteTest(mochaSuite);
        for (var reporter of reporters) {
            if (isTest) {
                if (reporter.testEnd) reporter.testEnd(mochaSuite);
            } else {
                if (reporter.scopeEnd) reporter.scopeEnd(mochaSuite);
            };
        };
    });

    runner.on("test", mochaTest => {
        for (var reporter of reporters) {
            if (reporter.chunk) reporter.chunk(mochaTest);
        };
    });

    runner.on("test end", mochaTest => {
        for (var reporter of reporters) {
            if (reporter.chunkEnd) reporter.chunkEnd(mochaTest);
        };
    });

    runner.on("hook", mochaHook => {
        for (var reporter of reporters) {
            if (reporter.hook) reporter.hook(mochaHook);
        };
    });

    runner.on("hook end", mochaHook => {
        for (var reporter of reporters) {
            if (reporter.hookEnd) reporter.hookEnd(mochaHook);
        };
    });

    runner.on("pass", mochaTest => {
        for (var reporter of reporters) {
            if (reporter.pass) reporter.pass(mochaTest);
        };
    });

    runner.on("fail", (mochaTest, err) => {
        CONF.isRunPassed = false;
        if (CONF.curTestCase) {
            var errMsg = mochaTest.title;

            if (err.message) {
                errMsg += "\nmessage: " + err.message;
            };
            if (err.stack) {
                errMsg += "\nstack: " + err.stack;
            };
            if (err.seleniumStack) {
                errMsg += "\nselenium: " + JSON.stringify(err.seleniumStack,
                                                          null, "\t");
            };

            CONF.curTestCase.addError(errMsg);
            CONF.curTestCase.addFailedParams(
                _.clone(CONF.curTestCase.testParams));
        };
        for (var reporter of reporters) {
            if (reporter.fail) reporter.fail(mochaTest, err);
        };
    });

    runner.on("pending", mochaTest => {
        for (var reporter of reporters) {
            if (reporter.pending) reporter.pending(mochaTest);
        };
    });
};
/**
 * Inherits base mocha reporter.
 */
util.inherits(BaseReporter, MochaReporter);
/**
 * Finalizes reporting.
 *
 * @function
 * @async
 * @arg {Array.<*>} failures - Tests failures.
 * @arg {function} fn - Finalizator.
 */
BaseReporter.prototype.done = function (failures, fn) {
    var prms = Promise.resolve();
    reporters.forEach(reporter => {
        if (reporter.done) {
            prms = prms
                .then(() => reporter.done())
                .catch(e => logger.error(e));
        };
    });
    prms.then(() => fn(failures));
};
/**
 * Registers reporters if they are not.
 *
 * @method
 * @static
 * @arg {...object} reporters - Sequence of reporters to register.
 */
BaseReporter.register = function () {
    for (var reporter of arguments) {
        if (!reporters.includes(reporter)) {
            reporters.push(reporter);
        };
    };
};
/**
 * Removes reporters if they are registered.
 *
 * @method
 * @static
 * @arg {...object} reporters - Sequence of reporters to remove.
 */
BaseReporter.remove = function () {
    reporters = _.without.apply(_, reporters, arguments);
};
/**
 * Helper to define whether `MochaJS` suite is `GlaceJS` test or no.
 *
 * It iterates among registered tests and check if suite name matches name
 * someone of tests. It is not possible to use `CONF.curTestCase` to compare
 * because `CONF.curTestCase` is assigned after event `suite`.
 *
 * @function
 * @ignore
 * @arg {object} mochaSuite - `MochaJS` suite.
 * @return {boolean} - `true` if `MochaJS` suite is `GlaceJS` test, `false`
 *  otherwise.
 */
var _isSuiteTest = mochaSuite => {
    for (var testCase of CONF.testCases) {
        if (mochaSuite.title === testCase.name) {
            return true;
        };
    };
    return false;
};
