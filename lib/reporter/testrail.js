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

var testrail = new Testrail({
  host:     CONF.testRail.host,
  user:     CONF.testRail.user,
  password: CONF.testRail.password
});

colors.setTheme({
    report: ['magenta', 'bold'],
});

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

module.exports = TestrailReporter;

/**
 * Creates a new instance of testrail reporter.
 *
 * @class
 * @classdesc Reports test results to testrail and prints to console.
 * @param {object} runner - mochajs runner
 */
function TestrailReporter(runner) {
  Base.call(this, runner);

  var indents = 0;

  var indent = () => {
    return Array(indents).join('  ');
  }

  var origConsoleLog;

  var patchConsoleLog = () => {
    var reportLog = fs.createWriteStream(CONF.rootPath + '/report.log',
                                         {flags : 'w'});
    origConsoleLog = console.log;

    console.log = function() {
      reportLog.write(util.format.apply(null, arguments) + '\n');
      origConsoleLog.apply(this, arguments);
    }
  }

  var restoreConsoleLog = () => {
    if (origConsoleLog)
      console.log = origConsoleLog;
  }

  runner.on('start', () => {
    patchConsoleLog();

    console.log();
    if (suiteId)
      this.startRun();
  });

  runner.on('end', () => {
    this.epilogue();
    if (CONF.publishResults) {
      if (suiteId) {
        var reportMsg = "Tests report is " + CONF.testRail.reportUrl + CONF.testRail.runId;
        console.log(colors.report(Array(reportMsg.length + 1).join('-')));
        console.log(colors.report(reportMsg));
      };
    } else {
      var reportMsg = "Tests report is " + path.dirname(CONF.localReportDir);
      console.log(colors.report(Array(reportMsg.length + 1).join('-')));
      console.log(colors.report(reportMsg));
    };
    restoreConsoleLog();
  });

  runner.on('suite', (mochaSuite) => {
    ++indents;
    if (mochaSuite.title) {
      console.log();
      var prefix = reportCases[mochaSuite.title] ? 'case:' : 'scope:';
      console.log(colors.yellow(indent(), prefix, mochaSuite.title));
    }
  });

  runner.on('test', (mochaTest) => {
      CONF.testCase.addStep(mochaTest.title);
  });

  runner.on('pass', (mochaTest) => {
    console.log(colors.green(indent() + '  ', 'step:', Base.symbols.ok, mochaTest.title));
  });

  runner.on('fail', (mochaTest, err) => {
    console.log(colors.red(indent() + '  ', 'step:', Base.symbols.err, mochaTest.title));

    var lastStep = _.last(CONF.testCase.getSteps());
    if (lastStep) lastStep.isFailed = true;

    var failedParams = {};
    if (CONF.testCase.language) {
      failedParams.languages = [CONF.testCase.language];    
    };
    CONF.testCase.addFailedParams(failedParams);

    if (suiteId)
      this.gatherErrors(mochaTest, err);
  });

  runner.on('suite end', (mochaSuite) => {
    --indents;
    if (indents === 1)
      console.log();
    if (suiteId && CONF.publishResults)
        this.publishResult(mochaSuite);
  });
}

/**
 * Inherit from `Base.prototype`.
 */
inherits(TestrailReporter, Base);

/**
 * Starts testrail run.
 *
 * @method
 */
TestrailReporter.prototype.startRun = function () {

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

}

/**
 * Gathers test errors to report.
 *
 * @method
 * @param {object} mochaTest - mochajs test
 * @param {object} err - mochajs test error
 */
TestrailReporter.prototype.gatherErrors = function (mochaTest, err) {
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
}

/**
 * Publish test result to test run.
 *
 * @method
 * @param {object} mochaSuite - mochajs tests suite
 */
TestrailReporter.prototype.publishResult = function (mochaSuite) {
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
};
/**
 * Finalizes `mocha` right after report publishing.
 *
 * @param {object} failures - `mocha` failures
 * @param {function} fn - `mocha` finalizer
 */
TestrailReporter.prototype.done = function (failures, fn) {
  publishing.then(() => {
    fn(failures);
  });
};
