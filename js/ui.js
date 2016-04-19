/* Global variables */
const SIZE_OF_BOARD = 9;
const SIZE_OF_SQUARE = 3;


/* FUNCTIONS */

// Change the button state from disabled to enabled depending on if the table is empty or not
function changeButtonState(state) {
	if (state == "disable") {
		$('button#solve').addClass('pure-button-disabled'); // disable the "Solve" button
	} else if (state == "enable") {
		$('#solveEmptyButtons button').removeClass('pure-button-disabled'); // enable solve/empty buttons
	} else {
		var flag = true;

		// enable the "Solve" button if the grid is not completely empty
		$('table tbody td input').each(function() {
			if ($(this).val() != '') {
				$('#solveEmptyButtons button').removeClass('pure-button-disabled');
				flag = false;

				return false; // break from loop
			}
		});

		if (flag) // flag not toggled, the entire table is empty
			$('#solveEmptyButtons button').addClass('pure-button-disabled');
	}
}

// fill the Board array with the values inputted by the user
function preFillBoard() {
	// traverse the whole input table
	$('table tbody tr').each(function(i) {
		$(this).find('td input').each(function(j) {
			var value = parseInt($(this).val()); // grab value

			if (isNaN(value))
				value = 0; // empty cells will be stored as 0 in the array, as 0 is easy to work with as an empty value
			else
				$('table#solution tbody tr:eq('+i+') td:eq('+j+')').addClass('pre-chosen-numbers'); // special class inside the solution table for inputted values (so they stand out)

			board[i][j] = value; // assign the value in the Board array, which will be used by the solving algorithm
		});
	});
}

// fadeIn or fadeOut the loading popover
function loadingPopover(fade) {
	fade == "fadeout" ?
		$('div.white-cover, img.center').fadeOut() : // true, fadeOut
		$('div.white-cover, img.center').fadeIn()  ; // false, fadeIn
}

// fill the solution table with the values found by the algorithm
function populateSolutionTable() {
	$('table#solution tbody tr').each(function(i) {
		$(this).find('td').each(function(j) {
			if (board[i][j] != 0)
				$(this).text(board[i][j]);
		});
	});
}

// main program
function solveSudoku() {
	var beg = new Date().getTime(); // begin variable used to know how long the solving algorithm took (in ms)
	preFillBoard();

	$('#solutionContainer').fadeOut(); // hide the solution table

	if (validateAllCells(board)) { // if the board inputted is valid
		$('div.alert').fadeOut(); // hide error message (if already visible)
		loadingPopover("fadein");

		fillPossibilities(board); // fill Possibilities array + first wave of solving

		if (!solutionFound(board)) { // if no solution yet, go to second wave
			console.log("second wave");

			// loop through second wave's algorithms as long as at least one new value is found
			do {
				var count = 0; // holds the "new value" count

				findTwoDuetsInSquare();
				count += findHiddenPossibilities();
				count += onlyInRow();
				count += onlyInColumn();
			} while (count > 0);

			console.log("end second wave");

			if (!solutionFound(board)) {// if no solution yet, go to third wave (genetic algorithm)
				console.log("third wave");
				var missingPossibilities = getMissingPossibilities();
				console.log(JSON.stringify(missingPossibilities));
				$.post('/genetic', {
					possibilities: JSON.stringify(missingPossibilities),
					grid: JSON.stringify(board)
				}, function(data) {
					console.log(data);
					console.log(typeof data);
					//board = data; --> uncomment once the genetic algorithm actually works
					showAnswer(beg, "third");
				}, 'json');
			} else { // directly here if 3rd wave not necessary
				showAnswer(beg, "second");
			}
		} else {// directly here if 2nd wave not necessary
				showAnswer(beg, "first");
		}
	} else { // invalid inputted table
		console.log("invalid");
		$('div.alert').fadeIn();
		changeButtonState('disable');
	}
}

function showAnswer(beginningTime, wave) {
		var endTime = new Date().getTime();
		console.log("SOLUTION FOUND in " + wave + " wave in " + (endTime - beginningTime) + "ms!"); // show how long it took

		loadingPopover("fadeout");
		populateSolutionTable();
		$('#solutionContainer').fadeIn(); // show solution table
}

// fill the input table by pasting the clipboard
// returns a boolean representing if the paste was successful
function manipulateCopiedMatrix(text) {
	var arr = text.split(/\s+/); // build array with clipboard content, separated by whitespace
	var flag = false; // returned boolean

	// clipboard but be the same length as the sudoku table (81)
	if (arr.length == SIZE_OF_BOARD * SIZE_OF_BOARD) {
		arr.forEach(function(val, i) {
			if (val >= 1 && val <= 9) { // value must be between 1 and 9 inclusively
				var row = parseInt(i / SIZE_OF_BOARD), col = i % SIZE_OF_BOARD; // translate 1d position to 2d position

				$('table#base tbody tr:eq('+row+') td:eq('+col+') input').val(val); // put value inside input table
			}
		});

		flag = true; // valid paste
	}

	return flag;
}

// init function on DOM ready
function init() {
	// empty Board and Possibilities arrays
	board = [], possibilities = [];

	// intialize board Matrix
	for (var i = 0; i < SIZE_OF_BOARD; i++) {
		board[i] = new Array(SIZE_OF_BOARD);
		possibilities[i] = new Array(SIZE_OF_BOARD);
	}

	initializePossibilities(); // initialize Possibilities array Cube (3-D array)


	/* At start */
	// add big-border-right class to make vertical square delimitations bold
	$('table tbody tr td').each(function(index) {
		if ((index + 1) % SIZE_OF_SQUARE == 0)
			$(this).addClass('big-border-right');
	});


	/* Events */
	$('tbody input').on('keypress paste', function(e) {
		var key = e.keyCode || e.charCode;
		var ONE = 49, NINE = 57, SPACE = 32, DEL = 127;

		if (e.type === "paste") { // paste event, try to paste clipboard content in input table
			var text = e.originalEvent.clipboardData || window.clipboardData;
			text = text.getData('text');

			if (manipulateCopiedMatrix(text)) // if valid paste, enable buttons
				changeButtonState("enable");

			e.preventDefault();
		}
		else if (key >= SPACE && key < DEL ) { // keypress polyfill for firefox
			if (this.value != '' || (key < ONE || key > NINE)) // prevent typing values that are not between 1 and 9 inclusively
				e.preventDefault();
		}
	});

	$('tbody input').on('keyup mousedown', changeButtonState);

	$('button#solve').click(function() {
		if (!$(this).hasClass('pure-button-disabled')) // solve sudoku only if the "solve" button is enabled
			solveSudoku();
	});

	$('button#empty').click(function() {
		if (!$(this).hasClass('pure-button-disabled')) { // empty input/solution tables only if the "empty" button is enabled
			$('table#base tbody td input').val(''); // empty all inputs
			$('table#solution tbody td').removeClass('pre-chosen-numbers');
			$('#solutionContainer').slideUp(); // hide solution table
			changeButtonState();
		}
	});
}
