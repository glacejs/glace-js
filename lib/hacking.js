"use strict";
/**
 * Contains hacks for test run.
 *
 * @module
 */

var Mocha = require("mocha");

var logger = require("./logger");
/**
 * Patches original `Mocha.Runner.prototype.uncaught` in order to skip
 * exceptions from proxy server `res.send()`.
 *
 * @function
 */
module.exports.suppressUncaught = () => {
    Mocha.Runner.prototype.uncaught = function (err) {
        logger.error(err);
        return;
    };
};
/**
 * Mocha runner.
 *
 * @type {Runner}
 */
var _mochaRunner;
(grep => {
    Mocha.Runner.prototype.grep = function() {
        _mochaRunner = this;
        return grep.apply(this, arguments);
    };
})(Mocha.Runner.prototype.grep);
/**
 * Gets mocha runner.
 *
 * @function
 */
module.exports.getRunner = () => _mochaRunner;
