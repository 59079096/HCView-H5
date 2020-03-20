import { TPoint, TList } from "../hcl/System.js"

class TRgnPoints extends TList {
    constructor() {
        super();
        this.rbIndex = 0;
    }
}

export class THCRectRegion extends TList {
    constructor () {
        super();
    }

    _rectSort(pt1, pt2) {
        let dy = pt1.y - pt2.y;
        if (dy < 0)
            return -1;
        else if (dy > 0)
            return 1;
        else {
            let dx = pt1.x - pt2.x;
            if (dx < 0)
                return - 1;
            else if (dx > 0)
                return 1;
            else
                return 0;
        }
    }

    _addRectPath(rect) {
        let vLeftTop = TPoint.CreateByPoint(rect.leftTop);
        let vRightTop = TPoint.CreateByPoint(rect.rightTop);
        let vRightBottom = TPoint.CreateByPoint(rect.rightBottom);
        let vLeftBottom = TPoint.CreateByPoint(rect.leftBottom);
        let vRgnLast;

        if (this.count == 0) {
            vRgnLast = new TRgnPoints();
            vRgnLast.add(vLeftTop);
            vRgnLast.add(vRightTop);
            vRgnLast.add(vRightBottom);
            vRgnLast.add(vLeftBottom);
            vRgnLast.rbIndex = 2;
            this.add(vRgnLast);
            return;
        }

        let vMerge = false, vRightBottomPt;
        vRgnLast = this.last;  // 只和最后一行合并
        vRightBottomPt = vRgnLast[vRgnLast.rbIndex];  // 最后一行右下角
        // 判断水平合并
        if (vLeftBottom.equal(vRightBottomPt) || vLeftBottom.equal(vRgnLast[vRgnLast.rbIndex + 1])) {  // 左下角和原左、右下角重合
            let vRightTopPt = vRgnLast[vRgnLast.rbIndex - 1];
            vRightTopPt.resetByPoint(vRightTop);
            vRightBottomPt.resetByPoint(vRightBottom);
            vMerge = true;
        }

        if (!vMerge) {
            vRgnLast = new TRgnPoints();
            vRgnLast.add(vLeftTop);
            vRgnLast.add(vRightTop);
            vRgnLast.add(vRightBottom);
            vRgnLast.add(vLeftBottom);
            vRgnLast.rbIndex = 2;
            this.add(vRgnLast);
        }

        if (this.count > 1) {  // 多行合并
            vRgnLast = this.last;
            let vRgnPrev = this[this.count - 2];  // 倒数第二行
            let vLastLT = vRgnLast[0];
            let vLastRT = vRgnLast[1];
            
            if (vLastLT.y == vRgnPrev[vRgnPrev.rbIndex].y) {  // 两行上下挨着
                if (vLastRT.x > vRgnPrev[vRgnPrev.rbIndex + 1].x) {  // 两行有重叠
                    if (vLastLT.x == vRgnPrev[vRgnPrev.rbIndex + 1].x)
                        vRgnPrev[vRgnPrev.rbIndex + 1].resetByPoint(vRgnLast[3]);
                    else {
                        vRgnPrev.insert(vRgnPrev.rbIndex + 1, vRgnLast[0]);
                        vRgnPrev.insert(vRgnPrev.rbIndex + 1, vRgnLast[3]);
                    }

                    vRgnPrev.insert(vRgnPrev.rbIndex + 1, vRgnLast[2]);
                    vRgnPrev.insert(vRgnPrev.rbIndex + 1, vRgnLast[1]);

                    vRgnPrev.rbIndex += 2;
                    this.delete(this.count - 1);
                }
            }
        }
    }

    // clear() {
    //     this.pointArr = new Array(0);
    // }

    combineRect(rect) {
        this._addRectPath(rect);
    }

    frameRgn(hclCanvas) {
        let vPtArr;
        for (let i = 0; i < this.count; i++) {
            vPtArr = this[i];
            hclCanvas.beginPath();
            hclCanvas.moveToPoint(vPtArr[0]);
            for (let j = 1; j < vPtArr.length; j++)
                hclCanvas.lineToPoint(vPtArr[j]);
            
            hclCanvas.lineToPoint(vPtArr[0]);
            hclCanvas.paintPath();
        }
    }
}