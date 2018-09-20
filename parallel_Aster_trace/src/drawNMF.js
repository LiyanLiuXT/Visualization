function drawNMFmapHourly (){
    d3.select("g.parent").selectAll("*").remove();
        let time_one = parseInt(time_nmf[0].slice(0,2));
        let time_two = parseInt(time_nmf[1].slice(0,2));

        $.getJSON("../NMF/LDATopic/keyArea.json", function (data) {
            $.each(data, function (error, data) {
                //console.log(data);
                var time = parseInt(data.slice(6, 8));

                if (time_one <= time && time < time_two) {
                    var grid_index_one = parseInt(data.slice(0, 5));
                    var i = parseInt(grid_index_one / blockCount);
                    var j = grid_index_one % blockCount;

                    var bound = [[bottom + i * heightDistance, left + j * wideDistance], [bottom + (i + 1) * heightDistance, left + (j + 1) * wideDistance]];
                    L.rectangle(bound, {color: '	#696969', fillColor: '#FFFFFF', opacity: 1, weight: 1}).addTo(map);

                }
            })
        });
        $.getJSON("../NMF/LDATopic/topic.json", function (data) {
            var topicNum = $.each(data.topic_num);
            $.each(data, function (key, value) {
                var count = 0;
                if (key != 'topic_num' && key != 'term_top_num') {
                    $.each(value, function (index, e) {
                        var time = parseInt(e.slice(6, 8));//对于没有方向的word
                        if (time_one <= time && time < time_two) {
                            var grid_index_one = parseInt(e.slice(0, 5));
                            var i = parseInt(grid_index_one / blockCount);
                            var j = grid_index_one % blockCount;
                            var lat = bottom + i * heightDistance;
                            var lng = left + j * wideDistance;

                            var bound0 = [[bottom + (i + 3 / 4) * heightDistance, left + (j + 2 / 4) * wideDistance], [bottom + (i + 1) * heightDistance, left + (j + 3 / 4) * wideDistance]];
                            var bound1 = [[bottom + (i + 3 / 4) * heightDistance, left + (j + 3 / 4) * wideDistance], [bottom + (i + 1) * heightDistance, left + (j + 1) * wideDistance]];
                            var bound2 = [[bottom + (i + 2 / 4) * heightDistance, left + (j + 3 / 4) * wideDistance], [bottom + (i + 3 / 4) * heightDistance, left + (j + 1) * wideDistance]];
                            var bound3 = [[bottom + (i + 1 / 4) * heightDistance, left + (j + 3 / 4) * wideDistance], [bottom + (i + 2 / 4) * heightDistance, left + (j + 1) * wideDistance]];
                            var bound4 = [[bottom + i * heightDistance, left + (j + 3 / 4) * wideDistance], [bottom + (i + 1 / 4) * heightDistance, left + (j + 1) * wideDistance]];
                            var bound5 = [[bottom + i * heightDistance, left + (j + 2 / 4) * wideDistance], [bottom + (i + 1 / 4) * heightDistance, left + (j + 3 / 4) * wideDistance]];
                            var bound6 = [[bottom + i * heightDistance, left + (j + 1 / 4) * wideDistance], [bottom + (i + 1 / 4) * heightDistance, left + (j + 2 / 4) * wideDistance]];
                            var bound7 = [[bottom + i * heightDistance, left + j * wideDistance], [bottom + (i + 1 / 4) * heightDistance, left + (j + 1 / 4) * wideDistance]];
                            var bound8 = [[bottom + (i + 1 / 4) * heightDistance, left + j * wideDistance], [bottom + (i + 2 / 4) * heightDistance, left + (j + 1 / 4) * wideDistance]];
                            var bound9 = [[bottom + (i + 2 / 4) * heightDistance, left + j * wideDistance], [bottom + (i + 3 / 4) * heightDistance, left + (j + 1 / 4) * wideDistance]];
                            var bound10 = [[bottom + (i + 3 / 4) * heightDistance, left + j * wideDistance], [bottom + (i + 1) * heightDistance, left + (j + 1 / 4) * wideDistance]];
                            var bound11 = [[bottom + (i + 3 / 4) * heightDistance, left + (j + 1 / 4) * wideDistance], [bottom + (i + 1) * heightDistance, left + (j + 2 / 4) * wideDistance]];


                            var c = d3.scale.category10();
                            var colorScale = d3.scale.ordinal()
                                .domain(['topic_0', 'topic_1', 'topic_2', 'topic_3', 'topic_4', 'topic_5'])
                                //.range(['#1f77b4','#ff7f0e','#d62728','#9467bd'])
                                .range([c(0), c(1), c(2), c(3), c(4), c(5)]);
                            //#1f77b4 #ff7f0e #2ca02c #d62728 #9467bd
                            // blue    orange  green    red    purple
                            //console.log(c(6));
                            var color = colorScale(key);
                            //console.log(c(0),c(1),c(2),c(3),c(4),c(5));


                            if (time == 00) {
                                L.rectangle(bound0, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 01) {
                                L.rectangle(bound0, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 02) {
                                L.rectangle(bound1, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 03) {
                                L.rectangle(bound1, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 04) {
                                L.rectangle(bound2, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 05) {
                                L.rectangle(bound2, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 06) {
                                L.rectangle(bound3, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 07) {
                                L.rectangle(bound3, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 08
                        )
                            {
                                L.rectangle(bound4, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 09
                        )
                            {
                                L.rectangle(bound4, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 10) {
                                L.rectangle(bound5, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 11) {
                                L.rectangle(bound5, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 12) {
                                L.rectangle(bound6, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 13) {
                                L.rectangle(bound6, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 14) {
                                L.rectangle(bound7, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 15) {
                                L.rectangle(bound7, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 16) {
                                L.rectangle(bound8, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 17) {
                                L.rectangle(bound8, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 18) {
                                L.rectangle(bound9, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 19) {
                                L.rectangle(bound9, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 20) {
                                L.rectangle(bound10, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 21) {
                                L.rectangle(bound10, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 22) {
                                L.rectangle(bound11, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            if (time == 23) {
                                L.rectangle(bound11, {color: color, opacity: 1, weight: 1}).addTo(map);
                            }
                            count++;
                        }
                    })
                }
            })
        });

//nmf graph
}

function dealTimePicker(inTime) {
    let hour = inTime;
    let first = hour.toString().slice(0,2);
    let last = hour.toString().slice(6,8);
    let time_one_new;
    //fix the hour get from #time_picker
    if (last == "PM"){
        time_one_new =  parseInt(first,10) + 12;

        if (time_one_new == 24){
            time_one_new = 0;
        }
    }
    else{
        time_one_new = parseInt(first,10);
    }
   return time_one_new;
}

function drawNMF_graph() {
    console.log("drawNMF_graph");
    // d3.selectAll(".circle").remove();
    // d3.selectAll(".image").remove();
    function truncate(str, maxLength, suffix) {
        if(str.length > maxLength) {
            str = str.substring(0, maxLength + 1);
            str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
            str = str + suffix;
        }
        return str;
    }

    var margin = {top: 20, right: 200, bottom: 0, left: 20};
    /*var	width = 1100;
    var	height = 1050;*/
    var	width = 500;
    var	height = 500;

    var start_year =0,
        end_year = 24;

    var c = d3.scale.category10();
    /*var color=d3.scale.ordinal()
        .domain(['topic_0','topic_1','topic_2','topic_3','topic_4','topic_5'])
        .range([c(0),c(1),c(2),c(3),c(4),c(5)]);
    console.log(color('topic_1'));*/
    // console.log(c(0),c(1),c(2),c(3),c(4));
//#1f77b4 #ff7f0e #2ca02c #d62728 #9467bd
//var color = ['#1f77b4','#ff7f0e','#d62728','#9467bd'];
//var color = [c(0),c(1),c(3),c(4)];
    var color = [c(0),c(1),c(2),c(3),c(4),c(5)]
    // console.log(c(5));
    let x = d3.scale.linear()
        .range([0, width]);

    let xAxis = d3.svg.axis()
        .scale(x)
        .orient("top");

    let formatYears = d3.format("00");
    xAxis.tickFormat(formatYears);

    let svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("margin-left", margin.left + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("../NMF/LDATopic/topicHourNum.json", function(data) {
        x.domain([start_year, end_year]);
        var xScale = d3.scale.linear()
            .domain([start_year, end_year])
            .range([0, width]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + 0 + ")")
            .call(xAxis);



        for (var j = 0; j < data.length; j++) {
            var g = svg.append("g").attr("class","journal");
            //alert(data(data[j]['articles']));

            var circles = g.selectAll("circle")
                .data(data[j]['articles'])
                .enter()
                .append("circle");

            var text = g.selectAll("text")
                .data(data[j]['articles'])
                .enter()
                .append("text");

            /*var rScale = d3.scale.linear()
                .domain([0, d3.max(data[j]['articles'], function(d) { return d[1]; })])
                .range([2, 9]);*/
            var rScale = d3.scale.linear()
                .domain([0, 60])   //[0,30]  [0,5] [0,25]  [0,6]   [0,5] [0,12] [0,60]
                .range([1, 9]);   //[2,9]   [1,9]   [1,9]   [1,9]

            circles
                .attr("cx", function(d, i) { return xScale(d[0]); })
                .attr("cy", j*20+20)
                .attr("r", function(d) {return Math.min(11,rScale(d[1])); })
                .style("fill", function(d) { return color[j]; });

            text
                .attr("y", j*20+25)
                .attr("x",function(d, i) { return xScale(d[0])-5; })
                .attr("class","value")
                .text(function(d){ return d[1]; })
                .style("fill", function(d) { return color[j]; })
                .style("display","none");

            g.append("text")
                .attr("y", j*20+25)
                .attr("x",width+20)
                .attr("class","label")
                .text(truncate(data[j]['name'],30,"..."))
                .style("fill", function(d) { return color[j]; })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);

        };

        function mouseover(p) {
            var g = d3.select(this).node().parentNode;
            d3.select(g).selectAll("circle").style("display","none");
            d3.select(g).selectAll("text.value").style("display","block");
        }

        function mouseout(p) {
            var g = d3.select(this).node().parentNode;
            d3.select(g).selectAll("circle").style("display","block");
            d3.select(g).selectAll("text.value").style("display","none");
        }
    });
}