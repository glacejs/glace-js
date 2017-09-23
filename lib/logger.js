"use strict";
/**
 * Configures `GlaceJS` logging.
 *
 * @module
 */

var fs = require("fs");
var path = require("path");

var _ = require("lodash");
var mkdirp = require("mkdirp");
var winston = require("winston");

var CONF = require("./config");

if (fs.existsSync(CONF.log.file))
    fs.unlinkSync(CONF.log.file);

winston.level = CONF.log.level;
winston.add(winston.transports.File, { filename: CONF.log.file, json: false });
if (!CONF.stdoutLog) winston.remove(winston.transports.Console);

var stepsLogger = new winston.Logger;
var debugLogger =  new winston.Logger;

/**
 * Logs step info to `steps.log` file inside folder with test case name.
 *
 * @function
 */
winston.step = function () {
    if (CONF.stdoutLog) console.log.apply(console, arguments);
    stepsLogger.info.apply(stepsLogger, arguments);
};

/**
 * Logs step debug to `debug.log` file inside folder with test case name.
 *
 * @function
 */
winston.stepDebug = function () {
    if (CONF.stdoutLog) console.log.apply(console, arguments);
    debugLogger.info.apply(debugLogger, arguments);
};

/**
 * Sets target logs folder according by test case name.
 *
 * @function
 */
winston.setTestCase = () => {
    var logsDir = path.resolve(CONF.reportsDir,
                               CONF.curTestCase.name,
                               "logs");
    mkdirp.sync(logsDir);

    var stepsLog = path.resolve(logsDir, "steps.log");
    var debugLog = path.resolve(logsDir, "debug.log");

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

module.exports = winston;
