// npm test -- examples/ownSteps/overrideSteps.js --web --app https://yandex.ru
var util = require("util");

var Steps = require("../../lib").Steps;

var MySteps = function () {
    Steps.call(this);
};

util.inherits(MySteps, Steps);

MySteps.prototype.openApp = async function () {
    await Steps.prototype.openApp.call(this);
    console.log(this._appUrl);
};

global.SS = new MySteps();

test("Override steps", () => {
    chunk(async () => await SS.openApp());
});
