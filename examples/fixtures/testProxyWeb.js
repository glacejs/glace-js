// npm test -- examples/fixtures/testProxyWeb.js --app https://yandex.ru 
scope("Web tests", [fixSelenium, fixWebdriver, fixBrowser], () => {

    test("Http proxy", null, [fixHttpProxy], () => {
        chunk(async () => await SS.openApp());
    });

    test("Global proxy", null, [fixGlobalProxy], () => {
        chunk(async () => {
            await SS.restartBrowser();
            await SS.openUrl("https://opennet.ru")
        });
    });
});
