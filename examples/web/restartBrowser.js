// npm test -- examples/web/restartBrowser.js --web
test("Restart browser", () => {
    chunk(async () => await SS.restartBrowser());
});
