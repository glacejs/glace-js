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
        "args-config": {
            describe: d("Path to JSON file with CLI arguments."),
            type: "string",
            default: "./args.json (if exists)",
        },
        "config": {
            describe: d("Path to JS file with configuration which will be",
                        "merged with override default configuration"),
            type: "string",
            default: "./config.js (if exists)",
        },
        "web": {
            describe: d("Flag to launch tests in browser. Browser will be",
                        "launched on session start and closed on session finish."),
            type: "boolean"
        },
        "app": {
            describe: d("Application URL which will be used for web tests."),
            type: "string"
        },
        "dont-install-drivers": {
            describe: d("Flag to not install selenium drivers on tests run."),
            type: "boolean"
        },
        "platform": {
            describe: d("Specify platform type where tests will be executed."),
            type: "string",
            default: "pc",
            choices: [ "pc", "android", "ios" ]
        },
        "browser": {
            describe: d("Name of browser where web tests will be",
                        "executed. Default value is platform specific."),
            type: "string"
        },
        "retry": {
            describe: d("Number of times to retry failed test."),
            type: "number",
            default: 0
        },
        "chunk-retry": {
            describe: d("Number of times to retry failed chunk."),
            type: "number",
            default: 0
        },
        "allow-uncaught": {
            describe: d("Use mochajs processing for uncaught exceptions"),
            type: "boolean",
        },
    })
    .help("h")
    .alias("h", "help")
    .epilog("Have a green test ;)".green.bold)
    .argv;
