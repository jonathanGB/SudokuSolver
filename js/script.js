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

$(function() {
	/* Global variables */

	/* At start */
	$('table tbody tr td').each(function(index) {
		if ((index + 1) % 3 == 0)
			$(this).addClass('big-border-right');

		if ($(this).text() != '')
			$(this).addClass('pre-chosen-numbers');
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

	// find solution
	// store it
	// let the user play
});