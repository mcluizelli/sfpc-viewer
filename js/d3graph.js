// global settings
var width = 800,
    height = 500,
    vNodesAttraction = 2;

// function to generate different colors for different given numbers
var color = d3.scale.category20();

function zoomed() {
  graphContainer.attr("transform", 
                "translate(" + d3.event.translate + ")" +
                "scale(" + d3.event.scale + ")");
}

var dragNode = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

// the force layout distributes the graph automatically
var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .charge(-600)
    .chargeDistance(500)
  //  .linkDistance(100)
    .size([width, height])
    .on("tick", tick);

// function used to generate the nodes tips
var nodeTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(nodeTipText);

var zoom = d3.behavior.zoom()
    .scaleExtent([0.8, 5]) // zoom scale
    .on("zoom", zoomed);

var svg = d3.select("#graph").append("svg")
    .attr("width", "100%")
    .attr("height", "550")
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

// "g" elements to hold the links, nodes and hulls separately in the html page
var ghulls = graphContainer.append("g"),
    glinks = graphContainer.append("g"),
    gnodes = graphContainer.append("g");

// these variables will keep all the nodes, links and hulls of the page
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
      nodeType = "infrastructure";
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
    .domain(["physical", "end-point", "network-function"])
    .range(["circle", "circle", "square"]);

var nodeSymbol = function(d) {
  return nodeSymbols(d.type);
}

function generateColor(d, i){
  var numColors = requests.length + nwFunctions.length;
  if (numColors < 1) numColors = 1; // to avoid division by zero
  var colorValue = (d.hasOwnProperty('net')) ? d.net : d.nfid + requests.length;
  if (colorValue > -1) {
    var hue = colorValue * (360 / numColors) % 360;
    return d3.hcl(hue, 50 , 52).toString();
  }
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
  var ep = node.filter(function(d){return d.type == "end-point"});
  appendImage(ep, "icons/PC.png");
  var nf = node.filter(function(d){return d.type == "network-function"});
  appendImage(nf, function(d){return "icons/"+d.nfid+".png"});
  var pn = node.filter(function(d){return d.type == "physical"})
  appendImage(pn, "icons/router.png");
  // append text for physical nodes that host virtual nodes
  node.filter(function(d){
    if(hulls[d.id].length > 1 && d.type == "physical")
      return true;
    else
      return false;
  }).append("text")
      .attr("x", 12)
      .attr("dy", ".35em")
      .text(function(d) { 
        return d.id; 
      });
  node.on("mouseover", nodeTip.show)
      .on("mousedown", nodeTip.hide)
      .on("mouseout", nodeTip.hide);
  node.exit().remove();

  var virtualNodes = node.filter(function(d){return d.host!=-1});
  virtualNodes.call(dragNode);

  // create the clusters of nodes
  hull = hull.data(hulls);
  hull.enter().append("path")
      .attr("class", "hull");
  hull.exit().remove();
  force = force.linkDistance(linkDistance)
  force.start();
  generateFilters();

  function appendImage(node, image) {
    node.append("image")
      .attr("xlink:href", image)
      .attr("x", "-8px")
      .attr("y", "-8px")
      .attr("width", "16px")
      .attr("height", "16px");
  }
}

function tick(e) {

  var k = vNodesAttraction * e.alpha; // constant for virtual nodes attraction
  // this will make virtual nodes move close to the host node
  nodes.forEach(function(o, i) {
    if (o.host > -1) {
      o.x += (nodes[o.host].x - o.x)*k;
      o.y += (nodes[o.host].y - o.y)*k;
    }
  });

  node.attr("transform", function(d) { 
    return "translate(" + d.x + "," + d.y + ")"; 
  });

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

function dragstarted(d) {
  var parentHull = hulls[d.host];
  var id = parentHull.indexOf(d);
  parentHull.splice(id,1);
  d.host = -2;
  hull.attr("d", drawHull);
  //console.log(d3.event.sourceEvent.target);
  d3.event.sourceEvent.stopPropagation();
  force.stop();
  d3.select(this).classed("dragging", true);
}

function dragged(d) {
  d.x += d3.event.dx;
  d.y += d3.event.dy;
  d3.select(this).attr("transform", function(d,i){
      return "translate(" + [ d.x,d.y ] + ")"
  });
  //force.resume();
}

function dragended(d) {
  var physicalNodes = nodes.filter(function(n){return n.net == -1});
  var distance = Infinity;
  var newHost = -1;
  physicalNodes.forEach(function(n){
    var tmpDist = (n.x-d.x) * (n.x - d.x) + (n.y-d.y)*(n.y-d.y);
    if (tmpDist < distance) {
      distance = tmpDist;
      newHost = n.id;
    }
  });
  hulls[newHost].push(d);
  d.host = newHost;
  d3.select(this).classed("dragging", false);
  force.alpha(.05);
}