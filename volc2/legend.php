<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<link rel="stylesheet" type="text/css" href="volc2.css" />
<?php
                        # Read in parameters from the configuration file
                        $configfile = "../volc2config.xml";
                        $config = simplexml_load_file($configfile) or die("file not found: $configfile\n");
                        $legend = $config->legend;
?>

	</head>
	<body>
                <?php
                	print "<p><img id =\"legend\"  src =\"$legend\" alt =\"legend\"/></p>\n";
                ?>

	</body>
</html>
