// ./app openUrl.js --web
test("Open URL", () => {
    chunk("open yandex.ru", async () => {
        await SS.openUrl("https://yandex.ru");
    });
});
