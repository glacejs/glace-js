// npm test -- examples/proxy/middlewareCacheSteps.js --web --global-proxy --proxy --app https://yandex.ru --stdout-log
test("Cache responses", () => {
    chunk(async () => {
        SS.enableCache();
        await SS.openApp();  // cache population
        await SS.openApp();  // cache usage
        SS.disableCache();
        console.log("cache disabled");
        await SS.openApp();
    });
});
