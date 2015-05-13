// global data
// inputDat is a 3-dimentional array that contain all the data of the input .dat
var inputDat;
// variables from .out file
var wAux = [],
	delay = [],
	AN = [],
	AL = [],
	allocatedFunctions = [],
	GLV = [],
	GRV = [],
	GNF = [],
	nwFunctions = [], // GNF
	virtualNetworks = [];

var nodes = [],
    links = [],
    hulls = [],
    maxId = 0; // registers the greatest id between virtual nets and network functions

window.onload = function() {
	var ptFileInput = document.getElementById('pt-file-input');
	var sfcReqFileInput = document.getElementById('sfc-req-file-input');

	ptFileInput.addEventListener('change', function(e) {

		var file = ptFileInput.files[0];

		var reader = new FileReader();

		reader.onload = function(e) {

			var result = JSON.parse(reader.result);


			hulls = new Array(result.nodes.length);
			nodes.splice(0);
			for (var i = 0; i < result.nodes.length; i++) {
				nodes.push(result.nodes[i]);
				hulls[result.nodes[i].id] = [result.nodes[i]];
			}

			links.splice(0);
			for (var i = 0; i < result.links.length; i++) {
				var l = result.links[i];
				var src = nodes.filter(function(n) {return n.id == l.source})[0];
				var trg = nodes.filter(function(n) {return n.id == l.target})[0];
				l.source = src;
				l.target = trg;
				links.push(result.links[i]);
			}
		}

		reader.readAsText(file);	
	});

/*
vlink-obj {
	capacity: [
		"s-t" - 100
		"t-s" - 40
	],
	delay: 3,
	net: -1
	source: obj
	target obj
	vsource: 1
	vsource: 2
}

link-bj {
	capacity: [
		"s-t" - 100
		"t-s" - 40
	],
	delay: 3,
	net: -1
	source: obj
	target obj
}

vnode-obj {
	id
	cpu
	nfUsed
	mem
	net
	host
	type
}
node-obj {
	id
	cpu
	usedCpu
	net
	host
	type
}

nfnode-obj {
	id
	cpu
	usedCpu
	nf
	host
	type
}
*/

	sfcReqFileInput.addEventListener('change', function(e) {
		var file = sfcReqFileInput.files[0];

		var reader = new FileReader();

		reader.onload = function(e) {

			virtualNetworks = JSON.parse(reader.result);
 
			
		}

		reader.readAsText(file);
	});
}
