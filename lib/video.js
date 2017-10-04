"use strict";
/**
 * Classes and functions for video recording.
 *
 * @module
 */

var spawn = require("cross-spawn");
var path = require("path");

var ConfigError = require("./error").ConfigError;
var logger = require("./logger");
var U = require("./utils");
/**
 * Creates a new instance of VideoRecorder.
 *
 * @class
 * @classdesc contains methods to record video for tests
 * @property {boolean} isRunning=false - flag is video recorder running or no
 * @property {?string} filePath=null - path video file
 */
var VideoRecorder = module.exports = function () {
    this.isRunning = false;
    this.filePath = null;

    this._process = null;
    this._recordOpts = null;
};
/**
 * Configures video recorder.
 *
 * @method
 * @arg {object} [opts] - recorder configuration
 * @arg {number} [opts.fps=30] - video framerate
 * @arg {number} [opts.width=1024] - video width
 * @arg {number} [opts.height=768] - video height
 * @arg {number} [opts.x=0] - `X`-offset on display
 * @arg {number} [opts.y=0] - `Y`-offset on display
 */
VideoRecorder.prototype.configure = function (opts) {
    opts = U.defVal(opts, {});
    opts.fps = U.defVal(opts.fps, 30);
    opts.width = U.defVal(opts.width, 1024);
    opts.height = U.defVal(opts.height, 768);
    opts.x = U.defVal(opts.x, 0);
    opts.y = U.defVal(opts.y, 0);
    opts.size = opts.width + "x" + opts.height;
    this.filePath = U.defVal(opts.path, path.resolve(__dirname, "out.avi"));

    if (process.platform === "win32") {
        this._recordCmd = "ffmpeg";
        this._recordOpts = [ "-y",
                             "-loglevel", "quiet",
                             "-video_size", opts.size,
                             "-offset_x", opts.x,
                             "-offset_y", opts.y,
                             "-draw_mouse", 0,
                             "-framerate", opts.fps,
                             "-f", "gdigrab",
                             "-i", "desktop",
                             "-vcodec", "libx264",
                             this.filePath ];
    } else if (process.platform === "linux") {
        this._recordCmd = "avconv";
        this._recordOpts = [ "-y",
                             "-loglevel", "quiet",
                             "-f", "x11grab",
                             "-r", opts.fps,
                             "-s", opts.size,
                             "-i", `${process.env.DISPLAY}+${opts.x},${opts.y}`,
                             "-codec", "libx264",
                             this.filePath ];
    } else {
        throw new ConfigError(`Video capture isn't supported ` +
                              `on platform '${process.platform}'`);
    };
};
/**
 * Starts video recorder.
 *
 * @method
 * @throws {Error} if video recorder is started already
 * @throws {Error} if video recorder isn't configured yet
 */
VideoRecorder.prototype.start = function () {
    if (this.isRunning) return;
    if (!this._recordOpts)
        throw new Error("Video recorder isn't configured yet");

    this._process = spawn(this._recordCmd, this._recordOpts,
                          { killSignal: "SIGINT" });
    this.isRunning = true;
};
/**
 * Stops video recorder.
 *
 * @method
 * @throws {Error} if video recorder isn't started yet
 */
VideoRecorder.prototype.stop = function () {
    if (!this.isRunning) return;

    return new Promise((resolve, reject) => {
        this._process.on("exit", (code, signal) => {
            logger.debug(`${this._recordCmd} was stopped with ` +
                         `code ${code} and signal ${signal}`);
            this.isRunning = false;
            resolve();
        });
        this._process.on("error", reject);
        this._process.kill("SIGINT");
    });
};
