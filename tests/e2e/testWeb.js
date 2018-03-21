"use strict";

test("Web", () => {

    chunk("It should open yandex", async () => {
        await SS.openUrl("https://yandex.ru");
    });

    chunk("It should restart browser", async () => {
        await SS.restartBrowser();
    });
});
