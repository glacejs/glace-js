"use strict";
/**
 * Base proxy.
 *
 * @module
 */

var _ = require("lodash");

var GlaceError = require("../error").GlaceError;
var U = require("../utils");
/**
 * Base proxy.
 * 
 * @class
 * @abstract
 */
var BaseProxy = module.exports = function (opts) {

    this.isRunning = false;
    this.speed = null;
    this.responsesData = null;
    this.useCache = U.defVal(opts.useCache, false);

    this._reconnect = U.defVal(opts.reconnect, 0);
    this._timeout = U.defVal(opts.timeout, 60000);
    this._port = U.defVal(opts.port, 0);
    this._proxy = null;
};
/**
 * Sets speed of responses from proxy to client.
 *
 * @method
 * @arg {number} speed - Proxy responses speed. kb/s.
 */
BaseProxy.prototype.setSpeed = function (speed) {
    this.speed = speed;
};
/**
 * Resets speed of responses.
 *
 * @method
 */
BaseProxy.prototype.resetSpeed = function () {
    this.speed = null;
};
/**
 * Starts to measure responses and gather information of them.
 *
 * @method
 */
BaseProxy.prototype.measureResponses = function () {
    this.responsesData = [];
};
/**
 * Disables responses measurement.
 *
 * @method
 */
BaseProxy.prototype.unmeasureResponses = function () {
    this.responsesData = null;
};
/**
 * Gets responses data.
 *
 * @method
 */
BaseProxy.prototype.getResponsesData = function () {
    if (this.responsesData === null) return null;
    return _.cloneDeep(this.responsesData);
};
/**
 * Starts proxy.
 *
 * @method
 */
BaseProxy.prototype.start = function () {
    throw new Error("Should be implemented in derived class");
};
/**
 * Stops proxy server.
 *
 * @method
 */
BaseProxy.prototype.stop = function () {
    throw new Error("Should be implemented in derived class");
};