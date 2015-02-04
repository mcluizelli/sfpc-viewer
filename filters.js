// create the menu area
var filterMenu = d3.select("#filtersMenu").append("svg")
		.attr("width", "120px")
    	.attr("height", 0);

function generateFilters() {
	filterMenu.attr("height", 20*virtualNetworks.length);
	var physicalLinks = glinks.selectAll(".link.net-1");

	var turnVisibility = function(d, i) {
		var button = d3.select(this);
		var id = (d.net) ? d.net : i;
		var net = glinks.selectAll(".link.net"+id);
		var nodes = node.filter(function(d){return d.net==id;});
		if (d.visible) {
			net.transition().style("opacity", .1);
			if (id > -1) nodes.transition().style("opacity", .1);
			button.transition().style("opacity", .1);
		} else {
			net.transition()
				.style("opacity", 1);
			if (id > -1) nodes.transition().style("opacity", 1);	
			button.transition()
				.style("opacity", 1);
		}
		d.visible = !d.visible;
	}
	var networks = virtualNetworks;
	networks.push({visible:true, net:-1});
	
	var filterButtons = filterMenu.selectAll("g")
		.data(networks);
	filterButtons.enter().append("g")
		.attr("class", "node");
	filterButtons.append("path")
		.attr("d", d3.svg.symbol()
        	.type("circle")
          	.size(200));
	filterButtons.append("text")
	  .attr("x", 12)
	  .attr("dy", ".35em")
	  .text(function(d, i) { return "Net " + i; });
	filterButtons.attr("transform", function(d, i) { return "translate(" + 30 + "," + (30 + 20*i) + ")"; })
		.on("click", turnVisibility);

	filterButtons.exit().remove();
	
}
