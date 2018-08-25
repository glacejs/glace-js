"use strict";

/**
 * Contains functions to execute tests via command line interface.
 *
 * @module
 */

require("glace-core").config; // configuration is before all!
require("glace-core").help();

const run = require("./run");
/**
 * Runs `GlaceJS` in CLI.
 *
 * @function
 */
module.exports.run = () => run(process.exit);
