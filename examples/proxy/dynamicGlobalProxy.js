// npm test -- examples/proxy/dynamicGlobalProxy.js --web --global-proxy --app https://yandex.ru
test("Dynamic global proxy", () => {
    chunk(async () => {
        await SS.openApp();
        await SS.stopGlobalProxy();
        await SS.restartBrowser();
        await SS.openApp();
    });
    after(async () => {
        if (CONF.proxy.global) await SS.startGlobalProxy();
    });
});
