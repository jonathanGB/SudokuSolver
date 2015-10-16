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

function popover(fade) {
	if (fade == "fadeout")
		$('div.white-cover, img.center').fadeOut();
	else
		$('div.white-cover, img.center').fadeIn();
}

function validateMap() {
	return checkRows() && checkColumns() && checkSquares();
}

function buildMap() {
	fillMap();

	$('#solutionContainer').fadeOut();

	if (validateMap()) {
		$('div.alert').fadeOut();
		// popover("fadein")
		// generate solution
		// popover("fadeout")
		// populate solution table
		// show solution table

	} else {
		$('div.alert').fadeIn();
		changeButtonState('disable');
	}

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