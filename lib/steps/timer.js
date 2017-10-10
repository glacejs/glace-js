"use strict";
/**
 * Time steps.
 *
 * @module
 */

/**
 * Steps to measure time.
 *
 * @mixin
 */
module.exports = {
    /**
     * Step to start timer.
     *
     * @method
     * @instance
     */
    startTimer: function () {
        this._timer = new Date;
    },
    /**
     * Step to stop timer.
     *
     * @method
     * @instance
     */
    stopTimer: function () {
        this._timer = null;
    },
    /**
     * Step to check timer.
     *
     * @method
     * @instance
     * @arg {string|object} condition - chaijs condition.
     * @throws {AssertionError} - If timer verification is failed.
     */
    checkTimer: function (condition) {
        expect(this._timer, "Timer isn't started").to.exist;
        var diff = (new Date - this._timer) / 1000;
        expect(diff, "Timing is failed").to.correspond(condition);
    },
};
