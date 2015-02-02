'use strict';

var width = 760,
    height = 750,
    margins = {top: 10, right: 10, bottom: 10, left:10};

var svg = d3.select('#figure').append('svg')
    .attr('width', width + margins.left + margins.right)
    .attr('height', height + margins.top + margins.bottom)
  .append('g')
    .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

var background = svg.selectAll('.background')
  .data([0]);

background.enter().append('rect');

background
  .attr('class', 'background')
  .attr('width', width)
  .attr('height', height);

background.exit().remove();

var projection = d3.geo.mercator()
    .scale(47000)
    .center([-97.78, 30.35])
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
  .projection(projection);

var color = d3.scale.threshold()
  .range(['#fef0d9','#fdcc8a', '#fc8d59', '#e34a33', '#b30000'])
  .domain([20,40,60,80,100]);

var def = svg.append('defs')
  .append('clipPath')
  .attr('id', 'county-clip');

var precincts, ih35, county, rows;

queue()
  .defer(d3.json, '/data/precincts.json')
  .defer(d3.json, '/data/county.json')
  .defer(d3.json, '/data/ih35.json')
  .await(function (err, precincts, county, ih35) {
    calcTurnout(precincts);
    renderPrecincts(precincts);
    render35(ih35);
    renderCounty(county);
    renderTable(precincts);
  });

function calcTurnout (data) {
  data.objects.precincts.geometries.forEach(function (d) {
    d.properties.total = +d.properties.total;
    d.properties.registered = +d.properties.registered;
    if(!d.properties.registered) {
      d.properties.turnout = 0;
    } else {
      d.properties.turnout = d.properties.total/d.properties.registered * 100;
    }
  });
}

function renderTable (data) {

 var turnoutById = data.objects.precincts.geometries.map(function (d) {return {id:d.id, turnout:d.properties.turnout};});

  var table = d3.select('#table')
    .append('table')
    .attr('class', 'table');

  var thead = table.append('thead')
    .append('tr')
      .selectAll('th')
      .data(['Precinct', 'Turnout'])
      .enter()
    .append('th')
      .text(function (d) {return d;});

  rows = table.append('tbody')
    .selectAll('tr')
    .data(turnoutById)
    .enter().append('tr');

  rows.selectAll('td')
    .data(function (d) {return d3.values(d);})
    .enter().append('td')
    .text(function (d) {return d;});

  rows.on('click', function (d) {
    rows.classed('active', false);
    precincts.classed('active', false);
    d3.select(this).classed('active', true);
    precincts.filter(function (e) {
      return e.id == d.id;
    }).classed('active', true);
  });
}

function renderPrecincts (data){
  precincts = svg.selectAll('.precinct')
    .data(topojson.feature(data, data.objects.precincts).features);

  precincts.enter().append('path');

  precincts.attr('d', path)  
    .attr('class', 'precinct')
    .attr('fill', function (d) {return color(d.properties.turnout);})
    .attr('stroke', function (d) {return color(d.properties.turnout);})
    .attr('stroke', '#fff')
    .on('click', function (d) {
      precincts.classed('active', false);
      rows.classed('active', false);
      d3.select(this).classed('active', true);
      rows.filter(function (e) {
        return e.id == d.id;
      }).classed('active', true);
    });
}

function render35 (data) {
  ih35 = svg.selectAll('.ih35')
    .data(topojson.feature(data, data.objects.ih35).features);

  ih35.enter().append('path');

  ih35.attr('d', path)
    .attr('class', 'ih35')
    .attr('clip-path', 'url(#county-clip)');
}

function renderCounty (data) {
  county = def
    .datum(topojson.mesh(data, data.objects.county))
    .append('path');

  county.attr('d', path)  
    .attr('class', 'county')
    .attr('fill', 'black')
    .attr('stroke', 'black');
}
