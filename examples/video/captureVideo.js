// npm test -- examples/video/captureVideo.js --web --force-video
test("Capture video", () => {
    chunk(async() => {
        await SS.openUrl("https://yandex.ru");
        console.log("video will be saved to", SS.getVideo({ check: false }));
    });
});
