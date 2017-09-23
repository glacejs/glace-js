"use strict";
/**
 * Base reporter.
 *
 * @module
 */

var _ = require("lodash");
var fs = require("fs");
var path = require("path");
var util = require("util");

var MochaReporter = require("mocha").reporters.base;

var CONF = require("../config");

var reporters = [];
/**
 * GlaceJS base reporter.
 *
 * @class
 * @arg {object} runner - mochajs runner.
 */
var BaseReporter = module.exports = function (runner) {
    MochaReporter.call(this, runner);

    runner.on("start", () => {
        for (var reporter of reporters) {
            if (reporter.start) reporter.start();
        };
    });

    runner.on("end", () => {
        for (var reporter of reporters) {
            if (reporter.end) reporter.end();
        };
    });

    runner.on("suite", mochaSuite => {
        for (var reporter of reporters) {
            if (mochaSuite.title !== CONF.curTestCase.name &&
                    reporter.scope) {
                reporter.scope(mochaSuite);
            };
            if (mochaSuite.title === CONF.curTestCase.name &&
                    reporter.test) {
                reporter.test(mochaSuite);
            };
        };
    });

    runner.on("suite end", mochaSuite => {
        for (var reporter of reporters) {
            if (mochaSuite.title !== CONF.curTestCase.name &&
                    reporter.scopeEnd) {
                reporter.scopeEnd(mochaSuite);
            };
            if (mochaSuite.title === CONF.curTestCase.name &&
                    reporter.testEnd) {
                reporter.testEnd(mochaSuite);
            };
        };
    });

    runner.on("test", mochaTest => {
        CONF.curTestCase.addStep(mochaTest.title);

        for (var reporter of reporters) {
            if (reporter.step) reporter.step(mochaTest);
        };
    });

    runner.on("test end", mochaTest => {
        for (var reporter of reporters) {
            if (reporter.stepEnd) reporter.stepEnd(mochaTest);
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
        if (CONF.curTestCase) {
            var step = CONF.curTestCase.getStep({ name: mochaTest.title });
            step.isFailed = true;
            CONF.curTestCase.addError(err);
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
 * [done description]
 * @param  {[type]}   failures [description]
 * @param  {Function} fn       [description]
 * @return {Function}          [description]
 */
BaseReporter.prototype.done = function (failures, fn) {
    var prms = Promise.resolve();
    for (var reporter of reporters) {
        if (reporter.done) {
            prms = prms.then(() => reporter.done());
        };
    };
    prms.then(() => fn(failures));
};
/**
 * Registers reporters
 *
 * @method
 * @static
 * @return {[type]} [description]
 */
BaseReporter.register = function () {
    for (var reporter of arguments) {
        if (!reporters.includes(reporter)) {
            reporters.push(reporter);
        };
    };
};
/**
 * Removes reporters
 *
 * @method
 * @static
 */
BaseReporter.remove = function () {
    reporters = _.without.apply(_, reporters, arguments);
};
