"use strict";
/**
 * List of functions to execute via command line interface.
 *
 * @module
 */
var path = require("path");

var Mocha = require("mocha");
/**
 * Runs test session.
 *
 * It executes `runner.js` file which is entry point to load and execute
 * files with tests.
 *
 * @function
 */
module.exports.run = () => {
    var mocha = new Mocha({ timeout: 180000 });
    mocha.addFile(path.resolve(__dirname, "runner.js"));

    mocha.run(failures => {
        process.on("exit", () => {
            process.exit(failures);
        });
    });
};
