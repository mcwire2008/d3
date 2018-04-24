const width = 960;
const height = 380;
const margin = {
  top: 20,
  left: 45,
  right: 20,
  bottom: 20,
};
const animation = 1000;
const board = {
  width: width - (margin.left + margin.right),
  height: height - (margin.top + margin.bottom),
};

const svg = d3.select('body')
  .append('svg')
    .attr('viewBox', [0, 0, width, height].join(' '))
    .attr('width', width)
    .attr('height', height)
  .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

const color = (d) => ['#d8d8d8', '#edc8a3', '#c4c4c4', '#aeafaf', '#818282', '#6a6d6d', '#5a5a5a', '#5a5a5a'][d];

const build = (data) => {

  const y = d3.scaleLinear()
    .range([0, board.height])
    .domain([d3.max(data, d => Math.ceil(Math.max(d.value) / 50)) * 50, 0]);

  const x = d3.scaleBand()
    .range([0, board.width])
    .domain(data.map((d) => d.currency));

  const barWidth = x.bandwidth() / 2;

  const p = (i) => (x.bandwidth() * i) + (barWidth / 2);

  const yAxis = d3.axisLeft(y)
    .tickSizeInner(-board.width)
    .tickSizeOuter(0)
    .tickPadding(10)
    .tickArguments([5, "s"])
    .tickFormat((d) => (!!d ? d+'M' : d));

  const xAxis = d3.axisBottom(x)
    .tickSizeInner(-board.height)
    .tickSizeOuter(0)
    .tickPadding(10);

  const bg = svg.selectAll('.bg')
    .data(data)
    .enter()
      .append('g');

  bg.append('rect')
    .attr('class', 'bg')
    .attr('fill', '#f8f7f7')
    .attr('width', barWidth)
    .attr('height', (d) => board.height)
    .attr('x', (d, i) => p(i));

  bg.exit()
    .remove();

  const axes = svg.append('g');

  axes.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate( 0 , ${board.height} )`)
      .call(xAxis);

  axes.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

  const bars = svg.selectAll('.bars')
    .data(data)
    .enter()
      .append('g');

  bars.append('rect')
    .attr('class', 'bar')
    .attr('fill', (d, i) => color(i))
    .attr('width', barWidth)
    .attr('height', (d) => 0)
    .attr('x', (d, i) => p(i))
    .attr('y', (d) => board.height - 100)
    .on('mouseover', function() {
      d3.selectAll('.bar')
        .attr('opacity', '.5');

      d3.select(this)
        .attr('opacity', '1');
    })
    .on('mouseout', function() {
      d3.selectAll('.bar')
        .attr('opacity', '1');
    });

  bars.selectAll('rect.bar')
    .transition().ease(d3.easeCubicOut).duration(animation)
    .attrTween('height', (d) => {

      const interpolate = d3.interpolate(0, board.height - y(d.value));

      return (t) => {
        return interpolate(t);
      };
    })
    .attrTween('y', (d) => {

      const interpolate = d3.interpolate(board.height, y(d.value));

      return (t) => {
        return interpolate(t);
      };
    });

  bars.append('text')
    .attr('text-anchor', 'middle')
    .attr('x', (d) => x(d.currency) + barWidth)
    .attr('y', (d) => board.height - 5)
      .text(0);

  bars.selectAll('text')
    .transition().ease(d3.easeCubicOut).duration(animation)
    .attrTween('y', (d) => {

      const interpolate = d3.interpolate(board.height - 5, y(d.value) - 5);

      return (t) => {
        return interpolate(t);
      };
    })
    .tween('text', function (d) {

      const interpolate = d3.interpolate(0, d.value);

      return (t) => {
        d3.select(this)
          .text(interpolate(t).toFixed()+'M');
      };
    });

  bars.exit()
    .remove();
};

const data = [
  { "currency": "EUR",   "value": 282 },
  { "currency": "CHF",   "value": 144 },
  { "currency": "GBP",   "value": 128 },
  { "currency": "USD",   "value": 106 },
  { "currency": "RMB",   "value":  34 },
  { "currency": "YEN",   "value":  30 },
  { "currency": "CAD",   "value":  17 },
  { "currency": "Other", "value":  15 },
];

build(data);
