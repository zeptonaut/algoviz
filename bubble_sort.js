'use strict';
(function() {
  var NUM_ELEMENTS = 10, array = d3.shuffle(d3.range(NUM_ELEMENTS));
  var SVG_WIDTH = 960, SVG_HEIGHT = 100;
  var BOX_WIDTH = (SVG_WIDTH - 50) / NUM_ELEMENTS, BOX_HEIGHT = SVG_HEIGHT / 2;
  var ANIMATION_DURATION = 50;
  var COLOR_START = '#1f77b4', COLOR_END = '#d62728';

  var x = d3.scale.ordinal()
        .domain(d3.range(NUM_ELEMENTS + 1))
        .rangePoints([0, SVG_WIDTH]);

  function rectTransform(d, i) {
    return `translate(${x(i)})`;
  }

  function cursorTransform(d, i) {
    return `translate(
        ${x(d) + BOX_WIDTH / 2},
        ${BOX_HEIGHT + (SVG_HEIGHT - BOX_HEIGHT) / 2})`;
  }

  var svg = d3.select("body").append("svg")
        .attr("width", SVG_WIDTH)
        .attr("height", SVG_HEIGHT);

  var colorScale = d3.scale.linear()
      .domain([0,NUM_ELEMENTS])
      .range([COLOR_START, COLOR_END]);

  var groups = svg.selectAll("g")
        .data(array)
        .enter().append("g")
        .attr("transform", rectTransform);

  var rects = groups
        .append("rect")
        .attr("fill", d => colorScale(d))
        .attr("height", BOX_HEIGHT)
        .attr("width", BOX_WIDTH)
        .attr("stroke", "#111");

  var labels = groups
        .append('text')
        .text(d => d)
        .attr("transform", (d, i) => `translate(${BOX_WIDTH / 2}, ${BOX_HEIGHT / 2})`)
        .attr('class', 'element_labels');

  var arrows = svg.selectAll('text.cursor')
      .data([0, 1])
      .enter().append('text')
      .text(() => '↑')
      .attr('transform', cursorTransform)
      .attr('class', 'cursor');

  // Each state is of the form:
  // {
  //   array: [0, 1, 2, 3, 4, 5],
  //   cursors: [0, 1],
  //   done: [10]
  // }
  var states = [];
  var stateIndex = 0;
  function doNext(shouldContinue) {
    if ((stateIndex + 1) >= states.length)
      return;

    var newState = states[++stateIndex];
    groups.data(newState.array, Number)
        .transition()
        .duration(ANIMATION_DURATION)
        .attr("transform", rectTransform);

    arrows.data(newState.cursors)
        .transition()
        .duration(ANIMATION_DURATION)
        .attr("transform", cursorTransform);

    if (shouldContinue)
      window.setTimeout(() => doNext(true), ANIMATION_DURATION);
  }

  var states = [];
  var transforms = [];

  var done = [];
  for (let pass = 0; pass < array.length - 1; pass++) {
    var passMadeChange = false;

    for (let i = 0; i < (array.length - 1 - pass); i++) {
      // State change: updated the cursor
      states.push({
        array: array.slice(),
        cursors: [i, i + 1],
        done: done
      });

      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];

        // State change: swapped two elements
        states.push({
          array: array.slice(),
          cursors: [i, i + 1],
          done: done
        });
        passMadeChange = true;
      }
    }

    done.push(array.length - 1 - pass);

    if (!passMadeChange) {
      // TODO(charliea): State change
      states.push({
        array: array.slice(),
        cursors: [],
        done: d3.range(0, array.length - 1)
      });
      break;
    }
  }

  doNext(true);
  // document.getElementById("next").addEventListener("click", function() {
  //   doNext();
  // });
})();
