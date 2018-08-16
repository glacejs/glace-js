"use strict";

test("Web", () => {

    chunk("It should open yandex", async () => {
        await $.openUrl("https://yandex.ru");
    });

    chunk("It should restart browser", async () => {
        await $.restartBrowser();
    });
});
