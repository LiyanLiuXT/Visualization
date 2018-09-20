/*
在index_draw_09.js的基础上，修正合并gird的数据统计
*/
L.mapbox.accessToken = 'pk.eyJ1IjoiYW5rZXBldCIsImEiOiI3Y2VkZTU3Yjk2ZjQyM2IxNDQyYjc3YmE0NmVkYWY1MSJ9.VUaV0N0XEpC7olhY-Uij4A';

//var map = L.mapbox.map('map-styled', 'mapbox.streets');
//var map = L.mapbox.map('map-styled', 'mapbox.pirates');
//var map = L.mapbox.map('map-styled', 'mapbox.pencil');
//var map = L.mapbox.map('map-styled', 'delimited.ge9h4ffl');
//var map = L.mapbox.map('map-styled', 'zetter.i73ka9hn');
var map = L.mapbox.map('map-styled', 'mapbox.light')
        .setView([30.26, 120.19], 12);

map.doubleClickZoom.disable(); //禁用map的双击交互

var voronoi = d3.geom.voronoi()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });

var cell = d3.select(this),
        point = cell.datum();
		
//var map = new L.Map("map-styled", {center: [30.26, 120.19], zoom: 12})
// .addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
//划定杭州市范围
var  bottom=30.012  ;
var  up=30.4439 ;     
var  left=119.8691 ;  
var  right=120.461 ;
//计算各个参数，方便根据gridIndex计算经纬度
var bounds = [[29.1426, 118.2568], [29.157009,118.282453]];
var mapbounds=[[bottom,left],[top,right]];
var blockCount=100;
var wideRange=right-left;
var heightRange=up-bottom;
var wideDistance=wideRange/blockCount;
var heightDistance=heightRange/blockCount;

var points=new Array();
var links=new Array();
var linkNum=new Array(); //记录各个小时grid之间的轨迹数
var linkTopic=new Array(); //记录各个小时grid之间的交通流量与各个topic之间的相关度
var showDict=new Array();
var gridgridDeviceTopic={}; //记录各个小时grid之间各条具体轨迹与各个topic之间的相关度
var grid_grid_device_dict={}; //记录各个小时grid之间的轨迹数


readLinkFile();
//console.log(linkNum);
//readLinkTopicFile();
var traceNumFile='traceLocation_7451_6649_00_40.json'; //两个grid之间轨迹信息文件
var traceNumInfo=traceNumFile.split('.')[0]; 
var sourceGrid=traceNumInfo.split('_')[1]; //提取起点grid
var targetGrid=traceNumInfo.split('_')[2]; //提取终点grid


// $("#tSureID").click(function(){
//   drawGrids();
// });

function drawGrids(){
	points=[];
	d3.selectAll(".recangles").remove();
	//$(".leaflet-clickable").css("display","none");
  var aScale = d3.scale.linear() //透明度比例尺
      .domain([1, 4])
      .range([0.4, 1]);
  var foScale = d3.scale.linear() //fill透明度比例尺
      .domain([1, 4])
      .range([0.2, 0.5]);
  var lScale = d3.scale.linear() //边框粗细比例尺
      .domain([1, 4])
      .range([1, 4]);
    var hour = $("#time_picker").val();
    var first = hour.toString().slice(0,2);
    var last = hour.toString().slice(6,8);
    var time_one_new;
    if (last == "PM"){
        time_one_new =  parseInt(first,10) + 12;
        if (time_one_new == 24){
            time_one_new = 0;
            searchHour = "0".concat(time_one_new.toString())
        }
    }
    else{
        time_one_new = parseInt(first,10);
        searchHour = "0".concat(time_one_new.toString())
    }
  // var time_one=parseInt($("#time_one").val());
    var time_one=time_one_new;
  var time_two=parseInt(time_one_new)+1;
  // var hour="0".concat(time_one_new.toString());
  
  readGridgridDeviceTopicFile(searchHour);
  //console.log(gridgridDeviceTopic);
  
  $.getJSON("./data/keyGrids.json",function(data) {
      var count = 0;

      showDict = {};
      {
          var extendDict = new Array();
          var opacity = 1;
          var fillOpacity = 1;
          var zoom = map.getZoom();
          $.each(data, function (index, e) {
              var time = parseInt(e.slice(6, 8));
              if (time_one <= time && time < time_two) {
                  if (count < 20) {

                      var gridIndex = e.slice(0, 5);
                      //console.log(gridIndex);
                      if (extendDict[gridIndex] != null) {
                          higherGrid = extendDict[gridIndex];
                          subGrid = showDict[higherGrid].num;
                          showDict[higherGrid].num = showDict[higherGrid].num + 1;

                          showDict[higherGrid].subgrids.push(gridIndex);
                      }
                      else {
                          //如果grid没有被记录为其他grid的周围点，则说明该grid是第一次出现
                          gridsInfo = new Object();
                          subGridList = new Array();
                          gridsInfo.subgrids = subGridList;
                          gridsInfo.num = 1
                          showDict[gridIndex] = gridsInfo;
                          showDict[gridIndex].subgrids.push(gridIndex);

                          var neiIndex;
                          //记录该第一次出现的grid点的周围gridIndex
                          if (zoom > 12) {
                              if (extendDict[gridIndex] == null) {
                                  for (var k = 99; k < 102; k++)
                                      neiIndex = neighbor(gridIndex, k);
                                  extendDict[neiIndex] = gridIndex;
                              }
                              neiIndex = neighbor(gridIndex, -1);
                              extendDict[neiIndex] = gridIndex;
                              neiIndex = neighbor(gridIndex, 1);
                              extendDict[neiIndex] = gridIndex;
                              for (var k = -101; k < -98; k++) {
                                  neiIndex = neighbor(gridIndex, k);
                                  extendDict[neiIndex] = gridIndex;
                              }

                          }//if结尾

                          ////////////////////////////////////////////////////////////////////////////////////////
                          //如果zoom<12，则将范围扩大为16
                          else {
                              //alert(1)
                              if (extendDict[gridIndex] == null) {
                                  for (var k = 198; k < 203; k++) {
                                      neiIndex = neighbor(gridIndex, k);
                                      extendDict[neiIndex] = gridIndex;
                                  }
                                  for (var k = 98; k < 103; k++) {
                                      neiIndex = neighbor(gridIndex, k);
                                      extendDict[neiIndex] = gridIndex;
                                  }
                                  neiIndex = neighbor(gridIndex, -2);
                                  extendDict[neiIndex] = gridIndex;
                                  neiIndex = neighbor(gridIndex, -1);
                                  extendDict[neiIndex] = gridIndex;
                                  neiIndex = neighbor(gridIndex, 1);
                                  extendDict[neiIndex] = gridIndex;
                                  neiIndex = neighbor(gridIndex, 2);
                                  extendDict[neiIndex] = gridIndex;
                                  for (var k = -102; k < -97; k++) {
                                      neiIndex = neighbor(gridIndex, k);
                                      extendDict[neiIndex] = gridIndex;
                                  }
                                  for (var k = -202; k < -197; k++) {
                                      neiIndex = neighbor(gridIndex, k);
                                      extendDict[neiIndex] = gridIndex;
                                  }
                              }
                          }//else结尾
                      }
                      count++;
                  }
              }
          });
          //将需要显示的grid显示在地图上
          var gridCount = 0;
          for (var key in showDict) {
              var grid_index = parseInt(key)
              var i = parseInt(grid_index / blockCount);
              var j = grid_index % blockCount;
              var mergerNum = showDict[key].num;
              //var larger=0.5*(1-Math.sqrt(mergerNum)/mergerNum);
              //console.log(zoom+","+key+","+mergerNum)
              var larger = 0.2 * Math.log(mergerNum, 1.5);
              var bound = [[bottom + (i - larger) * heightDistance, left + (j - larger) * wideDistance], [bottom + (i + 1 + larger) * heightDistance, left + (j + 1 + larger) * wideDistance]];
              color = '#FF216C'
              /*if(zoom>12){
                opacity=0.4;
              }
              else{
                opacity=0.8;
              }*/
              opacity = aScale(mergerNum);
              fillOpacity = foScale(mergerNum);

              var rec = L.rectangle(bound, {
                  color: color,
                  opacity: opacity,
                  weight: mergerNum,
                  fillOpacity: fillOpacity
              }).addTo(map);
              d3.select(rec._container).select('.leaflet-clickable')
                  .attr('id', key)
                  .attr('class', 'recangles');
              //console.log(rec._container);

              //构建points列表
              var location = new Array();
              location["latitude"] = bottom + (i + 0.5) * heightDistance;
              location["longitude"] = left + (j + 0.5) * wideDistance;
              location["index"] = gridCount
              location["gridIndex"] = grid_index
              location["starttime"] = time_one
              location["endtime"] = time_two
              points.push(location);
              gridCount = gridCount + 1;
          }
          draw();
      }
  });
$(".leaflet-clickable").css("display","none");
}

function neighbor(grid,num){
  gridInt=parseInt(grid);
  n_grid=gridInt+num;
  str_grid=string_transfer(n_grid,5)
  return str_grid
}

function string_transfer(str,count){
  str=str.toString(10);//转为10进制、16进制
  if(str.length<count){
    var x=count-str.length;
    var addStr='';
    for(var i=0;i<x;i++){
      addStr=addStr+'0';
      }
    str=addStr+str;
    }
    return str;
}
/////////////////////////////////////////////////////////清除图上的线、图//////////////////////////////////////////////
/*$("#clearID").click(function(){
  points=[]
  draw();
  $(".recangles").css("display","none");
  //var count=0;
  //map.eachLayer(function(layer) {
    //alert(count)
    //if(count!=0){
      //map.removeLayer(layer);
    //}
    //count++;
  //}); 
  //$(".leaflet-clickable").css("display","none");
  //$(".curves").css("display","none");
  //$(".leaflet-zoom-animated").css("display","none");
});*/
//latitude 纬度
/*var points=[
  {"latitude": 30.26, "longitude": 120.33},
  {"latitude": 30.267, "longitude": 120.13},
  {"latitude": 30.36, "longitude": 120.21}
]*/
 

function drawWithLoading(e){
    if (e && e.type == 'viewreset') {
	  drawGrids();
      d3.select('#overlay').remove();
    }
    setTimeout(function(){
		//drawGrids();
        draw();
    }, 0);
  }

function draw() {
	//console.log(linkNum);
    d3.select('#overlay').remove();
	
    //drawGrids();
    var bounds = map.getBounds(),
        topLeft = map.latLngToLayerPoint(bounds.getNorthWest()),
        bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

    filteredPoints = points.filter(function(d) {
      var latlng = new L.LatLng(d.latitude, d.longitude);

      var point = map.latLngToLayerPoint(latlng);

      d.x = point.x;
      d.y = point.y;
      d[0]=point.x;
      d[1]=point.y;
      return true;
    });
    //console.log(filteredPoints)
    links=[];

    voronoi(filteredPoints).forEach(function(d) { d.point.cell = d; });
    ///////////////////////////////////////////////////////////////////////////////////////////
    //voronio连接
    d3.geom.voronoi().links(filteredPoints).forEach(function(link) {
    var dx = link.source.x - link.target.x,
        dy = link.source.y - link.target.y;
    link.distance = Math.sqrt(dx * dx + dy * dy);
    links.push(link);
  });
    //links=d3.geom.voronoi().links(filteredPoints);
    //console.log(d3.geom.voronoi().triangles(filteredPoints).forEach(function(d) { return d.point.cell; }));
    //console.log(links);
    ///////////////////////////////////////////////////////////////////////////////////////////

    var svg = d3.select(map.getPanes().overlayPane).append("svg")
      .attr('id', 'overlay')
      .attr("class", "leaflet-zoom-hide")
      .style("width", map.getSize().x + 'px')
      .style("height", map.getSize().y + 'px')
      .style("margin-left", topLeft.x + "px")
      .style("margin-top", topLeft.y + "px");

    var g = svg.append("g")
      .attr("transform", "translate(" + (-topLeft.x) + "," + (-topLeft.y) + ")");

    var svgPoints = g.attr("class", "points")
      .selectAll("g")
        .data(filteredPoints)
      .enter().append("g")
        .attr("class", "point");

    var buildPathFromPoint = function(point) {
      return "M" + point.cell.join("L") + "Z";
    }

    svgPoints.append("path")
      .attr("class", "point-cell")
      .attr("d", buildPathFromPoint)

   /* svgPoints.append("circle")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .style('fill', "#00F" )
      .attr("r", 1);*/
	  
	  

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//画连线
var svgLines = g.attr("class", "lines")
      .selectAll("g")
      .data(links)
      .enter().append("g")
      .attr("class", "line");

var defs = svgLines.append("defs");
var wScale = d3.scale.linear()
      .domain([0, 13])
      .range([0, 5]);

//var c=1;
for (var i=0; i<links.length;i++){
      var start=links[i]["source"]["gridIndex"];
      var end=links[i]["target"]["gridIndex"];
      var hour=links[i]["source"]["starttime"];
      ////////////////////////////////////////////////////////////////////////////////////////
      var start_grid=string_transfer(start,5);
      var end_grid=string_transfer(end,5);
      var start_grid_num=showDict[start_grid].num;
      var end_grid_num=showDict[end_grid].num;
      var lineWidth=0;
	  grid_grid_device_dict={};

      for(var m=0; m<start_grid_num;m++){
        for(var n=0;n<end_grid_num;n++){
          var sgrid=parseInt(showDict[start_grid].subgrids[m]);
          var egrid=parseInt(showDict[end_grid].subgrids[n]);
          var grid_grid=string_transfer(sgrid,4)+"_"+string_transfer(egrid,4)+"_"+string_transfer(hour,2);
		  
          /*if(linkNum[grid_grid]!=null){
              lineWidth=lineWidth+linkNum[grid_grid];
          } *///单纯地将两个grid统计得到的轨迹数相加，是错误的，因为轨迹会重复，因此应该对deviceID进行核对
		  ///////////////////////////////////////////////////////////////////////
          if(gridgridDeviceTopic[grid_grid]!=null){
			  //console.log(gridgridDeviceTopic[grid_grid]);
				for (var p=0;p<gridgridDeviceTopic[grid_grid].length;p++){
					var device=gridgridDeviceTopic[grid_grid][p].id;					
					grid_grid_device_dict[device]=1;
				}
			}	
           //////////////////////////////////////////////////////////////////////////			
          }
      }
	  for(key in grid_grid_device_dict){		  
		  lineWidth=lineWidth+1;
	  }
	  //console.log(lineWidth);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      var gridInfo=string_transfer(start,4)+"_"+string_transfer(end,4)+"_"+string_transfer(hour,2);
      //console.log(gridInfo+', '+linkNum[gridInfo]+', '+start_grid+', '+showDict[start_grid].num)
      var rScale = d3.scale.linear()
      .domain([0, 13])
      .range([0.5, 0.75]);

      var oScale = d3.scale.linear()
      .domain([0, 13])
      .range([0.1, 0.6]);

      //if(linkNum[gridInfo]!=null){ //原先是根据两个grid之间有没有轨迹来判断，现在因为有grid合并的情况，需要修改

    if(lineWidth>0){
      ///////////////////////////////////////////////////////////////箭头美化////////////////////////////////////////////////
	  //var lineWidth=wScale(Math.sqrt(linkNum[gridInfo]));
      var trueLineWidth=wScale(Math.sqrt(lineWidth));
      var traceNum=lineWidth;
	  //console.log(gridInfo+" "+traceNum);
      lineWidth=wScale(Math.sqrt(lineWidth));
      if(lineWidth>10){
        lineWidth=10;
      }
      var x1=links[i]["source"]["x"],
          y1=links[i]["source"]["y"],
          x2=links[i]["target"]["x"],
          y2=links[i]["target"]["y"];
      var dx=Math.abs(x1-x2);
      var dy=Math.abs(y1-y2);
      var midx=(x1+x2)/2;
      var midy=(y1+y2)/2;
      var curve_path;
      var dis=Math.sqrt(links[i].distance)*0.7;
      if(links[i].distance<300){
        dis=Math.sqrt(links[i].distance)*0.9;
      }

      var deta1,deta2;
          deta1=dx/dis;
          deta2=dy/dis;
      if(deta1!=0&&deta2!=0){
			   var k=(y1-y2)/(x1-x2);
			   if(k<0){
			   	  x1=x1-((x1-x2)/dx)*deta1;
			   	  x2=x2+((x1-x2)/dx)*(deta1+lineWidth+1);
			   	  y1=y1-((y1-y2)/dy)*(deta2+lineWidth+1);
			   	  y2=y2+((y1-y2)/dy)*deta2;
			   }
			   else{
			   	  x1=x1-((x1-x2)/dx)*(deta1+lineWidth+1);
			   	  x2=x2+((x1-x2)/dx)*deta1;
			   	  y1=y1-((y1-y2)/dy)*deta2;
			   	  y2=y2+((y1-y2)/dy)*(deta2+lineWidth+1);
			   }          
      }
	  if(dx<0.1){
		  if(y1>y2){
			 x1=x1-(deta1+lineWidth/2+1); 
			 x2=x2-(deta1+lineWidth/2+1);
		  }
		  else{
			 x1=x1+(deta1+lineWidth/2+1); 
			 x2=x2+(deta1+lineWidth/2+1);
		  }
		  y1=y1-((y1-y2)/dy)*(deta2+lineWidth+1);		  
		  y2=y2+((y1-y2)/dy)*(deta2+lineWidth+1);
	  }
	  if(dy<0.1){
		  if(x1>x2){
			  y1=y1+(deta2+lineWidth/2+1);
			  y2=y2+(deta2+lineWidth/2+1);
		  }
		  else{
			  y1=y1-(deta2+lineWidth/2+1);
		      y2=y2-(deta2+lineWidth/2+1);
		  }
		  x1=x1-((x1-x2)/dx)*(deta1+lineWidth+1);
		  x2=x2+((x1-x2)/dx)*(deta1+lineWidth+1);
		   
	  }
	  var moveLenth=dis;
	  //console.log(moveLenth);
	  if(links[i].distance<100){
          moveLenth=0;
        }
	  curve_path = "M"+x1.toString()+","+y1.toString()+" "+"Q"+((x1+x2)/2).toString()+" "+
                 ((y1+y2)/2-moveLenth).toString()+" "+x2.toString()+" "+y2.toString();

    ///////////////////////////////////////////////////////////////颜色编码//////////////////////////////////////
        var beta=rScale(trueLineWidth);
        var lineOpacity=oScale(trueLineWidth);

        var color_RGB=new Array(3);
        color_RGB=HSL_to_RGB(beta).concat();
        var color='#';
        var R=parseInt(color_RGB[0]*255);
        var G=parseInt(color_RGB[1]*255);
        var B=parseInt(color_RGB[2]*255);
        R=string_transfer16(R,2);
        G=string_transfer16(G,2);
        B=string_transfer16(B,2);
        color=color+R+G+B;
    /////////////////////////////////////////////////////////////////颜色编码结束////////////////////////////////////
     
    var mWidth=(10+lineWidth).toString();
    var mHeight=((10+lineWidth*2)/2).toString();
	
	  var arrowMarker = defs.append("marker")
            .attr("id",function(){return "marker-"+i.toString()})
            .attr("markerUnits","userSpaceOnUse")//strokeWidth   userSpaceOnUse
            //.attr("markerWidth","10")
            .attr("markerWidth",mWidth)
            //.attr("markerHeight","5")
            .attr("markerHeight",mHeight)
            //.attr("viewBox","0 -5 10 5") 
            .attr("viewBox","0 -"+mHeight+" "+mWidth+" "+mWidth)//.attr("viewBox","0 -"+mHeight+" "+mWidth+" "+mHeight)
            //.attr("refX","10")
            .attr("refX",mWidth)
            .attr("refY",(lineWidth/2).toString())
			//.attr("refY",lineWidth)
            .attr("orient","auto");

	  //var arrow_path = "M0,-"+mHeight+" L"+mWidth+",0 "+"L"+mWidth+","+lineWidth+" L0,0";
	  var arrow_path = "M0,-"+mHeight+" L"+mWidth+",0 "+"L"+mWidth+","+lineWidth+" L0,"+lineWidth; 

        arrowMarker.append("path")
        .attr("d",arrow_path)
        .attr("fill",color);

    var tcircle=svgPoints.append("circle")
                  .attr("class","topicCircle")                  
                  .on("click",function(e){
                    alert(1);
                  });

    //svgPoints.call(tip);
     var curveID=gridInfo+"-"+traceNum.toString();
     var curve = svgLines.append("path")
      .attr("class", "curves")
      .attr("id",curveID)
      .attr("d",curve_path)
      .attr("fill","none")
      .attr("stroke",color)
      .attr("stroke-width",lineWidth)
      .attr("stroke-opacity",lineOpacity)
	    .attr("marker-end",function(){return "url(#marker-"+i.toString()+")"})
      
      .on('mouseover',function(e){
		//**************************************************************//
        //             添加对应轨迹的topic相关度glyph                   //                     
        //**************************************************************//
		        var traceID=$(this).attr('id');
		        grids=$(this).attr('id').split('-')[0];
			    var numb=parseInt($(this).attr('id').split("-")[1]);
				//console.log(grids);
				
				var color = d3.scale.category10();
				var linkTopicInfo=[];//用于显示aster饼图
				var parallelTopicInfo=[];//用于parallel显示
				var grid_grid_list=[];//用于记录所有的grid，包括合并的grid
				var grid_grid_device={}; //用于记录grid之间的deviceID
			    
				var start1=grids.split('_')[0];
			    var end1=grids.split('_')[1];
				var hour1=grids.split('_')[2];
				var start_grid1=string_transfer(start1,5);
				var end_grid1=string_transfer(end1,5);
				var start_grid_num1=showDict[start_grid1].num;
				var end_grid_num1=showDict[end_grid1].num;
				
				///////////////////////////////////////////////////////////////
				//将起始grid与目标grid用不同的颜色标示显示,将其他grid显示为灰色
				//$(".leaflet-clickable").css("diaplay","none");//灰色显示
				//$(".recangles").css("display","none");
				$(".recangles").css({"color":"#999","stroke":"#999","fill":"#999"});
				$("#"+start_grid1).css({"color":"#FF216C","stroke":"#FF216C","fill":"#FF216C","fillOpacity":0.6});//sourceGrid
				$("#"+end_grid1).css({"color":"#08c","stroke":"#08c","fill":"#08c","fillOpacity":0.6});//targetGrid
				//$(".curves").css("display","none");
				//$("#"+traceID).css({"display":"block","stroke-opacity":"1"});
				//console.log($("#"+traceID));
				
				/////////////////////////////////////////////////////////////////

				
				for(var i=0;i<5;i++){
					var newTopicdic={}; //生成一个字典，用于记录各个0到4一共5个topic的各个属性值，最后再当作参数传入函数
					var str='topic'+i.toString();
					newTopicdic.label=str;
					newTopicdic.score=0;
					//newTopicdic.width=0;
					newTopicdic.num=0;
					//newTopicdic.topicSum=0;
					newTopicdic.colorIndex=i;
					linkTopicInfo.push(newTopicdic)
				}
				var topicSum=0;

				for(var m=0; m<start_grid_num1;m++){
					for(var n=0;n<end_grid_num1;n++){
						var sgrid=parseInt(showDict[start_grid1].subgrids[m]);
						var egrid=parseInt(showDict[end_grid1].subgrids[n]);
						var grid_grid=string_transfer(sgrid,4)+"_"+string_transfer(egrid,4)+"_"+string_transfer(hour1,2);
						grid_grid_list.push(grid_grid);
						//console.log(grid_grid);
						/*if(linkTopic[grid_grid]!=null){
							//console.log(grid_grid);
							for(var s=0; s<linkTopic[grid_grid].length;s++){
								for(var t=0;t<linkTopicInfo.length;t++){
									if(linkTopic[grid_grid][s].label==linkTopicInfo[t].label){
										linkTopicInfo[t].score=linkTopicInfo[t].score+linkTopic[grid_grid][s].score;										
										linkTopicInfo[t].num=linkTopicInfo[t].num+linkTopic[grid_grid][s].num;	
										linkTopicInfo[t].topicSum=linkTopicInfo[t].topicSum+linkTopic[grid_grid][s].topicSum;
										linkTopicInfo[t].width=linkTopicInfo[t].score/linkTopic[grid_grid][s].topicSum;										
									}
								}
							}
							
						}*/
						//添加parallelTopicInfo信息
						if(gridgridDeviceTopic[grid_grid]!=null){
							for (var p=0;p<gridgridDeviceTopic[grid_grid].length;p++){
								parallelTopicInfo.push(gridgridDeviceTopic[grid_grid][p]);
								//合并的grid有时候会出现重复的轨迹，因此需要剔除
								var device=gridgridDeviceTopic[grid_grid][p].id;
								var topic0=gridgridDeviceTopic[grid_grid][p].topic0;
								if(grid_grid_device[device]==undefined){
									grid_grid_device[device]=1;
									for(k in gridgridDeviceTopic[grid_grid][p]){
										if(k!="species"&&k!="id"){
											topicSum=topicSum+gridgridDeviceTopic[grid_grid][p][k];
											for(var t=0;t<linkTopicInfo.length;t++){
												if(linkTopicInfo[t].label==k){
													linkTopicInfo[t].score=linkTopicInfo[t].score+gridgridDeviceTopic[grid_grid][p][k];
													linkTopicInfo[t].num=linkTopicInfo[t].num+1;
												}
											}
										}
									}
									
								}
								///////////////////////////////////////////////
								
							}
						}													
					}
				}
				//合并的grid有时候会出现重复的轨迹，因此需要剔除，topicSum和width的计算需要在这里
				/*for(var t=0;t<linkTopicInfo.length;t++){
					linkTopicInfo[t].topicSum=topicSum;
					linkTopicInfo[t].width=linkTopicInfo[t].score/topicSum;
				}*/

				//console.log(linkTopicInfo);
			    //console.log(grids+' '+linkTopicInfo[0].num);
			   //drawAster(linkTopic[grids],numb);  //传入的是未进行合并的grid结果
               drawAster(linkTopicInfo,linkTopicInfo[0].num);

		//**************************************************************//
        //             添加对应轨迹的topic相关度平行坐标系              //                     
        //**************************************************************//	   
			  /* parallel=[{'id':'1','species':'topic3','topic0':'1.4','topic1':'2.5','topic2':'2.5','topic3':'5.5','topic4':'2.7'},
              {'id':'2','species':'topic1','topic0':'2.4','topic1':'3.5','topic2':'1.5','topic3':'2.5','topic4':'3.2'},
			  {'id':'3','species':'topic1','topic0':'4.4','topic1':'5.5','topic2':'4.5','topic3':'3.5','topic4':'1.9'},
			  {'id':'4','species':'topic2','topic0':'3.4','topic1':'1.5','topic2':'3.5','topic3':'1.5','topic4':'1.1'},
			  {'id':'5','species':'topic0','topic0':'4.5','topic1':'2.5','topic2':'1.5','topic3':'1','topic4':'2.3'},
			  {'id':'6','species':'topic4','topic0':'2.4','topic1':'1.5','topic2':'4.7','topic3':'3.3','topic4':'5.5'}];*/
			 // parallel=[];
			 // parallel=gridgridDeviceTopic[grids];
              //console.log(grid_grid_list);
			  		  
			  drawParallel(parallelTopicInfo,grid_grid_list);
			  
      });
      
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var defs_01 = svgLines.append("defs");
for (var i=0; i<links.length;i++){
      ////////////////////////////////for循环中箭头修改//////////////////
      var start=links[i]["target"]["gridIndex"];
      var end=links[i]["source"]["gridIndex"];
      var hour=links[i]["target"]["starttime"];
	  /////////////////////////////////////////////////////////////////////////////////////
	  var start_grid=string_transfer(start,5);
      var end_grid=string_transfer(end,5);
      var start_grid_num=showDict[start_grid].num;
      var end_grid_num=showDict[end_grid].num;
      var lineWidth=0;
	  grid_grid_device_dict={};

      for(var m=0; m<start_grid_num;m++){
        for(var n=0;n<end_grid_num;n++){
          var sgrid=parseInt(showDict[start_grid].subgrids[m]);
          var egrid=parseInt(showDict[end_grid].subgrids[n]);
          var grid_grid=string_transfer(sgrid,4)+"_"+string_transfer(egrid,4)+"_"+string_transfer(hour,2);
          /*if(linkNum[grid_grid]!=null){
              lineWidth=lineWidth+linkNum[grid_grid];
          }*/ //单纯地将两个grid统计得到的轨迹数相加，是错误的，因为轨迹会重复，因此应该对deviceID进行核对 
          ///////////////////////////////////////////////////////////////////////
          if(gridgridDeviceTopic[grid_grid]!=null){
			  //console.log(gridgridDeviceTopic[grid_grid]);
				for (var p=0;p<gridgridDeviceTopic[grid_grid].length;p++){
					var device=gridgridDeviceTopic[grid_grid][p].id;					
					grid_grid_device_dict[device]=1;
				}
			}	
           //////////////////////////////////////////////////////////////////////////		  
        }
      } 
	  for(key in grid_grid_device_dict){		  
		  lineWidth=lineWidth+1;
	  }
	  //////////////////////////////////////////////////////////////////////////////////////	  
      var gridInfo=string_transfer(start,4)+"_"+string_transfer(end,4)+"_"+string_transfer(hour,2);

      var rScale = d3.scale.linear() //颜色比例尺
      .domain([0, 13])//12
      .range([0.5, 0.75]);

      var oScale = d3.scale.linear()//透明度比例尺
      .domain([0, 13])//10
      .range([0.1, 0.6]);

      var aScale = d3.scale.linear() //箭头大小比例尺
      .domain([0, 20])
      .range([10, 16]);
      //if(linkNum[gridInfo]!=null){  //原先是根据两个grid之间有没有轨迹来判断，现在因为有grid合并的情况，需要修改
	  if(lineWidth>0){
        //var lineWidth=wScale(Math.sqrt(linkNum[gridInfo]));
    var trueLineWidth=wScale(Math.sqrt(lineWidth));
		lineWidth=wScale(Math.sqrt(lineWidth));
		
			if(lineWidth>10){  //如果太粗就还需要改我8或者更小
				lineWidth=10;
			}
    //console.log(lineWidth);
      
        var x2=links[i]["source"]["x"],
            y2=links[i]["source"]["y"],
            x1=links[i]["target"]["x"],
            y1=links[i]["target"]["y"];
        var dx=Math.abs(x1-x2);
        var dy=Math.abs(y1-y2);
        var midx=(x1+x2)/2;
        var midy=(y1+y2)/2;
        var curve_path;
        var dis=Math.sqrt(links[i].distance)*0.7;
		if(links[i].distance<300){ //300 600(22_23)
        dis=Math.sqrt(links[i].distance)*0.9; //0.9  1.2(22_23)
        }
        var deta1,deta2;
        deta1=dx/dis*1;
        deta2=dy/dis*1;

          if(deta1!=0&&deta2!=0){//x2,y1
            var k=(y1-y2)/(x1-x2);
            if(k<0){
              x1=x1-((x1-x2)/dx)*deta1;
              x2=x2+((x1-x2)/dx)*(deta1+lineWidth+1);
              y1=y1-((y1-y2)/dy)*(deta2+lineWidth+1);
              y2=y2+((y1-y2)/dy)*deta2;
            }
            else{
              x1=x1-((x1-x2)/dx)*(deta1+lineWidth+1);
              x2=x2+((x1-x2)/dx)*deta1;
              y1=y1-((y1-y2)/dy)*deta2;
              y2=y2+((y1-y2)/dy)*(deta2+lineWidth+1);
            }
          }
        if(dx<0.1){
          if(y1<y2){
            x1=x1+(deta1+lineWidth/2+1);
            x2=x2+(deta1+lineWidth/2+1);
          }
          else{
            x1=x1-(deta1+lineWidth/2+1);
            x2=x2-(deta1+lineWidth/2+1);
          }
          y1=y1-((y1-y2)/dy)*(deta2+lineWidth+1);
          y2=y2+((y1-y2)/dy)*(deta2+lineWidth+1);
        }
        if(dy<0.1){
          if(x1<x2){
            y1=y1-(deta2+lineWidth/2+1);
            y2=y2-(deta2+lineWidth/2+1);
          }
          else{
            y1=y1+(deta2+lineWidth/2+1);
            y2=y2+(deta2+lineWidth/2+1);
          }
          x1=x1-((x1-x2)/dx)*(deta1+lineWidth+1);
          x2=x2+((x1-x2)/dx)*(deta1+lineWidth+1);
           
       }  
        //curve_path = "M"+x1.toString()+","+y1.toString()+" "+"T"+x2.toString()+","+y2.toString();
        var moveLenth=dis;
        if(links[i].distance<100){
          moveLenth=0;
        }

        curve_path = "M"+x1.toString()+","+y1.toString()+" "+"Q"+((x1+x2)/2).toString()+" "+
                 ((y1+y2)/2-moveLenth).toString()+" "+x2.toString()+" "+y2.toString();
        var beta=rScale(trueLineWidth);
        var lineOpacity=oScale(trueLineWidth);
        var color_RGB=new Array(3);
        color_RGB=HSL_to_RGB(beta).concat();
        var color='#';
        var R=parseInt(color_RGB[0]*255);
        var G=parseInt(color_RGB[1]*255);
        var B=parseInt(color_RGB[2]*255);
        R=string_transfer16(R,2);
        G=string_transfer16(G,2);
        B=string_transfer16(B,2);
        color=color+R+G+B;

        ///////////////////////////////////////添加箭头///////////////////////////////
        var mWidth=(10+lineWidth*2).toString();
        var mHeight=((10+lineWidth*2)/2).toString();
        var arrowMarker_01 = defs_01.append("marker")
            .attr("id",function(){return "marker-"+i.toString()})
            .attr("markerUnits","userSpaceOnUse")//strokeWidth   userSpaceOnUse
            //.attr("markerWidth","10")
            .attr("markerWidth",mWidth)
            //.attr("markerHeight","5")
            .attr("markerHeight",mHeight)
            //.attr("viewBox","0 -5 10 5") 
            .attr("viewBox","0 -"+mHeight+" "+mWidth+" "+mWidth) //.attr("viewBox","0 -"+mHeight+" "+mWidth+" "+mHeight)
            //.attr("refX","10")
            .attr("refX",mWidth)
            .attr("refY",(lineWidth/2).toString())
            //.attr("refY",lineWidth)
            .attr("orient","auto");

        //var arrow_path_01 = "M0,-"+mHeight+" L"+mWidth+",0 "+"L"+mWidth+","+lineWidth+" L0,0"; 
        var arrow_path_01 = "M0,-"+mHeight+" L"+mWidth+",0 "+"L"+mWidth+","+lineWidth+" L0,"+lineWidth;          
        arrowMarker_01.append("path")
        .attr("d",arrow_path_01)
        .attr("fill",color);

        var curve_01 = svgLines.append("path")
            .attr("class", "curves")
            .attr("d",curve_path)
            .attr("fill","none")
            .attr("stroke",color)
            .attr("stroke-width",lineWidth)
            .attr("stroke-opacity",lineOpacity)
            //.attr("marker-start","url(#arrow_01)")
            //.attr("marker-mid","url(#arrow_01)")
            .attr("marker-end",function(){return "url(#marker-"+i.toString()+")"});

      }

  }






//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}//函数结尾

var mapLayer = {
    onAdd: function(map) {
      map.on('viewreset moveend', drawWithLoading);
      drawWithLoading();
      //draw();
    }
  };

map.on('ready', function() {
      map.addLayer(mapLayer);
  });
/*$(".topicCircle").on("mouseout",function(e){
               alert(1);
                      d3.selectAll(".topicCircle").remove();
                        });*/
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function readLinkFile(){
  //00_result_traceNum.json
  $.getJSON("./data/allData_result_traceNum_02.json",function(data){
    $.each(data,function(index,list){
      gridInfo=list[0].toString();
      num=parseInt(list[1]);
      linkNum[gridInfo]=num;
    });
  });
  /*$.ajax({
    	url: "./data/allData_result_traceNum_02.json",
    	async: false,
    	dataType: 'json',
    	success: function(data) {
    		$.each(data,function(index,list){
            gridInfo=list[0].toString();
            num=parseInt(list[1]);
            linkNum[gridInfo]=num;
           });
    	}
    });*/
}

function readLinkTopicFile(){
	var species = ["topic0","topic1", "topic2", "topic3","topic4"];  //topic类别
	var legendScale=d3.scale.ordinal().domain(species).range([0,1,2,3,4]);
	var c = d3.scale.category10();
   $.getJSON("./data/gridTraceTopics_01.json",function(data){
        $.each(data,function(key,value){
          var topicvalue=new Array();
          $.each(value,function(k,v){
            var topicInfo=new Object();           
            if(k!='num'&&k!='topicSum'){
              topicInfo.label=k;
              topicInfo.score=parseFloat(v);
              topicInfo.width=parseFloat(v)/value['topicSum'];
              topicInfo.num=value['num'];
              //topicInfo.color=c(legendScale(k)+1);
			  topicInfo.colorIndex=legendScale(k); //legendScale(k)  parseInt(k.substr(5,6)) 用于填充颜色
			  topicInfo.topicSum=value['topicSum'];
              topicvalue.push(topicInfo);
            }
            /*else if(k=='num'){
              topicInfo.num=parseInt(v);
            }
            else{
              topicInfo.topicSum=parseFloat(v);
            }*/            
          });
          linkTopic[key]=topicvalue;
         /*if(key=='6959_7040_02'){
            console.log(linkTopic[key]);
          }*/
        });
   }); 
}
function readGridgridDeviceTopicFile(hour){
	gridgridDeviceTopic={};
	
	/*$.getJSON("./data/"+hour+"/gridgridDeviceTopicInfo.json",function(data){
        $.each(data,function(key,value){
			gridgridDeviceTopic[key]=[];
			var deviceInfoList=[];
			$.each(value,function(index,val){
				var deviceInfo={};
				$.each(val,function(k,v){
					
					if(k!='species'&&k!='id'){
						deviceInfo[k]=parseFloat(v);
					}
					else{
						deviceInfo[k]=v;
					}
				})
				deviceInfoList.push(deviceInfo);
			})
			gridgridDeviceTopic[key]=deviceInfoList;
			

			//if(key='6978_5552_00'){
			//	console.log(gridgridDeviceTopic[key]);
			//}
		});
   }); */
   
   
   /////////////////////////////////////////////////////////////////////
   $.ajax({
    	url: "./data/"+hour+"/gridgridDeviceTopicInfo.json",
    	dataType: 'json',
    	success: function(data) {
    		$.each(data,function(key,value){
			gridgridDeviceTopic[key]=[];
			var deviceInfoList=[];
			$.each(value,function(index,val){
				var deviceInfo={};
				$.each(val,function(k,v){
					
					if(k!='species'&&k!='id'){
						deviceInfo[k]=parseFloat(v);
					}
					else{
						deviceInfo[k]=v;
					}
				})
				deviceInfoList.push(deviceInfo);
			})
			gridgridDeviceTopic[key]=deviceInfoList;
			
			//if(key='6978_5552_00'){
			//	console.log(gridgridDeviceTopic[key]);
			//}
		});
    	}
    });
   
   ///////////////////////////////////////////////////////////////////////
}

function string_transfer16(str,count){
  str=str.toString(16);
  if(str.length<count){
    var x=count-str.length;
    var addStr='';
    for(var i=0;i<x;i++){
      addStr=addStr+'0';
      }
    str=addStr+str;
    }
    return str;
}

function HSL_to_RGB(beta){
  var color=new Array(3);
  var s=0.6; //0.6
  var l=0.55; //0.55
  var color_R,color_G,color_B;
  var q;
  if(l<0.5){
    q=l*(1+s);
  }
  else{
    q=l+s-(l*s);
  }
  var p=2*l-q;
  var h_k=beta;
  var t_R=h_k+1/3;
  var t_G=h_k;
  var t_B=h_k-1/3;
  t_R=C_Judge(t_R);
  t_G=C_Judge(t_G);
  t_B=C_Judge(t_B);
  color_R=HSL_Judge(t_R,p,q);
  color_G=HSL_Judge(t_G,p,q);
  color_B=HSL_Judge(t_B,p,q); 
  color[0]=color_R;
  color[1]=color_G;
  color[2]=color_B;
  return color;
}
function C_Judge(tC){
  var t_C=tC;
  if(t_C<0){
    t_C=t_C+1;
  }
  if(t_C>1){
    t_C=t_C-1;
  } 
  return t_C;
}

function HSL_Judge(t_C,p,q){
  var color_C;
  if(t_C<1/6){
    color_C=p+((q-p)*6*t_C);
  }
  else if(t_C<1/2){
    color_C=q;
  }
  else if(t_C<2/3){
    color_C=p+((q-p)*6*(2/3-t_C));
  }
  else {
    color_C=p;
  }
  return color_C;
}