/***/////////////////////////
/***///GAMEPLAY///VARIABLES//
/***/////////////////////////
/***/
/***/var playerOneName = ''; //player names blank to start
/***/var playerTwoName = '';
/***/
/***/var currentPlayer = 1; //holds the value of the current acting player
/***/var currentOpponent = 2; //holds the value of the current acting player's opponent
/***/
/***/var turnShotCount = 0; //counter for number of shots made in the current turn (firing disabled when > 0)
/***/
/***/var grid = new Array(); //multi-dimensional array:
/***/						 //grid[player][x][y]['ship'] holds the value of the ship (or emptiness) which occupies the space at x,y on player's grid
/***/						 //grid[player][x][y]['shot'] holds the information regarding whether the space has been fired at
/***/
/***/var playerShips = new Array(); //multi-dimensional array:
/***/								//playerShips[player][ship]['status'] holds the current status of the given ship (sunk/fine)
/***/								//playerShips[player][ship]['ship_length'] holds the length of the ship (used to calculate point-value for sinking
/***/								//playerShips[player][ship]['ship_type'] holds the type of the ship (carrier, battleship, cruiser, submarine, destroyer)
/***/								//playerShips[player][ship]['sections'] is a multidimenional array which holds grid coordinates and status of each 
/***/								//		section of the ship (number of sections == length of ship)
/***/
/***/var playerStats = new Array(); //multi-dimensional array:
/***/								//playerStats[player]['shots'] holds the number of shots that have been taken by player
/***/								//playerStats[player]['hits'] holds the number of hits made by the player
/***/								//playerStats[player]['sinks'] holds the number of enemy ships sunk by the player
/***/								//playerStats[player]['sink_points'] total points awarded for ships sunk (ship point value = [6 - ship length])
/***/


/***//////////////////////////////
/***///CONFIGURATION///VARIABLES//
/***//////////////////////////////
/***/
/****HIT+MISS COLORS****/
/***/var playerMissColor = 'white';
/***/var playerHitColor = 'red';
/***/var opponentMissColor = 'white';
/***/var opponentHitColor = 'red';
/***/
/***/var countShots = true; //false: unlimited shots per turn (debugging only)
/***/var fogOfWar = true; //fog of war on/off
/***/var markShips = false; // mark ships with their id? (debugging only)
/***/
/***/var gridSize = 10; //size of grid
/***/
/****NUMBER OF SHIPS****/
/***/var caNumX = 1;//aircraft carriers
/***/var bsNumX = 1;//battleships
/***/var crNumX = 1;//cruisers
/***/var suNumX = 1;//submarines
/***/var deNumX = 1;//destroyers
/***/

/***/////////////////////
/***///AJAX///VARIABLES//
/***/////////////////////
/***/
/***/var scoreGetter = createRequestObject();
/***/var scoreSetter = createRequestObject();
/***/


/***//////////////////////
/***///SILLY///VARIABLES//
/***//////////////////////
/***/
/***/var finishTurnButton = '<a href="javascript:finishTurn()"><div class="button" onmouseover="highlightButton(this)" onmouseout="unhighlightButton(this)"><div class="button_text">Finish Turn</div><img class="button_icon" src="images/next_arrow.png" /></div></a>';
/***/var skipTurnButton = '<a href="javascript:finishTurn()"><div class="button" onmouseover="highlightButton(this)" onmouseout="unhighlightButton(this)"><div class="button_text">Skip Turn</div><img class="button_icon" src="images/x_icon.png" /></div></a>';
/***/var startTurnButton = '<a href="javascript:startTurn()"><div class="button" onmouseover="highlightButton(this)" onmouseout="unhighlightButton(this)"><div class="button_text">Begin Turn</div><img class="button_icon" src="images/next_arrow.png" /></div></a>';
/***/var startSetupButton = '<a href="javascript:welcomeStart()"><div id="welcome_start" class="button" onmouseover="highlightButton(this)" onmouseout="unhighlightButton(this)"><div class="button_text">Start!</div><img class="button_icon" src="images/next_arrow.png" /></div></a>';
/***/var startGameButton = '<a href="javascript:setupStart()"><div id="setup_start" style="display:none;" class="button" onmouseover="highlightButton(this)" onmouseout="unhighlightButton(this)"><div class="button_text">Start Game!</div><img class="button_icon" src="images/next_arrow.png" /></div></a>';
/***/var playAgainButton = '<a href="javascript:playAgain()"><div id="play_again" class="button" onmouseover="highlightButton(this)" onmouseout="unhighlightButton(this)"><div class="button_text">Play Again?</div><img class="button_icon" src="images/refresh_icon.png" /></div></a>';
/***/


/***////////////////////////////
/***///GAME///SETUP///FUNTIONS//
/***////////////////////////////
function initialize()
{//runs the setup functions required for the start of the game
	//writes ship and shot grids for both players
	writeGrid(1, 'ship');//player 1 shipgrid
	writeGrid(1, 'shot');//player 1 shotgrid
	writeGrid(2, 'ship');//player 2 shipgrid
	writeGrid(2, 'shot');//player 2 shotgrid

	//setup player ships
	setShips(1, caNumX, bsNumX, crNumX, suNumX, deNumX);//place ships for player 1 (see config variables for ship numbers)
	setShips(2, caNumX, bsNumX, crNumX, suNumX, deNumX);//place ships for player 2
	
	
	//setup player stats
	playerStats[1] = new Array();
	playerStats[2] = new Array();
	
		//set each player's shot counter to zero
		playerStats[1]['shots'] = 0;
		playerStats[2]['shots'] = 0;
		
		//set each player's hit counter to zero
		playerStats[1]['hits'] = 0;
		playerStats[2]['hits'] = 0;
		
		//set each player's sinks to zero
		playerStats[1]['sinks'] = 0;
		playerStats[2]['sinks'] = 0;
		
		//set each player's sink-points to zero
		playerStats[1]['sink_points'] = 0;
		playerStats[2]['sink_points'] = 0;
	
	//get ship status for each player (reads playerShips array and renders the corresponding fleet view)
	getShipsStatus(1);
	getShipsStatus(2);
	
	//put the selected player names into the player name spots!
	document.getElementById('player1_name_slot').innerHTML = playerOneName;
	document.getElementById('player2_name_slot').innerHTML = playerTwoName;
	//more player name spots please!!!!
}

function writeGrid(player, gridType)
{//writes grid for player
	var playerText = getPlayerText(player);//get playerText
	var gridText = '';
	var gridHeadingText = '';
	
	if (gridType == 'ship')
	{//writing a ship grid...
		gridText = 'shipgrid';
		gridHeadingText = 'Your Fleet';
	}
	else
	{//writing a shot grid
		gridText = 'shotgrid';
		gridHeadingText = 'The Battlefield';
	}
	
	//write grid heading
	document.getElementById(playerText + '_' + gridText + '_heading').innerHTML = gridHeadingText
	
	//start the table which is the visual display of the grid
	var gridCode = '<table id="' + playerText + '_' + gridText + '" class="' + gridText + '" cellspacing="0">';

	var onClickCode = '';
	var onMouseOverCode = '';
	var onMouseOutCode = '';
	if (gridText == 'shotgrid')
	{//if this is a shotgrid, include the desired mouse events
		onMouseOverCode = ' onmouseover="targetSquare(this)"';
		onMouseOutCode = ' onmouseout="untargetSquare(this)"';
	}
	else
	{//if not, clear them (they may have been set last time!)
		onMouseOverCode = '';
		onMouseOutCode = '';
		onClickCode = '';
	}
	
	for (var y = 1; y <= gridSize; y++)
	{
		gridCode = gridCode + '<tr>';
		for(var x = 1; x <= gridSize; x++)
		{
			if (gridText == 'shotgrid')
			{//if this is a shotgrid, bind the firing function!
				onClickCode = ' onclick="fireAt(' + x + ',' + y + ')"';
			}
			gridCode = gridCode +  '<td id="' + playerText + '_' + gridText + '_x' + x + 'y' + y + '" class="grid_space"' + onClickCode + onMouseOverCode + onMouseOutCode + '></td>';//??include target player in firAt()?
		}
		gridCode = gridCode +  '</tr>';
	} 
	gridCode = gridCode +  '</table>';
	document.getElementById(playerText + '_' + gridText + '_div').innerHTML = gridCode;
}

function setShips(player, caNum, bsNum, crNum, suNum, deNum)
{//sets the ships for the player
	if (player != 1)
	{//just making sure...
		player = 2;
	}
	
	//new array to hold the player's ships
	playerShips[player] = new Array();
	
	//new grid array for the player
	grid[player] = new Array();

	//set up empty grids for player x
	for (var y = 1; y <= gridSize; y++)
	{
		grid[player][y] = new Array();
		for(var x = 1; x <= gridSize; x++)
		{
			grid[player][y][x] = new Array();
			//player x has ships where...
			grid[player][y][x]['ship'] = 0;//0 means there is no ship here
			//player x has been shot at by player y where...
			grid[player][y][x]['shot'] = 0;//0 means nobody has shot here
		}
	}

	while (caNum > 0)
	{//place the specified number of carriers
		placeShip(player, 'Carrier', caNum, 5);
		caNum--;
	}
	
	while (bsNum > 0)
	{//place the specified number of battleships
		placeShip(player, 'Battleship', bsNum, 4);
		bsNum--;
	}
	
	while (crNum > 0)
	{//place the specified number of cruisers
		placeShip(player, 'Cruiser', crNum, 3);
		crNum--;
	}
	
	while (suNum > 0)
	{//place the specified number of submarines
		placeShip(player, 'Submarine', suNum, 3);
		suNum--;
	}
	
	while (deNum > 0)
	{//place the specified number of destroyers
		placeShip(player, 'Destroyer', deNum, 2);
		deNum--;
	}
}

function placeShip(player, shipType, seriesNumber, shipLength)
{//places the specified ship on the player's grid
	var shipTag = shipType + '_' + seriesNumber;//make a tag (name) for the ship

	var playerText = getPlayerText(player);//get playerText

	if(Math.random() > .5)
	{//randomly choose hotizontal or vertical orientation
		var horizontal = true;
	}
	else
	{
		var vertical = true;
	}

	//choose random coordinates for the ship's starting point
	shipStartX = getRandomNumber(gridSize - (shipLength - 2));//random number
	shipStartY = getRandomNumber(gridSize - (shipLength - 2));//random number
	//valid range for ship starting is gridSize - the length of the ship

	var spaceClear = true;//what optimistic code!
	var testingLength = 0;//keeps track of how far you have tested
	var xLength = 0;//keeps track of horizontal extension
	var yLength = 0;//...and vertical extention
	while (testingLength < (shipLength))
	{//test until the whole ship length has been "placed"
		if(grid[player][shipStartX + xLength][shipStartY + yLength]['ship'] != 0)
		{//if any spot in the placement is already taken, the ship cannot be placed there
			spaceClear = false;
		}
		
		testingLength++;// you have tested another spot!
		
		if (horizontal == true)
		{//if placing horizontally, extend horizontally
			xLength++;
		}
		else
		{//if vertically, then vertically
			yLength++;
		}
	}
		
	if(spaceClear == true)
	{//congrats, checking the chosen coordinates found no interrupting ships, you are free to place the ship!
		playerShips[player][shipTag] = new Array();//so we make the ship an entry in playerShips
		playerShips[player][shipTag]['status'] = 'fine';//set its status to fine (not sunk)
		playerShips[player][shipTag]['ship_length'] = shipLength;//give ths ship's length
		playerShips[player][shipTag]['ship_type'] = shipType;//...and type
		playerShips[player][shipTag]['sections'] = new Array();//and make an array for its sections
		
		var placingLength = 0;//same kind of thing as testingLength
		var opponentText = getPlayerText(opponentOf(player))//!
		xLength = 0;//same as before
		yLength = 0;
		while (placingLength < (shipLength))
		{//place each section of the ship
			grid[player][shipStartX + xLength][shipStartY + yLength]['ship'] = shipTag;
			
			//mark the ship on the player's shipgrid
			document.getElementById(playerText + '_shipgrid_x' + (shipStartX + xLength) + 'y' + (shipStartY + yLength)).style.backgroundColor = 'gray';
			
			if(!fogOfWar)
			{//mark the ship on the opponent's shotgrid bwahahaha
				document.getElementById(opponentText + '_shotgrid_x' + (shipStartX + xLength) + 'y' + (shipStartY + yLength)).style.backgroundColor = 'gray'; 	
			}
			
			if(markShips)
			{//do you want to mark the ships with their tags? (demonstration + debugging)
				document.getElementById(playerText + '_shipgrid_x' + (shipStartX + xLength) + 'y' + (shipStartY + yLength)).innerHTML = shipTag;
			}
			
			//add a section to the ship in playerShips
			playerShips[player][shipTag]['sections'][placingLength] = new Array();//new array
			playerShips[player][shipTag]['sections'][placingLength]['x'] = shipStartX + xLength;//save x-coordinate
			playerShips[player][shipTag]['sections'][placingLength]['y'] = shipStartY + yLength;//and y-coordinate
			playerShips[player][shipTag]['sections'][placingLength]['status'] = 'fine';//the section is fine!
			
			//you have placed another section!
			placingLength++;
			
			if (horizontal == true)
			{//if placing horizontally, extend horizontally!
				xLength++;
			}
			else
			{//if vertically, then vertically!
				yLength++;
			}
		}
	}
	else
	{//well shoot, testing those coordinates failed because another ship was blocking that spot, try again
		placeShip(player, shipType, seriesNumber, shipLength);//yay for recursion
	}
}



/***//////////////////////////
/***///INTERFACE///FUNCTIONS//
/***//////////////////////////
function welcomeStart()
{//you are on the welcome page, this function handles the button that says "Start!"
	document.getElementById('screen_welcome').style.display = 'none';//hide the welcome screen
	document.getElementById('screen_setup').style.display = 'block';//display the setup screen
	
	//clear the player name boxes (newer browsers will remember the last entered names, this is annoying)
	document.getElementById('player1_name_input').value = '';//clear this one
	document.getElementById('player2_name_input').value = '';//clear that one
	//everything clear so far? good.
	
	//switch out the "Start!" button with the "Start Game!" button.
	document.getElementById('next_button').innerHTML = startGameButton;
	//(the "Start Game!" button will be invisible until both player names have been entered)

}

function checkNames()
{//you are on the setup screen, you are typing. this function checks to see if both player names have been entered.
	var name1 = document.getElementById('player1_name_input').value;//get the value of box 1
	var name2 = document.getElementById('player2_name_input').value;// and the value of box 2
	
	//do they both have stuff in them?
	if((name1 != '') && (name2 != ''))
	{//both name boxes have stuff in them. sweet.
		document.getElementById('setup_start').style.display = 'block';//ok, display the "Start Game!" button
	}
	else
	{//SOMETHING IS EMPTY
		document.getElementById('setup_start').style.display = 'none';//NO, hide the "Start Game!" button
	}
}

function setupStart()
{//you are on the setup screen, this function handles the button that says "Start Game!"
	document.getElementById('screen_setup').style.display = 'none';//hide the setup screen
	document.getElementById('screen_play').style.display = 'block';//show the play screen
	
	//gather player names from the boxes
	playerOneName = document.getElementById('player1_name_input').value;//name of player 1 as entered in the box
	playerTwoName = document.getElementById('player2_name_input').value;//same for player 2
	
	//switch out the "Start Game!" button for "Skip Turn"
	document.getElementById('next_button').innerHTML = skipTurnButton;
	
	//and...  ...[drumroll]...  ...initialize the game!
	initialize();
	//wasn't that exciting?
}

function playAgain()
{//game ended, user wants to play again.
	document.getElementById('screen_end').style.display = 'none';//hide the game end screen
	document.getElementById('screen_welcome').style.display = 'block';//show the welcome screen
	
	//replace the BUTTON with the "Start!" button
	document.getElementById('next_button').innerHTML = startSetupButton;
	
	//clear the say_box
	unSay();
}

function switchShipGridView(whose)
{//this function switches between the fleet grid view and the fleet overview view
	var playerText = getPlayerText(whose);//get playerText
	
	if(document.getElementById(playerText + '_shipgrid_div').style.display == 'block')
	{//current view is grid, change that.
		document.getElementById(playerText + '_shipgrid_div').style.display = 'none';//hide fleet grid
		document.getElementById(playerText + '_shipoverview_div').style.display = 'block';//show fleet overview
		
		document.getElementById(playerText + '_shipgrid_control_icon').style.backgroundImage = 'url(images/fleetOverviewIcon.PNG)';//change button icon
	}
	else
	{//current view is overview, change that.
		document.getElementById(playerText + '_shipgrid_div').style.display = 'block';//show fleet grid
		document.getElementById(playerText + '_shipoverview_div').style.display = 'none';//hide fleet overview
		
		document.getElementById(playerText + '_shipgrid_control_icon').style.backgroundImage = 'url(images/fleetGridIcon.PNG)';//change button icon
	}
}


/***////////////////////////
/***///COSMETIC///FUNTIONS//
/***////////////////////////
function highlightButton(which)
{//cosmetic function. highlights an interface button.
	which.style.color = 'white';
	which.style.borderColor = 'white';
}

function unhighlightButton(which)
{//cosmetic function. inverse of highlightButton().
	which.style.color = 'black';
	which.style.borderColor = 'black';
}

function targetSquare(which)
{//cosmetic function. highlights grid spaces under the mouse pointer for interactive flare
	if(turnShotCount == 0) //only execute this effect if the player is able to shoot currently
	{
		which.style.borderColor = 'red';
		if(which.style.backgroundColor == '')
		{
			which.style.backgroundColor = 'pink';
		}
	}

}

function untargetSquare(which)
{//cosmetic function. inverse of targetSquare(). removes highlight from grid space when mouse leaves.
	which.style.borderColor = '';
	
	//ONLY REMOVE HIGHLIGHT IF PLAYER HAS NOT SHOT HERE
	//(if player executes a shot in the current space, the color of the space will change colors depending on hit/miss)
	if(which.style.backgroundColor == 'pink') //firefox, ie6, ie7
	{
		which.style.backgroundColor = '';
	}
	else if(which.style.backgroundColor == 'rgb(255, 192, 203)') //google chrome
	{
		which.style.backgroundColor = '';
	}
	else if(which.style.backgroundColor == '#ffc0cb') //opera
	{
		which.style.backgroundColor = '';
	}
}


/***////////////////////////////////
/***///GAMEPLAY///FLOW///FUNCTIONS//
/***////////////////////////////////
function nextTurn()
{//switches the values of currentPlayer and currentOpponent. updates stats and ship status for the new current player. resets turn shot counter.
	if (currentPlayer == 1)
	{//if the current player is 1, change it to 2
		currentPlayer = 2;
		currentOpponent = 1;
	}
	else
	{//otherwise, change it to 1
		currentPlayer = 1;
		currentOpponent = 2;
	}
	
	//update stats for new current player
	getStats(currentPlayer);
	//update ship status for new current player
	getShipsStatus(currentPlayer);
	//reset turn shot counter
	turnShotCount = 0;
}

function finishTurn()
{//hides current player console, displays between-turn screen, calls nextTurn()
	if (currentPlayer == 1)
	{//if the current player is 1, hide player1_console
		document.getElementById('player1_console').style.display = 'none';
	}
	else
	{//else, hide player2_console
		document.getElementById('player2_console').style.display = 'none';
	}
	
	//either way, display between-turn screen
	document.getElementById('between_turns').style.display = 'block';
	//and proceed to next turn
	nextTurn();
	
	var nextPlayerName = playerOneName;
	if(currentPlayer != 1)
	{
		nextPlayerName = playerTwoName;
	}
	
	//clear the say_box
	say(nextPlayerName + ', please begin your turn.');
	
	//update the next_player span in the interlude screen
	document.getElementById('next_player').innerHTML = nextPlayerName;
	
	//also update the BUTTON	
	document.getElementById('next_button').innerHTML = startTurnButton;
}

function startTurn()
{//hides the between-turn screen, displays the new current player's console
	document.getElementById('between_turns').style.display = 'none';
	if (currentPlayer == 1)
	{//if current player is 1, show player1_console
		document.getElementById('player1_console').style.display = 'block';
	}
	else
	{//else, show player2_console
		document.getElementById('player2_console').style.display = 'block';
	}
	
	//clear the say_box
	unSay();
	
	//also, update the BUTTON
	document.getElementById('next_button').innerHTML = skipTurnButton;
	//(at start of turn, button says "skip turn". this changes when the player fires)
}

function endGame(victor)
{//end of game function. called when a ship is sunk and proves to be the last ship of the enemy fleet.
	document.getElementById('screen_play').style.display = 'none';//hide the play screen
	document.getElementById('screen_end').style.display = 'block';//show the ending screen]
	
	//render player stats on the end screen...
	outputFinalStats(1);//output player 1 stats
	outputFinalStats(2);//output player 2 stats
	
	var victorName = playerOneName;
	if (victor != 1)
	{
		victorName = playerTwoName;
	}
	document.getElementById('victor_declare').innerHTML = victorName;
	
	say('Game Over');
	
	//change the BUTTON to a "Play Again" button
	document.getElementById('next_button').innerHTML = playAgainButton;
}


/***//////////////////////////////////
/***///GAMEPLAY///COMBAT///FUNCTIONS//
/***//////////////////////////////////
function fireAt(xCoord, yCoord)
{//the mother of all combat functions. this function IS COMBAT
	//clear the say_box
	unSay();
	if (turnShotCount == 0)
	{//only fire if the player has not fired yet this turn
	
		var opponentText = getPlayerText(currentOpponent);//get opponentText
		var playerText = getPlayerText(currentPlayer);//get playerText

		var shipExists = false;//assume there is no ship here
		var shotExists = false;//assume player has never shot here

		if (grid[currentOpponent][xCoord][yCoord]['ship'] != 0)
		{//is there a ship here?
			shipExists = true;//yes.
		}
	
		if (grid[currentOpponent][xCoord][yCoord]['shot'] != 0)
		{//has the player shot here?
			shotExists = true;//yes.
		}
	
		if (shotExists)
		{//ok, so the player already shot here
			if (shipExists)
			{//there was a ship there, so tell the player they already hit it
				say('Already Hit That');
			}
			else
			{//there is no ship, so tell the player they've already shot this poor spot in the water
				say('Already Shot There');
			}
		}
		else
		{//the player has never shot here before (this is where it gets fun)
			playerStats[currentPlayer]['shots']++;//ok, you've never shot here before. this counts as a shot.
			
			if(countShots)
			{ //counting shots per turn? (turned off for debugging only)
				turnShotCount++;//yes.
			}
			
			//player has fired now. change the "skip turn" button to say "finish turn"
			document.getElementById('next_button').innerHTML = finishTurnButton;
	
			//was there a ship there?
			if (shipExists)
			{//awesome, you have not previously shot here but there is a ship. good hit.
				say('Ship Hit!');//announce hit
				document.getElementById(playerText + '_shotgrid_x' + xCoord + 'y' + yCoord).style.backgroundColor = playerHitColor;//change color on player's shotgrid
				document.getElementById(opponentText + '_shipgrid_x' + xCoord + 'y' + yCoord).style.backgroundColor = opponentHitColor;//change color on opponent's shipgrid
				grid[currentOpponent][xCoord][yCoord]['shot'] = '1';//update opponent's grid array
				playerStats[currentPlayer]['hits']++;//update player stats
				
				//now locate the shot section in playerShips and mark it!
				var hitShipTag = grid[currentOpponent][xCoord][yCoord]['ship'];
				var playerShipSectionFound = false;
				var playerShipSectionNumber = 0;
				
				while (playerShipSectionFound == false)
				{//check each section of the hit ship...
					if ((playerShips[currentOpponent][hitShipTag]['sections'][playerShipSectionNumber]['x'] == xCoord) && (playerShips[currentOpponent][hitShipTag]['sections'][playerShipSectionNumber]['y'] == yCoord))
					{//sweet, the coordinates of this section match the coordinates fired upon.
						playerShipSectionFound = true;//found the section, exit the loop.
						playerShips[currentOpponent][hitShipTag]['sections'][playerShipSectionNumber]['status'] = 'hit';
					}
					playerShipSectionNumber++;
				}
				
				if (checkShip(currentOpponent, hitShipTag) == false)
				{//check to see if there are any sections of the ship that remain unhit
					//ship has been sunk, act accordingly
					say('Ship Sunk!');
					playerShips[currentOpponent][hitShipTag]['status'] = 'sunk';//update the ship in playerShips
					playerStats[currentPlayer]['sinks']++;//update player stats
					playerStats[currentPlayer]['sink_points'] += ( 6 - playerShips[currentOpponent][hitShipTag]['ship_length'] );//award sink points
					
					//now check to see if all ships are sunk...
					var allShipsSunk = true;//what pessimistic code!
					for (var shipCheckIndex in playerShips[currentOpponent])
					{
						if(playerShips[currentOpponent][shipCheckIndex]['status'] != 'sunk')
						{//there is still at least one ship that has not been sunk
							allShipsSunk = false;
						}
					}
					
					if(allShipsSunk == true)
					{//if all ships have been sunk, end the game
						endGame(currentPlayer);
					}
					
				}
			}
			else
			{
				//you are shooting here for the first time, there is nothing here. maybe next time!
				say('Miss!');
				document.getElementById(playerText + '_shotgrid_x' + xCoord + 'y' + yCoord).style.backgroundColor = playerMissColor;
				document.getElementById(opponentText + '_shipgrid_x' + xCoord + 'y' + yCoord).style.backgroundColor = opponentMissColor;
				grid[currentOpponent][xCoord][yCoord]['shot'] = '1';
		
			}
	
		}
	
	}
	else //turnShotCount != 0
	{
		say('Already Fired: Turn Ended');
	}
	
	
	getStats(currentPlayer);//update stats display
}

function getShipsStatus(player)
{//check the status of ships!
	var output = '';
	for (var thisShipIndex in playerShips[player])
	{//check each ship in turn
		output = output + '<div class="shipstatus">';
		output = output + '<div class="shipoverview_shipname">' + playerShips[player][thisShipIndex]['ship_type'] + '</div>';
		output = output + '<table cellspacing="0" style="border: solid 1px black;"><tr>';
		for (var thisShipSectionIndex in playerShips[player][thisShipIndex]['sections'])
		{//check each section of the ship
			var backgroundColorCode = '';
			
			if (playerShips[player][thisShipIndex]['sections'][thisShipSectionIndex]['status'] == 'hit')
			{//if the section is hit, make it red
				backgroundColorCode = 'background-color: red;';
			}
			else
			{//if not, make it blue
				backgroundColorCode = 'background-color: gray;';
			}
			
			var filling = 'x=' + playerShips[player][thisShipIndex]['sections'][thisShipSectionIndex]['x'] + ' y=' + playerShips[player][thisShipIndex]['sections'][thisShipSectionIndex]['y'];
			filling = '';
			
			output = output + '<td class="shipoverview_shipnode" style="' + backgroundColorCode + '">' + filling + '</td>';
		}
		
		output = output + '</table>';
		output = output + '</div>';
		//output is the ship overview style fleetview
	}
	
	var playerText = getPlayerText(player);//get playerText
	//put this stuff in the player's overview
	document.getElementById(playerText + '_shipoverview_div').innerHTML = output;
}

function checkShip(player, shipTag)
{//checks the status of an individual ship
	var shipExists = false;//assum the worst
	for (var y = 1; y <= gridSize; y++)
	{//check the whole darn grid
		for(var x = 1; x <= gridSize; x++)
		{//yes. the whole thing.
			if ((grid[player][y][x]['ship'] == shipTag) && (grid[player][y][x]['shot'] != 1))
			{//if the grid space has the ship in it, awesome.
				shipExists = true;
			}
		}
	}
	return shipExists;
}



/***/////////////////////////////////////
/***///HELPER FUNCTIONS///AND///SCORING//
/***/////////////////////////////////////
function createRequestObject()
{//gets httpRequest object for ajax
        var httpRequest;
        if (window.XMLHttpRequest)
		{//Mozilla, Safari, ...
            httpRequest = new XMLHttpRequest();
        }
		else if (window.ActiveXObject)//IE
		{
            try {
                httpRequest = new ActiveXObject('MSXML2.XMLHTTP.3.0');//IE again...
            }
			catch (e)
			{
                try
				{
                    httpRequest = new ActiveXObject('Msxml2.XMLHTTP');//god dammit microsoft... make up your mind already!
                }
				catch(e)
				{
                    try
					{
                        httpRequest = new ActiveXObject('Microsoft.XMLHTTP');//...it was too much to hope for.
                    }
					catch(e)
					{/**FAIL*/}
                }
            }
        }
        return httpRequest;
}

function say(what)
{//this function replaces the ugly alert()s which we had
	document.getElementById('say_box').innerHTML = what;
	document.getElementById('say_box').style.display = 'block';
}

function unSay()
{//clears say_box and hides it
	document.getElementById('say_box').style.display = 'none';
	document.getElementById('say_box').innerHTML = '';

}

function getPlayerText(player)
{//helper function. takes player number and generates player text (which is used to identify divs owned by the player

	var output = 'player1';

	if (player != 1)
	{
		output = 'player2';
	}
	
	return output;	

}

function getRandomNumber(peakNum)
{//gets a random number between 1 and peakNum
	return Math.floor(Math.random() * (peakNum - 1)) + 1;
}

function getStats(player)
{//gets player stats and displays them
	if (player != 1)
	{
		player = 2;
	}
	
	playerText = getPlayerText(player);//get playerText
	
	//compute the score
	
	//display that stuff...
	document.getElementById(playerText + '_shots').innerHTML = playerStats[player]['shots'];
	document.getElementById(playerText + '_hits').innerHTML = playerStats[player]['hits'];
	document.getElementById(playerText + '_sinks').innerHTML = playerStats[player]['sinks'];
}

function computeScore(shotsFired, hits, sinkPoints)
{//method for computing score
	/* Score = Accuracy * Sink Points
	Accuracy = Hits / Shots Fired * 100
		Sink Points:
			Battleship[5 squares] = 1 point
			Carrier[4 squares] = 2 points
			Cruiser[4 squares] = 2 points
			Submarine[3 suqares] = 3 points
			Speed Boat[2 squares] = 4 points
		Total Sink Points Possible: 12
		Maximum Accuracy Possible: 100
		Maximum Score Possible: 1200 */ 

	var accuracy = 0;//accuracy = hits / shots fired * 100
	accuracy = (hits/shotsFired)*100;
	accuracy = parseFloat(accuracy); //displays accuracy in the form "000.00"
	
	var score = 0;//score = accuracy + sink points
	score = accuracy * sinkPoints; 
	return score;
}

function outputFinalStats(player)
{
	playerText = getPlayerText(player);//get playerText
	var playerName = playerOneName;//assume that it is player 1
	
	if (player != 1)
	{//well it isn't player one...
		playerName = playerTwoName;
	}
	var output = '<div id="player1_final_stats_name">' + playerName + '&rsquo;s Stats</div>';
	output = output + '<table id="' + playerText + '_final_stats_table" class="final_stats_table">';
	output = output + '<tr><td class="final_stats_row_label">Shots Fired:</td><td class="final_stats_row_value">' + playerStats[player]['shots'] + '</td></tr>';
	output = output + '<tr><td class="final_stats_row_label">Hits Scored:</td><td class="final_stats_row_value">' + playerStats[player]['hits'] + '</td></tr>';
	output = output + '<tr><td class="final_stats_row_label">Overall Accuracy:</td><td class="final_stats_row_value">' + Math.floor( ( playerStats[player]['hits'] / playerStats[player]['shots'] ) * 100 ) + '%</td></tr>';
	output = output + '<tr><td class="final_stats_row_label">Ships Sunk:</td><td class="final_stats_row_value">' + playerStats[player]['sinks'] + '</td></tr>';
	output = output + '<tr><td class="final_stats_row_label">Points Awarded for Sinking:</td><td class="final_stats_row_value">' + playerStats[player]['sink_points'] + '</td></tr>';
	output = output + '<tr><td class="final_stats_row_label">Overall Score:</td><td class="final_stats_row_value">' + ( Math.floor( ( playerStats[player]['hits'] / playerStats[player]['shots'] ) * 100 ) * playerStats[player]['sink_points'] ) + '</td></tr>';
	output = output + '</table>';
	var endingGrid = document.getElementById(playerText + '_shipgrid_div').innerHTML;
	output = output + '<div id="' + playerText + '_endinggrid" class="endinggrid">' + endingGrid + '</div>';
	
	
	document.getElementById(playerText + '_final_stats').innerHTML = output;
}

function getScores()
{//ajax funtion for fetching the list of high scores
	scoreGetter.open('get', 'ajax.php?type=get_scores', true);//open!

	scoreGetter.onreadystatechange = handleScoreGetter;//set handler

	if(scoreGetter.readyState > 0)
	{//send when ready!
		scoreGetter.send(null);
	}
}

function handleScoreGetter()
{//so the state of the scoregetter changed...
	if(scoreGetter.readyState == 4)
	{//is it READY?
		if(scoreGetter.status == 200)
		{//does it have STUFF??
			var response = scoreGetter.responseText;//get stuff
			document.getElementById('high_scores').innerHTML = response;//display stuff
		}
	}
}

function opponentOf(player)
{//returns the opponent number of the given player
	var output = 2;
	if (player != 1)
	{
		output = 1;
	}
	return output;
}
