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
var mkdirp = require("mkdirp");
var rimraf = require("rimraf");

if (process.platform === "win32") {
    var binary = require("binary");
    binary.activateFFmpeg();
    binary.activateImageMagick();
};

var cwd = process.cwd();

/* Load CLI arguments from config */

var argsConfig = {};
var argsConfigPath = path.resolve(cwd, (argv.argsConfig || "args.json"));

if (fs.existsSync(argsConfigPath)) {
    argsConfig = require(argsConfigPath);
    for (var key in argsConfig) {
        argsConfig[_.camelCase(key)] = argsConfig[key];
        delete argsConfig[key];
    };
};
_.assign(argsConfig, argv);

/* Set up tests folder */

if (argsConfig.target) {
    var testsDir = path.resolve(cwd, argsConfig.target);
} else if (argsConfig._ && argsConfig._[0]) {
    var testsDir = path.resolve(cwd, argsConfig._[0]);
} else {
    var testsDir = path.resolve(cwd, "tests");
};

/* Set up reports folder */

var reportsDir = path.resolve(cwd, (argsConfig.report || "reports"));
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
};

/* Use CLI arguments */

config.isWeb = !!argsConfig.web;  // default `false`
config.appUrl = argsConfig.app;
config.installDrivers = !argsConfig.dontInstallDrivers && !argsConfig.seleniumAddr;  // default `true`
config.platform = argsConfig.platform || "pc";
expect(["pc", "android", "ios"],
       "Invalid `--platform` value").include(config.platform);
config.browserName = argsConfig.browser;  // default is platform specific
config.testRetries = argsConfig.retry || 0;
config.chunkRetries = argsConfig.chunkRetry || 0;
expect(config.testRetries).gte(0);
config.stdoutLog = !!argsConfig.stdoutLog;  // default `false`
config.toTestrail = !!argsConfig.testrail;  // default `false`
config.grep = argsConfig.grep;
config.suppressUncaught = !argsConfig.allowUncaught;  // default `false`
config.useXvfb = !!argsConfig.xvfb;  // default `false`
if (typeof(argsConfig.xvfb) === "number") {
    argsConfig.xvfb = String(argsConfig.xvfb);
};
if (typeof(argsConfig.xvfb) === "string") {
    var width, height;
    [ width, height ] = argsConfig.xvfb.split("x");
    expect(width && height,
           "Invalid `xvfb` options. Use variants " +
           "`--xvfb` or `--xvfb <width>x<height>`").to.exist;
    config.xvfbWidth = width;
    config.xvfbHeight = height;
};
config.useProxy = !!argsConfig.proxy;  // default `false`
config.proxyPort = argsConfig.proxyPort || 0;
config.useGlobalProxy = !!argsConfig.globalProxy;  //default `false`
config.globalProxyPort = argsConfig.globalProxyPort || 8080;
config.installCertificate = !!argsConfig.installCertificate;  //default `false`
config.captureVideo = !!argsConfig.video || !!argsConfig.forceVideo;  // default `false`
config.forceVideo = !!argsConfig.forceVideo;  // default `false`
config.cache.use = !!argsConfig.cache || !!argsConfig.existingCache;  // default `false`
config.cache.existing = !!argsConfig.existingCache;  // default `false`

if (argsConfig.languages) {
    config.languages = _.filter(_.map(argsConfig.languages.split(','),
                                      el => el.trim()));
};

/* Configure webdriver */

var desired = config.webdriver.desiredCapabilities = {};

if (argsConfig.seleniumAddr) {
    var host, port;
    [host, port] = argsConfig.seleniumAddr.split(':');
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
    desired.deviceName = argsConfig.device;
    desired.platformVersion = String(argsConfig.osVersion);
    if (argsConfig.udid) {
        desired.udid = argsConfig.udid;
    };
    if (config.platform === "android") {
        config.isAndroid = true;
        desired.browserName = argsConfig.browser || "chrome";
        desired.platformName = "Android";
    };
    if (config.platform === "ios") {
        config.isIos = true;
        desired.browserName = argsConfig.browser || "safari";
        desired.platformName = "iOS";
        desired.automationName = argsConfig.iosEngine || "XCUITest";
    };
};

/* Merge user config */

var userConfig = {};
var userConfigPath = path.resolve(cwd, (argsConfig.config || "config.js"));

if (fs.existsSync(userConfigPath)) {
    userConfig = require(userConfigPath);
};
_.assign(config, userConfig);
