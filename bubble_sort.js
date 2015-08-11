'use strict';
var n = 20, array = d3.shuffle(d3.range(n));

var width = 960, height = 50;
var boxWidth = width / n;

var x = d3.scale.ordinal()
    .domain(d3.range(n))
    .rangePoints([0, width]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.selectAll("rect")
    .data(array)
  .enter().append("rect")
    .attr("fill", "red")
    .attr("height", 20)
    .attr("width", boxWidth)
    .attr("transform", function(d, i) { return `translate(${x(i)})`; })
  .enter().append("text")
    .text((d) => d)
    .attr("transform", (d, i) => `translate(${x(i)})`);