function addNode() {
  var newId = $('#nodesContainer').children().length;
  if($('#nodesContainer').children().length > 0) {
    var lastChild = $('#nodesContainer').children().last();
    newId = parseInt(lastChild.attr("id").match(/\d+/)[0]); // get the greatest id
    newId += 1;
  }
  var label = $("<label/>", {
    html: "Node " + newId
  });
  var input = $("<input/>", {
    name: "capacity",
    type: "text",
    class: "form-control input-sm",
    placeholder: "capacity"
  });
  var radioOption = $("<input/>", {
    type:"radio",
    name:"nodeType"+newId
  }).click(function() {
    $("#nwfunctionOptions"+newId).hide();
    $("#endpointOptions"+newId).show();
  });
  var radioOption2 = radioOption.clone()
    .click(function() {
      $("#nwfunctionOptions"+newId).show();
      $("#endpointOptions"+newId).hide();
    });

  var radio = $("<div/>", {class:"radio"});
  radio.append($("<label/>", {html:"Virtual node "}).append(radioOption));
  radio.append($("<label/>", {html:"Network function "}).append(radioOption2.attr("checked","true")));
  var nwfunctionOptions = $("<div/>", {id:"nwfunctionOptions"+newId})
    .append(input.clone().attr("name","type").attr("placeholder","type"))
    .append(input.clone().attr("name","cpu").attr("placeholder","cpu"))
    .append(input.clone().attr("name","memory").attr("placeholder","memory"));

  var endpointOptions =  $("<div/>", {id:"endpointOptions"+newId})
    .append(input.clone().attr("name","position").attr("placeholder","position"))
    .hide();

  var div = $("<div/>", {
    id: "node"+newId
  }).append(label)
    .append(radio)
    .append(nwfunctionOptions)
    .append(endpointOptions)
    .appendTo("#nodesContainer");
}

function addLink() {
  var input = $("<input/>", {type:"number", class:"form-control input-sm"});
  var div = $("<div/>")
  div.append($("<label/>").html("Source ").append(input.clone().attr("id", "linkSource")))
    .append($("<label/>").html("Target ").append(input.clone().attr("id", "linkTarget")))
    .append($("<label/>").html("Capacity ").append(input.clone().attr("id", "linkCapacity")))
    .appendTo("#linksContainer");

}
function addInputs() {
  var nodesContainer = document.getElementById("nodesContainer");
  var linksContainer = document.getElementById("linksContainer");
  var nodes = document.getElementById("numNodes").value;
  var links = document.getElementById("numLinks").value;
  // removing forms generated previously
  while (nodesContainer.hasChildNodes()) {
      nodesContainer.removeChild(nodesContainer.lastChild);
  }
  while (linksContainer.hasChildNodes()) {
      linksContainer.removeChild(linksContainer.lastChild);
  }
  for(i=0;i<nodes;i++) { 
    addNode();
  }
  
  for(i=0;i<links;i++) {
    addLink();
  }
  
}