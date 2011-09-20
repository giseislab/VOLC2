var date1 = Date(2009, 06, 31);
var date2 = Date(2009, 08, 15);
var eventXmlAll = "xml/bakerAll.xml";

function getEqsRange(date1, date2){
	$('loading').style.visibility = "visible";
	$('loadText').style.visibility = "visible";
	document.body.style.cursor="wait";
	new Ajax.Request(
			eventXmlAll,
		{
			method: "post",
			contentType: 'text/xml',
			onSuccess: updateEQs
		}
	);
}

//add time range earthquake parser
function updateEQs(ajax){
//killMarkers();
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
	for (var i = eventTag.length-1; i >= 0; i--) {//younger events first
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
	var eqDate = new Date(eq.yr, eq.mon-1, eq.day, eq.hr, eq.min, eq.sec);
	if (eqDate >= date1 && eqDate < date2) {
		//eventArray.push(eq); 
		//map.addOverlay(eq.plotEq());
		//eq.makeList();
		document.write(eqDate.toDateString());
		eqNum++;
		if (eqNum > maxMarkerPlot){ break;}
	}
}
$("numberEQs").innerHTML= eqNum;
}

/////////////////begin Earthquake class//////////////

Eq = Class.create({
	initialize: function(eq){
		this.eId = eq.get('id');
		//this.net = eq.get('network-code');
		this.net = "UW";
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
	},
	//create a date string
	getDate: function(){
		return 	(this.yr + "/" + this.mon + "/" + this.day
				+ " " + this.hr + ":" + this.min + ":" + this.sec.substr(0,2));
	},
	
	//plot the earthquake
	plotEq: function(){
		side_bar_html = "";
		//plot either depth or time
		if(depthOn){
			var image = this.getDepth();
		}else{
			var image = this.icon;
		}
		if(this.net.toUpperCase() != authorNW){
			image += "_nonNet";
		}
		var siz = this.getMag();
		var grp = "eq" + this.mag.charAt(0);//sets up marker groups
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

		//the following is to set up the sidebar list
		gmarkers[count] = this.marker;

		side_bar_html = "javascript:myclick(" + count + ")";

		return this.marker;
	},
	
	//determine magnitude to size icons
	getMag: function(){
		var scale = 8; //these allow for tuning the size of icons (was 4)
		var base =5;
		return size = this.mag * scale + base;
	},
	
	//check depth of event to assign proper colored icon
	 getDepth: function(){
		var z = this.dep;
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
			return "orange"
		}
		if(z < 1000){
			return "0"
		}
	},
	
	//create the side bar
	makeList: function(){
		var z = this.dep.split(".")[0];
		if (z < 10){
			z = "0" + z;
		}
		z +=" Km"
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
		return zIndex --;
	},
	
	//creates and updates window. This function also creates a list
	//of  the event's webicorders sorted by distance from event
	updateWindow: function(){
		var windowHtml = this.getHtml();
		var marker = this.marker;
		var listId = this.listId;
		var point = this.point;
		var time = this.yr + this.mon + this.day + this.hr;
		//add listeners and html to windows
		GEvent.addListener(marker, "click", function() {
		    marker.openInfoWindowHtml(windowHtml);
			$(listId).style.backgroundColor = "yellow";
		  });
	},
	
	//html for info window
	getHtml: function(){
		var name = ["Magnitude: ", "Time (UTC):", "Time (Local):", "Depth (Km): ", "Event Id:" ];
		var eqDate = new Date(this.yr, this.mon, this.day, this.hr, this.min, this.sec);
		var noPage = new Date();
		noPage.setDate(noPage.getDate()-14);
		var param = [this.mag, this.getDate(), this.loc, this.dep, this.eId ];
		var html = "<div class = 'eqWin'> \n";
		if (eqDate > noPage ){
		var link = getLink(this.net, this.eId);
		link += "View Event Page</a>";
		html += link;	
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
