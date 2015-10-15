$(function() {
	$('table tbody tr td').each(function(index) {
		if ((index + 1) % 3 == 0)
			$(this).addClass('big-border-right');

		if ($(this).text() != '')
			$(this).addClass('pre-chosen-numbers');
	});

	$('tbody input').on('keydown paste', function(e) {
		var BACKSPACE = 8, ZERO = 48, NINE = 57;
		if (e.type === "paste")
			e.preventDefault();
		else {
			var key = e.keyCode || e.charCode;
			
			if (this.value != '' && key != BACKSPACE && (key < ZERO || key > NINE))
				e.preventDefault();
		}
	});

	// find solution
	// store it
	// let the user play
});