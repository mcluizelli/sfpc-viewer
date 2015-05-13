var tooltip = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

var showLinkTooltip = function(d) {      
  tooltip.transition().duration(200).style("opacity", .9);
  tooltip.html(linkTipText(d))
    .style("left", (d3.event.pageX) + "px")     
    .style("top", (d3.event.pageY - 28) + "px"); 
}
/*
var showNodeTooltip = function(d) {
  var node = d3.select(this);
  node = node[0][0].__data__;
  tooltip.transition().duration(200).style("opacity", .9);
  tooltip.html(nodeTipText(d))
    .style("left", (node.x) + "px")     
    .style("top", (node.y) + "px");
}

var hideNodeTooltip = function() {
  tooltip.transition().duration(200).style("opacity", 0);   
}
*/
var hideLinkTooltip = function() {
  d3.select(this).transition().style("stroke-width", 1);  
  tooltip.transition().duration(200).style("opacity", 0);   
}

function nodeTipText(d) {
  var text = "<strong>CPU:</strong> <span style='color:red'>" + d.cpu + "</span>";
  text = text + "<br><strong>Memory:</strong> <span style='color:red'>" + d.memory + "</span>";
  if (d.type == "physical" || d.type == "nwFunction") {
    text = text + "<br><strong>CPU used:</strong> <span style='color:red'>" + d.usedCpu/d.cpu*100 + "%</span>";
    text = text + "<br><strong>Memory used:</strong> <span style='color:red'>" + d.usedMem/d.memory*100 + "%</span>";
  }
  return text;
}

function linkTipText(d) {
  var text = '';
  for (i in d.capacity) {
    if (text.length > 0) text = text + "<br>";
    text = text + "<strong>Capcacity " + i + ":</strong>";
    text = text + "<br><strong>Total:</strong> <span style='color:red'>" + d.capacity[i].total + "</span>";
    text = text + "<br><strong>Used:</strong> <span style='color:red'>" + d.capacity[i].used/d.capacity[i].total*100 + "%</span>";
  }
  return text;
}
