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

var CONF = require("../config");
var TestCase = require("../testing").TestCase;

var sessionErrors = [];

var indents = 0;
var indent = () => Array(indents).join("  ");

var report = fs.createWriteStream(
    path.resolve(process.cwd(), "report.log"), { flags : "w" });

var stdout = function() {
    report.write(util.format.apply(util, arguments) + "\n");
    console.log.apply(console, arguments);
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
        stdout((indent + MochaReporter.symbols.ok + " " +
                String(passedTests.length).bold + " " + msg).green);
    };

    if (failedTests.length !== 0) {
        var msg = "failed test" + (failedTests.length === 1 ? "" : "s");
        stdout((indent + MochaReporter.symbols.err + " " +
                String(failedTests.length).bold + " " + msg).red);
    };

    if (failedTests.length) {
        stdout();
        stdout("TEST FAILURES:".bold)
        for (var testCase of failedTests) {
            stdout();
            stdout(("test: " + testCase.name).cyan.bold);
            for(var err of testCase.errors) {
                stdout();
                stdout(err.red.bold);
            };
        };
    };
    if (sessionErrors.length) {
        stdout();
        stdout("OUTTEST FAILURES:".bold);
        for (var error of sessionErrors) {
            stdout();
            stdout(error.red.bold);
        };
    };
};

var stdoutReporter = module.exports = {
    /**
     * Called before tests end.
     *
     * @method
     * @instance
     */
    end: () => {
        epilogue();
        stdout();
        var reportMsg = "Local report is " + CONF.reportsDir;
        stdout(Array(reportMsg.length + 1).join("-").yellow);
        stdout(reportMsg.yellow);
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
            stdout();
            stdout((indent() + "scope: " + scope.title).cyan);
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
        if (indents === 1) stdout();
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
        stdout();
        stdout((indent() + "test: " + test.title).cyan.bold);
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
        if (indents === 1) stdout();
    },
    /**
     * Called on chunk passed.
     *
     * @method
     * @instance
     * @arg {object} chunk - `MochaJS` test.
     */
    pass: chunk => {
        stdout((indent() + "  " + MochaReporter.symbols.ok + " " +
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
        console.log(err);
        if (!CONF.curTestCase) {
            sessionErrors.push(chunk.title + "\n" + err.stack);
        };
        stdout((indent() + "  " + MochaReporter.symbols.err + " " +
                "chunk: " + chunk.title).red);
    },
    /**
     * Called on report finalizing.
     *
     * @method
     * @instance
     */
    done: () => new Promise(resolve => report.end(resolve)),
};
