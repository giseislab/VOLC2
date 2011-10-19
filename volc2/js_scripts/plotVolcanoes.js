var volcanoList = [];

var hot_icon = new GIcon();
hot_icon.shadow = null;
hot_icon.iconSize = new GSize(19, 16);
hot_icon.shadowSize = new GSize(0,0);
hot_icon.iconAnchor = new GPoint(3,3);
hot_icon.image = "images/hotsta.png";
var hotmarker = new GMarker (new GLatLng(0, 0), {icon:hot_icon, zIndexProcess:importanceOrder});
var volcanomarker = new Array ();


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

var coldmarkers = [];
var htmls = [];
var markeridx = 0;
var d = new Date();


function plotVolcanoes() {
	return 1;
}
function blah() {
	var LAB = '<a style="color: #6487A1; font-size:90%; font-family:arial;">';
	var vals = '<a style="color: #666666; font-size:90%; font-family:arial;">';
	var request = GXmlHttp.create();
	request.open("GET", volcanoesxmlfile, true);
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			var xmlDoc = GXml.parse(request.responseText);
			var markers = xmlDoc.documentElement.getElementsByTagName("marker");
			var dat = getcurrenttime();
			var curr_jday = dat[3];
			var curr_dstr = String(dat[0])+String(dat[1])+String(dat[2]);
			for (var i = 0; i < markers.length; i++) {
				// obtain the attribues of each marker
				var stalat = parseFloat(markers[i].getAttribute("lat"));
				var stalng = parseFloat(markers[i].getAttribute("lng"));
				var stapoint = new GLatLng(stalat,stalng);
				var staname = markers[i].getAttribute("station");
				staList[i] = staname;
				var stachannel = markers[i].getAttribute("channel");
				if (stachannel.substr(2,1)=='E' || stachannel.substr(2,1)=='1'){
					stachannel=stachannel.substr(0,2)+'Z'; //Vertical channels
				}
				var stanetwork = markers[i].getAttribute("network");
				//var stanetwork = "UW";
				var statype = markers[i].getAttribute("type");
				// create the marker
				createMarker(stapoint,stahtml,staname,statype)
			}
			setTimeout("addMarkers()",500);
		}
	}
	request.send(null);
}

//<a class="webi" href="http://www.pnsn.org/" target="_blank">Pacific Northwest Seismic Network</a>


function createMarker(point,html,name,statype) {
	if (statype=="SP") {
		var new_icon=SP_icon;
		var order = 10000;
	} else if (statype=="BB") {
		var new_icon=BB_icon;
		var order = 1000;
	} else if (statype=="SM") {
		var new_icon=SM_icon;
		var order = 0;
	}
	stamarker[markeridx] = new GMarker(point,{icon:new_icon, zIndexProcess:importanceOrder});
	var nowmarker = stamarker[markeridx];
  GEvent.addListener(nowmarker, "click", function() {
		nowmarker.openInfoWindowHtml(html);
	});
	stamarker[markeridx].importance = markeridx+order;
	coldmarkers.push(stamarker[markeridx]);
	htmls.push(html);
	side_bar_html = 'javascript:myclick(' + markeridx + ')';
	if (sidebar ==1){
		makeList(name);
		}
	markeridx++;
}


function addMarkers() {
  for (var i = 0; i < coldmarkers.length; i++) {		
    map.addOverlay(coldmarkers[i]);
  }
}


// Get the current time
function getcurrenttime () {
	var d = new Date();
	var nhour = d.getTimezoneOffset()/60;
	var chour = d.getUTCHours();
	// Last hour of day loses links because GMT day turns over 
	// before 12 and 24 hour links are written 
	if (nhour == 8){
		d.setUTCHours(chour-1);
		}
	var curr_date = d.getUTCDate();
	if (curr_date < 10){
			var curr_date = "0"+String(curr_date);
	}
	else{
			var curr_date = String(curr_date);
	}
	var curr_month = d.getUTCMonth();
	if (curr_month < 9){
			var curr_month = "0"+String(curr_month+1);
			}
			else {
			var curr_month = String(curr_month+1);
			}	
	var curr_year = d.getUTCFullYear();
	var curr_jday = d.getDOY();
	return [curr_year,curr_month,curr_date,curr_jday];
}

// Get dates and produce strings for the previous three days
function getPreviousDates (){ 
	var dd = new Date();
	var datStr = new Array();
	for (i = 1; i < 4; i++){
		var ddiff = new Date();
		ddiff.setDate(dd.getDate()-i);
		var shift_date = ddiff.getUTCDate();
		//zero pad date
		if (shift_date < 10){
			var dateS = "0"+String(shift_date);
		}
		else{
			var dateS = String(shift_date);
		}
		var shift_month = ddiff.getUTCMonth()+1;
		//zero pad month
		if (shift_month < 10){
			var monthS = "0"+String(shift_month);
		}
		else{
			var monthS = String(shift_month);
		}
		var diff_year = ddiff.getUTCFullYear();
		datStr[i] = String(diff_year)+monthS+dateS;
	}
	return datStr;
}


// Added so that the julian day can be calculated
Date.prototype.getDOY = function() {
var onejan = new Date(this.getFullYear(),0,1);
return Math.ceil((this - onejan) / 86400000);
} 

function getStation(){
	var searchSta = document.getElementById("search").value;
	for (i=0;i<staList.length;i++){
		if (searchSta.toLowerCase() == staList[i].toLowerCase()){
			hotmarker.setPoint(coldmarkers[i].getPoint());
			hotmarker.importance=1000000;
			map.addOverlay(hotmarker);
			coldmarkers[i].openInfoWindowHtml(htmls[i]);
			window.setTimeout('mymouseout(i)', 2000);
		}
	}
}
	
function resetMap(){
			var search_html='<table><td>Station Search:<br><input id="search" type="text" style="width:70px;" name="searchbox" value="" onkeypress="if(event.keyCode==13){getStation()}"></td></table><table><td><input id="mybutton" type="submit" value="Search" onClick="getStation()"></td><td><input id="this1" type="button" value="Reset Map" onClick="resetMap();"></td></table>';
			document.getElementById("search_function").innerHTML=search_html;
			map.setCenter(new GLatLng( 45.4,-122.2), 6);
			}

