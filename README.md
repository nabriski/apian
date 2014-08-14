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
