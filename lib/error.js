"use strict";
/**
 * Contains `GlaceJS` errors.
 *
 * @module
 */
var util = require("util");

var BaseError = require("es6-error");
/**
 * Error which is thrown in `GlaceJS`, if no more specific error is defined.
 *
 * @class
 * @arg {string} message - Error message.
 */
var GlaceError = module.exports.GlaceError = function (message) {
    BaseError.call(this, message);
};
util.inherits(GlaceError, BaseError);
/**
 * Error which is thrown when configuration is wrong.
 *
 * @class
 * @arg {string} message - Error message.
 */
var ConfigError = module.exports.ConfigError = function (message) {
    GlaceError.call(this, message);
};
util.inherits(ConfigError, GlaceError);
/**
 * Error which is thrown when step execution is wrong.
 *
 * @class
 * @arg {string} message - Error message.
 */
var StepError = module.exports.StepError = function (message) {
    GlaceError.call(this, message);
};
util.inherits(StepError, GlaceError);
