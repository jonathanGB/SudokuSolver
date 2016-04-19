package geneticLib

import (
  "encoding/json"
  "fmt"
  "math/rand"
)

const BOARD_SIZE = 9
const SQUARE_SIZE = 3

type IndividualSolution struct {
  fitness uint16
  solution map[int8]int8
}

func (individual *IndividualSolution) addSolution(key int8, val int8) {
  individual.solution[key] = val
}

func (individual *IndividualSolution) setFitness(val uint16) {
  individual.fitness = val
}

func GeneticAlgorithm(poss map[int8][]int8, grid [][]int8) []byte {
  const POPULATION_SIZE = 3
  const MUTATION_RATE = 0.7

  population := generatePopulation(POPULATION_SIZE, poss, grid)

  jsonVal, _ := json.Marshal(population)
  return jsonVal
}

func generatePopulation(size int, poss map[int8][]int8, grid [][]int8) []*IndividualSolution {
  pop := make([]*IndividualSolution, 0)

  for i := 0; i < size; i++ {
    ind := generateIndividual(poss, grid)
    pop = append(pop, ind)
    fmt.Printf("%v\n\n", *ind)
  }

  return pop
}

func generateIndividual(poss map[int8][]int8, grid [][]int8) *IndividualSolution {
  individual := IndividualSolution{0, make(map[int8]int8, 0)}

  for key, val := range poss {
    randomInd := rand.Intn(len(val))
    individual.addSolution(key, val[randomInd])
  }

  individual.setFitness(computeFitness(individual.solution, grid))

  return &individual
}

func computeFitness(solution map[int8]int8, grid [][]int8) uint16 {
  var newBoard [9][9]int8
  var i, j int8
  var count uint16 = 1

  // populate new board as a merge of the known board + random solution
  for i = 0; i < BOARD_SIZE; i++ {
    for j = 0; j < BOARD_SIZE; j++ {
      if grid[i][j] == 0 {
        newBoard[i][j] = solution[(i * BOARD_SIZE) + j]
      } else {
        newBoard[i][j] = grid[i][j]
      }
    }
  }

  for i = 0; i < BOARD_SIZE; i++ {
    for j = 0; j < BOARD_SIZE; j++ {
      count += inRow(&newBoard, i, j + 1, newBoard[i][j])
      count += inCol(&newBoard, i + 1, j, newBoard[i][j])
      count += inSqu(&newBoard, i, j, newBoard[i][j])
    }
  }

  return count
}

func inRow(board *[9][9]int8, i, j, val int8) uint16 {
  for ; j < BOARD_SIZE - 1; j++ {
      if board[i][j] == val {
        return 1
      }
  }

  return 0
}

func inCol(board *[9][9]int8, i, j, val int8) uint16 {
  for ; i < BOARD_SIZE - 1; i++ {
    if board[i][j] == val {
      return 1
    }
  }

  return 0
}

func inSqu(board *[9][9]int8, i, j, val int8) uint16 {
  var rowSquare int8 = i / SQUARE_SIZE * SQUARE_SIZE
  var colSquare int8 = j / SQUARE_SIZE * SQUARE_SIZE
  var iSqu, jSqu int8

  for iSqu = rowSquare; iSqu < rowSquare + SQUARE_SIZE; iSqu++ {
    if iSqu < i {
      continue
    }

    for jSqu = colSquare; jSqu < colSquare + SQUARE_SIZE; jSqu++ {
      if iSqu == i && jSqu < j {
        continue
      }

      if board[iSqu][jSqu] == val {
        return 1
      }
    }
  }

  return 0
}
