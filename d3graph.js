var width = 800,
    height = 800;

var color = d3.scale.category20();

var radius = d3.scale.sqrt()
    .range([0, 6]);

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
var vnode = node.selectAll("rect");

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
        if(d.net == -1) {
          return "#666"
        } else {
          return color((d.net+1) * 100); 
        }
      });
  link.exit().remove();

  node = node.data(force.nodes());
  node.enter().append("g").attr("class", "node");
  node.append("circle").attr("r", 8);
  node.append("text")
      .attr("x", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.id; });
  vnode = node.selectAll("rect")
      .data(function(d) { return d.virtualNodes })
      .enter().append("rect")
      .attr("width", 5)
      .attr("height", 5)
      .style("fill", function(d){ return color((d.net+1) * 100); });
  node.exit().remove();

  force.start();
}

function tick() {
  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

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