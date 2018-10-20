import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-1')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .style('background', 'black')
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoMercator()
let graticule = d3.geoGraticule()
let path = d3.geoPath().projection(projection)
let colorScale = d3.scaleSequential(d3.interpolateRainbow).clamp(true)

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/world-cities.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
  // console.log(json.objects)
  let countries = topojson.feature(json, json.objects.countries)

  const populations = datapoints.map(function(d) {
    return +d.population
  })
  colorScale.domain([0, 500000])

  svg
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', 'black')

  svg
    .append('path')
    .datum(graticule())
    .attr('d', path)
    .attr('stroke', 'lightgray')
    .attr('stroke-width', 0.1)
    .lower()

  svg
    .selectAll('.population-points')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'wafflehouse')
    .attr('r', 1)
    .style('fill', d => colorScale(d.population))
    .attr('transform', d => {
      let coords = projection([d.lng, d.lat])
      return `translate(${coords})`
    })

  // add title on
  svg
    .append('text')
    .text('How many people live on')
    .attr('fill', 'white')
    .attr('x', width - 250)
    .attr('y', height - 50)
    .attr('font-size', 22)
    .attr('font-weight', 500)
    .attr('text-anchor', 'middle')
  svg
    .append('text')
    .text('this Beautiful Planet?')
    .attr('fill', 'white')
    .attr('x', width - 250)
    .attr('y', height - 20)
    .attr('font-size', 22)
    .attr('font-weight', 500)
    .attr('text-anchor', 'left')
}
