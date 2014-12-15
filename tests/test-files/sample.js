module.exports = function testSample(superagent){

    var res = superagent.get("http://darkboxjs.com").end();
    res.status.should.equal(200);

    res = superagent.get("http://www.youappi.com/nofile").end();
    res.status.should.equal(404);
};
