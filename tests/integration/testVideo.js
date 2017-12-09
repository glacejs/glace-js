"use strict";

test("It should capture video", () => {
    chunk(async() => {
        await SS.openUrl("https://yandex.ru");
        console.log("video will be saved to", SS.getVideo({ check: false }));
    });
});
