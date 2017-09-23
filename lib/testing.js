"use strict";
/**
 * Contains classes and functions to save executed tests data.
 *
 * @module
 */

var _ = require("lodash");
/**
 * Test case data structure.
 *
 * Contains full information and history about test case.
 *
 * @class
 * @arg {string} name - Test case name.
 */
var TestCase = module.exports.TestCase = function (name) {
    this.name = name;
};
/**
 * Resets test case info.
 *
 * @method
 */
TestCase.prototype.reset = function () {
    this._screenshots = [];
    this._chunks = [];
    this._errors = [];
    this._failedParams = [];
    this.testParams = [];
};
/**
 * Adds failed params if they don't exist.
 *
 * @method
 * @arg {object} params - Params which test was failed with.
 */
TestCase.prototype.addFailedParams = function (params) {
    for (var failed of this._failedParams) {
        if (_.isEqual(params, failed)) break;
    };
    this._failedParams.add(params);
};
/**
 * Gets executed test chunks.
 *
 * It makes clone of current array of chunks in order to get its replica.
 *
 * @method
 * @return {TestChunk[]} - List of executed chunks.
 */
TestCase.prototype.getChunks = function () {
    return _.clone(this._chunks);
};
/**
 * Gets test chunk with filter.
 *
 * @arg {object} [opts] - Filter options.
 * @arg {string} [opts.name] - Chunk name.
 * @return {TestChunk} - Chunk which matches requested options.
 */
TestCase.prototype.getChunk = function (opts) {
    opts = opts || {};
    var chunks = this.getChunks();
    if (opts.name) {
        var filteredChunks = [];
        for (var chunk of chunks) {
            if (chunk.name === opts.name) {
                filteredChunks.push(chunk);
                break;
            };
        };
        chunks = filteredChunks;
    };
    return chunks[0];
};
/**
 * Adds executed chunk to test case.
 *
 * @method
 * @arg {string} name - Chunk name.
 * @arg {boolean} isFailed - Flag whether chunk is failed or no.
 */
TestCase.prototype.addChunk = function (name, isFailed) {
    this._chunks.push(new TestChunk(name, isFailed));
};
/**
 * Adds error in chunk to test case.
 *
 * @method
 * @arg {Error} err - Error.
 */
TestCase.prototype.addError = function (err) {
    this._errors.push(err.message + "\n" + err.stack);
};
/**
 * Adds screenshot.
 *
 * @method
 * @arg {string} imagePath - Path to saved screenshot.
 */
TestCase.prototype.addScreenshot = function (imagePath) {
    this._screenshots.push(imagePath);
};
/**
 * Defines whether test case is failed on some stage. By default from start.
 *
 * @method
 * @arg {TestChunk[]} [chunksBefore=[]] - Chunks which should be skipped.
 * @return {boolean} - `true` if test case is failed, `false` otherwise.
 */
TestCase.prototype.isFailed = function (chunksBefore) {
    chunksBefore = chunksBefore || [];
    for (var chunk of this._chunks) {
        if (chunksBefore.includes(chunk)) continue;
        if (chunk.isFailed) return true;
    };
    return false;
};
/**
 * Test chunk data structure.
 *
 * @class
 * @arg {string} name - Chunk name.
 * @arg {boolean} isFailed - Flag whether chunk is failed or no.
 */
var TestChunk = module.exports.TestChunk = function (name, isFailed) {
    this.name = name;
    this.isFailed = !!isFailed;
};
