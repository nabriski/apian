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
  .option('-f, --filters <{key:filter | [filter] }>', 'Filter test by tag')
  .parse(process.argv);

//change json parser to have a friendlier error message
superagent.parse['application/json'] = function(res, fn){
    res.text = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk){ res.text += chunk; });
    res.on('end', function(){
        try {
            fn(null, JSON.parse(res.text));
        } catch (err) {
            fn(new Error("Response body is not valid JSON:\n"+res.text),null);
        }
    }); 
};

if(cli.baseurl){
    methods.forEach(function(method){

      var name = 'delete' == method ? 'del' : method;
      method = method.toUpperCase();

      superagent[name] = function(url, fn){
        var req = superagent(method, url[0] === "/" ? cli.baseurl + url : url);
        fn && req.end(fn);
        return req;
      };

     superagent.agent.prototype[name] = function(url, fn){
        var req = superagent(method, url[0] === "/" ? cli.baseurl + url : url);
        req.ca(this._ca);

        req.on('response', this.saveCookies.bind(this));
        req.on('redirect', this.saveCookies.bind(this));
        req.on('redirect', this.attachCookies.bind(this, req));
        this.attachCookies(req);

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
                if( cli.filters )
                    return false;
                var testObj = {};
                testObj[tests.name] = tests;
                tests = testObj;
               // Function test cannot have a filters.
            }else if( cli.filters ){
                // Filter by tags, received from command line 
                if( ! tests.tags )
                    return false;

                var filters = JSON.parse(cli.filters)
                var qualify = Object.keys(filters).every( function(filterKey){
                    var filter = filters[filterKey];
                    var tagValue = tests.tags[filterKey]
                    // Test can support multiple value for a tag. the filter needs to be tested for all of them.
                    if( Array.isArray(tagValue) ){
                        return tagValue.some( function(tag){
                            return tag === filter;
                        });
                    }else{
                        return tagValue === filter;
                    }

                });
                if( ! qualify ){
                    return false;
                }
            }

            //Tags is no longer needed, make sure it's no longer present.
            delete tests.tags;

            var agent = superagent;
            if(tests.login){
                agent = tests.login(superagent);
                delete tests.login;
            }
            Object.keys(tests).forEach(function(testName){
                var test = tests[testName];
                try{
                    test(agent);
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

