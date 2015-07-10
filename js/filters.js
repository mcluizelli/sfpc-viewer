// create the menu area
var nwMenu = d3.select("#nwMenu").append("svg")
		.attr("width", "120px")
    	.attr("height", 0);
var	nfMenu = d3.select("#nfMenu").append("svg")
		.attr("width", "120px")
    	.attr("height", 0);

// global buttons selections
var nwButtons = nwMenu.selectAll("g");
var	nfButtons = nfMenu.selectAll("g");

function generateFilters() {

	function Button(id, type, label) {
		this.type = type;
		this.label = label;
		this.id = id;
		this. visible = true;
	}

	var physicalLinks = glinks.selectAll(".link.net-1");
	var nwFunctionNodes = gnodes.selectAll(".node.nwFunction");

	nwButtons = nwButtons.data([]);
	nwButtons.exit().remove();
	nfButtons = nfButtons.data([]);
	nfButtons.exit().remove();

	var netBut = []; // buttons data for the networks
	var nfBut = []; // buttons data for the network functions
	requests.forEach(function(d, i) {
		netBut.push(new Button(i, "virtual", d.name));
	});
	netBut.push(new Button(-1, "physical", "Infrastructure"));
	
	allocatedNFunctions.forEach(function(d) {
		nfBut.push(new Button(d, "nwFunction", nwFunctions[d].type));
	});

	nwMenu.attr("height", 20*netBut.length);
	nfMenu.attr("height", 20*nfBut.length);
	
	// generate buttons for networks
	nwButtons = nwButtons.data([]);
	nwButtons.exit().remove();
	nwButtons = nwButtons.data(netBut);
	nwButtons.enter().append("g")
		.attr("class", "node");
	nwButtons.append("path")
	.attr("d", d3.svg.symbol()
    	.type(nodeSymbol)
      	.size(200));
	nwButtons.append("text")
	  .attr("x", 12)
	  .attr("dy", ".35em")
	  .text(function(d){return d.label});
	nwButtons.attr("transform", function(d, i) { 
		return "translate(" + 8 + "," + (10 + 20*i) + ")"; 
	})
		.on("click", turnVisibility);

	nwButtons.exit().remove();

	// generate buttons for nf's
	nfButtons = nfButtons.data([]);
	nfButtons.exit().remove();
	nfButtons = nfButtons.data(nfBut);
	nfButtons.enter().append("g")
		.attr("class", "node");
	nfButtons.append("path")
	.attr("d", d3.svg.symbol()
    	.type(nodeSymbol)
      	.size(200));
	nfButtons.append("text")
	  .attr("x", 12)
	  .attr("dy", ".35em")
	  .text(function(d){return d.label});
	nfButtons.attr("transform", function(d, i) { 
		return "translate(" + 30 + "," + (10 + 20*i) + ")"; 
	})
		.on("click", turnVisibility);

	nfButtons.exit().remove();


	function turnVisibility(d, i) {
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

	function turnVirtualNet(d, opacity) {
		var id = d.id;
		var net = glinks.selectAll(".link.net"+id);
		var nodes = node.filter(function(n){return n.net==id;});
		net.transition().style("opacity", opacity);
		nodes.transition().style("opacity", opacity);
	}

	function turnNWFunction(d, opacity) {
		var id = d.id;
		var nodes = nwFunctionNodes.filter(function(n){return n.nfid==id;});
		nodes.transition().style("opacity", opacity);
	}
}
