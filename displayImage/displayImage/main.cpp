//
//  main.cpp
//  displayImage
//
//  Created by Jonathan Guillotte-Blouin on 2016-11-21.
//  Copyright © 2016 Jonathan Guillotte-Blouin. All rights reserved.
//

#include <iostream>
#include <opencv2/opencv.hpp>

using namespace cv;
using namespace std;

// prototypes
void findBiggestBlob(Point&, Mat* const);

int main(int argc, const char * argv[]) {
    Mat sudoku = imread("/Users/boubou/repos/SudokuSolver/img/dummy.jpg", 0);
    Mat outerBox(sudoku.size(), CV_8UC1);
    
    
    // basic filtering
    GaussianBlur(sudoku, sudoku, Size(11, 11), 0);
    adaptiveThreshold(sudoku, outerBox, 255, ADAPTIVE_THRESH_MEAN_C, THRESH_BINARY, 5, 2);
    bitwise_not(outerBox, outerBox);
    
    Mat kernel = (Mat_<uchar>(3,3) << 0,1,0,1,1,1,0,1,0);
    dilate(outerBox, outerBox, kernel);
    
    
    // find Grid outside, mask interior
    Point maxPt;
    findBiggestBlob(maxPt, &outerBox);
    floodFill(outerBox, maxPt, CV_RGB(255, 255, 255));
    for (int y = 0; y < outerBox.size().height; y++) {
        uchar *row = outerBox.ptr(y);
        
        for (int x = 0; x < outerBox.size().width; x++) {
            if (row[x] == 64 && x != maxPt.x && y != maxPt.y) {
                floodFill(outerBox, Point(x,y), CV_RGB(0,0,0));
            }
        }
    }
    erode(outerBox, outerBox, kernel);
    
    
    // detect lines
    vector<Vec2f> lines;
    HoughLines(outerBox, lines, 1, CV_PI / 180, 200);
    

    imwrite("/Users/boubou/repos/SudokuSolver/img/dummyOutput.jpg", outerBox);
    
    // insert code here...
    std::cout << "Hello" << CV_VERSION << "\n";
}

// helper functions
void findBiggestBlob(Point& maxPt, Mat* const outerBox) {
    int maxArea = 1;
    
    for (int y = 0; y < outerBox->size().height; y++) {
        uchar* row = outerBox->ptr(y);
        
        for (int x = 0; x < outerBox->size().width; x++) {
            if (row[x] >= 128) {
                int area = floodFill(*outerBox, Point(x,y), CV_RGB(0,0,64));
                
                if (area > maxArea) {
                    maxPt = Point(x,y);
                    maxArea = area;
                }
            }
        }
    }
}
