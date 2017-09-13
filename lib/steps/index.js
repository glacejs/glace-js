"use strict";

var Steps = module.exports = function () {};

Steps.register = function () {
    for (var cls in arguments)
        _.assign(Steps.prototype, cls.prototype);
};
