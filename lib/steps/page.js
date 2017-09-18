"use strict";
/**
 * Steps to manage page.
 *
 * @module
 */

module.exports = {

    registerPage: function (page) {
        page.setDriver(this._webdriver);
        this._pages[page.name] = page;
    },

    removePage: function (pageName) {
        this._pages[pageName].setDriver(null);
        delete this._pages[pageName];
    }

    openPage: function (pageName) {
        var page = this._pages[pageName];
        page.open();
    },

    getCurrentPage: function () {

        var pages = Object.values(this._pages).sort(
            (a, b) => a.url.length < b.url.length);

        var curUrl = await this._webdriver.getUrl();

        for (var page of pages) {
            if (curUrl.matches(page.url)) return page;
        };
        throw new StepError(
            "No one of registered page corresponds URL '${curUrl}'");
    },
};
