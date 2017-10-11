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
    .usage("\nglace [options] [tests-file-or-folder]".white.bold)
    .options({
        /* configuration */
        "args-config": {
            describe: d("Path to JSON file with CLI arguments."),
            type: "string",
            default: "./args.json (if exists)",
            group: "Configuration:",
        },
        "config": {
            describe: d("Path to JS file with configuration which will be",
                        "merged with override default configuration"),
            type: "string",
            default: "./config.js (if exists)",
            group: "Configuration:",
        },
        "grep": {
            describe: d("Filter tests by name or name chunk"),
            type: "string",
            group: "Configuration:",
        },
        "retry": {
            describe: d("Number of times to retry failed test."),
            type: "number",
            default: 0,
            group: "Configuration:",
        },
        "chunk-retry": {
            describe: d("Number of times to retry failed chunk."),
            type: "number",
            default: 0,
            group: "Configuration:",
        },
        "allow-uncaught": {
            describe: d("Use mochajs processing of uncaught exceptions"),
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
        "platform": {
            describe: d("Specify platform type where tests will be executed."),
            type: "string",
            default: "pc",
            choices: [ "pc", "android", "ios" ],
            group: "Selenium:",
        },
        "browser": {
            describe: d("Name of browser where web tests will be",
                        "executed. Default value is platform specific."),
            type: "string",
            group: "Selenium:",
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
