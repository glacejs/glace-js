// npm test -- examples/xvfb/xvfbVideo.js --web --force-video --xvfb
test("Capture video from xvfb", () => {
    chunk(async() => {
        await SS.openUrl("https://yandex.ru");
        console.log("video will be saved to", SS.getVideo({ check: false }));
    });
});
