"use strict";

var Steps = require("../../lib").Steps;
var Page = require("../../lib").Page;

var indexPage = new Page(
    "index", "/",
    { searchField: "input#text",
      searchButton: "button.button_theme_websearch[type='submit']"});

test("Images processing", () => {

    before(() => {
        SS.registerPages(indexPage);
    });

    chunk("Image should include image", async () => {
        await SS.openPage(indexPage.name);
        var searchImage = await SS.makeScreenshot({ element: "searchButton" });
        var fullImage = await SS.makeScreenshot();
        await SS.checkImageInclusion(fullImage, searchImage);
    });

    chunk("Image shouldn't include image", async () => {
        await SS.openPage(indexPage.name);
        var searchImage = await SS.makeScreenshot({ element: "searchButton" });
        await SS.openUrl("https://opennet.ru");
        var fullImage = await SS.makeScreenshot();
        await SS.checkImageInclusion(
            fullImage, searchImage, { shouldBe: false });
    });

    chunk("Images should be equal", async () => {
        await SS.openUrl("https://yandex.ru");
        var image1 = await SS.makeScreenshot();
        var image2 = await SS.makeScreenshot();
        await SS.checkImagesEquivalence(image1, image2);
    });

    chunk("Image shouldn't be equal", async () => {
        await SS.openUrl("https://yandex.ru");
        var image1 = await SS.makeScreenshot();
        await SS.openUrl("https://opennet.ru");
        var image2 = await SS.makeScreenshot();
        await SS.checkImagesEquivalence(image1, image2, { shouldBe: false });
    });

    chunk("Image should be captured with html2canvas", async () => {
        await SS.openUrl("http://html2canvas.hertzen.com/");
        var imagePath = await SS.makeScreenshot({ by: "html2canvas" });
        console.log(imagePath);
    });

    chunk("Image should be captured with selenium", async () => {
        await SS.openUrl("https://yandex.ru");
        var imagePath = await SS.makeScreenshot();
        console.log(imagePath);
    });
});
