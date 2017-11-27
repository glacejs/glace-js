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

var config, error, logger, Page, reporter, run, Steps;

Object.defineProperties(exports, {
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
    Page: {
        get: function() {
            Page = Page || require("./page");
            return Page;
        },
    },
    reporter: {
        get: function() {
            reporter = reporter || require("./reporter");
            return reporter;
        },
    },
    run: {
        get: function() {
            run = run || require("./run");
            return run;
        },
    },
    Steps: {
        get: function() {
            Steps = Steps || require("./steps");
            return Steps;
        },
    },
});
