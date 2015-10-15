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
			var value;

			if ($(this).val() == '')
				value = -1;
			else
				value = parseInt($(this).val())

			board[i][j] = value;
		});
	});
}

function checkRow(value, index) {
	;
}

function validateMap() {
	$('table tbody td input').each(function(index) {
		var valueOfCell = $(this).val();

		if (valueOfCell != '') {
			var col = index % 9;
			var row = index / 9;

			checkRow(valueOfCell, row);
		}
	});
}

function buildMap() {
	fillMap();
	//validateMap();
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