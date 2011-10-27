var vList = [];

/*
var hot_icon = new GIcon();
hot_icon.shadow = null;
hot_icon.iconSize = new GSize(19, 16);
hot_icon.shadowSize = new GSize(0,0);
hot_icon.iconAnchor = new GPoint(3,3);
hot_icon.image = "images/hotsta.png";
var hotmarker = new GMarker(new GLatLng(0, 0), {icon:hot_icon, zIndexProcess:importanceOrder});
var volcanomarker = new Array();
*/

var thisIcon = new GIcon();
thisIcon.shadow=null;
thisIcon.iconSize=new GSize(11,11);
thisIcon.shadowSize = new GSize(0,0);
thisIcon.iconAnchor = new GPoint(0,0);
thisIcon.infoWindowAnchor=new GPoint(11,0);

var volcano_icon = new GIcon(thisIcon, "images/volcano_icon.png", null);
volcano_icon.iconSize=new GSize(15,13);
var mobile = isMobile();
if (mobile == 1){
	volcano_icon.iconSize=new GSize(25,25);
}

var markeridx = 0;


function plotVolcanoes() {
	var LAB = '<a style="color: #6487A1; font-size:90%; font-family:arial;">';
	var vals = '<a style="color: #666666; font-size:90%; font-family:arial;">';
	var request = GXmlHttp.create();
	request.open("GET", volcanomarkersxmlfile, true);
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			var xmlDoc = GXml.parse(request.responseText);
			var vmarkers = xmlDoc.documentElement.getElementsByTagName("marker");
			for (var i = 0; i < vmarkers.length; i++) {
				// obtain the attribues of each marker
				var vlat = parseFloat(vmarkers[i].getAttribute("lat"));
				var vlng = parseFloat(vmarkers[i].getAttribute("lon"));
				var vpoint = new GLatLng(vlat,vlng);
				var vname = vmarkers[i].getAttribute("volcano");
				vList[i] = vname;
				// create the marker
				createVMarker(vpoint,vname);
			}
		}
	}
	request.send(null);
}



function createVMarker(point,name) {
	var new_icon=volcano_icon;
	var order = 10000;
	volcanomarker[markeridx] = new GMarker(point,{icon:new_icon, zIndexProcess:importanceOrder});
	var nowmarker = volcanomarker[markeridx];
  	GEvent.addListener(nowmarker, "click", function() {
		nowmarker.openInfoWindowHtml(name);
	});
	volcanomarker[markeridx].importance = markeridx+order;
	markeridx++;
}


