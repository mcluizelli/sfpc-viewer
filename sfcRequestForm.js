var sfcRequests = [];
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
    name:"nodeType"+newId,
    value:"virtualnode"
  }).click(function() {
    $("#nwfunctionOptions"+newId).hide();
    $("#endpointOptions"+newId).show();
  });
  var radioOption2 = radioOption.clone()
    .attr("value", "nwfunction")
    .click(function() {
      $("#nwfunctionOptions"+newId).show();
      $("#endpointOptions"+newId).hide();
    });

  var radio = $("<div/>", {class:"radio"});
  radio.append($("<label/>", {html:"Virtual node "}).append(radioOption));
  radio.append($("<label/>", {html:"Network function "}).append(radioOption2.attr("checked","true")));
  var nwfunctionOptions = $("<div/>", {
    id:"nwfunctionOptions"+newId,
    class:"nwfunctionopt"})
    .append(input.clone().attr("name","type").attr("placeholder","type"))
    .append(input.clone().attr("name","cpu").attr("placeholder","cpu"))
    .append(input.clone().attr("name","memory").attr("placeholder","memory"));

  var endpointOptions =  $("<div/>", {
    id:"endpointOptions"+newId,
    class:"endpointopt"})
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
  div.append($("<label/>", {
      for:"link-source",
      html:"Source "
    }).append(input.clone().attr("id", "link-source")))
    .append($("<label/>", {
      for:"link-target",
      html:"Target "
    }).append(input.clone().attr("id", "link-target")))
    .append($("<label/>", {
      for:"link-capacity",
      html:"Capacity "
    }).append(input.clone().attr("id", "link-capacity")))
    .appendTo("#linksContainer");

}

function addInputs() {
  var nodesContainer = document.getElementById("nodesContainer");
  var linksContainer = document.getElementById("linksContainer");
  var nodes = document.getElementById("req-numNodes").value;
  var links = document.getElementById("req-numLinks").value;
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

function saveRequest() {
  var links = [];
  var nodes = [];
  var tmp;
  $("#nodesContainer").children().each(function() {
    if( $(this > '.radio' > 'label' > 'input:checked').val() == "virtualnode" ) {
      var position = $(this > '#endpointopt' > 'input[name]=position').val();
      tmp = {type: 'end-point', position: position};
    } else {
      var nwType = $(this > '#nwfunctionopt' > 'input[name]=type').val();
      var cpu = $(this > '#nwfunctionopt' > 'input[name]=cpu').val();
      var memory = $(this > '#nwfunctionopt' > 'input[name]=memory').val();
      tmp = {type: 'nwfunction', nwType: nwType, cpu: cpu, memory: memory};
    }
    nodes.push(tmp);
  });
  $("#linksContainer").children().each(function() {
    var src = $(this > 'label[for=link-source]' > '#link-source').val();
    var tgt = $(this > 'label[for=link-target]' > '#link-target').val();
    var cap = $(this > 'label[for=link-capacity]' > '#link-capacity').val();
    var tmp = {source: src, target: tgt, capacity: cap};
    links.push(tmp);
  });
  var nextId = 0;
  if (sfcRequests.length > 0) {
    nextId = sfcRequests[sfcRequests.length-1].id + 1;
  }
  var req = {id: nextId, nodes: nodes, links: links};
  sfcRequests.push(req);

  var row = $("<tr/>");
  row.append($("<td/>").html("Network Function "+nextId));
  var buttonHtml = "<center><button type='button' class='btn btn-danger btn-xs' id='removeID' onClick='$(this).parent().parent().parent().remove();removeRequest("+nextId+");'>Remove</button>";
  buttonHtml += "<button type='button' class='btn btn-sm btn-primary' data-toggle='modal' data-target='#largeModal' onClick='updateRequestPanel("+nextId+")'>Update</button></center>";
  row.append($("<td/>").html(buttonHtml));
  $('#sfc-req-table').append(row);

}

function updateRequestPanel(id) {
  var req = sfcRequests.filter(function(d) {return d.id == id})[0];
  var numNodes = req.nodes.length;
  var numLinks = req.links.length;
  $('#req-numLinks').val(numLinks);
  $('#req-numNodes').val(numNodes);

  addInputs();

}

function removeRequest(id) {
  var req = sfcRequests.filter(function(d) {return d.id == id})[0];
  var index = sfcRequests.indexOf(req);
  sfcRequests.splice(index,1);
}