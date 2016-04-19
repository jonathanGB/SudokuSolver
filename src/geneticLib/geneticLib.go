package geneticLib

import (
  "encoding/json"
  "fmt"
  "math/rand"
)

const BOARD_SIZE = 9
const SQUARE_SIZE = 3

type IndividualSolution struct {
  fitness int8
  solution map[int8]int8
}

func (individual *IndividualSolution) addSolution(key int8, val int8) {
  individual.solution[key] = val
}

func (individual *IndividualSolution) setFitness(val int8) {
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
  }

  return pop
}

func generateIndividual(poss map[int8][]int8, grid [][]int8) *IndividualSolution {
  individual := IndividualSolution{-1, make(map[int8]int8, 0)}

  for key, val := range poss {
    randomInd := rand.Intn(len(val))
    individual.addSolution(key, val[randomInd])
  }

  individual.setFitness(computeFitness(individual.solution, grid))

  return &individual
}

func computeFitness(solution map[int8]int8, grid [][]int8) int8 {
  var newBoard [9][9]int8
  var i, j int8
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

  fmt.Printf("%v\n\n", newBoard)
  return -2
}
