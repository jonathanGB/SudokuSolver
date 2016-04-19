/* Modifications to the Prototype */

// as found on StackOverflow
// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});



/* Functions */

// checks if a row "i" in array "arr" is valid (a valid number must not be there more than once)
function checkRow(i, arr) {
	var row = []; // holds the valid values in row "i"

	for (var j = 0; j < SIZE_OF_BOARD; j++) {
		var value = arr[i][j];

		// if valid value and not already there in "row"
		if (value && ~row.indexOf(value))
			return false;
		else
			row.push(value); // new valid value, add to "row"
	}

	return true;
}

// checks if all rows in array "arr" are valid
function checkAllRows(arr) {
	for (var i = 0; i < SIZE_OF_BOARD; i++) {
		if (!checkRow(i, arr)) // if row "i" is invalid
			return false;
	}

	return true;
}

// checks if column "j" in array "arr" is valid (a valid number must not be there more than once)
function checkColumn(j, arr) {
	var column = []; // holds the valid values in column "j"

	for (var i = 0; i < SIZE_OF_BOARD; i++) {
		var value = arr[i][j];

		// if valid value and not already there in "column"
		if (value && ~column.indexOf(value))
			return false;
		else
			column.push(value); // new valid value, add to "column"
	}

	return true;
}

// checks if all columns in array "arr" are valid
function checkAllColumns(arr) {
	for (var j = 0; j < SIZE_OF_BOARD; j++) {
		if (!checkColumn(j, arr))
			return false;
	}

	return true;
}

// checks if square "i, j" in array "arr" is valid (a valid number must not be there more than once)
// (i,j) is the coordinate of the top-left corner of the square
function checkSquare(i, j, arr) {
	var square = []; // holds the valid values in square "i, j"

	for (var k = i; k < i + SIZE_OF_SQUARE; k++) {
		for (var l = j; l < j + SIZE_OF_SQUARE; l++) {
			var value = arr[k][l];

			// if valid value and not already there in "square"
			if (value && ~square.indexOf(value))
				return false;
			else
				square.push(value); // new valid value, add to "square"
		}
	}

	return true;
}

// checks if all squares in array "arr" are valid
function checkAllSquares(arr) {
	// the following two nested for loops traverse every top-left cell of every squares in the sudoku
	for (var i = 0; i < SIZE_OF_BOARD; i += SIZE_OF_SQUARE) {
		for (var j = 0; j < SIZE_OF_BOARD; j += SIZE_OF_SQUARE) {
			if (!checkSquare(i, j, arr))
				return false;
		}
	}

	return true;
}

// validates a cell by row, column, and square ; all three must be true for a cell to be valid
function validateCell(i, j, arr) {
	var iSquare = rowOfSquare(i), jSquare = columnOfSquare(j);

	return checkRow(i, arr) && checkColumn(j, arr) && checkSquare(iSquare, jSquare, arr);
}

// validates every cell in array "arr" by row, column and square ; all three must be true for cells to be valid
function validateAllCells(arr) {
	return checkAllRows(arr) && checkAllColumns(arr) && checkAllSquares(arr);
}

// initialize the Possibilities matrix with empty arrays as values (making it a 3-D array)
// every position in a sudoku grid has an array of possible values, which Possibilities keeps track of
function initializePossibilities() {
	for (var i = 0; i < SIZE_OF_BOARD; i++) {
		for (var j = 0; j < SIZE_OF_BOARD; j++) {
			possibilities[i][j] = [];
		}
	}
}

// checks if array "arr" is filled with non-zero values, therefore if a solution is found or not
function solutionFound(arr) {
	for (var i = 0; i < SIZE_OF_BOARD; i++) {
		for (var j = 0; j < SIZE_OF_BOARD; j++) {
			if (!arr[i][j])
				return false;
		}
	}

	return true;
}

// fill the Possibilities array
function fillPossibilities(arr) {
	var restart;

	do {
		restart = false;

		initializePossibilities(); // initialize the Possibilities arrays

		// loop through the whole grid
		for (var i = 0; i < SIZE_OF_BOARD; i++) {
			for (var j = 0; j < SIZE_OF_BOARD; j++) {
				var value = arr[i][j];

				// if value is falsey (0)
				if (!value) {
					// loop through all possible values (1 to 9)
					for (var k = 1; k <= SIZE_OF_BOARD; k++) {
						arr[i][j] = k; // test value in array

						// if k is valid, add to the possibilities of that cell
						if (validateCell(i, j, arr))
							possibilities[i][j].push(k);
					}

					// if the current empty cell has only one possibility, the only possible value is the right one
					if (possibilities[i][j].length == 1) {
						arr[i][j] = possibilities[i][j][0];
						possibilities[i][j] = [];
						restart = true; // restart the loop, as other empty cells can be affected by this change
						break;
					} else
						arr[i][j] = 0; // we're not 100% sure, put the cell back to its unsolved state
				}
			}

			if (restart)
				break;
		}
	} while (restart);

	console.log("finished first wave");
}

// to do
function findHiddenPossibilities() {
	var loop = 0, count = 0;
	do {
		for (var i = 0; i < SIZE_OF_BOARD; i += SIZE_OF_SQUARE) {
			for (var j = 0; j < SIZE_OF_BOARD; j += SIZE_OF_SQUARE) {
				for (var val = 1; val <= SIZE_OF_BOARD; val++) {
					var possibleCells = 0, firstRow = -1, firstColumn = -1;
					var oneLine = true, oneColumn = true, flag = false;

					for (var k = i; k < i + SIZE_OF_SQUARE; k++) {
						for (var l = j; l < j + SIZE_OF_SQUARE; l++) {
							if (board[k][l] == val) {
								flag = true;
								break;
							}

							if (possibilities[k][l].length == 1) {
								board[k][l] = possibilities[k][l][0];
								updatePossibilities(k, l, possibilities[k][l][0], true, true, true);
								possibilities[k][l] = [];
								count++;
								loop = 0;
                flag = true;
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

									if (!oneLine && !oneColumn) {
										flag = true;
										break;
									}
								}
							}
						}

						if (flag)
							break;
					}

					if (!flag) {
						if (possibleCells == 1) {
							console.log("possible 1", firstRow, firstColumn);
							board[firstRow][firstColumn] = val;
							possibilities[firstRow][firstColumn] = [];
							updatePossibilities(firstRow, firstColumn, val, true, true, true);
							count++;
							loop = 0;
						}

						if (possibleCells > 1) {
							console.log("possible > 1", firstRow, firstColumn);
							oneLine ?
								updatePossibilities(firstRow, firstColumn, val, true, false, false) :
								updatePossibilities(firstRow, firstColumn, val, false, true, false);
						}
					}
				}
			}
		}
	} while (++loop < 2);

	console.log("end hidden possibilities");

	return count;
}

// removes possibilities containing "val" in row "row", column "column" and square "row, column" depending on the updateX flags
// squareException is optional... tells if we ignore a row or column in updateSquare, or a specific location [i, j] via an array
function updatePossibilities(row, column, val, updateRow, updateColumn, updateSquare, squareException) {
	var iSquare = rowOfSquare(row), jSquare = columnOfSquare(column);

	if (updateRow) {
		for (var j = 0; j < SIZE_OF_BOARD; j++) {
			if (columnOfSquare(j) != jSquare) {
				var index = possibilities[row][j].indexOf(val);

				if (~index)
					possibilities[row][j].splice(index, 1);
			}
		}
	}

	if (updateColumn) {
		for (var i = 0; i < SIZE_OF_BOARD; i++) {
			if (rowOfSquare(i) != iSquare || columnOfSquare(column) != jSquare) {
				var index = possibilities[i][column].indexOf(val);

				if (~index)
					possibilities[i][column].splice(index, 1);
			}
		}
	}

	if (updateSquare) {
		var ignoreRow = -1, ignoreColumn = -1;

		switch (squareException) {
			case 'row': ignoreRow = row; break;
			case 'column': ignoreColumn = column; break;
		}

		for (var i = iSquare; i < iSquare + SIZE_OF_SQUARE; i++) {
			if (i == ignoreRow) continue;

			for (var j = jSquare; j < jSquare + SIZE_OF_SQUARE; j++) {
				if (j == ignoreColumn || Array.isArray(squareException) && squareException[0] == i && squareException[1] == j) continue;

				var index = possibilities[i][j].indexOf(val);

				if (~index)
					possibilities[i][j].splice(index, 1);
			}
		}
	}
}

// returns the row of the square containing "i"
function rowOfSquare(i) {
	return parseInt(i / SIZE_OF_SQUARE) * SIZE_OF_SQUARE;
}

// returns the column of the square containing "j"
function columnOfSquare(j) {
	return parseInt(j / SIZE_OF_SQUARE) * SIZE_OF_SQUARE
}

function onlyInRow() {
	var count = 0, loop = 0;
	console.log("only in row");
	do {
		for (var i = 0; i < SIZE_OF_BOARD; i++) {
			for (var val = 1; val <= SIZE_OF_BOARD; val++) {
				var index = -1, ctr = 0;

				for (var j = 0; j < SIZE_OF_BOARD; j++) {
					if (!board[i][j] && ~possibilities[i][j].indexOf(val)) {
						if (index == -1)
							index = j;
						else if (columnOfSquare(j) != columnOfSquare(index))
							break;

						ctr++;
					}

					if (board[i][j] == val)
						break;

					if (j == SIZE_OF_BOARD - 1) {
						if (ctr == 1) {
							board[i][index] = val;
							possibilities[i][index] = [];
							updatePossibilities(i, index, val, false, true, true);
							count++;
							loop = 0;
						} else if (ctr > 1) {
							var j1 = columnOfSquare(index);

							//removeOtherOccasions(val, val, i, j1, i, j1 + 1, i, j1 + 2, val);
							updatePossibilities(i, index, val, false, false, true, 'row');
						}
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
		for (var i = 0; i < SIZE_OF_BOARD; i++) {
			for (var val = 1; val <= SIZE_OF_BOARD; val++) {
				var index = -1, ctr = 0;

				for (var j = 0; j < SIZE_OF_BOARD; j++) {
					if (board[j][i] != val && ~possibilities[j][i].indexOf(val)) {
						if (index == -1)
							index = j;
						else if (rowOfSquare(j) != rowOfSquare(index))
							break;

						ctr++;
					}

					if (board[j][i] == val)
						break;

					if (j == SIZE_OF_BOARD - 1) {
						if (ctr == 1) {
							board[index][i] = val;
							possibilities[index][i] = [];
							updatePossibilities(index, i, val, true, false, true);
							count++;
							loop = 0;
						} else if (ctr > 1) {
							var j1 = rowOfSquare(index);

							//removeOtherOccasions(val, val, j1, i, j1 + 1, i, j1 + 2, i, val);
							updatePossibilities(index, i, val, false, false, true, 'column');
						}
					}
				}
			}
		}
	} while (++loop < 2);

	return count;
}

function findTwoDuetsInSquare() {
	for (var i = 0; i < SIZE_OF_BOARD; i += SIZE_OF_SQUARE) {
		for (var j = 0; j < SIZE_OF_BOARD; j += SIZE_OF_SQUARE) {
			for (var k = i; k < i + SIZE_OF_SQUARE; k++) {
				for (var l = j; l < j + SIZE_OF_SQUARE; l++) {
					var arr;

					if (possibilities[k][l].length == 2) {
						arr = possibilities[k][l];

						for (var m = k; m < i + SIZE_OF_SQUARE; m++) {
							for (var n = l; n < j + SIZE_OF_SQUARE; n++) {
								if (m == k && n == l) continue;

								if (arr.equals(possibilities[m][n])) {
									var val1 = arr[0], val2 = arr[1];

									console.log("duet found");
									removeOtherOccasions(val1, val2, k, l, m, n);
								}
							}
						}
					}
				}
			}
		}
	}
}

function removeOtherOccasions(val1, val2, i1, j1, i2, j2, i3, j3, val3) {
	var iSquare = rowOfSquare(i1), jSquare = columnOfSquare(j1);

	if (i3 === undefined)
		i3 = j3 = val3 = -1;

	for (var i = iSquare; i < iSquare + SIZE_OF_SQUARE; i++) {
		for (var j = jSquare; j < jSquare + SIZE_OF_SQUARE; j++) {
			if ((i != i1 || j != j1) && (i != i2 || j != j2) && (i != i3 || j != j3)) {
				var index1 = possibilities[i][j].indexOf(val1);
				if (~index1)
					possibilities[i][j].splice(index1, 1);

				var index2 = possibilities[i][j].indexOf(val2);
				if (~index2)
					possibilities[i][j].splice(index2, 1);

				var index3 = possibilities[i][j].indexOf(val3);
				if (~index3)
					possibilities[i][j].splice(index3, 1);
			}
		}
	}
}

function getMissingPossibilities() {
  var obj = {};

  for (var i = 0; i < SIZE_OF_BOARD; i++) {
    for (var j = 0; j < SIZE_OF_BOARD; j++) {
      if (possibilities[i][j].length)
        obj[(i * SIZE_OF_BOARD) + j] = possibilities[i][j];
    }
  }

  return obj;
}
