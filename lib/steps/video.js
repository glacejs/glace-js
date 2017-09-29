"use strict";
/**
 * Steps for video recording.
 *
 * @module
 */

var uuid = require("uuid/v4");

var _ = require("lodash");

var U = require("../utils");
var VideoRecorder = require("../video");
/**
 * Steps to manage video recording.
 *
 * @mixin
 */
module.exports = {
    /**
     * Step to start video recording.
     *
     * @method
     * @instance
     * @async
     * @this Steps
     * @arg {object} [opts] - Step options.
     * @arg {string} [opts.name] - File name. Extension `.avi` will be
     *  added automatically. By default name will be generated with `uuid`
     *  algorithm.
     * @arg {boolean} [opts.check=true] - Flag to check that video recording
     *  is launched.
     * @throws {AssertionError} - If video recording isn't launched.
     */
    startVideo: async function (opts) {

        opts = U.defVal(opts, {});
        var fileName = U.defVal(opts.name, uuid()) + ".avi";
        var check = U.defVal(opts.check, true);

        if (!this._video) this._video = new VideoRecorder();

        var opts = {};
        _.assign(opts, (await this._webdriver.windowHandlePosition()).value);
        _.assign(opts, (await this._webdriver.windowHandleSize()).value);

        opts.path = U.mkpath(CONF.reportsDir,
                             CONF.curTestCase.name,
                             "videos",
                             fileName);

        this._video.configure(opts);
        this._video.start();
        await this.pause(1000, "it needs a time to start recording");

        if (check) {
            expect(this._video.isRunning,
                   "Video recording isn't launched")
                .to.be.true;
        };
    },
    /**
     * Step to stop video recording.
     *
     * @method
     * @instance
     * @async
     * @this Steps
     * @arg {object} [opts] - step options
     * @arg {boolean} [opts.check=true] - Flag to check that video recording
     *  is stopped.
     * @throws {Error} if video recording isn't stoped
     */
    stopVideo: async function (opts) {

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

        await this.pause(1000, "it needs a time to gather latest frames");
        await this._video.stop();

        if (check) {
            expect(this._video.isRunning,
                   "Video recording is still running")
                .to.be.false;
        };

        return this._video.filePath;
    },
};
