// npm test -- examples/image/makeSeleniumScreen.js --web
test("Make browser screenshot", () => {
    chunk(async () => {
        await SS.openUrl("https://yandex.ru");
        var imagePath = await SS.makeScreenshot();
        console.log(imagePath);
    });
});
