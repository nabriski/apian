module.exports = {

	tags : {
		'env' : ['prod','stg'],
		'role' : 'api'
	},

	"testFilter" : function(superagent){
		var res = superagent.get("/simple-json/").end();
		    res.status.should.equal(200);
		    res.body.koko.should.equal("loko");
		
	},
};
