"use strict";
/**
 * `GlaceJS` stdout reporter.
 *
 * @module
 */

var fs = require("fs");
var path = require("path");
var util = require("util");

var colors = require("colors");
var MochaReporter = require("mocha").reporters.base;

var TestCase = require("../testing").TestCase;

var sessionErrors = [];

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
        if (testCase.status === TestCase.FAILED) {
            failedTests.push(testCase);
        };
        if (testCase.status === TestCase.PASSED) {
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

    if (failedTests.length) {
        console.log();
        console.log("TEST FAILURES:".bold)
        for (var testCase of failedTests) {
            console.log();
            console.log(("test: " + testCase.name).cyan.bold);
            for(var err of testCase.errors) {
                console.log();
                console.log(err.red.bold);
            };
        };
    };
    if (sessionErrors.length) {
        console.log();
        console.log("OUTTEST FAILURES:".bold);
        for (var error of sessionErrors) {
            console.log();
            console.log(error.red.bold);
        };
    };
};

var stdoutReporter = module.exports = {
    /**
     * Called on tests start.
     *
     * @method
     * @instance
     */
    start: () => {
        patchConsoleLog();
    },
    /**
     * Called before tests end.
     *
     * @method
     * @instance
     */
    end: () => {
        epilogue();
        console.log();
        var reportMsg = "Tests report is " + CONF.reportsDir;
        console.log(Array(reportMsg.length + 1).join("-").yellow);
        console.log(reportMsg.yellow);
        restoreConsoleLog();
    },
    /**
     * Called on scope start.
     *
     * @method
     * @instance
     * @arg {object} scope - `MochaJS` suite.
     */
    scope: scope => {
        ++indents;
        if (indents !== 1) {
            console.log();
            console.log((indent() + "scope: " + scope.title).cyan);
        };
    },
    /**
     * Called before scope end.
     *
     * @method
     * @instance
     * @arg {object} scope - `MochaJS` suite.
     */
    scopeEnd: scope => {
        --indents;
        if (indents === 1) console.log();
    },
    /**
     * Called on test start.
     *
     * @method
     * @instance
     * @arg {object} test - `MochaJS` suite.
     */
    test: test => {
        ++indents; 
        console.log();
        console.log((indent() + "test: " + test.title).cyan.bold);
    },
    /**
     * Called on test end.
     *
     * @method
     * @instance
     * @arg {object} test - `MochaJS` suite.
     */
    testEnd: test => {
        --indents;
        if (indents === 1) console.log();
    },
    /**
     * Called on chunk passed.
     *
     * @method
     * @instance
     * @arg {object} chunk - `MochaJS` test.
     */
    pass: chunk => {
        console.log((indent() + "  " +
                     MochaReporter.symbols.ok + " " +
                     "chunk: " + chunk.title).green);
    },
    /**
     * Called on chunk or hook failed.
     *
     * @method
     * @instance
     * @arg {object} chunk - `MochaJS` test.
     */
    fail: (chunk, err) => {
        if (!CONF.curTestCase) {
            sessionErrors.push(chunk.title + "\n" + err.stack);
        };
        console.log((indent() + "  " +
                     MochaReporter.symbols.err + " " +
                     "chunk: " + chunk.title).red);
    },
};
