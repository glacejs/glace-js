'use strict';

/**
 * Contains functions to report test results to testrail.
 *
 * @module testrail-reporter
 */
var fs = require('fs');
var path = require("path");
var util = require('util');

var _ = require("lodash");

var mocha = require('mocha');
var colors = require('colors/safe');
var Base = mocha.reporters.base;
var inherits = mocha.utils.inherits;
var Testrail = require('testrail-api');

var CONF = require('../config');
var utils = require('../utils');

var publishing = Promise.resolve();
var reportCases = {};

var TestrailResults = {
  PASSED:   1,
  BLOCKED:  2,
  UNTESTED: 3,
  RETEST:   4,
  FAILED:   5
};

var testrail;

var projectId = CONF.testRail.project;
var suiteId = CONF.testRail.suites[CONF.suite];

if (suiteId && CONF.publishResults) {
  testrail.getCases(projectId, { suite_id: suiteId }, function (err, cases) {

    if (err)
      throw err;

    cases.forEach(function (testrailCase, index, cases) {
      reportCases[testrailCase.title] = { id: testrailCase.id };
    });
  });
}

module.exports = {

    start: () => {

        testrail = new Testrail({
          host:     CONF.testRail.host,
          user:     CONF.testRail.user,
          password: CONF.testRail.password
        });

        var description = "";
        testrail.addRun(
            projectId,
            {
                suite_id: suiteId,              // required
                name: CONF.suite,              // required
                description: description      // required
            },
            (err, run) => {
                CONF.testRail.runId = run.id;
            }
        );
    },

    end: () => {
        var reportMsg = "Tests report is " + CONF.testRail.reportUrl + CONF.testRail.runId;
        console.log(colors.report(Array(reportMsg.length + 1).join('-')));
        console.log(colors.report(reportMsg));
    },

    fail: (step, err) => {
        var reportCase, stepTitle = mochaTest.title;
        var parent = mochaTest.parent;
        while (parent) {
          if (parent.title in reportCases) {
            reportCase = reportCases[parent.title];
            break;
          }
          parent = parent.parent;
        }

        if (reportCase) {
          if (!reportCase.failedSteps)
            reportCase.failedSteps = {};

          reportCase.failedSteps[stepTitle] = err.message + '\n' + err.stack;
        }
    },

    testEnd: test => {
        var reportCase = reportCases[mochaSuite.title];
        var caseId = (reportCase || {}).id;

        if (caseId) {
            var screensMsg = '';
            CONF.testCase.screenshots.forEach(screenPath => {
                screensMsg += 'file:\\' + screenPath + '\n';
            });

            var testResult = {
                status_id: TestrailResults.PASSED,
                comment: 'Screenshots:\n' + screensMsg + '\n\n'
            };

            var videosMsg = "";
            CONF.testCase.videos.forEach(videoPath => {
                videosMsg += "file:\\" + videoPath + "\n";
            });
            if (videosMsg)
                testResult.comment += "Videos:\n" + videosMsg + "\n\n";

            if (!utils.isEmpty(reportCase.failedSteps)) {
                testResult.status_id = TestrailResults.FAILED;

                for (var step in reportCase.failedSteps) {
                    var errMsg = reportCase.failedSteps[step];
                    testResult.comment += 'step: ' + step + '\nerror: ' + errMsg + '\n\n';
                }
            }
            publishing = publishing.then(() => {
              return new Promise((resolve, reject) => {
                testrail.addResultForCase(CONF.testRail.runId,
                                          caseId,
                                          testResult,
                                          (err, res) => {
                                            if (err) reject(err);
                                              resolve(res);
                                          });

              });
            });
        };
    },

    done: () => {
      return publishing;
    },
};
