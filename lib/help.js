"use strict";
/**
 * Help description.
 *
 * @module
 */

require("colors");

var trigger = true;

var d = function () {
    var msg = Array.from(arguments).join(" ");
    msg = (trigger ? msg.yellow : msg.cyan).bold;
    trigger = !trigger;
    return msg;
};

var argv = require("yargs")
    .usage("\nglace [options] [test-files-or-folders]".white.bold)
    .options({
        /* configuration */
        "args-config": {
            describe: d("Path to JSON file with CLI arguments.",
                        "Default is 'cwd/args.json' (if it exists)."),
            type: "string",
            group: "Configuration:",
        },
        "config": {
            describe: d("Path to JS file with configuration which will be",
                        "merged with override default configuration.",
                        "Default is 'cwd/config.js' (if it exists)."),
            type: "string",
            group: "Configuration:",
        },
        "grep": {
            describe: d("Filter tests by name or name chunk."),
            type: "string",
            group: "Configuration:",
        },
        "root-conftest": {
            describe: d("Path to root conftest.js which will be loaded",
                        "before all."),
            type: "string",
            group: "Configuration:",
        },
        "languages": {
            describe: d("List of tested languages separated with comma."),
            type: "string",
            group: "Configuration:",
        },
        "retry": {
            describe: d("Number of times to retry failed test.",
                        "Default is 0."),
            type: "number",
            group: "Configuration:",
        },
        "chunk-retry": {
            describe: d("Number of times to retry failed chunk.",
                        "Default is 0."),
            type: "number",
            group: "Configuration:",
        },
        "uncaught": {
            describe: d("Strategy to process of uncaught exceptions.",
                        "Supported values are 'log', 'fail', 'mocha'.",
                        "Default value is 'log'."),
            type: "string",
            group: "Configuration:",
        },
        "stdout-log": {
            describe: d("Print log messages to stdout."),
            type: "boolean",
            group: "Configuration:",
        },
        "testrail": {
            describe: d("Plug in testrail reporter."),
            type: "boolean",
            group: "Configuration:",
        },
        /* selenium */
        "dont-install-drivers": {
            describe: d("Flag to not install selenium drivers on tests run."),
            type: "boolean",
            group: "Selenium:",
        },
        "web": {
            describe: d("Flag to launch tests in browser. Browser will be",
                        "launched on session start and closed on session finish."),
            type: "boolean",
            group: "Selenium:",
        },
        "app": {
            describe: d("Application URL which will be used for web tests."),
            type: "string",
            group: "Selenium:",
        },
        "selenium-addr": {
            describe: d("Connect to launched selenium server with this address."),
            type: "string",
            group: "Selenium:",
        },
        "platform": {
            describe: d("Specify platform type where tests will be executed.",
                        "Default is 'pc'."),
            type: "string",
            choices: [ "pc", "android", "ios" ],
            group: "Selenium:",
        },
        "browser": {
            describe: d("Name of browser where web tests will be",
                        "executed. Default value is platform specific."),
            type: "string",
            group: "Selenium:",
        },
        /* appium */
        "device": {
            describe: d("Mobile device name."),
            type: "string",
            group: "Appium:",
        },
        "os-version": {
            describe: d("Mobile operating system version."),
            type: "string",
            group: "Appium:",
        },
        "ios-engine": {
            describe: d("iOS automation engine name."),
            type: "string",
            group: "Appium:",
        },
        /* video */
        "video": {
            describe: d("Capture video of executed tests.",
                        "Video will be removed if test is passed."),
            type: "boolean",
            group: "Video:",
        },
        "force-video": {
            describe: d("Capture video of executed tests.",
                        "Video will be saved even if test is passed."),
            type: "boolean",
            group: "Video:",
        },
        /* proxy */
        "proxy": {
            describe: d("Use http proxy."),
            type: "boolean",
            group: "Proxy:",
        },
        "proxy-port": {
            describe: d("Port for http proxy. Default is random."),
            type: "number",
            group: "Proxy:",
        },
        "global-proxy": {
            describe: d("Use transparent global proxy. Chromium browsers only."),
            type: "boolean",
            group: "Proxy:",
        },
        "global-proxy-port": {
            describe: d("Port for transparent global proxy. Default is 8888."),
            type: "number",
            group: "Proxy:",
        },
        "install-certificate": {
            describe: d("Install global proxy certificate as trusted.",
                        "Requires administrator permissions."),
            type: "boolean",
            group: "Proxy:",
        },
        "cache": {
            describe: d("Enable middleware to cache proxy responses to disk."),
            type: "boolean",
            group: "Proxy:",
        },
        "existing-cache": {
            describe: d("Use existing cache if it exists."),
            type: "boolean",
            group: "Proxy:",
        },
        "reconnect": {
            describe: d("Number of proxy reconnects on request error.",
                        "Default is 1."),
            type: "number",
            group: "Proxy:",
        },
        /* virtual display */
        "xvfb": {
            describe: d("Use xvfb for headless testing"),
            type: "string",
            group: "Virtual display:",
        },
    })
    .help("h")
    .alias("h", "help")
    .epilog("Have a green test ;)".green.bold)
    .argv;
