"use strict";
/**
 * Steps for screenshots and images.
 *
 * @module
 */

var U = require("../utils");
/**
 * Steps to manage web ui screenshots and images.
 *
 * @mixin
 */
module.exports = {
    /**
     * Step to make web ui screenshot.
     *
     * @method
     * @instance
     * @async
     * @arg {string} screenName - Name of screenshot.
     * @arg {object} [opts] - Step options. 
     */
    makeScreenshot: async function (screenName, opts) {

        opts = U.defVal(opts, {});
        opts.subdirs = U.defVal(opts.subdirs, []);
        opts.control = U.defVal(opts.control);
        opts.verify = U.defVal(opts.verify, true) && CONF.isScreenshotVerification;
        opts.verifyInclusion = U.defVal(opts.verifyInclusion, false) &&
            CONF.isScreenshotVerification;
        opts.check = U.defVal(opts.check, true);
        opts.preHook = U.defVal(opts.preHook);
        opts.postHook = U.defVal(opts.postHook);
        opts.domSelector = U.defVal(opts.domSelector);

        fullLog("makeScreenshot start arguments", screenName, opts);

        var screenPath = this._getPath(screenName, { subdirs: opts.subdirs });

        if (opts.preHook)
            await opts.preHook.call(this);

        if (opts.domSelector)
            await this._domScreenshot(screenPath, opts.domSelector)
        else
            await this._seleniumScreenshot(screenPath);

        if (opts.check) {
            var errMsg = "Browser screenshot isn't saved to " + screenPath;
            fs.existsSync(screenPath).should.withMessage(errMsg).be.true;
        };

        CONF.testCase.screenshots.push(screenPath);
        logStep("Save browser screenshot to", screenPath);

        if (opts.control)
            await this._cropImage(screenPath, opts.control, { sameName: true });

        if (opts.verifyInclusion)
            await this.checkScreenshotContainsImage(screenPath, opts);
        else if (opts.verify)
            await this.checkScreenshot(screenPath, opts);

        fullLog("makeScreenshot end result", screenPath);

        if (opts.postHook)
            await opts.postHook.call(this);

        return screenPath;
    },
    /**
     * Helper to make browser screenshot with selenium.
     *
     * @method
     * @protected
     * @arg {string} screenPath - path to screenshot which will be saved
     */
    _seleniumScreenshot: async function (screenPath) {
        await this._driver.saveScreenshot(screenPath);
    },
    /**
     * Helper to make DOM screenshot with html2canvas.
     *
     * @method
     * @protected
     * @arg {string} screenPath - path to screenshot which will be saved
     * @arg {string} selector - CSS selector of DOM element, which content
     *  will be saved to screenshot.
     * @arg {number} [timeout=20000] - timeout to wait screenshot capturing, ms
     * @throws {Error} - if screenshot will not be captured during timeout
     */
    _domScreenshot: async function (screenPath, selector, timeout) {
        timeout = U.defVal(timeout, 20000);
        var errMsg = "Can't screencapture element with selector " + selector;

        await this._driver.execute(function (selector) {

            var script = document.createElement('script');
            script.onload = function() {
                html2canvas(
                    document.querySelector(selector),
                    {
                        onrendered: function(canvas) {
                            window.domElementScreen = canvas
                                .toDataURL()
                                .split("data:image/png;base64,")[1];
                        },
                        useCORS: true
                });
            };
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/" +
                "0.5.0-beta4/html2canvas.min.js";
            document.body.appendChild(script);
        }, selector);

        var screenBase64 = await this._driver.waitUntil(async () => {

            return (await this._driver.execute(function () {
                if (window.domElementScreen) {
                    var result = window.domElementScreen;
                    delete window.domElementScreen;
                    return result;
                } else {
                    return false;
                }
            })).value;

        }, timeout, errMsg);

        fs.writeFileSync(screenPath, screenBase64, 'base64');
    },
    /**
     * Step to check screenshot matches standard image.
     *
     * If it's used to compare  images, it tries to find standard image for
     * current language. If standard image for current language is absent, it tries
     * to find standard image for `en` language, because  signs for each
     * language should look like for english.
     *
     * @method
     * @arg {string} screenPath - path to saved screenshot
     * @arg {object} [opts] - comparison options
     * @arg {boolean} [opts.Check=false] - flag whether it's 
     *  images comparison or no
     * @arg {number} [opts.tolerance=0.05] - images comparison precision
     * @arg {number} [opts.elementTolerance=0.05] - cropped elements comparison
     *  precision
     * @arg {string[]} [opts.checkedElements=[]] - array of checked element names
     * @arg {?string} [opts.standardImage=null] - path to standard image which
     *  will be compared with current.
     * @arg {boolean} [opts.shouldEqual=true] - flag to check images equivalence
     *  or their difference
     * @throws {Error} - if screenshot doesn't standard image with specified
     *  precision
     */
    checkScreenshot: async function (screenPath, opts) {

        opts = U.defVal(opts, {});
        opts.Check = U.defVal(opts.Check, false);
        opts.tolerance = U.defVal(opts.tolerance, 0.05);
        opts.elementTolerance = U.defVal(opts.elementTolerance, 0.05);
        opts.checkedElements = U.defVal(opts.checkedElements, []);
        opts.standardImage = U.defVal(opts.standardImage);
        opts.shouldEqual = U.defVal(opts.shouldEqual, true);

        var expectedImagePath = opts.standardImage || this._getPath(
            path.basename(screenPath),
            { mode: "resources",
              lang: opts.Check ? "en" : CONF.testCase.language });

        fs.existsSync(expectedImagePath).should.withMessage(
            "Standard image " + expectedImagePath + " is absent").be.true;

        await this._verificateScreenshots(
            screenPath, expectedImagePath,
            { tolerance: opts.tolerance, shouldEqual: opts.shouldEqual });

        if (opts.checkedElements) {
            var outputDirPath = path.resolve(path.dirname(screenPath), 'cropped');
            var stdOutputDirPath = path.resolve(
                path.dirname(screenPath), 'stdCropped');

            mkdirp.sync(outputDirPath);
            mkdirp.sync(stdOutputDirPath);

            for (var element of opts.checkedElements) {
                var actualCroppedImage = await this._cropImage(
                    screenPath, element,
                    { dstDir: outputDirPath });
                var expectedCroppedImage = await this._cropImage(
                    expectedImagePath, element,
                    { dstDir: stdOutputDirPath });

                await this._verificateScreenshots(
                    actualCroppedImage, expectedCroppedImage,
                    { tolerance: opts.elementTolerance,
                      shouldEqual: opts.shouldEqual });
            }
        }
    },
    /**
     * Helper to compare screenshot with standard image.
     *
     * @method
     * @protected
     * @arg {string} actualScreenshotPath - path to taken screen shot
     * @arg {string} expectedScreenshotPath - path to expected image
     * @arg {object} [opts] - verification options
     * @arg {number} [opts.tolerance=0.05] - Percentage of comparision
     *  tolerance. E.g. 5% tolerance is 0.05.
     * @arg {boolean} [opts.shouldEqual=true] - flag to check images equivalence
     *  or their difference
     * @throws {Error} If screenshots comparison is failed.
     */
    _verificateScreenshots: async function (
            actualScreenshotPath, expectedScreenshotPath, opts) {

        opts = U.defVal(opts, {});
        opts.tolerance = U.defVal(opts.tolerance, 0.05);
        opts.shouldEqual = U.defVal(opts.shouldEqual, true);

        var imageName = path.basename(actualScreenshotPath);
        var diffImagePath = this._getPath(imageName, { subdirs: ['diffs'] });

        var result = await new Promise((resolve, reject) => {
            imageDiff.getFullResult({
                actualImage: actualScreenshotPath,
                expectedImage: expectedScreenshotPath,
                diffImage: diffImagePath
            }, function(err, result) {
                if (err)
                    reject(err);
                resolve(result);
            });
        });

        if (result.percentage > 0.05) {
            logger.debug("WARNING! Difference percentage: " + result.percentage +
                         " for diffImage: " + diffImagePath +
                         " test step: " +_.last(CONF.testCase.steps).name);
        } else {
            logger.debug("Difference percentage: " + result.percentage +
                         " for diffImage: " + diffImagePath);
        }

        if (opts.shouldEqual) {
            expect(result.percentage).to.be.below(
                opts.tolerance, "Images difference above " + opts.tolerance);
        } else {
            expect(result.percentage).to.be.above(
                opts.tolerance, "Images difference below " + opts.tolerance);
        };
    },

    /**
     * Helper to crop control area on screenshot.
     *
     * @method
     * @protected
     * @arg {string} srcPath - path to image for cropping
     * @arg {object} ctrlName - name of control which will be cropped
     * @arg {object} [opts] - cropping options
     * @arg {boolean} [opts.sameName=false] - flag to use the same name for
     *  cropped image or no. If `false` control name will be added to image name.
     * @return {string} - path to cropped image
     */
    _cropImage: async function (srcPath, ctrlName, opts) {

        var control = this._dom[ctrlName];
        expect(control)
            .withMessage("Undefined control " + ctrlName)
            .to.not.be.undefined;

        fs.existsSync(srcPath)
            .should
            .withMessage("Image " + srcPath + " doesn't exist")
            .be.true;

        opts = U.defVal(opts, {});
        opts.sameName = U.defVal(opts.sameName, false);
        opts.dstDir = U.defVal(opts.dstDir, path.dirname(srcPath));

        if (opts.sameName) {
            var dstName = path.basename(srcPath);
            var tempPath = path.resolve(opts.dstDir, "tmp-" + dstName);
        }
        else
            var dstName = ctrlName + "-" + path.basename(srcPath);
        var dstPath = path.resolve(opts.dstDir, dstName);


        var ctrlLoc = await control.location();

        var srcInfo = await new Promise((resolve, reject) => {
            sharp(srcPath)
                .toBuffer((err, outputBuffer, info) => {
                    if (err) reject(err);
                    resolve(info);
                });
        });

        if (ctrlLoc.y < 0)
            ctrlLoc.y = 0;

        if (ctrlLoc.x < 0)
            ctrlLoc.x = 0;

        if ((ctrlLoc.y + ctrlLoc.height) > srcInfo.height)
            ctrlLoc.height = srcInfo.height - ctrlLoc.y;

        if ((ctrlLoc.x + ctrlLoc.width) > srcInfo.width)
            ctrlLoc.width = srcInfo.width - ctrlLoc.x;

        await new Promise((resolve, reject) => {
                sharp(srcPath)
                    .extract({ left: ctrlLoc.x,
                               top: ctrlLoc.y,
                               width: ctrlLoc.width,
                               height: ctrlLoc.height })
                    .crop(sharp.strategy.entropy)
                    .toFile(opts.sameName ? tempPath : dstPath, function(err) {
                        if (err) reject(err);
                        resolve();
                    });
        });

        if( opts.sameName)
            fs.renameSync(tempPath, dstPath);

        fs.existsSync(dstPath).should.withMessage(
            "Cropped image " + dstPath + " is absent").be.true;

        return dstPath;
    },
};
