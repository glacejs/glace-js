"use strict";
/**
 * Main `GlaceJS` module.
 *
 * @module
 *
 * @property {object} config - {@link module:config|Config} module.
 * @property {object} error - {@link module:error|Error} module.
 * @property {object} logger - {@link module:logger|Logger} module.
 * @property {object} page - {@link module:page/index|Page} module.
 * @property {object} reporter - {@link module:reporter/index|Reporter} module.
 * @property {object} Steps - {@link module:steps|Steps} module.
 */

module.exports = {
    config: require("./config"),
    error: require("./error"),
    logger: require("./logger"),
    middleware: require("./proxy/middleware"),
    Page: require("./page"),
    reporter: require("./reporter"),
    run: require("./run"),
    Steps: require("./steps"),
};
