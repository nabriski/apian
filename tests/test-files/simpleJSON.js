module.exports = function testSimpleJSON(superagent){

    var res = superagent.get("/simple-json/").end();
    res.status.should.equal(200);
    res.body.koko.should.equal("loko");

};
