// npm test -- examples/image/imageNotInclude.js --web --app https://yandex.ru

var Steps = require("../../lib").Steps;
var Page = require("../../lib").Page;

var indexPage = new Page(
    "index", "/",
    { searchField: "input#text",
      searchButton: "button.button_theme_websearch[type='submit']"});

test("Check image doesn't include image", () => {

    before(() => SS.registerPages(indexPage));

    chunk(async () => {
        await SS.openPage(indexPage.name);
        var searchImage = await SS.makeScreenshot({ element: "searchButton" });
        await SS.openUrl("https://opennet.ru");
        var fullImage = await SS.makeScreenshot();
        await SS.checkImageInclusion(
            fullImage, searchImage, { shouldBe: false });
    });
});
