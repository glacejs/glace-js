"use strict";
/**
 * Configures `GlaceJS` before tests run.
 *
 * @module
 */

var fs = require("fs");
var path = require("path");

var _ = require("lodash");
var argv = require("yargs").argv
var expect = require("chai").expect;
var fse = require("fs-extra");

var U = require("glacejs-utils");
var LOG = U.logger;

if (process.platform === "win32") {
    var binary = require("binary");
    binary.activateFFmpeg();
    binary.activateImageMagick();
};

/* Configure plugins */
var plugins = [
    "glacejs-proxy",
];
for (var plugin of plugins) {
    try {
        require(plugin).config;
    } catch (e) {
        LOG.warn(`Plugin '${plugin}' isn't installed`);
    };
};

var config = U.config;
var args = config.args;

/* Set up test folders */

if (args._ && args._.length) {
    var targets = args._;
} else if (args.targets && args.targets.length) {
    var targets = args.targets;
} else {
    var targets = ["tests"];
};

var testDirs = targets.map(target => path.resolve(U.cwd, target))

/* Set up reports folder */

var reportsDir = path.resolve(U.cwd, (args.report || "reports"));
if (fs.existsSync(reportsDir)) fse.removeSync(reportsDir);
fse.mkdirsSync(reportsDir);

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
 * @property {string} testDirs - Path to test directories or test modules.
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
var config = module.exports = _.merge(config, {
    curTestCase: null,
    testCases: [],
    testDirs: testDirs,
    reportsDir: reportsDir,
    timeouts: {
        testCase: 180000,
        pageLoad: 60000,
        uiAction: 10000,
        proxy: 60000,
    },
    testrail: {
        host: null,
        user: null,
        token: null,
    },
    cache: {
        ttl: Number.MAX_SAFE_INTEGER,
        size: 10 * 1024 * 1024 * 1024,
    },
    isRunPassed: null,
    languages: [],
    webdriver: {}  // will be configured below
});
config.proxy = config.proxy || {};

/* Use CLI arguments */

config.uncaught = (args.uncaught || "log").toLowerCase();
expect([ "log", "fail", "mocha" ],
       "Invalid `--uncaught` value").include(config.uncaught);
config.rootConftest = args.rootConftest;
config.isWeb = !!args.web;  // default `false`
config.appUrl = args.app;
config.installDrivers = !args.dontInstallDrivers && !args.seleniumAddr;  // default `true`
config.platform = args.platform || "pc";
expect(["pc", "android", "ios"],
       "Invalid `--platform` value").include(config.platform);
config.browserName = args.browser;  // default is platform specific
config.testRetries = args.retry || 0;
config.chunkRetries = args.chunkRetry || 0;
expect(config.testRetries).gte(0);
config.stdoutLog = !!args.stdoutLog;  // default `false`
config.toTestrail = !!args.testrail;  // default `false`
config.grep = args.grep;
config.suppressUncaught = !args.allowUncaught;  // default `false`
config.useXvfb = !!args.xvfb;  // default `false`
if (typeof(args.xvfb) === "number") {
    args.xvfb = String(args.xvfb);
};
if (typeof(args.xvfb) === "string") {
    var width, height;
    [ width, height ] = args.xvfb.split("x");
    expect(width && height,
           "Invalid `xvfb` options. Use variants " +
           "`--xvfb` or `--xvfb <width>x<height>`").to.exist;
    config.xvfbWidth = width;
    config.xvfbHeight = height;
};
config.captureVideo = !!args.video || !!args.forceVideo;  // default `false`
config.forceVideo = !!args.forceVideo;  // default `false`

if (args.languages) {
    config.languages = _.filter(_.map(args.languages.split(','),
                                      el => el.trim()));
};

/* Configure webdriver */

var desired = config.webdriver.desiredCapabilities = {};

if (args.seleniumAddr) {
    var host, port;
    [host, port] = args.seleniumAddr.split(':');
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
    desired.deviceName = args.device;
    desired.platformVersion = String(args.osVersion);
    if (args.udid) {
        desired.udid = args.udid;
    };
    if (config.platform === "android") {
        config.isAndroid = true;
        desired.browserName = args.browser || "chrome";
        desired.platformName = "Android";
    };
    if (config.platform === "ios") {
        config.isIos = true;
        desired.browserName = args.browser || "safari";
        desired.platformName = "iOS";
        desired.automationName = args.iosEngine || "XCUITest";
    };
};

/* Merge user config */

var userConfig = {};
var userConfigPath = path.resolve(U.cwd, (args.config || "config.js"));

if (fs.existsSync(userConfigPath)) {
    userConfig = require(userConfigPath);
};
_.assign(config, userConfig);
