"use strict";
/**
 * Contains functions to execute tests via command line interface.
 *
 * @module
 */

const run = require("./run");
/* allow plugins registration in runner before help call */
require("glace-core").help();
/**
 * Runs `GlaceJS` in CLI.
 *
 * @function
 */
module.exports.run = () => run(process.exit);
