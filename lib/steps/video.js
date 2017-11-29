"use strict";
/**
 * Steps for video recording.
 *
 * @module
 */

var path = require("path");

var _ = require("lodash");
var resolution = require("screen-resolution");
var uuid = require("uuid/v4");
var U = require("glacejs-utils");
var LOG = U.logger;
var VideoRecorder = require("../video");
/**
 * Steps to manage video recording.
 *
 * @mixin VideoSteps
 */
module.exports = {
    /**
     * Step to start video recording. Step recall will be skipped if video
     *  recording wasn't stopped before.
     *
     * @async
     * @method
     * @instance
     * @arg {object} [opts] - Step options.
     * @arg {string} [opts.name] - File name. Extension `.avi` will be
     *  added automatically. Default name will be generated with `uuid`
     *  algorithm.
     * @arg {string} [opts.path] - Folder to save video.
     * @arg {boolean} [opts.check=true] - Flag to check that video recording
     *  was launched.
     * @return {Promise<void>}
     * @throws {AssertionError} - If video recording wasn't launched.
     */
    startVideo: async function (opts) {

        if (this._isVideoStarted) {
            LOG.warn("Step to start video recording was passed already");
            return;
        };

        opts = U.defVal(opts, {});
        var fileName = U.defVal(opts.name, uuid()) + ".avi";
        var check = U.defVal(opts.check, true);

        if (!this._video) this._video = new VideoRecorder();

        var videoOpts = {};
        var screen = await resolution.get();

        if (await this._webdriver.session()) {

            _.assign(videoOpts,
                     (await this._webdriver.windowHandlePosition()).value);
            _.assign(videoOpts,
                     (await this._webdriver.windowHandleSize()).value);

            if (videoOpts.x < 0) videoOpts.x = 0;
            if (videoOpts.y < 0) videoOpts.y = 0;
            if (videoOpts.x + videoOpts.width > screen.width) {
                videoOpts.width = screen.width - videoOpts.x;
            };
            if (videoOpts.y + videoOpts.height > screen.height) {
                videoOpts.height = screen.height - videoOpts.y;
            };

        } else {
            videoOpts = { x: 0,
                          y: 0,
                          width: screen.width,
                          height: screen.height };
        };

        var testName = CONF.curTestCase ? _.kebabCase(CONF.curTestCase.name) : "";
        videoOpts.path = U.mkpath(
            U.defVal(opts.path,
                     path.resolve(CONF.reportsDir, testName, "videos")),
            fileName);

        this._video.configure(videoOpts);
        this._video.start();
        await this.pause(1, "it needs a time to start recording");

        if (check) {
            expect(this._video.isRunning,
                   "Video recording wasn't launched")
                .to.be.true;
        };

        this._isVideoStarted = true;
    },
    /**
     * Step to stop video recording. Step call will be skipped if video
     *  recording wasn't launched before.
     *
     * @async
     * @method
     * @instance
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that video recording
     *  was stopped.
     * @return {Promise<string>} - Path to recorded video.
     * @throws {AssertionError} - If video recording wasn't stopped.
     */
    stopVideo: async function (opts) {

        if (!this._isVideoStarted) {
            LOG.warn("Step to start video recording wasn't passed yet");
            return;
        };

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

        await this.pause(1, "it needs a time to gather latest frames");
        await this._video.stop();

        if (check) {
            expect(this._video.isRunning,
                   "Video recording was still running")
                .to.be.false;
        };

        this._isVideoStarted = false;

        return this._video.filePath;
    },
    /**
     * Step to get path to recorded video.
     *
     * @method
     * @instance
     * @arg {object} [opts] - Step options.
     * @arg {boolean} [opts.check=true] - Flag to check that video is recorded
     *  and path exists.
     * @return {string} - Path to recorded video.
     */
    getVideo: function (opts) {
        expect(this._video,
               "Video recorder isn't initialized").to.exist;

        opts = U.defVal(opts, {});
        var check = U.defVal(opts.check, true);

        if (check) {
            expect(this._video.isRunning,
                   "Can't get recorded video file path, " +
                   "because video is still recording").to.be.false;
            expect(this._video.filePath,
                   "Can't get recorded video file path, " +
                   "because it's empty").to.not.be.empty;
        };

        return this._video.filePath;
    },
};
