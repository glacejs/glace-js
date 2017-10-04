// npm test -- examples/proxy/globalProxy.js --web --global-proxy
test("Open URL", () => {
    chunk(async () => {
        await SS.openUrl("https://yandex.ru");
    });
});
