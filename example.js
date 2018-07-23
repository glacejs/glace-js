"use strict";

const openUrl = $.openUrl;
$.openUrl = async function () {
    await openUrl.apply(this, arguments);
};

test("my web test", () => {

    chunk(async () => {
        await $.openUrl("https://yandex.ru");
    });
});
