"use strict";
/**
 * Middleware to manage responses speed.
 *
 * @module
 */

/**
 * Middleware to change responses speed.
 *
 * @function
 * @arg {object} res - http(s) response
 * @arg {number} speed - limited speed value, kb/s
 */
module.exports.changeResponsesSpeed = function () {

    if (!this.speed) return;

    var timer = 1;
    var size = Math.ceil(this.speed / 8);
    var prms = Promise.resolve();
    
    var resWrite = this.res.write;
    var resEnd = this.res.end;
    
    var promisify = args => {

        var chunk = args[0];
        if (!chunk) return;

        for (var i = 0; i < chunk.length; i += size) {
            prms = prms.then((idx => () => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        args[0] = chunk.slice(idx, idx + size);
                        resWrite.apply(res, args);
                        resolve();
                    }, timer);
                });
            })(i));
        };
    };

    this.res.write = function () {
        promisify(Array.from(arguments));
    };

    this.res.end = function () {
        var args = Array.from(arguments);
        promisify(args);

        prms.then(() => {
            args[0] = null;
            resEnd.apply(res, args);
        });
    };
};
