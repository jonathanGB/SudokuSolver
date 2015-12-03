/* FUNCTIONS */

// Change the button state from disabled to enabled depending on if the table is empty or not
function changeButtonState(state) {
	if (state == "disable") {
		$('button#solve').addClass('pure-button-disabled');
	} else if (state == "enable") {
		$('#buttonSolve button').removeClass('pure-button-disabled');
	} else {
		var flag = true;

		$('table tbody td input').each(function() {
			if ($(this).val() != '') {
				$('#buttonSolve button').removeClass('pure-button-disabled');
				flag = false;

				return false; // break from loop
			}
		});

		if (flag) // flag not toggled, the entire table is empty
			$('#buttonSolve button').addClass('pure-button-disabled');
	}
}

function fillMap() {
	$('table tbody tr').each(function(i) {
		$(this).find('td input').each(function(j) {
			var value = parseInt($(this).val());

			if (isNaN(value))
				value = 0;
			else
				$('table#solution tbody tr:eq('+i+') td:eq('+j+')').addClass('pre-chosen-numbers');

			board[i][j] = value;
		});
	});
}

function popover(fade) {
	if (fade == "fadeout")
		$('div.white-cover, img.center').fadeOut();
	else
		$('div.white-cover, img.center').fadeIn();
}

function populateSolutionTable() {
	$('table#solution tbody tr').each(function(i) {
		$(this).find('td').each(function(j) {
			$(this).text(board[i][j]);
		});
	});
}

function solveSudoku() {
	var beg = new Date().getTime(), end;
	fillMap();

	$('#solutionContainer').fadeOut();

	if (validateAllCells(board)) {
		console.log("valid");
		$('div.alert').fadeOut();
		popover("fadein")

		fillPossibilities(board);

		if (!solutionFound(board)) {
			console.log("more complex stuff");
			
			do {
				var count = 0;

				//findTwoDuetsInSquare();
				//count += findHiddenPossibilities();
				count += onlyInRow();
				count += onlyInColumn();
			} while (count > 0);

			if (!solutionFound(board)) {// brute force, genetic algorithm?
				console.log("we haven't found it yet");
			} 
				// do {
				// 	var possibleSolution = solveMissingCells();
				// } while (!checkAllColumns(possibleSolution) || !checkAllSquares(possibleSolution));
		}

		end = new Date().getTime();
		console.log("SOLUTION FOUND in " + (end - beg) + "ms!");
		popover("fadeout")
		populateSolutionTable();
		$('#solutionContainer').fadeIn();

	} else {
		console.log("invalid");
		$('div.alert').fadeIn();
		changeButtonState('disable');
	}

}

function manipulateCopiedMatrix(text) {
	var arr = text.split(/\s+/);
	var flag = false;

	if (arr.length == 9 * 9) {
		arr.forEach(function(val, i) {
			if (val != 0) {
				var row = parseInt(i / 9), col = i % 9;
				flag = true;

				$('table#base tbody tr:eq('+row+') td:eq('+col+') input').val(val);
			}
		});
	}

	return flag; 
}

function callSolverFunction(callback) {
	if (typeof callback === 'function')
		callback();
}

function init() {
	/* Global variables */

	// create board Matrix and possibilites Cube
	board = [], possibilities = [];
	for (var i = 0; i < 9; i++) {
		board[i] = new Array(9);
		possibilities[i] = new Array(9);
	}
	
	initializePossibilities();


	/* At start */
	$('table tbody tr td').each(function(index) {
		if ((index + 1) % 3 == 0)
			$(this).addClass('big-border-right');
	});


	/* Events */
	$('tbody input').on('keypress paste', function(e) {
		var key = e.keyCode || e.charCode;
		var ONE = 49, NINE = 57, SPACE = 32, DEL = 127;

		if (e.type === "paste") {
			var text = e.originalEvent.clipboardData || window.clipboardData;
			text = text.getData('text');

			if (manipulateCopiedMatrix(text))
				changeButtonState("enable");

			e.preventDefault();
		}
		else if (key >= SPACE && key < DEL ) { // keypress polyfill for firefox
			if (this.value != '' || (key < ONE || key > NINE)) {
				e.preventDefault();
			}
		}
	});

	$('tbody input').on('keyup mousedown', changeButtonState);

	$('button#solve').click(function() {
		if (!$(this).hasClass('pure-button-disabled'))
			solveSudoku();
	});

	$('button#remove').click(function() {
		if (!$(this).hasClass('pure-button-disabled')) {
			$('table#base tbody td input').val('');
			$('table#solution tbody td').removeClass('pre-chosen-numbers');
			$('#solutionContainer').slideUp();
			changeButtonState();
		}
	});
}