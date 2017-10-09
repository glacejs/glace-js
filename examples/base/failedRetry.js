// npm test -- examples/base/failedRetry.js --retry 1
test("Failed retry", () => {
    chunk(() => {
        throw new Error("boom!");
    });
});
