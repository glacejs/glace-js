scope("It should use fixtures", [fxSelenium, fxWebdriver, fxBrowser], () => {

    test("Http proxy", null, [fxHttpProxy], () => {
        chunk(async () => await $.openApp());
    });

    test("Global proxy", null, [fxGlobalProxy], () => {
        chunk(async () => {
            await $.restartBrowser();
            await $.openUrl("https://opennet.ru");
        });
    });
});
