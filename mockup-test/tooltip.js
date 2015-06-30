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
  var text = "";
  if (d.type == "network-function") {
    var nfName = nwFunctions[d.nfid].type;
    text = text + "<strong>Network Function: </strong>" +  nfName + "<br>";
  }
  text = text + "<strong>CPU: </strong>" + d.cpu + " vCPU";
  text = text + "<br><strong>Memory: </strong>" + d.memory + " MB"; //d.memory
  if (d.type == "physical" || d.type == "network-function") {
    text = text + "<br><strong>CPU consumption: </strong>" + d.usedCpu/d.cpu*100 + "%"; //d.usedCpu/d.cpu*100
    text = text + "<br><strong>Memory consumption: </strong>" + d.usedMem/d.memory*100 + "%"; //d.usedMem/d.memory*100
  }
  if (d.hasOwnProperty["occurrences"]) {
    text += "<br><strong>Occurrences: </strong>" + d.occurrences;
  }
  return text;
}

function linkTipText(d) {
  var text = '';
  var s = d.source.id;
  var t = d.target.id;
  for (i in d.capacity) {
    if (text.length > 0) text = text + "<br>";
    if (i == "s-t") text += "<strong>Capcacity " + s +"-"+ t + ":</strong>";
    else  text += "<strong>Capcacity " + t +"-"+ s + ":</strong>";
    text = text + "<br><strong>Total:</strong> <span style='color:red'>" + d.capacity[i].total + "</span>";
    text = text + "<br><strong>Used:</strong> <span style='color:red'>" + d.capacity[i].used/d.capacity[i].total*100 + "%</span>";
  }
  return text;
}
