# apian
For testing APIs (synchronously)

## Install

```
sudo npm install -g apian
```

## Run

```
apian test.js --output json
```

where test.js is:
``` javascript
module.exports = function testSample(superagent){

    var res = superagent.get("http://darkboxjs.com").end();
    res.status.should.equal(200);

    res = superagent.get("http://ampplifyng.ampplify.com").end();
    res.status.should.equal(200);
};
```

And the output is:
```
{
    "files": {
        "test.js": {
            "testSample": {
                "outcome": "success"
            }
        }
    },
    "outcome": "success"
}
```

## Usage

```
  Usage: index [options]

  Options:

    -h, --help                        output usage information
    -V, --version                     output the version number
    -o, --output <console|json|html>  Output format, default is console
    -c, --config <{baseurl: url | { name: url }, filters: { key:filter | [filter] } }> Advanced apian configuration, to add ontop of baseurl and filters
    -b, --baseurl <url>               Base URL to prefix to each request. Deprecated, instead use config.baseurl
    -f, --config_file <json file path>     Alternative source for configuration. This is only used if no configuration is present in the command line.based on the tags present in the filter.
  
```
## Configuration
Configuration is required to allow more advanced options then we had when only defining a base url.
There are 2 options to load the configuration:
1. Command line parameter -c
2. Configuration File. When config file and command line configuration are present, the file is ignored.

Configuration values are:
- baseurl- Can be a single url, similar to -b, or it can be an object for multiple baseurls
  -  When using an object, every url is identified by a name. This is used for tests to state a dependency for specific baseurls.
- Filters- Representing the filter to apply on test files against the tags optionaly present in the filter. When this parameter is present in configuration, any file that does not match or does not have any filters will not be run.

Example configuration:
``` json
    {
        "baseurl": {
            "google": "http://www.google.com" 
            "yahoo": "http://www.yahoo.com" 
        },
        "filters": { 
            "env":["test","prod"],
            "role": "api"
        } 
    }

```

Example running with config parameter:
``` bash
apian test.js --output json --config {"baseurl": {"google":"http://www.goog.com","yahoo":"http://www.yahoo.com"}}
```
Example running with config_file parameter:
``` bash
apian test.js --output json --config_file test_config.json
```

## Making API Calls

Apian uses a synchronous version of [superagent](https://github.com/visionmedia/superagent) to make HTTP requests. Superagent's [documentation](http://visionmedia.github.io/superagent/) can be used for reference, the only difference being that ```end()```, instead of receiving a callback, returns the response.

#### Superagent
``` javascript
superagent
   .get('http://example.com/search')
   .set('API-Key', 'foobar')
   .set('Accept', 'application/json')
   .end(function(res){
       // handle response
   });
```

#### Superagent in Apian
``` javascript
var res = superagent
               .get('http://example.com/search')
               .set('API-Key', 'foobar')
               .set('Accept', 'application/json')
               .end();

```

## Testing The Response

Apian uses the [Chai](http://chaijs.com/) assertion library to test the response returned by superagent.

``` javascript
module.exports = function testTwitterAuth(superagent){

    var res = superagent
                .get("https://api.twitter.com/1.1/statuses/mentions_timeline.json")
                .query({
                    count : 2,
                    since_id :14927799 
                })
                .end();

    res.status.should.equal(400);
    var json = res.body;

    // expected response:
    // { errors: [ { message: 'Bad Authentication data', code: 215 } ] } 
    json.errors[0].message.should.equal("Bad Authentication data");
    json.errors[0].code.should.equal(215);
};

```

## Setting a base URL for all requests in the test

``` bash
node index.js -c {"baseurl": "https://api.twitter.com"} twitterBaseURL.js  
```

Where ```twitterBaseURL.js``` contents are:
``` javascript
module.exports = function testTwitterAuth(superagent){

    var res = superagent
                .get("/1.1/statuses/mentions_timeline.json")
                .query({
                    count : 2,
                    since_id :14927799 
                })
                .end();

    res.status.should.equal(400);
    var json = res.body;

    // expected response:
    // { errors: [ { message: 'Bad Authentication data', code: 215 } ] } 
    json.errors[0].message.should.equal("Bad Authentication data");
    json.errors[0].code.should.equal(215);
};

```

## Test File Structure

A test file can include one or more tests.

#### Single test
``` javascript
module.exports = function testName(superagent){
    
    // test body ...

};

```

#### One Or More Tests

``` javascript
module.exports = {
    
    //Tags for filtering
    tags{"env":"test"},

    "first test name" : function(superagent){

        //test body
            
    },
    "second test name" : function(superagent){

        //test body
    }
};
```

## Auto Login

If one of the test functions in a file is called ```login``` it will be called before each test in the file.
The ```login``` function must return a ```superagent.agent``` object with login cookies attached so it can be passed to each function instead of the standard ```superagent```.

For example:
``` javascript
module.exports = {

    login : function(superagent){

        var res = superagent
                .post("/signin/")
                .send({
                        username: "bob", 
                        password: "123456"
                })
                .end();

        var agent = superagent.agent();
        agent.saveCookies(res);    
        return agent;
    },

    "first test" : function(superagent){

        //the superagent object here already contains the login cookies
        var res = superagent
            .get("/fetch/some/resource/")
            .end();

        // test code, assertions  ...
    }
};
```
## Filter

In some cases you might be running apian in different environments i.e production/test. When running it you might want to be able to only run some of the test on a given environment.
By adding tags to the test file (only available for an object test), when running apian, you can supply filter based on those tags, and only test files that match will run. Any file that does not have tags or a function test will be discarded

For example the following can be targeted to run on both test and dev evironments, and when running integration test.

``` javascript
module.exports = {
    
    //Tags for filtering
    tags{
        "env":["test","dev"],
        "test_type": "integration"
    },

    ....
}
```

These are some examples when the test will be included:
```
apian test.js --output json --config {"filters": {"env":"test","test_type":"integration"}}
apian test.js --output json --config {"filters": {"env":"dev","test_type":"integration"}}
apian test.js --output json --config {"filters": {"env":"test"}}
apian test.js --output json --config {"filters": {"test_type":"integration"}}
```
These are examples when the test will be filtered:
```
apian test.js --output json --config {"filters":{"env":"prod"}}
apian test.js --output json --config {"filters":{"env":"prod","test_type":"integration"}}
apian test.js --output json --config {"filters":{"service":"click_server"}}
```

## Dependencies
Some scenarios require using more then one api base url. In such cases a test can declare it's superagent dependecies by name, and those will be provided to it's test function.

Here is how such a test would look like:
``` javascript
module.exports = {

    dependencies: [
        'google',
        'yahoo'
    ],
    
    "test" : function(superagents){
        var saGoolge = superagents['google'];
        var saYahoo = superagents['yahoo'];
        var gRes = saGoolge.get("/").end();
        var yRes = saYahoo.get("/").end();

        gRes.status.should.equal(200);
        yRes.status.should.equal(200);
    },
};
```

Invoke the test like this:
``` bash
apian test.js --output json --config {"baseurl": {"google":"http://www.goog.com","yahoo":"http://www.yahoo.com"}}
```