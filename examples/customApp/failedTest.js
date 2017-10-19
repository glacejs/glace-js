// ./app failedTest.js
test("Failed test", () => {
    chunk(() => {
        throw new Error("boom!");
    });
});
