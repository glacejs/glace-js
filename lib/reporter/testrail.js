"use strict";
/**
 * TestRail reporter.
 *
 * @module
 */

var _ = require("lodash");
var Testrail = require('testrail-api');

var CONF = require("../config");
var TestCase = require("../testing").TestCase;

var testrail = new Testrail({ host: CONF.testrail.host,
                              user: CONF.testrail.user,
                              password: CONF.testrail.token });

var Results = {
    PASSED:   1,
    BLOCKED:  2,
    UNTESTED: 3,
    RETEST:   4,
    FAILED:   5
};

var cases = {};
var report = Promise.resolve();

var testrailReporter = module.exports = {
    /**
     * Called on tests start.
     *
     * @method
     * @instance
     */
    start: () => {

        report.then(() => {
            return new Promise((resolve, reject) => {
                testrail.getCases(
                    CONF.testrail.project,
                    { suite_id: CONF.testrail.suiteId },
                    (err, _cases) => {
                        if (err) reject(err);
                        for (var _case of _cases) {
                            if (cases[_case.title]) {
                                reject(`Detect duplicated cases with name \
                                       '${_case.title}'. Only unique names \
                                       should be.`);
                            };
                            cases[_case.title] = { id: _case.id };
                        };
                        resolve();
                    }); 
            });
        });
        report.then(() => {
            return new Promise((resolve, reject) => {
                testrail.addRun(
                    CONF.testrail.project,
                    { suite_id: CONF.testrail.suiteId,
                      name: CONF.testrail.suiteName,
                      description: description },
                    (err, run) => {
                        if (err) reject(err);
                        CONF.testrail.runId = run.id;
                        resolve();
                    });
            });
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
        var reportMsg = "TestRail report is " + CONF.testrail.reportUrl +
            CONF.testrail.runId;
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
            testResult.comment += "\n";
            for (var screen of testCase.screenshots) {
                testResult.comment += "\n" + screen;
            };
        };
        if (testCase.videos.length) {
            testResult.comment += "\n";
            for (var video of testCase.videos) {
                testResult.comment += "\n" + video;
            };
        };
        if (testCase.status === TestCase.FAILED) {
            testResult.status_id = Results.FAILED;
            testResult.comment += "\n";
            for (var error of testCase.errors) {
                testResult.comment += "\n" + error;
            };
        };

        report = report.then(() => {
            return new Promise((resolve, reject) => {
                testrail.addResultForCase(
                    CONF.testrail.runId,
                    testrailCase.id,
                    testResult,
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
        return report;
    },
};
