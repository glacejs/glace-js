// npm test -- examples/proxy/middlewareInfo.js --web --global-proxy --proxy --app https://yandex.ru
test("Gather information about responses", () => {
    chunk(async () => {
        SS.measureResponses();
        await SS.openApp();
        console.log(SS.getResponsesData());
    });
});
