$(document).ready(function(){

var lineData = [];
var playerData = [];

var margin = {top: 20, right: 20, bottom: 70, left: 100},
    width = $("#graph1").width() - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var domains = {events: [0, 40],
               money: [0,11000000],
               rank: [300, -10],
               rounds: [0, 130],
               age: [14, 60]}

var color = d3.scale.category20();

var colorScale = d3.scale.linear()
    .domain([0, 240])
    .range(["#1f77b4", "#d62728"]);

var x = d3.scale.linear()
          .domain(domains["age"])
          .range([0, width]);

var y = d3.scale.linear()
          .domain(domains["rank"])
          .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// var tip = d3.tip()
//   .attr('class', 'd3-tip')
//   .offset([-10, 0])
//   .html(function(d,i) {
//     return "<div class='tipName'><span class='caret'></span>&nbsp;&nbsp;"+ d.name + "</div>"+
//             "<div class='tipContent'>"+
//               "Rank: "+ (i+1) +
//               "<br />Age: " + d.age +
//             "</div>"
//             ;
//   });

var svg = d3.select("#graph1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var title = svg.append("text")
    .attr("class","titleYear")
    .attr("x", width - 20)
    .attr("y", 20)
    .attr("font-size", 20)
    .text("2014");

//Axes  
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate("+ margin.left +"," + (height+margin.top) + ")")
    .call(xAxis);

svg.append("text")
    .attr("class","xLabel")
    .attr("x", width/2 + margin.left)
    .attr("y", height-20 + margin.top + margin.bottom)
    .style("text-anchor", "middle")
    .attr("font-size", 15)
    .text("Age");

svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + margin.left + ","+margin.top+")")
    .call(yAxis);

svg.append("text")
    .attr("class","yLabel")
    .attr("font-size", 15)
    .attr("transform", "rotate(-90)")
    .attr("y", 30)
    .attr("x", 0 - height/2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Rank");

var lineGroup = svg.append("g")
    .attr("class", "averageLine")
    .attr("transform", "translate(" + margin.left + ","+margin.top+")");

var graph = svg.append("g")
    .attr("class","graph")
    .attr("transform", "translate(" + margin.left + ","+margin.top+")");
 
var line = d3.svg.line()
    .x(function(d,i){ return x(d.x);})
    .y(function(d,i){ return y(d.y);})
    .interpolate("basis");

d3.json("data/PGATour2014_aggregate.json", function(data){

  playerData = addRankToData(data);

  var points = graph.selectAll(".point")
      .data(playerData);

  points.enter().append("svg:circle")
      .attr("class", "point")
      .style("fill", "#5B5E75")
      .style("cursor", "pointer")
      .attr("r", 0)
      .attr("cx", function(d,i){ return x(d.age)})
      .attr("cy", function(d,i){ return y(d.rank)}) 
//      .on('mouseover', tip.show)
//      .on('mouseout', tip.hide)
    .transition()
      .duration(1500)
      .attr("r",3);

  points.on("click", function(d,i){
    var clicked = d3.select(this);
    console.log(clicked.data()[0]);
    points.style("fill", "#1f77b4");

    if (clicked.classed("clicked")){
      clicked.style("fill", "#1f77b4")
             .attr("class", "point");
      points.style("fill", "#5B5E75")
      removePlayerInfo();
    }
    else{
      clicked.style("fill", "red")
             .attr("class", "point clicked");
    }

    fillPlayerInfo(clicked.data()[0], i+1);
  })

  lineData = makeLineData(playerData, "age", "rank");
  lineGroup.append("path")
            .attr("d", line(lineData))
            .attr("stroke", "#639CD9")
            .attr("stroke-width", 0)
            .attr("fill", "none")
          .transition()
            .duration(1500)
            .attr("stroke-width",2);
  svg.call(tip);
});

function update(file, metric1, metric2){
   d3.json(file, function(data){

    playerData = addRankToData(data);

    var points = svg.selectAll(".point")
        .data(playerData);

    points.transition()
        .attr("cx", function(d,i){ 
          return !d[metric2] ? -200 : x(d[metric2]);
        })//should do an exit().remove() to take away nodes, but wasn't working.
        .attr("cy", function(d,i){ 
          return !d[metric1] ? -100 : y(d[metric1]); 
        })

    lineData = makeLineData(playerData, metric2, metric1);
    lineGroup.select("path")
      .transition()
        .duration(750)
        .attr("d", line(lineData))

    svg.call(tip);
  });
}
  
$("#selectMetric1").change(function(){
  var val = $(this).val();
  console.log("changed to: " + val);

  y = d3.scale.linear()
      .domain(domains[val])
      .range([height, 0]);
  
  svg.selectAll(".point").transition().duration(750).attr("cy", function(d,i){ return y(d[val]);})
  
  yAxis.scale(y);
  $(".yLabel").text(val);
  svg.select(".y.axis")
    .call(yAxis);

  lineData = makeLineData(playerData, $("#selectMetric2").val(), val); 
  lineGroup.select("path")
      .transition()
        .duration(750)
        .attr("d", line(lineData))

});


$("#selectMetric2").change(function(){
  var val = $(this).val();
  console.log("changed to: " + val);

  x = d3.scale.linear()
      .domain(domains[val])
      .range([0, width]);

  svg.selectAll(".point").transition().duration(750).attr("cx", function(d,i){ return x(d[val]);})
  
  xAxis.scale(x);
  $(".xLabel").text(val);
  svg.select(".x.axis")
    .call(xAxis);

  lineData = makeLineData(playerData, val, $("#selectMetric1").val()); 
  lineGroup.select("path")
      .transition()
        .duration(750)
        .attr("d", line(lineData))
});

$(".nextYear").on("click", function(){
  var year = parseInt($("button.titleYear").text());
  changeYear(year+1);
})
$(".prevYear").on("click", function(){
  var year = parseInt($("button.titleYear").text());
  changeYear(year-1);
})

$(".bt-disableLine, .bt-disablePoints").on("click", function(){
  var pointsOrLine = $(this).hasClass("bt-disablePoints") ? "points" : "line";

  if(!$(this).hasClass("on")){
    $(this).removeClass("btn-default");
    $(this).addClass("btn-success on");
    $(this).html("<span class='glyphicon glyphicon-plus'></span>&nbsp;&nbsp;Enable " + pointsOrLine);

    if (pointsOrLine == "line")
      lineGroup.select("path").transition().duration(750).attr("stroke-width", 0)
    else
      svg.selectAll(".point").transition().duration(750).attr("fill-opacity", 0);
  }
  else{
    $(this).removeClass("btn-success on");
    $(this).addClass("btn-default");
    $(this).html("<span class='glyphicon glyphicon-minus'></span>&nbsp;&nbsp;Disable " + pointsOrLine);
    
    if (pointsOrLine == "line")
      lineGroup.select("path").transition().duration(750).attr("stroke-width", 2)
    else
      svg.selectAll(".point").transition().duration(750).attr("fill-opacity", 1);
  }
})


function changeYear(year){
  console.log("changed to: " + year);
  update("data/PGATour"+year+"_aggregate.json", $("#selectMetric1").val(), $("#selectMetric2").val());   
  $(".titleYear").text(year);
  $("#sliderYear").val(year);
  if(year == 2014)
    $(".nextYear").addClass("disabled");
  else
    $(".nextYear").removeClass("disabled");

  if(year == 2003)
    $(".prevYear").addClass("disabled");
  else
    $(".prevYear").removeClass("disabled");

  removePlayerInfo();
} 

function fillPlayerInfo(d, playerRank){
  $(".playerInfo").html(function() {
    return "<a href='#'>" + playerRank + ". " + d.name +
        "<ul class='nav nav-second-level'><li><table class='table'>" +
          "<tr><td>Age:</td><td>" + d.age + "</td></tr>" +
          "<tr><td>Winnings:</td><td> $"+ d.money.formatMoney(2, ",", ".") + "</td></tr>" +
          "<tr><td>Made Cuts:</td><td>" + d.cuts + "/" + d.events + "</td></tr>" +
          "<tr><td>Rounds:</td><td>" + d.rounds + "</td></tr>" +
          "<tr><td>Top 10s:</td><td>" + d.top10s + "</td></tr>" +
          "<tr><td>Wins:</td><td>" + d.wins + "</td></tr>" +
        "</table></li></ul></a>";
  });
  $(".playerInfo").css("display", "inline")
}

function removePlayerInfo(){
  $(".playerInfo").css("display", "none");
  console.log("empty player info div")
}

function addRankToData(data){
  for (var i in data){
    data[i].rank = parseInt(i)+1;
    data[i].money = +data[i].money.replace(/[^0-9\.]+/g,"")
  }
  //console.log(data[10]);
  return data;
}

function makeLineData(data, xMetric, yMetric){
  var lineData = {};

  for (var i in data){
    var xData = +data[i][xMetric];
    var yData = +data[i][yMetric];

    if(!lineData[xData])
      lineData[xData] = {x: xData, y: yData, count: 1};
    else{
      lineData[xData].y += yData;
      lineData[xData].count++;
    }

  }

  for (var i in lineData){
    lineData[i].y = lineData[i].y / lineData[i].count; //find average;
  }

  console.log(lineData[25]);

  return $.map(lineData, function(d){
            return d;
          });

}

});

Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator) {
    var n = this,
        decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
        decSeparator = decSeparator == undefined ? "." : decSeparator,
        thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
        sign = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};