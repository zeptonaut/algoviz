'use strict';
(function() {
  var n = 20, array = d3.shuffle(d3.range(n));

  var width = 960, height = 50;
  var boxWidth = (width - 50) / n;

  var x = d3.scale.ordinal()
        .domain(d3.range(n + 1))
        .rangePoints([0, width]);

  var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

  var colorScale = d3.scale.linear().domain([0,n]).range(["red","blue"]);
  var groups = svg.selectAll("g")
        .data(array)
        .enter().append("g")
        .attr("transform", (d, i) => `translate(${x(i)})`);

  var rects = groups
        .append("rect")
        .attr("fill", d => colorScale(d))
        .attr("height", 20)
        .attr("width", boxWidth);

  var labels = groups
        .append('text')
        .text(d => d)
        .attr("transform", (d, i) => `translate(0, 15)`);

  function transform(d, i) {
    return `translate(${x(i)})`;
  }

  var arrayIndex = 0;
  function doNext(shouldContinue) {
    if ((arrayIndex + 1) >= arrays.length)
      return;

    groups.data(arrays[++arrayIndex], Number)
      .transition()
      .duration(1000)
      .attr("transform", transform);

    if (shouldContinue)
      window.setTimeout(() => doNext(true), 1000);
  }

  var transformIndex = 0;
  function doNextTransform(shouldContinue) {
    if (transformIndex == transforms.length)
      return;

    transforms[transformIndex++]();

    if (shouldContinue)
      window.setTimeout(() => doNextTransform(true), 1000);
  }
  
  function doPrevious() {
    
  }

  var originalArray = array.slice();
  
  var arrays = [];
  var transforms = [];
  
  for (let pass = 0; pass < array.length - 1; pass++) {
    var passMadeChange = false;
    
    for (let i = 0; i < (array.length - 1 - pass); i++) {
      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        
        transforms.push(() => {
          [array[i], array[i + 1]] = [array[i + 1], array[i]];
          
          groups.data(array, Number)
            .transition()
            .duration(1000)
            .attr("transform", transform);
        });
        passMadeChange = true;
      }
    }

    if (!passMadeChange)
      break;
  }

  array = originalArray;
  
  doNextTransform(true);
  document.getElementById("next").addEventListener("click", function() {
    doNext();
  });
})();

