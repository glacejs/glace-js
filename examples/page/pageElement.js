// npm test -- examples/page/pageElement.js --web --app https://yandex.ru

var Steps = require("../../lib").Steps;
var Page = require("../../lib").Page;

var indexPage = new Page(
    "index", "/",
    { searchField: "input#text",
      searchButton: "button.button_theme_websearch[type='submit']"});

Steps.register({
    search: async function (text) {
        this.registerPages(indexPage);
        await this.openPage(indexPage.name);
        await indexPage.searchField.setText("nodejs");
        await indexPage.searchButton.click();
        await this.pause(3000, "wait for result");
    },
});

test("Page usage example", () => {
    chunk(async () => {
        await SS.search("nodejs");
    });
});
