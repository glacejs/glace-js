"use strict";

var Page = require("../../lib").Page;

var indexPage = new Page(
    "index", "/",
    { searchField: "input#text",
        searchButton: "button.button_theme_websearch[type='submit']"});

test("Images processing", () => {

    before(() => {
        $.registerPages(indexPage);
    });

    chunk("Image should include image", async () => {
        await $.openPage(indexPage.name);
        var searchImage = await $.makeScreenshot({ element: "searchButton" });
        var fullImage = await $.makeScreenshot();
        await $.checkImageInclusion(fullImage, searchImage);
    });

    chunk("Image shouldn't include image", async () => {
        await $.openPage(indexPage.name);
        var searchImage = await $.makeScreenshot({ element: "searchButton" });
        await $.openUrl("https://opennet.ru");
        var fullImage = await $.makeScreenshot();
        await $.checkImageInclusion(
            fullImage, searchImage, { shouldBe: false });
    });

    chunk("Images should be equal", async () => {
        await $.openUrl("https://yandex.ru");
        var image1 = await $.makeScreenshot();
        var image2 = await $.makeScreenshot();
        await $.checkImagesEquivalence(image1, image2);
    });

    chunk("Image shouldn't be equal", async () => {
        await $.openUrl("https://yandex.ru");
        var image1 = await $.makeScreenshot();
        await $.openUrl("https://opennet.ru");
        var image2 = await $.makeScreenshot();
        await $.checkImagesEquivalence(image1, image2, { shouldBe: false });
    });

    chunk("Image should be captured with html2canvas", async () => {
        await $.openUrl("http://html2canvas.hertzen.com/");
        var imagePath = await $.makeScreenshot({ by: "html2canvas" });
        console.log(imagePath);
    });

    chunk("Image should be captured with selenium", async () => {
        await $.openUrl("https://yandex.ru");
        var imagePath = await $.makeScreenshot();
        console.log(imagePath);
    });
});
