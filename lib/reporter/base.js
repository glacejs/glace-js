"use strict";
/**
 * Base reporter.
 *
 * @module
 */

var path = require("path");

var colors = require("colors");
var MochaReporter = require("mocha").reporters.base;

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

    runner.on("start", () => {
        patchConsoleLog();
    });

    runner.on("end", () => {
        var reportMsg = "Tests report is " + CONF.reportDir;
        console.log(Array(reportMsg.length + 1).join("-").yellow);
        console.log(reportMsg.yellow);
        restoreConsoleLog();
    });

    runner.on("test", mochaTest => {
        CONF.testCase.addStep(mochaTest.title);
    });

    runner.on("pass", mochaTest => {
        console.log((indent() + "  " +
                     MochaReporter.symbols.ok + " " +
                     mochaTest.title).green);
    });

    runner.on("fail", (mochaTest, err) => {
        var step = CONF.testCase.getStep({ name: mochaTest.title });
        step._isFailed = true;
        console.log((indent() + "  " +
                     MochaReporter.symbols.err + " " +
                     mochaTest.title).red);
    });

    runner.on("suite", mochaSuite => {
        ++indents;
        console.log((indent() + mochaSuite.title).white);
    });

    runner.on("suite end", mochaSuite => {
        --indents;
        if (indents === 1) console.log();
    });
};
inherits(BaseReporter, MochaReporter);
