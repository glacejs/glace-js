"use strict";
/**
 * Contains functions to execute tests via command line interface.
 *
 * @module
 */

require("glace-core").help().argv;

var run = require("./run");
/**
 * Runs `GlaceJS` in CLI.
 *
 * @function
 */
module.exports.run = () => run(process.exit);
