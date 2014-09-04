var exec    = require('child_process').exec,
    colors          = require('colors');
    ys      = require("ys").Ys;

//-----------------------------------------------------------
ys("^/simple-json/$").get.json = function(req,res){
    res.returnObject({koko:"loko"});
};
//-----------------------------------------------------------
exports.setUp = function(callback){
    ys.run({debug:false,port:8888,onInit:function(){
        callback();
    }});
};
//-----------------------------------------------------------
exports.tearDown = function(callback){
   ys.stop({onShutdown:function(){
        callback();
   }});
};
//-----------------------------------------------------------
exports.testSimpleJSON = function(test){
    exec("node index.js -b http://localhost:8888 tests/test-files/simpleJSON.js",
            function(error, stdout, stderr){
                test.equals(
                    stdout,
                    [
                        "tests/test-files/simpleJSON.js".white.bold,
                        "✔ testSimpleJSON".white,
                        "All tests have passed.".green.bold,
                        ""
                    ].join("\n")
                );  
                test.done();  
            }
    );
};
//-----------------------------------------------------------
exports.test404Error = function(test){
    exec("node index.js -b http://localhost:8888 tests/test-files/404Error.js",
            function(error, stdout, stderr){
                test.ok(
                    stdout.indexOf(
                        [
                            "tests/test-files/404Error.js".white.bold,
                            "✘ test404Error".red,
                            "Error".red +" "+"expected 404 to equal 200".white.replace("404","404".yellow.bold).replace("200","200".yellow.bold)
                        ].join("\n")
                    ) === 0
                );  

                test.ok(
                   stdout.indexOf(
                        [
                            "Failed".red,
                            "Some tests have failed.".red.bold
                        ].join("\n")
                    )
                );
                test.done();  
            }
    );
};
//-----------------------------------------------------------

