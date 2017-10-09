// npm test -- examples/parametrization/outside.js
["en", "ru", "ja", "ee"].forEach(lang => {
    test("My test for language " + lang, () => {
        chunk(() => {});
    });
});
