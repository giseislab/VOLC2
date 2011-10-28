#!/usr/bin/perl
$WEEKAGO = (time() + 8 * 60 * 60) - 7 * 24 * 60 * 60;
$YEARAGO = (time() + 8 * 60 * 60) - 365 * 24 * 60 * 60;
$XMLDIR = "../xmlfiles/avo_uaf";
$VIEWSFILE = "volcanoviews.txt";
system("mkdir -p $XMLDIR");
open(FIN,$VIEWSFILE) or die $!; 
open(FOUT,">$XMLDIR/volcanolist2.xml") or die $!; 
print FOUT "<volcanoes>\n";

while ($line = <FIN>) {
	chomp($line);
	@fields = split(/ /, $line);
	$volcano = $fields[0];
	$lat = $fields[1];
	$lon = $fields[2];
	$zoom = $fields[3];
	$dist = (2.0 ** (12 - $zoom)) * 5.0;
	print "volcano = $volcano, lat = $lat, lon = $lon, zoom = $zoom, distance = $dist\n";
	system("css2volcxml -x -b -f -e \"time>$WEEKAGO && deg2km(distance($lat, $lon, lat, lon))<$dist\" /Seis/Kiska4/picks/Total/Total  > $XMLDIR/origins_$volcano"."_lastweek.xml");
	print("css2volcxml -x -b -f -e \"time>$WEEKAGO && deg2km(distance($lat, $lon, lat, lon))<$dist\" /Seis/Kiska4/picks/Total/Total  > $XMLDIR/origins_$volcano"."_lastweek.xml\n");
	#system("css2volcxml -x -b -f -e \"time>$YEARAGO && deg2km(distance($lat, $lon, lat, lon))<$dist\" /Seis/Kiska4/picks/Total/Total  > $XMLDIR/origins_$volcano.xml");
	#system("css2volcxml  -x -s -f -e \"deg2km(distance($lat, $lon, lat, lon))<$dist\" /avort/oprun/dbmaster/master_stations  > $XMLDIR/stations_$volcano.xml");
	print FOUT "<volcano name=\"$volcano\" lat=\"$lat\" lon=\"$lon\" zoomlevel=\"$zoom\" />\n";
}
print FOUT "</volcanoes>\n";
close(FIN);
close(FOUT);
