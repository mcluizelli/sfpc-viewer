// global data

// variables from .out file
var allocatedNfInstances = [],
	allocatedNFunctions = [],
	nwFunctions = [], // GNF
	requests = [];

var nodes = [],
    links = [],
    hulls = [];

window.onload = function() {
	var ptFileInput = document.getElementById('pt-file-input');
	var sfcReqFileInput = document.getElementById('sfc-req-file-input');
	var nfFileInput = document.getElementById('nf-file-input');
	var outputFileInput = document.getElementById('output-file-input');

	ptFileInput.addEventListener('change', function(e) {

		var file = ptFileInput.files[0];

		var reader = new FileReader();

		reader.onload = function(e) {

			var result = JSON.parse(reader.result);

			hulls = new Array(result.nodes.length);
			nodes.splice(0);
			for (var i = 0; i < result.nodes.length; i++) {
				var n = result.nodes[i];
				n.host = -1;
				n.net = -1;
				n.usedCpu = 0;
				n.usedMem = 0;
				n.type = "physical";
				nodes.push(n);
				hulls[n.id] = [n];
			}

			links.splice(0);
			for (var i = 0; i < result.links.length; i++) {
				var l = result.links[i];
				var link = {};
				var capacity = [];
				capacity['s-t'] = {total: l.capacity['s-t'], used: 0};
				capacity['t-s'] = {total: l.capacity['t-s'], used: 0};
				var src = nodes.filter(function(n) {return n.id == l.source})[0];
				var trg = nodes.filter(function(n) {return n.id == l.target})[0];
				link.source = src;
				link.target = trg;
				link.capacity = capacity;
				link.net = -1;
				links.push(link);
			}
		}

		reader.readAsText(file);	
	});

	nfFileInput.addEventListener('change', function(e) {

		var file = nfFileInput.files[0];

		var reader = new FileReader();

		reader.onload = function(e) {
			nwFunctions.splice(0);
			nwFunctions = JSON.parse(reader.result);
			// updates the modal that shows the nf's information
			generateNfViewTable();
		}

		reader.readAsText(file);
	});

	outputFileInput.addEventListener('change', function(e) {
		var file = outputFileInput.files[0];

		var reader = new FileReader();

		reader.onload = function(e) {

			var physicalLinks = links.filter(function(l){return l.net == -1});
			var vNets = JSON.parse(reader.result).sfc;
 			var virtualLinks = links.filter(function(l){return l.net != -1});	
 			var physicalNodes = nodes.filter(function(n){return n.net == -1});

 			for (var i = 0; i < vNets.length; i++) {
 				var vnet = vNets[i];

 				for (var j = 0; j < vnet.nodes.length; j++) {
 					var n = vnet.nodes[j];
 					var node = {};
 					node["id"] = n.id;
 					node["host"] = n.location;
 					var virtualNode = requests[vnet.id].nodes[n.id];
					node["type"] = n.type;
					if (n.type == "network-function") {
						var nf = nwFunctions[n.nfid].instances[n.instance];
						node["usedCpu"] = virtualNode.cpu;
						node["usedMem"] = virtualNode.memory;
						node["cpu"] = nf.capacity;
						node["memory"] = nf.memory;
						node["nfid"] = n.nfid;
						node["instance"] = n.instance;
						node["occurrences"] = 1;
						// tests if there are other instances of same nf in the same node
						var repeatedInstance = allocatedNfInstances.filter(function(d){
							return d.host == node.host
								&& d.instance == node.instance
								&& d.nfid == node.nfid;
						});
						if (repeatedInstance.length > 0) {
							var ri = repeatedInstance[0];
							ri.occurrences++;
							ri.cpu += node.cpu;
							ri.memory += node.memory;
							ri.usedCpu += node.usedCpu;
							ri.usedMem += node.usedMem;
						} else {
							allocatedNfInstances.push(node);
							// tests if a new nf wasn't allocated
							if (allocatedNFunctions.indexOf(n.nfid) == -1) {
								allocatedNFunctions.push(n.nfid);
							}
						}
					} else {
 						node["net"] = vnet.id; 
						node["cpu"] = virtualNode.cpu;
						node["memory"] = virtualNode.memory;
					}
					var host = physicalNodes[node.host];
					host.usedCpu += node.cpu;
					host.usedMem += node.memory;
					nodes.push(node);
					hulls[node.host].push(node);
 				}

 				for (var j = 0; j < vnet.links.length; j++) {
 					var l = vnet.links[j];
 					var direction;
 					var virtualLink = requests[vnet.id].links.filter(
 						function(d) { 
 							var c1 = (d.source == l.source) && (d.target == l.target);
 							var c2 = (d.source == l.target) && (d.target == l.source);
 							if (c1)
 								direction = "s-t";
 							if (c2)
 								direction = "t-s";
 							return c1 || c2;
 						}
 					)[0];
 					var consumedBand = virtualLink.bandwidth[direction];
 					
 					for (var k = 0; k < l.position.length; k++) {
 						var pos = l.position[k];
 						var pl = physicalLinks.filter(
 							function(d) { 
	 							var c1 = (d.source.id == pos.source) && (d.target.id == pos.target);
	 							var c2 = (d.source.id == pos.target) && (d.target.id == pos.source);
	 							if (c1)
	 								direction = "s-t";
	 							if (c2)
	 								direction = "t-s";
 								return c1 || c2;
 							}
 						)[0];
 						pl.capacity[direction].used += consumedBand;
 						var link = {};
 						link["source"] = (direction == "s-t") ? pl.source : pl.target;
 						link["target"] = (direction == "s-t") ? pl.target : pl.source;
 						link["vsource"] = l.source;
 						link["vtarget"] = l.target;
 						link["net"] = vnet.id;
 						link["delay"] = vnet.delay;
 						// test if there is another link allocated
 						vl = virtualLinks.filter(function(d){
 							return d.net == link.net && 
 								d.source == link.source && 
 								d.target == link.target;
 						});
 						if(vl.length == 0) {
 							virtualLinks.push(link);
 							links.push(link);
 						}
 					}
 				}
 			}
		}

		reader.readAsText(file);
	});

	sfcReqFileInput.addEventListener('change', function(e) {
		var file = sfcReqFileInput.files[0];

		var reader = new FileReader();

		reader.onload = function(e) {
			requests.splice(0);
			result = JSON.parse(reader.result);
 			for (var i = 0; i < result.length; i++) {
 				requests[result[i].id] = result[i];
 			}
 			// updates the modal of the requests' information
			generateSfcRequestsViewTable();
		}

		reader.readAsText(file);
	});
}
