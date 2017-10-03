"use strict";

var shouldFail = true;

var Page = require("../lib/page");

var myPage = new Page("index", "/");

scope ("My tests", () => {
    test("failed before", () => {
        chunk("my step", async () => {
            SS.registerPages(myPage);
            await SS.openPage("index");
            // await SS.openUrl("https://yandex.ru");
            // await SS.pause(5000, "capture video");
        });
    });  
});
