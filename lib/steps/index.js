"use strict";
/**
 * Steps namespace.
 *
 * @module
 */

var _ = require("lodash");

var CONF = require("../config");
var U = require("../utils");
var LOG = require("../logger");
/**
 * Steps collection which will be executed in test cases.
 *
 * @class
 */
var Steps = module.exports = function () {
    this._config = CONF;
    this._appUrl = CONF.appUrl;
    this._webdriver = null;
};
/**
 * Sets webdriver.
 *
 * It's used for web ui test cases.
 *
 * @method
 * @arg {object} webdriver - Instance of webdriver.
 */
Steps.prototype.setWebdriver = function (webdriver) {
    this._webdriver = webdriver;
};
/**
 * Step to make pause in another step or test case. Good style to rid of
 * its direct usage in test case, only inside other step.
 *
 * @method
 * @async
 * @arg {number} timeout - Pause time, sec.
 * @arg {string} message - Pause reason.
 */
Steps.prototype.pause = async function (timeout, message) {
    expect(message, "Pause message is not defined").to.not.be.undefined;
    LOG.stepDebug("Sleep", timeout, "sec, reason:", message);
    await U.sleep(timeout * 1000);
};
/**
 * Registers sequence of objects containing steps.
 *
 * @method
 * @static
 */
Steps.register = function () {
    for (var obj of arguments) {
        _.assign(Steps.prototype, obj);
    };
};

Steps.register(require("./timer"));

if (CONF.isWeb) Steps.register(require("./image"),
                               require("./page"),
                               require("./video"),
                               require("./web"));

if (CONF.useXvfb) Steps.register(require("./xvfb"));

try {
    Steps.register(require("glacejs-proxy").Steps);
} catch (e) {
    LOG.warn("GlaceJS Proxy isn't installed");
};
