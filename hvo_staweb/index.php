<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		
    		<title>HVO Webicorders</title>
		<script type='text/javascript' src='http://www.google.com/jsapi'></script>
		<script src = "js_scripts/prototype-1.6.0.3.js"  type="text/javascript"></script>
		<script src = "js_scripts/effects.js" type="text/javascript"> </script>
		<script src = "../volc2/js_scripts/scriptaculous.js" type="text/javascript"></script>
		<script src = "js_scripts/checkMobile.js" type="text/javascript"> </script>
		<script src = "js_scripts/plotStations.js" type="text/javascript"> </script>
		<link rel="stylesheet" type="text/css" href="sta.css">
		<link rel="stylesheet" type="text/css" href="webi2.css" />
		<link rel="Shortcut Icon" href="images/wavelet.png"/>	
		<meta http-equiv="refresh" content="3600" > 
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

                        $volcano = !isset($_GET['volcano'])? "All" : $_GET['volcano'];

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
			var date1 = new Date(1970, 0, 1, 0, 0, 0);
			var date2 = new Date();
                </script>

		<!-- # Set XML filenames here -->
		<?php
			$staXML = "$xml_directory/stations_$volcano.xml";
			if (!file_exists($staXML)) { # GT 2011/11/12: This is a hack so I can use the
			# HVO sta_file.xml file from Wes for HVO data
				$staXML = "$xml_directory/sta_file.xml";
			}
			if (!file_exists($staXML)) { 
				die("</head><body>Station XML file ($staXML) not found</body></html>");
			}
		?>
		<script src = "js_scripts/plotVolcanoes.js" type="text/javascript"> </script>
		<link rel="stylesheet" type="text/css" href="volc2.css" />
                <script type="text/javascript">
                        volcanoesxmlfile = "<?php print $volcanoesxmlfile; ?>";
                        staXML = "<?php print $staXML; ?>";
                </script>
	</head>
  <body onunload="GUnload()">
    <!-- you can use tables or divs for the overall layout -->
    <table>
      <tr>
      <table id="header_info">
      <td>
      	<div id ="header"><a href ="http://hvo.wr.usgs.gov"><img id = "logo" src = "images/hvoLogo.gif" alt = "logo"/></a>
      		<div style="float: right">
				<img id = "req2Logo" src = "images/webi2logo.png" alt = "Webicorders from the Orcid Isle"/>
			</div>
<!--			<span>Beta Version</span> -->
		</div>
	   </td>
	   </tr>
	</table>
 	<hr>
 		
	<table>
	<tr>
        <td><div id="map"></div></td>
        <td><span><div id="search_function"></div></span><hr>
      		<div id="rightSide">
        	<div id="rightSideHeader"><span> Station List </span></div>
			  <div id="side_bar"></div>
		</div>
        </td>
      </tr>  
	<td><div id="legend">
	<img id = "legendFig" src = "images/webiLegend.png" alt = "Legend"/> 
	</div></td>
	<td><div>
	<img id = "helpLogo" src = "images/help_icon.png" alt = "Help"/> 
	<div id = 'webiHelpBox' style = "display: none">
	<img id = 'webiHelpClose' src ="images/close.jpg" alt ="close"/>
	<div class ='clear'></div>
	<p> Webicorders are simply long seismograms that are "wrapped", much as a
	word processor wraps a long sentence or paragraph into many lines.  They are 
	useful for viewing seismic activity at a single station over a long period of time.
	HVO already provides a subset of stations in webicorder form.  This 
	interface is an experiment to see if we can serve all of our stations out.  We are
	initially encouraged by the results and are eager to hear comments at 
	wthelen@usgs.gov .
	</p>
	<p> Stations are shown with triangles.  Click on a triangle to see the webicorders
		   for that particular station.  The HVO consists of three principal types of stations:
		   </p>
		   <ul>
		   <li> Short Period (SP, red): Seismic stations that are sensitive to frequencies 
		          above 1-2 Hz.  Short period instruments are excellent for locating small earthquakes 
		          and tend to be robust in adverse conditions(like volcanoes).</li>
		    <li> Broadband (BB, blue): Seismic stations that are sensitive to a broad range of
		           frequencies, often down to 40 second periods or more.  Good for analyzing 
		           large earthquakes at large distances and for noise studies.</li>
		     <li> Strong Motion (SM, black): Seismic stations that are built to stay on-scale
		     		even in the largest earthquakes at close distances.  These stations are 
		     		often located in buildings or school and are vital for studying the local effects
		     		of large earthquakes. </li></ul>
       <p> Several links are present for each station.  The 6-hour link represents the current
       data the network has available.  The 12 and 24 hour plots are updated hourly.  The 6-
       hour links may be down during times of eruptions or moderate earthquakes.  
       When clicking the 6 hour link, a white page with the message "Error: could not get helicorder data, check channel (code)." means 
 		that the station is broken and not reporting.  This is normal.  Other links for that station will 
 		also be broken.</p>
	<!--	<p> PDF stands for the power density function and refers to the ambient noise present at a given 
 		station.  Seismologists use it as a tool to judge station quality. See DBO for an example of a 
 		good station.  See http://pubs.usgs.gov/of/2005/1438/pdf/OFR-1438.pdf for details.  Figure 4 is 
 		particularly useful.  </p> -->
		
	</div></td>
	</table>
	<tr><div id="explanation">
 		<p>
 		This webpage is under development.  There are errors.  The page may not be available at
 		all times, particularly as we find the limits of our server.  Thanks for aiding us in developing a product that enhances our ability to share data with the public
 		in a timely and useful manner.  Please email errors or broken links to webmaster@hvo.wr.usgs.gov. 
 		</p>
 		</div>
 		</tr>

    <noscript><b>JavaScript must be enabled in order for you to use Google Maps.</b> 
      However, it seems JavaScript is either disabled or not supported by your browser. 
      To view Google Maps, enable JavaScript by changing your browser options, and then 
      try again.
    </noscript>

    <script type="text/javascript">
    //<![CDATA[

    if (GBrowserIsCompatible()) {


      // Read and overlay station data
     	 	var sidebar = 1;	//Boolean value 0 = no sidebar 1 = sidebar w/ stations
     	 	var pdf = 0;    //Boolean value 0 = no pdf links 1 = add pdf links into station bubble
     	 	plotStations();
     	 	
     	 	// Search stuff
			var search_html='<table><td>Station Search:<br><input id="search" type="text" style="width:100px;" name="searchbox" value="" onkeypress="if(event.keyCode==13){getStation()}"></td></table><table><td><input id="mybutton" type="submit" value="Search" onClick="getStation()"></td><td><input id="this1" type="button" value="Reset Map" onClick="resetMap();"></td></table>';
			document.getElementById("search_function").innerHTML=search_html;
			
			// create the map
			var map = new GMap2(document.getElementById("map"),{ size: new GSize(600,750) });
			map.removeMapType(G_HYBRID_MAP);
			map.addMapType(G_PHYSICAL_MAP);
			map.addControl(new GLargeMapControl());
			map.addControl(new GMapTypeControl());
			//map.setCenter(new GLatLng( 19.75,-155.5), 9);
			map.setCenter(new GLatLng( mapParam.lat,mapParam.lon), mapParam.zoom);
			map.savePosition();
			map.setMapType(G_PHYSICAL_MAP);
			//map.enableContinuousZoom();
			map.disablePinchToZoom();
			map.enableDoubleClickZoom();
			map.addControl(new GScaleControl());
			
			//scriptacolous effects
			$('helpLogo').observe('click', function(){
			new Effect.BlindDown('webiHelpBox');
			});
	
			$('webiHelpClose').observe('click', function(){
			new Effect.BlindUp('webiHelpBox');
			});
			
    } // finished checking for browswer compatability
    else {
      alert("Sorry, the Google Maps API is not compatible with this browser");
    }
    
    
    
    </script>
    <script type="text/javascript">
	var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
	document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
 		</script>
 		<script type="text/javascript">
	try {
        var pageTracker = _gat._getTracker("UA-4670028-1");
        pageTracker._trackPageview();
	} catch(err) {}
    </script>
    
  </body>
</html>
