#!/usr/bin/env node
/*jslint node: true */
"use strict";

var path            = require('path'),
    superagent      = require('superagent'),
    methods         = require('methods'),
    sync            = require('synchronize'),
    chai            = require('chai'),
    should          = chai.should(),
    colors          = require('colors'),
    ansi_up         = require('ansi_up'),
    cli             = require('commander'),
    allTestsPassed  = true,
    tests,
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

if(cli.output === "json"){
    output = {tests:[]};
}
else if(cli.output === "html"){
    output = "";
}

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

  if(cli.output === "html"){
    output+= [msg,err.stack,"Failed".red].join("\n");
    return;
  }
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

        if(!cli.output || cli.output === "console"){
            console.log(["Running test:",testName].join(" ").cyan.bold.inverse);
        }
        else if(cli.output === "html"){
            output+= ["Running test:",testName].join(" ").cyan.bold.inverse + "\n";
        }

        var test = tests[testName];
        try{
            test(superagent);
            if(cli.output === "json"){
               output.tests.push({name:testName,outcome:"passed"}); 
            }
            else if(cli.output === "html"){
                output+= "Passed".green.bold + "\n"; 
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
    else if(cli.output === "html"){
        if(allTestsPassed){
            output+= "All tests have passed.".green.bold.inverse + "\n";
        }
        else{
            output+= "Some tests have failed.".red.bold.inverse + "\n";
        }
        console.log(ansi_up.ansi_to_html(output));
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

