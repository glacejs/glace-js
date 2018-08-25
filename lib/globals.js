"use strict";

/**
 * Contains global framework functions and helpers.
 *
 * @module
 */

const glaceSession = session;

global.session = (name, fixtures, func) => {

    if (name instanceof Function) {
        func = name;
        name = null;
        fixtures = [];
    };
    if (fixtures instanceof Function) {
        func = fixtures;
        fixtures = [];
    };
    fixtures = fixtures || [];

    if (CONF.web.use && !CONF.cluster.slavesNum) fixtures.push(fxKillWebdriver);
    if (CONF.xvfb.use) fixtures.push(fxXvfb);
    if (CONF.proxy.global) fixtures.push(fxGlobalProxy);
    if (CONF.proxy.http) fixtures.push(fxHttpProxy);
    if (CONF.web.use && !CONF.webdriver.host) fixtures.push(fxSelenium);
    if (CONF.web.use) fixtures.push(fxWebdriver);
    if (CONF.web.use) fixtures.push(fxBrowser);
    if (CONF.image.screenOnFail) fixtures.push(fxScreenOnFail);

    glaceSession(name, fixtures, func);
};
