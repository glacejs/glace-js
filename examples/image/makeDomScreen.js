// npm test -- examples/image/makeDomScreen.js --web
test("Make DOM screenshot", () => {
    chunk(async () => {
        await SS.openUrl("https://html2canvas.hertzen.com/documentation.html");
        var imagePath = await SS.makeScreenshot(
            { bySelenium: false, cssSelector: "body > div.container" });
        console.log(imagePath);
    });
});
