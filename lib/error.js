"use strict";
/**
 * Framework errors.
 *
 * @module
 */
var util = require("util");

var BaseError = require("es6-error");
/**
 * Base framework error.
 *
 * @class
 * @arg {string} message - Error message.
 */
var GlaceError = module.exports.GlaceError = function (message) {
    BaseError.call(this, message);
};
util.inherits(GlaceError, BaseError);
/**
 * Config error.
 *
 * @class
 * @arg {string} message - Error message.
 */
var ConfigError = module.exports.ConfigError = function (message) {
    GlaceError.call(this, message);
};
util.inherits(ConfigError, GlaceError);
/**
 * Step error.
 *
 * @class
 * @arg {string} message - Error message.
 */
var StepError = module.exports.StepError = function (message) {
    GlaceError.call(this, message);
};
util.inherits(StepError, GlaceError);
