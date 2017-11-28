"use strict";
/**
 * Steps for page.
 *
 * @module
 */

var url = require("url");

var LOG = require("glacejs-utils").logger;

var StepError = require("../error").StepError;
/**
 * Steps to manage page.
 *
 * @mixin PageSteps
 */
module.exports = {
    /**
     * Helper to register pages.
     *
     * @method
     * @instance
     * @arg {...Page} pages - Sequence of pages.
     */
    registerPages: function () {
        for (var page of arguments) {
            if (this._pages()[page.name]) {
                LOG.debug(`Page ${page.name} is registered already`);
                continue;
            };
            page.setDriver(this._webdriver);
            this._pages()[page.name] = page;
        };
    },
    /**
     * Helper to remove pages.
     *
     * @method
     * @instance
     * @arg {...string} pageNames - Sequence of page names.
     */
    removePages: function () {
        for (var pageName of arguments) {
            if (!this._pages()[pageName]) {
                LOG.debug(`Page ${pageName} isn't registered`);
                continue;
            };
            this._pages()[pageName].setDriver(null);
            delete this._pages()[pageName];
        };
    },
    /**
     * Step to open page.
     *
     * @method
     * @instance
     * @async
     * @arg {string} pageName - Name of page to open.
     */
    openPage: async function (pageName) {
        var page = this._pages()[pageName];
        var webUrl = url.resolve(this._appUrl, page.url);
        await this.openUrl(webUrl);
    },
    /**
     * Step to get current page.
     *
     * @async
     * @method
     * @instance
     * @return {Promise<Page>} - Page which corresponds to current browser URL.
     * @throws {StepError} - If no one of registered pages corresponds to
     *  current browser URL.
     */
    getCurrentPage: async function () {
        /* sort pages by descending page url length */
        var pages = Object.values(this._pages()).sort(
            (a, b) => a.url.length < b.url.length);

        var curUrl = url.parse(await this._webdriver.getUrl());

        for (var page of pages) {
            if (curUrl.pathname.startsWith(page.url)) return page;
        };
        throw new StepError(
            "No one of registered pages corresponds URL '${curUrl}'");
    },
    /**
     * Helper to initialize pages storage.
     *
     * @method
     * @protected
     */
    _pages: function () {
        if (!this.__pages) this.__pages = [];
        return this.__pages;
    },
};
