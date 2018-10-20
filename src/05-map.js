import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 150, right: 0, bottom: 0 }

let height = 600 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-5')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoAlbersUsa()
let graticule = d3.geoGraticule()
let path = d3.geoPath().projection(projection)

let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
var radiusScale = d3.scaleSqrt().range([0, 20])

// var yPositionScale = d3.scaleBand().range([0, height])

Promise.all([
  d3.json(require('./data/us_states.topojson')),
  d3.csv(require('./data/powerplants.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
  console.log(json.objects)
  let states = topojson.feature(json, json.objects.us_states)
  // console.log('powerplants data is', datapoints)

  const power = datapoints.map(d => +d.Total_MW)
  radiusScale.domain(d3.extent(power))

  projection.fitSize([width, height], states)

  var categories = datapoints.map(d => d.PrimSource)

  colorScale.domain(categories)

  // nest all the categories
  var nested = d3
    .nest()
    .key(d => d.PrimSource)
    .entries(datapoints)

  console.log('nest data is', nested)

  // add json file
  svg
    .selectAll('.states')
    .data(states.features)
    .enter()
    .append('path')
    .attr('class', 'states')
    .attr('d', path)
    .attr('fill', '#e6e6e6')

  svg
    .selectAll('.powerplants')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'powerplants')
    .attr('r', d => radiusScale(d.Total_MW))
    .attr('transform', d => {
      let coords = projection([d.Longitude, d.Latitude])
      return `translate(${coords})`
    })
    .attr('fill', d => colorScale(d.PrimSource))
    .attr('opacity', 0.6)
  // put labels for each states
  svg
    .selectAll('.state-label')
    .data(states.features)
    .enter()
    .append('text')
    .attr('class', 'state-label')
    .text(d => d.properties.abbrev)
    .attr('transform', d => {
      let coords = projection(d3.geoCentroid(d))
      return `translate(${coords})`
    })
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('font-size', 13)
    .style(
      'text-shadow',
      '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff'
    )

  // legend part
  let legend = svg.append('g').attr('transform', 'translate(-130, 100)')

  legend
    .selectAll('.legend-entry')
    .data(nested)
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(0,${i * 35})`)
    .attr('class', 'legend-entry')
    .each(function(d) {
      let g = d3.select(this)

      g.append('circle')
        .attr('r', 8)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('fill', colorScale(d.key))

      g.append('text')
        .text(d.key.charAt(0).toUpperCase() + d.key.slice(1))
        .attr('dx', 17)
        .attr('alignment-baseline', 'middle')

      // add title for the map
      svg
        .append('text')
        .text('A map of American powerplants and output')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('font-size', 22)
        .attr('font-weight', 500)
        .attr('text-anchor', 'middle')
    })
}
