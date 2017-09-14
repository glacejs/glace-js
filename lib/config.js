"use strict";
/**
 * Configuration of framework and executed test cases. It also may be used
 * as a bus to read/write data and share it among components and objects.
 *
 * @module
 */

var fs = require("fs");
var path = require("path");

var _ = require("lodash");
var argv = require("yargs").argv;
var mkdirp = require("mkdirp");
var rimraf = require("rimraf");

var ConfigError = require("./error").ConfigError;

var cwd = process.cwd();

var argConfig = {};
var argConfigPath = path.resolve(cwd, "args.json");

if (fs.existsSync(argConfigPath)) {
    argConfig = require(argConfigPath);
    for (var key in argConfig) {
        argConfig[_.camelCase(key)] = argConfig[key];
        delete argConfig[key];
    };
};

_.assign(argConfig, argv);

if (argConfig.target) {
    var testsDir = path.resolve(cwd, argConfig.target);
} else if (argConfig._ && argConfig._[0]) {
    var testsDir = path.resolve(cwd, argConfig._[0]);
} else {
    var testsDir = path.resolve(cwd, "tests");
};
if (!fs.existsSync(testsDir)) {
    throw new ConfigError(`File or folder with tests "${testsDir}" is absent`);
};

var reportsDir = path.resolve(cwd, (argConfig.report || "reports"));
if (fs.existsSync(reportsDir)) {
    rimraf.sync(reportsDir);
};
mkdirp.sync(reportsDir);

var config = module.exports = {
    curTestCase: null,
    testCases: [],
    testsDir: testsDir,
    reportsDir: reportsDir,
    log: {
        file: path.resolve(cwd, "glacejs.log"),
        level: "debug",
    },
    webdriver: {
        desiredCapabilities: {
            browserName: "chrome",
            chromeOptions: {
                args: [ "test-type",
                        "start-maximized",
                        "disable-infobars",
                        "enable-precise-memory-info" ],
                prefs: {
                    "credentials_enable_service": false,
                    "profile": {
                        'password_manager_enabled': false
                    }
                }
            }
        }
    }
};



var userConfig = {};
var userConfigPath = path.resolve(cwd, "config.js");

if (fs.existsSync(userConfigPath))
    userConfig = require(userConfigPath);

_.assign(config, userConfig);

config.isWeb = !!argConfig.web;
config.noDriversInstall = !argConfig.installDrivers;
