"use strict";
/**
 * Contains classes and functions to process images.
 *
 * @module
 */

var sharp = require("sharp");
var temp = require("temp");
var U = require("glacejs-utils");

sharp.cache(false);
/**
 * Creates new instance of Image.
 *
 * @class
 * @arg {string} srcPath - path to processed image
 * @arg {object} [srcOpts] - image options
 * @arg {number} [srcOpts.scaleX] - image current scale value on `X` axis
 * @arg {number} [srcOpts.scaleY] - image current scale value on `Y` axis
 */
var Image = module.exports = function (srcPath, srcOpts) {

    if (!(this instanceof Image))
        return new Image(srcPath, srcOpts);

    srcOpts = U.defVal(srcOpts, {});
    srcOpts.scaleX = U.defVal(srcOpts.scaleX, 1);
    srcOpts.scaleY = U.defVal(srcOpts.scaleY, 1);

    this._srcPath = srcPath;
    this._srcOpts = srcOpts;
};
/**
 * Defines whether processed image is transparent.
 *
 * @async
 * @method
 * @return {Promise.<boolean>} - `true` if image is transparent, `false`
 *  otherwise.
 */
Image.prototype.isTransparent = function () {
    return this._loadImg(this._srcPath, this._srcOpts).then(image => {

        var pixels = this._getPixels(image);
        var height = pixels.length;
        var width = pixels[0].length;

        for (var y = 0; y < height; y++) {
            var row = pixels[y];
            for (var x = 0; x < width; x++) {
                if (row[x].A !== 0) return false;
            };
        };
        return true;
    });
};
/**
 * Defines whether processed image is monochrome.
 *
 * @async
 * @method
 * @return {Promise.<boolean>} - `true` if image is monochrome, `false`
 *  otherwise.
 */
Image.prototype.isMonochrome = function () {
    return this._loadImg(this._srcPath, this._srcOpts).then(image => {

        var pixels = this._getPixels(image);
        var height = pixels.length;
        var width = pixels[0].length;

        var firstPixel = pixels[0][0];

        for (var y = 0; y < height; y++) {
            var row = pixels[y];
            for (var x = 0; x < width; x++) {
                if (row[x].A !== firstPixel.A ||
                        row[x].R !== firstPixel.R ||
                        row[x].G !== firstPixel.G ||
                        row[x].B !== firstPixel.B) {
                    return false;
                };
            };
        };
        return true;
    });
};
/**
 * Defines whether processed image is black.
 *
 * @async
 * @method
 * @return {Promise.<boolean>} - `true` if image is black, `false` otherwise.
 */
Image.prototype.isBlack = function () {
    return this._loadImg(this._srcPath, this._srcOpts).then(image => {

        var pixels = this._getPixels(image);
        var height = pixels.length;
        var width = pixels[0].length;

        for (var y = 0; y < height; y++) {
            var row = pixels[y];
            for (var x = 0; x < width; x++) {
                if (row[x].A !== 255 ||
                        row[x].R !== 0 ||
                        row[x].G !== 0 ||
                        row[x].B !== 0) {
                    return false;
                };
            };
        };
        return true;
    });
};
/**
 * Defines whether processed image is white.
 *
 * @async
 * @method
 * @return {Promise.<boolean>} - `true` if image is white, `false` otherwise.
 */
Image.prototype.isWhite = function () {
    return this._loadImg(this._srcPath, this._srcOpts).then(image => {

        var pixels = this._getPixels(image);
        var height = pixels.length;
        var width = pixels[0].length;

        for (var y = 0; y < height; y++) {
            var row = pixels[y];
            for (var x = 0; x < width; x++) {
                if (row[x].A !== 255 ||
                        row[x].R !== 255 ||
                        row[x].G !== 255 ||
                        row[x].B !== 255) {
                    return false;
                };
            };
        };
        return true;
    });
};
/**
 * Defines if processed image includes specified image.
 *
 * @method
 * @arg {string} dstPath - path to potentially included image
 * @arg {object} [dstOpts] - included image options
 * @arg {number} [dstOpts.tolerance=0.05] - comparison tolerance
 * @arg {?string} [dstOpts.matchedPath=null] - path to same captured place
 * @arg {boolean} [dstOpts.saveMatch=false] - flag to capture images
 *  intersection or no
 * @return {Promise.<object>} - result
 */
Image.prototype.includes = function (dstPath, dstOpts) {

    dstOpts = U.defVal(dstOpts, {});
    dstOpts.scaleX = U.defVal(dstOpts.scaleX, 1);
    dstOpts.scaleY = U.defVal(dstOpts.scaleY, 1);

    this._dstPath = dstPath;
    this._dstOpts = dstOpts;

    this._tolerance = U.defVal(dstOpts.tolerance, .05);
    this._matchedPath = U.defVal(dstOpts.matchedPath);
    this._saveMatch = U.defVal(dstOpts.saveMatch, !!this._matchedPath);

    if (this._saveMatch && !this._matchedPath)
        this._matchedPath = temp.path({ suffix: '.png' });

    this._pixelDenominator = 255 * Math.sqrt(3);

    var srcImage;

    return this._loadImg(this._srcPath, this._srcOpts).then(image => {
        srcImage = image;
        return this._loadImg(this._dstPath, this._dstOpts);
    }).then(dstImage => {
        return this._includes(srcImage, dstImage);
    }).then(result => {
        if (!result.isIncluded) return { isIncluded: false };
        if (!this._saveMatch) return result;
        return this
            ._saveMatchImage(result.offsetX,
                             result.offsetY,
                             result.width,
                             result.height)
            .then(() => {
                result.matchedPath = this._matchedPath;
                return result;
            });
    });
};
/**
 * Loads image.
 *
 * @method
 * @protected
 * @arg {string} imgPath - path loaded image
 * @arg {object} imgOpts - image options
 * @return {Promise.<object>} - image data
 */
Image.prototype._loadImg = function(imgPath, imgOpts) {
    var width, height, hasAlpha, channels;
    var img = sharp(imgPath);
    return img.metadata().then(metadata => {
        hasAlpha = metadata.hasAlpha;
        channels = metadata.channels;
        width = Math.ceil(metadata.width / imgOpts.scaleX);
        height = Math.ceil(metadata.height / imgOpts.scaleY);
        return img.resize(width, height).raw().toBuffer();
    }).then(data => {
        return { width: width,
                 height: height,
                 data: data,
                 channels: channels,
                 hasAlpha: hasAlpha };
    });
};
/**
 * Saves matched part of image.
 *
 * @method
 * @protected
 * @arg {number} left - offset from left image border
 * @arg {number} top - offset from top image border
 * @arg {number} width - width of matched part
 * @arg {number} height - height of matched part
 * @return {Promise}
 */
Image.prototype._saveMatchImage = function (left, top, width, height) {
    return sharp(this._srcPath)
        .extract({ left: left, top: top, width: width, height: height })
        .toFile(this._matchedPath);
};
/**
 * Defines whether one image data includes another.
 *
 * @method
 * @protected
 * @arg {object} src - source image data
 * @arg {object} dst - destination image data, which is potentially included
 * @return {object} - result
 */
Image.prototype._includes = function (src, dst) {

    var srcPixels = this._cropPixels(this._getPixels(src)),
        dstPixels = this._cropPixels(this._getPixels(dst));
    var offsetX, offsetY, diffValue, x, y, pixels;

    var dstUsedPixels = [],
        dstWidth = dstPixels[0].length,
        dstHeight = dstPixels.length;

    var result = { isIncluded: false,
                   diffValue:  null,
                   offsetX:    null,
                   offsetY:    null,
                   width:      dstWidth,
                   height:     dstHeight };

    var deltaX = srcPixels[0].length - dstWidth,
        deltaY = srcPixels.length - dstHeight;

    for (y = 0; y < dstHeight; y++) {
        pixels = dstPixels[y];

        for (x = 0; x < dstWidth; x++) {
            if (this._isPixelUsed(pixels[x]))
                dstUsedPixels.push({ pixel: pixels[x], x: x, y: y });
        };
    };

    for (offsetY = 0; offsetY <= deltaY; offsetY++) {
        for (offsetX = 0; offsetX <= deltaX; offsetX++) {

            diffValue = this._getDiffValue(srcPixels, dstUsedPixels,
                                           offsetX, offsetY);
            if (diffValue === null) continue;

            if (result.diffValue === null || result.diffValue > diffValue) {
                result.isIncluded = true;
                result.diffValue = diffValue;
                result.offsetX = offsetX;
                result.offsetY = offsetY;
            };

            if (diffValue === 0 || !this._saveMatch) return result;
        };
    };
    return result;
};
/**
 * Calculates difference between source pixels and destination pixels.
 *
 * @method
 * @protected
 * @arg {object[][]} - source pixels matrix
 * @arg {object[][]} - destination pixels matrix
 * @arg {number} offsetX - source left border offset
 * @arg {number} offsetY - source top border offset
 * @return {number} - difference value
 */
Image.prototype._getDiffValue = function (srcPixels, dstPixels,
                                          offsetX, offsetY) {
    var diffPixels = 0,
        limit = this._tolerance * dstPixels.length,
        dstPixel,
        srcPixel,
        i;

    for (i = 0; i < dstPixels.length; i++) {
        dstPixel = dstPixels[i];
        srcPixel = srcPixels[offsetY + dstPixel.y][offsetX + dstPixel.x];

        if (this._isPixelTolerant(srcPixel, dstPixel.pixel))
            continue;

        diffPixels++;
        if (diffPixels > limit) return null;
    };
    return diffPixels / dstPixels.length;
};
/**
 * Defines whether pixel should be used for difference calculation or no,
 *  according its alpha value.
 *
 * @method
 * @protected
 * @arg {object} pixel - pixel
 * @return {boolean} - `true` if should be, `false` otherwise
 */
Image.prototype._isPixelUsed = function (pixel) {
    return (255 - pixel.A) / 255 < this._tolerance;
};
/**
 * Defines whether source pixel is tolerant to destination pixel.
 *
 * @method
 * @protected
 * @arg {object} srcPixel - source pixel
 * @arg {object} dstPixel - destination pixel
 * @return {boolean} - `true` if pixels are tolerant, `false` otherwise
 */
Image.prototype._isPixelTolerant = function(srcPixel, dstPixel) {
    var deltaR = srcPixel.R - dstPixel.R,
        deltaG = srcPixel.G - dstPixel.G,
        deltaB = srcPixel.B - dstPixel.B;

    return Math.sqrt(deltaR * deltaR +
                     deltaG * deltaG +
                     deltaB * deltaB) /
        this._pixelDenominator < this._tolerance;
};
/**
 * Retrieves pixels from image data.
 *
 * @method
 * @protected
 * @arg {object} img - image data
 * @return {object[][]} - pixels matrix
 */
Image.prototype._getPixels = function (img) {
    var pixels = [],
        height = img.height,
        width = img.width * img.channels,
        x, y, offset;

    for (y = 0; y < height; y++) {
        offset = width * y;
        pixels.push([]);

        for (var x = 0; x < width; x += img.channels) {
            pixels[y].push({
                R: img.data[offset + x],
                G: img.data[offset + x + 1],
                B: img.data[offset + x + 2],
                A: img.hasAlpha ? img.data[offset + x + 3] : 255,
            });
        };
    };
    return pixels;
};
/**
 * Crops pixels, removes empty rows and columns.
 *
 * @method
 * @protected
 * @arg {object[][]} pixels - pixels matrix
 * @return {object[][]} - cropped pixels matrix
 */
Image.prototype._cropPixels = function (pixels) {

    pixels = this._cropTop(pixels);
    pixels.reverse();
    pixels = this._cropTop(pixels);
    pixels.reverse();
    pixels = this._transpose(pixels);
    pixels = this._cropTop(pixels);
    pixels.reverse();
    pixels = this._cropTop(pixels);
    pixels.reverse();
    return this._transpose(pixels);
};
/**
 * Crops top part of pixels matrix.
 *
 * @method
 * @protected
 * @arg {object[][]} pixels - pixels matrix
 * @return {object[][]} - cropped pixels matrix
 */
Image.prototype._cropTop = function (pixels) {

    var croppedPixels = [],
        isTransparent = true,
        width = pixels[0].length,
        height = pixels.length,
        x, y, pixelsRow;

    for (y = 0; y < height; y++) {
        pixelsRow = pixels[y];

        if (isTransparent) {
            for (x = 0; x < width; x++) {
                if (pixelsRow[x].A !== 0) {
                    isTransparent = false;
                    break;
                };
            };
        };

        if (!isTransparent)
            croppedPixels.push(pixelsRow);
    };
    return croppedPixels;
};
/**
 * Transposes pixels matrix.
 *
 * @method
 * @arg {object[][]} pixels - pixels matrix
 * @return {object[][]} transposed pixels matrix
 */
Image.prototype._transpose = function (pixels) {

    var width = pixels[0].length,
        height = pixels.length,
        tPixels = [],
        x, y;

    if (width === 0 || height === 0)
        return [];

    for (y = 0; y < width; y++) {
        tPixels[y] = [];

        for (x = 0; x < height; x++) {
            tPixels[y][x] = pixels[x][y];
        };
    };
    return tPixels;
};
