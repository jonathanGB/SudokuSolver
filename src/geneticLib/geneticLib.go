package geneticLib

import (
  "encoding/json"
  "fmt"
  "math"
  "math/rand"
  "sort"
  "strconv"
  "sync"
)

/* CHANGE GRID TO ARRAY RATHER THAN SLICE */

const BOARD_SIZE = 9
const SQUARE_SIZE = 3
var mu sync.Mutex

type Possibilities map[int8][]int8
type Solution map[int8]int8
type IndividualSolution struct {
  fitness int8
  solution Solution
}

func (solution Solution) preMarshal() (pre map[string]int8) {
  pre = make(map[string]int8)

  for key, value := range solution {
    keyStr := strconv.Itoa(int(key))
    pre[keyStr] = value
  }

  return
}

func (individual *IndividualSolution) addSolution(key int8, val int8) {
  individual.solution[key] = val
}

func (individual *IndividualSolution) setFitness(val int8) {
  individual.fitness = val
}

func (individual *IndividualSolution) mutate(poss Possibilities) {
  var i int8

  // grab first one, go makes iteration random
  for key, _ := range poss { // TODO: bad idea, need to generate random number and stop at this random index
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

// TODO: remove this (eventually) ? <--- currently unused
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

// TODO: remove this? <--- currently unused
func (pop Population) removeRandomIndividual() {
  rnd := rand.Float64()
  var currProb float64
  const Pc = 0.3 // predefined probability
  var i, j int

  for i, j = 0, 0; i < len(pop) - 1; i, j = i + 1, j + 1 {
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
  const Pc = 0.1 // predefined probability
  var i, j int
  popLength := len(pop)

  // first parent chosen following a weighted probability
  for i, j = popLength - 1, 0; i >= 0; i, j = i - 1, j + 1 {
    currProb += math.Pow(1 - Pc, float64(j)) * Pc

    if rnd < currProb {
      break
    }
  }


  // second parent chosen following a weighted probability
  rnd = rand.Float64()
  currProb = 0

  var i2 int
  for i2, j = popLength - 1, 0; i >= 0; i, j = i - 1, j + 1 {
    currProb += math.Pow(1 - Pc, float64(j)) * Pc

    if rnd < currProb {
      break
    }
  }

  if (i == i2) {
    if (i == popLength - 1) {
      i2--
    } else {
      i2++
    }
  }

  return i, i2
}

func (pop Population) crossover(ind1, ind2 int, grid[][]int8, poss Possibilities) (*IndividualSolution, *IndividualSolution) {
  child1 := IndividualSolution{1, make(map[int8]int8)}
  child2 := IndividualSolution{1, make(map[int8]int8)}
  sol1, sol2 := pop[ind1], pop[ind2]
  possLength := len(sol1.solution)
  cross := rand.Intn(possLength)

  for key, _ := range sol1.solution {
    cross--
    if cross >= 0 {
      child1.addSolution(key, sol1.solution[key])
      child2.addSolution(key, sol2.solution[key])
    } else {
      child1.addSolution(key, sol2.solution[key])
      child2.addSolution(key, sol1.solution[key])
    }
  }

  return &child1, &child2
}

func GeneticAlgorithm(poss Possibilities, grid [][]int8) []byte {
  const POPULATION_SIZE = 1000
  const MUTATION_RATE = 0.05
  const MAX_GENERATIONS = 1000000

  population := generatePopulation(POPULATION_SIZE, poss, grid)
  var solution Solution

  for i := 0; i < MAX_GENERATIONS; i++ {
    sort.Sort(population) // sort population in increasing order of fitness

    if (i == 0) {
      for i := 0; i < 50; i++ {
        fmt.Printf("%d\n%v\n\n", population[i].fitness, population[i].solution)
      }

      fmt.Println("\n\n\n")
    }

    if population[0].fitness == 1 {
      solution = population[0].solution
      break
    }

    //population = population[:len(population) - 1] // population.removeRandomIndividual()
    parent1, parent2 := population.chooseParents()
    child1, child2 := population.crossover(parent1, parent2, grid, poss)

    if rand.Float64() < MUTATION_RATE {
      child1.mutate(poss)
    }

    if rand.Float64() < MUTATION_RATE {
      child2.mutate(poss)
    }

    child1.setFitness(computeFitness(child1.solution, grid))
    child2.setFitness(computeFitness(child2.solution, grid))

    // insert best children in population
    for i := 0; i < len(population); i++ {
      if (child1.fitness < population[i].fitness) {
        for j:= len(population) - 1; j > i; j-- {
          population[j] = population[j - 1]
        }

        population[i] = child1
        break
      }

      if (child2.fitness < population[i].fitness) {
        for j:= len(population) - 1; j > i; j-- {
          population[j] = population[j - 1]
        }

        population[i] = child2
        break
      }
    }
  }

  for i := 0; i < 50; i++ {
    fmt.Printf("%d...%d\n%v\n\n", population[i].fitness, i, population[i].solution)
  }

  var jsonVal []byte
  if solution == nil {
    jsonVal, _ = json.Marshal(population[0].fitness)
  } else {
    fmt.Println("wazzzzzzzzzzzzzzzzzza\n\n")
    jsonVal, _ = json.Marshal(solution.preMarshal())
  }

  return jsonVal
}

func generatePopulation(size int, poss Possibilities, grid [][]int8) Population {
  fmt.Println(grid)

  pop := make(Population, 0)

  for i := 0; i < size; i++ {
    ind := generateIndividual(poss, grid)
    pop = append(pop, ind)
  }

  sort.Sort(pop)

  return pop
}

func generateIndividual(poss Possibilities, grid [][]int8) *IndividualSolution {
  individual := IndividualSolution{1, make(map[int8]int8, 0)}

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
  var count int8 = 1

  // populate new board as a merge of the known board + random solution
  for i = 0; i < BOARD_SIZE; i++ {
    for j = 0; j < BOARD_SIZE; j++ {
      if grid[i][j] == 0 {
        newBoard[i][j] = solution[i * BOARD_SIZE + j]
      } else {
        newBoard[i][j] = grid[i][j]
      }
    }
  }

  // here is the same fitness computation but concurrently using channels
  // innerFitnesses := make(chan int8, BOARD_SIZE)
  // for i = 0; i < BOARD_SIZE; i++ {
  //   go func(index int8) {
  //     var innerCount int8
  //
  //     innerCount += inRow(&newBoard, index)
  //     innerCount += inCol(&newBoard, index)
  //     innerCount += inSqu(&newBoard, index * SQUARE_SIZE)
  //
  //     innerFitnesses <- innerCount
  //   }(i)
  // }
  //
  // readCtr := 0
  // for readCtr < BOARD_SIZE {
  //   select {
  //   case val := <- innerFitnesses:
  //     count += val
  //     readCtr++
  //   }
  // }

  // here is the same fitness computation but concurrently using mutex
  // var wg sync.WaitGroup
  // wg.Add(BOARD_SIZE)
  // for i = 0; i < BOARD_SIZE; i++ {
  //   go func(index int8) {
  //     defer wg.Done()
  //     var innerCount int8
  //
  //     innerCount += inRow(&newBoard, index)
  //     innerCount += inCol(&newBoard, index)
  //     innerCount += inSqu(&newBoard, index * SQUARE_SIZE)
  //
  //     mu.Lock()
  //       count += innerCount
  //     mu.Unlock()
  //   }(i)
  // }
  // wg.Wait()

  for i = 0; i < BOARD_SIZE; i++ {
      count += inRow(&newBoard, i)
      count += inCol(&newBoard, i)
      count += inSqu(&newBoard, i * SQUARE_SIZE)
  }

  return count
}

// loops through the rest of the row to see if the value "val" is present
// used to increment the fitness count of the current solution
// if that is the case, returns 1; otherwise, returns 0
func inRow(board *[9][9]int8, i int8) (count int8) {
  var hash [9]bool // used as a bucket structure
  var j int8

  for j, count = 0, 0; j < BOARD_SIZE; j++ {
    curr := board[i][j]

    if (hash[curr - 1]) {
      count++
    } else {
      hash[curr - 1] = true
    }
  }

  return
}

// loops through the rest of the column to see if the value "val" is present
// used to increment the fitness count of the current solution
// if that is the case, returns 1; otherwise, returns 0
func inCol(board *[9][9]int8, j int8) (count int8) {
  var hash [9]bool // used as a bucket structure
  var i int8

  for i, count = 0, 0; i < BOARD_SIZE; i++ {
    curr := board[i][j]

    if (hash[curr - 1]) {
      count++
    } else {
      hash[curr - 1] = true
    }
  }

  return
}

// loops through the rest of the square containing (i, j) to see if the value "val" is present
// used to increment the fitness count of the current solution
// if that is the case, returns 1; otherwise, returns 0
func inSqu(board *[9][9]int8, index int8) (count int8) {
  var hash [9]bool // used as a bucket structure
  var rowSquare int8 = index / BOARD_SIZE * SQUARE_SIZE
  var colSquare int8 = index % BOARD_SIZE
  count = 0

  for i := rowSquare; i < rowSquare + SQUARE_SIZE; i++ {
    for j := colSquare; j < colSquare + SQUARE_SIZE; j++ {
      curr := board[i][j]

      if (hash[curr - 1]) {
        count++
      } else {
        hash[curr - 1] = true
      }
    }
  }

  return
}
