var address = "http://gisdata.usgs.gov/XMLWebServices2/Elevation_Service.asmx?op=getElevation?X_Value=";
lat = 48.777;
lng = -121.813;
units = "METERS";

function getElevLatLng(){
	var xmlhttp=false;
	// JScript gives us Conditional compilation, we can cope with old IE versions.
	// and security blocked creation of the objects.
 	try {
  		xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
 	} 
 	catch (e) {
  		try {
   			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  		} 
  		catch (E) {
   			xmlhttp = false;
  		}
 	}
	@end @*/

	if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
			try {
				xmlhttp = new XMLHttpRequest();
			} 
			catch (e) {
				xmlhttp=false;
			}
	}
	if (!xmlhttp && window.createRequest) {
		try {
			xmlhttp = window.createRequest();
		} 
		catch (e) {
			xmlhttp=false;
		}
	}
	reqString = address+lon+"&Y_Value="+lat+"&Elevation_Units="+units;
	xmlhttp.open("GET", reqString);
 	xmlhttp.onreadystatechange=function() {
  		if (xmlhttp.readyState==4) {
  			xmlDoc=xhttp.responseXML;
  			var elevation = xmlDoc.getElementsByTagName("Elevation");
   			alert(elevation+" meters");
  		}
	 }
 	xmlhttp.send(null);
}