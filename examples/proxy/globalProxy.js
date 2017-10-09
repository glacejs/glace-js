// npm test -- examples/proxy/globalProxy.js --web --global-proxy
test("Global proxy", () => {
    chunk(async () => {
        await SS.openUrl("https://yandex.ru");
    });
});
