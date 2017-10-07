// npm test -- examples/image/imagesEqual.js --web
test("Compare equal screenshots", () => {
    chunk(async () => {
        await SS.openUrl("https://yandex.ru");
        var image1 = await SS.makeScreenshot();
        var image2 = await SS.makeScreenshot();
        await SS.checkImagesEquivalence(image1, image2);
    });
});
