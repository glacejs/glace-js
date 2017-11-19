"use strict";

/**
 * Contains `GlaceJS` utils and helpers.
 *
 * @module
 */

var fs = require("fs");
var path = require("path");

var _ = require("lodash");
var mkdirp = require("mkdirp");
/**
 * Gets default value for variable among passed listed values.
 *
 * @function
 * @arg {...*} values - variable values
 * @return {*} - last specified value or null if last is undefined.
 */
module.exports.defVal = function () {
    for (var arg of arguments)
        if (typeof arg !== "undefined")
            return arg;
    return null;
};
/**
 * Capitalizes first letter of string. Doesn"t influence to case
 * of other letters.
 *
 * @function
 * @param {string} string - string to capitalize
 * @return {string} - capitalized string
 */
module.exports.capitalize = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
/**
 * Clears empty folders recursive.
 *
 * @function
 * @arg {string} folder - path to root folder
 */
var clearEmptyFolders = module.exports.clearEmptyFolders = folder => {
    var files = fs.readdirSync(folder);

    for (var fileName of files) {
        var filePath = path.join(folder, fileName);
        if (fs.statSync(filePath).isDirectory()) {
            clearEmptyFolders(filePath);
        };
    };
    if (!_.isEmpty(files)) {
        files = fs.readdirSync(folder);
    };
    if (_.isEmpty(files)) {
        fs.rmdirSync(folder);
    };
};
/**
 * Makes delay (sleep) during code execution.
 *
 * @param {number} timeout - Time to sleep, ms.
 * @param {boolean} [blocking=false] - Flag whether sleep should be
 *  block code execution.
 * @return {Promise} - If sleep isn't blocking.
 */
module.exports.sleep = (timeout, blocking) => {
    blocking = !!blocking;
    if (blocking) {
        (ms => {
            ms += new Date().getTime();
            while (new Date < ms) {};
        })(timeout);
    } else {
        return new Promise(resolve => {
            setTimeout(resolve, timeout);
        });
    };
};
/**
 * Composes file path from segments. If folder of file is absent, it will
 * be created.
 *
 * @function
 * @arg {...string} paths - A sequence of paths or path segments.
 * @return {string} - Composed path.
 */
module.exports.mkpath = function () {
    var result = path.resolve.apply(path, arguments);
    var dirname = path.dirname(result);
    mkdirp.sync(dirname);
    return result;
};
/**
 * Helper to generate request key for storage.
 *
 * @function
 * @ignore
 * @arg {Request} req - Client request.
 * @return {string} - Request key according to its method, host, url.
 */
module.exports.getReqKey = req => req.method + "_" + req.headers.host + req.url;
