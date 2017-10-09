// npm test -- examples/proxy/httpProxy.js --web --app https://yandex.ru --proxy
test("Http proxy", () => {
    chunk(async () => await SS.openApp());
});
