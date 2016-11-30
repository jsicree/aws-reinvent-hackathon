var https = require('https');

exports.handler = function(event, context){
    
    var incident = '';
    var weapon = '';
    var people = '';
    var wildlife = '';
    
    if(event.start_date === ""){
        context.done({"message": "start_date parameter is required."})
    }
    if(event.end_date === ""){
        context.done({"message": "end_date parameter is required."})
    }

    /* Get Incidents */
    var req = https.request({
        hostname: process.env.hostname,
        port: process.env.port,
        path: process.env.path + process.env.uuid_incident +"?format=csv&date_filter=waypointdate&start_date=" + event.start_date.replace(' ', '%20') + "&end_date=" + event.end_date.replace(' ', '%20'),
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + new Buffer(process.env.username + ':' + process.env.password).toString('base64')
        }
        },function(res){
            res.on('data', function(chunk){
                incident = incident + chunk;
            });
            res.on('end', function() {
//                console.log(incident);

                /* Get Weapons */
                var req2 = https.request({
                    hostname: process.env.hostname,
                    port: process.env.port,
                    path: process.env.path + process.env.uuid_weapon +"?format=csv&date_filter=waypointdate&start_date=" + event.start_date.replace(' ', '%20') + "&end_date=" + event.end_date.replace(' ', '%20'),
                    method: 'GET',
                    headers: {
                        'Authorization': 'Basic ' + new Buffer(process.env.username + ':' + process.env.password).toString('base64')
                    }
                    },function(res){
                        res.on('data', function(chunk){
                            weapon = weapon + chunk;
                        });
                        res.on('end', function() {
//                            console.log(weapon);
            
                            /* Get People */
                            var req3 = https.request({
                                hostname: process.env.hostname,
                                port: process.env.port,
                                path: process.env.path + process.env.uuid_people +"?format=csv&date_filter=waypointdate&start_date=" + event.start_date.replace(' ', '%20') + "&end_date=" + event.end_date.replace(' ', '%20'),
                                method: 'GET',
                                headers: {
                                    'Authorization': 'Basic ' + new Buffer(process.env.username + ':' + process.env.password).toString('base64')
                                }
                                },function(res){
                                    res.on('data', function(chunk){
                                        people = people + chunk;
                                    });
                                    res.on('end', function() {
//                                        console.log(people);
            
                                        /* Get Wildlife */
                                        var req4 = https.request({
                                            hostname: process.env.hostname,
                                            port: process.env.port,
                                            path: process.env.path + process.env.uuid_wildlife +"?format=csv&date_filter=waypointdate&start_date=" + event.start_date.replace(' ', '%20') + "&end_date=" + event.end_date.replace(' ', '%20'),
                                            method: 'GET',
                                            headers: {
                                                'Authorization': 'Basic ' + new Buffer(process.env.username + ':' + process.env.password).toString('base64')
                                            }
                                            },function(res){
                                                res.on('data', function(chunk){
                                                    wildlife = wildlife + chunk;
                                                });
                                                res.on('end', function() {
//                                                    console.log(wildlife);
                                                    context.done(null, incident2json(incident, weapon2json(weapon), people2json(people), wildlife2json(wildlife)));
                                               });
                                        });
                                        req4.on('error', function(e){
                                            console.log("Error" + JSON.stringify(e));
                                            context.done(e, event);
                                        });
                                        req4.end();
                                   });
                            });
                            req3.on('error', function(e){
                                console.log("Error" + JSON.stringify(e));
                                context.done(e, event);
                            });
                            req3.end();
                       });
                });
                req2.on('error', function(e){
                    console.log("Error" + JSON.stringify(e));
                    context.done(e, event);
                });
                req2.end();
           });
    });
    req.on('error', function(e){
        console.log("Error" + JSON.stringify(e));
        context.done(e, event);
    });
    req.end();
    
}

function incident2json(incident, weapon, people, wildlife){
    var converted = {"items": []};
    var lines = incident.split('"\n');
    if(lines.length > 0){
        for(var i = 1; i < (lines.length -1); i++){
            var values = lines[i].split("\",\"");
            converted.items[i-1] = {
                "Source": values[0].replace('"',''),
                "Waypoint ID": values[1],
                "Waypoint Date": values[2],
                "Waypoint Time": values[3],
                "X": values[4],
                "Y": values[5],
                "Comment": values[6],
                "Weapons": weapon[values[1]].length,
                "Number of People": people[values[1]] ? people[values[1]].Number: "N/A",
                "Threat": people[values[1]] ? people[values[1]].Threat: "N/A",
                "Wildlives": wildlife[values[1]] ? wildlife[values[1]]: []
            };
        }
    }
    
    return converted;
}


function weapon2json(weapon){
    var converted = {};
    var lines = weapon.split('"\n');
    if(lines.length > 0){
        for(var i = 1; i < (lines.length -1); i++){
            var values = lines[i].split("\",\"");
            
            
            if(!converted[values[1]]){
                converted[values[1]] = [];
            }
            converted[values[1]].push({
                "Source": values[0].replace('"',''),
                "Waypoint ID": values[1],
                //"Waypoint Date": values[2],
                //"Waypoint Time": values[3],
                //"X": values[4],
                //"Y": values[5],
                //"Comment": values[6],
                "Serial Number": values[7],
                "Type of Equipment": values[8],
                "Type of Firearm": values[9],
                "Volume of Poison liters": values[10],
                "Weight kg": values[11]
            });
        }
    }
    
    return converted;
}


function people2json(people){
    var converted = {};
    var lines = people.split('"\n');
    if(lines.length > 0){
        for(var i = 1; i < (lines.length -1); i++){
            var values = lines[i].split("\",\"");
            
            if(!converted[values[1]]){
                converted[values[1]] = {
                    "Waypoint ID": values[1],
                    "Number": values[7],
                    "Threat": values[8]
                };
            }
        }
    }
    
    return converted;
}

function wildlife2json(wildlife){
    var converted = {};
    var lines = wildlife.split('"\n');
    if(lines.length > 0){
        for(var i = 1; i < (lines.length -1); i++){
            var values = lines[i].split("\",\"");
            
             
            if(!converted[values[1]]){
                converted[values[1]] = [];
            }
            converted[values[1]].push({
                "Waypoint ID": values[1],
                "Age of Animal": values[7] !== "" ? values[7] : "N/A",
                "Age of Animal Carcass": values[8] !== "" ? values[8] : "N/A",
                "Age of Sign": values[9] !== "" ? values[9] : "N/A",
                "Species": values[11] !== "" ? values[11] : "N/A",
                "Threat": values[12] !== "" ? values[12] : "N/A"
            });
        }
    }

    return converted;
}