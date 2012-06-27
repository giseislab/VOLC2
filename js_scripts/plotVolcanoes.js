var vList = [];

/*
var hot_icon = new GIcon();
hot_icon.shadow = null;
hot_icon.iconSize = new GSize(19, 16);
hot_icon.shadowSize = new GSize(0,0);
hot_icon.iconAnchor = new GPoint(3,3);
hot_icon.image = "images/hotsta.png";
var hotmarker = new GMarker(new GLatLng(0, 0), {icon:hot_icon, zIndexProcess:importanceOrder});
*/
var volcanomarker = new Array(); //Global variable for volcanoes
var thisIcon = new GIcon();
thisIcon.shadow=null;
thisIcon.iconSize=new GSize(11,11);
thisIcon.shadowSize = new GSize(0,0);
thisIcon.iconAnchor = new GPoint(25,25);
thisIcon.infoWindowAnchor=new GPoint(11,0);

var volcano_icon = new GIcon(thisIcon, "images/volcano_icon2.png", null);
volcano_icon.iconSize=new GSize(30,30);
//volcano_icon.iconSize=new GSize(50,50);
var mobile = isMobile();
if (mobile == 1){
	volcano_icon.iconSize=new GSize(25,25);
}
var markeridxv = 0;



function plotVolcanoes() {
    markeridxv = 0;
	var LAB = '<a style="color: #6487A1; font-size:90%; font-family:arial;">';
	var vals = '<a style="color: #666666; font-size:90%; font-family:arial;">';
	var request = GXmlHttp.create();
	request.open("GET", volcanomarkersxmlfile, true);
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			var xmlDoc = GXml.parse(request.responseText);
			var vmarkers = xmlDoc.documentElement.getElementsByTagName("volcano");
			for (var i = 0; i < vmarkers.length; i++) {
				// obtain the attribues of each marker
				var vlat = parseFloat(vmarkers[i].getAttribute("lat"));
				var vlng = parseFloat(vmarkers[i].getAttribute("lon"));
				var vpoint = new GLatLng(vlat,vlng);
				var vname = vmarkers[i].getAttribute("name");
				vList[i] = vname;
				// create the marker
				//createVMarker(vpoint,vname,vlat,vlon);
				createVMarker(vpoint,vname);
			}
			setTimeout("addVMarkers()",10000);
		}
	}
	request.send(null);
}



//function createVMarker(point,name,vlat,vlon) {
function createVMarker(point,name) {
	var new_icon=volcano_icon;
	var order = 100000;
	volcanomarker[markeridxv] = new GMarker(point,{icon:volcano_icon, zIndexProcess:importanceOrder});
	var nowmarker = volcanomarker[markeridxv];
	//var vhtml = new String(name + "<br/>lon: " + vlon + "<br/>lat: " + vlat); 
  	GEvent.addListener(nowmarker, "click", function() {
		//nowmarker.openInfoWindowHtml(vhtml);
		nowmarker.openInfoWindowHtml(name);
	});
	//volcanomarker[markeridxv].importance = markeridxv+order;
	markeridxv++;
}

function addVMarkers() {
  for (var i = 0; i < volcanomarker.length; i++) {		
    map.addOverlay(volcanomarker[i]);
  }
}

