"use strict";
/**
 * GlaceJS reporter package.
 *
 * @module
 */

var base = require("./base");
var stdout = require("./stdout");
var testrail = require("./testrail");

base.register(stdout, testrail);

module.exports = base;
