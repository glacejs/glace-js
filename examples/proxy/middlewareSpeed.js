// npm test -- examples/proxy/middlewareSpeed.js --web --global-proxy --proxy --app https://yandex.ru
test("Limit responses speed", () => {
    chunk(async () => {
        SS.limitProxySpeed(256 /* kb/s */);
        await SS.openApp();
        SS.unlimitProxySpeed();
        await SS.openApp();
    });
});
