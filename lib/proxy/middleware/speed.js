"use strict";
/**
 * Middleware to manage responses speed.
 *
 * @module
 */

var changeResponsesSpeed = module.exports = function () {

    if (!this.speed) return;

    var res = this.res;
    var req = this.req;
    var timer = 1;
    var size = Math.ceil(this.speed / 8);
    var prms = Promise.resolve();
    
    var resWrite = res.write;
    var resEnd = res.end;
    
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

    res.write = function () {
        promisify(Array.from(arguments));
    };

    res.end = function () {
        var args = Array.from(arguments);
        promisify(args);

        prms.then(() => {
            args[0] = null;
            resEnd.apply(res, args);
        });
    };

    return false;
};
