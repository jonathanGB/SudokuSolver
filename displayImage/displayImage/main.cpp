//
//  main.cpp
//  Grab a Sudoku grid using OpenCV
//
//  Thanks Utkarsh Sinha for the tutorial upon this program is almost entirely based on
//  http://aishack.in/tutorials/sudoku-grabber-opencv-plot/
//
//

#include <iostream>
#include <opencv2/opencv.hpp>

using namespace cv;
using namespace std;

// prototypes
void findBiggestBlob(Point&, Mat* const);
void mergeRelatedLines(vector<Vec2f>&, Mat&);
int getExtremeLines(vector<Vec2f>&, Mat&, Point2f*, Point2f*);


int main(int argc, const char * argv[]) {
    Mat sudoku = imread("/Users/boubou/repos/SudokuSolver/img/dummy.jpg", 0);
    Mat original = sudoku.clone();
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
    mergeRelatedLines(lines, sudoku);
    
    
    // get extreme lines and Points
    Point2f src[4], dst[4];
    int maxLength = getExtremeLines(lines, outerBox, src, dst);
    
    Mat undistorted(Size(maxLength, maxLength), CV_8UC1);
    warpPerspective(original, undistorted, getPerspectiveTransform(src, dst), Size(maxLength, maxLength));

    imwrite("/Users/boubou/repos/SudokuSolver/img/dummyOutput.jpg", undistorted);
    
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

void mergeRelatedLines(vector<Vec2f>& lines, Mat& img) {
    for (auto current : lines) {
        if (current[0] == 0 && current[1] == -100) continue;
        
        float rho1 = current[0], theta1 = current[1];
        Point pt1current, pt2current;
        
        if (theta1 > CV_PI * 45 / 180 && theta1 < CV_PI * 135 / 180) {
            pt1current.x = 0;
            pt1current.y = rho1 / sin(theta1);
            pt2current.x = img.size().width;
            pt2current.y = -pt2current.x / tan(theta1) + rho1 / sin(theta1);
        } else {
            pt1current.y = 0;
            pt1current.x = rho1 / cos(theta1);
            pt2current.y = img.size().height;
            pt2current.x = -pt2current.y / tan(theta1) + rho1 / cos(theta1);
        }
        
        for (auto pos : lines) {
            if (pos == current) continue;
            
            if (fabs(pos[0] - current[0]) < 20 && fabs(pos[1] - current[1]) < CV_PI * 10 / 180) {
                float rho = pos[0], theta = pos[1];
                Point pt1, pt2;
                
                if(pos[1] > CV_PI * 45 / 180 && pos[1] < CV_PI * 135 / 180) {
                    pt1.x = 0;
                    pt1.y = rho / sin(theta);
                    pt2.x = img.size().width;
                    pt2.y = -pt2.x / tan(theta) + rho / sin(theta);
                } else {
                    pt1.y = 0;
                    pt1.x = rho / cos(theta);
                    pt2.y = img.size().height;
                    pt2.x = -pt2.y / tan(theta) + rho / cos(theta);
                }
                
                if (((double) (pt1.x - pt1current.x) * (pt1.x - pt1current.x) + (pt1.y - pt1current.y)  * (pt1.y - pt1current.y) < 64 * 64) && ((double) (pt2.x - pt2current.x) * (pt2.x - pt2current.x) + (pt2.y - pt2current.y) * (pt2.y - pt2current.y) < 64 * 64)) {
                    // Merge the two
                    current[0] = (current[0] + pos[0]) / 2;
                    current[1] = (current[1] + pos[1]) / 2;
                    pos[0] = 0; pos[1] = -100;
                }
            }
        }
    }
}

int getExtremeLines(vector<Vec2f>& lines, Mat& outerBox, Point2f* src, Point2f* dst) {
    // Now detect the lines on extremes
    Vec2f topEdge(1000,1000), bottomEdge(-1000,-1000), leftEdge(1000,1000), rightEdge(-1000,-1000);
    double leftXIntercept = 100000;
    double rightXIntercept = 0;
    
    for (auto current : lines) {
        float rho = current[0], theta = current[1];
        
        if (rho == 0 && theta == -100) continue;
        
        double xIntercept = rho / cos(theta);
        
        if (theta > CV_PI * 80 / 180 && theta < CV_PI * 100 / 180) {
            if (rho < topEdge[0]) {
                topEdge = current;
            }
            
            if (rho > bottomEdge[0]) {
                bottomEdge = current;
            }
        } else if (theta < CV_PI * 10 / 180 || theta > CV_PI * 170 / 180) {
            if (xIntercept > rightXIntercept) {
                rightEdge = current;
                rightXIntercept = xIntercept;
            } else if (xIntercept <= leftXIntercept) {
                leftEdge = current;
                leftXIntercept = xIntercept;
            }
        }
    }
    
    Point left1, left2, right1, right2, bottom1, bottom2, top1, top2;
    int height = outerBox.size().height, width = outerBox.size().width;
    
    if (leftEdge[1] != 0) {
        left1.x = 0;
        left1.y = leftEdge[0] / sin(leftEdge[1]);
        left2.x = width;
        left2.y = -left2.x / tan(leftEdge[1]) + left1.y;
    } else {
        left1.y = 0;
        left1.x = leftEdge[0] / cos(leftEdge[1]);
        left2.y = height;
        left2.x = left1.x - height * tan(leftEdge[1]);
    }
    
    if (rightEdge[1] != 0) {
        right1.x = 0;
        right1.y = rightEdge[0] / sin(rightEdge[1]);
        right2.x = width;
        right2.y = -right2.x / tan(rightEdge[1]) + right1.y;
    } else {
        right1.y = 0;
        right1.x = rightEdge[0] / cos(rightEdge[1]);
        right2.y = height;
        right2.x = right1.x - height * tan(rightEdge[1]);
    }
    
    bottom1.x = 0;
    bottom1.y = bottomEdge[0] / sin(bottomEdge[1]);
    bottom2.x = width;
    bottom2.y = -bottom2.x / tan(bottomEdge[1]) + bottom1.y;
    
    top1.x = 0;
    top1.y = topEdge[0] / sin(topEdge[1]);
    top2.x = width;
    top2.y = -top2.x / tan(topEdge[1]) + top1.y;
    
    // Next, we find the intersection of  these four lines
    double leftA = left2.y - left1.y, leftB = left1.x - left2.x, leftC = leftA*left1.x + leftB*left1.y;
    double rightA = right2.y - right1.y, rightB = right1.x - right2.x, rightC = rightA * right1.x + rightB*right1.y;
    double topA = top2.y - top1.y, topB = top1.x - top2.x, topC = topA * top1.x + topB * top1.y;
    double bottomA = bottom2.y - bottom1.y, bottomB = bottom1.x - bottom2.x, bottomC = bottomA * bottom1.x + bottomB*bottom1.y;
    
    // Intersection of left and top
    double detTopLeft = leftA * topB - leftB * topA;
    CvPoint ptTopLeft((topB * leftC - leftB * topC) / detTopLeft, (leftA * topC - topA * leftC) / detTopLeft);
    
    // Intersection of top and right
    double detTopRight = rightA * topB - rightB * topA;
    CvPoint ptTopRight((topB * rightC - rightB * topC) / detTopRight, (rightA * topC - topA * rightC) / detTopRight);
    
    // Intersection of right and bottom
    double detBottomRight = rightA * bottomB - rightB * bottomA;
    CvPoint ptBottomRight((bottomB * rightC - rightB * bottomC) / detBottomRight, (rightA * bottomC - bottomA * rightC) / detBottomRight);
    
    // Intersection of bottom and left
    double detBottomLeft = leftA * bottomB - leftB * bottomA;
    CvPoint ptBottomLeft((bottomB * leftC - leftB * bottomC) / detBottomLeft, (leftA * bottomC - bottomA * leftC) / detBottomLeft);
    
    
    int maxLength = (ptBottomLeft.x - ptBottomRight.x) * (ptBottomLeft.x - ptBottomRight.x) + (ptBottomLeft.y - ptBottomRight.y) * (ptBottomLeft.y - ptBottomRight.y);
    int temp = (ptTopRight.x - ptBottomRight.x) * (ptTopRight.x - ptBottomRight.x) + (ptTopRight.y - ptBottomRight.y) * (ptTopRight.y - ptBottomRight.y);
    
    if (temp > maxLength) maxLength = temp;
    temp = (ptTopRight.x - ptTopLeft.x) * (ptTopRight.x - ptTopLeft.x) + (ptTopRight.y - ptTopLeft.y) * (ptTopRight.y - ptTopLeft.y);
    
    if (temp > maxLength) maxLength = temp;
    temp = (ptBottomLeft.x - ptTopLeft.x) * (ptBottomLeft.x - ptTopLeft.x) + (ptBottomLeft.y - ptTopLeft.y) * (ptBottomLeft.y - ptTopLeft.y);
    
    if (temp > maxLength) maxLength = temp;
    maxLength = sqrt((double)maxLength);
    
    
    src[0] = ptTopLeft;
    dst[0] = Point2f(0, 0);
    
    src[1] = ptTopRight;
    dst[1] = Point2f(maxLength - 1, 0);
    
    src[2] = ptBottomRight;
    dst[2] = Point2f(maxLength - 1, maxLength - 1);
    
    src[3] = ptBottomLeft;
    dst[3] = Point2f(0, maxLength - 1);
    
    return maxLength;
}
