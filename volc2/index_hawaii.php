<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta name="author" content="Weston Thelen, Hawaiian Volcano Observatory" />
		<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
		<title>VolcWeb, Your Source for Earthquakes in Hawaii!</title>
		
		
		<?php
		// Get Google Maps Stuff
		require_once('../includes/googleMaps.php');
		//Get effects (prototype and scriptaculous)
		require_once('../includes/effects.php');
		//Get plotting stuff
		require_once('../includes/crossSection.php');
		//Better webicorder stuff
		require_once('../includes/betterWebi.php');
		?>
		
<script type = "text/javascript" src = "js_scripts/volc2Param_allHawaii.js"> </script>
		
		<?php
		//Get volcWeb Stuff
		require_once('../includes/volc2.php');
		?>
		
		<link rel = "stylesheet" type = "text/css" href = "volc2.css" />
		<link rel = "Shortcut Icon" href = "images/volc2shortcut.png"/>	
	</head>
	<body>
		<div id ="header"><a href ="http://hvo.wr.usgs.gov/"><img id = "logo" src = "images/hvoLogo.gif" alt = "logo"/></a>
			<img id = "req2Logo" src = "images/volc2logoHVO.png" alt = "Earthquakes on the Orchid Isle"/>
			<span>Hawaii Island</span>
		</div>
		<div class = "clear"></div>
		<div id = "time">File updated: <span></span></div>
	
		<hr/>
		<div id = "leftCol"> 
			<div id="map" STYLE="height:650px"><noscript><p>volcWeb, which runs on the Google Map API must have Javascript enabled in order to run. It appears that your have disabled your Javascript or you are using a very outdated browser. To enable Javascript, click on your browser options and select "Enable JavaScript."</p></noscript></div>
			<p><img id ="legend" src ="images/legendVolc2week.png" alt ="legend"/></p>
		</div>	
		<div id ="rightCol">
			<fieldset>
				<legend>Control Panel</legend>
				<div id = "controlLeft">
					Magnitudes: <br/>
					<label><input type="checkbox" id ="eqAll" name="eqselect" checked ="checked"/> All EQ's</label><br/>
					<label><input type="checkbox" id ="eq4" name="eqselect"/> &gt; 4.0 </label><br/>
					<label><input type="checkbox" id ="eq3" name="eqselect"/> 3.0 - 3.9 </label><br/>
					<label><input type="checkbox" id ="eq2" name="eqselect"/> 2.0 - 2.9 </label><br/>
					<label><input type="checkbox" id ="eq1" name="eqselect" /> 1.0 - 1.9 </label><br/>
					<label><input type="checkbox" id ="eq0" name="eqselect"/> &lt; 1.0 </label><br/><br/>
					</div>
					<div id = "controlRight">
					 Plot EQ's by:<br/>
						<label><input type="radio" id ="plotTime" name="plot" checked = "checked" />Time</label><br/>
						<label><input type="radio" id ="plotDepth" name="plot" />Depth</label>
					</div>
					<div class = "clear"></div>
					<hr/>
					<div id="xsec_options"></div>
					<hr/>
					<div id = "controlLeft">
					<!--Time Options: -->
					<img id = "helpWebi" src ="images/help.png" alt ="help"/><br/>
					<!--webicorder help box-->
					<div id = 'webiHelpBox' style = "display: none">
						<img id = 'webiHelpClose' src ="images/close.jpg" alt ="close"/>
						<div class ='clear'></div>
						<p>Earthquakes locations are available from the HVO catalog for the last 2 weeks.  
							Earthquakes on the map and in the list are clickable for more information.  
							Only quality earthquake locations are shown (horizontal errors < 2 km, 
							vertical errors < 4).
							</p>
							<!-- 
							<p> Stations are shown with triangles.  Click on a triangle to see the webicorders
							for that particular station.  Webicorders show a record of how the
							 ground moved at a particular seismograph station. They are divided into the following types of
							stations:
							</p>
							<ul>
								<li>Short-period (red)</li>
								<li>Broadband(blue)</li>
								<li>Strong Motion(black)</a></li>
							</ul>
						<p>
							The 12 and 24 hour webicorders are updated hourly.  The 6 hour webicorders are 
							live.
						</p>	
 -->
					</div>
						<div id="time_options"></div>
						<div id="datecontrol"></div>
						<span><h2>Monitored Volcanoes/Waveforms</h2></span>
						<div id="webiLink">
						<a href ="http://hvointernal.wr.usgs.gov/seismic/volcWeb/hvo_staweb/index.html">
						<img id = "webiPane" src = "images/webicorderPane.png" alt = "Webicorder Link"/> 
						</a></div>
						<div id="kilLink">
						<a href ="http://hvointernal.wr.usgs.gov/seismic/volcWeb/volc2/index_kilauea.html">
						<img id = "kilaueaPane" src = "images/kilaueaPane.png" alt = "Kilauea Link"/> 
						</a></div>
						<div id="mlLink">
						<a href ="http://hvointernal.wr.usgs.gov/seismic/volcWeb/volc2/index_maunaLoa.html">
						<img id = "maunaLoaPane" src = "images/mlPane.png" alt = "Mauna Loa Link"/> 
						</a></div>
						<div id="mkLink">
						<a href ="http://hvointernal.wr.usgs.gov/seismic/volcWeb/volc2/index_maunaKea.html">
						<img id = "maunaKeaPane" src = "images/maunaKeaPane.png" alt = "Mauna Kea Link"/> 
						</a></div>
						<div id="loihiLink">
						<a href ="http://hvointernal.wr.usgs.gov/seismic/volcWeb/volc2/index_loihi.html">
						<img id = "loihiPane" src = "images/loihiPane.png" alt = "Loihi Link"/> 
						</a></div>
						<div id="hualalaiLink">
						<a href ="http://hvointernal.wr.usgs.gov/seismic/volcWeb/volc2/index_hualalai.html">
						<img id = "hualalaiPane" src = "images/hualalaiPane.png" alt = "Hualalai Link"/> 
						</a></div>
						<div id="haleakalaLink">
						<a href ="http://hvointernal.wr.usgs.gov/seismic/volcWeb/volc2/index_haleakala.html">
						<img id = "haleakalaPane" src = "images/haleakalaPane.png" alt = "Haleakala Link"/> 
						</a></div>
						
					</div>
				
				<div class = "clear"></div>
				<!--<div id = 'webiEventDisplay' style = "display: none"></div>-->
				<hr/>
				<input id ="reset" type="submit" value="Reset Map"/>
				<div id ="loading"><img src = "images/loading.gif" alt = "loading" /></div>
				<h2 id ="loadText">Loading...</h2>
		
			</fieldset>
			<!--<h2>List of <span id ="numberEQs">0</span> EQ(s) on Map</h2> -->
			<!--<p id ="listTop"><a href ="http://www.pnsn.org/recenteqs/glossary.htm#mag">Mag </a><a href ='http://www.pnsn.org/recenteqs/glossary.htm#time'> Date Time(UTC)</a> <a href ="http://www.pnsn.org/recenteqs/glossary.htm#depth"> Depth</a></p>-->
			<ul id ="eqlist" STYLE="height:0px">
				<li id = "starter"></li><!--for validation-->
			</ul>
		</div>	
		<div class ="clear"></div>
		<div id="chart_div"></div>
		
		<!--%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%-->
		<!-- Begin code to get single date or range of dates -->
		<script type = "text/javascript">
		
		if (GBrowserIsCompatible()){
      
      		document.getElementById("datecontrol").innerHTML=date_control_html;
      		document.getElementById("xsec_options").innerHTML=initialXsec;
      		var stop_id = 0;
			//var map;      
      		var prev_trem =[];
      		var tremtime = [];
      		var dailyhours = [];
			var dailynum = [];
			var daycount = 0;
			var thiscount = 0;         
      		var stamarkers=[];     
			var lastd;
     		var DATE_INFO = [];
      		var NEWhours = [];
			var NEWdates = [];
			
		
		//Start the calendar setup
		var cal = Calendar.setup({
          	onSelect: function(cal) { cal.hide(); }
     	 });	
     	 
      
		    
		function datetostr(day) {
				var mon = day.getMonth(); var d = day.getDate(); var Y = day.getFullYear();
				var textdate = mon+1 + '/' + d + '/' + Y;
				return textdate;
			};
      
      function getRange() {
        if (document.getElementById("oneday").checked==true) {
          document.getElementById("time_options").innerHTML = new_single_day_html;
          cal.manageFields("day", "day", "%m/%d/%Y");
        } else {
          document.getElementById("time_options").innerHTML = range_days_html;
          cal.manageFields("dayone", "dayone", "%m/%d/%Y");
          cal.manageFields("daytwo", "daytwo", "%m/%d/%Y");
				}
      };
      
			function rangeChanged(range) {
				if (document.getElementById("oneday").checked==true) {
					document.getElementById("range").checked=true;
					getRange();
				}
				D1=new Date(range.start);D1.setDate(D1.getDate()+1);
				m1=D1.getMonth()+1;d1=D1.getDate();y1=D1.getFullYear();
				D2=new Date(range.end);D2.setDate(D2.getDate()+1);
				m2=D2.getMonth()+1;d2=D2.getDate();y2=D2.getFullYear();
				document.getElementById("dayone").value=m1+'/'+d1+'/'+y1;
				document.getElementById("daytwo").value=m2+'/'+d2+'/'+y2;
			};
}

</script>
		
		
	<script src="http://www.google-analytics.com/urchin.js" type="text/javascript">
		</script>
		<script type="text/javascript">
		_uacct = "UA-4670028-1";
		urchinTracker();
		</script>
	</body>
</html>
