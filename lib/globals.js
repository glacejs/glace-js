"use strict";
/**
 * Contains global framework functions and helpers.
 *
 * @module
 */

var glaceSession = session;

global.session = (name, ctx, fixtures, func) => {

    if (name instanceof Function) {
        func = name;
        name = undefined;
    };
    if (ctx instanceof Function) {
        func = ctx;
        ctx = undefined;
    };
    if (fixtures instanceof Function) {
        func = fixtures;
        fixtures = undefined;
    };
    fixtures = fixtures || [];

    if (CONF.web.use) fixtures.push(fxKillWebdriver);
    if (CONF.xvfb.use) fixtures.push(fxXvfb);
    if (CONF.web.use && !CONF.webdriver.host) fixtures.push(fxSelenium);
    if (CONF.proxy.http) fixtures.push(fxHttpProxy);
    if (CONF.proxy.global) fixtures.push(fxGlobalProxy);
    if (CONF.web.use) fixtures.push(fxWebdriver);
    if (CONF.web.use) fixtures.push(fxBrowser);

    glaceSession(name, ctx, fixtures, func);
};
