"use strict";
/**
 * Contains global functions and helpers
 *
 * @module
 */

/**
 * Verification matcher
 *
 * @function
 * @global
 */
global.expect = require("chai").expect;
/**
 * config
 *
 * @global
 */
global.CONF = require("./config");
/**
 * Scope
 *
 * @function
 * @global
 */
global.scope = describe;
/**
 * Test
 *
 * @function
 * @global
 */
global.test = (name, func) => {
    scope(name, () => {
        func();
    });
};
/**
 * Step
 *
 * @function
 * @global
 */
global.step = it;
/**
 * beforeStep
 *
 * @function
 * @global
 */
global.beforeStep = beforeEach;
/**
 * afterStep
 *
 * @function
 * @global
 */
global.afterStep = afterEach;
