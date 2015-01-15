var width = 800,
    height = 800;

var color = d3.scale.category20();

var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .charge(-400)
    .linkDistance(120)
    .size([width, height])
    .on("tick", tick);

var svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height);
var ghulls = svg.append("g"),
    glinks = svg.append("g"),
    gnodes = svg.append("g");

var node = gnodes.selectAll("g.node"),
    link = glinks.selectAll("path.link"),
    hull = ghulls.selectAll("path.hull");

var symbolType = d3.scale.ordinal()
    .domain(["circle", "square"])
    .range([d3.svg.symbolTypes[0], d3.svg.symbolTypes[3]]);

// 
var drawHull = function(d) {

  var hullMembers = d.map(function(node) { return [node.x, node.y]; });

  // create "extra nodes" to make a hull for two nodes
  if (hullMembers.length == 2) {
    hullMembers.push([d[0].x+0.1, d[0].y]);
    hullMembers.push([d[1].x+0.1, d[1].y]);
  }
  return "M" + d3.geom.hull(hullMembers).join("L") + "Z";

}

function updateGraph() {

  var nodesContainer = document.getElementById("nodesContainer");
  var linksContainer = document.getElementById("linksContainer");

  nodes.splice(0); // remove all nodes from the list
  links.splice(0); // remove all links from the list

  var nodesDivs = nodesContainer.getElementsByTagName("DIV");
  var linksDivs = linksContainer.getElementsByTagName("DIV");
  for (var i = 0; i < nodesDivs.length; i++) {
    var newNode = {id: i, name: i};
    nodes.push(newNode);
  }
  for (var i = 0; i < linksDivs.length; i++) {
    var linkInputs = linksDivs[i].getElementsByTagName("INPUT");
    var source = nodes[linkInputs[0].value], target = nodes[linkInputs[1].value];
    var newLink = {source: source, target: target};
    links.push(newLink);
  }

  start();
}

function start() {
  // remove all nodes before inserting the new ones
  node = node.data([]);
  node.exit().remove();
  
  link = link.data(force.links());
  link.enter().insert("path", ".node")
      .attr("class", "link")
      .attr("stroke", function(d){ 
        if(d.net > -1) {
          return color((d.net+1) * 100); 
        } else {
          return "#666"
        }
      });
  link.exit().remove();

  node = node.data(force.nodes());
  node.enter().append("g").attr("class", "node");
  node.append("path")
      .attr("d", d3.svg.symbol()
        .type(function(d) {
          return d.symbol;
        })
        .size(200))
      .style("fill", function(d) {
        //var color = d.net || d.nwFunction;
        //alert(color);
        if (d.net > -1 ) {
          return color((d.net+1) * 100);
        }
      });
  node.append("text")
      .attr("x", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.id; });
  node.exit().remove();

  hull = hull.data(hulls);
  hull.enter().append("path")
      .attr("class", "hull")
      .style("fill", "#9467bd")
      .style("stroke", "#9467bd")
      .style("stroke-width", 40)
      .style("stroke-linejoin", "round")
      .style("opacity", .2);
  hull.exit().remove();

  force.start();
}

function tick(e) {

  var k = 1 * e.alpha; // constant for virtual nodes attraction
  // this will make virtual nodes move close to their infraestructure node
  nodes.forEach(function(o, i) {
    if (o.host > -1) {
      o.x += (nodes[o.host].x - o.x)*k;
      o.y += (nodes[o.host].y - o.y)*k;
    }
  });

  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  hull.attr("d", drawHull);
  link.attr("d", function (d) {
    var x1 = d.source.x,
        y1 = d.source.y,
        x2 = d.target.x,
        y2 = d.target.y,
        dx = x2 - x1,
        dy = y2 - y1;
        // Set dr to 0 for straight edges.
        // Set dr to Math.sqrt(dx * dx + dy * dy) for a simple curve.
        // Assuming a simple curve, decrease dr to space curves.
        // There's probably a better decay function that spaces things nice and evenly. 
        if(d.net > -1) {
          dr = Math.sqrt(dx * dx + dy * dy) - Math.sqrt(300 * (d.net));
        } else {
          dr = 0;
        }
    return "M" + x1 + "," + y1 + "A" + dr + "," + dr + " 0 0,1 " + x2 + "," + y2;
  });

}