"use strict";

var _ = require("lodash");

var TestCase = module.exports.TestCase = function (name) {
    this._name = name;
};

TestCase.prototype.reset = function () {
    this._screenshots = [];
    this._steps = [];
};

TestCase.prototype.getSteps = function () {
    return _.clone(this._steps);
};

TestCase.prototype.addStep = function (name, isFailed) {
    this._steps.push(new TestStep(name, isFailed));
};

var TestStep = module.exports.TestStep = function (name, isFailed) {
    this._name = name;
    this._isFailed = !!isFailed;
};
