package geneticLib

import (
  "encoding/json"
  "fmt"
  "math"
  "math/rand"
  "sort"
  "time"
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

func (individual *IndividualSolution) mutate(poss map[int8][]int8) {
  var i int8

  // grab first one, go makes iteration random
  for key, _ := range poss {
      i = key
      break
  }

  choices := poss[i]
  choicesLength := len(choices)

  newGene := choices[rand.Intn(choicesLength)]
  for newGene == individual.solution[i] {
    newGene = choices[rand.Intn(choicesLength)]
  }

  individual.addSolution(i, newGene)
}

func (individual1 *IndividualSolution) similarities(individual2 *IndividualSolution) float64 {
  var similar float64 = 0
  var total float64 = float64(len(individual1.solution))

  for key, _ := range individual1.solution {
    if individual1.solution[key] == individual2.solution[key] {
      similar++
    }
  }

  return similar / total
}


// implement Sort interface for the population
type Population []*IndividualSolution
func (pop Population) Len() int {return len(pop)}
func (pop Population) Swap(i, j int) {pop[i], pop[j] = pop[j], pop[i]}
func (pop Population) Less(i, j int) bool {return pop[i].fitness < pop[j].fitness}

func (pop Population) removeRandomIndividual() {
  rnd := rand.Float64()
  var currProb float64 = 0
  const Pc = 0.1 // predefined probability
  var i int

  for i, j := len(pop) - 1, 0; i >= 0; i, j = i - 1, j + 1 {
    currProb += math.Pow(1 - Pc, float64(j)) * Pc

    if rnd < currProb {
      break
    }
  }

  pop = append(pop[:i], pop[i + 1:]...)
}

func (pop Population) chooseParents() (int, int) {
  rnd := rand.Float64()
  var currProb float64 = 0
  const Pc = 0.2 // predefined probability
  var i int
  popLength := len(pop)

  // first parent chosen following a weighted probability
  for i, j := popLength - 1, 0; i >= 0; i, j = i - 1, j + 1 {
    currProb += math.Pow(1 - Pc, float64(j)) * Pc

    if rnd < currProb {
      break
    }
  }

  i2 := rand.Intn(popLength)
  for i2 == i {
    i2 = rand.Intn(popLength)
  }

  return i, i2
}

func (pop Population) crossover(ind1, ind2 int, grid[][]int8, poss map[int8][]int8) *IndividualSolution {
  child := IndividualSolution{0, make(map[int8]int8, 0)}
  sol1, sol2 := pop[ind1], pop[ind2]
  possLength := len(sol1.solution)
  cross := rand.Intn(possLength)

  // force group diversity
  if sol1.similarities(sol2) >= 0.9 {
    fmt.Println("new")
    sol2 = generateIndividual(poss, grid)
    sol2.setFitness(computeFitness(sol2.solution, grid))
  }

  for key, _ := range sol1.solution {
    cross--
    if cross >= 0 {
      child.addSolution(key, sol1.solution[key])
    } else {
      child.addSolution(key, sol2.solution[key])
    }
  }

  child.setFitness(computeFitness(child.solution, grid))

  return &child
}

func GeneticAlgorithm(poss map[int8][]int8, grid [][]int8) []byte {
  const POPULATION_SIZE = 100
  const MUTATION_RATE = 0.6
  const MAX_GENERATIONS = 100000

  rand.Seed(time.Now().UnixNano())

  population := generatePopulation(POPULATION_SIZE, poss, grid)
  var solution map[int8]int8 = nil

  for i := 0; i < MAX_GENERATIONS; i++ {
    sort.Sort(population) // sort population in increasing order of fitness

    if population[0].fitness == 1 {
      solution = population[0].solution
      break
    }

    population.removeRandomIndividual()
    parent1, parent2 := population.chooseParents()
    child := population.crossover(parent1, parent2, grid, poss)

    if rand.Float64() < MUTATION_RATE {
      child.mutate(poss)
    }

    population = append(population, child)
  }

  for i := 0; i < 10; i++ {
    fmt.Printf("%d\n%v\n\n", population[i].fitness, population[i].solution)
  }

  var jsonVal []byte
  if solution == nil {
    jsonVal, _ = json.Marshal(population[0].fitness)
  } else {
    fmt.Println("wazzzzzzzzzzzzzzzzzza\n\n")
    jsonVal, _ = json.Marshal(solution)
  }

  return jsonVal
}

func generatePopulation(size int, poss map[int8][]int8, grid [][]int8) Population {
  pop := make(Population, 0)

  for i := 0; i < size; i++ {
    ind := generateIndividual(poss, grid)
    pop = append(pop, ind)
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
