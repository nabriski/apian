module.exports = function testAssert(superagent){

    var res = superagent.get("/simple-json/").end();
    res.status.should.equal(200);
    assert.equal(res.body.koko,"loko");

};
