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
    this._name = name;
};
/**
 * Resets test case info.
 *
 * @method
 */
TestCase.prototype.reset = function () {
    this._screenshots = [];
    this._steps = [];
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
    this._name = name;
    this._isFailed = !!isFailed;
};
