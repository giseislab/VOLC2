//Cross section functions-----------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------

// Global Variables -------------------------------------------------------------------------------------------
//var km2deglat = 111.132;		//Approximate conversion from km to deg latitude
//var km2deglon = 78.847;
var W = [];		//Half width of rectangle
var pi = 3.14159;	//Yeah I know it is implemented as Math.PI...shut up
var plotData = [];
var Xpoly = [];
var pix1 = [];
var pix2 = [];

//Using the two endpoints of the line, find the corners of the rectange that make the width 2W and plot X-section
// Variables loc1, loc2, eq_markers are defined in volc2Param_????.js
function getXsec(){
	TDExist = 0;
	CMMExist = 0;
	CCExist = 0;
	if (xsecExist == 0){		//xsecExist should only be 1 at this point if it is coming in from the shide function
		// Calculate rectangle for cross section and plot on map-----------------------
		doRectangle();
	}
	
	// Check if points are within polygon--------------------------------------------------
	plotData = [];
	for (var i = 0; i <= eq_markers.length-1;i++){
		var pt = eq_markers[i].point;
		//Following function is from gmaps.polygon.containsLatLng
		var inPoly = Xpoly.containsLatLng(pt);
		if (inPoly){
			//Project earthquake onto cross section
			projPt = projectEq(pix1, pix2, map.fromLatLngToContainerPixel(pt));
			distX = loc1.distanceFrom(projPt)/1000;		//Distance initially returned in meters
			//Add to array for plotting
			var depth = -1*parseFloat(eq_markers[i].dep)+corr;			// Correct based on velocity model datum
			plotData.push([distX, depth]);
			}
	  }
	
	// Plot the cross-section already--------------------------------------------------------
	xsecLength = Math.ceil(loc1.distanceFrom(loc2)/1000);
	plotXsec(xsecLength);
	// Update html
	document.getElementById("xsec_options").innerHTML=
		'<table><td>Cross Section Options:</td></table>' + 
		'<table><td><input id="this1" type="button" value="Time-Depth Plot" onClick="timeDepthPlot()"></td>' +
		'<td><input id="this1" type="button" value="Cumulative Energy" onClick="cumEnergy()"></td></table>' +
		'<table><td><input id="this1" type="button" value="Cumulative Counts" onClick="cumCounts()"></td>' +
		'<td><input id="this1" type="button" value="Clear X-Section" onClick="clearXsec()"></td></table>';
}	



// Projects earthquake onto line (input is pixels, output is lat/lon)
// Confusing? Yes.  Just be glad you didn't have to write it yourself
function projectEq(pix1, pix2, eqPix){
	var m = (pix2.y-pix1.y)/(pix2.x-pix1.x);			//slope of the line
	var b = pix1.y-(m*pix1.x);								//y intercept
	var c = eqPix.x;
	var d = eqPix.y;
	var y = ((m*m)*d + m*c + b)/((m*m)+1);
	var x = (m*d + c - m*b)/((m*m)+1);
	var projPx = new GPoint(Math.round(x), Math.round(y));
	var projPt = map.fromContainerPixelToLatLng(projPx);
	return projPt;
}

//Plot cross-section
function plotXsec( xsecLength){
	//--------------------------------------------------------------------------------------------------
	//Get tickmark delta on x axis based on length of cross-section
	var xTicks = [];
	tickDelta = 500;
	if (xsecLength <= 500){
		tickDelta = 100;
		}
	if (xsecLength <= 100){
		tickDelta = 10;
		}
	if (xsecLength <= 50){
		tickDelta = 5;
		}
	if (xsecLength <= 10){
		tickDelta = 1;
		}
	for (i = 0; i <= xsecLength; i=i+tickDelta){
		xTicks.push(i);
		}
	//--------------------------------------------------------------------------------------------------
	//--------------------------------------------------------------------------------------------------
	// Plot cross-section
	f = Flotr.draw(
		$('chart_div'),[ 
			{data:plotData, label:'eq_Xsec', lines: {show: false}, points: {show: true, radius: 5, fill: false}}
		],{
			title: 'Cross-Section',
			fontSize: 14,
			xaxis:{
				tickDecimals: 0,
				min: 0,	 // => part of the series is not displayed.
				max: xsecLength,	// => part of the series is not displayed.
				ticks: xTicks,
				title: 'Distance from first point, km'
			},
			yaxis:{
				max: 4,
				tickDecimals: 0,
				noTicks: 10,
				title: 'Elevation, km',
				autoscaleMargin: 5
			},
			grid:{
				verticalLines: true,
				backgroundColor: 'white'
			},
			HtmlText: false,
			legend: {
				show: false
			}
	});
	xsecExist = 1;
	//--------------------------------------------------------------------------------------------------
}

function IsNumeric(sText)
{
   var ValidChars = "0123456789.";
   var IsNumber=true;
   var Char;
   for (i = 0; i < sText.length && IsNumber == true; i++) 
      {Char = sText.charAt(i); 
      if (ValidChars.indexOf(Char) == -1) 
         {IsNumber = false;}}
   	  return IsNumber; }

function clearXsec(){
	// Clear chart
	document.getElementById("chart_div").innerHTML="";
	document.getElementById("xsec_options").innerHTML=initialXsec;
	// Clear markers
	//clearXmarks();
	map.removeOverlay(xmark1);
	map.removeOverlay(xmark2);
	// Clear polygon
	map.removeOverlay(Xpoly);
	loc1 = [];
	loc2 = [];
	npts = 0;
	xsecExist = 0;
	TDExist = 0;
	CMMExist = 0;
	CCExist = 0;
	}
	
	function doRectangle(){
		var LLUR = 0;
		var ULLR = 0;
		var LRUL = 0;
		var URLL = 0;
		// Get half width of cross-section -------------------------------------------------
		var fullWidth = document.getElementById("Xwidth").value;
		if (IsNumeric(fullWidth)){
			W = fullWidth/2; }
		else{
			W = 5; }
		//--------------------------------------------------------------------------------------------------------	
		// Get angle of cross section wrt a horizontal line  ---------------------------
		// Pixel coordinate system
		// x  coordinate increases to the right, and the y coordinate increases downwards
		pix1 = map.fromLatLngToContainerPixel(loc1);
		pix2 = map.fromLatLngToContainerPixel(loc2);
		var phirad = Math.atan(((pix2.y-pix1.y)/(pix2.x-pix1.x)));   //output in radians
		var phideg = Math.abs((180/pi)*phirad);		//convert from radians to degrees for debugging
		//--------------------------------------------------------------------------------------------------------
	
		// Adjust based on which sector was clicked first------------------------------------------
		// x  coordinate increases to the right, and the y coordinate increases downwards
		//Lower left to upper right
		if ( pix1.x < pix2.x  && pix1.y > pix2.y){
			LLUR = 1;
			}
		//Upper left to lower right
		if ( pix1.x < pix2.x && pix1.y < pix2.y){
			ULLR = 1;
			}
		//Lower right to upper left
		if ( pix1.x > pix2.x && pix1.y > pix2.y ){
			//swap points so it acts like ULLR
			LRUL = 1;
			pixTemp = pix2;
			pix2 = pix1;
			pix1 = pixTemp;
			}
		//Upper right to lower left
		if ( pix1.x > pix2.x && pix1.y < pix2.y ){
			URLL = 1;
			//swap points so it acts like LLUR
			pixTemp = pix2;
			pix2 = pix1;
			pix1 = pixTemp;
			}	
		//--------------------------------------------------------------------------------------------------------
	
		//Calculate distance of pixel (Distance originally in meters)-----------------------------
		var p1=map.fromContainerPixelToLatLng(new GPoint(300,250));
		var p2=map.fromContainerPixelToLatLng(new GPoint(300,251));
		var ydist = p1.distanceFrom(p2)/1000;		//In km
		var p3=map.fromContainerPixelToLatLng(new GPoint(301,250));
		var xdist = p1.distanceFrom(p3)/1000;		//In km 
		//--------------------------------------------------------------------------------------------------------
		
		// Find latitude and longitude offsets (in pixels)-----------------------------------------
		// Absolute value allows me to be even sloppier with my math
		var dely = Math.abs(W/ydist* Math.sin((pi/180)*(90-phideg)));	//Convert to radians dummy
		var delx = Math.abs(W/xdist * Math.cos((pi/180)*(90-phideg)));
	
		// Get rectangle vertex points---------------------------------------------------------------------------
		// In pixels (despite name)
		//Point one is furthest south, and subsequent points are ccw
		if (ULLR == 1 || LRUL==1){
		var clat1 = pix2.y+dely;
		var clon1 = pix2.x-delx;
		var clat2 = pix2.y-dely;
		var clon2 = pix2.x+delx;
		var clat3 = pix1.y-dely;
		var clon3 = pix1.x+delx;
		var clat4 = pix1.y+dely;
		var clon4 = pix1.x-delx;
		if (LRUL == 1){		// swap points back from above
			pixTemp = pix2;
			pix2 = pix1;
			pix1 = pixTemp;
			}
		}
		if (LLUR == 1 || URLL == 1){
		var clat1 = pix1.y+dely;
		var clon1 = pix1.x+delx;
		var clat2 = pix2.y+dely;
		var clon2 = pix2.x+delx;
		var clat3 = pix2.y-dely;
		var clon3 = pix2.x-delx;
		var clat4 = pix1.y-dely;
		var clon4 = pix1.x-delx;
		if (URLL == 1){		// swap points back from above
			pixTemp = pix2;
			pix2 = pix1;
			pix1 = pixTemp;
			}
		}
		
		// Convert to latitude and longitude and store
		var recPoints = Array();
		var poly1 = map.fromContainerPixelToLatLng(new GPoint(clon1, clat1));
		var poly2 = map.fromContainerPixelToLatLng(new GPoint(clon2, clat2));
		var poly3 = map.fromContainerPixelToLatLng(new GPoint(clon3, clat3));
		var poly4 = map.fromContainerPixelToLatLng(new GPoint(clon4, clat4));
		recPoints.push(poly1);
		recPoints.push(poly2);
		recPoints.push(poly3);
		recPoints.push(poly4);
		//----------------------------------------------------------------------------------------------
		
		// Plot polygon-----------------------------------------------------------------------------
		//upper left to lower right
		Xpoly = new GPolygon([
			poly2,
			poly1,
			poly4,
			poly3,
			poly2],"#f33f00",2,1,"#f33f00",0.2);
		map.addOverlay(Xpoly);
		//-----------------------------------------------------------------------------------------------
}	

// Calculates and plots timeDepthPlot
function timeDepthPlot(){
	CMMexist = 0;
	CCexist = 0;
	var plotTD = [];
	var minT = new Date('2100/01/01 00:00');
	var maxT = new Date('1970/01/01 00:00');
	// Get points within polygon----------------------------------------------------------------
	for (var i = 0; i <= eq_markers.length-1;i++){
		var pt = eq_markers[i].point;
		//Following function is from gmaps.polygon.containsLatLng
		var inPoly = Xpoly.containsLatLng(pt);
		if (inPoly){
			//Add to array for plotting
			var depth = -1*parseFloat(eq_markers[i].dep)+corr;			// Correct based on velocity model datum
			var d = new Date(eq_markers[i].getDate());
			//Update minimum and maximum
			if (d < minT){
				minT = d;
			}
			if (d > maxT){
				maxT = d;
			}
			eqTime = d.getTime();	 //Milliseconds since 1/1/1970 (good for plotting (maybe))
			plotTD.push([eqTime, depth]);
			}
	  }
	
	// Plot the time-depth plot already--------------------------------------------------------
	if (initialPlot == 0){
		minT = date1;
		maxT = date2;
	}
	
	// Plot cross-section
	f = Flotr.draw(
		$('chart_div'),[ 
			{data:plotTD, label:'eq_Xsec', lines: {show: false}, points: {show: true, radius: 5, fill: false}}
		],{
			title: 'Time-Depth Plot',
			fontSize: 14,
			xaxis:{
				tickFormatter: dateTickFormat, 
				labelsAngle:45,
				title: 'Time',
				min: minT.getTime(),
				max: maxT.getTime()
			},
			yaxis:{
				tickDecimals: 0,
				noTicks: 10,
				title: 'Elevation, km',
				autoscaleMargin: 5
			},
			grid:{
				verticalLines: true,
				backgroundColor: 'white'
			},
			HtmlText: false,
			legend: {
				show: false
			}
	});
	//--------------------------------------------------------------------------------------------------
	// Update html
	document.getElementById("xsec_options").innerHTML='<table><td>Cross Section Options:</td></table>' +
 		'<table><td><input id="this1" type="button" value="X-Section" onClick="getXsec()"></td>' + 
		'<td><input id="this1" type="button" value="Cumulative Energy" onClick="cumEnergy()"></td></table>' + 
		'<table><td><input id="this1" type="button" value="Cumulative Counts" onClick="cumCounts()"></td>' + 
		'<td><input id="this1" type="button" value="Clear X-Section" onClick="clearXsec()"></td></table>';
	TDExist = 1;
}

// Calculates and plots cumulative energy
function cumEnergy(){
	TDExist = 0;
	var plotCE = new Array();
	var numCE = [];
	var minT = new Date('2100/01/01 00:00');
	var maxT = new Date('1970/01/01 00:00');
	energy = 0;
	// Get points within polygon----------------------------------------------------------------
	for (var i = 0; i <= eq_markers.length-1;i++){
		var pt = eq_markers[i].point;
		//Following function is from gmaps.polygon.containsLatLng
		var inPoly = Xpoly.containsLatLng(pt);
		if (inPoly){
			var expon = 1.5* (parseFloat(eq_markers[i].mag) + 10.7);
			M0 = Math.pow(10, expon);			// Calculate moment of each earthquake
			d = new Date(eq_markers[i].getDate());
			eqTime = d.getTime();	 //Milliseconds since 1/1/1970 (good for plotting (maybe))
			plotCE[plotCE.length++] = new CE( eqTime, M0 );
			//Update minimum and maximum
			if (d < minT){
				minT = d;
			}
			if (d > maxT){
				maxT = d;
			}
			}
	  }
	  
	// Must sort array on eqTime so line doesn't look funky
	plotCE.sort(sortByMilli);
	// Now get plottable array
	numCE = new Array();
	for (var i=0; i<plotCE.length; i++) {
		energy = energy + plotCE[i].moment;	// Add to total energy
		CMM = (2/3)*(Math.log(energy)/Math.log(10))-10.7;	//Convert to magnitude
		numCE.push([plotCE[i].dateMilli, CMM]);
	}
	// Plot the time-depth plot already--------------------------------------------------------
	if (initialPlot == 0){
		minT = date1;
		maxT = date2;
	}
	
	// Plot cross-section
	f = Flotr.draw(
		$('chart_div'),[ 
			{data:numCE, label:'eq_Xsec', lines: {show: true}}
		],{
			title: 'Cumulative Moment Magnitude',
			fontSize: 14,
			xaxis:{
				tickFormatter: dateTickFormat, 
				labelsAngle:45,
				title: 'Time',
				min: minT.getTime(),
				max: maxT.getTime()
			},
			yaxis:{
				tickDecimals: 0,
				title: 'Moment Magnitude',
				autoscaleMargin: 5
			},
			grid:{
				verticalLines: true,
				backgroundColor: 'white'
			},
			HtmlText: false,
			legend: {
				show: false
			}
	});
	//--------------------------------------------------------------------------------------------------
	// Update html
	document.getElementById("xsec_options").innerHTML='<table><td>Cross Section Options:</td></table>' +
 		'<table><td><input id="this1" type="button" value="X-Section" onClick="getXsec()"></td>' + 
		'<td><input id="this1" type="button" value="Cumulative Energy" onClick="cumEnergy()"></td></table>' + 
		'<table><td><input id="this1" type="button" value="Cumulative Counts" onClick="cumCounts()"></td>' + 
		'<td><input id="this1" type="button" value="Clear X-Section" onClick="clearXsec()"></td></table>';
	//document.getElementById("xsec_options").innerHTML='<table><td>Cross Section Options:</td></table><table><td><input id="this1" type="button" value="X-Section" onClick="getXsec()"></td><td><input id="this1" type="button" value="Time-Depth Plot" onClick="timeDepthPlot()"></td></table><table><td><input id="this1" type="button" value="Clear X-Section" onClick="clearXsec()"></td></table>';
	CMMExist = 1;
}

// Calculates and plots cumulative counts 
function cumCounts(){
	TDExist = 0;
	var plotCC = new Array();
	var numCC = [];
	var minT = new Date('2100/01/01 00:00');
	var maxT = new Date('1970/01/01 00:00');
	// Get points within polygon----------------------------------------------------------------
	for (var i = 0; i <= eq_markers.length-1;i++){
		var pt = eq_markers[i].point;
		//Following function is from gmaps.polygon.containsLatLng
		var inPoly = Xpoly.containsLatLng(pt);
		if (inPoly){
			d = new Date(eq_markers[i].getDate());
			eqTime = d.getTime();	 //Milliseconds since 1/1/1970 (good for plotting (maybe))
			plotCC[plotCC.length++] = new CE( eqTime, 1.0 );
			//Update minimum and maximum
			if (d < minT){
				minT = d;
			}
			if (d > maxT){
				maxT = d;
			}
		}
	  }
	  
	// Must sort array on eqTime so line doesn't look funky
	plotCC.sort(sortByMilli);
	// Now get plottable array
	numCC = new Array();
	for (var i=0; i<plotCC.length; i++) {
		numCC.push([plotCC[i].dateMilli, i]);
	}
	if (initialPlot == 0){
		minT = date1;
		maxT = date2;
	}
	
	// Plot cross-section
	f = Flotr.draw(
		$('chart_div'),[ 
			{data:numCC, label:'eq_Xsec', lines: {show: true}}
		],{
			title: 'Cumulative Counts',
			fontSize: 14,
			xaxis:{
				tickFormatter: dateTickFormat, 
				labelsAngle:45,
				title: 'Time',
				min: minT.getTime(),
				max: maxT.getTime()
			},
			yaxis:{
				tickDecimals: 0,
				title: '',
				autoscaleMargin: 5
			},
			grid:{
				verticalLines: true,
				backgroundColor: 'white'
			},
			HtmlText: false,
			legend: {
				show: false
			}
	});
	//--------------------------------------------------------------------------------------------------
	// Update html
	document.getElementById("xsec_options").innerHTML='<table><td>Cross Section Options:</td></table>' +
 		'<table><td><input id="this1" type="button" value="X-Section" onClick="getXsec()"></td>' + 
		'<td><input id="this1" type="button" value="Cumulative Energy" onClick="cumEnergy()"></td></table>' + 
		'<table><td><input id="this1" type="button" value="Cumulative Counts" onClick="cumCounts()"></td>' + 
		'<td><input id="this1" type="button" value="Clear X-Section" onClick="clearXsec()"></td></table>';
	//document.getElementById("xsec_options").innerHTML='<table><td>Cross Section Options:</td></table><table><td><input id="this1" type="button" value="X-Section" onClick="getXsec()"></td><td><input id="this1" type="button" value="Time-Depth Plot" onClick="timeDepthPlot()"></td></table><table><td><input id="this1" type="button" value="Clear X-Section" onClick="clearXsec()"></td></table>';
	CCExist = 1;
}

// Format date on plots
function dateTickFormat ( n ){
	mydate = new Date();
	mydate.setTime(n);
	// GT 20111101 Attempting to fix the incorrect month problem
	// Previously when plotting data from last week on 1 Nov 2011, dates on X-section
	// would vary from 9/24 to 9/31.	
	// When plotting for last year, some months would be shown as "0"
	// It seems likely that January is month 0, December month 11 etc. 
	// This is a common think found in programming languages 
	// Attempting to fix this by incrementing the month prior to display
	utcMonth = parseInt(mydate.getUTCMonth()) + 1;
	// Return your formated date as you like.
	if (mydate.getUTCMinutes() > 10){
		//dTick = mydate.getUTCFullYear()+'/'+mydate.getUTCMonth()+'/'+mydate.getUTCDate()+'  '+mydate.getUTCHours()+':'+mydate.getUTCMinutes();
		dTick = mydate.getUTCFullYear()+'/'+utcMonth+'/'+mydate.getUTCDate()+'  '+mydate.getUTCHours()+':'+mydate.getUTCMinutes();
	}
	else{
		//dTick = mydate.getUTCFullYear()+'/'+mydate.getUTCMonth()+'/'+mydate.getUTCDate()+'  '+mydate.getUTCHours()+':0'+mydate.getUTCMinutes();
		dTick = mydate.getUTCFullYear()+'/'+utcMonth+'/'+mydate.getUTCDate()+'  '+mydate.getUTCHours()+':0'+mydate.getUTCMinutes();
	}
	return dTick
}

// Cumulative energy constructor (required for sorting array)
function CE ( dateMilli, MOMENT){
	this.dateMilli = parseInt(dateMilli);
	this.moment = parseFloat(MOMENT);
}

// sort array by milliseconds
function sortByMilli(a, b) {
	var x = a.dateMilli;
	var y = b.dateMilli;
	return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

// Create polygon method for collision detection
GPolygon.prototype.containsLatLng = function(latLng) {
	// Do simple calculation so we don't do more CPU-intensive calcs for obvious misses
	var bounds = this.getBounds();
	
	if(bounds != null && !bounds.containsLatLng(latLng)) {
		return false;
	}
	
	// Point in polygon algorithm found at http://msdn.microsoft.com/en-us/library/cc451895.aspx
	var numPoints = this.getVertexCount();
	var inPoly = false;
	var i;
	var j = numPoints-1;
	
	for(var i=0; i < numPoints; i++) { 
		var vertex1 = this.getVertex(i);
		var vertex2 = this.getVertex(j);
		
		if (vertex1.lng() < latLng.lng() && vertex2.lng() >= latLng.lng() || vertex2.lng() < latLng.lng() && vertex1.lng() >= latLng.lng())  {
			if (vertex1.lat() + (latLng.lng() - vertex1.lng()) / (vertex2.lng() - vertex1.lng()) * (vertex2.lat() - vertex1.lat()) < latLng.lat()) {
				inPoly = !inPoly;
			}
		}
		
		j = i;
	}
	
	return inPoly;
};

function defaultXsec(){
	TDExist = 0;
	CMMExist = 0;
	CCExist = 0;

	if (xsecExist == 0){		//xsecExist should only be 1 at this point if it is coming in from the shide function
		// Calculate rectangle for cross section and plot on map-----------------------
		doRectangle();
	}
	
	plotData = [];
	for (var i = 0; i <= eq_markers.length-1;i++){
		var pt = eq_markers[i].point;
		document.write("point " + i + "<br/>");
		//Project earthquake onto cross section
		projPt = projectEq(pix1, pix2, map.fromLatLngToContainerPixel(pt));
		distX = loc1.distanceFrom(projPt)/1000;		//Distance initially returned in meters
		//Add to array for plotting
		var depth = -1*parseFloat(eq_markers[i].dep)+corr;	// Correct based on velocity model datum
		plotData.push([distX, depth]);
	}
	document.write("point " + i + "<br/>");
	
	// Plot the cross-section already--------------------------------------------------------
	xsecLength = Math.ceil(loc1.distanceFrom(loc2)/1000);
	plotXsec(xsecLength);
}	
