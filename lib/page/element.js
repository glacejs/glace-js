"use strict";
/**
 * Defines classes responsible for interaction with DOM in browser context.
 *
 * @module
 */

var weak = require("weak");

var U = require("glacejs-utils");

var PointerEvents = require("./event").PointerEvents;
/**
 * Creates a new instance of `Element`.
 *
 * `Element` binds DOM control in browser context with virtual control in test.
 *
 * @class
 * @arg {string} name - control name
 * @arg {object} driver - selenium driver instance
 */
var Element = module.exports = function (name, selector, page) {

    this.name = name;
    this.selector = selector;
    this.event = new PointerEvents(selector, page);

    this._page = weak(page);
    this._elCmd = `document.querySelector("${this.selector}")`;
};
/**
 * Gets webdriver element.
 *
 * @method
 * @return {object} - Webdriver element.
 */
Element.prototype.getElement = function () {
    return this._page.getDriver().element(this.selector);
};
/**
 * Gets text content of DOM element.
 *
 * @method
 * @return {Promise.<string>} - text value or null
 */
Element.prototype.getText = function () {
    return this._page.getDriver().getText(this.selector).then(value => {
        if (value) return value.trim();
        return this._page.getDriver().getAttribute(this.selector, "value");
    }).then(value => {
        if (value) return value.trim();
        return this._page.getDriver().getAttribute(this.selector, "innerHTML");
    }).then(value => {
        if (value) return value.trim();
        return null;
    });
};
/**
 * Sets text to DOM element.
 *
 * @method
 * @arg {string} text - Text value to assign.
 * @return {Promise}
 */
Element.prototype.setText = function (text) {
    return this._page.getDriver().setValue(this.selector, text);
};
/**
 * Gets DOM control location with attributes:
 *  `x`, `y`, `midX`, `midY`, `width`, `height`
 *
 * @method
 * @return {Promise.<object>} - location of control
 */
Element.prototype.location = function () {

    var cmd = ` \
        var ctrl = ${this._elCmd}; \
        var rect = ctrl.getBoundingClientRect(); \
        var location = {}; \
        location.x = Math.ceil(rect.left); \
        location.y = Math.ceil(rect.top); \
        location.width = Math.ceil(rect.width); \
        location.height = Math.ceil(rect.height); \
        location.midX = Math.ceil(location.x + location.width / 2); \
        location.midY = Math.ceil(location.y + location.height / 2); \
        return location;`;

    return this._page.getDriver().execute(cmd).then(result => result.value);
};
/**
 * Scrolls control into browser viewport.
 *
 * @method
 * @return {Promise.<*>} - result of javascript execution in browser context
 */
Element.prototype.scrollIntoView = function () {
    var cmd = "return " + this._elCmd + ".scrollIntoView();";

    return this._page.getDriver().execute(cmd).then(result => {
        return result.value;
    });
};
/**
 * Clicks control in browser.
 *
 * @method
 * @return {Promise} - result of selenium execution in browser context
 */
Element.prototype.click = function () {
    return this.waitForVisible().then(() => {
        return this.scrollIntoView();
    }).then(() => {
        return this._page.getDriver().click(this.selector);
    });
};
/**
 * Clicks element in browser via pointer events.
 *
 * @method
 * @return {Promise}
 */
Element.prototype.pClick = function () {
    var x, y;
    return this.waitForVisible().then(() => {
        return this.location();
    }).then(loc => {
        x = loc.midX;
        y = loc.midY;
        return this.event.move(x, y);
    }).then(() => {
        return this.event.down(x, y);
    }).then(() => {
        console.log(x, y);
        return this.event.up(x, y);
    });
};
/**
 * Taps control in browser.
 *
 * @method
 */
Element.prototype.tap = Element.prototype.click;
/**
 * Defines whether control is selected or no.
 *
 * @method
 * @return {Promise.<boolean>} - `true` if control is selected, `false` otherwise
 */
Element.prototype.isSelected = function () {
    return this._page.getDriver().isSelected(this.selector).then(result => {
        if (result) return true;

        return this._page.getDriver().getAttribute(this.selector, "class").then(result => {
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
Element.prototype.isExist = function () {
    var cmd = "return !!" + this._elCmd + ";";
    return this._page.getDriver().execute(cmd).then(result => result.value);
};
/**
 * Waits for control is exist.
 *
 * @method
 * @arg {number} [timeout] - timeout to wait, ms
 * @return {Promise.<*>} - result of selenium execution
 * @throws {TimeoutError} - If control isn't exist after timeout.
 */
Element.prototype.waitForExist = function (timeout) {
    var timeout = U.defVal(timeout, CONF.timeouts.uiAction);
    var errMsg = this.name + " isn't exist after " + timeout + " ms";

    return this._page.getDriver().waitUntil(async () => {
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
Element.prototype.waitForNonExist = function (timeout) {
    var timeout = U.defVal(timeout, CONF.timeouts.uiAction);
    var errMsg = `${this.name} (${this.selector}) still exists after ${timeout} ms`;

    return this._page.getDriver().waitUntil(async () => {
        return !(await this.isExist());
    }, timeout, errMsg);
};
/**
 * Defines whether control is visible or no.
 *
 * @method
 * @return {Promise.<boolean>} - `true` if control is visible, `false` otherwise
 */
Element.prototype.isVisible = function () {
    return this.isExist().then(result => {
        if (!result) return false;
        return this._page.getDriver().isVisible(this.selector);
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
Element.prototype.waitForVisible = function (timeout) {
    var timeout = U.defVal(timeout, CONF.timeouts.uiAction);
    var errMsg = `${this.name} (${this.selector}) isn't visible ` +
                 `after ${timeout} ms`;

    return this._page.getDriver().waitUntil(async () => {
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
Element.prototype.waitForInvisible = function (timeout) {
    var timeout = U.defVal(timeout, CONF.timeouts.uiAction);
    var errMsg = this.name + " is still visible after " + timeout + " ms";

    return this._page.getDriver().waitUntil(async () => {
        return !(await this.isVisible());
    }, timeout, errMsg);
};
