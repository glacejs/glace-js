"use strict";

/**
 * Contains global framework functions and helpers.
 *
 * @module
 */

const _ = require("lodash");

const gSession = session;

global.session = (name, fixtures, func) => {

    if (_.isFunction(fixtures)) [func, fixtures] = [fixtures];
    if (_.isArray(name)) [fixtures, name] = [name];
    if (_.isFunction(name)) [func, name] = [name];

    fixtures = fixtures || [];

    if (CONF.web.use && !CONF.cluster.slavesNum) fixtures.push(fxKillWebdriver);
    if (CONF.xvfb.use) fixtures.push(fxXvfb);
    if (CONF.proxy.global) fixtures.push(fxGlobalProxy);
    if (CONF.proxy.http) fixtures.push(fxHttpProxy);
    if (CONF.web.use && !CONF.webdriver.host) fixtures.push(fxSeleniumServer);
    if (CONF.web.use) fixtures.push(fxBrowser);
    if (CONF.image.screenOnFail) fixtures.push(fxScreenOnFail);

    gSession(name, fixtures, func);
};
