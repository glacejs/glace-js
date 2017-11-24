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
    this.status = TestCase.NOT_STARTED;
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
    this.testParams = {};
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
    this.errors.push(err);
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

TestCase.NOT_STARTED = "not started";
TestCase.IN_PROGRESS = "in progress";
TestCase.FAILED = "failed";
TestCase.PASSED = "passed";
