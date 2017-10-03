"use strict";
/**
 * Steps for virtual display.
 *
 * @module
 */

var Xvfb = require("xvfb");

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
     * @this Steps
     * @arg {object} [opts] - Step options.
     * @arg {number} [opts.width=1280] - Virtual display width.
     * @arg {number} [opts.height=720] - Virtual display height.
     * @arg {number} [opts.depth=24] - Virtual display color depth.
     * @arg {number} [opts.timeout=1000] - Time to wait for virtual display
     *  will be started, ms.
     */
    startXvfb: function (opts) {

        if (this._isXvfbStarted) {
            logger.stepDebug("Step to start Xvfb was passed already");
            return;
        };

        opts = opts || {};
        var width = opts.width || 1280;
        var height = opts.height || 720;
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
     * Step to stop virtual display.
     *
     * @method
     * @instance
     * @this Steps
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
