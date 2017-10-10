"use strict";
/**
 * Steps for virtual display.
 *
 * @module
 */

var resolution = require("screen-resolution");
var Xvfb = require("xvfb");

var CONF = require("../config");
var logger = require("../logger");
/**
 * Steps to manage virtual display.
 *
 * @mixin
 */
module.exports = {
    /**
     * Step to start virtual display. Step recall will be skipped if virtual
     *  display wasn't stopped before.
     *
     * @method
     * @instance
     * @async
     * @arg {object} [opts] - Step options.
     * @arg {number} [opts.width] - Virtual display width. By default
     *  corresponds to active display.
     * @arg {number} [opts.height] - Virtual display height. By default
     *  corresponds to active display.
     * @arg {number} [opts.depth=24] - Virtual display color depth.
     * @arg {number} [opts.timeout=1000] - Time to wait for virtual display
     *  will be started, ms.
     */
    startXvfb: async function (opts) {

        if (this._isXvfbStarted) {
            logger.stepDebug("Step to start Xvfb was passed already");
            return;
        };
        if (!CONF.xvfbWidth && !CONF.xvfbHeight) {
            var screen = await resolution.get();
        };
        opts = opts || {};
        var width = opts.width || CONF.xvfbWidth || screen.width;
        var height = opts.height || CONF.xvfbHeight || screen.height;
        var depth = opts.depth || 24;
        var timeout = opts.timeout || 1000;

        this._xvfb = new Xvfb({ timeout: timeout,
                                xvfb_args: [ "-screen", 0,
                                             `${width}x${height}x${depth}`,
                                             "-noreset", "-ac"] });
        this._xvfb.startSync();
        this._isXvfbStarted = true;
    },
    /**
     * Step to stop virtual display. Step call will be skipped if virtual
     *  display wasn't started before.
     *
     * @method
     * @instance
     */
    stopXvfb: function () {

        if (!this._isXvfbStarted) {
            logger.stepDebug("Step to start Xvfb wasn't passed yet");
            return;
        };

        this._xvfb.stopSync();
        this._isXvfbStarted = false;
    },
};
