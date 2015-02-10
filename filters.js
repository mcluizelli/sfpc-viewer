// create the menu area
var filterMenu = d3.select("#filtersMenu").append("svg")
		.attr("width", "120px")
    	.attr("height", 0);
var filterButtons = filterMenu.selectAll("g");

function generateFilters() {

	filterMenu.attr("height", 20*virtualNetworks.length);
	var physicalLinks = glinks.selectAll(".link.net-1");
	var nwFunctionNodes = gnodes.selectAll(".node.nwFunction");

	filterButtons = filterButtons.data([]);
	filterButtons.exit().remove();

	var turnVisibility = function(d, i) {
		var button = d3.select(this);
		var opacity;
		opacity = (d.visible) ? .1 : 1;

		button.select("path").transition().style("opacity", (opacity + .3));
		if (d.type == "virtual") {
			turnVirtualNet(d, opacity);
		} else if (d.type == "nwFunction") {
			turnNWFunction(d, opacity);
		} else {
			physicalLinks.transition().style("opacity", opacity);
		}
		d.visible = !d.visible;
	}
	var buttons = [];
	virtualNetworks.forEach(function(d, i) {
		buttons.push({visible:true, type:"virtual", id:i});
	});
	var usedNF = [];
	allocatedFunctions.forEach(function(d) {
		if(usedNF.indexOf(d[1]) == -1) {
			usedNF.push(d[1]);
		}
	});
	buttons.push({visible:true, type:"physical", id:-1});
	usedNF.forEach(function(d) {
		buttons.push({visible:true, type:"nwFunction", id:d});
	});

	
	filterButtons = filterButtons.data(buttons);
	filterButtons.enter().append("g")
		.attr("class", "node");
	filterButtons.append("path")
		.attr("d", d3.svg.symbol()
        	.type(nodeSymbol)
          	.size(200));
	filterButtons.append("text")
	  .attr("x", 12)
	  .attr("dy", ".35em")
	  .text(buttonText);
	filterButtons.attr("transform", function(d, i) { return "translate(" + 30 + "," + (30 + 20*i) + ")"; })
		.on("click", turnVisibility);

	filterButtons.exit().remove();
	
	function buttonText(d) {
		var text;
		if(d.type == "nwFunction") {
			text = "Function " + d.id;
		} else if (d.type == "virtual"){
			text = "Net " + d.id;
		} else {
			text = "Infrastructure";
		}
		return text;
	}

	function turnVirtualNet(d, opacity) {
		var id = d.id;
		var net = glinks.selectAll(".link.net"+id);
		var nodes = node.filter(function(n){return n.net==id;});
		net.transition().style("opacity", opacity);
		nodes.transition().style("opacity", opacity);
	}

	function turnNWFunction(d, opacity) {
		var id = d.id;
		var nodes = nwFunctionNodes.filter(function(n){return n.nwFunction==id;});
		nodes.transition().style("opacity", opacity);
	}
}
