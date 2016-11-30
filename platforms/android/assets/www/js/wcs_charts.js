var data_selector = {
  "Weapons" : 1,
  "Wildlife" : 2,
  "People": 3,
  "Hunting Camps": 4,
  "Elephants" : 5,
  "Logging" : 6,
  "Incidents" : 7,
  "All Obversations": 8
}

var markers = [];
var chart = null;

function null_check(val){
    if(val){
      return val;}
    else{
      return 'n/a';
    }
}

function clear_canvas(){
    if(chart){
        chart.destroy();
    }
    _.forEach(markers,function(marker){
        map.removeLayer(marker);
    });
    markers= [];
}

$('#submit-form').on('click',function(e){
    e.preventDefault();
    var data_type = data_selector[$('#dataType').val()];
    switch(data_type){
        case 1: weaponsGraph();break;
        case 2: wildlifeGraph();break;
        case 3: peopleGraph();break;
        case 4: huntingGraph();break;
        case 5: elephantGraph(); break;
        case 6: loggingGraph(); break;
        case 7: incidentsGraph(); break;
        case 8: allObservations(); break;
    }
})

$('#dataType').on('change',function(e){
    var data_type= data_selector[$('#dataType').val()];
    $('.data-aspect').hide();
    switch(data_type){
        case 1: $('.weaponsaspect').show(); break;
        case 2: $('.wildlifeaspect').show();break;
        case 3: $('.peopleaspect').show(); break;
        case 4: $('.hunteraspect').show();break;
        case 5: $('.elephantaspect').show();break;
        case 6: $('.loggingaspect').show(); break;
        case 7: $('.incidentsaspect').show();break;
        case 8: $('.observationaspect').show(); break;
    }
});

function allObservations(){
   var data_selector2 = {
        "By Categories":1
    }
    var data_aspect = data_selector2[$('#observationsSelect').val()];
    switch(data_aspect){
        case 1: observationGraph();break;
    }
}

function observationGraph(){
  var start_time = $("#startTime").val();
    var end_time = $("#endTime").val();
    if(start_time && end_time){
        start_time = moment(start_time,'MM/DD/YYYY').format('YYYY-MM-DD');
        end_time = moment(end_time,'MM/DD/YYYY').format('YYYY-MM-DD');
    }else{
        start_time="2005-01-01";
        end_time="2099-12-31";
    }
    $.get("https://16kq82glab.execute-api.us-east-1.amazonaws.com/prod/?start_date="+start_time+"%2000:00:00&end_date="+end_time+"%2011:59:59",function(data){
      var test_data = {};
      _.forEach(data.items, function(item){
        _.forEach(item["Observation Categories"],function(it){
          if(it in test_data){
            test_data[it] = test_data[it]+1;
          }else{
            test_data[it] = 0;
          }
        });
      });
      delete test_data[""];
      var marker_locations = [];
      if(chart){clear_canvas();}
      _.forEach(data.items,function(item){
          var marker = L.marker([
              parseFloat(item['X']),
              parseFloat(item['Y'])]).addTo(map);
          marker.bindPopup('Type of Patrol: '+item['Type']+'<br/>'+
              'Leader: '+null_check(item['Leader'])+'<br/>'+
               'Waypoint Date: '+item['Waypoint Date']+'<br/>'+
              'Waypoint ID: '+item['Waypoint ID']+'<br/>'+
              'Waypoint Time: '+ item["Waypoint Time"]);
          markers.push(marker);
          marker_locations.push([
              parseFloat(item['X']),
              parseFloat(item['Y'])]);
      });

      if(marker_locations.length > 0){
          map.fitBounds(marker_locations);
      }
      var ctx = document.getElementById("chart_1");
      
      chart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: _.keys(test_data),
              datasets: [{
                  label: '# of Observation By Type',
                  data: _.map(test_data,function(item){ return item;}),
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero:true
                      }
                  }]
              }
          }
    });
    });
    $('#graph_section').show();
}

function weaponsGraph(){
    var data_selector2 = {
        "Seizures by Time":1,
        "Type of Firearm": 2
    }
    var data_aspect = data_selector2[$('#weaponsSelect').val()];
    switch(data_aspect){
        case 1: weaponsSeizures();break;
        case 2: weaponsByType(); break;
    }
}

function weaponsSeizures(){
    var start_time = $("#startTime").val();
    var end_time = $("#endTime").val();
    if(start_time && end_time){
        start_time = moment(start_time,'MM/DD/YYYY').format('YYYY-MM-DD');
        end_time = moment(end_time,'MM/DD/YYYY').format('YYYY-MM-DD');
    }else{
        start_time="2005-01-01";
        end_time="2099-12-31";
    }
    // var weapons_data = storage.getItem("weaponslocal");
    // if(weapons_data){
    //   actual_graph_weapons(JSON.parse(weapons_data));
    // }else{
      $.get("https://16kq82glab.execute-api.us-east-1.amazonaws.com/prod/weapons?start_date="+start_time+"%2000:00:00&end_date="+end_time+"%2011:59:59",function(data){
        // storage.setItem("weaponslocal",JSON.stringify(data));
        actual_graph_weapons(data);
      });
    // }
    $('#graph_section').show();
}

function weaponsByType(){
    var start_time = $("#startTime").val();
    var end_time = $("#endTime").val();
    if(start_time && end_time){
        start_time = moment(start_time,'MM/DD/YYYY').format('YYYY-MM-DD');
        end_time = moment(end_time,'MM/DD/YYYY').format('YYYY-MM-DD');
    }else{
        start_time="2005-01-01";
        end_time="2099-12-31";
    }
    $.get("https://16kq82glab.execute-api.us-east-1.amazonaws.com/prod/weapons?start_date="+start_time+"%2000:00:00&end_date="+end_time+"%2011:59:59",function(data){
      var test_data = _.sortBy(data.items,function(item){ 
        return moment(item["Waypoint Date"],"MMM D,YYYY").unix();})
      test_data = _.groupBy(test_data, function(item){ return item["Waypoint Date"]; });
      var marker_locations = [];
       if(chart){clear_canvas();}
      _.forEach(data.items,function(item){
          var marker = L.marker([
              parseFloat(item['X']),
              parseFloat(item['Y'])]).addTo(map);
          marker.bindPopup('Source: '+item['Source']+'<br/>'+
              'Type of Equipment: '+null_check(item['Type of Equipment'])+'<br/>'+
              'Type of FireArm: '+null_check(item['Type of Firearm'])+'<br/>'+
              'Volume of Poison Liters: '+null_check(item['Volume of Poison liters'])+'<br/>'+
              'Waypoint Date: '+item['Waypoint Date']+'<br/>'+
              'Waypoint ID: '+item['Waypoint ID']+'<br/>'+
              'Waypoint Time: '+ item["Waypoint Time"]);
          markers.push(marker);
          marker_locations.push([
              parseFloat(item['X']),
              parseFloat(item['Y'])]);
      });

      if(marker_locations.length > 0){
          map.fitBounds(marker_locations);
      }
      var ctx = document.getElementById("chart_1");
     
      chart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: _.keys(test_data),
              datasets: [{
                  label: '# of Weapon Seizures',
                  data: _.map(test_data,function(item){ return item.length;}),
   								backgroundColor: 'rgba(54, 162, 235, 0.2)',
           				borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero:true
                      }
                  }]
              }
          }
    });
    });
    $('#graph_section').show();
}
function actual_graph_weapons(data){
  var test_data = _.sortBy(data.items,function(item){ 
        return moment(item["Waypoint Date"],"MMM D,YYYY").unix();})
      test_data = _.groupBy(test_data, function(item){ return item["Waypoint Date"]; });
      
    var marker_locations = [];
    if(chart){clear_canvas();}
    _.forEach(data.items,function(item){
        var marker = L.marker([
            parseFloat(item['X']),
            parseFloat(item['Y'])]).addTo(map);
        marker.bindPopup('Source: '+item['Source']+'<br/>'+
            'Type of Equipment: '+null_check(item['Type of Equipment'])+'<br/>'+
            'Type of FireArm: '+null_check(item['Type of Firearm'])+'<br/>'+
            'Volume of Poison Liters: '+null_check(item['Volume of Poison liters'])+'<br/>'+
            'Waypoint Date: '+item['Waypoint Date']+'<br/>'+
            'Waypoint ID: '+item['Waypoint ID']+'<br/>'+
            'Waypoint Time: '+ item["Waypoint Time"]);
        markers.push(marker);
        marker_locations.push([
            parseFloat(item['X']),
            parseFloat(item['Y'])]);
    });

    if(marker_locations.length > 0){
        map.fitBounds(marker_locations);
    }
    var ctx = document.getElementById("chart_1");
    
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: _.keys(test_data),
            datasets: [{
                label: '# of Weapon Seizures',
                data: _.map(test_data,function(item){ return item.length;}),
   								backgroundColor: 'rgba(54, 162, 235, 0.2)',
           				borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}


function wildlifeGraph(){
    var data_selector2 = {
        "Seizures by Time":1
    }
    var data_aspect = data_selector2[$('#weaponsSelect').val()];
    switch(data_aspect){
        case 1: wildlifeFunction();
    }
}

function wildlifeFunction(){
  var start_time = $("#seizureStartTime").val();
  var end_time = $("#seizureEndTime").val();
  if(start_time && end_time){
      start_time = moment(start_time,'MM/DD/YYYY').format('YYYY-MM-DD');
      end_time = moment(end_time,'MM/DD/YYYY').format('YYYY-MM-DD');
  }else{
      start_time="2005-01-01";
      end_time="2099-12-31";
  }
  $.get("https://16kq82glab.execute-api.us-east-1.amazonaws.com/prod/wildlives?start_date=2010-01-01%2000:00:00&end_date=2099-12-31%2023:59:59",function(data){
      var test_data = _.groupBy(data.items, function(item){ return item["Waypoint Date"]; });
      var markers = [];
      if(chart){clear_canvas();}
      _.forEach(data.items,function(item){
          var marker = L.marker([
              parseFloat(item['X']),
              parseFloat(item['Y'])]).addTo(map);
          marker.bindPopup('Source:'+item['Source']+'<br/>'+
              'Waypoint Date'+item['Waypoint Date']+'<br/>'+
              'Waypoint ID:'+item['Waypoint ID']+'<br/>'+
              'Waypoint Time:'+ item["Waypoint Time"]);
          markers.push([
              parseFloat(item['X']),
              parseFloat(item['Y'])]);
      });

      if(markers.length > 0){
          map.fitBounds(markers);
      }
      var ctx = document.getElementById("chart_1");
      chart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: _.keys(test_data),
              datasets: [{
                  label: '# of Wildlife',
                  data: _.map(test_data,function(item){ return item.length;}),
   								backgroundColor: 'rgba(54, 162, 235, 0.2)',
           				borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero:true
                      }
                  }]
              }
          }
      });
  });

  $('#graph_section').show();
}

function peopleGraph(){
    var data_selector2 = {
        "By Threat":1
    }
    var data_aspect = data_selector2[$('#peopleSelect').val()];
    switch(data_aspect){
        case 1: peopleByThreat(); break;
    }

}

function peopleByThreat(){
    var start_time = $("#startTime").val();
    var end_time = $("#endTime").val();
    if(start_time && end_time){
        start_time = moment(start_time,'MM/DD/YYYY').format('YYYY-MM-DD');
        end_time = moment(end_time,'MM/DD/YYYY').format('YYYY-MM-DD');
    }else{
        start_time="2005-01-01";
        end_time="2099-12-31";
    }
    $.get("https://16kq82glab.execute-api.us-east-1.amazonaws.com/prod/people?start_date="+start_time+"%2000:00:00&end_date="+end_time+"%2011:59:59",function(data){
        var test_data = _.groupBy(data.items, function(item){ return item["Threat"]; });
        var markers = [];
        if(chart){clear_canvas();}
        _.forEach(data.items,function(item){
            var marker = L.marker([
                parseFloat(item['X']),
                parseFloat(item['Y'])]).addTo(map);
            marker.bindPopup('Source: '+ item["Source"] + '<br/>'+
                'Threat: '+item['Threat']+'<br/>'+
                'Number of People: '+null_check(item['Number of People']));
            markers.push([
                parseFloat(item['X']),
                parseFloat(item['Y'])]);
        });

        if(markers.length > 0){
            map.fitBounds(markers);
        }
        var ctx = document.getElementById("chart_1");
        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: _.keys(test_data),
                datasets: [{
                    label: '# of People',
                    data: _.map(test_data,function(item){ return item.length;}),
										backgroundColor: [
			                'rgba(255, 102, 0, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
      			          'rgba(54, 162, 235, 0.2)',
            			    'rgba(255, 206, 86, 0.2)',
             				  'rgba(75, 192, 192, 0.2)',
                			'rgba(153, 102, 255, 0.2)',
                			'rgba(255, 102, 204, 0.2)',
                			'rgba(255, 204, 0, 0.2)',
                			'rgba(255, 204, 255, 0.2)',
                			'rgba(204, 255, 51, 0.2)',
                			'rgba(153, 204, 0, 0.2)',
                			'rgba(102, 0, 102, 0.2)',
                			'rgba(204, 0, 255, 0.2)',
                			'rgba(102, 102, 255, 0.2)',
                			'rgba(255, 159, 64, 0.2)'
            				],
            				borderColor: [
                			'rgba(255,102,0,1)',
                			'rgba(255,99,132,1)',
                			'rgba(54, 162, 235, 1)',
                			'rgba(255, 206, 86, 1)',
                			'rgba(75, 192, 192, 1)',
                			'rgba(153, 102, 255, 1)',
                			'rgba(255, 102, 204, 1)',
                			'rgba(255, 204, 0, 1)',
                			'rgba(255, 204, 255, 1)',
                			'rgba(204, 255, 51, 1)',
                			'rgba(153, 204, 0, 1)',
                			'rgba(102, 0, 102, 1)',
                			'rgba(204, 0, 255, 1)',
                			'rgba(102, 102, 255, 1)',
                			'rgba(255, 159, 64, 1)'
				            ],
                    borderWidth: 1
                }]
            },
            options: {}
        });
    });

  $('#graph_section').show();
}

function huntingGraph(){
  var data_selector2 = {
      "Seizures by Time":1
  }
  var data_aspect = data_selector2[$('#weaponsSelect').val()];
  switch(data_aspect){
      case 1: huntingByThing();
  }
}

function huntingByThing(){
  var start_time = $("#seizureStartTime").val();
  var end_time = $("#seizureEndTime").val();
  if(start_time && end_time){
      start_time = moment(start_time,'MM/DD/YYYY').format('YYYY-MM-DD');
      end_time = moment(end_time,'MM/DD/YYYY').format('YYYY-MM-DD');
  }else{
      start_time="2005-01-01";
      end_time="2099-12-31";
  }
  $.get("https://16kq82glab.execute-api.us-east-1.amazonaws.com/prod/camps?start_date=2010-01-01%2000:00:00&end_date=2099-12-31%2023:59:59",function(data){
      var test_data = _.groupBy(data.items, function(item){ return item["Waypoint Date"]; });
      var markers = [];
      clear_canvas();
      _.forEach(data.items,function(item){
          var marker = L.marker([
              parseFloat(item['X']),
              parseFloat(item['Y'])]).addTo(map);
          marker.bindPopup('Source:'+item['Source']+'<br/>'+
              'Camp Capacity:'+item['Camp Capacity']+'<br/>'+
              'Patrol Transport Type:'+item['Patrol Transport Type']+'<br/>'+
              'Observation Categories:'+item['Observation Categories']+'<br/>'+
              'Action Taken Camp:'+item['Action Taken Camp']+'<br/>'+
              'Waypoint Date'+item['Waypoint Date']+'<br/>'+
              'Waypoint ID:'+item['Waypoint ID']+'<br/>'+
              'Waypoint Time:'+ item["Waypoint Time"]);
          markers.push([
              parseFloat(item['X']),
              parseFloat(item['Y'])]);
      });

      if(markers.length > 0){
          map.fitBounds(markers);
      }

      var ctx = document.getElementById("chart_1");
      chart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: _.keys(test_data),
              datasets: [{
                  label: '# of Hunting Camps',
                  data: _.map(test_data,function(item){ return item.length;}),
   								backgroundColor: 'rgba(54, 162, 235, 0.2)',
           				borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero:true
                      }
                  }]
              }
          }
      });
  });

  $('#graph_section').show();
}

function elephantGraph(){
    var data_selector2 = {
        "Age of Animal":1,
        "Mandate": 2
    }
    var data_aspect = data_selector2[$('#elephantSelect').val()];
    switch(data_aspect){
        case 1: elephantsByAge(); break;
        case 2: elephantsByMandate(); break;
    }

}

function elephantsByAge(){
//    alert("in elephantsByAge")
  var start_time = $("#startTime").val();
  var end_time = $("#endTime").val();
  if(start_time && end_time){
      start_time = moment(start_time,'MM/DD/YYYY').format('YYYY-MM-DD');
      end_time = moment(end_time,'MM/DD/YYYY').format('YYYY-MM-DD');
  }else{
      start_time="2005-01-01";
      end_time="2099-12-31";
  }
  $.get("https://16kq82glab.execute-api.us-east-1.amazonaws.com/prod/elephants?start_date="+start_time+"%2000:00:00&end_date="+end_time+"%2011:59:59",function(data){
      var test_data = _.groupBy(data.items, function(item){ return item["Age of Animal"]; });
      var markers = [];

      clear_canvas();
      _.forEach(data.items,function(item){
          var marker = L.marker([
              parseFloat(item['X']),
              parseFloat(item['Y'])]).addTo(map);
          marker.bindPopup('Type:'+item['Type']+'<br/>'+
              'Mandate:'+item['Mandate']+'<br/>'+
              'Waypoint Date'+item['Waypoint Date']+'<br/>'+
              'Waypoint ID:'+item['Waypoint ID']+'<br/>'+
              'Waypoint Time:'+ item["Waypoint Time"]);
          markers.push([
              parseFloat(item['X']),
              parseFloat(item['Y'])]);
      });

      if(markers.length > 0){
          map.fitBounds(markers);
      }
      var ctx = document.getElementById("chart_1");
      chart = new Chart(ctx, {
          type: 'pie',
          data: {
              labels: _.keys(test_data),
              datasets: [{
                  label: 'Age of Animal',
                  data: _.map(test_data,function(item){ return item.length;}),
										backgroundColor: [
			                'rgba(255, 102, 0, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
      			          'rgba(54, 162, 235, 0.2)',
            			    'rgba(255, 206, 86, 0.2)',
             				  'rgba(75, 192, 192, 0.2)',
                			'rgba(153, 102, 255, 0.2)',
                			'rgba(255, 102, 204, 0.2)',
                			'rgba(255, 204, 0, 0.2)',
                			'rgba(255, 204, 255, 0.2)',
                			'rgba(204, 255, 51, 0.2)',
                			'rgba(153, 204, 0, 0.2)',
                			'rgba(102, 0, 102, 0.2)',
                			'rgba(204, 0, 255, 0.2)',
                			'rgba(102, 102, 255, 0.2)',
                			'rgba(255, 159, 64, 0.2)'
            				],
            				borderColor: [
                			'rgba(255,102,0,1)',
                			'rgba(255,99,132,1)',
                			'rgba(54, 162, 235, 1)',
                			'rgba(255, 206, 86, 1)',
                			'rgba(75, 192, 192, 1)',
                			'rgba(153, 102, 255, 1)',
                			'rgba(255, 102, 204, 1)',
                			'rgba(255, 204, 0, 1)',
                			'rgba(255, 204, 255, 1)',
                			'rgba(204, 255, 51, 1)',
                			'rgba(153, 204, 0, 1)',
                			'rgba(102, 0, 102, 1)',
                			'rgba(204, 0, 255, 1)',
                			'rgba(102, 102, 255, 1)',
                			'rgba(255, 159, 64, 1)'
				            ],
                  borderWidth: 1
              }]
          },
          options: {}
      });
  });
  $('#graph_section').show();
}


function elephantsByMandate(){
//    alert("in elephantsByMandate")
  var start_time = $("#startTime").val();
  var end_time = $("#endTime").val();
  if(start_time && end_time){
      start_time = moment(start_time,'MM/DD/YYYY').format('YYYY-MM-DD');
      end_time = moment(end_time,'MM/DD/YYYY').format('YYYY-MM-DD');
  }else{
      start_time="2005-01-01";
      end_time="2099-12-31";
  }
  $.get("https://16kq82glab.execute-api.us-east-1.amazonaws.com/prod/elephants?start_date="+start_time+"%2000:00:00&end_date="+end_time+"%2011:59:59",function(data){
      var test_data = _.groupBy(data.items, function(item){ return item["Mandate"]; });
      var markers = [];

      clear_canvas();
      _.forEach(data.items,function(item){
          var marker = L.marker([
              parseFloat(item['X']),
              parseFloat(item['Y'])]).addTo(map);
          marker.bindPopup('Type:'+item['Type']+'<br/>'+
              'Mandate:'+item['Mandate']+'<br/>'+
              'Waypoint Date'+item['Waypoint Date']+'<br/>'+
              'Waypoint ID:'+item['Waypoint ID']+'<br/>'+
              'Waypoint Time:'+ item["Waypoint Time"]);
          markers.push([
              parseFloat(item['X']),
              parseFloat(item['Y'])]);
      });

      if(markers.length > 0){
          map.fitBounds(markers);
      }
      var ctx = document.getElementById("chart_1");
      chart = new Chart(ctx, {
          type: 'pie',
          data: {
              labels: _.keys(test_data),
              datasets: [{
                  label: 'Age of Animal',
                  data: _.map(test_data,function(item){ return item.length;}),
										backgroundColor: [
			                'rgba(255, 102, 0, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
      			          'rgba(54, 162, 235, 0.2)',
            			    'rgba(255, 206, 86, 0.2)',
             				  'rgba(75, 192, 192, 0.2)',
                			'rgba(153, 102, 255, 0.2)',
                			'rgba(255, 102, 204, 0.2)',
                			'rgba(255, 204, 0, 0.2)',
                			'rgba(255, 204, 255, 0.2)',
                			'rgba(204, 255, 51, 0.2)',
                			'rgba(153, 204, 0, 0.2)',
                			'rgba(102, 0, 102, 0.2)',
                			'rgba(204, 0, 255, 0.2)',
                			'rgba(102, 102, 255, 0.2)',
                			'rgba(255, 159, 64, 0.2)'
            				],
            				borderColor: [
                			'rgba(255,102,0,1)',
                			'rgba(255,99,132,1)',
                			'rgba(54, 162, 235, 1)',
                			'rgba(255, 206, 86, 1)',
                			'rgba(75, 192, 192, 1)',
                			'rgba(153, 102, 255, 1)',
                			'rgba(255, 102, 204, 1)',
                			'rgba(255, 204, 0, 1)',
                			'rgba(255, 204, 255, 1)',
                			'rgba(204, 255, 51, 1)',
                			'rgba(153, 204, 0, 1)',
                			'rgba(102, 0, 102, 1)',
                			'rgba(204, 0, 255, 1)',
                			'rgba(102, 102, 255, 1)',
                			'rgba(255, 159, 64, 1)'
				            ],
                  borderWidth: 1
              }]
          },
          options: {}
      });
  });
  $('#graph_section').show();
}


function loggingGraph(){
  var data_selector2 = {
        "Logging Graph":1
    }
    var data_aspect = data_selector2[$('#loggingSelect').val()];
    switch(data_aspect){
        case 1: logging(); break;
    }
}

function logging(){
  $('#graph_section').hide();
  var start_time = $("#startTime").val();
  var end_time = $("#endTime").val();
  if(start_time && end_time){
      start_time = moment(start_time,'MM/DD/YYYY').format('YYYY-MM-DD');
      end_time = moment(end_time,'MM/DD/YYYY').format('YYYY-MM-DD');
  }else{
      start_time="2005-01-01";
      end_time="2099-12-31";
  }
  $.get("https://16kq82glab.execute-api.us-east-1.amazonaws.com/prod/loggings?start_date="+start_time+"%2000:00:00&end_date="+end_time+"%2011:59:59",function(data){
      var test_data = _.groupBy(data.items, function(item){ return item["Age of Animal"]; });
      var markers = [];

      clear_canvas();
      _.forEach(data.items,function(item){
          var marker = L.marker([
              parseFloat(item['X']),
              parseFloat(item['Y'])]).addTo(map);
          marker.bindPopup('Type:'+item['Type']+'<br/>'+
              'Mandate:'+item['Mandate']+'<br/>'+
              'Waypoint Date'+item['Waypoint Date']+'<br/>'+
              'Waypoint ID:'+item['Waypoint ID']+'<br/>'+
              'Waypoint Time:'+ item["Waypoint Time"]);
          markers.push([
              parseFloat(item['X']),
              parseFloat(item['Y'])]);
      });

      if(markers.length > 0){
          map.fitBounds(markers);
      }
      var ctx = document.getElementById("chart_1");
      chart = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: _.keys(test_data),
              datasets: [{
                  label: 'Time of Incident',
                  data: _.map(test_data,function(item){ return item.length;}),
   								backgroundColor: 'rgba(54, 162, 235, 0.2)',
           				borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero:true
                      }
                  }]
              }
          }
      });
  })
}

function incidentsByWeaponCount(){
//	  alert("in incidentsByWeaponCount")
    var start_time = $("#startTime").val();
    var end_time = $("#endTime").val();
    if(start_time && end_time){
        start_time = moment(start_time,'MM/DD/YYYY').format('YYYY-MM-DD');
        end_time = moment(end_time,'MM/DD/YYYY').format('YYYY-MM-DD');
    }else{
        start_time="2005-01-01";
        end_time="2099-12-31";
    }
    $.get("https://16kq82glab.execute-api.us-east-1.amazonaws.com/prod/incidents?start_date="+start_time+"%2000:00:00&end_date="+end_time+"%2011:59:59",function(data){
        var test_data = _.groupBy(data.items, function(item){ return item["Weapons"]; });
        var marker_locations = [];
        if(chart){clear_canvas();}
        _.forEach(data.items,function(item){
            var marker = L.marker([
                parseFloat(item['X']),
                parseFloat(item['Y'])]).addTo(map);
            marker.bindPopup('Source: '+item['Source']+'<br/>'+
                'Waypoint ID: '+item['Waypoint ID']+'<br/>'+
                'Waypoint Date: '+item['Waypoint Date']+'<br/>'+
                'Weapons: '+ item["Weapons"]);
            markers.push(marker);
            marker_locations.push([
                parseFloat(item['X']), 
                parseFloat(item['Y'])]);
        });

        if(marker_locations.length > 0){
            map.fitBounds(marker_locations);   
        }
        var ctx = document.getElementById("chart_1");
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: _.keys(test_data),
                datasets: [{
                    label: '# of Weapons per Incident',
                    data: _.map(test_data,function(item){ return item.length;}),
										backgroundColor: 'rgba(54, 162, 235, 0.2)',
            				borderColor: 'rgba(54, 162, 235, 1)',                                  
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
    })

  $('#graph_section').show();
}

function incidentsByWaypointDate(){
//	  alert("in incidentsByWeaponCount")
    var start_time = $("#startTime").val();
    var end_time = $("#endTime").val();
    if(start_time && end_time){
        start_time = moment(start_time,'MM/DD/YYYY').format('YYYY-MM-DD');
        end_time = moment(end_time,'MM/DD/YYYY').format('YYYY-MM-DD');
    }else{
        start_time="2005-01-01";
        end_time="2099-12-31";
    }
    $.get("https://16kq82glab.execute-api.us-east-1.amazonaws.com/prod/incidents?start_date="+start_time+"%2000:00:00&end_date="+end_time+"%2011:59:59",function(data){
        var test_data = _.sortBy(data.items,function(item){ 
          return moment(item["Waypoint Date"],"MMM DD,YYYY").unix();});
        test_data =  _.groupBy(test_data, function(item){ return item["Waypoint Date"]; });
        
        if(chart){clear_canvas();}
        var marker_locations = [];
        _.forEach(data.items,function(item){
            var marker = L.marker([
                parseFloat(item['X']),
                parseFloat(item['Y'])]).addTo(map);
            marker.bindPopup('Source: '+item['Source']+'<br/>'+
                'Waypoint ID: '+item['Waypoint ID']+'<br/>'+
                'Waypoint Date: '+item['Waypoint Date']+'<br/>'+
                'Weapons: '+ item["Weapons"]);
            markers.push(marker);
            marker_locations.push([
                parseFloat(item['X']), 
                parseFloat(item['Y'])]);
        });

        if(marker_locations.length > 0){
            map.fitBounds(marker_locations);
        }
        var ctx = document.getElementById("chart_1");
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: _.keys(test_data),
                datasets: [{
                    label: '# of Weapons per Incident',
                    data: _.map(test_data,function(item){ return item.length;}),
										backgroundColor: 'rgba(54, 162, 235, 0.2)',
            				borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
    })

  $('#graph_section').show();
}

function incidentsByThreat(){
//	  alert("in incidentsByThreat")
    var start_time = $("#startTime").val();
    var end_time = $("#endTime").val();
    if(start_time && end_time){
        start_time = moment(start_time,'MM/DD/YYYY').format('YYYY-MM-DD');
        end_time = moment(end_time,'MM/DD/YYYY').format('YYYY-MM-DD');
    }else{
        start_time="2005-01-01";
        end_time="2099-12-31";
    }
    $.get("https://16kq82glab.execute-api.us-east-1.amazonaws.com/prod/incidents?start_date="+start_time+"%2000:00:00&end_date="+end_time+"%2011:59:59",function(data){
        var test_data = _.groupBy(data.items, function(item){ return item["Threat"]; });
        var marker_locations = [];

        if(chart){clear_canvas();}
        _.forEach(data.items,function(item){
            var marker = L.marker([
                parseFloat(item['X']),
                parseFloat(item['Y'])]).addTo(map);
            marker.bindPopup('Source: '+item['Source']+'<br/>'+
                'Waypoint ID: '+item['Waypoint ID']+'<br/>'+
                'Waypoint Date: '+item['Waypoint Date']+'<br/>'+
                'Weapons: '+ item["Weapons"]);
            markers.push(marker);
            marker_locations.push([
                parseFloat(item['X']),
                parseFloat(item['Y'])]);
        });

        if(marker_locations.length > 0){
            map.fitBounds(marker_locations);
        }
        var ctx = document.getElementById("chart_1");
        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: _.keys(test_data),
                datasets: [{
                    label: 'Incidents By Threat',
                    data: _.map(test_data,function(item){ return item.length;}),
										backgroundColor: [
			                'rgba(255, 102, 0, 0.2)',
			                'rgba(255, 99, 132, 0.2)',
      			          'rgba(54, 162, 235, 0.2)',
            			    'rgba(255, 206, 86, 0.2)',
             				  'rgba(75, 192, 192, 0.2)',
                			'rgba(153, 102, 255, 0.2)',
                			'rgba(255, 102, 204, 0.2)',
                			'rgba(255, 204, 0, 0.2)',
                			'rgba(255, 204, 255, 0.2)',
                			'rgba(204, 255, 51, 0.2)',
                			'rgba(153, 204, 0, 0.2)',
                			'rgba(102, 0, 102, 0.2)',
                			'rgba(204, 0, 255, 0.2)',
                			'rgba(102, 102, 255, 0.2)',
                			'rgba(255, 159, 64, 0.2)'
            				],
            				borderColor: [
                			'rgba(255,102,0,1)',
                			'rgba(255,99,132,1)',
                			'rgba(54, 162, 235, 1)',
                			'rgba(255, 206, 86, 1)',
                			'rgba(75, 192, 192, 1)',
                			'rgba(153, 102, 255, 1)',
                			'rgba(255, 102, 204, 1)',
                			'rgba(255, 204, 0, 1)',
                			'rgba(255, 204, 255, 1)',
                			'rgba(204, 255, 51, 1)',
                			'rgba(153, 204, 0, 1)',
                			'rgba(102, 0, 102, 1)',
                			'rgba(204, 0, 255, 1)',
                			'rgba(102, 102, 255, 1)',
                			'rgba(255, 159, 64, 1)'
				            ],
                    borderWidth: 1
                }]
            },
            options: {}
        });
    })
}

function incidentsGraph(){
    var data_selector2 = {
        "Weapons":1,
        "Threat":2,
        "Waypoint Date": 3
    }
    var data_aspect = data_selector2[$('#incidentsSelect').val()];
    switch(data_aspect){
        case 1: incidentsByWeaponCount(); break;
        case 2: incidentsByThreat(); break;
        case 3: incidentsByWaypointDate(); break;
    }

}
