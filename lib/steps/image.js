"use strict";
/**
 * Steps for screenshots and images.
 *
 * @module
 */

var fs = require("fs");

var _ = require("lodash");
var imageDiff = require("image-diff");
var uuid = require("uuid/v4");

var image = require("../image");
var U = require("../utils");
/**
 * Steps to manage web screenshots and images.
 *
 * @mixin
 */
module.exports = {
    /**
     * Step to make web screenshot in browser.
     *
     * @method
     * @instance
     * @async
     * @this Steps
     * @arg {object} [opts] - Step options.
     * @arg {string} [opts.imageName] - Screenshot name. File extension
     *  `.png` will be added automatically. Default value is dynamically
     *  generated on each call with algorithm `uuid`.
     * @arg {boolean} [opts.bySelenium=true] - Flag to use selenium to make
     *  screenshot. Other library `html2canvas` will be used.
     * @arg {?string} [opts.cssSelector=null] - CSS selector of DOM element
     *  which of screenshot should be made.
     * @arg {?function} [opts.preHook=null] - Function which will be called
     *  in `Steps` context in the beginning of step.
     * @arg {?function} [opts.postHook=null] - Function which will be called
     *  in `Steps` context at the end of step.
     * @arg {?string} [opts.element=null] - Web element which should be
     *  screenshotted.
     * @arg {boolean} [opts.check=true] - Flag to check screenshot is saved
     *  or no.
     * @throws {AssertionError} - If screenshot isn't saved.
     * @return {string} - Path to saved screenshot.
     */
    makeScreenshot: async function (opts) {

        opts = U.defVal(opts, {});
        var imageName = U.defVal(opts.imageName, uuid()) + ".png";
        var bySelenium = U.defVal(opts.bySelenium, true);
        var cssSelector = U.defVal(opts.cssSelector);
        var preHook = U.defVal(opts.preHook);
        var postHook = U.defVal(opts.postHook);
        var element = U.defVal(opts.element);
        var check = U.defVal(opts.check, true);

        var imagePath = U.mkpath(CONF.reportsDir,
                                 _.kebabCase(CONF.curTestCase.name),
                                 "screenshots",
                                 imageName);

        if (preHook) await preHook.call(this);

        if (bySelenium) {
            await this._seleniumScreenshot(imagePath);
        } else {
            await this._canvasScreenshot(
                imagePath, { cssSelector: cssSelector });
        };

        if (element) {
            await this._cutElement(imagePath, element, { path: imagePath });
        };

        if (check) {
            expect(fs.existsSync(imagePath),
                   `Screenshot isn't saved to ${imagePath}`).be.true;
        };

        if (postHook) await postHook.call(this);

        CONF.curTestCase.addScreenshot(imagePath);
        return imagePath;
    },
    /**
     * Step to check two image are equal or not equal
     *
     * @method
     * @protected
     * @instance
     * @async
     * @this Steps
     * @arg {string} actualImage - Path to actual image.
     * @arg {string} expectedImage - Path to expected image.
     * @arg {object} [opts] - Helper options.
     * @arg {number} [opts.threshold=0.05] - Threshold of divergence.
     * @arg {boolean} [opts.shouldBe=true] - Flag to check whether
     *  image are equal or not equal.
     * @arg {string[]} [opts.elements=[]] - List of elements on image which
     *  should be verified.
     * @throws {AssertionError} - If result of images comparison don't pass
     *  requested parameters.
     */
    checkImagesEquivalence: async function (actualImage, expectedImage, opts) {
        opts = U.defVal(opts, {});
        var elements = U.defVal(opts.elements, []);

        await this._checkImagesEquivalence(actualImage, expectedImage, opts);
        for (var element of elements) {
            var actualElImage = await this._cutElement(
                actualImage, element, { name: `actual ${element}` });
            var expectedElImage = await this._cutElement(
                expectedImage, element, { name: `expected ${element}` });
            await this._checkImagesEquivalence(
                actualElImage, expectedElImage, opts);
        };
    },
    /**
     * Step to check one image includes or doesn't include another image.
     *
     * @method
     * @protected
     * @instance
     * @async
     * @this Steps
     * @arg {string} actualImage - Path to actual image.
     * @arg {string} expectedImage - Path to image which may include
     *  actual image.
     * @arg {object} [opts] - Step options.
     * @arg {number} [opts.threshold=0.05] - Threshold of divergence.
     * @arg {boolean} [opts.shouldBe=true] - Flag to check whether
     *  image are equal or not equal.
     */
    checkImagesInclusion: async function (actualImage, originalImage, opts) {

        opts = U.defVal(opts, {});
        var threshold = U.defVal(opts.threshold, 0.05);
        var shouldBe = U.defVal(opts.shouldBe, true);

        var matchedImagePath = U.mkpath(CONF.reportsDir,
                                        _.kebabCase(CONF.curTestCase.name),
                                        "screenshots",
                                        "inclusions",
                                        uuid() + ".png");

        var errMsg = "Screenshot " + screenPath +
                     " doesn't contain image " + imagePath;

        var result = await image(screenPath)
            .includes(imagePath, { tolerance: threshold,
                                   matchedPath: matchedImagePath });

        if (shouldBe) {
            expect(result.isIncluded,
                   `Image ${originalImage} doesn't include ${actualImage}`)
                .be.true;
        } else {
            expect(result.isIncluded,
                   `Image ${originalImage} includes image ${actualImage}`)
                .be.false;
        };
    },
    /**
     * Step to check or make web screenshot in browser.
     *
     * @method
     * @instance
     * @async
     * @this Steps
     * @arg {object} [opts] - Step options.
     * @arg {string} [opts.imageName] - Screenshot name. File extension
     *  `.png` will be added automatically. Default value is dynamically
     *  generated on each call with algorithm `uuid`.
     * @arg {boolean} [opts.bySelenium=true] - Flag to use selenium to make
     *  screenshot. Other library `html2canvas` will be used.
     * @arg {?function} [opts.preHook=null] - Function which will be called
     *  in `Steps` context in the beginning of step.
     * @arg {?function} [opts.postHook=null] - Function which will be called
     *  in `Steps` context at the end of step.
     * @arg {string[]} [opts.elements=[]] - List of elements on image which
     *  should be verified.
     * @arg {boolean} [opts.check=true] - Flag to check screenshot is saved
     *  or no.
     * @throws {AssertionError} - If screenshot isn't saved.
     */
    checkOrMakeScreenshot: async function (imageName, opts) {

        opts = U.defVal(opts, {});
        opts.imageName = imageName;
        var actualImage = await this.makeScreenshot(opts);
        if (CONF.compareImages) {
            var expectedImage = path.resolve(CONF.resourcesDir,
                                             _.kebabCase(CONF.curTestCase.name),
                                             "screenshots",
                                             imageName + ".png");
            await this.checkImagesEquivalence(
                actualImage, expectedImage, opts);
        };
    },
    /**
     * Helper to check two images are equal or not equal.
     *
     * @method
     * @protected
     * @instance
     * @async
     * @this Steps
     * @arg {string} actualImage - Path to actual image.
     * @arg {string} expectedImage - Path to expected image.
     * @arg {object} [opts] - Helper options.
     * @arg {number} [opts.threshold=0.05] - Threshold of divergence.
     * @arg {boolean} [opts.shouldBe=true] - Flag to check whether
     *  image are equal or not equal.
     * @throws {AssertionError} - If result of images comparison don't pass
     *  requested parameters.
     */
    _checkImagesEquivalence: async function (actualImage, expectedImage, opts) {

        opts = U.defVal(opts, {});
        var threshold = U.defVal(opts.threshold, 0.05);
        var shouldBe = U.defVal(opts.shouldBe, true);
        var diffImage = U.mkpath(CONF.reportsDir,
                                 _.kebabCase(CONF.curTestCase.name),
                                 "screenshots",
                                 "diffs",
                                 uuid() + ".png");

        var percentage = (await new Promise((resolve, reject) => {

            imageDiff.getFullResult({
                actualImage: actualImage,
                expectedImage: expectedImage,
                diffImage: diffImage
            }, function(err, result) {
                if (err) reject(err);
                resolve(result);
            });

        })).percentage;

        if (shouldBe) {
            expect(result.percentage,
                   "Images are not equal").be.lte(threshold);
        } else {
            expect(result.percentage,
                   "Images are equal").be.gte(threshold);
        };
    },
    /**
     * Helper to make screenshot with selenium.
     *
     * @method
     * @protected
     * @instance
     * @async
     * @this Steps
     * @arg {string} imagePath - Path to screenshot which will be saved,
     */
    _seleniumScreenshot: async function (imagePath) {
        await this._webdriver.saveScreenshot(imagePath);
    },
    /**
     * Helper to make screenshot with html2canvas.
     *
     * @method
     * @protected
     * @instance
     * @async
     * @this Step
     * @arg {string} imagePath - Path to screenshot which will be saved.
     * @arg {object} [opts] - Helper options.
     * @arg {?string} [opts.cssSelector=null] - CSS selector of DOM element
     *  which of screenshot should be made.
     * @arg {number} [opts.timeout=30000] - Time to wait for screenshot is
     *  rendered, ms
     * @throws {Error} - If screenshot will not be rendered during timeout.
     */
    _canvasScreenshot: async function (imagePath, opts) {

        opts = U.defVal(opts, {});
        var cssSelector = U.defVal(opts.cssSelector);
        var timeout = U.defVal(opts.timeout, 30000);

        var errMsg = "Can't make screenshot";
        if (cssSelector) errMsg += " of element with selector " + cssSelector;

        await this._webdriver.execute(function (cssSelector) {

            function makeScreenshot () {
                if (cssSelector) {
                    var element = document.querySelector(cssSelector);
                } else {
                    var element = document.body;
                };
                html2canvas(
                    element,
                    {
                        onrendered: function(canvas) {
                            window.__screenshot = canvas
                                .toDataURL()
                                .split("data:image/png;base64,")[1];
                        },
                        useCORS: true  // capture images from another domains
                    });
            };

            if (typeof(html2canvas) !== "undefined") {
                makeScreenshot();
                return;
            };

            var script = document.createElement("script");
            script.onload = makeScreenshot;
            script.src = "https://cdnjs.cloudflare.com" +
                         "/ajax/libs/html2canvas/" +
                         "0.5.0-beta4/html2canvas.min.js";
            document.body.appendChild(script);

        }, cssSelector);

        var screenBase64 = await this._webdriver.waitUntil(async () => {

            return (await this._webdriver.execute(function () {

                if (window.__screenshot) {
                    var result = window.__screenshot;
                    delete window.__screenshot;
                    return result;
                } else {
                    return false;
                };

            })).value;

        }, timeout, errMsg);

        fs.writeFileSync(imagePath, screenBase64, "base64");
    },
    /**
     * Helper to cut element from image.
     *
     * @method
     * @protected
     * @instance
     * @async
     * @this Steps
     * @arg {string} imagePath - Path to image which element will be cut from.
     * @arg {string} elementName - Name of element which will be cut.
     * @arg {object} [opts] - Helper options.
     * @arg {string} [opts.name] - Name of cut image with element.
     * @arg {string} [opts.path] - Path to cut image with element.
     * @throws {AssertionError} - If original image doesn't exist.
     * @throws {AssertionError} - If DOM element is not registered in config.
     * @throws {AssertionError} - If cut image is not saved.
     */
    _cutElement: async function (imagePath, elementName, opts) {

        expect(fs.existsSync(imagePath),
               `Image ${imagePath} doesn't exist`).be.true;

        var element = (await this.getCurrentPage())[elementName];
        expect(element,
               `Undefined DOM element ${elementName}`).not.be.undefined;

        opts = U.defVal(opts, {});
        var targetName = U.defVal(opts.name, uuid()) + ".png";
        var targetPath = U.defVal(opts.path,
                                  U.mkpath(CONF.reportsDir,
                                           _.kebabCase(CONF.curTestCase.name),
                                           "screenshots",
                                           "cutElements",
                                           targetName));

        var imageInfo = await new Promise((resolve, reject) => {
            sharp(imagePath).toBuffer((err, outputBuffer, info) => {
                if (err) reject(err);
                resolve(info);
            });
        });

        var eLoc = await element.location();

        if (eLoc.x < 0) eLoc.x = 0;
        if (eLoc.y < 0) eLoc.y = 0;

        if ((eLoc.x + eLoc.width) > imageInfo.width) {
            eLoc.width = imageInfo.width - eLoc.x;
        };
        if ((eLoc.y + eLoc.height) > imageInfo.height) {
            eLoc.height = imageInfo.height - eLoc.y;
        };

        if (imagePath === targetPath) {
            fs.renameSync(imagePath, imagePath + ".tmp");
            imagePath += ".tmp";
        };

        await new Promise((resolve, reject) => {
            sharp(imagePath)
                .extract({ left: eLoc.x,
                           top: eLoc.y,
                           width: eLoc.width,
                           height: eLoc.height })
                .crop(sharp.strategy.entropy)
                .toFile(targetPath, err => {
                    if (err) reject(err);
                    resolve();
                });
        });

        expect(fs.existsSync(targetPath,
                             `Image ${targetPath} isn't saved`)).be.true;
        if (imagePath.endswith(".tmp")) fs.unlinkSync(imagePath);

        return targetPath;
    },
};
