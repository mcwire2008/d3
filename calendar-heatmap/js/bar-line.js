var data = [
  {letter: "A",    frequency:  4},
  {letter: "B",    frequency:  8},
  {letter: "C",     frequency: 15},
  {letter: "D",   frequency: 16},
  {letter: "E", frequency: 23},
  {letter: "F",     frequency: 42}
];

var svg = d3.select("svg"),
    margin = {top: 0, right: 0, bottom: 50, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

x.domain(data.map(function(d) { return d.letter; }));
y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

g.append("g")
    .attr("class", "axis text axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .append("text")
      .attr("fill", "#000")
      .attr("transform",
            "translate(" + (width/2) + " ," + margin.bottom + ")")
      .attr("text-anchor", "middle")
      .attr("class", "text")
      .text("Letter");

g.append("g")
  .attr("class", "axis text axis--y")
  .call(d3.axisLeft(y).scale(y).tickSize(-width))
  .select(".tick:last-of-type")
  .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Frequency");

g.selectAll(".bar")
  .data(data)
  .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.letter); })
    .attr("y", function(d) { return y(d.frequency); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.frequency); });

var line = d3.line()
  .x(function(d) { return x(d.letter); })
  .y(function(d) { return y(d.frequency); });

g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "turquoise")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("d", line);