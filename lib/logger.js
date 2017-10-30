"use strict";
/**
 * Configures `GlaceJS` logging.
 *
 * @module
 */

var fs = require("fs");
var path = require("path");

var _ = require("lodash");
var winston = require("winston");

var CONF = require("./config");
var U = require("./utils");

if (fs.existsSync(CONF.log.file))
    fs.unlinkSync(CONF.log.file);

var logger = new winston.Logger;
logger.level = CONF.log.level;
logger.add(winston.transports.File, { filename: CONF.log.file, json: false });
if (CONF.stdoutLog) logger.add(winston.transports.Console);

var stepsLogger = new winston.Logger;
var debugLogger =  new winston.Logger;
/**
 * Logs step info to `steps.log` file inside folder with test case name.
 *
 * @function
 */
logger.step = function () {
    if (CONF.stdoutLog) console.log.apply(console, arguments);
    stepsLogger.info.apply(stepsLogger, arguments);
};
/**
 * Logs step debug to `debug.log` file inside folder with test case name.
 *
 * @function
 */
logger.stepDebug = function () {
    if (CONF.stdoutLog) console.log.apply(console, arguments);
    debugLogger.info.apply(debugLogger, arguments);
};
/**
 * Sets target logs folder according by test case name.
 *
 * @function
 */
logger.setStepLog = () => {
    if (CONF.curTestCase) {
        var logsDir = path.resolve(CONF.reportsDir,
                                   _.kebabCase(CONF.curTestCase.name),
                                   "logs");
    } else {
        var logsDir = path.resolve(CONF.reportsDir, "logs");
    };

    var stepsLog = U.mkpath(logsDir, "steps.log");
    var debugLog = U.mkpath(logsDir, "debug.log");

    if (stepsLogger.transports.file) {
        stepsLogger.remove(winston.transports.File);
    };
    stepsLogger.add(winston.transports.File, { filename: stepsLog,
                                               json: false });

    if (debugLogger.transports.file) {
        debugLogger.remove(winston.transports.File);
    };
    debugLogger.add(winston.transports.File, { filename: debugLog,
                                               json: false });
};

module.exports = logger;
