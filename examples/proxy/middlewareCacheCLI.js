// npm test -- examples/proxy/middlewareCacheCLI.js --web --global-proxy --proxy --app https://yandex.ru --cache --stdout-log
test("Cache responses", () => {
    chunk(async () => {
        await SS.openApp();  // cache population
        await SS.openApp();  // cache usage
    });
});
