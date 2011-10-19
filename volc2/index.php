<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta name="author" content="Weston Thelen, Hawaiian Volcano Observatory" />
                <meta name="author" content="Jon Connolly, Pacific Northwest Seismic Network, University of Washington" />
                <meta name="author" content="Glenn Thompson, Alaska Volcano Observatory" />
		<meta http-equiv="content-type" content="text/html; charset=utf-8"/>

		<!-- Calendar Stuff -->
		<script src="js_scripts/JSCal2-1.7/src/js/jscal2.js"></script>
    		<script src="js_scripts/JSCal2-1.7/src/js/lang/en.js"></script>
		<link rel="stylesheet" type="text/css" href="js_scripts/JSCal2-1.7/src/css/jscal2.css">
		<link rel="stylesheet" type="text/css" href="js_scripts/JSCal2-1.7/src/css/border-radius.css">
		<link rel="stylesheet" type="text/css" href="js_scripts/JSCal2-1.7/src/css/steel/steel.css">
		
		<!--Misc stuff-->
		<?php
			$domain = $_SERVER['HTTP_HOST'];
			switch ($domain) {
				case "hvo.wr.usgs.gov":
					$GMap2Key = "ABQIAAAADLVBXakPUVGdLMxvnw_xjRROHl2n3JvsTik875qBELv4_RGFpBQxZVxwItz8R2I-hgxB9x1rq8PgBQ";
					break;
				case "giseis.alaska.edu":
	        			$GMap2Key = "ABQIAAAA08sgpfMO8KIySKvJkekPIRTXrO8TDN3d9zJDDLg-faokzzewNxRRg8YyWsFjL8Yj63junmxsjjZL9g";
					break;
				default:
                			$GMap2Key = "ABQIAAAA08sgpfMO8KIySKvJkekPIRREw0x-nvV5HWQ0bYSOiQRMdxRq8xSlBULRi7QrQkbN_79v-qJ2voI8Wg";
			}
	        	print "<script src=\"http://maps.google.com/maps?file=api&amp;v=2&amp;sensor=false&amp;key=$GMap2Key\" type=\"text/javascript\"></script>\n";
		?>

		<!--[if IE]><script language="javascript" type="text/javascript" src="js_scripts/flotr/excanvas.js"></script><![endif]-->
		<script src = "js_scripts/prototype-1.6.0.2.js"  type="text/javascript"></script>
		<script src = "js_scripts/scriptaculous.js" type="text/javascript"></script>
		<script type="text/javascript" src="http://www.google.com/jsapi"></script>
		<!--Plotting stuff-->
		<script type="text/javascript" src="js_scripts/flotr/flotr-0.2.0-alpha.js"></script>
		<script type="text/javascript" src="js_scripts/flotr/lib/canvas2image.js"></script>
		<script type="text/javascript" src="js_scripts/flotr/lib/canvastext.js"></script>
		<!--Better Webicorder Stuff-->
		<script src = "../hvo_staweb/js_scripts/effects.js" type="text/javascript"> </script>
		<script src = "../hvo_staweb/js_scripts/checkMobile.js" type="text/javascript"> </script>
		<script src = "../hvo_staweb/js_scripts/plotStations.js" type="text/javascript"> </script>
                <!-- <script src = "../hvo_staweb/js_scripts/plotStationsAlaska.js" type="text/javascript"> </script>-->
		<!--Volc2 stuff-->
	

                <?php
                        # Read in parameters from the configuration file
                        $configfile = "../volc2config.xml";
                        $config = simplexml_load_file($configfile) or die("file not found: $configfile\n");
                        $xml_directory = $config->xml_directory;
                        $title = $config->title;
                        $public_site = $config->public_site;
                        $logo_src = $config->logo['src'];
                        $logo_alt = $config->logo['alt'];
                        $banner_src = $config->banner['src'];
                        $banner_alt = $config->banner['alt'];
                        $legend = $config->legend;
                        $network_code = $config->network_code;
                        print "<title>$title $domain</title>\n";

                        $volcano = !isset($_GET['volcano'])? "Arc" : $_GET['volcano'];

                        # Read in the list of volcanoes
                        $volcanoesxmlfile = "$xml_directory/volcanoes.xml";
                        $xml = simplexml_load_file($volcanoesxmlfile); # or die("file not found: $xmlfile\n");
                        $c=0;
                        while ($volcano_name[$c] = $xml->volcano[$c]['name']):
                                #print "<p>$volcano_name[$c]</p>\n";
                                $volcano_lat[$c] = $xml->volcano[$c]['lat'];
                                $volcano_lon[$c] = $xml->volcano[$c]['lon'];
                                $volcano_zoomlevel[$c] = $xml->volcano[$c]['zoomlevel'];
                                if (strcmp($volcano_name[$c],$volcano)==0)
                                        $vindex=$c;
                                $c++;
                        endwhile;

                        # Build Javascript mapParam variable
                        print <<< END
                        <script type="text/javascript">
                        var mapParam = {
                                lat: $volcano_lat[$vindex],
                                lon: $volcano_lon[$vindex],
                                zoom: $volcano_zoomlevel[$vindex]
                        };
                        </script>
END;
                ?>

                <!-- # Copy PHP variables to JAVASCRIPT variables -->
                <script type="text/javascript">
                        volcanoname = "<?php print $volcano; ?>";
                        xml_directory = "<?php print $xml_directory; ?>";
                        network_code = "<?php print $network_code; ?>";
                </script>

		<!-- # Set XML filenames here -->
		<?php
			$eventXml20 = "$xml_directory/origins_$volcano.xml";
			$eventXmlAll = "$xml_directory/origins_$volcano.xml";
			$staXML = "$xml_directory/stations_$volcano.xml";
			if (!file_exists($staXML)) { # GT 2011/11/12: This is a hack so I can use the
			# HVO sta_file.xml file from Wes
				$staXML = "$xml_directory/sta_file.xml";
			}
		?>
                <script type="text/javascript">
                        volcanoesxmlfile = "<?php print $volcanoesxmlfile; ?>";
                        eventXml20 = "<?php print $eventXml20; ?>";
                        eventXmlAll = "<?php print $eventXmlAll; ?>";
                        staXML = "<?php print $staXML; ?>";
                </script>

		<script src = "js_scripts/volc2Param.js" type="text/javascript"> </script>
		<script src = "js_scripts/volcCalStuff.js" type="text/javascript"> </script>
		<script src = "js_scripts/menu.js" type="text/javascript"> </script>
		<script src = "js_scripts/volc2.js" type="text/javascript"> </script>
		<script src = "js_scripts/xsec.js" type="text/javascript"> </script>
		<script src = "js_scripts/plotVolcanoes.js" type="text/javascript"> </script>
		<link rel="stylesheet" type="text/css" href="volc2.css" />
		<link rel="Shortcut Icon" href="images/volc2shortcut.png"/>
	</head>
	<body>
		<div id ="header">
                        <?php
				print "<a href=\"$public_site\"><img id=\"logo\" src=\"$logo_src\" alt=\"$logo_alt\"/></a>\n";
				print "<img id=\"req2Logo\" src=\"$banner_src\" alt=\"$banner_alt\"/>\n";
                                if ($volcano == "All") {
                                        print "<span>All volcanoes</span>\n";
                                } else {
                                        print "<span>$volcano Volcano</span>\n";
                                };
                        ?>
		</div>
		<div class = "clear"></div>
		<tr><div id = "time">File updated: <span></span></div></tr>
	
		<hr/>
		<div id = "leftCol"> 
			<div id="map"><noscript><p>This application runs on the Google Map API and must have Javascript enabled in order to run. It appears that your have disabled your Javascript or you are using a very outdated browser. To enable Javascript, click on your browser options and select "Enable JavaScript."</p></noscript></div>
                        <?php
				print "<p><img id =\"legend\" src =\"$legend\" alt =\"legend\"/></p>\n";
			?> 
		</div>	
		<div id ="rightCol">
			<fieldset>
				<legend>Control Panel</legend>
				<div id = "controlLeft">
                                        <b>Volcano: </b>
                                        <select onchange="window.open('?volcano=' + this.options[this.selectedIndex].value, '_top')" name="volcano">
                                        <?php
                                                foreach($volcano_name as $volcanoitem) {
                                                        if ($volcanoitem == $volcano) {
                                                                print "\t\t<option value=\"$volcano\" selected=\"yes\">$volcano</option>\n";
                                                        }
                                                        else
                                                        {
                                                                print "\t\t<option value=\"$volcanoitem\" >$volcanoitem</option>\n";
                                                        }
                                                }
                                        ?>
                                        </select>

                                        <table>
                                        <tr><td>
					Magnitudes: <br/>
					<label><input type="checkbox" id ="eqAll" name="eqselect" checked ="checked"/> All EQ's</label><br/>
					<label><input type="checkbox" id ="eq4" name="eqselect"/> &gt; 4.0 </label><br/>
					<label><input type="checkbox" id ="eq3" name="eqselect"/> 3.0 - 3.9 </label><br/>
					<label><input type="checkbox" id ="eq2" name="eqselect"/> 2.0 - 2.9 </label><br/>
					<label><input type="checkbox" id ="eq1" name="eqselect" /> 1.0 - 1.9 </label><br/>
					<label><input type="checkbox" id ="eq0" name="eqselect"/> &lt; 1.0 </label><br/><br/>
                                   </td>
                                        <td>&nbsp;&nbsp;</td>
                                        <td valign="top">
                                        <form name="timerange">
                                        Show last:</br>
                                        <?php
                                                $timeranges = array("day", "week", "month", "year");
                                                $timerange = !isset($_GET['timerange'])? "week" : $_GET['timerange'];
                                                foreach($timeranges as $item) {
                                                        if ($item == $timerange) {
                                                                print "\t\t<input type=radio id = \"plotLast$item\" Name=r1 Value=$item onClick =GetSelectedItem() checked>$item</input><br/>\n";
                                                        }
                                                        else
                                                        {
                                                                print "\t\t<input type=radio id = \"plotLast$item\"Name=r1 Value=$item onClick =GetSelectedItem()>$item</input><br/>\n";
                                                        }
                                                }
                                        ?>
                                        </form>
                                        </td></tr></table>
					</div>
					<div id = "controlRight">
					 Plot EQ's by:<br/>
					    <form>
						<label><input type="radio" id ="plotTime" name="plot" checked = "checked" />Time</label><br/>
						<label><input type="radio" id ="plotDepth" name="plot" />Depth</label><br/>
					    </form>
					<br/>
					Plot Stations:<br/>
					    <form>
					    <label><input type="radio" id ="plotStaTrue" name="plot2" checked = "checked" />True</label><br/>
						<label><input type="radio" id ="plotStaFalse" name="plot2" />False</label><br/>
					    </form>
					Plot Volcanoes:<br/>
					    <form>
					    <label><input type="radio" id ="plotVolcanoesTrue" name="plot3" checked = "checked" />True</label><br/>
						<label><input type="radio" id ="plotVolcanoesFalse" name="plot3" />False</label><br/>
					    </form>
					</div>
					<div class = "clear"></div>
					<hr/>
					<div id="xsec_options"></div>
					<hr/>
					<div id = "controlLeft">
					Time Options: 
					<img id = "helpWebi" src ="images/help.png" alt ="help"/><br/>
					<!--webicorder help box-->
					<div id = 'webiHelpBox' style = "display: none">
						<img id = 'webiHelpClose' src ="images/close.jpg" alt ="close"/>
						<div class ='clear'></div>
						<p>Earthquakes locations are available from the HVO catalog from 1970 to present.  
							Select a single date and press "plot" to view earthquakes that occurred on that day.
							If you are looking for a earthquakes over a range of time, select the "range" radio
							button and enter the two dates of interest.  Earthquakes on the map and in the 
							list are clickable for more information.  Only 5000 earthquakes are plotted at a
							time.  Only earthquakes on Kilauea and the surrounding rift zones are shown.
							</p>
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
					</div>
						<div id="time_options"></div>
						<div id="datecontrol"></div><p>
					</div>
				
				<div class = "clear"></div>
				<!--<div id = 'webiEventDisplay' style = "display: none"></div>-->
				<hr/>
				<input id ="reset" type="submit" value="Reset Map"/>
				<div id ="loading"><img src = "images/loading.gif" alt = "loading" /></div>
				<h2 id ="loadText">Loading...</h2>
		
			</fieldset>
			<h2>List of <span id ="numberEQs">0</span> EQ(s) on Map</h2>
			<p id ="listTop"><a href ="http://www.pnsn.org/recenteqs/glossary.htm#mag">Mag </a><a href ='http://www.pnsn.org/recenteqs/glossary.htm#time'> Date Time(UTC)</a> <a href ="http://www.pnsn.org/recenteqs/glossary.htm#depth"> Depth</a></p>
			<ul id ="eqlist">
				<li id = "starter"></li><!--for validation-->
			</ul>
		</div>	
		<div class ="clear"></div>
		<div id="chart_div"></div>
		
		<!--%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%-->
		<!-- Begin code to get single date or range of dates -->
		<script type="text/javascript">
     	 
		if (GBrowserIsCompatible()) {
      
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
