var cal = [];

function make_ALLcal() {
	var dates = [];
	var request = GXmlHttp.create();
	request.open("GET", summaryXML, true);
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			var xmlDoc = GXml.parse(request.responseText);
			var uptimes = xmlDoc.documentElement.getElementsByTagName("uptime");
			
			lastd = uptimes[0].getAttribute("upday");
			lastd=new Date(lastd);
			
			var ttt = xmlDoc.documentElement.getElementsByTagName("total");
			for (var i = 0; i < ttt.length; i++) {
			  dates[i] = Calendar.dateToInt(Calendar.printDate(new Date(ttt[i].getAttribute("date")),"%Y%m%d"));
		}
		for (var j=0; j < ALLXML.length; j++) {
		  var thisarray=[];
		  for (var i=0; i < ttt.length; i++) {
		    thisarray[i] = parseFloat(ttt[i].getAttribute(ALLXML[j]+"hours"));			    
		  }
		  var xmlstring=ALLXML[j];
		  XML[xmlstring]=thisarray;
		}
		savedatesALL(dates,ALLXML);
		cal = Calendar.setup({
		  min: 20070101,
		  max: Calendar.dateToInt(Calendar.printDate(lastd,"%Y%m%d")),
		  fdow: 0,
		  bottomBar: false,
		  dateInfo: getDateInfoALL,
		  onSelect: function(cal) { cal.hide() }      
		});
		loadCal();
		}
	}
	request.send(null);
}


function savedatesALL(dates,ALLXML) {
  var j=0;
  for (var i = 0; i < dates.length; i++) {
    var testhour=0;
    for (k = 0; k < ALLXML.length; k++) {
	var xmlstring=ALLXML[k];
	var testhours=XML[xmlstring];
	testhour=testhour+testhours[i];
    }
    if (testhour>=1) {
      for (k = 0; k < ALLXML.length; k++) {
        var xmlstring=ALLXML[k];
        var xmlhrstring=ALLXML[k]+"hours";
        var xmldtstring=ALLXML[k]+"dates";
        XML[xmldtstring][j]=dates[i];
        XML[xmlhrstring][j]=XML[xmlstring][i];
      }
      j++;
    }
  }
}


function getDateInfoALL(date, wantsClassName) {
	var as_number= Calendar.dateToInt(date);
	var dummystr = ALLXML[0]+"dates";
	for (var i = 0; i < XML[dummystr].length; i++) {
		if (as_number == XML[dummystr][i]) {
			var wechside='';
		  for (var j=0; j<ALLXML.length; j++) {
		    var region = ALLXML[j]+"hours";
		    if (XML[region][i]>=1) {
		      wechside += ALLXML[j]+': '+ XML[region][i]+' hours of tremor<br>';
        }
		  }
			return {
							klass   : "highlight",
							tooltip : "<div style='text-align: left'>"+wechside+"</div>"
						 };
    }
	}
	return DATE_INFO[as_number];
};


function make_cal() {
	var dates = [];
	var request = GXmlHttp.create();
	request.open("GET", summaryXML, true);
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
      var xmlDoc = GXml.parse(request.responseText);
			var uptimes = xmlDoc.documentElement.getElementsByTagName("uptime");
			
			lastd = uptimes[0].getAttribute("upday");
			lastd=new Date(lastd);
			
			var ttt = xmlDoc.documentElement.getElementsByTagName("total");
			for (var i = 0; i < ttt.length; i++) {
			  dates[i] = Calendar.dateToInt(Calendar.printDate(new Date(ttt[i].getAttribute("date")),"%Y%m%d"));
      }
      for (var j=0; j < keepXML.length; j++) {
        var thisarray=[];
        for (var i=0; i < ttt.length; i++) {
          thisarray[i] = parseFloat(ttt[i].getAttribute(keepXML[j]+"hours"));			    
        }
        var xmlstring=keepXML[j];
        XML[xmlstring]=thisarray;
      }
			savedates(dates,keepXML);
			
			 cal = Calendar.setup({
       min: 20070101,
       max: Calendar.dateToInt(Calendar.printDate(lastd,"%Y%m%d")),
       fdow: 0,
       bottomBar: false,
       dateInfo: getDateInfo,
       onSelect: function(cal) { cal.hide() }      
     });
     loadCal();
		}
	}
	request.send(null);
}


function loadCal() {
  if (document.getElementById("oneday").checked==true) {
    cal.manageFields("day", "day", "%m/%d/%Y");
  } else {
    cal.manageFields("dayone", "dayone", "%m/%d/%Y");
    cal.manageFields("daytwo", "daytwo", "%m/%d/%Y");
  }
};


// Button functions ------------------------------------------------------------------------------------
function prevday() {
	var date1 = new Date(document.getElementById("day").value);
	date1.setDate(date1.getDate()-1);
	if (date1.getYear()<70) {
		date1.setYear(date1.getYear()+2000)
	}
	else{
		date1.setYear(date1.getYear()+1900)
	}
	document.getElementById("day").value=datetostr(date1);
	updateDates();
}

function nextday() {
	var date1 = new Date(document.getElementById("day").value);
	date1.setDate(date1.getDate()+1);
  if (date1.getYear()<70) {
		date1.setYear(date1.getYear()+2000)
	}
	else{
		date1.setYear(date1.getYear()+1900)
	}
	document.getElementById("day").value=datetostr(date1);
	updateDates();
}

function updateDates() {
	initialPlot = 0;
	clearXsec();
	
	if (document.getElementById("oneday").checked==true) {
		date1 = new Date(document.getElementById("day").value);
		date2 = new Date(document.getElementById("day").value);
	}else {
		date1 = new Date(document.getElementById("dayone").value);
		date2 = new Date(document.getElementById("daytwo").value);
	}
	date2.setDate(date2.getDate()+1);
	if (date1.getYear()<70) {
		date1.setYear(date1.getYear()+2000)
	}
	else{
		date1.setYear(date1.getYear()+1900)
	}
	if (date2.getYear()<70) {
		date2.setYear(date2.getYear()+2000)
	}
	else{
		date2.setYear(date2.getYear()+1900)
	}
	//newMarkers(date1.getTime(),date2.getTime());
	getEqs(date1, date2);
	
};