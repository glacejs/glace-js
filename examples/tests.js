"use strict";

var shouldFail = true;

scope ("My tests", () => {
    test("failed before", () => {
        chunk("my step", async () => {
            await SS.openUrl("https://yandex.ru");
            await SS.pause(5000, "capture video");
        });
    });  
});
