<?php

//error_reporting(E_ERROR | E_WARNING | E_PARSE);

// hardwire
$db_host = "local";

switch ($db_host) {
	
	case "local"; //database is referenced locally, as on lunarpages//

	$link = mysql_connect("localhost", "root", "zotqzyzw") or die ('I cannot connect to the database because: ' . mysql_error());
	mysql_select_db("battleship"); //database name goes here
	break;
}

//get_it function!
function get_it($get_q,$method) {
	if ($get_r = mysql_query($get_q)) {
		
		if ($method == "array") {
			while($get_ar = mysql_fetch_array($get_r)) {
				$results[] = $get_ar[0];
			}
		} elseif ($method == "assoc") {
			while($get_ar = mysql_fetch_array($get_r)) {
				$results[$get_ar[0]] = $get_ar[1];
			}
		} elseif ($method == "assoc_swapped") {
			while($get_ar = mysql_fetch_array($get_r)) {
				$results[$get_ar[1]] = $get_ar[0];
			}
		} elseif ($method == "row") {
			$get_ar = mysql_fetch_assoc($get_r);
			if (is_array($get_ar)) {
				foreach ($get_ar as $key=>$value) {
					$results[$key] = $value;
				}
			}
		} elseif ($method == "multi") {
		
			while($get_ar = mysql_fetch_assoc($get_r)) {
				$results[] = $get_ar;
			}
		} elseif ($method == "single") {
			$get_ar = mysql_fetch_array($get_r);
			$results = $get_ar[0];
		} elseif ($method == "rows") {
			return mysql_num_rows($get_r);
		} elseif ($method == "put") {
			return $get_r;
		} elseif ($method == "delete") {
			return $get_r;
		}
		mysql_free_result($get_r);
	} else {
		$results['error'] = "get_q ($get_q) failed: " . mysql_error();
		return $results;
	}

	return $results;
}
?>
