// global data
// inputDat is a 3-dimentional array that contain all the data of the input .dat
var inputDat;
// variables from .out file
var wAux,
	delay,
	AN,
	AL,
	allocatedFunctions,
	GLV,
	GRV,
	GNF = [],
	nwFunctions = [],
	virtualNetworks = [];

var nodes = [],
    links = [],
    hulls,
    maxId = 0; // register the greatest id between virtual nets and network functions

window.onload = function() {
	var fileInputDat = document.getElementById('fileInputDat');
	var fileInputOut = document.getElementById('fileInputOut');

	fileInputDat.addEventListener('change', function(e) {
		var file = fileInputDat.files[0];

		var reader = new FileReader();

		reader.onload = function(e) {

			// get each part of the inputDat separated by ',' and removing the parts that are not important
			inputDat = reader.result.split(";");
			inputDat.splice(0,1);
			inputDat.splice(-2,2);

			// separate the lines of each part and removing the headers and blank lines
			for (var i = 0; i < inputDat.length; i++) {
				inputDat[i] = inputDat[i].split("\n");
				inputDat[i].splice(-1,1);
				inputDat[i].splice(0,2);
				// separate the values of each line and removing the blank spaces
				for (var j = 0; j < inputDat[i].length; j++) {
					inputDat[i][j] = inputDat[i][j].split("\t"); 
					inputDat[i][j].splice(0,1);
				}
			}
			
			virtualNetworks = new Array(inputDat[7].length);
			for (var i = 0; i < inputDat[7].length; i++) {
				var id = inputDat[7][i][0];
				var maxDelay = inputDat[7][i][1];
				virtualNetworks[id] = {maxDelay: maxDelay, visible: true};
			}

			GRV = new Array(virtualNetworks.length);

			for (var i = 0; i < virtualNetworks.length; i++) {
				var routers = inputDat[4].filter(function(n){ return n[0] == i; });
				GRV[i] = new Array(routers.length);
				for (var j = 0; j < routers.length; j++) {
					var cpu = routers[j][2];
					var memory = routers[j][3];
					var functionId = routers[j][4];
					var node = {cpu: inputDat[4][i][2], memory: inputDat[4][i][3], nwFunction: inputDat[4][i][4]};	
					GRV[i][j] = node;
				}
			}			

			nwFunctions = new Array(inputDat[8].length);	// initialize with the number of network functions (count the parameter N)
			for (var i = 0; i < nwFunctions.length; i++) {
				var delay = inputDat[8][i][1];
				var functInstances = inputDat[6].filter(function(n){ return n[0] == i; });	// select all the instances of the current network function
				nwFunctions[i] = new Array(functInstances.length);	// initialize it with the number of instances
				for (var j = 0; j < functInstances.length; j++) {
					var instanceId = functInstances[j][1];
					var info = {cpu: functInstances[j][2], memory: functInstances[j][3], delay: delay};
					nwFunctions[i][instanceId] = info;
				}
			}

			// initialize GLV adjacence matrices
			GLV = new Array(virtualNetworks.length); // initialize with the number of virtual networks
			for (var i = 0; i < GLV.length; i++) {

				GLV[i] = new Array(GRV[i].length);	// for each net, initialize with the number of routers of that net
				for (var j = 0; j < GLV[i].length; j++) {
					GLV[i][j] = new Array(GRV[i].length);	// complete the adjacence matrix
				}
			}

			// insert the data
			for (var i = 0; i < inputDat[3].length; i++) {
				var o = inputDat[3][i][1],
					d = inputDat[3][i][2],
					capacity = inputDat[3][i][3],
					virtualNetId = inputDat[3][i][0];
				GLV[virtualNetId][o][d] = {capacity: capacity};
 			}

			hulls = new Array(inputDat[1].length); // initialize hulls for each infraestructure node

			nodes.splice(0);
			for (var i = 0; i < inputDat[1].length; i++) {
				var node = {id: inputDat[1][i][0], cpu: inputDat[1][i][1], memory: inputDat[1][i][2], net: -1, host: -1, type: "physical"};
				// var node = {id: inputDat[1][i][0], cpu: inputDat[1][i][1], memory: inputDat[1][i][2]};
				nodes.push(node);
				hulls[node.id] = [node];
				// create hull
				//hulls[node.id].push(node);
			} 

			links.splice(0);
			for (var i = 0; i < inputDat[0].length; i=i+2) {
				var link = {source: nodes[inputDat[0][i][0]], target: nodes[inputDat[0][i][1]], capacity: inputDat[0][i][2], delay: inputDat[0][i][3], net: -1}; // -1 indicates infraestructure links
				links.push(link);
			}
						
		}

		reader.readAsText(file);	
	});

	fileInputOut.addEventListener('change', function(e) {
		var file = fileInputOut.files[0];

		var reader = new FileReader();

		reader.onload = function(e) {

			var fileText = reader.result;

			// regular expressions for each type of variable from the .out file
			var wAux_RE = /wAux[(]\d+([,]\d+)*[)]\s+\d+[.]\d+/g;
			var delay_RE = /delayAuxPath[(]\d+([,]\d+)*[)]\s+\d+[.]\d+/g;
			var AN_RE = /AN[(]\d+([,]\d+)*[)]/g;
			var AL_RE = /AL[(]\d+([,]\d+)*[)]/g;
			var y_RE = /y[(]\d+([,]\d+)*[)]/g;

			// obtaining each occurrence of each variable via regular expression matching
			var variables = [];
			variables.push(fileText.match(wAux_RE));
			variables.push(fileText.match(delay_RE));
			variables.push(fileText.match(AN_RE));
			variables.push(fileText.match(AL_RE));
			variables.push(fileText.match(y_RE));

			// loop through every variable line and convert it to an array with the numerical values
			for (var i = 0; i < 5; i++) {
				for (var j = 0; j < variables[i].length; j++) {
					variables[i][j] = variables[i][j].match(/(\d+[.]\d+)|\d+/g);
				}
			}

			wAux = variables[0];
			delay = variables[1];
			AN = variables[2];
			AL = variables[3];
			allocatedFunctions = variables[4];

			// inserting virtual links
			for (var i = 0; i < AL.length; i++) {
				var n1 = AL[i][0],
					n2 = AL[i][1],
					vn1 = AL[i][3],
					vn2 = AL[i][4],
					vnet = AL[i][2];
				if (n1 > n2) {
					var swapTmp = n1;
					n1 = n2;
					n2 = swapTmp;
				}
				var link = {source: nodes[n1], target: nodes[n2], vsource: vn1, vtarget: vn2, capacity: GLV[vnet][vn1][vn2].capacity, delay: -1, net: vnet};
				
				// test if the link was already inserted
				var alreadyInserted = false;
				for (j = 0; j < links.length; j++) {
					if (links[j].source.id == link.source.id && links[j].target.id == link.target.id && links[j].net == link.net) {
						alreadyInserted = true;
					}
				}
				if (!alreadyInserted) {
					links.push(link);
				}
			}

			maxId = 0; // restart maxId count
			// inserting virtual routers
			for (var i = 0; i < AN.length; i++) {
				var vrouter = GRV[AN[i][1]][AN[i][2]];
				var node = {id: AN[i][2], cpu: vrouter.cpu, memory: vrouter.memory, nwFunction: vrouter.nwFunction, net: AN[i][1], host: AN[i][0], type: "virtual"};
				nodes.push(node);
				hulls[node.host].push(node); // insert node at respective hull
				if (node.net > maxId) maxId = node.net;
			}

			// inserting network functions
			for (var i = 0; i < allocatedFunctions.length; i++) {
				var nwFunctionId = allocatedFunctions[i][1];
				var instance = allocatedFunctions[i][2];
				var nwFunction = nwFunctions[nwFunctionId][instance];
				var node = {id: instance, cpu: nwFunction.cpu, memory: nwFunction.memory, nwFunction: nwFunctionId, host: allocatedFunctions[i][0], type: "nwFunction"};
				nodes.push(node);
				hulls[node.host].push(node); // insert node at respective hull
				if (node.nwFunction > maxId) maxId = node.nwFunction;
			}

/*
			// create clusters' data
			for (var i = 0; i < nodes.legth; i++) {
				hulls.push(nodes.filter(function(node) {return node.host==i;}));
			}
*/
		}

		reader.readAsText(file);
	});
}
