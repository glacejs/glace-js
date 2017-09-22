"use strict";
/**
 * Stdout GlaceJS reporter
 */

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
/**
 * Stdout reporter.
 *
 * @type {Object}
 */
module.exports = {

    start: () => {
        patchConsoleLog();
    },

    end: () => {
        epilogue();
        var reportMsg = "Tests report is " + CONF.reportsDir;
        console.log(Array(reportMsg.length + 1).join("-").yellow);
        console.log(reportMsg.yellow);
        restoreConsoleLog();
    },

    suite: suite => {
        ++indents;
        if (indents !== 1) console.log();
        console.log((indent() + suite.title).cyan);
    },

    suiteEnd: suite => {
        --indents;
        if (indents === 1) console.log();
    },

    pass: test => {
        console.log((indent() + "  " +
                     MochaReporter.symbols.ok + " " +
                     test.title).green);
    },

    fail: (test, err) => {
        console.log((indent() + "  " +
                     MochaReporter.symbols.err + " " +
                     test.title).red);
    },
};
