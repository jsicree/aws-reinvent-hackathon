var https = require('https');

exports.handler = function(event, context){
    
    var data = '';
    
    if(event.start_date === ""){
        context.done({"message": "start_date parameter is required."})
    }
    if(event.end_date === ""){
        context.done({"message": "end_date parameter is required."})
    }

    var req = https.request({
        hostname: process.env.hostname,
        port: process.env.port,
        path: process.env.path + process.env.uuid +"?format=csv&date_filter=waypointdate&start_date=" + event.start_date.replace(' ', '%20') + "&end_date=" + event.end_date.replace(' ', '%20'),
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + new Buffer(process.env.username + ':' + process.env.password).toString('base64')
        }
        },function(res){
            res.on('data', function(chunk){
                data = data + chunk;
            });
            res.on('end', function() {
                console.log(data);
                context.done(null, convert2json(data));
           });
    });
    req.on('error', function(e){
        console.log("Error" + JSON.stringify(e));
        context.done(e, event);
    });
    req.end();
    
}

function convert2json(csv){
    var converted = {"items": []};
    var lines = csv.split('"\n');
    console.log(lines[0]);
    if(lines.length > 0){
        for(var i = 1; i < (lines.length -1); i++){
            var values = lines[i].split("\",\"");
            converted.items[i-1] = {
                "Tile X ID": values[0].replace('"',''),
                "Tile Y ID": values[1],
                "Value": values[2]
           };
        }
    }
    
    return converted;
}