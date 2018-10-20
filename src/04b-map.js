import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 0, right: 0, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 900 - margin.left - margin.right

let svg = d3
  .select('#chart-4b')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoAlbers()
let graticule = d3.geoGraticule()
let path = d3.geoPath().projection(projection)

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
  console.log('the usa is', usa)

  // let datapoints = usa.properties
  // console.log(datapoints)
  // let voteClinton = usa.map(d => +d.properties.clinton)
  // let voteTrump = usa.map(d => +d.properties.trump)
  // let voteTotal = voteClinton + voteTrump
  // console.log('Vote for Clinton', voteClinton)
  // console.log('Vote for Trump', voteTrump)
  // console.log('Vote in total', voteTotal)

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
        // console.log(d.properties)
        let totalVote = d.properties.clinton + d.properties.trump
        let voteClinton = d.properties.clinton
        let voteTrump = d.properties.trump
        if (voteClinton > voteTrump) {
          return '#f768a1'
        }
        if (voteTrump > voteClinton) {
          return '#78c679'
        }
      }
    })
    .style('opacity', d => {
      if (d.properties.state) {
        let totalVote = d.properties.clinton + d.properties.trump
        // console.log(totalVote)
        return opacityScale(totalVote)
      }
      return 1
    })
}
