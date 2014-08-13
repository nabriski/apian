# apian
For testing APIs (synchronously)

## Install

```
sudo npm install -g apian
```

## Run

```
apian test.js
```

where test.js is:
``` javascript
module.exports = function testSample(superagent){

    var res = superagent.get("http://darkboxjs.com").end();
    res.status.should.equal(200);

    res = superagent.get("http://ampplifyng.ampplify.com").end();
    res.status.should.equal(404);
};
```
