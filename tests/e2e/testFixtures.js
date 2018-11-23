scope("It should use fixtures", [fxSeleniumServer, fxBrowser], () => {

    test("Http proxy", [fxHttpProxy], () => {
        chunk(async () => await $.openApp());
    });

    test("Global proxy", [fxGlobalProxy], () => {
        chunk(async () => {
            await $.restartBrowser();
            await $.openUrl("https://opennet.ru");
        });
    });
});
