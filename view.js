var vis = d3.select("#graph")
            .append("svg")
            .attr("width", 600).attr("height", 600);

    var nodes = [
        {x: 100, y: 100},
        {x: 200, y: 400},
        {x: 400, y: 80},
        {x: 480, y: 480},
        {x: 480, y: 300}      
      ]
    var links = [
        {source: nodes[0], target: nodes[1]},
        {source: nodes[1], target: nodes[2]},
        {source: nodes[1], target: nodes[3]},
        {source: nodes[1], target: nodes[4]}
      ]

    vis.selectAll(".line")
       .data(links)
       .enter()
       .append("line")
       .attr("x1", function(d) { return d.source.x })
       .attr("y1", function(d) { return d.source.y })
       .attr("x2", function(d) { return d.target.x })
       .attr("y2", function(d) { return d.target.y })
       .style("stroke", "rgb(6,120,155)");

    vis.selectAll("circle.nodes")
       .data(nodes)
       .enter()
       .append("svg:circle")
       .attr("cx", function(d) { return d.x; })
       .attr("cy", function(d) { return d.y; })
       .attr("r", "10px")
       .attr("fill", "black")