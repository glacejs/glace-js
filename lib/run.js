"use strict";
/**
 * Runs tests.
 * 
 * @module
 */

var path = require("path");

var glace = require("glace-core");

var CONF = glace.config;
CONF.session.preloads.push(path.resolve(__dirname, "globals.js"));

module.exports = glace.run;
