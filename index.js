#!/usr/bin/env node
/*jslint node: true */
"use strict";

var path            = require('path'),
    superagent      = require('superagent'),
    sync            = require('synchronize'),
    chai            = require('chai'),
    should          = chai.should(),
    colors          = require('colors'),
    output          = {tests:[]},
    cli             = require('commander'),
    allTestsPassed  = true,
    tests;

sync(superagent.Request.prototype, 'end');

chai.config.includeStack = true;


cli
  .version('0.0.1')
  .option('-o, --output <console|json>', 'Output format, default is console')
  .parse(process.argv);

tests           = require(path.resolve(cli.args[0]));
//-------------------------------------------
function onException(err,testName) {

  if(cli.output === "json"){
      err.name = testName;
      err.output = "failed";
      output.tests.push(err);
      return;
  }
  var msg = ["Error".red,err.message.white].join(" ");
  msg = msg.replace(String(err.expected),String(err.expected).yellow.bold);
  msg = msg.replace(String(err.actual),String(err.actual).yellow.bold);
  console.log(msg);
  console.log(err.stack);
  console.log("Failed".red);
}
//-------------------------------------------

//for a single function module
if(typeof(tests) === "function"){
   var testObj = {};
   testObj[tests.name] = tests;
   tests = testObj;
}

sync.fiber(function(){

    Object.keys(tests).forEach(function(testName){
        if(!cli.output ){
            console.log(["Running test:",testName].join(" ").cyan.bold.inverse);
        }
        var test = tests[testName];
        try{
            test(superagent);
            if(cli.output === "json"){
               output.tests.push({name:testName,outcome:"passed"}); 
            }
            else{
                console.log("Passed".green.bold);
            }
        }
        catch(e){
            onException(e,testName);
            allTestsPassed = false;
        }
    });

    if(cli.output === "json"){
        console.log(JSON.stringify(output,null,4));
    }
    else{
        if(allTestsPassed){
            console.log("All tests have passed.".green.bold.inverse);
        }
        else{
            console.log("Some tests have failed.".red.bold.inverse);
        }

    }

});

