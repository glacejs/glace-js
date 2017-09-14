"use strict";
/**
 * Steps for video recording.
 *
 * @module
 */

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
     * @arg {object} [opts] - step options
     * @arg {boolean} [opts.check=true] - flag to check step result or no
     * @throws {Error} if video recording isn't started
     */
    startVideo: async function (opts) {
        opts = U.defVal(opts, {});
        opts.check = U.defVal(opts.check, true);

        this._video = new VideoRecorder();

        var opts = {};
        _.assign(opts, (await this._driver.windowHandlePosition()).value);
        _.assign(opts, (await this._driver.windowHandleSize()).value);

        opts.path = this._getPath(CONF.testCase.name, { typedirs: ['videos'], ext: 'mpg' });

        await this._video.configure(opts);
        await this._video.start();
        await this.pause(1000, "recorder needs a time to start recording");

        if (opts.check)
            this._video.isRunning.should.be.true;
    },
    /**
     * Step to stop video recording.
     *
     * @method
     * @instance
     * @async
     * @arg {object} [opts] - step options
     * @arg {boolean} [opts.check=true] - flag to check step result or no
     * @throws {Error} if video recording isn't stoped
     */
    stopVideo: async function (opts) {
        if (!this._video.isRunning) return;

        opts = U.defVal(opts, {});
        opts.check = U.defVal(opts.check, true);

        await this.pause(2000, "recorder needs a time to gather latest frames");
        await this._video.stop();

        if (opts.check)
            this._video.isRunning.should.be.false;

        return this._video.filePath;
    },
};
