//var staXML = "purplepig/sta_file_AK.xml";
var server = 'pubavo1.wr.usgs.gov';
var port = '16022';
var staList = [];
var side_bar_html = "";

var hot_icon = new GIcon();
hot_icon.shadow = null;
hot_icon.iconSize = new GSize(19, 16);
hot_icon.shadowSize = new GSize(0,0);
hot_icon.iconAnchor = new GPoint(3,3);
hot_icon.image = "images/hotsta.png";
var hotmarker = new GMarker (new GLatLng(0, 0), {icon:hot_icon, zIndexProcess:importanceOrder});


var thisIcon = new GIcon();
thisIcon.shadow=null;
thisIcon.iconSize=new GSize(11,11);
thisIcon.shadowSize = new GSize(0,0);
thisIcon.iconAnchor = new GPoint(0,0);
thisIcon.infoWindowAnchor=new GPoint(11,0);

var SP_icon = new GIcon(thisIcon, "images/staPict_SP.png", null);
SP_icon.iconSize=new GSize(15,13);
var BB_icon = new GIcon(thisIcon, "images/staPict_BB.png", null);
BB_icon.iconSize=new GSize(15,13);
var SM_icon = new GIcon(thisIcon, "images/staPict_SM.png", null);
SM_icon.iconSize=new GSize(15,13);
var mobile = isMobile();
if (mobile == 1){
	SP_icon.iconSize=new GSize(25,25);
	BB_icon.iconSize=new GSize(25,25);
	SM_icon.iconSize=new GSize(25,25);
}

var coldmarkers = [];
var htmls = [];
var markeridx = 0;
var url1='http://'+server+':'+port+'/heli?code=';
var url2='&w=1280&h=1024&tc=10&t1=-';
var d = new Date();
if ((d.getTimezoneOffset()/60) == 9){
	var url3='&tzo=-9&tza=AKST';
}
else {
	var url3='&tzo=-8&tza=AKDT';
}
// var url3='&tzo=-10&tza=HST';
var pdfurl1 = 'http://www.iris.edu/servlet/quackquery/plotcache/pdf_E';
var webiarc = 'http://www.hvointernal.wr.usgs.gov/web/heliArchive/';


function plotStations() {
	var LAB = '<a style="color: #6487A1; font-size:90%; font-family:arial;">';
	var vals = '<a style="color: #666666; font-size:90%; font-family:arial;">';
	var request = GXmlHttp.create();
	request.open("GET", staXML, true);
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
				var volpoint = new GLatLng(mapParam.lat,mapParam.lon);
				var staVolDistance = stapoint.distanceFrom(volpoint)/1000;
				var staname = markers[i].getAttribute("station");
				staList[i] = staname;
				var stachannel = markers[i].getAttribute("channel");
				if (stachannel.substr(2,1)=='E' || stachannel.substr(2,1)=='1'){
					stachannel=stachannel.substr(0,2)+'Z'; //Vertical channels
				}
				var stanetwork = markers[i].getAttribute("network");
				//var stanetwork = "UW";
				var statype = markers[i].getAttribute("type");
				var url4=url3;
				if (statype=="BB" || statype=="SM") {
					url4=url3+'&fc=1';
				}
				
				//Archive filename construction (12 and 24 hour helicorders)
				//var arch12= webiarc+staname+'_'+stachannel+'_'+stanetwork+'_--.'+String(dat[0])+dat[1]+dat[2]+'00_12.png';
				//var arch24= webiarc+staname+'_'+stachannel+'_'+stanetwork+'_--.'+String(dat[0])+dat[1]+dat[2]+'00_24.png';
				
				//Dynamic links
				// 6 hour
				var hr6 = url1+staname+'_'+stachannel+'_'+stanetwork+url2+'6'+url4;
				var hr12 = url1+staname+'_'+stachannel+'_'+stanetwork+url2+'12'+url4;
				var hr24 = url1+staname+'_'+stachannel+'_'+stanetwork+url2+'24'+url4;
				
				//Construct html code
				var html6 = '<a class="webi" href="'+hr6+'" target="_blank">';
				var html12 = '<a class="webi" href="'+hr12+'" target="_blank">';
				var html24 = '<a class="webi" href="'+hr24+'" target="_blank">';
				//var html12 = '<a class="webi" href="'+arch12+'" target="_blank">';
				//var html24 = '<a class="webi" href="'+arch24+'" target="_blank">';
				var stahtml = LAB+'Station: </a>'+vals+staname+'</a><br/>'+LAB+'Station Type: </a>'+vals+statype+'</a><br/>'+LAB+'Distance (km): </a>'+vals+staVolDistance.toFixed(1)+'</a><br/>'+LAB+'Webicorder: </a>';
				stahtml=stahtml+vals+html6+'6hr</a>';
				stahtml=stahtml+' | '+vals+html12+'12hr</a>';
				stahtml=stahtml+' | '+vals+html24+'24hr</a><br>';
				
				// Archive Webicorder links (previous days)
				var dd = getPreviousDates();
				var webi1 = '<a class="webi" href="'+webiarc+staname+'_'+stachannel+'_'+stanetwork+'_--.'+dd[1]+'00.png" target="_blank">';
				//stahtml=stahtml+ LAB+'Webicorder Archive: </a>'+vals+webi1+'1 day ago</a>';
				var webi2 = '<a class="webi" href="'+webiarc+staname+'_'+stachannel+'_'+stanetwork+'_--.'+dd[2]+'00.png" target="_blank">';
				//stahtml=stahtml+ ' | '+vals+webi2+'2 days ago</a>';
				var webi3 = '<a class="webi" href="'+webiarc+staname+'_'+stachannel+'_'+stanetwork+'_--.'+dd[3]+'00.png" target="_blank">';
				//stahtml=stahtml+ ' | '+vals+webi3+'3 days ago</a>';
				
				if (pdf == 1){
				// PDF links
				// 1 day pdf link
				if (curr_jday-1 < 1){
					var syear = dat[0]-1;
					var eyear = dat[0];
					var sjday = 364;
					var ejday = curr_jday;
					} else {
					var eyear = dat[0];
					var syear = dat[0];
					var sjday = curr_jday-1;
					var ejday = curr_jday;
				}
				var pdf1 = String(eyear)+'.'+String(ejday)+'_S'+String(syear)+'.'+String(sjday-1)+'_c'+stachannel+'_l++_n'+stanetwork+'_s'+staname+'.png';
				// 1 week pdf link
				if (curr_jday-8 < 1){
					var syear = dat[0]-1;
					var eyear = dat[0];
					var sjday = 365+(curr_jday-8);
					var ejday = curr_jday;
					} else {
					var eyear = dat[0];
					var syear = dat[0];
					var sjday = curr_jday-8;
					var ejday = curr_jday;
				}
				var pdfWeek = String(eyear)+'.'+String(ejday)+'_S'+String(syear)+'.'+String(sjday-1)+'_c'+stachannel+'_l++_n'+stanetwork+'_s'+staname+'.png';
				// 1 month pdf link
				if (curr_jday-30 < 1){
					var syear = dat[0]-1;
					var eyear = dat[0];
					var sjday = 365+(curr_jday-30);
					var ejday = curr_jday;
					} else {
					var eyear = dat[0];
					var syear = dat[0];
					var sjday = curr_jday-30;
					var ejday = curr_jday;
				}
				var pdfMonth = String(eyear)+'.'+String(ejday)+'_S'+String(syear)+'.'+String(sjday-1)+'_c'+stachannel+'_l++_n'+stanetwork+'_s'+staname+'.png';
				// 1 year pdf link
				var syear = dat[0]-1;
				var eyear = dat[0];
				var sjday = curr_jday;
				var ejday = curr_jday;
				var pdfYear = String(eyear)+'.'+String(ejday)+'_S'+String(syear)+'.'+String(sjday-1)+'_c'+stachannel+'_l++_n'+stanetwork+'_s'+staname+'.png';
				//stahtml=stahtml+LAB+'<br> PDF: <a class="webi" href= "'+pdfurl1+pdfWeek+'" target="_blank"> 1 week </a>';
				//stahtml=stahtml+'| <a class="webi" href= "'+pdfurl1+pdfMonth+'" target="_blank"> 1 month </a>';
				//stahtml=stahtml+'| <a class="webi" href= "'+pdfurl1+pdfYear+'" target="_blank"> 1 year </a>';
				}
				
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
	var marker = new GMarker(point,{icon:new_icon, zIndexProcess:importanceOrder});
  	GEvent.addListener(marker, "click", function() {
		marker.openInfoWindowHtml(html);
	});
  	/* Remove mouseover because cannot click helicorders
	GEvent.addListener(marker, "mouseover", function() {
		marker.openInfoWindowHtml(name);
	});
	*/	
  	GEvent.addListener(marker, "mouseout", function() {
		marker.closeInfoWindow();
	});
	marker.importance=markeridx+order;
	coldmarkers.push(marker);
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


function makeList(name) {
  var li  = document.createElement("li");
  Element.extend(li); //IE
  li.id = "listId" + markeridx;
  var a = document.createElement("a");
  a.href = side_bar_html;
  a.value = markeridx;
  a.onmouseover = function(){mymouseover(this.value);};
  a.onmouseout = function(){mymouseout(this.value);};
  a.innerHTML= name;
  li.appendChild(a);
  $("side_bar").appendChild(li);
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

