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
    -b, --baseurl <url>               Base URL to prefix to each request
    -f, --filter <filter json>        Json representing the filter to apply, based on the tags present in the filter.
  
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
node index.js -b https://api.twitter.com twitterBaseURL.js  
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
apian test.js --output json --filter {"env":"test","test_type":"integration"}
apian test.js --output json --filter {"env":"dev","test_type":"integration"}
apian test.js --output json --filter {"env":"test"}
apian test.js --output json --filter {"test_type":"integration"}
```
These are examples when the test will be filtered:
```
apian test.js --output json --filter {"env":"prod"}
apian test.js --output json --filter {"env":"prod","test_type":"integration"}
apian test.js --output json --filter {"service":"click_server"}
```