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
 * @global
 * @function
 */
global.fixVideo = func => {
    var videoStarted = false;
    var errNumBefore = null;

    before(async () => {
        errNumBefore = CONF.curTestCase.errors.length;
        videoStarted = await SS.startVideo();
    });

    func();

    after(async () => {
        if (!videoStarted) return;
        await SS.stopVideo();
        videoStarted = false;

        if (!CONF.forceVideo &&
                CONF.curTestCase.errors.length === errNumBefore) {
            SS.removeVideo();
        };
    });
};
