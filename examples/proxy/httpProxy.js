// npm test -- examples/proxy/httpProxy.js --web --app https://yandex.ru --proxy
test("Open URL", () => {
    chunk(async () => await SS.openApp());
});
