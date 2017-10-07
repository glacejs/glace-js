// npm test -- examples/image/imagesNotEqual.js --web
test("Compare not equal screenshots", () => {
    chunk(async () => {
        await SS.openUrl("https://yandex.ru");
        var image1 = await SS.makeScreenshot();
        await SS.openUrl("https://opennet.ru");
        var image2 = await SS.makeScreenshot();
        await SS.checkImagesEquivalence(image1, image2, { shouldBe: false });
    });
});
