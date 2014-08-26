
module.exports = function testTwitterAuth(superagent){

    var res = superagent
                .get("/1.1/statuses/mentions_timeline.json")
                .query({
                    count : 2,
                    since_id :14927799 
                })
                .end();

    res.status.should.equal(400);
    var json = res.body;

    // expected response:
    // { errors: [ { message: 'Bad Authentication data', code: 215 } ] } 
    json.errors[0].message.should.equal("Bad Authentication data");
    json.errors[0].code.should.equal(215);
};

