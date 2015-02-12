var width = 800,
    height = 600;

var color = d3.scale.category20();

function zoomed() {
  graphContainer.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .gravity(0.2)
    .charge(-600)
  //  .linkDistance(100)
    .friction(0.5)
    .size([width, height])
    .on("tick", tick);

var nodeTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(nodeTipText);

var zoom = d3.behavior.zoom()
    .scaleExtent([0.8, 5])
    .on("zoom", zoomed);

var svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .call(zoom)
    .call(nodeTip);

// draggable rectangle to move the graph
var rect = svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all");

var graphContainer = svg.append("g");

var ghulls = graphContainer.append("g"),
    glinks = graphContainer.append("g"),
    gnodes = graphContainer.append("g");

var node = gnodes.selectAll("g.node"),
    link = glinks.selectAll("path.link"),
    hull = ghulls.selectAll("path.hull");

var drawHull = function(d) {

  var hullMembers = d.map(function(node) { return [node.x, node.y]; });

  // create "extra nodes" to make a hull for two nodes
  if (hullMembers.length == 2) {
    hullMembers.push([d[0].x+0.1, d[0].y]);
    hullMembers.push([d[1].x+0.1, d[1].y]);
  }
  return "M" + d3.geom.hull(hullMembers).join("L") + "Z";

}

// set the class to different types of nodes
var nodeClass = function(d) {

  var nodeType = "";
  if (d.hasOwnProperty('net')) {
    if (d.net > -1) {
      nodeType = "virtual";
    } else {
      nodeType = "infraestructure";
    }
  } else {
    nodeType = "nwFunction";
  }
  return "node " + nodeType;
}

// set a different class for links of each network
var linkClass = function(d) {

  return "link net" + d.net;

}

var linkDistance = function(l, i) {

  var n1 = l.source, n2 = l.target;
  var hull1 = hulls[n1.id], hull2 = hulls[n2.id];
  return 30 + Math.max(20 * Math.min(hull1.length, hull2.length), 100);

}

var nodeSymbols = d3.scale.ordinal()
    .domain(["physical", "virtual", "nwFunction"])
    .range(["circle", "circle", "square"]);

var nodeSymbol = function(d) {
  return nodeSymbols(d.type);
}

function generateColor(d, i){
  var numColors = virtualNetworks.length + nwFunctions.length;
  if (numColors < 1) numColors = 1; // to avoid division by zero
  var colorValue = (d.hasOwnProperty('net')) ? d.net : d.nwFunction + virtualNetworks.length;
  if (colorValue > -1) {
    var hue = colorValue * (360 / numColors) % 360;
    return d3.hcl(hue, 50 , 52).toString();
  }
}

function updateGraph() {

  var nodesContainer = document.getElementById("nodesContainer");
  var linksContainer = document.getElementById("linksContainer");

  nodes.splice(0); // remove all nodes' data
  links.splice(0); // remove all links' data

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
  // remove all nodes, links and hulls before inserting the new ones
  node = node.data([]);
  node.exit().remove();
  link = link.data([]);
  link.exit().remove();
  hull = hull.data([]);
  hull.exit().remove();
  
  // create links
  link = link.data(force.links());
  link.enter().insert("path", ".node")
      .attr("class", linkClass)
      .style("stroke", generateColor);
  link.exit().remove();

  var physicalLinks = glinks.selectAll(".link.net-1")
      .on("click", showLinkTooltip)
      .on("mouseout", hideLinkTooltip)
      .on("mouseover", function() {
        d3.select(this).transition()
          .duration(1)
          .style("stroke-width", 6);
      });

  // create nodes
  node = node.data(force.nodes());
  node.enter().append("g")
      .attr("class", nodeClass)
      .attr("transform", "translate(" + width/2 + "," + height/2 + ")");
  node.append("path")
      .attr("d", d3.svg.symbol()
          .type(nodeSymbol)
          .size(200))
      .style("fill", generateColor);
  node.append("text")
      .attr("x", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.id; });
  node.on("click", nodeTip.show)
      .on("mouseout", nodeTip.hide);
  node.exit().remove();

  // create the clusters of nodes
  hull = hull.data(hulls);
  hull.enter().append("path")
      .attr("class", "hull");
  hull.exit().remove();
  force = force.linkDistance(linkDistance);
  force.start();
  generateFilters();
}

function tick(e) {

  var k = 3 * e.alpha; // constant for virtual nodes attraction
  // this will make virtual nodes move close to the host node
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
          dr = Math.sqrt(dx * dx + dy * dy) - Math.sqrt(300 * d.net);
        } else {
          dr = 0;
        }
    return "M" + x1 + "," + y1 + "A" + dr + "," + dr + " 0 0,1 " + x2 + "," + y2;
  });

}