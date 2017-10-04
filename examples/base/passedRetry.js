// npm test -- examples/base/passedRetry.js --retry 1
var shouldFail = true;

test("Passed retry", () => {
    chunk(() => {
        if (shouldFail) {
            shouldFail = false;
            throw new Error("boom!");
        };
    });
});
