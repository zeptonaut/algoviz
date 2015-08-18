'use strict';
(function() {
  var NUM_ELEMENTS = 10;
  var SVG_WIDTH = 960, SVG_HEIGHT = 100;
  var BOX_WIDTH = (SVG_WIDTH - 50) / NUM_ELEMENTS, BOX_HEIGHT = SVG_HEIGHT / 2;
  var MARGIN = 5;
  
  var STEP_DURATION = 150;
  
  var COLOR_START = '#1f77b4', COLOR_END = '#d62728';
  var DEFAULT_STROKE = '#111', DONE_STROKE = '#2ca02c';

  function groupTransform(d, i) {
    return `translate(${x(i)}, ${MARGIN})`;
  }

  function checkTransform(d, i) {
    return `translate(${BOX_WIDTH / 2}, ${BOX_HEIGHT + 25})`;
  }
  
  function cursorTransform(d, i) {
    return `translate(${x(d) + BOX_WIDTH / 2}, ${MARGIN + BOX_HEIGHT + (SVG_HEIGHT - BOX_HEIGHT) / 2})`;
  }

  //showBubbleSort(element, startIndex, endIndex);
  
  var x = d3.scale.ordinal()
        .domain(d3.range(NUM_ELEMENTS + 1))
        .rangePoints([MARGIN, SVG_WIDTH - MARGIN]);
  
  var colorScale = d3.scale.linear()
        .domain([0,NUM_ELEMENTS])
        .range([COLOR_START, COLOR_END]);

  var svg = d3.select("body").append("svg")
        .attr("width", SVG_WIDTH)
        .attr("height", SVG_HEIGHT);

  var array = d3.shuffle(d3.range(NUM_ELEMENTS));
  
  var groups = svg.selectAll("g.elements").data(array)
        .enter()
        .append("g")
        .attr('class', 'element')
        .attr("transform", groupTransform);

  var rects = groups.append("rect")
        .attr("fill", d => colorScale(d))
        .attr("height", BOX_HEIGHT)
        .attr("width", BOX_WIDTH)
        .attr("stroke", '#111');

  var labels = groups.append('text')
        .text(d => d)
        .attr("transform", (d, i) => `translate(${BOX_WIDTH / 2}, ${BOX_HEIGHT / 2})`)
        .attr('class', 'element_labels');

  var arrows = svg.selectAll('text.cursor').data([0, 1])
        .enter()
        .append('text')
        .text(() => '↑')
        .attr('transform', cursorTransform)
        .attr('class', 'cursor');

  var checks = groups.append('text')
        .attr('transform', checkTransform)
        .attr('class', 'checks');

  // Render the play button overlay last so that it's on top
  
  // var player = svg.append('g')
  //       .attr('class', 'player')
  //       .on('click', () => alert('hello!'));

  // var playerRect = player.append('rect')
  //       .attr('width', SVG_WIDTH)
  //       .attr('height', SVG_HEIGHT);

  // var playButton = player.append('text')
  //       .text('►')
  //       .attr('x', SVG_WIDTH / 2)
  //       .attr('y', SVG_HEIGHT / 2);
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
      .duration(STEP_DURATION)
      .attr("transform", groupTransform)
      .each(function(d, i) {
        if (newState.done.indexOf(i) !== -1) {
          d3.select(this.querySelector('text.checks')).text('✔');
        }
      });

    arrows.data(newState.cursors)
      .exit().remove();

    arrows.transition()
      .duration(STEP_DURATION)
      .attr("transform", cursorTransform);
    
    if (shouldContinue)
      window.setTimeout(() => doNext(true), STEP_DURATION);
  }

  var done = [];
  for (let pass = 0; pass < array.length - 1; pass++) {
    var passMadeChange = false;

    for (let i = 0; i < (array.length - 1 - pass); i++) {
      // State change: moving the cursor
      states.push({
        array: array.slice(),
        cursors: [i, i + 1],
        done: done.slice()
      });

      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];

        // State change: swapping two elements
        states.push({
          array: array.slice(),
          cursors: [i, i + 1],
          done: done.slice()
        });
        passMadeChange = true;
      }
    }

    done.push(array.length - 1 - pass);

    if (!passMadeChange) {
      // State change: marking all elements done, removing cursors
      states.push({
        array: array.slice(),
        cursors: [],
        done: d3.range(0, array.length)
      });
      
      break;
    }
  }

  doNext(true);
})();
