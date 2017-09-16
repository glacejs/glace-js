"use strict";
/**
 * Data structures related with test cases.
 *
 * @module
 */

var _ = require("lodash");
/**
 * Test case data structure.
 *
 * Contains full information and history about test case.
 *
 * @method
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
    this._screenshots = [];
    this._steps = [];
    this._errors = [];
};
/**
 * Gets executed test steps.
 *
 * It makes clone of current array of steps in order to get its replica.
 *
 * @method
 * @return {TestStep[]} - List of executed steps.
 */
TestCase.prototype.getSteps = function () {
    return _.clone(this._steps);
};
/**
 * Gets test step with filter.
 *
 * @arg {object} [opts] - Filter options.
 * @arg {string} [opts.name] - Step name.
 * @return {TestStep} - Step which matches requested options.
 */
TestCase.prototype.getStep = function (opts) {
    opts = opts || {};
    var steps = this.getSteps();
    if (opts.name) {
        var filteredSteps = [];
        for (var step of steps) {
            if (step.name === opts.name) {
                filteredSteps.push(step);
                break;
            };
        };
        steps = filteredSteps;
    };
    return steps[0];
};
/**
 * Adds executed step to test case.
 *
 * @method
 * @arg {string} name - Step name.
 * @arg {boolean} isFailed - Flag whether step is failed or no.
 */
TestCase.prototype.addStep = function (name, isFailed) {
    this._steps.push(new TestStep(name, isFailed));
};
/**
 * Adds error in step to test case.
 *
 * @method
 * @arg {Error} err - Error.
 */
TestCase.prototype.addError = function (err) {
    this._errors.push(err.message + "\n" + err.stack);
};
/**
 * Defines whether test case is failed on some stage. By default from start.
 *
 * @method
 * @arg {TestStep[]} [stepsBefore=[]] - List of steps which should be skipped.
 * @return {boolean} - `true` if test case is failed, `false` otherwise.
 */
TestCase.prototype.isFailed = function (stepsBefore) {
    stepsBefore = stepsBefore || [];
    for (var step of this._steps) {
        if (stepsBefore.includes(step)) continue;
        if (step.isFailed) return true;
    };
    return false;
};
/**
 * Test step data structure.
 *
 * @class
 * @arg {string} name - Step name.
 * @arg {boolean} isFailed - Flag whether step is failed or no.
 */
var TestStep = module.exports.TestStep = function (name, isFailed) {
    this.name = name;
    this.isFailed = !!isFailed;
};
