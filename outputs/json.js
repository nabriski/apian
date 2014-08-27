var json = {files :{}}, 
    curFile;

module.exports = {

    dump : function(){
        console.log(JSON.stringify(json,null,4));
    },

    onTestFile : function(fileName){
        json.files[fileName] = {};
        curFile = json.files[fileName];
    },

    onException: function(testName,err){
        err.name = testName;
        err.output = "failed";
        curFile[testName] = err; 
    },

    onSuccess : function(testName){
        curFile[testName] = {outcome:"success"}; 
    },

    onFinishSuccess : function(){
        json.outcome = "success";
        this.dump();
    },

    onFinishFailure : function(){
        json.outcome = "failure";
        this.dump();
    }
};
