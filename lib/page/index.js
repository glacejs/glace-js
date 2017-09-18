"use strict";
/**
 * Page.
 *
 * @module
 */

var GlaceError = require("../error").GlaceError;
var Element = require("./element");

var Page = module.exports.Page = function (name, pageUrl, elements) {

    this.name = name;
    this.url = pageUrl;

    this._webdriver = null;

    this.addElements(elements);
};

Page.prototype.setDriver = function (webdriver) {
    this._webdriver = webdriver;
};

Page.prototype._getDriver = function () {
    expect(this._webdriver,
           "Webdriver isn't set")
        .to.not.be.null;
};

Page.prototype.addElements = function (elements) {

    for (var name in elements) {
        var selector = elements[name];

        if (this[name]) {
            throw new GlaceError(
                `Page '${this.name}' already contains property '${name}'`);
        };
        this[name] = new Element(name, selector, page);
    };
};

Page.prototype.removeElements = function () {
    for (var name of arguments) delete this[name];
};

Page.prototype.open = function () {
    return this._getDriver().url(this.url);
};
