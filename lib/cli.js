"use strict";
/**
 * Command line interface
 *
 * @module
 */
var path = require("path");

var Mocha = require("mocha");
/**
 * Runs test session
 *
 * @function
 */
module.exports.run = () => {
    var mocha = new Mocha();
    mocha.addFile(path.resolve(__dirname, "runner.js"));

    mocha.run(failures => {
        process.on("exit", () => {
            process.exit(failures);
        });
    });
};
