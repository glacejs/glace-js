scope("It should use fixtures", [fxSelenium, fxWebdriver, fxBrowser], () => {

    test("Http proxy", null, [fxHttpProxy], () => {
        chunk(async () => await SS.openApp());
    });

    test("Global proxy", null, [fxGlobalProxy], () => {
        chunk(async () => {
            await SS.restartBrowser();
            await SS.openUrl("https://opennet.ru")
        });
    });
});
