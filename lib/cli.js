"use strict";
/**
 * Contains functions to execute tests via command line interface.
 *
 * @module
 */

require("./help");

var path = require("path");

var run = require("./run");
/**
 * Runs `GlaceJS` in CLI.
 *
 * @function
 */
module.exports.run = () => {
    run(code => process.exit(code));
};
