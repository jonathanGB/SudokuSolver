/* Functions */
function changeButtonState() {
	; // to be added
}

$(function() {
	/* Global variables */
	var buttonState = 'pure-button-disabled';


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

			changeButtonState();
		}
	});

	// find solution
	// store it
	// let the user play
});