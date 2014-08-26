module.exports = {
    
    "first test" : function(superagent){
            var res = superagent.get("http://darkboxjs.com").end();
            res.status.should.equal(200);

            res = superagent.get("http://ampplifyng.ampplify.com").end();
            res.status.should.equal(200);
    },
    "second test" : function(superagent){

            var res = superagent.get("http://darkboxjs.com").end();
            res.status.should.equal(200);

            res = superagent.get("http://ampplifyng.ampplify.com").end();
            res.status.should.equal(404);
    }
};
