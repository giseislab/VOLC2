//<![CDATA[
/*This script is used to plot earthquakes on google maps. 
Author: Jon Connolly and Weston Thelen
Pacific Northwest Seismic Network, University of Washington.
thelenwes@gmail.com
Acknowledgements:
Many techniques were learned from the Mike Williams' Google Maps API Tutorial
http://econym.googlepages.com/index.htm
*/

Event.observe(window, 'load', function(){
	loadMap();
	getEqs();
	if (plotStas ==1){
		plotStations();
	}
	// GT
	if (plotVolcanoIcons ==1){
		plotVolcanoes();
	}
	$("plotVolcanoesTrue").observe('click', toggleVolcanoes);
	$("plotVolcanoesFalse").observe('click', toggleVolcanoes);
	
	//eqs
	$("eqAll").observe('click',shide);
	$("eq4").observe('click', shide);
	$("eq3").observe('click', shide);
	$("eq2").observe('click', shide);
	$("eq1").observe('click', shide);
	$("eq0").observe('click', shide);
	$("plotTime").observe('click', changePlot);
	$("plotDepth").observe('click', changePlot);
	$("plotStaTrue").observe('click', toggleStas);
	$("plotStaFalse").observe('click', toggleStas);
	//reset map view
	$('reset').observe('click', function(){
		initialPlot = 1;
		map.setCenter(new GLatLng(mapParam.lat, mapParam.lon), mapParam.zoom);
		killMarkers();
		getEqs();
		resetControl();
		clearXsec();
		toggleStas();
		plotStations();
		plotVolcanoes();
		document.getElementById("oneday").checked==false
		document.getElementById("range").checked==false
		document.getElementById("last").checked==true
		//document.getElementById("time_options").innerHTML=single_day_html;
		document.getElementById("plotStaTrue").checked==true
		document.getElementById("plotStaFalse").checked==false
		document.getElementById("plotVolcanoesTrue").checked==true
		document.getElementById("plotVolcanoesFalse").checked==false
	});
	
	//scriptacolous effects
	$('helpWebi').observe('click', function(){
		new Effect.BlindDown('webiHelpBox');
	});
	
	$('webiHelpClose').observe('click', function(){
		new Effect.BlindUp('webiHelpBox');
	});

	
	resetControl();
});



// unload handlers
window.unload = function(){
	GUnload();
};

//Global varaibles
var map;
var side_bar_html = "";
//var gmarkers = []; //Eq markers
//var markers = []; //Station markers
//var vmarkers = []; //Volcano markers
var count = 0;
var zIndex = 10000;
var depthOn = false; //if true, eq's plotted by depth, else eq's plotted by time
var webiList =[];
var eventArray = [];
var eqNum = 0; //number of events shown on map
var npts = 0;
var xmark1 = [];
var xmark2 = [];
var markIndex = 1000000;

function loadMap(defaultPoint1, defaultPoint2) {
	if (GBrowserIsCompatible()) {
		map = new GMap2($("map"));
		map.setCenter(new GLatLng(mapParam.lat, mapParam.lon), mapParam.zoom);
		map.setMapType(G_PHYSICAL_MAP);
		map.addMapType(G_HYBRID_MAP); //puts Satellite and Map in tool bar
		map.addMapType(G_PHYSICAL_MAP);//this allows the terrain map to appear in the toolbar
		map.addControl(new GOverviewMapControl()); //adds map overview map in bottom left corner.
		map.addControl(new GLargeMapControl()); //adds lefthand slider bar thingy
		map.addControl(new GHierarchicalMapTypeControl());//right-top nav bar
		map.addControl(new GScaleControl());//adds scale
		map.enableScrollWheelZoom();
		var mapNormalProj = G_PHYSICAL_MAP.getProjection();
if (npts == 0) {
	deltadegrees = 0.1;
	lat1 = mapParam.lat - deltadegrees;
	lon1 = mapParam.lon - deltadegrees;
	lat2 = mapParam.lat + deltadegrees;
	lon2 = mapParam.lon + deltadegrees;
	loc1 = new GLatLng(lat1, lon1);
	loc2 = new GLatLng(lat2, lon2);
	//getXsec();
}
		// Control cross section
		GEvent.addListener(map, 'click', function(overlay, point) {
		if (xsecExist == 0){
			//clearXsec();
			if (npts == 0){
				loc1 = point;
				xmark1 = new GMarker(point);
				map.addOverlay(xmark1);
				npts = 1;
			}
			else {
				if (npts==1){
					loc2 = point;
					xmark2 = new GMarker(point);
					map.addOverlay(xmark2);
					npts = 2;
					document.getElementById("xsec_options").innerHTML = twoClickXsec;
				}
			}
		}});
		//google.setOnLoadCallback(initializeXSec());
		//document.getElementById("time_options").innerHTML=single_day_html;
	}else{
	alert("Javascript must be enabled in order for you to use VOLC2. To view, you must first enable JavaScript in your browser options and try again");
	}
}

//Ajax to retrieve xml file for eqs
function getEqs(){
	$('loading').style.visibility = "visible";
	$('loadText').style.visibility = "visible";
	document.body.style.cursor="wait";
	if (initialPlot == 1){
		new Ajax.Request(
				eventXml20,
			{			
				method: "post",
				contentType: 'text/xml',
				onSuccess: parseEqs
			}
		);
	}
	else{
		//updateEqs();
		killMarkers();
		clearXsec();
		//alert("This is going to take a little while, be patient!");
		new Ajax.Request(
				eventXmlAll,
			{
				method: "post",
				contentType: 'text/xml',
				onSuccess: parseEqs2
			}
		);
	}
}

//parse eventXml20 XML file
function parseEqs(ajax){
	$('loading').style.visibility = "hidden";
	$("loadText").style.visibility = "hidden";
	document.body.style.cursor="default";
	
	if(window.ActiveXObject){ // If IE
	var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
	xmlDoc.loadXML(ajax.responseText);
	} else {
	var xmlDoc = ajax.responseXML;
	}
	var timeNow = xmlDoc.getElementsByTagName('merge')[0].getAttribute('fileTime_loc');
	timeUtc = xmlDoc.getElementsByTagName('merge')[0].getAttribute('fileTime_utc');
	updateTime(timeNow)
	var eventTag = xmlDoc.getElementsByTagName("event");
	eq_markers = new Array ();
		//for (var i = eventTag.length-1; i >= 0; i--) {//younger events first
		for (var i = 0; i <= eventTag.length-1; i++) {
			var param = eventTag[i].getElementsByTagName("param");
			var eqParam = new Hash();
			eqParam.set("id", eventTag[i].getAttribute("id"));
			for(var j = 0; j< param.length; j++){
                                var test = eqParam.get(param[j].getAttribute("name"));
                                if (test == null){
				eqParam.set(param[j].getAttribute("name"), param[j].getAttribute("value"));
                          }
			}
			eq = new Eq(eqParam);
		 	eventArray.push(eq); 
			map.addOverlay(eq.plotEq());
			eq.makeList();
			eqNum++;
			eq_markers.push(eq);
			if (eqNum > maxMarkerPlot){break;} 
		}
		$("numberEQs").innerHTML= eqNum;
}

//parse eventXmlAll XML file
function parseEqs2(ajax){
	$('loading').style.visibility = "hidden";
	$("loadText").style.visibility = "hidden";
	document.body.style.cursor="default";
	eventArray = [];
	eqNum = 0;
	gmarkers = [];
	count = 0;
	if(window.ActiveXObject){ // If IE
	  var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
	  xmlDoc.loadXML(ajax.responseText);
	} else {
	  var xmlDoc = ajax.responseXML;
	}
	var timeNow = xmlDoc.getElementsByTagName('merge')[0].getAttribute('fileTime_loc');
	timeUtc = xmlDoc.getElementsByTagName('merge')[0].getAttribute('fileTime_utc');
	updateTime(timeNow)
	var eventTag = xmlDoc.getElementsByTagName("event");
	eq_markers = new Array ();
	//for (var i = eventTag.length-1; i >= 0; i--) {//younger events first
	for (var i = 0; i <= eventTag.length-1; i++) {
		var param = eventTag[i].getElementsByTagName("param");
		var eqParam = new Hash();
		eqParam.set("id", eventTag[i].getAttribute("id"));
		for(var j = 0; j< param.length; j++){
		  var test = eqParam.get(param[j].getAttribute("name"));
		  if (test == null){
		    eqParam.set(param[j].getAttribute("name"), param[j].getAttribute("value"));
                  }
		}
		eq = new Eq(eqParam);
			
		var eqLoc = new Date(eqParam.get('year'), eqParam.get('month')-1, eqParam.get('day'), eqParam.get('hour'), eqParam.get('minute'), eqParam.get('second'));
		//var eqLoc = new Date(eq.loc);
		if (eqLoc>= date1 && eqLoc < date2) {
			eventArray.push(eq); 
			map.addOverlay(eq.plotEq());
			eq.makeList();
			eqNum++;
			eq_markers.push(eq);
			if (eqNum > maxMarkerPlot){ break;}
		}
	}
	$("numberEQs").innerHTML= eqNum;
}

//add time range earthquake parser
function updateEqs(){
	killMarkers();
	//clearXsec();
	eventArray = [];
	eqNum = 0;
	gmarkers = [];
	count = 0;
	$('loading').style.visibility = "hidden";
	$("loadText").style.visibility = "hidden";
	document.body.style.cursor="default";
	//-----------new stuff-----------------
	var request = GXmlHttp.create();
	request.open("GET", eventXmlAll, true);
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			var xmlDoc = GXml.parse(request.responseText);
			var eventTag = xmlDoc.documentElement.getElementsByTagName("event");
			eq_markers = new Array ();
			//for (var i = eventTag.length-1; i >= 0; i--) {//younger events first
			for (var i = 0; i <= eventTag.length-1; i++) {
				var param = eventTag[i].getElementsByTagName("param");
				var eqParam = new Hash();
				eqParam.set("id", eventTag[i].getAttribute("id"));
				for(var j = 0; j< param.length; j++){
						var test = eqParam.get(param[j].getAttribute("name"));
						if (test == null){
								eqParam.set(param[j].getAttribute("name"), param[j].getAttribute("value"));
						}
				}
				eq = new Eq(eqParam);
				var eqLoc = new Date(eqParam.get('year'), eqParam.get('month')-1, eqParam.get('day'), eqParam.get('hour'), eqParam.get('minute'), eqParam.get('second'));
				//var eqLoc = new Date(eq.loc);
				if (eqLoc>= date1 && eqLoc < date2) {
					eventArray.push(eq); 
					map.addOverlay(eq.plotEq());
					eq.makeList();
					eqNum++;
					eq_markers.push(eq);
				if (eqNum > maxMarkerPlot){ break;}
			    }
		     }
		     $("numberEQs").innerHTML= eqNum;
		    }}
	request.send(null);
}
	

//add listener to sidebar list items
function myclick(count) {
        GEvent.trigger(gmarkers[count], "click");
}

//////the following three functions are to manage the user checkbox clicks////////////

//show or hide (shide) selected markers
function shide(){ // GT: Looks like this controls only which magnitude range is shown
	var grp = this.id;
	var checked = this.checked;
	checkBoxes(grp);
	manageList(grp, checked);
	if (grp == "eqAll"){
		eqNum = 0;
	}
	for (var i=0; i<gmarkers.length; i++) {
		if (grp == "eqAll"){ //if 'eqall' button is clicked(shows all or hides all)
			if(checked){
				gmarkers[i].show();
				eqNum++;
			}else{
				if(gmarkers[i].grp.substr(0,2) =='eq' ){
					gmarkers[i].hide();
					eqNum--;
					map.closeInfoWindow();
				}	
			}
		}else{
			if (gmarkers[i].grp == grp){//individual button clicked
				if(checked){
        			gmarkers[i].show();
					eqNum++;
				}else{
					gmarkers[i].hide();
					eqNum--;
					map.closeInfoWindow();
				}	
			}
		}
	}  	
	$("numberEQs").innerHTML= eqNum;
	updateXsec();
}

//manages checkboxes, markers and list for case when 'eqAll' is checked or another button is checked when
//eqAll is already checked
function checkBoxes(grp){
	var listAll = $('eqlist').childElements();
	if (grp == "eqAll"){//uncheck all boxes when 'eqall is clicked
		for(var i =0; i < 5; i++){
			$('eq' + i).checked = false;
		}
		for(var i= 0; i < listAll.length; i ++){
			$('eqAll').checked? listAll[i].show(): listAll[i].hide();
		}
	}else{ //remove all icons/list-items if all is checked when another button is checked
		if($('eqAll').checked){
			for (var i=0; i<gmarkers.length; i++){
				if(gmarkers[i].grp.substr(0,2) =='eq' ){
					gmarkers[i].hide();
					eqNum--;
				}
			}
			for(var i= 0; i < listAll.length; i ++){
				listAll[i].hide();
			}
		}
		$('eqAll').checked = false;
	}
}

function manageList(grp,checked){
	var list = $$("."+ grp);
	for(var i = 0; i < list.length; i++){
		if(checked){
			list[i].show();
		}else{
			list[i].hide();
		}
	}
}

// Updates event array passed to cross section based on which magnitudes are selected
function updateXsec(){
	//If EqAll is checked...piece of cake
	if($('eqAll').checked){
		//Cross-section variables
		eq_markers = eventArray;	//Copy whole array and send to plotter
	}
	else {	//Now things get interesting or shitty...depends on your perspective I guess
		eq_markers = [];
		//Loop over gmarkers
		for (j = 0; j < gmarkers.length;j++){
			for (i = 0; i < 5; i++){
				cgrp = 'eq' + i;	//Assign group
				if (gmarkers[j].grp == cgrp && $('eq'+ i).checked ){	//If earthquake belongs to proper group and group is checked
					eq_markers.push(eventArray[j]);
					break;	//earthquake canÕt be part of 2 groups
				}
			}
		}		
	}
	// Update cross-section (if it exists)
    if (xsecExist ==1 && TDExist ==0 && CMMExist ==0){
    	getXsec();
    }
    if (xsecExist ==1 && TDExist ==1){
    	timeDepthPlot();
    }
    if (xsecExist==1 && CMMExist==1){
    	cumEnergy();
    }
}

function updateTime(t){
	span = $$('#time span')[0];
	span.innerHTML ='' ;
	span.innerHTML = t;
}

//switch between depth and time plots
function changePlot(){
	map.closeInfoWindow();
	killMarkers();
	resetControl();
	count = 0;
	if(this.id =="plotDepth"){
		depthOn = true;
		if (typeof(req)=="undefined"){
			$('legend').src = "images/legendVolcDepth.png";
		}else{
		    if (req == 1){
		    	$('legend').src = "images/legendVolcDepthRegional.png";
		     }else{
		     	//if (symSize == 1){
		     	//	$('legend').src = "images/legendVolcDepthSm.png";
		     	//}else{
		     		$('legend').src = "images/legendVolcDepth.png";
		     //	}
		     }
		}
	}else{
		depthOn = false;
		// Check to see which kind of time legend should be used
		if (typeof(req)=="undefined"){
			$('legend').src = "images/legendVolcTime.png";
			$('legend').src = "images/legendVolc2TimeRange.png";
		}else{
		     if (req == 1){
		     	$('legend').src = "images/legendVolc2week.png";
		     }else{
		     	if (symSize == 1){
		     		$('legend').src = "images/legendVolcTimeSmSym.png";
		     		$('legend').src = "images/legendVolc2TimeRange.png";
		     	}else{
		     		$('legend').src = "images/legendVolcTime.png";
		     		$('legend').src = "images/legendVolc2TimeRange.png";
		     	}
		     }
		}
	}
	getEqs();
}
//Either plot the stations or do not plot the stations based on the button toggle
function toggleStas(){
	map.closeInfoWindow();
	count = 0;
	if(this.id =="plotStaTrue"){
		plotStas = 1;
		plotStations();
	}else{
		plotStas = 0;
		for (var i = 0; i<stamarker.length; i++){
			stamarker[i].remove();
		}
	}
}
//Either plot the volcanoes or do not plot the volcanoes based on the button toggle
function toggleVolcanoes(){
	map.closeInfoWindow();
	count = 0;
	if(this.id =="plotVolcanoesTrue"){
		plotVolcanoIcons = 1;
		plotVolcanoes();
	}else{
		plotVolcanoIcons = 0;
		for (var i = 0; i<volcanomarker.length; i++){
			volcanomarker[i].remove();
		}
	}
}
//kill all markers and re-plot eqAll when when plot by time/depth is clicked
function killMarkers(){
	$("eqlist").innerHTML =""; 
	for(var i = 0; i< gmarkers.length; i++){
		gmarkers[i].remove();
	}
	eqNum = 0;
}
//resets buttons on plot change and refresh
function resetControl(){
	$("eqAll").checked = true; 
	for(var i =0; i < 5; i++){
		$('eq' + i).checked = false;
	}
	//$("time_options").innerHTML=single_day_html;
	//killMarkers();
	//loadMap();
	//getEqs();
}

// Clear markers from cross section
//function clearXmarks(){
//	map.removeOverlay(xmark1);
//	map.removeOverlay(xmark2);
//}
/////////////////begin Earthquake class//////////////

Eq = Class.create({
	initialize: function(eq){
		this.eId = eq.get('id');
		//this.net = eq.get('network-code'); // edited out by GT
		this.net = network_code; // GT: this is now a global created in index.php and loaded from volc2config.xml
		this.ver = eq.get('version');
		this.yr = eq.get('year');
		this.mon = eq.get('month');
		this.day = eq.get('day');
		this.hr = eq.get('hour');
		this.min = eq.get('minute');
		this.sec = eq.get('second');
		this.lat = eq.get('latitude');
		this.lon = eq.get('longitude');
		this.dep = eq.get('depth');
		this.mag = eq.get('magnitude');
		this.loc = eq.get('local-time')
		this.icon = eq.get('icon-style');
		this.listId;
		this.marker;
		this.point = new GLatLng(this.lat, this.lon);
		this.epoch = new Date(this.yr, this.mon-1, this.day, this.hr, this.min, this.sec); //Month is 0-11 in JavaScript
		this.age = this.getAge();
	},
	//create a date string
	getDate: function(){
		if (this.sec < 10){
			return 	(this.yr + "/" + this.mon + "/" + this.day
				+ " " + this.hr + ":" + this.min + ":0" + this.sec.substr(1,1));
		}
		else{
		  return 	(this.yr + "/" + this.mon + "/" + this.day
		    + " " + this.hr + ":" + this.min + ":" + this.sec.substr(0,2));
		}
	},
	
	getAge: function(){
	  //Get 1 day in milliseconds
	  one_day=1000*60*60*24;
	  today=new Date();
	  age=today-this.epoch;
	  ageInDays = age/one_day;
	  return ageInDays;
	},
	
	//plot the earthquake
	plotEq: function(){
		side_bar_html = "";
		//plot either depth or time
		if(depthOn){
			var image = this.getDepthIcon();
		}else{
			//var image = this.icon;
			var image = this.getAgeIcon();
		}
		if(this.net.toUpperCase() != authorNW){
			image += "_nonNet";
		}
		var siz = this.getMag();
		var grp = "eq" + this.mag.charAt(0);//sets up marker groups
		//The following allows for plotting based on date
		var eqDate = new Date( this.yr, this.month-1, this.day, this.hour, this.min, this.sec);
		
		eqIcon = new GIcon();
		eqIcon.image = "images/icon_" + image + ".png";
		eqIcon.iconSize = new GSize(siz, siz);
		eqIcon.iconAnchor = new GPoint(siz/2, siz/2);
		eqIcon.infoWindowAnchor = new GPoint(siz/2, siz/2);	
		var markerOptions = {icon:eqIcon, zIndexProcess:this.order};
		this.marker = (new GMarker(this.point, markerOptions));
		this.listId = "listId" + count; //give each a unique id so an open window will highlight the list-item
		var listId = this.listId;
		this.updateWindow();
		GEvent.addListener(map,"infowindowclose", function() { //resores list-item to un-highlighted
			$(listId).style.backgroundColor="#ffffff";
		});
		this.marker.grp = grp; //add group id to each marker
		this.marker.eqDate = eqDate;	//add date to each marker
		//the following is to set up the sidebar list
		gmarkers[count] = this.marker;

		side_bar_html = "javascript:myclick(" + count + ")";

		return this.marker;
	},
	
	//determine magnitude to size icons
	getMag: function(){
	    if (typeof(symSize)=="undefined"){
			var scale = 10; //these allow for tuning the size of icons (was 4)
			}else{
		     if (symSize == 1){
		     	scale = 4;
		     }else{
		     	scale = 10;
		     }
		}
		var base =5;
		if (this.mag <= 0){
			magAdjust = 0.1;
		}else{
			magAdjust = this.mag;
		}
		//return size = magAdjust * scale + base;
		return size = (magAdjust * 5 + 5) * 2.0;

	},
	
	//check depth of event to assign proper colored icon
	 getDepthIcon: function(){
		var z = this.dep;
		if (vdepth ==1){
			if (z < 1){
				return "1";
			}
			if (z < 3){
				return "blueGreen";
			}
			if (z < 5){
				return "green";	
			}
			if (z < 7){
				return "2";
			}
			if (z < 9){
				return "orange"
			}
			if(z < 1000){
				return "0"
			}
		}
		else{
		if (z < 10){
			return "1";
		}
		if (z < 20){
			return "blueGreen";
		}
		if (z < 30){
			return "green";	
		}
		if (z < 40){
			return "2";
		}
		if (z < 50){
			return "orange";
		}
		if(z < 1000){
			return "0";
		}}
	},
	
	//check age of event to assign proper colored icon
	 getAgeIcon: function(){
		var days = this.age;
		if (days < 1){
			return "1";
		}
		if (days < 7){
			return "blueGreen";
		}
		if (days < 30){
			return "green";	
		}
		if (days < 365){
			return "2";
		}
		return "orange";
	},	
	//create the side bar
	makeList: function(){
		var z = this.dep.split(".")[0];
		//if (z < 10){
		//	z = "0" + z;
		//}
		z +=" km"
		var grp = "eq" + this.mag.charAt(0);//sets up marker classes based on mag
		var li  = document.createElement("li");
		Element.extend(li); //IE
		li.id = "listId" + count;
		li.addClassName(grp);
		var a = document.createElement("a");
		a.href = side_bar_html;
		if(this.mag >=3){//give mag 3 and greater red font
			Element.addClassName(a, "m3");
		}else{
			Element.addClassName(a, "msmall");
		}
		a.innerHTML= this.mag + " " + this.getDate() + " " + z; 
		li.appendChild(a);
		$("eqlist").appendChild(li);
		count ++;
	},
	
	//plots most recent on top
	order: function(){
		//return zIndex ++;
		return zIndex --;
	},
	
	//creates and updates window. This function also creates a list
	//of  the event's webicorders sorted by distance from event
	updateWindow: function(){
		var windowHtml = this.getHtml();
		var emarker = this.marker;
		var listId = this.listId;
		var point = this.point;
		var time = this.yr + this.mon + this.day + this.hr;
		var mag = this.mag;
		//add listeners and html to windows
		GEvent.addListener(emarker, "click", function() {
		    emarker.openInfoWindowHtml(windowHtml);
			$(listId).style.backgroundColor = "yellow";
		  });
		/* this.mag was empty so I removed this
		GEvent.addListener(emarker, "mouseover", function() {
		    emarker.openInfoWindowHtml($(mag).toFixed(1));
		  });
		GEvent.addListener(emarker, "mouseout", function() {
		    emarker.closeInfoWindow();
		  });
		*/	
	},
	
	//html for info window
	getHtml: function(){
		//var name = ["Magnitude: ", "Time (UTC):", "Time (Local):", "Depth (Km): ", "Event Id:", "Epoch time:", "Age (Days):" ];
		var name = ["Magnitude: ", "Time (UTC):", "Depth (km): ", "Epicentral distance (km):", "Coordinates:", "Age (days):", "Event Id:" ];
		var eqDate = new Date(this.yr, this.mon, this.day, this.hr, this.min, this.sec);
		var noPage = new Date();
		noPage.setDate(noPage.getDate()-14);
		var pointEq = new GLatLng(this.lat, this.lon);
		var pointVol = new GLatLng(mapParam.lat, mapParam.lon);
		var eqVolDistance = pointEq.distanceFrom(pointVol) / 1000;
		//var param = [this.mag, this.getDate(), this.loc, this.dep, this.eId, this.epoch, this.age.toFixed(1) ];
		var param = [this.mag, this.getDate(), this.dep, eqVolDistance.toFixed(1), this.lat + " " + this.lon, this.age.toFixed(1), this.eId];
		var html = "<div class = 'eqWin'> \n";
		if (eqDate > noPage ){
			if (this.net != "AK") {
				var link = getLink(this.net, this.eId);
				link += "View Event Page</a>";
				html += link;	
			}
			html += "<ul> \n";
			for (var i = 0; i < name.length; i++){
				html += "<li>" + name[i]  + "<span>" + param[i] + "</span> </li> \n";
			}
			html += "</ul>";
			}
		else{
			//html +="Event Page Unavailable";
			html += "<ul> ";
			for (var i = 0; i < name.length; i++){
					html += "<li>" + name[i]  + "<span>" + param[i] + "</span> </li> \n";
			}
			html += "</ul>";
		}
		return html; 
	}
});
