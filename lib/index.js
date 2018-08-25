"use strict";

/**
 * `GlaceJS` main module.
 *
 * @module
 *
 * @prop {object} config - {@link module:config|Config} module.
 * @prop {object} error - {@link module:error|Error} module.
 * @prop {object} Page - {@link module:page/index|Page} module.
 * @prop {object} reporter - {@link module:reporter/index|Reporter} module.
 * @prop {object} run - {@link module:run|run} module.
 * @prop {object} Steps - {@link module:steps|Steps} module.
 */

let allure, config, error, help, plugins, Page, reporter, run, Steps;

Object.defineProperties(exports, {
    allure: {
        get: function () {
            allure = allure || require("glace-core").allure;
            return allure;
        },
    },
    /**
     * @type {GlaceConfig}
     */
    config: {
        get: function () {
            config = config || require("glace-core").config;
            return config;
        },
    },
    error: {
        get: function () {
            error = error || require("glace-core").error;
            return error;
        },
    },
    help: {
        get: function () {
            help = help || require("glace-core").help;
            return help;
        },
    },
    plugins: {
        get: function () {
            plugins = plugins || require("glace-core").plugins;
            return plugins;
        },
    },
    /**
     * @type {Page}
     */
    Page: {
        get: function () {
            Page = Page || require("glace-web").Page;
            return Page;
        },
    },
    /**
     * @type {GlaceReporter}
     */
    reporter: {
        get: function () {
            reporter = reporter || require("glace-core").reporter;
            return reporter;
        },
    },
    /**
     * @type {run}
     */
    run: {
        get: function () {
            run = run || require("./run");
            return run;
        },
    },
    /**
     * @type {Steps}
     */
    Steps: {
        get: function () {
            Steps = Steps || require("glace-core").Steps;
            return Steps;
        },
    },
});
