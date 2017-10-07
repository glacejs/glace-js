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
    this._elCmd = `document.querySelector('${this._selector}')`;
};

/**
 * Moves pointer over element by selector.
 *
 * @param  {string} selector - css selector
 * @param  {integer} x - `x` coordinate
 * @param  {integer} y - `y` coordinate
 * @return {object} - webdriverio instance
 */
PointerEvents.prototype.over = function (x, y) {
    var cmd = `var el = ${this._elCmd}; \
        var ev = new PointerEvent('pointerover', \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);`;

    return this._page.getDriver().execute(cmd);
}

/**
 * Enters pointer to element by selector.
 *
 * @param  {string} selector - css selector
 * @param  {integer} x - `x` coordinate
 * @param  {integer} y - `y` coordinate
 * @return {object} - webdriverio instance
 */
PointerEvents.prototype.enter = function (selector, x, y) {
    var cmd = "var el = document.querySelector('" + selector + "'); \
        var ev = new PointerEvent('pointerenter', \
            { clientX: " + x + ", clientY: " + y + ", \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);"

    return this._page.getDriver().execute(cmd);
}

/**
 * Presses pointer down on element by selector.
 *
 * @param  {string} selector - css selector
 * @param  {integer} x - `x` coordinate
 * @param  {integer} y - `y` coordinate
 * @return {object} - webdriverio instance
 */
PointerEvents.prototype.down = function (x, y) {
    var cmd = ` \
        var el = document.querySelector("${this.selector}"); \
        var ev = new PointerEvent("pointerdown", \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);`;

    return this._page.getDriver().execute(cmd);
}

/**
 * Unpresses pointer up on element by selector.
 *
 * @param  {string} selector - css selector
 * @param  {integer} x - `x` coordinate
 * @param  {integer} y - `y` coordinate
 * @return {object} - webdriverio instance
 */
PointerEvents.prototype.up = function (x, y) {
    var cmd = ` \
        var el = document.querySelector("${this.selector}"); \
        var ev = new PointerEvent("pointerup", \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);`;

    return this._page.getDriver().execute(cmd);
}

/**
 * Moves pointer to element by selector.
 *
 * @param  {string} selector - css selector
 * @param  {integer} x - `x` coordinate
 * @param  {integer} y - `y` coordinate
 * @return {object} - webdriverio instance
 */
PointerEvents.prototype.move = function (x, y) {
    var cmd = ` \
        var el = document.querySelector("${this.selector}"); \
        var ev = new PointerEvent("pointermove", \
            { clientX: ${x}, clientY: ${y}, \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);`;

    return this._page.getDriver().execute(cmd);
}

/**
 * Cancel pointer on element by selector.
 *
 * @param  {string} selector - css selector
 * @param  {integer} x - `x` coordinate
 * @param  {integer} y - `y` coordinate
 * @return {object} - webdriverio instance
 */
PointerEvents.prototype.cancel = function (selector, x, y) {
    var cmd = "var el = document.querySelector('" + selector + "'); \
        var ev = new PointerEvent('pointercancel', \
            { clientX: " + x + ", clientY: " + y + ", \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);"

    return this._page.getDriver().execute(cmd);
}

/**
 * Moves out pointer from element by selector.
 *
 * @param  {string} selector - css selector
 * @param  {integer} x - `x` coordinate
 * @param  {integer} y - `y` coordinate
 * @return {object} - webdriverio instance
 */
PointerEvents.prototype.out = function (selector, x, y) {
    var cmd = "var el = document.querySelector('" + selector + "'); \
        var ev = new PointerEvent('pointerout', \
            { clientX: " + x + ", clientY: " + y + ", \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);"

    return this._page.getDriver().execute(cmd);
}

/**
 * Leaves pointer from element by selector.
 *
 * @param  {string} selector - css selector
 * @param  {integer} x - `x` coordinate
 * @param  {integer} y - `y` coordinate
 * @return {object} - webdriverio instance
 */
PointerEvents.prototype.leave = function (selector, x, y) {
    var cmd = "var el = document.querySelector('" + selector + "'); \
        var ev = new PointerEvent('pointerleave', \
            { clientX: " + x + ", clientY: " + y + ", \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);"

    return this._page.getDriver().execute(cmd);
}
