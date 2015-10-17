/* Functions */

// Change the button state from disabled to enabled depending on if the table is empty or not
function changeButtonState(state) {
	if (state == "disable") {
		$('#buttonSolve button').addClass('pure-button-disabled');
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
				value = -1;
			else
				$('table#solution tbody tr:eq('+i+') td:eq('+j+')').addClass('pre-chosen-numbers');

			board[i][j] = value;
		});
	});
}

function checkRow(i, arr) {
	var row = new Array(9);

	for (var j = 0; j < 9; j++) {
		var value = arr[i][j];

		if (~value && ~row.indexOf(value))
			return false;
		else
			row.push(value);
	}

	return true;
}

function checkAllRows() {
	for (var i = 0; i < 9; i++) {
		if (!checkRow(i, board)) 
			return false;
	}

	return true;
}

function checkColumn(j, arr) {
	var column = new Array(9);

	for (var i = 0; i < 9; i++) {
		var value = arr[i][j];

		if (~value && ~column.indexOf(value))
			return false;
		else
			column.push(value);
	}

	return true;
}

function checkAllColumns() {
	for (var j = 0; j < 9; j++) {
		if (!checkColumn(j, board))
			return false;
	}

	return true;
}

function checkSquare(i, j, arr) {
	var square = new Array(9);

	for (var k = i; k < i + 3; k++) {
		for (var l = j; l < j + 3; l++) {
			var value = arr[k][l];

			if (~value && ~square.indexOf(value))
				return false;
			else
				square.push(value);
		}
	}

	return true;
}

function checkAllSquares() {
	for (var i = 0; i < 9; i += 3) {
		for (var j = 0; j < 9; j += 3) {
			if (!checkSquare(i, j, board))
				return false;
		}
	}

	return true;
}

function popover(fade) {
	if (fade == "fadeout")
		$('div.white-cover, img.center').fadeOut();
	else
		$('div.white-cover, img.center').fadeIn();
}

function validateCell(i, j, arr) {
	var iSquare = parseInt(i / 3) * 3, jSquare = parseInt(j / 3) * 3;

	return checkRow(i, arr) && checkColumn(j, arr) && checkSquare(iSquare, jSquare, arr);
}

function validateAllCells() {
	return checkAllRows() && checkAllColumns() && checkAllSquares();
}

function initializePossibilities() {
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			possibilities[i][j] = [];
		}
	}
}

function solutionFound() {
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			if (board[i][j] == -1)
				return false;
		}
	}

	return true;
}

function fillPossibilities() {
	var restart;

	do {
		restart = false;

		initializePossibilities();

		for (var i = 0; i < 9; i++) {
			for (var j = 0; j < 9; j++) {
				var value = board[i][j];

				if (value == -1) {
					for (var k = 1; k <= 9; k++) {
						board[i][j] = k;

						if (validateCell(i, j, board))
							possibilities[i][j].push(k);
					}

					if (possibilities[i][j].length == 1) {
						board[i][j] = possibilities[i][j][0];
						restart = true;
						break;
					} else
						board[i][j] = -1;
				}
			}

			if (restart)
				break;
		}
	} while (restart);

	return solutionFound();
	
	console.log("finished first wave");
}

function populateSolutionTable() {
	$('table#solution tbody tr').each(function(i) {
		$(this).find('td').each(function(j) {
			$(this).text(board[i][j]);
		});
	});
}

function buildMap() {
	// start millis count
	fillMap();

	$('#solutionContainer').fadeOut();

	if (validateAllCells()) {
		console.log("valid");
		$('div.alert').fadeOut();
		popover("fadein")

		if (fillPossibilities()) {
			// end millis count
			console.log("SOLUTION FOUND!");
			popover("fadeout")
			populateSolutionTable();
			$('#solutionContainer').fadeIn();
		} else {
			// find missing cells
			// end millis count
			// popover("fadeout")
			// populate solution table
			// show solution table
		}

	} else {
		console.log("invalid");
		$('div.alert').fadeIn();
		changeButtonState('disable');
	}

}


$(function() {
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
		var ONE = 49, NINE = 57;
		if (e.type === "paste")
			e.preventDefault();
		else {
			var key = e.keyCode || e.charCode;
			
			if (this.value != '' || (key < ONE || key > NINE))
				e.preventDefault();
		}
	});

	$('tbody input').on('keyup click', changeButtonState);

	$('button#solve').click(function() {
		if (!$(this).hasClass('pure-button-disabled'))
			buildMap();
	});

	$('button#remove').click(function() {
		if (!$(this).hasClass('pure-button-disabled')) {
			$('table#base tbody td input').val('');
			changeButtonState();
		}
	});
});