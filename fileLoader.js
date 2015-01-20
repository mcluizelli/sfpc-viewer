// global data
// inputDat is a 3-dimentional array that contain all the data of the input .dat
var inputDat;
// variables from .out file
var wAux;
var delay;
var AN;
var AL;
var y;

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
			
			hulls = new Array(inputDat[1].length); // initialize hulls for each infraestructure node

			nodes.splice(0);
			for (var i = 0; i < inputDat[1].length; i++) {
				var node = {id: inputDat[1][i][0], cpu: inputDat[1][i][1], memory: inputDat[1][i][2], net: -1, host: -1, symbol: "circle"};
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

			var wAux = variables[0];
			var delay = variables[1];
			var AN = variables[2];
			var AL = variables[3];
			var y = variables[4];

			// inserting virtual links
			for (var i = 0; i < AL.length; i=i+2) {
				var link = {source: nodes[AL[i][0]], target: nodes[AL[i][1]], capacity: -1, delay: -1, net: AL[i][2]};
				links.push(link);
			}

			maxId = 0; // restart maxId count		
			// inserting virtual routers
			for (var i = 0; i < AN.length; i++) {
				var nodeData = inputDat[4].filter(function(n){return n[1] == AN[i][2];});
				var node = {id: AN[i][2], cpu: nodeData[0][2], memory: nodeData[0][3], net: AN[i][1], host: AN[i][0], symbol: "circle"};
				nodes.push(node);
				hulls[node.host].push(node); // insert node at respective hull
				if (node.net > maxId) maxId = node.net;
			}

			// inserting network functions
			for (var i = 0; i < y.length; i++) {
				var node = {id: i, nwFunction: y[i][1], instance: y[i][2], host: y[i][0], symbol: "square"};
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
