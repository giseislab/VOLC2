//Code snippits that didn't make the cut

points = [
	{x: 0, y: 0},
	{x: 0, y: 50},
	{x: 50, y: 10},
	{x: -50, y: -10},
	{x: 0, y: -50},
	{x: 0, y: 0}
];

alert(isPointInPoly(points, {x: 10, y: 10}) ? "In" : "Out");


function isPointInPoly(poly, pt){
	for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
		((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
		&& (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
		&& (c = !c);
	return c;
}

//Ajax request implementation to update time range (doesn't keep date1 and date2 in scope)
function updateEqs(ajax){
if(window.ActiveXObject){ // If IE
		var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.loadXML(ajax.responseText);
		} 
	else {
	var xmlDoc = ajax.responseXML;
	}
	// File time tag information--------------
	var timeNow = xmlDoc.getElementsByTagName('merge')[0].getAttribute('fileTime_loc');
	timeUtc = xmlDoc.getElementsByTagName('merge')[0].getAttribute('fileTime_utc');
	updateTime(timeNow)
	
	// Load file event by event--------------------------------------------------------------
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
		var eqLoc = new Date(eqParam.get('year'), eqParam.get('month')-1, eqParam.get('day'), eqParam.get('hour'), eqParam.get('minute'), eqParam.get('second'));
		//var eqLoc = new Date(eq.loc);
		if (eqLoc>= date1 && eqLoc < date2) {
			eventArray.push(eq); 
			map.addOverlay(eq.plotEq());
			eq.makeList();
			eqNum++;
			if (eqNum > maxMarkerPlot){ break;}
	}
}
$("numberEQs").innerHTML= eqNum;
}
//Function to update the visibility of earthquakes based on time
function updateEQs(date1, date2)
{
	var listAll = $('eqlist').childElements();
	for (var i=0; i<gmarkers.length; i++) 
	{
		if (gmarkers[i].grp.eqDate >= date1 && gmarkers[i].grp.eqDate < date2)
		{
			if (isHidden(gmarkers[i]))
			{
				gmarkers[i].show();
				//listAll[i].show();
				eqNum++;
			}
		}
		else 
		{
				gmarkers[i].hide();
				eqNum--;
				//listAll[i].hide();
				$("eqlist").removeChild(listAll[i]);
				map.closeInfoWindow();
		}
	}
		$("numberEQs").innerHTML= eqNum;
}

// Get date range from fields
function getRange(){
	if (document.getElementById("oneday").checked==true) {
		var date1 = new Date(document.getElementById("day").value);
		var date2 = new Date(document.getElementById("day").value);
	}else {
		var date1 = new Date(document.getElementById("dayone").value);
		var date2 = new Date(document.getElementById("daytwo").value);
	}
	date2.setDate(date2.getDate()+1);
	if (date1.getYear()<100) {
		date1.setYear(date1.getYear()+2000)
	}
	if (date2.getYear()<100) {
		date2.setYear(date2.getYear()+2000)
	}
	return [date1, date2];
}

//From updateWindow
			var x = $$("#selectWebi option");//remove prior list of option elements
			
			for( var i = 0; i < x.length; i ++){
				x[i].remove();
			}
			var sta = webiList.invoke('getDistance', point, time).sort(function(a,b){return a[0] - b[0]});
			if(sta.length == 0){
				var op = document.createElement('option');
				op.innerHTML = "None Selected"
				$('selectWebi').appendChild(op);
			}else{ //create list
				var opStart = document.createElement('option');
				opStart.id = 'opStart';
				opStart.style.color = "red";
				opStart.innerHTML = 'Please Select';
				opStart.value = 'starter';
				$('selectWebi').appendChild(opStart);
				for( var i = 0; i < sta.length; i ++){
					var op = document.createElement('option');
					op.innerHTML = sta[i][1];
					op.value = sta[i][2];
					$('selectWebi').appendChild(op);
					
				}
				webiEvents();
			}