/*var width = 500,
    height = 500,
    radius = Math.min(width, height) / 2,
    innerRadius = 0.3 * radius;   //原始设置 */
var width = 250,
    height = 140,
    radius = Math.min(width, height) / 2,
    innerRadius = 0.3 * radius;

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.score; }); //score  width

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([0, 0])
  .html(function(d) {
    return d.data.label + ": <span style='color:orangered'>" + d.data.score + "</span>";
    //return 'test' + ": <span style='color:orangered'>" +"</span>";
  });
/*
var arcscale=d3.scale..linear()
			.domain([0,1000])
			.range([0, 1]);*/
  
var arc = d3.svg.arc()
  .innerRadius(innerRadius)
  .outerRadius(function (d) { 
    //return (radius - innerRadius) * (d.data.score / 100.0) + innerRadius; 
	var scorerate=d.data.score / (250.0*d.data.num);
	if(scorerate>1){
		scorerate=1;
	}
    return (radius - innerRadius) * scorerate + innerRadius; 
  });

var outlineArc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius);
var c = d3.scale.category10();	
	
function drawAster(linkTopic,numb){
	d3.select('#asterSVG').remove();
	var svg = d3.select("#aster").append("svg:svg")
    .attr("id","asterSVG")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("transform", "translate(" + width/2 + "," + height/2 + ")");	
	
	svg.call(tip);
	//console.log(linkTopicInfo);
	var circlepath = svg.selectAll(".solidArc")
        .data(pie(linkTopic))
        .enter().append("path")
        .attr("fill", function(d) { return c(d.data.colorIndex); })
        .attr("class", "solidArc")
        .attr("stroke", "gray")
        .attr("d", arc)
        .attr("transform", function(d) { return "translate(" + 0 + "," + 0 + ")"; })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on('click', function(e){
                tip.hide();
                $(".solidArc").css("display","none"); 
                $(".outlineArc").css("display","none");
                $(".aster-score").css("display","none");
                circlepath.remove();
                outerPath.remove();
                centerText.remove();
                });
    var outerPath = svg.selectAll(".outlineArc")
        .data(pie(linkTopic))
        .enter().append("path")
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("transform", function(d) { return "translate(" + 0 + "," + 0 + ")"; })
        .attr("class", "outlineArc")
        .attr("d", outlineArc);
	var num=numb;
	var p=[1]
    var centerText=svg.selectAll(".aster-score")
        .data(p)
        .enter().append("text")
        .attr("class", "aster-score")
        .attr("dy", ".35em")
        .attr("transform", function(d) { return "translate(" + 0 + "," + 0 + ")"; })
        .attr("text-anchor", "middle") // text-align: right
        .text(num);
}

