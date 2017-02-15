package main

import (
  "fmt"
  "testing"
)


func TestInRow(t *testing.T) {
  board1 := [9][9]int8{{8, 6, 9, 1, 4, 2, 4, 3, 5}, {4, 2, 1, 9, 3, 5, 6, 7, 8}, {4, 3, 5, 8, 6, 7, 2, 1 ,9}, {6, 1, 8, 7, 2, 9, 3, 5, 4}, {7, 3, 2, 4, 8, 3, 9, 6, 1}, {3, 9, 4, 5, 1, 6, 7, 8, 2}, {2, 4, 6, 3, 5, 1, 8, 7, 7}, {5, 8, 9, 6, 1, 4, 1, 2, 3}, {1, 9, 3, 2, 7, 9, 5, 4, 6}}
  var count int8 = 0
  var i int8

  for i = 0; i < BOARD_SIZE; i++ {
    count += inRow(&board1, i)
  }

  fmt.Printf("%d in Row\n", count)

  if (count != 5) {
    t.Error(
      "For board1 expected", 5,
      "got", count,
    )
  }
}

func TestInCol(t *testing.T) {
  board1 := [9][9]int8{{8, 6, 9, 1, 4, 2, 4, 3, 5}, {4, 2, 1, 9, 3, 5, 6, 7, 8}, {4, 3, 5, 8, 6, 7, 2, 1 ,9}, {6, 1, 8, 7, 2, 9, 3, 5, 4}, {7, 3, 2, 4, 8, 3, 9, 6, 1}, {3, 9, 4, 5, 1, 6, 7, 8, 2}, {2, 4, 6, 3, 5, 1, 8, 7, 7}, {5, 8, 9, 6, 1, 4, 1, 2, 3}, {1, 9, 3, 2, 7, 9, 5, 4, 6}}
  var count int8 = 0

  var j int8
  for j = 0; j < BOARD_SIZE; j++ {
    count += inCol(&board1, j)
  }

  fmt.Printf("%d in Col\n", count)

  if (count != 7) {
    t.Error(
      "For board1 expected", 7,
      "got", count,
    )
  }
}

func TestInSqu(t *testing.T) {
  board1 := [9][9]int8{{8, 6, 9, 1, 4, 2, 4, 3, 5}, {4, 2, 1, 9, 3, 5, 6, 7, 8}, {4, 3, 5, 8, 6, 7, 2, 1 ,9}, {6, 1, 8, 7, 2, 9, 3, 5, 4}, {7, 3, 2, 4, 8, 3, 9, 6, 1}, {3, 9, 4, 5, 1, 6, 7, 8, 2}, {2, 4, 6, 3, 5, 1, 8, 7, 7}, {5, 8, 9, 6, 1, 4, 1, 2, 3}, {1, 9, 3, 2, 7, 9, 5, 4, 6}}
  var count int8 = 0

  var i int8
  for i = 0; i < BOARD_SIZE; i++ {
    count += inSqu(&board1, i * SQUARE_SIZE)
  }

  fmt.Printf("%d in Square\n", count)

  if (count != 5) {
    t.Error(
      "For board1 expected", 5,
      "got", count,
    )
  }
}
