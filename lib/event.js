"use strict";
/**
 * Browser events.
 *
 * @module
 */

/**
 * Creates a new pointer events instance.
 *
 * @class
 * @classdesc Contains browser pointer events.
 */
var PointerEvents = module.exports.PointerEvents = function (driver) {
    this._driver = driver;
}

/**
 * Moves pointer over element by selector.
 *
 * @param  {string} selector - css selector
 * @param  {integer} x - `x` coordinate
 * @param  {integer} y - `y` coordinate
 * @return {object} - webdriverio instance
 */
PointerEvents.prototype.over = function (selector, x, y) {
    var cmd = "var el = document.querySelector('" + selector + "'); \
        var ev = new PointerEvent('pointerover', \
            { clientX: " + x + ", clientY: " + y + ", \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);"

    return this._driver.execute(cmd);
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

    return this._driver.execute(cmd);
}

/**
 * Presses pointer down on element by selector.
 *
 * @param  {string} selector - css selector
 * @param  {integer} x - `x` coordinate
 * @param  {integer} y - `y` coordinate
 * @return {object} - webdriverio instance
 */
PointerEvents.prototype.down = function (selector, x, y) {
    var cmd = "var el = document.querySelector('" + selector + "'); \
        var ev = new PointerEvent('pointerdown', \
            { clientX: " + x + ", clientY: " + y + ", \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);"

    return this._driver.execute(cmd);
}

/**
 * Unpresses pointer up on element by selector.
 *
 * @param  {string} selector - css selector
 * @param  {integer} x - `x` coordinate
 * @param  {integer} y - `y` coordinate
 * @return {object} - webdriverio instance
 */
PointerEvents.prototype.up = function (selector, x, y) {
    var cmd = "var el = document.querySelector('" + selector + "'); \
        var ev = new PointerEvent('pointerup', \
            { clientX: " + x + ", clientY: " + y + ", \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);"

    return this._driver.execute(cmd);
}

/**
 * Moves pointer to element by selector.
 *
 * @param  {string} selector - css selector
 * @param  {integer} x - `x` coordinate
 * @param  {integer} y - `y` coordinate
 * @return {object} - webdriverio instance
 */
PointerEvents.prototype.move = function (selector, x, y) {
    var cmd = "var el = document.querySelector('" + selector + "'); \
        var ev = new PointerEvent('pointermove', \
            { clientX: " + x + ", clientY: " + y + ", \
              bubbles: true, cancelable: true, view: window }); \
        el.dispatchEvent(ev);"

    return this._driver.execute(cmd);
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

    return this._driver.execute(cmd);
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

    return this._driver.execute(cmd);
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

    return this._driver.execute(cmd);
}
