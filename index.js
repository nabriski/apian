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
    util            = require('util'),
    outputter = require('./outputs/console'),
    output;

chai.config.includeStack = true;

cli
  .version('0.0.5')
  .option('-o, --output <console|json|html>', 'Output format, default is console')
  .option('-b, --baseurl <url>', 'Base URL to prefix to each request. Deprecated, instead use config.baseurl')
  .option('-c, --config <{baseurl: url | { name: url }, filters:{ key:filter | [filter] } }>', 'Advanced apian configuration, to add ontop of baseurl and filters')
  .option('-f, --config_file <file path>', 'Alternative source for configuration. This is only used if no configuration is present in the command line.')
  .parse(process.argv);

function initConfig(cli){
    
    var config = cli.config ? JSON.parse(cli.config) : undefined;
    if( ! config && cli.config_file ){
        config = require(path.resolve(cli.config_file));
    }
    
    if(! config){
        config = {
            urls: {},
            filters : {}
        };
    }

    if(!config.baseurl && cli.baseurl){
        config.baseurl = {'default':cli.baseurl};
    }

    // Transform a single url string to object
    if( config.baseurl && typeof config.baseurl == 'string' ){
        config.baseurl = {'default':config.baseurl};
    }

    if(! config.filters && cli.filters ){
        config.filters = cli.filters;
    }

    return config;
}

function initSuperagents(config){

    sync(superagent.Request.prototype, 'end');

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


    var superagents = {};
    if(! config.baseurl || Object.keys(config.baseurl).length == 0 ){
        superagents['default'] = superagent;
    }else{
        Object.keys(config.baseurl).forEach(function(urlKey){
            var saInstance = superagent();
            var baseurl = config.baseurl[urlKey];
            methods.forEach(function(method){
              var name = 'delete' == method ? 'del' : method;
              method = method.toUpperCase();

              

              saInstance[name] = function(url, fn){
                var req = superagent(method, url[0] === "/" ? baseurl + url : url);
                fn && req.end(fn);
                return req;
              };

             saInstance.agent.prototype[name] = function(url, fn){
                var req = superagent(method, url[0] === "/" ? baseurl + url : url);
                req.ca(this._ca);

                req.on('response', this.saveCookies.bind(this));
                req.on('redirect', this.saveCookies.bind(this));
                req.on('redirect', this.attachCookies.bind(this, req));
                this.attachCookies(req);

                fn && req.end(fn);
                return req;
             };


             saInstance.parse['application/json'] = function(res, fn){
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

            });

        // The first url is the default one
        if( Object.keys(superagents).length == 0 ){
            superagents['default'] = saInstance;
        }
        superagents[urlKey] = saInstance;

        });
    }

    return superagents;
}


var config = initConfig(cli);

var superagents = initSuperagents(config);

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
                if( config.filters && Object.keys(config.filters).length > 0 )
                    return false;
                var testObj = {};
                testObj[tests.name] = tests;
                tests = testObj;
               // Function test cannot have a filters.
            }else if( config.filters ){
                // Filter by tags, received from command line 
                if( ! tests.tags )
                    return false;
                var qualify = Object.keys(config.filters).every( function(filterKey){
                    var filter = config.filters[filterKey];
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

            // Determin which superagents are dependencies for this test
            var agents = {'default':superagents['default']};
            if(tests.dependencies && tests.dependencies.length > 0){
                agents = {};
                tests.dependencies.forEach(function(dependencyKey){
                    if(superagents[dependencyKey])
                        agents[dependencyKey] = superagents[dependencyKey];
                });

                if(Object.keys(agents).length < tests.dependencies.length){
                    // Not sure this is the right approach to handeling the error. But it looks good enough. 
                    outputter.onException("resolve dependencies",new Error(util.format("Missing dependencies- %j" , tests.dependencies)));
                    allTestsPassed = false;
                    return;
                }

                delete tests.dependencies;
            }

            if(tests.login){
                agent = tests.login(superagents.default);
                delete tests.login;
            }
            Object.keys(tests).forEach(function(testName){
                var test = tests[testName];
                try{
                    if(agents.default){
                        // In cases where we will use thew default agent, just send it to the test function.
                        test(agents.default);
                    }
                    else{
                        // Send all dependencies to test function
                        test(agents);
                    }

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

