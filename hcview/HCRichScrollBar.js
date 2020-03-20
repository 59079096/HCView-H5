import { TOrientation, TScrollBar } from "../hcl/Controls.js";
import { TList, TRect } from "../hcl/System.js";

class TAreaMark {
    constructor() {
        this.tag = 0;
        this.position = 0;
        this.height = 0;
    }
}

export class THCRichScrollBar extends TScrollBar {
    constructor() {
        super();
        this.rightBlank_ = 40;
        this.FAreaMarks = new TList();
        this.FOnPageUpClick = null;
        this.FOnPageDownClick = null;
    }

    _getAreaMarkByTag(tag) {
        let vResult = -1;
        for (let i = 0; i < this.FAreaMarks.count; i++) {
            if (this.FAreaMarks[i].tag == tag) {
                vResult = i;
                break;
            }
        }

        return vResult;
    }

    _getAreaMarkRect(index) {
        let vResult = new TRect();
        if (this.orientation == TOrientation.Vertical) {
            let vTop = this.leftBlank_ + this.buttonSize + Math.round(this.FAreaMarks[index].position * this.percent_);
            let vHeight = Math.round(this.FAreaMarks[index].height * this.percent_);
            if (vHeight < 2)
                vHeight = 2;

            vResult.resetBounds(0, vTop, this.width, vHeight);
        }

        return vResult;
    }

    doDrawThumBefor_(hclCanvas, thumRect) { 
        if (this.orientation == TOrientation.Vertical) {
              if (this.FAreaMarks.count > 0) {
                hclCanvas.brush.color = "#6b5952";
      
                let vRect;
                for (let i = 0; i < this.FAreaMarks.count; i++) {
                    vRect = this._getAreaMarkRect(i);
      
                    if ((vRect.bottom > this.leftBlank_ + this.buttonSize)
                        && (vRect.top < this.height - this.rightBlank_ - this.buttonSize))
                        hclCanvas.fillRect(vRect);
                }
              }
        }
    }

    doMouseDown_(e) {
        super.doMouseDown_(e);
        if (this.thumRect_.pointIn(this.mouseDownPt_))
            return;

        if (this.orientation == TOrientation.Vertical) {
            if (this.FAreaMarks.count > 0) {
                let vRect;
                for (let i = 0; i < this.FAreaMarks.count; i++) {
                    vRect = this._getAreaMarkRect(i);
                    if (vRect.pointIn(this.mouseDownPt_)) {
                        this.position = this.FAreaMarks[i].position - vRect.top;
                        break;
                    }
                }
            }
        }
    }

    doMouseUp_(e) {
        super.doMouseUp_(e);
        if (this.orientation == TOrientation.Vertical) {
            if (TRect.CreateByBounds(2, this.height - this.rightBlank_ + 2, 16, 16).pointInAt(e.x, e.y)) {
                if (this.FOnPageUpClick != null)
                    this.FOnPageUpClick(this);
            } else if (TRect.CreateByBounds(2, this.height - this.rightBlank_ + 2 + 16 + 2, 16, 16).pointInAt(e.x, e.y)) {
                if (this.FOnPageDownClick != null)
                    this.FOnPageDownClick(this);
            }
        }
    }

    paintToEx(hclCanvas) {
        super.paintToEx(hclCanvas);

        if (this.orientation == TOrientation.Vertical) {
            if (this.rightBlank_ > 0) {
                hclCanvas.brush.color = "#52596b";
                hclCanvas.fillRect(TRect.Create(2, this.height - this.rightBlank_ + 2, this.width - 2, this.height - 2));

                //上按钮
                hclCanvas.pen.color = "#aaabb3";
                let vX = Math.trunc((this.width - 5) / 2);
                let vY = this.height - this.rightBlank_ + 2 + this.buttonSize - 9;
                hclCanvas.beginPath();
                hclCanvas.drawLine(vX, vY, vX + 5, vY);
                hclCanvas.drawLine(vX + 1, vY - 1, vX + 4, vY - 1);
                hclCanvas.drawLine(vX + 2, vY - 2, vX + 3, vY - 2);

                vY = vY - 3;
                hclCanvas.drawLine(vX, vY, vX + 5, vY);
                hclCanvas.drawLine(vX + 1, vY - 1, vX + 4, vY - 1);
                hclCanvas.drawLine(vX + 2, vY - 2, vX + 3, vY - 2);

                // 下按钮
                vY = this.height - this.rightBlank_ + 2 + this.buttonSize + 2 + 3;
                hclCanvas.drawLine(vX, vY, vX + 5, vY);
                hclCanvas.drawLine(vX + 1, vY + 1, vX + 4, vY + 1);
                hclCanvas.drawLine(vX + 2, vY + 2, vX + 3, vY + 2);

                vY = vY + 3;
                hclCanvas.drawLine(vX, vY, vX + 5, vY);
                hclCanvas.drawLine(vX + 1, vY + 1, vX + 4, vY + 1);
                hclCanvas.drawLine(vX + 2, vY + 2, vX + 3, vY + 2);
                hclCanvas.paintPath();
            }
        }
    }

    SetAreaPos(aTag, aPosition, aHeight) {
        if (this.FAreaMarks == null)
            this.FAreaMarks = new TList();

        let vIndex = this._getAreaMarkByTag(aTag);
        if (vIndex < 0) {
            let vAreaMark = new TAreaMark();
            vAreaMark.tag = aTag;
            vAreaMark.position = aPosition;
            vAreaMark.height = aHeight;

            this.FAreaMarks.add(vAreaMark);
            let vRect = this._getAreaMarkRect(this.FAreaMarks.count - 1);
            this.updateRect(vRect);
        } else if ((this.FAreaMarks[vIndex].position != aPosition) || (this.FAreaMarks[vIndex].height != aHeight)) {
            let vRect = this._getAreaMarkRect(vIndex);
            this.FAreaMarks[vIndex].position = aPosition;
            this.FAreaMarks[vIndex].height = aHeight;
            this.updateRect(vRect);

            vRect = this._getAreaMarkRect(vIndex);
            this.updateRect(vRect);
        }
    }

    get OnPageUpClick() {
        return this.FOnPageUpClick;
    }

    set OnPageUpClick(val) {
        this.FOnPageUpClick = val;
    }

    get OnPageDownClick() {
        return this.FOnPageDownClick;
    }

    set OnPageDownClick(val) {
        this.FOnPageDownClick = val;
    }
}