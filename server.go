package main

import (
  "net/http"
  "strings"
  "fmt"
  "os"
  "bufio"
  "encoding/json"
  "strconv"
  "geneticLib"
)

func main() {
  http.HandleFunc("/",
    func(w http.ResponseWriter, req *http.Request) {
      requestedFile := "index.html"

      f, err := os.Open(requestedFile)
      if err != nil {
        panic("error reading index")
      }

      defer f.Close()
      w.Header().Add("Content Type", "text/html")
      br := bufio.NewReader(f)
      br.WriteTo(w)
    })
    http.HandleFunc("/img/", serveResource)
    http.HandleFunc("/css/", serveResource)
    http.HandleFunc("/js/", serveResource)
    http.HandleFunc("/genetic", func(w http.ResponseWriter, r *http.Request) {
      if r.Method == "POST" {
        postPossibilities := r.FormValue("possibilities")
        postGrid := r.FormValue("grid")

        possibilitiesStr := make(map[string][]int8, 0)
        grid := make([9][9]int8, 0)
        if err := json.Unmarshal([]byte(postPossibilities), &possibilitiesStr); err != nil {
          panic(err)
        }
        if err := json.Unmarshal([]byte(postGrid), &grid); err != nil {
          panic(err)
        }

        // convert keys of possibilitiesStr to int8
        possibilitiesInt := make(map[int8][]int8, 0)
        for key, val := range(possibilitiesStr) {
          newKey64, _ := strconv.ParseInt(key, 10, 8)

          possibilitiesInt[int8(newKey64)] = val
        }

        val := geneticLib.GeneticAlgorithm(possibilitiesInt, grid)
        fmt.Printf("%v", string(val))
        fmt.Fprintf(w, string(val))
      }
    })

    http.ListenAndServe(":8080", nil)
}

func serveResource(w http.ResponseWriter, req *http.Request) {
    path := req.URL.Path[1:]
    var contentType string
    if strings.HasSuffix(path, ".css") {
        contentType = "text/css"
    } else if strings.HasSuffix(path, ".png") {
        contentType = "image/png"
    } else if strings.HasSuffix(path, ".ico") {
        contentType = "image/x-icon"
    } else if strings.HasSuffix(path, ".gif") {
        contentType = "image/gif"
    } else if strings.HasSuffix(path, ".js") {
        contentType = "application/javascript"
    } else {
        contentType = "text/plain"
    }

    f, err := os.Open(path)

    if err == nil {
        defer f.Close()
        w.Header().Add("Content-Type", contentType)
        br := bufio.NewReader(f)
        br.WriteTo(w)
    } else {
        w.WriteHeader(404)
    }
}
