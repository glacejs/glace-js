// npm test -- examples/parametrization/inside.js --languages en,ru,ja,ee
test("My multilingual test", () => {
    forEachLanguage(lang => {
        chunk(() => {});
    });
});
