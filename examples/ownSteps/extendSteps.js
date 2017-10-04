// npm test -- examples/ownSteps/extendSteps.js --web --app https://yandex.ru
var Steps = require("../../lib").Steps;

Steps.register({
    printAppUrl: function () {
        expect(this._appUrl,
               "Application URL is undefined").to.exist;
        console.log(this._appUrl);
    },
});

test("Extend steps", () => {
    chunk(() => SS.printAppUrl());
});
