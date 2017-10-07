// npm test -- examples/parametrization/outside.js --languages en,ru,ja,ee
test("My multilingual test", () => {
    forEachLanguage(lang => {
        chunk(() => {});
    });
});
