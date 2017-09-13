"use strict";
/**
 * Config
 *
 * @module
 */
var fs = require("fs");
var path = require("path");

var _ = require("lodash");
var argv = require("yargs").argv;

var cwd = process.cwd();

var argConfig = {};
var argConfigPath = path.resolve(cwd, "args.json");

if (fs.existsSync(argConfigPath))
    argConfig = require(argConfigPath);

_.assign(argConfig, argv);

var config = module.exports = {
    curTestCase: null;
    testCases: [],
    testsDir: path.resolve(cwd, "tests");
    reportsDir: path.resolve(cwd, "reports");
};

var userConfig = {};
var userConfigPath = path.resolve(cwd, "config.js");

if (fs.existsSync(userConfigPath))
    userConfig = require(userConfigPath);

_.assign(config, userConfig);

config.isWeb = !!argConfig.web;
