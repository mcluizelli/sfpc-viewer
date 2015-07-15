
// these functions are called in fileLoader.js
// they update the tables inside view modals
function td(value, center, align) {
    var d = $("<td></td");
    if (center) {
        d.append($("<center>"+value+"</center>"));
    } else 
        d.text(value);
    if (!(align === undefined)) {
        d.attr("align", align);
    }
    return d;
}

function generateSfcRequestsViewTable() {
    requests.forEach(function(r) {
        var tr = $("<tr></tr>")
            .append(td(r.id, true))
            .append(td(r.name, false))
            .append(td("", false))
            .append(td("", false))
            .append(td("", false));
        $("#sfc-req-table").append(tr);
    });
}

function generateNfViewTable() {
    nwFunctions.forEach(function(nf) {
        var tr = $("<tr></tr>")
            .append(td("",false))
            .append(td(nf.type, false))
            .append(td("",false))
            .append(td("",false))
            .append(td(nf.instances.length, true));
        $("#nf-table").append(tr);
    });
}