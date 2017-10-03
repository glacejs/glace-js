"use strict";
/**
 * Defines classes responsible for interaction with DOM in browser context.
 *
 * @module
 */

var weak = require("weak");

var U = require("../utils");

var PointerEvents = require("./event").PointerEvents;
/**
 * Creates a new instance of `Control`.
 *
 * `Control` binds DOM control in browser context with virtual control in test.
 *
 * @class
 * @arg {string} name - control name
 * @arg {object} driver - selenium driver instance
 */
var Control = function (name, selector, page) {

    this.name = name;
    this.selector = selector;
    this.event = new PointerEvents(selector, page);

    this._page = weak(page);
    this._elCmd = `document.querySelector('${this._selector}')`;
};
/**
 * Gets text content of DOM element.
 *
 * @method
 * @return {Promise.<string>} - text value or null
 */
Control.prototype.getText = function () {
    return this._driver.getText(this._selector).then(value => {
        if (value) return value.trim();
        return this._driver.getAttribute(this._selector, "value");
    }).then(value => {
        if (value) return value.trim();
        return this._driver.getAttribute(this._selector, "innerHTML");
    }).then(value => {
        if (value) return value.trim();
        return null;
    });
};
/**
 * Gets DOM control location with attributes:
 *  `x`, `y`, `midX`, `midY`, `width`, `height`
 *
 * @method
 * @return {Promise.<object>} - location of control
 */
Control.prototype.location = function (opts) {

    var cmd = ` \
        var ctrl = " + this._elCmd + "; \
        var rect = ctrl.getBoundingClientRect(); \
        var location = {}; \
        location.x = Math.ceil(rect.left); \
        location.y = Math.ceil(rect.top); \
        location.width = Math.ceil(rect.width); \
        location.height = Math.ceil(rect.height); \
        location.midX = Math.ceil(location.x + location.width / 2); \
        location.midY = Math.ceil(location.y + location.height / 2); \
        return location;`;

    return this._driver.execute(cmd).then(result => result.value);
};
/**
 * Scrolls control into browser viewport.
 *
 * @method
 * @return {Promise.<*>} - result of javascript execution in browser context
 */
Control.prototype.scrollIntoView = function () {
    var cmd = "return " + this._elCmd + ".scrollIntoView();";

    return this._driver.execute(cmd).then(result => {
        return result.value;
    });
};
/**
 * Clicks control in browser.
 *
 * @method
 * @return {Promise.<*>} - result of selenium execution in browser context
 */
Control.prototype.click = function () {
    return this.scrollIntoView().then(() => {
        return this._driver.click(this._selector);
    });
};
/**
 * Taps control in browser.
 *
 * @method
 */
Control.prototype.tap = Control.prototype.click;
/**
 * Defines whether control is selected or no.
 *
 * @method
 * @return {Promise.<boolean>} - `true` if control is selected, `false` otherwise
 */
Control.prototype.isSelected = function () {
    return this._driver.isSelected(this._selector).then(result => {
        if (result) return true;

        return this._driver.getAttribute(this._selector, "class").then(result => {
            return result.includes("selected");
        });
    });
};
/**
 * Defines whether control is exist or no.
 *
 * @method
 * @return {Promise.<boolean>} - `true` if control is exist, `false` otherwise
 */
Control.prototype.isExist = function () {
    var cmd = "return !!" + this._elCmd + ";";
    return this._driver.execute(cmd).then(result => {
        return result.value;
    });
};
/**
 * Waits for control is exist.
 *
 * @method
 * @arg {number} [timeout] - timeout to wait, ms
 * @return {Promise.<*>} - result of selenium execution
 * @throws {TimeoutError} - If control isn't exist after timeout.
 */
Control.prototype.waitForExist = function (timeout) {
    var timeout = U.defVal(timeout, CONF.timeout.animation);
    var errMsg = this._name + " isn't exist after " + timeout + " ms";

    return this._driver.waitUntil(async () => {
        return await this.isExist();
    }, timeout, errMsg);
};
/**
 * Waits for control isn't exist.
 *
 * @method
 * @arg {number} [timeout] - timeout to wait, ms
 * @return {Promise.<*>} - result of selenium execution
 * @throws {TimeoutError} - If control is still exist after timeout.
 */
Control.prototype.waitForNonExist = function (timeout) {
    var timeout = U.defVal(timeout, CONF.timeout.animation);
    var errMsg = this._name + " is still exist after " + timeout + " ms";

    return this._driver.waitUntil(async () => {
        return !(await this.isExist());
    }, timeout, errMsg);
};
/**
 * Defines whether control is visible or no.
 *
 * @method
 * @return {Promise.<boolean>} - `true` if control is visible, `false` otherwise
 */
Control.prototype.isVisible = function () {
    return this.isExist().then(result => {
        if (!result) return false;
        return this._driver.isVisible(this._selector);
    });
};
/**
 * Waits for control is visible.
 *
 * @method
 * @arg {number} [timeout] - timeout to wait, ms
 * @return {Promise.<*>} - result of selenium execution
 * @throws {TimeoutError} - If control isn't visible after timeout.
 */
Control.prototype.waitForVisible = function (timeout) {
    var timeout = U.defVal(timeout, CONF.timeout.animation);
    var errMsg = this._name + " isn't visible after " + timeout + " ms";

    return this._driver.waitUntil(async () => {
        return await this.isVisible();
    }, timeout, errMsg);
};
/**
 * Waits for control is invisible.
 *
 * @method
 * @arg {number} [timeout] - timeout to wait, ms
 * @return {Promise.<*>} - result of selenium execution
 * @throws {TimeoutError} - If control is still visible after timeout.
 */
Control.prototype.waitForInvisible = function (timeout) {
    var timeout = U.defVal(timeout, CONF.timeout.animation);
    var errMsg = this._name + " is still visible after " + timeout + " ms";

    return this._driver.waitUntil(async () => {
        return !(await this.isVisible());
    }, timeout, errMsg);
};
