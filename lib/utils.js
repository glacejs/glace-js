"use strict";

/**
 * Contains utils and helpers.
 *
 * @module utils
 */

var _ = require("lodash");
var fs = require("fs");
var path = require("path");
/**
 * Gets default value for variable among passed listed values.
 *
 * @function
 * @arg {...*} value - variable value
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
}
/**
 * Defines is node a leaf in tree according by its id.
 *
 * @arg {object} root - tree root
 * @return {function} - function to define node leaf status with closed root
 */
module.exports.isLeaf = root => {
    var _isLeaf = (nodeId, nodes) => {
        nodes = nodes || root;
        for (var key in nodes) {
            var node = nodes[key];
            if (_.isEmpty(node)) {
                if (key === nodeId)
                    return true;
                else
                    continue;
            };
            var isIt = _isLeaf(nodeId, node);
            if (isIt) return true;
        };
        return false;
    };
    return _isLeaf;
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
        if (fs.statSync(filePath).isDirectory())
            clearEmptyFolders(filePath);
    };
    if (!_.isEmpty(files))
        files = fs.readdirSync(folder);
    if (_.isEmpty(files))
        fs.rmdirSync(folder);
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
            while (new Date < ms){};
        })(timeout);
    } else {
        return new Promise(resolve => {
            setTimeout(resolve, timeout);
        });
    };
};
