/*These global variables and functions are needed for each unique instance of REQ2. To run your own version you must first get a 
Google Maps key http://code.google.com/apis/maps/signup.html and put it into the head of the html:
<script src= "YOUR GOOGLE MAPS KEY HERE" type="text/javascript"></script>
This key will only work on the domain that you register it to and on your local machine.


Author: Weston Thelen
Pacific Northwest Seismic Network, University of Washington
thelenwes@gmail.com
*/

//define map center and zoom level here by entering map lat and lon center and zoom level.
//the greater the zoom level the larger the scale
var mapParam = {
	lat: 20.712,
 	lon: -156.252,
	zoom: 11
};

//define event file path here. This is the file that comes from merge.xml
var eventXml20 = "xml/haleakala20.xml";
var eventXmlAll = "xml/haleakalaAll.xml";
var initialPlot = 1;
var initialMarkerPlot = 20;
var maxMarkerPlot = 5000;
var date1 = new Date(1970, 0, 1, 0, 0, 0);
var date2 = new Date();
var vdepth = 1;
var corr = 0;   //Elevation of velocity model datum
var req = 0;    //Uses smaller earthquake symbols, plots different legends
var symSize=1;  //1 means use small earthquake symbols, 2 means use larger earthquake symbols


//define authorative network code here. This will cause all network events to plot as 
// circles and all non- network events to plot as squares
var authorNW = "HV";

//Location of xml file for stations
//staXML = "xml/sta_file.xml";
plotStas = 1;
staXML = "../hvo_staweb/purplepig/sta_file.xml";

//Station size
SP_icon.iconSize = new GSize(15, 15);
BB_icon.iconSize = new GSize(15, 15);
SM_icon.iconSize = new GSize(15, 15);

//Variables for plotStations
sidebar = 0;		//no sidebar
pdf = 0;			//no pdf links

//get links for event pages--including imports. Edit this file as needed. You must include all networks that are in your xml
//file--including the authoritative network. params: net = networkcode, id = event id as provided by QDDS
function getLink(net, id){
	if(net.toUpperCase() =="UW"){
	 	return "<a href = 'http://www.pnsn.org/recenteqs/Quakes/uw" + id + ".htm'>"
	}
	if(net.toUpperCase() =="US"){
	 return "<a href = 'http://earthquake.usgs.gov/eqcenter/recenteqsus/Quakes/us" + id +".php'>"
	}
	if(net.toUpperCase() == "NN"){
		return "<a href =' http://www.seismo.unr.edu/Catalog/nbe.html'>";
	}
	if(net.toUpperCase()=="NC"){
		return "<a href ='http://quake.wr.usgs.gov/recenteqs/Quakes/nc" + id + ".htm'>"
	}
	if(net.toUpperCase()=="HV"){
		return "<a href ='http://tux.wr.usgs.gov/Quakes/hv" + id + ".html'>"
	}
}
//Misc Global Variables for cross-section
// Bad form?  Yes.  Confusing?  Yes.  If you don't like it, then fix it.  I can't figure out how to pass variables through an "onClick" call otherwise
var loc1 = [];
var loc2 = [];
var eq_markers = new Array ();
var xsecExist = 0;
var TDExist = 0;
var CMMExist = 0;


//HTML code for date range
var date_control_html = '<table><td><label><input type="radio" id ="oneday" name="dtselect" onClick="getRange()" checked="yes"> Single</label></td><td><label><input type="radio" id ="range" name="dtselect" onClick="getRange()"> Range</label></td></table>'
var single_day_html='<table><td>Date:<br><input id="day" type="text" style="width:70px;" name="singleday" value="mm/dd/yyyy" onkeypress="if(event.keyCode==13){updateDates()}"></td></table><table><td><input id="mybutton" type="submit" value="Plot" onClick="updateDates()"></td><td><input id="this1" type="button" value="Prev" onClick="prevday()"></td><td><input id="that1" type="button" value="Next" onClick="nextday()"></td></table>';
var new_single_day_html='<table><td>Date:<br><input id="day" type="text" style="width:70px;" name="singleday" value="mm/dd/yyyy" onkeypress="if(event.keyCode==13){updateDates()}"></td></table><table><td><input id="mybutton" type="submit" value="Plot" onClick="updateDates()"></td><td><input id="this1" type="button" value="Prev" onClick="prevday()"></td><td><input id="that1" type="button" value="Next" onClick="nextday()"></td></table>';
var range_days_html='<table><td>Start:<br><input id="dayone" type="text" style="width:70px;" name="dayone" value="mm/dd/yyyy" onkeypress="if(event.keyCode==13){updateDates()}"></td><td></td><td>End:<br><input id="daytwo" type="text" style="width:70px;" name="daytwo" value="mm/dd/yyyy" onkeypress="if(event.keyCode==13){updateDates()}"></td></table><table><td><input id="mybutton" type="button" value="Plot" onClick="updateDates()"></td></table>';

//HTML code for xsec
var initialXsec ='To generate a cross-sectional plot, first define the cross-sectional area by clicking on the map to define the two endpoints, then enter in a Cross Section Width (default is 10 km), then click the "Plot X-section" button';
var twoClickXsec = '<table><td>Cross Section Width (km):<br><input id="Xwidth" type="text" style="width:80px;" name="Xwidth" value="10" onkeypress="if(event.keyCode==13){getXsec()}"></td></table><table><td><input id="plotX" type="submit" value="Plot X-section" onClick="getXsec()"></td><td><input id="this1" type="button" value="Clear X-Section" onClick="clearXsec()"></td></table>';
var xsecPlotted = '<table><td>Cross Section Width (km):<br><input id="Xwidth" type="text" style="width:80px;" name="Xwidth" value="10" onkeypress="if(event.keyCode==13){getXsec()}"></td></table><td><input id="this1" type="button" value="Clear" onClick="clearXsec()"></td></table>';

