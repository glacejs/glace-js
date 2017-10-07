// npm test -- examples/parametrization/inside.js
["en", "ru", "ja", "ee"].forEach(lang => {
    test("My test for language " + lang, () => {
        chunk(() => {});
    });
});
