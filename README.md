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
    res.status.should.equal(200);
};
```

And the output is:
<span style="color:rgb(85, 255, 255)">Running test: testSample</span><span style="color:rgb(85, 255, 255)"></span><span style="color:rgb(85, 255, 255)"></span><span style="color:rgb(85, 255, 255)">
</span><span style="color:rgb(85, 255, 255)"></span><span style="color:rgb(0, 255, 0)">Passed</span><span style="color:rgb(0, 255, 0)"></span><span style="color:rgb(0, 255, 0)">
</span><span style="color:rgb(0, 255, 0)"></span><span style="color:rgb(0, 255, 0)"></span><span style="color:rgb(0, 255, 0)">All tests have passed.</span><span style="color:rgb(0, 255, 0)"></span><span style="color:rgb(0, 255, 0)"></span><span style="color:rgb(0, 255, 0)">
</span>
