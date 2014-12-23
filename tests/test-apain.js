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
exports.testExpect = function(test){
    exec("node index.js -b http://localhost:8888 tests/test-files/expect.js",
            function(error, stdout, stderr){
                test.equals(
                    stdout,
                    [
                        "tests/test-files/expect.js".white.bold,
                        "✔ testExpect".white,
                        "All tests have passed.".green.bold,
                        ""
                    ].join("\n")
                );  
                test.done();  
            }
    );
};

//-----------------------------------------------------------
exports.testAssert = function(test){
    exec("node index.js -b http://localhost:8888 tests/test-files/assert.js",
            function(error, stdout, stderr){
                test.equals(
                    stdout,
                    [
                        "tests/test-files/assert.js".white.bold,
                        "✔ testAssert".white,
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
exports.testFilterProd = function(test){
    exec("node index.js -b http://localhost:8888 tests/test-files/sampleFilter.js -c '{\"filters\":{\"env\":\"prod\"}}'",
            function(error, stdout, stderr){
                test.equals(
                    stdout,
                    [
                        "tests/test-files/sampleFilter.js".white.bold,
                        "✔ testFilter".white,
                        "All tests have passed.".green.bold,
                        ""
                    ].join("\n")
                );  
                test.done();  
            }
    );
};

exports.testFilterStg = function(test){
    exec("node index.js -b http://localhost:8888 tests/test-files/sampleFilter.js -c '{\"filters\":{\"env\":\"stg\"}}'",
            function(error, stdout, stderr){
                test.equals(
                    stdout,
                    [
                        "tests/test-files/sampleFilter.js".white.bold,
                        "✔ testFilter".white,
                        "All tests have passed.".green.bold,
                        ""
                    ].join("\n")
                );  
                test.done();  
            }
    );
};

exports.testFilterLocal = function(test){
    exec("node index.js -b http://localhost:8888 tests/test-files/sampleFilter.js -c '{\"filters\":{\"env\":\"local\"}}'",
            function(error, stdout, stderr){
                test.equals(
                    stdout,
                    [
                        "tests/test-files/sampleFilter.js".white.bold,
                        "All tests have passed.".green.bold,
                        ""
                    ].join("\n")
                );  
                test.done();  
            }
    );
};

exports.testNoFilterMultipleTags = function(test){
    exec("node index.js -b http://localhost:8888 tests/test-files/sampleFilter.js -c '{\"filters\":{\"env\":\"prod\",\"role\":\"api\"}}'",
            function(error, stdout, stderr){
                test.equals(
                    stdout,
                    [
                        "tests/test-files/sampleFilter.js".white.bold,
                        "✔ testFilter".white,
                        "All tests have passed.".green.bold,
                        ""
                    ].join("\n")
                );  
                test.done();  
            }
    );
};

exports.testFilterMultipleTags = function(test){
    exec("node index.js -b http://localhost:8888 tests/test-files/sampleFilter.js -c '{\"filters\":{\"env\":\"local\",\"role\":\"api\"}}'",
            function(error, stdout, stderr){
                test.equals(
                    stdout,
                    [
                        "tests/test-files/sampleFilter.js".white.bold,
                        "All tests have passed.".green.bold,
                        ""
                    ].join("\n")
                );  
                test.done();  
            }
    );
};


exports.testFilterNoTags = function(test){
    exec("node index.js -b http://localhost:8888 tests/test-files/sampleFilter.js -c '{\"filters\":{\"env\":\"local\",\"role\":\"api\"}}'",
            function(error, stdout, stderr){
                test.equals(
                    stdout,
                    [
                        "tests/test-files/sampleFilter.js".white.bold,
                        "All tests have passed.".green.bold,
                        ""
                    ].join("\n")
                );  
                test.done();  
            }
    );
};

exports.testFilterFunctionTest = function(test){
    exec("node index.js -b http://localhost:8888 tests/test-files/sample.js -c '{\"filters\":{\"env\":\"local\",\"role\":\"api\"}}'",
            function(error, stdout, stderr){
                test.equals(
                    stdout,
                    [
                        "tests/test-files/sample.js".white.bold,
                        "All tests have passed.".green.bold,
                        ""
                    ].join("\n")
                );  
                test.done();  
            }
    );
};

exports.testSingleUrlConfiguration = function(test){
    exec("node index.js -c '{\"baseurl\":\"http://localhost:8888\"}' tests/test-files/simpleJSON.js",
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

exports.testUrlConfiguration = function(test){
    exec("node index.js -c '{\"baseurl\":{\"tomix\":\"http://localhost:8888\"}}' tests/test-files/simpleJSON.js",
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

exports.testNoDependency = function(test){
    exec("node index.js -c '{\"baseurl\":{\"google\":\"http://localhost:8888\"}}' tests/test-files/noDependencies.js",
            function(error, stdout, stderr){
                test.ok(
                    stdout.indexOf(
                        [
                            "tests/test-files/noDependencies.js".white.bold,
                            "✘ resolve dependencies".red,
                            "Error".red +" "+"Missing dependencies- [\"yahoo\"]".white,
                            ""
                        ].join("\n")
                    ) === 0
                );  
                test.done();  
            }
    );
};

exports.testFoundDependency = function(test){
    exec("node index.js -c '{\"baseurl\":{\"google\":\"http://localhost:8888\"}}' tests/test-files/foundDependencies.js",
            function(error, stdout, stderr){
                test.equals(
                    stdout,
                    [
                        "tests/test-files/foundDependencies.js".white.bold,
                        "✔ test".white,
                        "All tests have passed.".green.bold,
                        ""
                    ].join("\n")
                );  
                test.done();  
            }
    );
};

exports.testSimpleJSONWithConfigFile = function(test){
    exec("node index.js -b http://localhost:8888 tests/test-files/simpleJSON.js -f tests/test_config.json",
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

