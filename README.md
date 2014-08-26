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
    "tests": [
        {
            "name": "testSample",
            "outcome": "passed"
        }
    ]
}
```

## Usage

```
  Usage: apian [options]

  Options:

    -h, --help                        output usage information
    -V, --version                     output the version number
    -o, --output <console|json|html>  Output format, default is console


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

```
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

