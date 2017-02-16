package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"runtime"
	"strconv"
	"time"
)

func main() {
	rand.Seed(time.Now().UnixNano())

	fs := http.FileServer(http.Dir("static"))
	http.Handle("/", fs)

	http.HandleFunc("/genetic", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			postPossibilities := r.FormValue("possibilities")
			postGrid := r.FormValue("grid")

			possibilitiesStr := make(map[string][]int8, 0)
			grid := make([][]int8, 9)
			if err := json.Unmarshal([]byte(postPossibilities), &possibilitiesStr); err != nil {
				panic(err)
			}
			if err := json.Unmarshal([]byte(postGrid), &grid); err != nil {
				panic(err)
			}

			// convert keys of possibilitiesStr to int8
			possibilitiesInt := make(map[int8][]int8, 0)
			for key, val := range possibilitiesStr {
				newKey64, _ := strconv.ParseInt(key, 10, 8)

				possibilitiesInt[int8(newKey64)] = val
			}

			numCPU := runtime.NumCPU()
			vals := make(chan []byte, numCPU)
			stopGenetic := make(chan bool, 1)
			for pops := 0; pops < numCPU; pops++ {
				go GeneticAlgorithm(possibilitiesInt, grid, vals, stopGenetic)
			}

			var valCtr int
			var done bool
			for valCtr < numCPU {
				select {
				case val := <-vals:
					if val != nil {
						stopGenetic <- true
						fmt.Fprintf(w, string(val))
						done = true
						break
					} else if valCtr == numCPU-1 {
						fmt.Fprintf(w, "0")
					}

					valCtr++
				}

				if done {
					break
				}
			}
		}
	})

	http.ListenAndServe(":8080", nil)
}
