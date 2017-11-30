"use strict";
/**
 * `GlaceJS` fixtures.
 *
 * @module
 */

var CONF = require("./config");
/**
 * Fixture to capture tests video.
 *
 * @function
 * @global
 */
global.fixVideo = func => {
    var videoStarted = false;
    var errNumBefore = null;

    before(async () => {
        errNumBefore = CONF.curTestCase.errors.length;
        if (CONF.captureVideo) {
            await SS.startVideo();
            videoStarted = true;
        };
    });

    func();

    after(async () => {
        if (CONF.captureVideo) {
            await SS.stopVideo();
            videoStarted = false;

            if (!CONF.forceVideo &&
                    CONF.curTestCase.errors.length === errNumBefore) {
                SS.removeVideo();
            };
        };
    });
};
