"use strict";
/**
 * Page of browser.
 *
 * @class
 * @name Page
 * @arg {string} name - Name of page.
 * @arg {string} pageUrl - URL of page.
 * @arg {object} elements - Element names and selectors dictionary.
 */

var GlaceError = require("../error").GlaceError;
var Element = require("./element");

var Page = function (name, pageUrl, elements) {

    this.name = name;
    this.url = pageUrl;

    this._webdriver = null;

    this.addElements(elements || {});
};
module.exports = Page;
/**
 * Sets webdriver for page.
 *
 * @method
 * @arg {object} webdriver - Webdriver instance.
 */
Page.prototype.setDriver = function (webdriver) {
    this._webdriver = webdriver;
};
/**
 * Gets webdriver.
 *
 * @method
 * @return {object} - Webdriver instance.
 * @throws {AssertionError} - If webdriver isn't set yet.
 */
Page.prototype.getDriver = function () {
    expect(this._webdriver,
           "Webdriver isn't set")
        .to.not.be.null;
    return this._webdriver;
};
/**
 * Adds elements to page.
 *
 * @method
 * @arg {object} elements - Element names and selectors dictionary.
 */
Page.prototype.addElements = function (elements) {

    for (var name in elements) {
        var selector = elements[name];

        if (this[name]) {
            throw new GlaceError(
                `Page '${this.name}' already contains property '${name}'`);
        };
        this[name] = new Element(name, selector, this);
    };
};
/**
 * Removes elements from page.
 *
 * @method
 * @arg {...string} elementNames - Sequence of element names.
 */
Page.prototype.removeElements = function () {
    for (var name of arguments) delete this[name];
};
