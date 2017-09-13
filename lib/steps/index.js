"use strict";

var CONF = require("lib/config");

var Steps = module.exports = function () {
    this._webdriver = null;
};

Steps.register = function () {
    _.assign(Steps.prototype, arguments);
};

if (CONF.isWeb) Steps.register(require("./web"));
