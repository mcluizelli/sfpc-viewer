// global data
var inputData;

window.onload = function() {
	var fileInput = document.getElementById('fileInput');
	var fileDisplayArea = document.getElementById('fileDisplayArea');

	fileInput.addEventListener('change', function(e) {
		var file = fileInput.files[0];
  
			var reader = new FileReader();

			reader.onload = function(e) {

				// inputData is a 3-dimentional array that contain all the data of the input file
				var fileDisplayArea = document.getElementById('fileDisplayArea');
				// get each part of the inputData separated by ',' and removing the parts that are not important
				inputData = reader.result.split(";");
				inputData.splice(0,1);
				inputData.splice(-2,2);

				// separate the lines of each part and removing the headers and blank lines
				for (var i = 0; i < inputData.length; i++) {
					inputData[i] = inputData[i].split("\n");
					inputData[i].splice(-1,1);
					inputData[i].splice(0,2);
					// separate the values of each line and removing the blank spaces
					for (var j = 0; j < inputData[i].length; j++) {
						inputData[i][j] = inputData[i][j].split("\t"); 
						inputData[i][j].splice(0,1);
					}
				}
				
				var links = [];
				for (var i = 0; i < inputData[0].length; i++) {
					var link = {source: inputData[0][i][0], target: inputData[0][i][1], capacity: inputData[0][i][2], delay: inputData[0][i][3]};
					links.push(link);
				}
				
				var nodes = [];
				for (var i = 0; i < inputData[1].length; i++) {
					var node = {id: inputData[1][i][0], capacity: inputData[1][i][1], memory: inputData[1][i][2]};
					nodes.push(node);
				} 
				
				fileDisplayArea.textContent = linksArray.length;
			}

			reader.readAsText(file);	
	});
}
