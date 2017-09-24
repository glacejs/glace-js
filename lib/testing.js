"use strict";
/**
 * Contains classes and functions to save executed tests data.
 *
 * @module
 */

var _ = require("lodash");
/**
 * Test case data structure.
 *
 * Contains full information and history about test case.
 *
 * @class
 * @arg {string} name - Test case name.
 */
var TestCase = module.exports.TestCase = function (name) {
    this.name = name;
};
/**
 * Resets test case info.
 *
 * @method
 */
TestCase.prototype.reset = function () {
    this.screenshots = [];
    this.errors = [];
    this.failedParams = [];
    this.testParams = [];
};
/**
 * Adds failed params if they don't exist.
 *
 * @method
 * @arg {object} params - Params which test was failed with.
 */
TestCase.prototype.addFailedParams = function (params) {
    for (var failed of this.failedParams) {
        if (_.isEqual(params, failed)) break;
    };
    this.failedParams.push(params);
};
/**
 * Adds error to test case.
 *
 * @method
 * @arg {Error} err - Error.
 */
TestCase.prototype.addError = function (err) {
    this.errors.push(err.message + "\n" + err.stack);
};
/**
 * Adds screenshot.
 *
 * @method
 * @arg {string} imagePath - Path to saved screenshot.
 */
TestCase.prototype.addScreenshot = function (imagePath) {
    this.screenshots.push(imagePath);
};
/** 
 * Defines whether test case is failed or no.
 *
 * @method
 * @return {boolean} - `true` if test case is failed, `false` otherwise.
 */
TestCase.prototype.isFailed = function () {
    return !_.isEmpty(this.errors);
};
