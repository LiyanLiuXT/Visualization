var gridgridDeviceLocation={}; //???????????grid???????
var traceLine={}; //??????????????id
var screenWidth;//??????
var screenHeight;//??????
screenWidth=window.screen.width;
console.log("screenW",screenWidth);
screenHeight=window.screen.height;
//console.log(window.screen.width);
//console.log($(window).width());

var species = ["topic0","topic1", "topic2", "topic3","topic4"],  //topic???
    traits = ["topic0", "topic1", "topic2", "topic3","topic4"]; //??????

var m = [20, 10, 30, 40];
var w = screenWidth*0.3 - m[1] - m[3];
var h = 170 - m[0] - m[2];

var x = d3.scale.ordinal().domain(traits).rangePoints([0, w]),
    y = {};
var legendScale=d3.scale.ordinal().domain(species).range([0,1,2,3,4]);
var c = d3.scale.category10();
var showTraceId={};	
var lastshowTraceId={};
var showTraceNum={};
var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    foreground;
var parallel;	
    parallel=[{'id':'1','species':'topic3','topic0':'1.4','topic1':'2.5','topic2':'2.5','topic3':'5.5','topic4':'2.7'},
              {'id':'2','species':'topic1','topic0':'2.4','topic1':'3.5','topic2':'1.5','topic3':'2.5','topic4':'3.2'},
			  {'id':'3','species':'topic1','topic0':'4.4','topic1':'5.5','topic2':'4.5','topic3':'3.5','topic4':'1.9'},
			  {'id':'4','species':'topic2','topic0':'3.4','topic1':'1.5','topic2':'3.5','topic3':'1.5','topic4':'1.1'},
			  {'id':'5','species':'topic0','topic0':'4.5','topic1':'2.5','topic2':'1.5','topic3':'1','topic4':'2.3'},
			  {'id':'6','species':'topic4','topic0':'2.4','topic1':'1.5','topic2':'4.7','topic3':'3.3','topic4':'5.5'}];
/////////////////////////////////////////////////////////////////////
////////////////////drawParallel?????д???
parallel=[];
//drawParallel(parallel);
//////////////////////////////////////////////////////////////////////////////////
 function drawParallel(par,gridList){
	// Add foreground lines.
  //console.log(par);
  //????????grid???
  //console.log(gridList);
  gridgridDeviceLocation={};
  for(var s=0;s<gridList.length;s++){
	  var selectedGridgrid=gridList[s];
	  readGridgridDeviceLocationFile(selectedGridgrid);
  }
  //console.log(gridgridDeviceLocation);
  //??????????????
  d3.select('#parallelSVG').remove();
  var svg = d3.select("#parallel").append("svg:svg")
    .attr("id","parallelSVG")
    //.attr("width", w + m[1] + 10*m[3])
	.attr("width", screenWidth*0.65)
    .attr("height", h + m[0] + m[2])
    .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
  // Create a scale and brush for each trait.

    traits.forEach(function(d) {
    // Coerce values to numbers.
    //flowers.forEach(function(p) { p[d] = +p[d]; }); //?о????????????
    //console.log(flowers);
    y[d] = d3.scale.linear()
        //.domain([Math.min(1,d3.extent(parallel, function(p) { return p[d]; })[0]),Math.max(5,d3.extent(parallel, function(p) { return p[d]; })[1])])        
		.domain(d3.extent(par, function(p) { return p[d]; }))
		.range([h, 0]);
    
    y[d].brush = d3.svg.brush()
        .y(y[d])
        .on("brush", brush)
		.on("brushend",brushend);

 });

  // Add a legend.

  var legend = svg.selectAll("g.legend")
      .data(species)
      .enter().append("svg:g")
      .attr("class", "legend")
      .attr("transform", function(d, i) {return "translate(" + (w+20) +"," + (i * 20+m[2]) + ")"; })
	  .attr('stroke',function(d){ return c(legendScale(x(d)))});

  legend.append("svg:line")
      .attr("class", String)
      .attr("x2", 8);

  legend.append("svg:text")
      .attr("x", 12)
      .attr("dy", ".31em")
      .text(function(d) { return "" + d; });
  
  foreground = svg.append("svg:g")
      .attr("class", "foreground")
      .selectAll("path")
      .data(par)
      .enter().append("svg:path")
      .attr("d", path)
      .attr("class", function(d) { return d.species; })
	  .attr('stroke',function(d){ return c(legendScale(x(d.species)))});
	  
////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Add a group element for each trait.
  var g = svg.selectAll(".trait")
      .data(traits)
      .enter().append("svg:g")
      .attr("class", "trait")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

  // Add an axis and title.
  var axises=g.append("svg:g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
      .append("svg:text")
      .attr("text-anchor", "middle")
      .attr("y", -9)
      .text(String);

  // Add a brush for each axis.
  var brushExtend=g.append("svg:g")
      .attr("class", "brush")
      .each(function(d) { d3.select(this).call(y[d].brush);})
      .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
} 
	   

// Returns the path for a given data point.
function path(d) {
  return line(traits.map(function(p) { return [x(p), y[p](d[p])]; }));
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
  var actives = traits.filter(function(p) {  return !y[p].brush.empty(); }), //?ж????????????
      extents = actives.map(function(p) {  return y[p].brush.extent(); }); //????????????????Χ
  foreground.classed("fade", function(d) { 
  
	return !actives.every(function(p, i) { 
         
      //return extents[i][0] <= d[p] && d[p] <= extents[i][1];
	  if(extents[i][0] <= d[p] && d[p] <= extents[i][1]){
	  //console.log(d['id']);  
	  return true;
	  }
    });	
  });
   
}
function brushend() {
  //?????????????е?????????????
  for(devices in gridgridDeviceLocation){
	   var polyline  = L.polyline ({opacity:1}).addTo(map);
	   d3.select(polyline._container).select('.leaflet-clickable')
			  .attr('class',devices);
	   traceLine[devices]=polyline;
   }
  var actives = traits.filter(function(p) {  return !y[p].brush.empty(); }), //?ж????????????
      extents = actives.map(function(p) {  return y[p].brush.extent(); }); //????????????????Χ
  showTraceId={};
  showTraceNum={};
  foreground.classed("fade", function(d) { 
  showTraceNum[d['id']]=0;
	return !actives.every(function(p, i) { 	    
        if(extents[i][0] <= d[p] && d[p] <= extents[i][1]){
			var keyID=d['id'].toString();
		   showTraceId[keyID]=d['species'];
		   showTraceNum[keyID]=showTraceNum[keyID]+1;
	       return true;
	    }	
        else{
	       return false;
        }	  
    });	
  });
  
  for(key in showTraceNum){
	if(showTraceNum[key]!=actives.length){
		delete showTraceId[key];
	}
  }
  // console.log("showID  ");
  // console.log(showTraceId);
   //console.log("Lastshow  ");
  // console.log(lastshowTraceId);
   
   for(trace in lastshowTraceId){
	   var class1='.'+trace; 	   
	   if(showTraceId[trace]==undefined){
		   $(class1).css("display","none");
	   }
   } 
   
   lastshowTraceId={};
   for(traces in showTraceId){
	   lastshowTraceId[traces]=1;
	   var class1='.'+traces;
	  $(class1).css("display","inline");
	  $(".curves").css("display","none");//??????????
	   traceLine[traces].setStyle({color:'#F0F',weight:1,opacity:0.5,display:'inline'});
	   for(var i=0;i<gridgridDeviceLocation[traces].length;i++){
		   var longitude=gridgridDeviceLocation[traces][i][0];
		   var latitude=gridgridDeviceLocation[traces][i][1];
		   traceLine[traces].addLatLng([latitude, longitude]);
	   }
   }
 //polyline_one  = L.polyline ({opacity:1}).addTo(map);
 //polyline_one.addLatLng([30.26, 120.19]);
 //polyline_one.addLatLng([30.21, 120.192]);
 //map.removeLayer(polyline_one);
 if(isEmptyObject(showTraceId)){
	// alert(1);
	$(".curves").css("display","inline");
 }
}

function isEmptyObject(obj){
    for(var n in obj){
		return false;
		} 
    return true; 
}

function readGridgridDeviceLocationFile(grid){
	var hour=grid.split('_')[2];
	//2011_3017_00_trceLocation.json
	var filePath="./data/"+hour+"/"+grid+"_trceLocation.json";
	//console.log(filePath);
	$.getJSON(filePath,function(data){
        $.each(data,function(key,value){
			if(gridgridDeviceLocation[key]==undefined){
				gridgridDeviceLocation[key]=value;
			}			
		})
   }); 
}
