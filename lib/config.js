"use strict";
/**
 * Configures `GlaceJS` before tests run.
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

/**
 * Contains `GlaceJS` main configuration.
 *
 * @namespace
 * @property {?TestCase} [curTestCase=null] - Pointer to current test case object.
 *  On tests run it points to `null`. The pointer changes when a test launches.
 * @property {TestCase[]} [testCases=[]] - List of all executed test cases. It
 *  populates when a test launches. It is used to store full information about
 *  executed tests and may be used in reporter.
 * @property {string} testsDir - Path to tests directory or single test module.
 *  If it contains path to directory, tests will be loaded recursive from it.
 *  By default `GlaceJS` tries to load tests from `tests` folder in current
 *  work directory.
 * @property {string} reportsDir - Path to directory where reports will be put.
 *  By default `GlaceJS` tries to put reports to `reports` folder in current
 *  work directory.
 * @property {object} log - Logger settings.
 * @property {string} log.file - Path to common logger file, which is
 *  `glacejs.log` inside current work directory.
 * @property {string} [log.level=debug] - Common logger level.
 * @property {object} webdriver - Webdriver settings. Corresponds to
 *  `webdriverio` remote settings.
 * @property {boolean} [isWeb=false] - Flag to launch tests in browser.
 * @property {string} appUrl - URL of web application.
 * @property {boolean} [noDriversInstall=true] - Flag to not install selenium
 *  drivers on start.
 * @property {string} [platform=pc] - Platform type where should launch tests.
 *  Permitted values are `pc`, `android`, `ios`.
 * @property {string} browserName - Name of browser where tests will be
 *  executed. Default value depends on platform. `Chrome` for `pc`, `chrome`
 *  for `android`, `safari` for `ios`.
 * @property {number} [testRetries=0] - Number of times to retry a failed test.
 * @property {boolean} [stdoutLog=false] - Flag to print log message in stdout.
 * @property {boolean} [toTestrail=false] - Flag to plug `testrail` reporter.
 * @property {string} [grep] - Filter for test cases.
 * @property {boolean} [suppressUncaught=false] - Suppress uncaught exceptions
 *  processing by mochajs.
 * @property {boolean} [isDesktop=false] - Flag that tests are launched on
 *  desktop.
 * @property {boolean} [isMobile=false] - Flag that tests are launched on
 *  mobile device.
 * @property {boolean} [isAndroid=false] - Flag that tests are launched on
 *  android device.
 * @property {boolean} [isIos=false] - Flag that tests are launched on iOS
 *  device.
 */
var config = module.exports = {
    curTestCase: null,
    testCases: [],
    testsDir: testsDir,
    reportsDir: reportsDir,
    log: {
        file: path.resolve(cwd, "glacejs.log"),
        level: "debug",
    },
    timeouts: {
        testCase: 180000,
    },
    cache: {},
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
config.grep = argConfig.grep;
config.suppressUncaught = !!argConfig.suppressUncaught;  // default `false`
config.useXvfb = !!argConfig.xvfb;  // default `false`

/* Configure webdriver */

var desired = config.webdriver.desiredCapabilities = {};

if (argConfig.seleniumAddr) {
    var host, port;
    [host, port] = argConfig.seleniumAddr.split(':');
    if (host) config.webdriver.host = host;
    if (port) config.webdriver.port = port;
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
