const w = 800,
  h = 600;

const containerDom = document.getElementById('container');

const svg = d3
  .select('#container')
  .append('svg')
  .attr('width', w)
  .attr('height', h);

svg
  .append('text')
  .attr('id', 'title')
  .text('United States Educational Attainment')
  .attr('text-anchor', 'middle')
  .attr('x', '50%')
  .attr('y', 20);

svg
  .append('text')
  .attr('id', 'description')
  .text(
    "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
  )
  .attr('text-anchor', 'middle')
  .attr('x', '50%')
  .attr('y', 35);

const tooltip = d3.select('#container').append('div').attr('id', 'tooltip');
const tooltipText = tooltip.append('p').html('Tooltip text');

const colors = {
  12: '#e000ff',
  21: '#9c00da',
  30: '#5800b6',
  39: '#130091',
  48: '#003591',
  57: '#0083b6',
  66: '#00cfda',
  75: '#00ffe0',
};

function getColor(p) {
  let count = 12;

  while (p >= count) {
    count += 9;
  }

  return colors[count];
}

const xScale = d3
  .scaleLinear()
  .domain([3, 75])
  .range([0, w / 3]);

const legendTicks = Object.keys(colors).map((value) => Number(value));
legendTicks.unshift(3);

const xAxis = d3
  .axisBottom(xScale)
  .tickValues(legendTicks)
  .tickFormat((d) => d + '%');

svg
  .append('g')
  .attr('id', 'legend')
  .attr(
    'transform',
    'translate(' + (w / 2 - w / 3 / 2) + ', ' + (h - 20) + ')'
  )
  .append('g')
  .call(xAxis);

d3.select('#legend')
  .selectAll('rect')
  .data(Object.keys(colors))
  .enter()
  .append('rect')
  .attr('width', w / 3 / Object.keys(colors).length)
  .attr('height', w / 3 / Object.keys(colors).length)
  .attr('x', (d, i) => i * (w / 3 / Object.keys(colors).length))
  .attr('y', (w / 3 / Object.keys(colors).length) * -1)
  .attr('fill', (d, i) => colors[Number(Object.keys(colors)[i])]);

d3.json(
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
).then((shapes) => {
  d3.json(
    'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'
  ).then((information) => generateMap(shapes, information));
});

function generateMap(shapes, information) {
  const geoJson = topojson.feature(shapes, shapes.objects.counties);
  const projection = d3.geoIdentity().reflectY(false).fitSize([w, h], geoJson);
  const geoGenerator = d3.geoPath().projection(projection);

  const countyHashMap = {};

  for (let i = 0; i < information.length; i++) {
    countyHashMap[information[i].fips] = {
      area_name: information[i].area_name,
      bachelorsOrHigher: information[i].bachelorsOrHigher,
      state: information[i].state,
    };
  }

  svg
    .append('g')
    .attr('id', 'counties')
    .selectAll('path')
    .data(shapes.objects.counties.geometries)
    .enter()
    .append('path')
    .attr('d', (d) => geoGenerator(topojson.feature(shapes, d)))
    .attr('fill', (d) => getColor(countyHashMap[d.id].bachelorsOrHigher))
    .attr('class', 'county')
    .attr('data-fips', (d) => d.id)
    .attr('data-education', (d) => countyHashMap[d.id].bachelorsOrHigher)
    .on('mouseenter', (d) => {
      tooltipText.html(
        countyHashMap[d.id].area_name +
          ', ' +
          countyHashMap[d.id].state +
          ': ' +
          countyHashMap[d.id].bachelorsOrHigher +
          '%'
      );
      tooltip
        .attr('data-education', countyHashMap[d.id].bachelorsOrHigher)
        .attr('class', 'visible')
        .style('left', d3.mouse(containerDom)[0] + 10 + 'px')
        .style(
          'top',
          d3.mouse(containerDom)[1] -
            tooltip.node().getBoundingClientRect().height / 2 +
            'px'
        );
    })
    .on('mouseleave', (d) => {
      tooltip.attr('class', '');
    });

  svg
    .append('path')
    .attr('id', 'states')
    .attr('d', geoGenerator(topojson.feature(shapes, shapes.objects.states)));
}
