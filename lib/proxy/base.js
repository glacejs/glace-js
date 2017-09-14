"use strict";
/**
 * Base proxy.
 *
 * @module
 */

/**
 * Base proxy.
 * 
 * @class
 * @abstract
 */
var BaseProxy = module.exports = function () {
    this.speed = null;
    this.responsesData = null;
};
/**
 * Sets speed of responses from proxy to client.
 *
 * @method
 * 
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