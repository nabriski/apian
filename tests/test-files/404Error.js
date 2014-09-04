module.exports = function test404Error(superagent){

    var res = superagent.get("/no-such-url/").end();
    res.status.should.equal(200);

};
