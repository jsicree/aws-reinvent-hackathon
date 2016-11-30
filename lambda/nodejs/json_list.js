var https = require('https');

exports.handler = function(event, context){

    var data = '';
    
    var uuid;
    if(event.category == "Weapon"){
        uuid = 	"2e7a7d85-1e83-4894-b996-1b55a68e7ba9";
    }
    
    var req = https.request({
        hostname: process.env.hostname,
        port: process.env.port,
        path: process.env.path,
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + new Buffer(process.env.username + ':' + process.env.password).toString('base64')
        }
        },function(res){
            res.on('data', function(chunk){
                data = data + chunk;
            });
            res.on('end', function() {
                context.done(null, JSON.parse(data));
                console.log(data);
           });
    });
    req.on('error', function(e){
        console.log("Error" + JSON.stringify(e));
        context.done(e, event);
    });
    req.end();
    
}