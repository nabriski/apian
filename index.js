#!/usr/bin/env node
/*jslint node: true */
"use strict";

var path            = require('path'),
    fs              = require('fs'),
    superagent      = require('superagent'),
    methods         = require('methods'),
    sync            = require('synchronize'),
    chai            = require('chai'),
    should          = chai.should(),
    cli             = require('commander'),
    allTestsPassed  = true,
    outputter = require('./outputs/console'),
    output;

sync(superagent.Request.prototype, 'end');

chai.config.includeStack = true;

cli
  .version('0.0.5')
  .option('-o, --output <console|json|html>', 'Output format, default is console')
  .option('-b, --baseurl <url>', 'Base URL to prefix to each request')
  .parse(process.argv);

if(cli.baseurl){
    methods.forEach(function(method){
      var name = 'delete' == method ? 'del' : method;
      method = method.toUpperCase();
      superagent[name] = function(url, fn){
        var req = superagent(method, url[0] === "/" ? cli.baseurl + url : url);
        fn && req.end(fn);
        return req;
      };
    });
}

if(cli.output === "html"){
    outputter = require('./outputs/html');
}
else if(cli.output === "json"){
    outputter = require('./outputs/json');
}



sync.fiber(function(){

    cli.args.forEach(function(arg){
        var files = [],
            fstats = fs.statSync(arg),
            tests;


        if(fstats.isFile()){
            files.push(arg);
        }
        else if(fstats.isDirectory()){
            files = fs.readdirSync(arg).
                        filter(function(file){
                            return fs.statSync(path.join(arg,file)).isFile();
                        })
                        .map(function(file){
                            return path.join(arg,file);
                        });
            
        }
        files.forEach(function(file){
            outputter.onTestFile(file);
            tests = require(path.resolve(file));
            //for single test files
            if(typeof(tests) === "function"){
               var testObj = {};
               testObj[tests.name] = tests;
               tests = testObj;
            }

            Object.keys(tests).forEach(function(testName){
                var test = tests[testName];
                try{
                    test(superagent);
                    outputter.onSuccess(testName);
                }
                catch(e){
                    outputter.onException(testName,e);
                    allTestsPassed = false;
                }
            });

            
        });
    });

    if(allTestsPassed){
        outputter.onFinishSuccess();
    }
    else{
        outputter.onFinishFailure();
    }

});

