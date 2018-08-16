"use strict";

var glace = require("glace-core");

var CONF = require("../lib").config;
var Page = require("../lib").Page;

CONF.web.url = "https://yandex.ru";
CONF.web.width = 1066;
CONF.web.height = 600;

$.registerPages(
    new Page(
        "index", "/", {
            searchField: "input#text",
            searchButton: "button.button_theme_websearch[type='submit']" }));

glace.Steps.register({

    check_timer: function () {
        this.checkTimer({ "to be below": Infinity });
    },

    get_element: async function () {
        await this.getElement("searchButton");
    },

    limit_proxy_speed: function () {
        this.limitProxySpeed(512);
    },

    open_page: async function () {
        await this.openPage("index");
    },

    open_url: async function () {
        await this.openUrl("https://github.com");
    },

    make_pause: async function () {
        await this.pause(0.1, "small sleep");
    },

    make_screenshot: async function () {
        this.ctx.screenshot = await this.makeScreenshot();
    },

    resize_image: async function () {
        await this.resizeImage(this.ctx.screenshot, "50%");
    },
});
