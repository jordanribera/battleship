<?php

include 'dbconnect.php';

$request_type = $_GET['type'];

switch ($request_type) {

	case 'get_scores':
		$scores_array = get_it("SELECT * FROM scores ORDER BY score_score DESC", "multi");
		
		foreach( $scores_array as $this_score)
		{
			echo '<div>' . $this_score['score_name'] . ' scored ' . $this_score['score_score'] . '</div>';
		}
	break;
	
	case 'set_score';
		$score_name = $_GET['name'];
		$score_score = $_GET['score'];
		
		$result = get_it("INSERT INTO scores SET score_name='" . $score_name . "', score_score='" . $score_score . "'", "put");
	break;

}
echo $output;

?>
