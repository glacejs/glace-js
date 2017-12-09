"use strict";

test("Proxy subsystem", () => {

    chunk("It should use URL via global proxy", async () => {
        await SS.restartBrowser();
        await SS.openUrl("https://opennet.ru");
    });

    chunk("It should manage global proxy inside test", async () => {
        await SS.restartBrowser();
        await SS.openUrl("https://opennet.ru");
        await SS.stopGlobalProxy();
        await SS.restartBrowser();
        await SS.openUrl("https://opennet.ru");
        await SS.startGlobalProxy();
    });

    chunk("It should open web URL via http proxy", async () => {
        await SS.restartBrowser();
        await SS.openApp();
    });

    chunk("It should active proxy cache", async () => {
        await SS.restartBrowser();
        SS.enableCache();
        await SS.openApp();  // cache population
        await SS.openApp();  // cache usage
        SS.disableCache();
        await SS.openApp();
    });

    chunk("It should capture info about server responses", async () => {
        await SS.restartBrowser();
        SS.measureResponses();
        await SS.openApp();
        SS.getResponsesData();
    });

    chunk("It should limit proxy speed", async () => {
        await SS.restartBrowser();
        SS.limitProxySpeed(256 /* kb/s */);
        await SS.openApp();
        SS.unlimitProxySpeed();
        await SS.openApp();
    });
});
