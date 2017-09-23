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
var expect = require("chai").expect;
var mkdirp = require("mkdirp");
var rimraf = require("rimraf");

var ConfigError = require("./error").ConfigError;

var cwd = process.cwd();

/* Load CLI arguments from config */

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

/* Set up tests folder */

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

/* Set up reports folder */

var reportsDir = path.resolve(cwd, (argConfig.report || "reports"));
if (fs.existsSync(reportsDir)) {
    rimraf.sync(reportsDir);
};
mkdirp.sync(reportsDir);

/* Set up default config */

var config = module.exports = {
    curTestCase: null,
    testCases: [],
    testsDir: testsDir,
    reportsDir: reportsDir,
    log: {
        file: path.resolve(cwd, "glacejs.log"),
        level: "debug",
    },
    webdriver: {}  // will be configured below
};

/* Use CLI arguments */

config.isWeb = !!argConfig.web;  // default `false`
config.appUrl = argConfig.url;
config.noDriversInstall = !argConfig.installDrivers;  // default `true`
config.platform = argConfig.platform || "pc";
expect(["pc", "android", "ios"],
       "Invalid `--platform` value").include(config.platform);
config.browserName = argConfig.browser;  // default is platform specific
config.testRetries = argConfig.retry || 0;
expect(config.testRetries).gte(0);
config.stdoutLog = !!argConfig.stdoutLog;  // default `false`
config.toTestrail = !!argConfig.testrail;  // default `false`

if (argConfig.seleniumAddr) {
    config.seleniumHost = argConfig.seleniumAddr.split(':')[0];
    config.seleniumPort = argConfig.seleniumAddr.split(':')[1];
};

/* Configure webdriver */

var desired = config.webdriver.desiredCapabilities = {};
if (config.seleniumHost) {
    config.webdriver.host = config.seleniumHost;
};
if (config.seleniumPort) {
    config.webdriver.port = config.seleniumPort;
};
if (config.platform === "pc") {
    config.isDesktop = true;
    desired.browserName = config.browserName || "chrome";
    if (desired.browserName === "chrome") {
        desired.chromeOptions = {
            args: [ "test-type",
                    "start-maximized",
                    "disable-infobars",
                    "enable-precise-memory-info" ],
            prefs: {
                "credentials_enable_service": false,
                "profile": {
                    "password_manager_enabled": false,
                },
            },
        };
    };
} else {
    config.isMobile = true;
    desired.deviceName = argConfig.device;
    desired.platformVersion = String(argConfig.osVersion);
    if (argConfig.udid) {
        desired.udid = argConfig.udid;
    };
    if (config.platform === "android") {
        config.isAndroid = true;
        desired.browserName = argConfig.browser || "chrome";
        desired.platformName = "Android";
    };
    if (config.platform === "ios") {
        config.isIos = true;
        desired.browserName = argConfig.browser || "safari";
        desired.platformName = "iOS";
        desired.automationName = argConfig.iosEngine || "XCUITest";
    };
};

/* Merge user config */

var userConfig = {};
var userConfigPath = path.resolve(cwd, "config.js");

if (fs.existsSync(userConfigPath)) {
    userConfig = require(userConfigPath);
};
_.assign(config, userConfig);
