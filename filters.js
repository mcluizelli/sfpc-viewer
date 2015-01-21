function generateFilters() {
	
	var turnVisibility = function(d) {
		var button = d3.select(this);
		d.visible = !d.visible;
		if (d.visible) {
			button = button.html("show");
			var net = glinks.selectAll(".link.net-1")
				.transition()
				.style("opacity", .2);
		} else {
			button = button.html("hide");
			var net = glinks.selectAll(".link.net-1")
				.transition()
				.style("opacity", 1);
		}
	}

	var filterMenu = d3.select("#filtersMenu");
	var filterButtons = filterMenu.selectAll("button")
		.data([{visible: true}])
		.enter().append("button")
		.html("hide")
		.on("click", turnVisibility);

	
}
