module.exports = {

	dependencies: [
		'google'
	],
	
	"test" : function(superagents){
		Object.keys(superagents).forEach(function(superagentKey){
			superagent = superagents[superagentKey];
			var res = superagent.get("/simple-json/").end();
			    res.status.should.equal(200);
			    res.body.koko.should.equal("loko");
		})
	},
};
