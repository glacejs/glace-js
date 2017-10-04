// npm test -- examples/base/failedRetry.js --retry 1
test("Passed retry", () => {
    chunk(() => {
        throw new Error("boom!");
    });
});
