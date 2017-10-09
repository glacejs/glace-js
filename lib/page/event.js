"use strict";
/**
 * Browser events.
 *
 * @module
 */

var weak = require("weak");
/**
 * Creates a new pointer events instance.
 *
 * @class
 * @classdesc Contains browser pointer events.
 */
var PointerEvents = module.exports.PointerEvents = function (selector, page) {
    this.selector = selector;
    this._page = weak(page);
    this._elCmd = `document.querySelector("${this._selector}")`;
};
/**
 * Moves pointer over element by selector.
 *
 * @method
 * @arg {number} x - `x` coordinate
 * @arg {number} y - `y` coordinate
 * @return {Promise}
 */
PointerEvents.prototype.over = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent('pointerover', \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);`;

    return this._page.getDriver().execute(cmd);
};
/**
 * Enters pointer to element by selector.
 *
 * @method
 * @arg {number} x - `x` coordinate
 * @arg {number} y - `y` coordinate
 * @return {Promise}
 */
PointerEvents.prototype.enter = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent('pointerenter', \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);`;

    return this._page.getDriver().execute(cmd);
};
/**
 * Presses pointer down on element by selector.
 *
 * @arg {string} selector - css selector
 * @arg {number} x - `x` coordinate
 * @arg {number} y - `y` coordinate
 * @return {Promise}
 */
PointerEvents.prototype.down = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent("pointerdown", \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);`;

    return this._page.getDriver().execute(cmd);
};
/**
 * Unpresses pointer up on element by selector.
 *
 * @method
 * @arg {number} x - `x` coordinate
 * @arg {number} y - `y` coordinate
 * @return {Promise}
 */
PointerEvents.prototype.up = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent("pointerup", \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);`;

    return this._page.getDriver().execute(cmd);
};
/**
 * Moves pointer to element by selector.
 *
 * @method
 * @arg {number} x - `x` coordinate
 * @arg {number} y - `y` coordinate
 * @return {Promise}
 */
PointerEvents.prototype.move = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent("pointermove", \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);`;

    return this._page.getDriver().execute(cmd);
};
/**
 * Cancel pointer on element by selector.
 *
 * @method
 * @arg {number} x - `x` coordinate
 * @arg {number} y - `y` coordinate
 * @return {Promise}
 */
PointerEvents.prototype.cancel = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent('pointercancel', \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);`;

    return this._page.getDriver().execute(cmd);
};
/**
 * Moves out pointer from element by selector.
 *
 * @method
 * @arg {number} x - `x` coordinate
 * @arg {number} y - `y` coordinate
 * @return {Promise}
 */
PointerEvents.prototype.out = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent('pointerout', \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);`;

    return this._page.getDriver().execute(cmd);
};
/**
 * Leaves pointer from element by selector.
 *
 * @method
 * @arg {number} x - `x` coordinate
 * @arg {number} y - `y` coordinate
 * @return {Promise}
 */
PointerEvents.prototype.leave = function (x, y) {
    var cmd = ` \
        var el = ${this._elCmd}; \
        var ev = new PointerEvent('pointerleave', \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);`;

    return this._page.getDriver().execute(cmd);
};
