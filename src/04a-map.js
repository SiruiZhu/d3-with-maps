import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-4a')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoAlbers()
let graticule = d3.geoGraticule()
let path = d3.geoPath().projection(projection)

let colorScale = d3.scaleSequential(d3.interpolatePiYG)
let opacityScale = d3
  .scaleLinear()
  .domain([0, 50000])
  .range([0, 1])
  .clamp(true)

d3.json(require('./data/counties_with_election_data.topojson'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(json) {
  // console.log(json.objects)
  let usa = topojson.feature(json, json.objects.us_counties).features
  // console.log('the usa is', usa)

  // let datapoints = usa.properties
  // console.log(datapoints)

  svg
    .selectAll('.usa')
    .data(usa)
    .enter()
    .append('path')
    .attr('class', 'usa')
    .attr('d', path)
    .attr('fill', d => {
      if (!d.properties.state) {
        // console.log(d.properties)
        return '#e6e6e6'
      } else {
        let percent =
          d.properties.trump / (d.properties.clinton + d.properties.trump)
        return colorScale(percent)
      }
    })
    .attr('opacity', d => {
      if (d.properties.state) {
        let totalVote = d.properties.clinton + d.properties.trump
        // console.log(totalVote)
        return opacityScale(totalVote)
      }
      return 1
    })
  svg
    .append('text')
    .text('2016 U.S Election choropleth map')
    .attr('font-size', 22)
    .attr('font-weight', 500)
    .attr('x', width / 2 - 230)
    .attr('y', height - 80)
    .attr('text-anchor', 'middle')

  // add legend
}
