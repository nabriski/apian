module.exports = function testExpect(superagent){

    var res = superagent.get("/simple-json/").end();
    res.status.should.equal(200);
    expect(res.body.koko).to.equal("loko");

};
