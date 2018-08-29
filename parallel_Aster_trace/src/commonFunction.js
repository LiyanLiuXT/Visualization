/*
在index_draw_05.js的基础上，j将一部分代码移过来，避免一个js中代码太多
*/
document.write("<script src='index_draw_06.js' type='text/javascript'></script>");

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
var linkNum=new Array();
var showDict=new Array();

readLinkFile();
var traceNumFile='traceLocation_7451_6649_00_40.json'; //两个grid之间轨迹信息文件
var traceNumInfo=traceNumFile.split('.')[0]; 
var sourceGrid=traceNumInfo.split('_')[1]; //提取起点grid
var targetGrid=traceNumInfo.split('_')[2]; //提取终点grid

$("#tSureID").click(function(){
  var time_one=parseInt($("#time_one").val());
  var time_two=parseInt($("#time_two").val());
  $.getJSON("./data/keyGrids.json",function(data){
  var count=0;
      showDict={};  //存储需要显示的grid的编号
  var extendDict=new Array();  //存储各个显示的grid周围的那些点
  $.each(data,function(index,e){
    var time=parseInt(e.slice(6,8));
    if(time_one<=time&&time<time_two){
      if(count<20){
        
          var gridIndex=e.slice(0,5);
        //console.log(gridIndex);
        //如果gridIndex已经被记录为某个grid的周围点
          if(extendDict[gridIndex]!=null){
            higherGrid=extendDict[gridIndex];
            subGrid=showDict[higherGrid].num;
            showDict[higherGrid].num=showDict[higherGrid].num+1;
            
            showDict[higherGrid].subgrids.push(gridIndex);
          }
          else{
            //如果grid没有被记录为其他grid的周围点，则说明该grid是第一次出现
          gridsInfo=new Object();
          subGridList=new Array();
          gridsInfo.subgrids=subGridList;
          gridsInfo.num=1
          showDict[gridIndex]=gridsInfo;
		  showDict[gridIndex].subgrids.push(gridIndex);
            
          var neiIndex;
          //记录该第一次出现的grid点的周围gridIndex
          neiIndex=neighbor(gridIndex,99);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
          neiIndex=neighbor(gridIndex,100);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
          neiIndex=neighbor(gridIndex,101);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
          neiIndex=neighbor(gridIndex,-1);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
          neiIndex=neighbor(gridIndex,1);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
          neiIndex=neighbor(gridIndex,-101);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
          neiIndex=neighbor(gridIndex,-100);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
          neiIndex=neighbor(gridIndex,-99);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
      }
      count++;
    }
    }
  });
  //将需要显示的grid显示在地图上
  //console.log(showDict);
    var gridCount=0;
    for (var key in showDict){

    var grid_index=parseInt(key);
    var i=parseInt(grid_index/blockCount);
    var j=grid_index%blockCount;
    var mergerNum=showDict[key].num;
    //var larger=0.5*(1-Math.sqrt(mergerNum)/mergerNum);
    var larger=0.2*Math.log(mergerNum,1.5);
    var bound=[[bottom+(i-larger)*heightDistance,left+(j-larger)*wideDistance],[bottom+(i+1+larger)*heightDistance,left+(j+1+larger)*wideDistance]];
    color='#FF0000'

    if(grid_index==parseInt(sourceGrid)){
      var rec=L.rectangle(bound, {color:'#FF216C', opacity:1, weight: mergerNum+1}).addTo(map);
    }
    else if (grid_index==parseInt(targetGrid)){
      var rec=L.rectangle(bound, {color:'#08c', opacity:1, weight: mergerNum+1}).addTo(map);
    }
    else{
      var rec=L.rectangle(bound, {color:'#999', opacity:1, weight: mergerNum+1}).addTo(map);
    }
    //var rec=L.rectangle(bound, {color:color, opacity:1, weight: mergerNum+1}).addTo(map);
	/*var rec=L.rectangle(bound, {color:color, opacity:1, weight: mergerNum+1});
	map.addLayer(rec);*/

    //构建points列表
    //var location=new Array();
    var location=new Object();
    location["latitude"]=bottom+(i+0.5)*heightDistance;
    location["longitude"]=left+(j+0.5)*wideDistance;
    location["index"]=gridCount
    location["gridIndex"]=grid_index
    location["starttime"]=time_one
    location["endtime"]=time_two
    points.push(location);
    gridCount=gridCount+1;  
  }
    draw();
});
})

function drawGrids(){
	points=[];
  var time_one=parseInt($("#time_one").val());
  var time_two=parseInt($("#time_two").val());
  $.getJSON("./data/keyGrids.json",function(data){
  var count=0;
  
  showDict={};
  var extendDict=new Array();
  $.each(data,function(index,e){
    var time=parseInt(e.slice(6,8));
    if(time_one<=time&&time<time_two){
      if(count<20){
        
          var gridIndex=e.slice(0,5);
        //console.log(gridIndex);
          if(extendDict[gridIndex]!=null){
            higherGrid=extendDict[gridIndex];
            subGrid=showDict[higherGrid].num;
            showDict[higherGrid].num=showDict[higherGrid].num+1;
            
            showDict[higherGrid].subgrids.push(gridIndex);
          }
          else{
          gridsInfo=new Object();
          subGridList=new Array();
          gridsInfo.subgrids=subGridList;
          gridsInfo.num=1
          showDict[gridIndex]=gridsInfo;
		      showDict[gridIndex].subgrids.push(gridIndex);
            
          var neiIndex;
          neiIndex=neighbor(gridIndex,99);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
          neiIndex=neighbor(gridIndex,100);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
          neiIndex=neighbor(gridIndex,101);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
          neiIndex=neighbor(gridIndex,-1);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
          neiIndex=neighbor(gridIndex,1);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
          neiIndex=neighbor(gridIndex,-101);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
          neiIndex=neighbor(gridIndex,-100);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
          neiIndex=neighbor(gridIndex,-99);
          if(extendDict[gridIndex]==null){
            extendDict[neiIndex]=gridIndex;
          }
      }
      count++;
    }
    }
  });
  //将需要显示的grid显示在地图上
    var gridCount=0;
    for (var key in showDict){
      
    var grid_index=parseInt(key)
    var i=parseInt(grid_index/blockCount);
    var j=grid_index%blockCount;
    var mergerNum=showDict[key].num;
    //var larger=0.5*(1-Math.sqrt(mergerNum)/mergerNum);
    var larger=0.2*Math.log(mergerNum,1.5);
    var bound=[[bottom+(i-larger)*heightDistance,left+(j-larger)*wideDistance],[bottom+(i+1+larger)*heightDistance,left+(j+1+larger)*wideDistance]];
    color='#FF0000'

    if(grid_index==parseInt(sourceGrid)){
      var rec=L.rectangle(bound, {color:'#FF216C', opacity:1, weight: mergerNum+1}).addTo(map);
    }
    else if (grid_index==parseInt(targetGrid)){
      var rec=L.rectangle(bound, {color:'#08c', opacity:1, weight: mergerNum+1}).addTo(map);
    }
    else{
      var rec=L.rectangle(bound, {color:'#999', opacity:1, weight: mergerNum+1}).addTo(map);
    }
 
  }
});

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
$("#clearID").click(function(){
  points=[]
  draw();
  //alert("清除完毕");

 /* var count=0;
  map.eachLayer(function(layer) {
    alert(count)
    if(count!=0){
      map.removeLayer(layer);
    }
    count++;
  });*/
  $(".leaflet-clickable").css("display","none");
  //$(".leaflet-zoom-animated").css("display","none");
});
/////////////////////////////////////////////////////////////绘制经过某两个grid的完整路径///////////////////////
$("#mSureID").click(function(){
  //02_test_result_traceLocation.json   
  //00_traceLocation.json  6143_6649_00 67
  //00_traceLocation_01.json  6048_6250_00   167
  //00_traceLocation_02.json  6143_6048_00     91
      points=[]
      draw();
        
      $(".leaflet-clickable").css("display","none");
      drawGrids();
      var num_one=parseInt($("#traceNum_one").val());
      var num_two=parseInt($("#traceNum_two").val());

      
    var traceFile='data/'+traceNumFile
    $.getJSON(traceFile,function(data){
            traceCount=0;
            $.each(data,function(key,value){
              if(num_one<traceCount&&traceCount<num_two){
                var polyline_one  = L.polyline ({opacity:0.2}).addTo(map);
                    polyline_one.setStyle({color:'#000',weight:0.3,opacity:0.1});
                var polyline_two  = L.polyline ({opacity:1}).addTo(map);
                    polyline_two.setStyle({color:'#FF216C',weight:5,opacity:0.3});
                var polyline_three  = L.polyline ({opacity:0.2}).addTo(map);
                    polyline_three.setStyle({color:'#000',weight:0.3,opacity:0.1});
                var flag_one=0; //判断是否到达起点grid
                var flag_two=0; //判断是否到达终点grid
              
              $.each(value, function(i, e){
      ///////////////////////////////////////////////////////////////////////////////
                  var Longitude=e.slice(1)[0]; //取经度值
                  var Latitude=e.slice(0)[0];  //取纬度值
                  var row=(Longitude-left)/wideDistance;
                  var column=(Latitude-bottom)/heightDistance;
                  var GridIndex=parseInt(Math.floor(column)*blockCount+Math.floor(row));
                  //如果经过了起始点，则设置第一个flag为1，作为标记
                  if(GridIndex==parseInt(sourceGrid)){ //6143_6649_00 67   6048_6250_00   167  6143_6048_00     91
                    flag_one=1;
                  }
                  //如果经过了终点grid，则设置第二个flag为1，用于分段
                  if(GridIndex==parseInt(targetGrid)){
                    flag_two=1;
                  }
                  if(flag_one==0&&flag_two==0){
                    polyline_one.addLatLng(e.slice(0,2));
                  }
                  if(flag_one==1&&flag_two==0){
                    polyline_two.addLatLng(e.slice(0,2));
                  }
                  if(flag_one==1&&flag_two==1){
                    polyline_three.addLatLng(e.slice(0,2));
                  }

      ////////////////////////////////////////////////////////////////////////////////
                  //polyline.addLatLng(e.slice(0,2))
                    /*if(i==0){
                      var circle = L.circle(e.slice(0,2), 10, {
                                    color: 'green',
                                            fillColor: '#00ff00',
                                            fillOpacity: 1
                                        }).addTo(map);
                    }
                    else if(i==value.length-1){
                      var circle = L.circle(e.slice(0,2), 10, {
                                    color: 'black',
                                            fillColor: '#000000',
                                            fillOpacity: 1
                                        }).addTo(map);
                    }*/
                    /*else{
                      var circle = L.circle(e.slice(0,2), 0.5, {
                                    color: 'red',
                                            fillColor: '#440000',
                                            fillOpacity: 1
                                       }).addTo(map);
                    }*/
                });
                                 //traceCount++;
                                polyline_two.on('click',function(e){
                                    polyline_two.setStyle({color:'#FF0',weight:10});
                                  
                                 });
                                polyline_two.on('dblclick',function(e){
                                  
                                    polyline_two.setStyle({color:'#00F',weight:5});
                                  
                                 });
                         
              }
              traceCount++;
              

            });
          });
});

function readLinkFile(){
  //00_result_traceNum.json
  $.getJSON("./data/allData_result_traceNum.json",function(data){
    $.each(data,function(index,list){
      gridInfo=list[0].toString();
      num=parseInt(list[1]);
      linkNum[gridInfo]=num;
    });
  });
 // console.log(linkNum);
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