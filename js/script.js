$(function() {
	$('table tbody tr td').each(function(index) {
		if ((index + 1) % 3 == 0)
			$(this).addClass('big-border-right');

		if ($(this).text() != '')
			$(this).addClass('pre-chosen-numbers');
	});

	// find solution
	// store it
	// let the user play
});