import * as d3 from 'd3'
import * as topojson from 'topojson'

let margin = { top: 0, left: 20, right: 20, bottom: 0 }

let height = 500 - margin.top - margin.bottom

let width = 800 - margin.left - margin.right

let svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let projection = d3.geoEqualEarth().rotate([-10, 0])
let graticule = d3.geoGraticule()
let path = d3.geoPath().projection(projection)
let nyc = [-74, 40]

Promise.all([
  d3.json(require('./data/world.topojson')),
  d3.csv(require('./data/flights.csv')),
  d3.csv(require('./data/airport-codes-subset.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

let coordinateStore = d3.map()

function ready([json, datapointsFlight, datapoints]) {
  // console.log(json.objects)
  let countries = topojson.feature(json, json.objects.countries)
  console.log(datapoints)

  projection.fitSize([width, height], countries)

  datapoints.forEach(d => {
    // console.log(coordinateStore)
    let name = d.ident
    let coords = [d.longitude, d.latitude]
    coordinateStore.set(name, coords)
  })

  svg
    .selectAll('.country')
    .data(countries.features)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', path)
    .attr('fill', '#2C2D31')
    .attr('stroke', '#3e4149')
    .attr('stroke-width', 0.4)
  // To give the globe a background color or a stroke
  svg
    .append('path')
    .datum({ type: 'Sphere' })
    .attr('d', path)
    .attr('fill', '#1F2324')
    .lower()
  // add airports circles
  svg
    .selectAll('.airport-points')
    .data(datapoints)
    .enter()
    .append('circle')
    .attr('class', 'airports')
    .attr('r', 2)
    .style('fill', '#E2C75B')
    .attr('transform', d => {
      let coords = projection([d.longitude, d.latitude])
      return `translate(${coords})`
    })
  // add transit line
  svg
    .selectAll('.transit')
    .data(datapoints)
    .enter()
    .append('path')
    .attr('d', d => {
      // console.log(coordinateStore.get(d.ident))
      // Pull out our coordinates
      let fromCoords = nyc
      let toCoords = coordinateStore.get(d.ident)

      // Build a GeoJSON LineString
      var geoLine = {
        type: 'LineString',
        coordinates: [fromCoords, toCoords]
      }

      // Feed that to our d3.geoPath()
      return path(geoLine)
    })
    .attr('fill', 'none')
    .attr('stroke', '#6DA9E1')
    .attr('stroke-width', 1)
    .attr('opacity', 0.5)
    .attr('stroke-linecap', 'round')

  svg
    .append('text')
    .text('Where can you flight to with non-stop from New York')
    .attr('fill', '#2C2D31')
    .attr('x', width/2)
    .attr('y', 30)
    .attr('font-size', 22)
    .attr('font-weight', 500)
    .attr('text-anchor', 'middle')

  //add city for each point
  // svg
  //   .selectAll('.city-label')
  //   .data(datapoints)
  //   .enter()
  //   .append('text')
  //   .text(d=> d.municipality)
  //   .attr('class', 'city-label')
  //   .attr('font-size', 9)
  //   .style('fill', 'white')
  //   .attr('text-anchor', 'middle')
  //   .attr('transform', d => {
  //     let coords = projection([d.longitude, d.latitude])
  //     return `translate(${coords})`
  //   })
}
