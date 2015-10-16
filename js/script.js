/* Functions */
// Change the button state from disabled to enabled depending on if the table is empty or not
function changeButtonState() {
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

function fillMap() {
	$('table tbody tr').each(function(i) {
		$(this).find('td input').each(function(j) {
			var value = parseInt($(this).val());

			if (isNaN(value))
				value = -1;

			board[i][j] = value;
		});
	});
}

function checkRows() {
	for (var i = 0; i < 9; i++) {
		var row = new Array(9);

		for (var j = 0; j < 9; j++) {
			var value = board[i][j];

			if (~value && ~row.indexOf(value))
				return false;
			else
				row.push(value);
		}
	}

	return true;
}

function checkColumns() {
	for (var j = 0; j < 9; j++) {
		var column = new Array(9);

		for (var i = 0; i < 9; i++) {
			var value = board[i][j];

			if (~value && ~column.indexOf(value))
				return false;
			else
				column.push(value);
		}
	}

	return true;
}

function checkSquares() {
	for (var i = 0; i < 9; i += 3) {
		for (var j = 0; j < 9; j += 3) {
			var square = new Array(9);

			for (var k = i; k < i + 3; k++) {
				for (var l = j; l < j + 3; l++) {
					var value = board[k][l];

					if (~value && ~square.indexOf(value))
						return false;
					else
						square.push(value);
				}
			}

		}
	}

	return true;
}

function validateMap() {
	return checkRows() && checkColumns() && checkSquares();
}

function buildMap() {
	fillMap();
	validateMap();
}


$(function() {
	/* Global variables */

	// create board Matrix
	board = [];
	for (var i = 0; i < 9; i++)
		board[i] = new Array(9);


	/* At start */
	$('table tbody tr td').each(function(index) {
		if ((index + 1) % 3 == 0)
			$(this).addClass('big-border-right');
	});

	/* Events */
	$('tbody input').on('keypress paste', function(e) {
		var BACKSPACE = 8, ONE = 49, NINE = 57;
		if (e.type === "paste")
			e.preventDefault();
		else {
			var key = e.keyCode || e.charCode;
			
			if (key != BACKSPACE && (this.value != '' || (key < ONE || key > NINE)))
				e.preventDefault();
		}
	});

	$('tbody input').on('keyup', changeButtonState);

	$('#buttonSolve button').click(function() {
		if (!$(this).hasClass('pure-button-disabled')) {
			buildMap();
		}
	});

	// find solution
	// store it
	// let the user play
});