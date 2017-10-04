// npm test -- examples/ownReporter/test.js
var reporter = require("../../lib").reporter

var myReporter = {

    start: () => {
        console.log("tests start");
    },
    end: () => {
        console.log("tests end");
    },
    test: mochaSuite => {
        console.log("start test", mochaSuite.title);
    },
    testEnd: mochaSuite => {
        console.log("end test", mochaSuite.title);
    },
    scope: mochaSuite => {
        console.log("start scope", mochaSuite.title);
    },
    scopeEnd: mochaSuite => {
        console.log("end scope", mochaSuite.title);
    },
    hook: mochaHook => {
        console.log("start hook", mochaHook.title);
    },
    hookEnd: mochaHook => {
        console.log("end hook", mochaHook.title);
    },
    pass: mochaTest => {
        console.log("chunk passed", mochaTest.title);
    },
    fail: (mochaTest, err) => {
        console.log("chunk failed", mochaTest.title, "with error", err.message);
    },
    pending: mochaTest => {
        console.log("chunk pending", mochaTest.title);
    },
    done: () => {
        console.log("reporter finalizing");
    }
};

reporter.register(myReporter);

test("Own reporter", () => chunk(() => {}));
