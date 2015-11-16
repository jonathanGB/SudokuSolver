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
				value = 0;
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

		if (value && ~row.indexOf(value))
			return false;
		else
			row.push(value);
	}

	return true;
}

function checkAllRows(arr) {
	for (var i = 0; i < 9; i++) {
		if (!checkRow(i, arr)) 
			return false;
	}

	return true;
}

function checkColumn(j, arr) {
	var column = new Array(9);

	for (var i = 0; i < 9; i++) {
		var value = arr[i][j];

		if (value && ~column.indexOf(value))
			return false;
		else
			column.push(value);
	}

	return true;
}

function checkAllColumns(arr) {
	for (var j = 0; j < 9; j++) {
		if (!checkColumn(j, arr))
			return false;
	}

	return true;
}

function checkSquare(i, j, arr) {
	var square = new Array(9);

	for (var k = i; k < i + 3; k++) {
		for (var l = j; l < j + 3; l++) {
			var value = arr[k][l];

			if (value && ~square.indexOf(value))
				return false;
			else
				square.push(value);
		}
	}

	return true;
}

function checkAllSquares(arr) {
	for (var i = 0; i < 9; i += 3) {
		for (var j = 0; j < 9; j += 3) {
			if (!checkSquare(i, j, arr))
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
	var iSquare = rowOfSquare(i), jSquare = columnOfSquare(j);

	return checkRow(i, arr) && checkColumn(j, arr) && checkSquare(iSquare, jSquare, arr);
}

function validateAllCells(arr) {
	return checkAllRows(arr) && checkAllColumns(arr) && checkAllSquares(arr);
}

function initializePossibilities() {
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			possibilities[i][j] = [];
		}
	}
}

function solutionFound(arr) {
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			if (!arr[i][j])
				return false;
		}
	}

	return true;
}

function fillPossibilities(arr) {
	var restart;

	do {
		restart = false;

		initializePossibilities();

		for (var i = 0; i < 9; i++) {
			for (var j = 0; j < 9; j++) {
				var value = arr[i][j];

				if (!value) {
					for (var k = 1; k <= 9; k++) {
						arr[i][j] = k;

						if (validateCell(i, j, arr))
							possibilities[i][j].push(k);
					}

					if (possibilities[i][j].length == 1) {
						arr[i][j] = possibilities[i][j][0];
						possibilities[i][j] = [];
						restart = true;
						break;
					} else
						arr[i][j] = 0;
				}
			}

			if (restart)
				break;
		}
	} while (restart);

	console.log("finished first wave");
}

function findHiddenPossibilities() {
	var loop = 0, count = 0;

	do {
		for (var i = 0; i < 9; i += 3) {
			for (var j = 0; j < 9; j += 3) {
				for (var val = 1; val <= 9; val++) {
					var possibleCells = 0, firstRow = -1, firstColumn = -1;
					var oneLine = true, oneColumn = true, flag = false;

					for (var k = i; k < i + 3; k++) {
						for (var l = j; l < j + 3; l++) {
							if (board[k][l] == val) {
								flag = true;
								break;
							}

							if (possibilities[k][l].length == 1) {
								board[k][l] = possibilities[k][l][0];
								possibilities[k][l] = [];
								break;
							}

							if (!board[k][l] && ~possibilities[k][l].indexOf(val)) {
								if (++possibleCells == 1) {
									firstRow = k;
									firstColumn = l;
								} else {
									if (firstRow != k)
										oneLine = false;
									if (firstColumn != l)
										oneColumn = false;
								}
							}
						}

						if (flag)
							break;
					}

					if (!flag) {
						if (possibleCells == 1) {
							console.log("possible 1");
							board[firstRow][firstColumn] = val;
							possibilities[firstRow][firstColumn] = [];
							updatePossibilitiesTable(firstRow, firstColumn, val, true, true);
							count++;
							loop = 0;
						}

						if (possibleCells > 1 && (oneLine || oneColumn)) {
							console.log("possible > 1");
							oneLine ? 
								updatePossibilitiesTable(firstRow, firstColumn, val, true, false) :
								updatePossibilitiesTable(firstRow, firstColumn, val, false, true);
						}
					}
				}
			}
		}
	} while (++loop < 2);

	console.log("Finished second wave");

	return count;
}

function updatePossibilitiesTable(row, column, val, updateRow, updateColumn) {
	var iSquare = rowOfSquare(row), jSquare = columnOfSquare(column);

	if (updateRow) {
		for (var j = 0; j < 9; j++) {
			if (rowOfSquare(row) != iSquare && columnOfSquare(j) != jSquare) {
				var index = possibilities[row][j].indexOf(val);

				if (~index)
					possibilities[row][j].splice(index, 1);
			}
		}
	}

	if (updateColumn) {
		for (var i = 0; i < 9; i++) {
			if (rowOfSquare(i) != iSquare && columnOfSquare(column) != jSquare) {
				var index = possibilities[i][column].indexOf(val);

				if (~index)
					possibilities[i][column].splice(index, 1);
			}
		}
	}
}

function rowOfSquare(i) {
	return parseInt(i / 3) * 3;
}

function columnOfSquare(j) {
	return parseInt(j / 3) * 3
}

function onlyInRow() {
	var count = 0, loop = 0;
	console.log("only in row");
	do {
		for (var i = 0; i < 9; i++) {
			for (var val = 1; val <= 9; val++) {
				if (i == 1 && val == 8) debugger;
				var index = -1;

				for (var j = 0; j < 9; j++) {
					if (index == -1 && ~possibilities[i][j].indexOf(val))
						index = j;
					else if (~index && ~possibilities[i][j].indexOf(val) || board[i][j] == val)
						break;

					if (~index && j == 9 - 1) {
						board[i][index] = val;
						possibilities[i][index] = [];
						updatePossibilitiesTable(i, index, val, true, true);
						count++;
						loop = 0;
					}
				}
			}
		}
	} while (++loop < 2);

	return count;
}

function onlyInColumn() {
	var count = 0, loop = 0;
	console.log("only in column");
	do {
		for (var i = 0; i < 9; i++) {
			for (var val = 1; val <= 9; val++) {
				var index = -1;

				for (var j = 0; j < 9; j++) {
					if (index == -1 && ~possibilities[j][i].indexOf(val))
						index = j;
					else if (~index && ~possibilities[j][i].indexOf(val) || board[j][i] == val)
						break;

					if (~index && j == 9 - 1) {
						board[index][i] = val;
						possibilities[index][i] = [];
						updatePossibilitiesTable(index, i, val, true, true);
						count++;
						loop = 0;
					}
				}
			}
		}
	} while (++loop < 2);

	return count;
}

/* Needs to be reworked (with solveMissingCells) */
function deriveAvailableNumbers(i) {

}

function solveMissingCells() {
	
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
				count += onlyInRow();
				count += onlyInColumn();
				count += findHiddenPossibilities();
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
			solveSudoku();
	});

	$('button#remove').click(function() {
		if (!$(this).hasClass('pure-button-disabled')) {
			$('table#base tbody td input').val('');
			$('table#solution tbody td').removeClass('pre-chosen-numbers');
			$('#solutionContainer').fadeOut();
			changeButtonState();
		}
	});
});