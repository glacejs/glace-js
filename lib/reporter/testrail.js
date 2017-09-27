"use strict";
/**
 * `GlaceJS` TestRail reporter.
 *
 * @module
 */

var colors = require("colors");

var ConfigError = require("../error").ConfigError;
var TestCase = require("../testing").TestCase;


var Results = {
    PASSED:   1,
    BLOCKED:  2,
    UNTESTED: 3,
    RETEST:   4,
    FAILED:   5
};

var cases = {};
var runId = null;
var publishing = Promise.resolve();

var testrailReporter = module.exports = {
    /**
     * Called on tests start.
     *
     * @method
     * @instance
     */
    start: () => {
        testrail = new Testrail({ host: CONF.testrail.host,
                                  user: CONF.testrail.user,
                                  password: CONF.testrail.token });

        testrail.addRun(
            CONF.testrail.projectId,
            { suite_id: CONF.testrail.suiteId,
              name: CONF.testrail.suiteName,
              description: CONF.testrail.description },
            (err, run) => {
                if (err) {
                    console.log(err);
                    process.exit(1);
                };
                runId = run.id;
            });

        testrail.getCases(
            CONF.testrail.projectId,
            { suite_id: CONF.testrail.suiteId },
            (err, _cases) => {
                if (err) {
                    console.log(err);
                    process.exit(1);
                };
                for (var _case of _cases) {
                    if (cases[_case.title]) {
                        console.log(`Detect duplicated cases with name \
                                     '${_case.title}'. Only unique names \
                                     should be.`);
                        process.exit(1);
                    };
                    cases[_case.title] = { id: _case.id };
                };
            });
    },
    /**
     * Called before tests end.
     *
     * @method
     * @instance
     */
    end: () => {
        console.log();
        var reportMsg = "Tests report is " + CONF.testRail.reportUrl + runId;
        console.log(Array(reportMsg.length + 1).join("-").yellow);
        console.log(reportMsg.yellow);
    },
    /**
     * Called on test end.
     *
     * @method
     * @instance
     * @arg {object} test - `MochaJS` suite.
     */
    testEnd: test => {
        var testCase = CONF.testCases.filter(t => t.name === test.title)[0];
        var testrailCase = cases[test.title];
        if (!testrailCase) return;

        var testResult = { status_id: Results.PASSED, comment: "" };

        if (testCase.screenshots.length) {
            testResult += "\n";
            for (var screen of testCase.screenshots) {
                testResult.comment += "\n" + screen;
            };
        };
        if (testCase.videos.length) {
            testResult += "\n";
            for (var video of testCase.videos) {
                testResult.comment += "\n" + video;
            };
        };
        if (testCase.status === TestCase.FAILED) {
            testResult.status_id = Results.FAILED;
            testResult += "\n";
            for (var error of testCase.errors) {
                testResult += "\n" + error;
            };
        };

        publishing = publishing.then(() => {

            return new Promise((resolve, reject) => {

                testrail.addResultForCase(runId, testrailCaseId, testResult,
                                          (err, res) => {
                                            if (err) reject(err);
                                              resolve(res);
                                          });
            });
        });
    },
    /**
     * Called on report finalizing.
     *
     * @method
     * @instance
     */
    done: () => {
      return publishing;
    },
};
