module.exports = {
    
    "first test" : function testSample(superagent){
            var res = superagent.get("http://darkboxjs.com").end();
            res.status.should.equal(200);

            res = superagent.get("http://ampplifyng.ampplify.com").end();
            res.status.should.equal(200);
    },
    "second test" : function testSample2(superagent){

            var res = superagent.get("http://darkboxjs.com").end();
            res.status.should.equal(200);

            res = superagent.get("http://ampplifyng.ampplify.com").end();
            res.status.should.equal(404);
    }
};
