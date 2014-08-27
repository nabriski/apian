var colors          = require('colors');

module.exports = function(out){

    return {
        dump : function(){},

        onTestFile : function(fileName){
            out.write(fileName.white.bold+"\n");
        },

        onException: function(testName,err){

            out.write(("✘ "+testName).red+"\n");
            var msg = ["Error".red,err.message.white].join(" ");
            msg = msg.replace(String(err.expected),String(err.expected).yellow.bold);
            msg = msg.replace(String(err.actual),String(err.actual).yellow.bold);

            out.write(msg.white+"\n");
            out.write(err.stack.white+"\n");
            out.write("Failed".red+"\n");
        },

        onSuccess : function(testName){
            out.write(("✔ "+testName).white+"\n");
        },

        onFinishSuccess : function(){
            out.write("All tests have passed.".green.bold+"\n");
            this.dump();
        },

        onFinishFailure : function(){
            out.write("Some tests have failed.".red.bold+"\n");
            this.dump();
        }
   };
};
