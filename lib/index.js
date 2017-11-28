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

var config, error, Page, reporter, run, Steps;

Object.defineProperties(exports, {
    /**
     * @type {GlaceConfig}
     */
    config: {
        get: function() {
            config = config || require("./config");
            return config;
        },
    },
    error: {
        get: function() {
            error = error || require("./error");
            return error;
        },
    },
    /**
     * @type {Page}
     */
    Page: {
        get: function() {
            Page = Page || require("./page");
            return Page;
        },
    },
    /**
     * @type {GlaceReporter}
     */
    reporter: {
        get: function() {
            reporter = reporter || require("./reporter");
            return reporter;
        },
    },
    /**
     * @type {run}
     */
    run: {
        get: function() {
            run = run || require("./run");
            return run;
        },
    },
    /**
     * @type {Steps}
     */
    Steps: {
        get: function() {
            Steps = Steps || require("./steps");
            return Steps;
        },
    },
});
