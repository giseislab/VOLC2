<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta name="author" content="Weston Thelen, Hawaiian Volcano Observatory" />
                <meta name="author" content="Jon Connolly, Pacific Northwest Seismic Network, University of Washington" />
                <meta name="author" content="Glenn Thompson, Alaska Volcano Observatory" />
		<meta http-equiv="content-type" content="text/html; charset=utf-8"/>

		<!-- Popop windows from: http://codesnippets.joyent.com/posts/show/708 and implemented 4/24/2012 by GTHO -->

		<!-- Calendar Stuff -->
		<script src="js_scripts/JSCal2-1.7/src/js/jscal2.js"></script>
    		<script src="js_scripts/JSCal2-1.7/src/js/lang/en.js"></script>
		<link rel="stylesheet" type="text/css" href="js_scripts/JSCal2-1.7/src/css/jscal2.css">
		<link rel="stylesheet" type="text/css" href="js_scripts/JSCal2-1.7/src/css/border-radius.css">
		<link rel="stylesheet" type="text/css" href="js_scripts/JSCal2-1.7/src/css/steel/steel.css">


		<!--Misc stuff-->
		<?php
			function curPageName() {
 				return substr($_SERVER["SCRIPT_NAME"],strrpos($_SERVER["SCRIPT_NAME"],"/")+1);
			}

			$domain = $_SERVER['HTTP_HOST'];
			switch ($domain) {
				case "hvo.wr.usgs.gov":
					$GMap2Key = "ABQIAAAADLVBXakPUVGdLMxvnw_xjRROHl2n3JvsTik875qBELv4_RGFpBQxZVxwItz8R2I-hgxB9x1rq8PgBQ";
					break;
				case "giseis.alaska.edu":
				case "kiska.giseis.alaska.edu":
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
		<script src = "js_scripts/effects.js" type="text/javascript"> </script>
		<script src = "js_scripts/checkMobile.js" type="text/javascript"> </script>
		<!-- <script src = "../hvo_staweb/js_scripts/plotStations.js" type="text/javascript"> </script> -->
        	<script src = "js_scripts/plotStationsAlaska.js" type="text/javascript"> </script>
		<script src = "js_scripts/plotVolcanoes.js" type="text/javascript"> </script>

		<!--Volc2 stuff-->
	

                <?php
                        # Read in parameters from the configuration file
                        $configfile = "volc2config.xml";
                        $config = simplexml_load_file($configfile) or die("file not found: $configfile\n");
                        $xml_directory = $config->xml_directory;
                        $volcanoviewsxmlfile = $xml_directory."/".$config->volcanoviewsxmlfile;
                        $volcanomarkersxmlfile = $xml_directory."/".$config->volcanomarkersxmlfile;
                        $initialview = $config->initialview;
                        $title = $config->title;
                        $public_site = $config->public_site;
                        $logo_src = $config->logo['src'];
                        $logo_alt = $config->logo['alt'];
                        $banner_src = $config->banner['src'];
                        $banner_alt = $config->banner['alt'];
                        $legend = $config->legend;
                        $network_code = $config->network_code;
                        print "<title>$title</title>\n";

                        # Read in the list of volcanoes
                        $xml = simplexml_load_file($volcanoviewsxmlfile); # or die("file not found: $xmlfile\n");
                        $c=0;
                        while ($vname = $xml->volcano[$c]['name']):
                        	$volcano_name[$c] = $vname;
                                $volcano_lat[$c] = $xml->volcano[$c]['lat'];
                                $volcano_lon[$c] = $xml->volcano[$c]['lon'];
                                $volcano_zoomlevel[$c] = $xml->volcano[$c]['zoomlevel'];
                                $c++;
                        endwhile;
                        $volcano = !isset($_GET['volcano'])? $initialview : $_GET['volcano'];

                        for ($c = 0; $c < sizeof($volcano_name); $c++) {
                                if (strcmp($volcano_name[$c],$volcano)==0)
                                        $vindex=$c;
			};


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

                <!-- # Set maps corner variables -->
                <script type="text/javascript">
			var ne = 0.0;
			var sw = 0.0;
			var nw = 0.0;
			var se = 0.0;
		</script>

                <!-- # Copy PHP variables to JAVASCRIPT variables -->
                <script type="text/javascript">
                        var volcanoname = "<?php print $volcano; ?>";
                        xml_directory = "<?php print $xml_directory; ?>";
                        network_code = "<?php print $network_code; ?>";
			//var date1 = new Date(1970, 0, 1, 0, 0, 0);
			var date1 = new Date();
			var date2 = new Date();
			date2.setMinutes(date2.getMinutes() + date2.getTimezoneOffset()); 
                      	date1.setDate(date2.getDate()-7);
			date1.setMinutes(date1.getMinutes() + date1.getTimezoneOffset()); 
                </script>

		<!-- # Set XML filenames here -->
		<?php
                        $timerange = !isset($_GET['timerange'])? "week" : $_GET['timerange'];
			$eventXmlAll = "$xml_directory/origins_$volcano.xml";
			if (!file_exists($eventXmlAll)) { 
				die("</head><body>Event XML file ($eventXmlAll) not found</body></html>");
			}
			$eventXml20 = "$xml_directory/origins_$volcano"."_lastweek.xml";
			if (!file_exists($eventXml20)) { 
				$eventXml20 = $eventXmlAll;
			}
			$staXML = "$xml_directory/stations_$volcano.xml";
			if (!file_exists($staXML)) { # GT 2011/11/12: This is a hack so I can use the
			# HVO sta_file.xml file from Wes for HVO data
				$staXML = "$xml_directory/sta_file.xml";
			}
			if (!file_exists($staXML)) { 
				die("</head><body>Station XML file ($staXML) not found</body></html>");
			}

		?>
		<script src = "js_scripts/volc2Param.js" type="text/javascript"> </script>
		<script src = "js_scripts/volcCalStuff.js" type="text/javascript"> </script>
		<script src = "js_scripts/menu.js" type="text/javascript"> </script>
		<script src = "js_scripts/volc2.js" type="text/javascript"> </script>
		<script src = "js_scripts/xsec.js" type="text/javascript"> </script>
		<link rel="stylesheet" type="text/css" href="volc2.css" />
		<link rel="Shortcut Icon" href="images/volc2shortcut.png"/>
                <script type="text/javascript">
			radioTimeRangeHTML =	'<form name="timerange">' + 
                                   			'Show last:<br/>' + 
                                   			<?php
                                           			//$timeranges = array("day"=>1, "week"=>7, "month"=>30, "year"=>365, "all"=>999);
                                           			$timeranges = array("day"=>1, "week"=>7, "month"=>30, "year"=>365);

                                           			foreach($timeranges as $item=>$numdays) {
                                                   			if ($item == $timerange) {
                                                        			#print "\t\t'<input type=radio onchange=\"timeRangeChanged(this)\" Name=radioTimeRange Value=$numdays checked>$item</input><br/>' + \n";
                                                        			print "\t\t'<input type=radio onchange=\"timeRangeChanged(this)\" Name=radioTimeRange Value=$numdays checked>$item</input>&nbsp;' + \n";
                                                   			}
                                                   			else
                                                   			{
                                                        			#print "\t\t'<input type=radio onchange=\"timeRangeChanged(this)\" Name=radioTimeRange Value=$numdays >$item</input><br/>' + \n";
                                                        			print "\t\t'<input type=radio onchange=\"timeRangeChanged(this)\" Name=radioTimeRange Value=$numdays >$item</input>&nbsp;' + \n";
                                                   			}
                                           			}	
                                   			?> 
                                   		'</form>';
		</script>
                <script type="text/javascript">
                        volcanoviewsxmlfile = "<?php print $volcanoviewsxmlfile; ?>";
                        volcanomarkersxmlfile = "<?php print $volcanomarkersxmlfile; ?>";
                        eventXml20 = "<?php print $eventXml20; ?>";
                        eventXmlAll = "<?php print $eventXmlAll; ?>";
                        staXML = "<?php print $staXML; ?>";
                </script>
	</head>
	<body>
		<div id ="header">
                        <?php

				#print "eventXmlAll = $eventXmlAll<br/>\n";
				#print "eventXml20 = $eventXml20<br/>\n";
				#print "staXML = $staXML<br/>\n";
				#for ($c=0; $c<count($volcano_name); $c++) {
				#	print $c.": ".$volcano_name[$c]."<br/>\n";
				#}
				# 2012/04/23 Removed by GT
				#print "<a href=\"$public_site\"><img id=\"logo\" src=\"$logo_src\" alt=\"$logo_alt\"/></a>\n";
				#print "<img id=\"req2Logo\" src=\"$banner_src\" alt=\"$banner_alt\"/>\n";
				$previndex = $vindex - 1;
				if ($previndex < 0) {
					$previndex = count($volcano_name)-1;
				}
				$prevvolcano = $volcano_name[$previndex];		
				$nextindex = $vindex + 1;
				if ($nextindex >= count($volcano_name)) {
					$nextindex = 0;
				}
				$nextvolcano = $volcano_name[$nextindex];	
				$thisPage = curPageName();
                                if ($volcano == "All") {
                                        print "All volcanoes\n";
                                } else {
                                        print "$volcano\n";
                                };
                                #print "<a href=\"https://docs.google.com/a/alaska.edu/document/d/1j-cg2ykDBHgpYk-QXXW0Az9QwR6alEOraJtETZNUjzE/edit\" target=\"_new\">Issues/Comments</a><br/>\n";
                        ?>
		</div>
		<div class = "clear"></div>
		<div id = "time">File updated: <span></span></div>

	
		<hr/>
		<div id = "leftCol"> 
			<div id="map"><noscript><p>This application runs on the Google Map API and must have Javascript enabled in order to run. It appears that your have disabled your Javascript or you are using a very outdated browser. To enable Javascript, click on your browser options and select "Enable JavaScript."</p></noscript></div>
                        <?php
				#print "<p><img id =\"legend\" src =\"$legend\" alt =\"legend\"/></p>\n";
			?> 
		</div>	
		<div id ="rightCol">
			<fieldset>
				<legend>Control Panel</legend>

					<!-- Help popup -->
					<a onmouseover='this.style.cursor="pointer" ' onfocus='this.blur();' onclick="document.getElementById('HelpPopUp').style.display = 'block' " ><span style="text-decoration: underline;"><img src="images/help.png"></span></a>
					<div id='HelpPopUp' style='display: none; position: absolute; left: -50px; top: 0px; border: solid black 1px; padding: 10px; background-color: rgb(255,255,225); text-align: justify; font-size: 12px; width: 300px;'>
						<p>Earthquakes locations are available from the AVO catalog from February 2012 to present.  
						Older data are being filled in gradually. 
						<p/>
						To generate a cross-sectional plot, first define the cross-sectional area by clicking on the map to define the two endpoints, then enter in a Cross Section Width (default is 10 km), then click the "Plot X-section" button
						</p>	
						<div id = "latlonboundaries"></div><br/>
						<script type="text/javascript">
						<!--
							month1 = date1.getMonth() + 1
							day1 = date1.getDate()
							year1 = date1.getFullYear()
							hour1 = date1.getHours()
							minute1 = date1.getMinutes()

							month2 = date2.getMonth() + 1
							day2 = date2.getDate()
							year2 = date2.getFullYear()
							hour2 = date2.getHours()
							minute2 = date2.getMinutes()

							document.write("Time range:&nbsp;" + year1 + "/" + month1 + "/" + day1 + "/" + "&nbsp;" + hour1 + ":" + minute1 + " to ")
							document.write(year2 + "/" + month2 + "/" + day2 + "/" + "&nbsp;" + hour2 + ":" + minute2 + "<br/>")
							document.write("Timezone offset (in minutes) is "+date2.getTimezoneOffset()+" minutes from UTC<br/>"); 
							//-->
						</script>
						<br />
						<div style='text-align: right;'><a onmouseover='this.style.cursor="pointer" ' style='font-size: 12px;' onfocus='this.blur();' onclick="document.getElementById('HelpPopUp').style.display = 'none' " ><span style="text-decoration: underline;">Close</span></a></div>
					</div>

				<div id = "controlLeft">
                                        <b>Volcano: </b>
                                        <?php
                                		print "<a href=\"$thisPage?volcano=$prevvolcano\">&lArr;</a>\n";
					?>

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
                                        <?php
                                		print "<a href=\"$thisPage?volcano=$nextvolcano\">&rArr;</a>\n";
					?>

<div id="magnitude_selector">
   <table>
                                                <tr>
                                                        <td>
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
                                                        </td>
                                                </tr>
                                        </table>
</div>
				</div>
				<div id = "controlRight">
					<form>
					 	Color by:
						<label><input type="radio" id ="plotTime" name="plot" checked = "checked" />Time</label>
						<label><input type="radio" id ="plotDepth" name="plot" />Depth</label>
						<br/>
						
						Show Stations: 
					    	<label><input type="radio" id ="plotStaTrue" checked="checked" name="plot2" />Yes</label>
					    	<label><input type="radio" id ="plotStaFalse" name="plot2" />No</label>
						<br/>
						Show Volcanoes:
					    	<label><input type="radio" id ="plotVolcanoesTrue" checked="checked" name="radioPlotVolcanoes" />Yes</label>
					    	<label><input type="radio" id ="plotVolcanoesFalse" name="radioPlotVolcanoes" />No</label>
						<br/>

						<a onmouseover='this.style.cursor="pointer" ' onfocus='this.blur();' onclick="document.getElementById('LegendPopUp').style.display = 'block' " ><span style="text-decoration: underline;">Legend</span></a>
						<div id='LegendPopUp' style='display: none; position: absolute; left: -500px; top: 50px; border: solid black 1px; padding: 10px; background-color: rgb(255,255,225); text-align: justify; font-size: 12px; width: 700px;'>
 							<?php
                        					print "<p><img id =\"legend\"  src =\"$legend\" alt =\"legend\"/></p>\n";
                					?>
							<br />
							<div style='text-align: right;'><a onmouseover='this.style.cursor="pointer" ' style='font-size: 12px;' onfocus='this.blur();' onclick="document.getElementById('LegendPopUp').style.display = 'none' " ><span style="text-decoration: underline;">Close</span></a></div>
						</div>
						<br/>

						<!-- VALVE plots  -->
						<a onmouseover='this.style.cursor="pointer" ' onfocus='this.blur();' onclick="document.getElementById('ValvePopUp').style.display = 'block' " ><span style="text-decoration: underline;">Sections</span></a>
						<div id='ValvePopUp' style='display: none; position: absolute; left: -500px; top: 50px; border: solid black 1px; padding: 10px; background-color: rgb(255,255,225); text-align: justify; font-size: 12px; width: 700px;'>
							<img id="cumcounts" src="blank.png" alt="plot cum counts from valve">
							<img id="timedepth" alt="plot time depth from valve">
							<br/>
							<div style='text-align: right;'><a onmouseover='this.style.cursor="pointer" ' style='font-size: 12px;' onfocus='this.blur();' onclick="document.getElementById('ValvePopUp').style.display = 'none' " ><span style="text-decoration: underline;">Close</span></a></div>
						</div>

					</form>
				</div>
				<div class = "clear"></div>
				<hr/>
				<div id="xsec_options"></div>
				<hr/>
				<div id = "controlLeft">

					Time Options: 
					<div id="datecontrol"></div><p>
					<div id="timerange_options"></div>
					<div id="time_options"></div>
				</div>
				
				<div class = "clear"></div>
				<!--<div id = 'webiEventDisplay' style = "display: none"></div>-->
				<hr/>
				<input id ="reset" type="submit" value="Reset Map"/>
				<div id ="loading"><img src = "images/loading.gif" alt = "loading" /></div>
				<h2 id ="loadText">Loading...</h2>
		
			</fieldset>
			<h2>List of <span id ="numberEQs">0</span> EQ(s) on Map</h2>
			<p id ="listTop">Mag Time(UTC) Depth(km)</p>
			<ul id ="eqlist">
				<li id = "starter"></li><!--for validation-->
			</ul>
		</div>	
		<div class ="clear"></div>
		<div id="chart_div"></div>
	
		<!-- VALVE plots 
		<img id="cumcounts" src="blank.png" alt="plot cum counts from valve">
		<img id="timedepth" alt="plot time depth from valve">
		-->

		
		<!--%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%-->
		<!-- Begin code to get single date or range of dates -->
		<script type="text/javascript">
     	 
			if (GBrowserIsCompatible()) {
	      			document.getElementById("timerange_options").innerHTML=radioTimeRangeHTML;
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
					document.getElementById("timerange_options").innerHTML = "";
          				cal.manageFields("day", "day", "%m/%d/%Y");
        			} else {
        				if (document.getElementById("range").checked==true) {
          					document.getElementById("time_options").innerHTML = range_days_html;
						document.getElementById("timerange_options").innerHTML = "";
          					cal.manageFields("dayone", "dayone", "%m/%d/%Y");
          					cal.manageFields("daytwo", "daytwo", "%m/%d/%Y");
					} else { // last
						document.getElementById("timerange_options").innerHTML = radioTimeRangeHTML;
						document.getElementById("time_options").innerHTML = "";
					}
					
				}		
      			};
      
			function timeRangeChanged(someObj) {
                      		var numDays = parseInt(someObj.value);
                      		date1 = new Date();
                      		date2 = new Date();
				date2.setMinutes(date2.getMinutes() + date2.getTimezoneOffset()); 
                      		date1.setDate(date2.getDate()-numDays);
				date1.setMinutes(date1.getMinutes() + date1.getTimezoneOffset()); 
                      		initialPlot = 0;
				getEqs(date1, date2);
			}
                      	date1 = new Date();
                      	date2 = new Date();
			date2.setMinutes(date2.getMinutes() + date2.getTimezoneOffset()); 
                      	date1.setDate(date2.getDate()-7);
			date1.setMinutes(date1.getMinutes() + date1.getTimezoneOffset()); 
			initialPlot = 0;
			getEqs(date1, date2);

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
