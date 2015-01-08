var width = 800,
    height = 800;

var color = d3.scale.category10();

var nodes = [],
    links = [];

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

var node = svg.selectAll(".node"),
    link = svg.selectAll(".link");

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
  
  link = link.data(force.links(), function(d) { return d.source.id + "-" + d.target.id; });
  link.enter().insert("line", ".node").attr("class", "link");
  link.exit().remove();

  node = node.data(force.nodes());
  node.enter().append("g").attr("class", "node");
  node.append("circle").attr("r", 8);
  node.append("text")
      .attr("x", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.id; });
  node.append("rect").attr("width", 5)
      .attr("height", 5);
  node.exit().remove();

  force.start();
}

function tick() {
  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

}