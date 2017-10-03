"use strict";
/**
 * Steps for page.
 *
 * @module
 */

var StepError = require("../error").StepError;
/**
 * Steps to manage page.
 *
 * @mixin
 */
module.exports = {
    /**
     * Helper to register pages.
     *
     * @method
     * @instance
     * @this Steps
     * @arg {...Page} pages - Sequence of pages.
     */
    registerPage: function () {
        for (var page of arguments) {
            page.setDriver(this._webdriver);
            this._pages[page.name] = page;
        };
    },
    /**
     * Helper to remove pages.
     *
     * @method
     * @instance
     * @this Steps
     * @arg {...string} pageNames - Sequence of page names.
     */
    removePage: function () {
        for (var pageName of arguments) {
            this._pages[pageName].setDriver(null);
            delete this._pages[pageName];
        };
    },
    /**
     * Step to open page.
     *
     * @method
     * @instance
     * @async
     * @this Steps
     * @arg {string} pageName - Name of page to open.
     */
    openPage: async function (pageName) {
        var page = this._pages[pageName];
        var webUrl = url.resolve(this._appUrl, page.url);
        await this.openUrl(webUrl);
    },
    /**
     * Step to get current page.
     *
     * @method
     * @instance
     * @async
     * @this Steps
     * @return {Page} - Page which corresponds to current browser URL.
     * @throws {StepError} - If 
     */
    getCurrentPage: async function () {
        /* sort pages by descending page url length */
        var pages = Object.values(this._pages).sort(
            (a, b) => a.url.length < b.url.length);

        var curUrl = url.parse(await this._webdriver.getUrl());

        for (var page of pages) {
            if (curUrl.pathname.startsWith(page.url)) return page;
        };
        throw new StepError(
            "No one of registered pages corresponds URL '${curUrl}'");
    },
};
