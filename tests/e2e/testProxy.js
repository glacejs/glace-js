"use strict";

test("Proxy subsystem", () => {

    chunk("It should use URL via global proxy", async () => {
        await $.restartBrowser();
        await $.openUrl("https://opennet.ru");
    });

    chunk("It should manage global proxy inside test", async () => {
        await $.restartBrowser();
        await $.openUrl("https://opennet.ru");
        await $.stopGlobalProxy();
        await $.restartBrowser();
        await $.openUrl("https://opennet.ru");
        await $.startGlobalProxy();
    });

    chunk("It should open web URL via http proxy", async () => {
        await $.restartBrowser();
        await $.openApp();
    });

    chunk("It should activate proxy cache", async () => {
        await $.restartBrowser();
        $.enableCache();
        await $.openApp();  // cache population
        await $.openApp();  // cache usage
        $.disableCache();
        await $.openApp();
    });

    chunk("It should capture info about server responses", async () => {
        await $.restartBrowser();
        $.measureResponses();
        await $.openApp();
        $.getResponsesData();
    });

    chunk("It should limit proxy speed", async () => {
        await $.restartBrowser();
        $.limitProxySpeed(256 /* kb/s */);
        await $.openApp();
        $.unlimitProxySpeed();
        await $.openApp();
    });
});
