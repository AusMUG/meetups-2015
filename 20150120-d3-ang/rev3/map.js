function map () {
  var width, height, precincts, roads, selection, def, background, data, ih35, county, clipPath;

  var projection = d3.geo.mercator()
      .scale(47000)
      .center([-97.78, 30.35]);

  var path = d3.geo.path()
    .projection(projection);

  var color = d3.scale.threshold()
    .range(['#fef0d9','#fdcc8a', '#fc8d59', '#e34a33', '#b30000'])
    .domain([20,40,60,80,100]);

  function exports (s) {

    selection = s;

    def = selection.selectAll('.def')
      .data([0]);
    
    def.enter().append('defs');
    
    def
      .attr('class', 'def');

    def.exit().remove();

    clipPath = def.selectAll('.clipPath')
      .data([0]);
    
    clipPath.enter().append('clipPath');
    
    clipPath
      .attr('id', 'county-clip')
      .attr('class', 'clipPath');

    county = clipPath
      .datum(topojson.mesh(data.county, data.county.objects.county))
      .append('path');

    county.attr('d', path)  
      .attr('class', 'county')
      .attr('fill', 'black')
      .attr('stroke', 'black');

    background = selection.selectAll('.background')
      .data([0]);

    background.enter().append('rect');

    background
      .attr('class', 'background')
      .attr('width', width)
      .attr('height', height);

    background.exit().remove();

    precincts = selection.selectAll('.precinct')
      .data(topojson.feature(data.precincts, data.precincts.objects.precincts).features);

    precincts.enter().append('path');

    precincts.attr('d', path)  
      .attr('class', 'precinct')
      .attr('fill', function (d) {return color(d.properties.turnout);})
      .attr('stroke', function (d) {return color(d.properties.turnout);})
      .attr('stroke', '#fff');

    ih35 = selection.selectAll('.ih35')
      .data(topojson.feature(data.ih35, data.ih35.objects.ih35).features);

    ih35.enter().append('path');

    ih35.attr('d', path)
      .attr('class', 'ih35')
      .attr('clip-path', 'url(#county-clip)');

  }

  exports.data = function (arg) {
    if(!arguments.length) return data;
    data = arg;
    return exports;
  };

  exports.width = function (arg) {
    if(!arguments.length) return width;
    width = arg;
    projection.translate([width / 2, height / 2]);
    return exports;
  };

  exports.height = function (arg) {
    if(!arguments.length) return height;
    height = arg;
    projection.translate([width / 2, height / 2]);
    return exports;
  };

  exports.select = function (id) {
    precincts.classed('active', false);
    precincts.filter(function (d) {
      return d.id == id;
    }).classed('active', true);
  };

  return exports;
}