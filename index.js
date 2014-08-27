#!/usr/bin/env node
/*jslint node: true */
"use strict";

var path            = require('path'),
    superagent      = require('superagent'),
    methods         = require('methods'),
    sync            = require('synchronize'),
    chai            = require('chai'),
    should          = chai.should(),
    cli             = require('commander'),
    allTestsPassed  = true,
    tests,
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
        var req = superagent(method, cli.baseurl + url);
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

tests           = require(path.resolve(cli.args[0]));
//-------------------------------------------
/*
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

  if(cli.output === "html"){
    output+= [msg,err.stack,"Failed".red].join("\n");
    return;
  }
  console.log(msg);
  console.log(err.stack);
  console.log("Failed".red);
}*/
//-------------------------------------------

//for a single function module
if(typeof(tests) === "function"){
   var testObj = {};
   testObj[tests.name] = tests;
   tests = testObj;
}

sync.fiber(function(){


    //console.log(cli.args[0].white.bold);
    outputter.onTestFile(cli.args[0]);
    Object.keys(tests).forEach(function(testName){

        var test = tests[testName];
        try{
            test(superagent);
            /*
            if(cli.output === "json"){
               output.tests.push({name:testName,outcome:"passed"}); 
            }
            else if(cli.output === "html"){
                output+= ("✔ "+testName).white + "\n"; 
            }
            else{
                console.log(("✔ "+testName).white);
            }*/
            outputter.onSuccess(testName);
        }
        catch(e){
            outputter.onException(testName,e);
            allTestsPassed = false;
        }
    });

    if(allTestsPassed){
        outputter.onFinishSuccess();
    }
    else{
        outputter.onFinishFailure();
    }
    /*
    if(cli.output === "json"){
        console.log(JSON.stringify(output,null,4));
    }
    else if(cli.output === "html"){
        if(allTestsPassed){
            output+= "All tests have passed.".green.bold + "\n";
        }
        else{
            output+= "Some tests have failed.".red.bold + "\n";
        }
        console.log(ansi_up.ansi_to_html(output));
    }
    else{
        if(allTestsPassed){
            console.log("All tests have passed.".green.bold);
        }
        else{
            console.log("Some tests have failed.".red.bold);
        }

    }*/

});

