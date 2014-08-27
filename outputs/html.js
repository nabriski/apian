var ansi_up     = require('ansi_up'),
    str = "",
    outputter   = require("./line")({
        write : function(data){
            str +=data;
        }
    });

outputter.dump = function(){

    str = str.replace("✔","&#10004;");
    str = str.replace("✘","&#10008;");
    console.log("<pre style='background:#000;'>"+ansi_up.ansi_to_html(str)+"</pre>");
};

module.exports = outputter;
