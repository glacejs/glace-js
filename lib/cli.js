"use strict";
/**
 * Contains functions to execute tests via command line interface.
 *
 * @module
 */
var path = require("path");

var Mocha = require("mocha");

var CONF = require("./config");
var hacking = require("./hacking");
/**
 * Runs tests.
 *
 *  - executes `runner.js` file, which is entry point to load and execute
 *    files with tests
 *  - connects custom reporter to `mochajs`.
 *
 * @function
 */
module.exports.run = () => {
    if (CONF.suppressUncaught) hacking.suppressUncaught();

    var mocha = new Mocha({ grep: CONF.grep,
                            timeout: CONF.timeouts.testCase,
                            reporter: path.resolve(__dirname, "reporter") });
    mocha.addFile(path.resolve(__dirname, "runner.js"));

    mocha.run(code => {
        var clampedCode = Math.min(code, 255);
        if (CONF.isRunPassed) clampedCode = 0;
        process.exitCode = clampedCode;
        process.exit(clampedCode);
    });
};
