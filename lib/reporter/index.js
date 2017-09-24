"use strict";
/**
 * GlaceJS reporter package.
 *
 * @module
 */

var CONF = require("../config");

var base = require("./base");
var stdout = require("./stdout");
var testrail = require("./testrail");

base.register(stdout);

if (CONF.toTestrail) base.register(testrail);

module.exports = base;
