// npm test -- examples/timer/test.js
test("Passed timer", () => {
    chunk(async () => {
        SS.startTimer();
        await SS.pause(2, "pause");
        SS.checkTimer({ "to be lte": 2.2 });
    });
});

test("Failed timer", () => {
    chunk(async () => {
        SS.startTimer();
        await SS.pause(2, "pause");
        SS.checkTimer({ "to be gte": 2.2 });
    });
});
