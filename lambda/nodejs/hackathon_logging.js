var https = require('https');

exports.handler = function(event, context){
    
    var data = '';
    
    if(event.start_date === ""){
        context.done({"message": "start_date parameter is required."})
    }
    if(event.end_date === ""){
        context.done({"message": "end_date parameter is required."})
    }
    var format;
    if(event.format && event.format !== ""){
        format = event.format;
    }else{
        format = "csv"
    }

    var req = https.request({
        hostname: process.env.hostname,
        port: process.env.port,
        path: process.env.path + process.env.uuid +"?format="+ format + "&date_filter=waypointdate&start_date=" + event.start_date.replace(' ', '%20') + "&end_date=" + event.end_date.replace(' ', '%20'),
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
                if(format == "shp"){
                    context.done(null, {"shp": data});
                    
                }else{
                    context.done(null, convert2json(data));
                }
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
                "Patrol ID": values[0].replace('"',''),
                "Type": values[1],
                "Patrol Start Date": values[2],
                "Pastrol End Date": values[3],
                "Station": values[4],
                "Team": values[5],
                "Objective": values[6],
                "Mandate": values[7],
                "Armed": values[8],
                "Patrol Leg ID": values[9],
                "Leader": values[10],
                "Pilot": values[11],
                "Patrol Transport Type": values[12],
                "Waypoint ID": values[13],
                "Waypoint Date": values[14],
                "Waypoint Time": values[15],
                "X": values[16],
                "Y": values[17],
                "Comment": values[18],
                "Observation Categories": [ values[19], values[20], values[21], values[22]], 
                //"Action Taken Animals": values[23],
                //"Action Taken Camp": values[24],
                "Action Taken Items": values[25],
                //"Action Taken Live Animals": values[26],
                //"Action Taken People": values[27],
                //"Age of Animal": values[28],
                //"Age of Animal Carcass": values[29],
                "Age of Sign": values[30],
                //"Area Burned ha": values[31],
                //"Caliber": values[32],
                //"Camp Capacity": values[33],
                //"Camp Type": values[34],
                //"Cause of Death": values[35],
                //"Fruiting Status": values[36],
                //"Fruit or Nut Tree Species": values[37],
                //"Has Water": values[38],
                //"Infraction": values[39],
                //"Infrastructure Size": values[40],
                //"Is Active": values[41],
                //"Is Secured": values[42],
                //"Length of Net meters": values[43],
                //"Manufacturer": values[44],
                //"Mesh Size": values[45],
                //"Method of Administration": values[46],
                //"Name or Names": values[47],
                //"National ID Number": values[48],
                //"Number of Adult Females": values[49],
                //"Number of Adult Males": values[50],
                //"Number of Age or Sex Unknown": values[51],
                //"Number of bags": values[52],
                "Number of Bundles": values[53],
                //"Number of Domestice Animals": values[54],
                //"Number of Drying Racks": values[55],
                //"Number of People": values[56],
                //"Number of Planks": values[57],
                //"Number of Stumps": values[58],
                //"Number of Trophies": values[59],
                //"Number of weapons or gear": values[60],
                //"Number of Young": values[61],
                //"People Armed": values[62],
                //"Person Age": values[63],
                //"Phone Number": values[64],
                //"Place of Origin": values[65],
                //"Position Type": values[66],
                //"Quantity": values[67],
                //"Registration Number": values[68],
                //"Serial Number": values[69],
                //"Sex": values[70],
                //"Species": values[71],
                //"Stakes to Dry Meat": values[72],
                //"Status": values[73],
                //"Status of Bushmeat": values[74],
                "Threat": values[75],
                //"Timber Tree Species": values[76],
                "Trophy missing": values[77],
                "Type of Ammunition": values[78],
                //"Type of bushmeat": values[79],
                //"Type of Cutting Tool": values[80],
                //"Type of Domestic Animal": values[81],
                "Type of Equipment": values[82],
                //"Type of Firearm": values[83],
                //"Type of Fishing Equipment": values[84],
                //"Type of Forest Product": values[85],
                //"Type of Human Sign": values[86],
                //"Type of Infrastructure": values[87],
                //"Type of Poison": values[88],
                "Type of Pollution": values[89],
                //"Type of Rock or Mineral": values[90],
                //"Type of Salt Lick": values[91],
                //"Type of Traditional Weapon": values[92],
                //"Type of Transportation": values[93],
                //"Type of Trap": values[94],
                //"Type of Trophy": values[95],
                //"Units": values[96],
                //"Volumn of Cut Pieces m3": values[97],
                //"Volumn of Poison liters": values[98],
                "Weight kg": values[99]
            };
        }
    }
    
    return converted;
}