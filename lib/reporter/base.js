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

var colors = require("colors");
var MochaReporter = require("mocha").reporters.base;

var CONF = require("../config");

/**
 * GlaceJS base reporter.
 *
 * @class
 * @arg {object} runner - mochajs runner.
 */
var BaseReporter = module.exports = function (runner) {
    MochaReporter.call(this, runner);

    var indents = 0;
    var indent = () => Array(indents).join("  ");

    var origConsoleLog;

    var patchConsoleLog = () => {
        var reportLog = fs.createWriteStream(
            path.resolve(process.cwd(), "reporter.log"), { flags : "w" });
        origConsoleLog = console.log;

        console.log = function() {
            reportLog.write(util.format.apply(null, arguments) + "\n");
            origConsoleLog.apply(this, arguments);
        };
    };

    var restoreConsoleLog = () => {
        if (origConsoleLog) console.log = origConsoleLog;
    };

    var epilogue = () => {
        var indent = "  ";

        var passedTests = [];
        var failedTests = [];

        for (var testCase of CONF.testCases) {
            if (testCase.isFailed()) {
                failedTests.push(testCase);
            } else {
                passedTests.push(testCase);
            };
        };

        if (passedTests.length !== 0) {
            var msg = "passed test" + (passedTests.length === 1 ? "" : "s");
            console.log((indent + MochaReporter.symbols.ok + " " +
                         String(passedTests.length).bold + " " + msg).green);
        };

        if (failedTests.length !== 0) {
            var msg = "failed test" + (failedTests.length === 1 ? "" : "s");
            console.log((indent + MochaReporter.symbols.err + " " +
                         String(failedTests.length).bold + " " + msg).red);
        };

        if (failedTests.length === 0) return;

        console.log();
        for (var testCase of failedTests) {
            console.log((indent + testCase.name).bold);
            console.log();
            for(var err of testCase._errors) {
                console.log((indent + indent + err).grey);
                console.log();
            };
        };
    };

    runner.on("start", () => {
        patchConsoleLog();
    });

    runner.on("end", () => {
        epilogue();
        var reportMsg = "Tests report is " + CONF.reportsDir;
        console.log(Array(reportMsg.length + 1).join("-").yellow);
        console.log(reportMsg.yellow);
        restoreConsoleLog();
    });

    runner.on("test", mochaTest => {
        CONF.curTestCase.addStep(mochaTest.title);
    });

    runner.on("pass", mochaTest => {
        console.log((indent() + "  " +
                     MochaReporter.symbols.ok + " " +
                     mochaTest.title).green);
    });

    runner.on("fail", (mochaTest, err) => {
        if (CONF.curTestCase) {
            var step = CONF.curTestCase.getStep({ name: mochaTest.title });
            step.isFailed = true;
            CONF.curTestCase.addError(err);
            CONF.curTestCase.addFailedParams(
                _.clone(CONF.curTestCase.testParams));
        };
        console.log((indent() + "  " +
                     MochaReporter.symbols.err + " " +
                     mochaTest.title).red);
    });

    runner.on("suite", mochaSuite => {
        ++indents;
        if (indents !== 1) console.log();
        console.log((indent() + mochaSuite.title).cyan);
    });

    runner.on("suite end", mochaSuite => {
        --indents;
        if (indents === 1) console.log();
    });
};
util.inherits(BaseReporter, MochaReporter);
