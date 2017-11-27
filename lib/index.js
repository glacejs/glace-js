"use strict";
/**
 * Main `GlaceJS` module.
 *
 * @module
 *
 * @property {object} config - {@link module:config|Config} module.
 * @property {object} error - {@link module:error|Error} module.
 * @property {object} logger - {@link module:logger|Logger} module.
 * @property {object} Page - {@link module:page/index|Page} module.
 * @property {object} reporter - {@link module:reporter/index|Reporter} module.
 * @property {object} run - {@link module:run|run} module.
 * @property {object} Steps - {@link module:steps|Steps} module.
 */

var config, error, logger, Page, reporter, run, Steps;

Object.defineProperty(exports, "config", {
    get: function() {
        config = config || require("./config");
        return config;
    },
});

Object.defineProperty(exports, "error", {
    get: function() {
        error = error || require("./error");
        return error;
    },
});

Object.defineProperty(exports, "logger", {
    get: function() {
        logger = logger || require("./logger");
        return logger;
    },
});

Object.defineProperty(exports, "Page", {
    get: function() {
        Page = Page || require("./page");
        return Page;
    },
});

Object.defineProperty(exports, "reporter", {
    get: function() {
        reporter = reporter || require("./reporter");
        return reporter;
    },
});

Object.defineProperty(exports, "run", {
    get: function() {
        run = run || require("./run");
        return run;
    },
});

Object.defineProperty(exports, "Steps", {
    get: function() {
        Steps = Steps || require("./steps");
        return Steps;
    },
});
