"use strict";

/**
 * Runs tests.
 * 
 * @module
 */

const path = require("path");

const glace = require("glace-core");

glace.config.session.preloads.push(path.resolve(__dirname, "globals.js"));

module.exports = glace.run;
