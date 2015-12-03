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
								updatePossibilitiesTable(k, l, possibilities[k][l][0], true, true, true);
								possibilities[k][l] = [];
								count++;
								loop = 0;
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

									if (!firstRow && !firstColumn) {
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
							console.log("possible 1");
							board[firstRow][firstColumn] = val;
							possibilities[firstRow][firstColumn] = [];
							updatePossibilitiesTable(firstRow, firstColumn, val, true, true, true);
							count++;
							loop = 0;
						}

						if (possibleCells > 1) {
							console.log("possible > 1");
							oneLine ? 
								updatePossibilitiesTable(firstRow, firstColumn, val, true, false, false) :
								updatePossibilitiesTable(firstRow, firstColumn, val, false, true, false);
						}
					}
				}
			}
		}
	} while (++loop < 2);

	console.log("Finished second wave");

	return count;
}

function updatePossibilitiesTable(row, column, val, updateRow, updateColumn, updateSquare) {
	var iSquare = rowOfSquare(row), jSquare = columnOfSquare(column);

	if (updateRow) {
		for (var j = 0; j < 9; j++) {
			if (rowOfSquare(row) != iSquare || columnOfSquare(j) != jSquare) {
				var index = possibilities[row][j].indexOf(val);

				if (~index)
					possibilities[row][j].splice(index, 1);
			}
		}
	}

	if (updateColumn) {
		for (var i = 0; i < 9; i++) {
			if (rowOfSquare(i) != iSquare || columnOfSquare(column) != jSquare) {
				var index = possibilities[i][column].indexOf(val);

				if (~index)
					possibilities[i][column].splice(index, 1);
			}
		}
	}

	if (updateSquare) {
		for (var i = iSquare; i < iSquare + 3; i++) {
			for (var j = jSquare; j < jSquare + 3; j++) {
				var index = possibilities[i][j].indexOf(val);

				if (~index)
					possibilities[i][j].splice(index, 1);
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
				var index = -1, ctr = 0;

				for (var j = 0; j < 9; j++) {
					if (board[i][j] != val && ~possibilities[i][j].indexOf(val)) {
						if (index == -1)
							index = j;	
						else if (columnOfSquare(j) != columnOfSquare(index))
							break;

						ctr++;
					}

					if (board[i][j] == val)
						break;

					if (j == 9 - 1) {
						if (ctr == 1) {
							board[i][index] = val;
							possibilities[i][index] = [];
							updatePossibilitiesTable(i, index, val, false, true, true);
							count++;
							loop = 0;
						} else if (ctr > 1) {
							var j1 = columnOfSquare(index);

							removeOtherOccasions(val, val, i, j1, i, j1 + 1, i, j1 + 2, val);
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
		for (var i = 0; i < 9; i++) {
			for (var val = 1; val <= 9; val++) {
				var index = -1, ctr = 0;

				for (var j = 0; j < 9; j++) {
					if (board[j][i] != val && ~possibilities[j][i].indexOf(val)) {
						if (index == -1)
							index = j;
						else if (rowOfSquare(j) != rowOfSquare(index))
							break;

						ctr++;
					} 

					if (board[j][i] == val)
						break;

					if (j == 9 - 1) {
						if (ctr == 1) {
							board[index][i] = val;
							possibilities[index][i] = [];
							updatePossibilitiesTable(index, i, val, true, false, true);
							count++;
							loop = 0;
						} else if (ctr > 1) {
							var j1 = rowOfSquare(index);

							removeOtherOccasions(val, val, j1, i, j1 + 1, i, j1 + 2, i, val);
						}
					}
				}
			}
		}
	} while (++loop < 2);

	return count;
}

function findTwoDuetsInSquare() {
	for (var i = 0; i < 9; i += 3) {
		for (var j = 0; j < 9; j += 3) {
			for (var k = i; k < i + 3; k++) {
				for (var l = j; l < j + 3; l++) {
					var arr;

					if (possibilities[k][l].length == 2) {
						arr = possibilities[k][l];

						for (var m = k; m < i + 3; m++) {
							for (var n = l; n < j + 3; n++) {
								if ((m != k || n != l) && arr.equals(possibilities[m][n])) {
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

	if (i3 === undefined || j3 === undefined || val3 === undefined)
		i3 = j3 = val3 = -1;

	for (var i = iSquare; i < iSquare + 3; i++) {
		for (var j = jSquare; j < jSquare + 3; j++) {
			if ((i != i1 || j != j1) && (i != i2 || j != j2) && (i != i3 || j != j3)) {
				var index1 = possibilities[i][j].indexOf(val1);
				var index2 = possibilities[i][j].indexOf(val2);
				var index3 = possibilities[i][j].indexOf(val3);

				if (~index1)
					possibilities[i][j].splice(index1, 1);

				if (~index2)
					possibilities[i][j].splice(index2, 1);

				if (~index3)
					possibilities[i][j].splice(index3, 1);
			}
		}
	}
}