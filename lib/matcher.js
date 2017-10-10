"use strict";
/**
 * Matchers.
 *
 * @module
 */

var _ = require("lodash");
var Assertion = require("chai").Assertion;
/**
 * Checks that correct condition were added correctly.
 *
 * @param {string} cond - conditions for assertion.
 * @param {string} [msg] - message to throw in case of wrong conditions.
 * @example

 await SS.checkBalance({ "to be not equal": 100 })

 Steps.prototype.checkBalance = async function (condition) {
    var currBalance = await this.getBalance();

    expect(currBalance).correspond(condition, "Invalid user balance");
};
 */
Assertion.prototype.correspond = function (cond, msg) {
    var matchers, expVal;

    if (msg) this.__flags.message = msg;

    if (typeof(cond) === "object") {
        if (Object.keys(cond).length !== 1) {
            throw new Error("Condition should contain only one key-value pair");
        }
        matchers = Object.keys(cond)[0];
        expVal = Object.values(cond)[0];
    } else if (typeof(cond) === "string") {
        matchers = cond;
    } else {
        throw new Error("Condition should be string or object only");
    }
    matchers = _.filter(_.split(matchers, " "));

    var predicate = this;
    for (var matcher of matchers) {
        predicate = predicate[matcher];
        if (!predicate) throw new TypeError(`Undefined matcher '${matcher}'`);
    }
    if (expVal) predicate.call(this, expVal);
    return this;
};
