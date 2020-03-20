import { THCTextRectItem } from "./HCRectItem.js";
import { THCStyle } from "./HCStyle.js";
import { TExpressArea, HC } from "./HCCommon.js";
import { TRect } from "../hcl/System.js";
import { TColor } from "../hcl/Graphics.js";
import { TMouseButton, TKey } from "../hcl/Controls.js";

export class THCFractionItem extends THCTextRectItem {
    constructor(ownerData, topText, bottomText) {
        super(ownerData);
        this.StyleNo = THCStyle.Fraction;
        this.FPadding = 5;
        this.FActiveArea = TExpressArea.None;
        this.FCaretOffset = -1;
        this.FLineHide = false;
        this.FTopText = topText;
        this.FBottomText = bottomText;
        this.FTopRect = new TRect();
        this.FBottomRect = new TRect();
        this.FMouseLBDowning = false;
        this.FOutSelectInto = false;
        this.FActiveArea = TExpressArea.None;
        this.FMouseMoveArea = TExpressArea.None;
    }

    FormatToDrawItem(richData, itemNo) {
        let vStyle = richData.Style;
        vStyle.ApplyTempStyle(this.TextStyleNo);
        let vH = vStyle.TextStyles[this.TextStyleNo].FontHeight;
        let vTopW = Math.max(vStyle.TempCanvas.textWidth(this.FTopText), this.FPadding);
        let vBottomW = Math.max(vStyle.TempCanvas.textWidth(this.FBottomText), this.FPadding);
        
        if (vTopW > vBottomW)
            this.Width = vTopW + 4 * this.FPadding;
        else
            this.Width = vBottomW + 4 * this.FPadding;

        this.Height = vH * 2 + 4 * this.FPadding;

        this.FTopRect.resetBounds(this.FPadding + Math.trunc((this.Width - this.FPadding - this.FPadding - vTopW) / 2),
            this.FPadding, vTopW, vH);
        this.FBottomRect.resetBounds(this.FPadding + Math.trunc((this.Width - this.FPadding - this.FPadding - vBottomW) / 2),
            this.Height - this.FPadding - vH, vBottomW, vH);
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        if (this.Active && (!paintInfo.Print)) {
            hclCanvas.brush.color = HC.clBtnFace;
            hclCanvas.fillRect(drawRect);
        }

        if (!this.FLineHide) {
            hclCanvas.pen.color = TColor.Black;
            hclCanvas.drawLineDriect(drawRect.left + this.FPadding, drawRect.top + this.FTopRect.bottom + this.FPadding,
                drawRect.left + this.Width - this.FPadding, drawRect.top + this.FTopRect.bottom + this.FPadding);
        }

        if (!paintInfo.Print) {
            let vFocusRect = new TRect();

            if (this.FActiveArea != TExpressArea.None) {
                if (this.FActiveArea == TExpressArea.Top)
                    vFocusRect.resetRect(this.FTopRect);
                else if (this.FActiveArea == TExpressArea.Bottom)
                        vFocusRect.resetRect(this.FBottomRect);

                vFocusRect.offset(drawRect.left, drawRect.top);
                vFocusRect.inFlate(2, 2);
                hclCanvas.pen.color = TColor.Blue;
                hclCanvas.rectangleRect(vFocusRect);
            }

            if ((this.FMouseMoveArea != TExpressArea.None) && (this.FMouseMoveArea != this.FActiveArea)) {
                if (this.FMouseMoveArea == TExpressArea.Top)
                    vFocusRect.resetRect(this.FTopRect);
                else if (this.FMouseMoveArea == TExpressArea.Bottom)
                    vFocusRect.resetRect(this.FBottomRect);

                vFocusRect.offset(drawRect.left, drawRect.top);
                vFocusRect.inFlate(2, 2);
                hclCanvas.pen.color = HC.clMedGray;
                hclCanvas.rectangleRect(vFocusRect);
            }
        }

        style.TextStyles[this.TextStyleNo].ApplyStyle(hclCanvas, paintInfo.ScaleY / paintInfo.Zoom);
        hclCanvas.textOut(drawRect.left + this.FTopRect.left, drawRect.top + this.FTopRect.top, this.FTopText);
        hclCanvas.textOut(drawRect.left + this.FBottomRect.left, drawRect.top + this.FBottomRect.top, this.FBottomText);
    }

    GetOffsetAt(x) {
        if (this.FOutSelectInto)
            return super.GetOffsetAt(x);
        else {
            if (x <= 0)
                return HC.OffsetBefor;
            else if (x >= this.Width)
                return HC.OffsetAfter;
            else
                return HC.OffsetInner;
        }
    }

    SetActive(val) {
        super.SetActive(val);
        if (!val)
            this.FActiveArea = TExpressArea.None;
    }

    MouseLeave() {
        super.MouseLeave();
        this.FMouseMoveArea = TExpressArea.None;
    }

    MouseDown(e) {
        let vResult = super.MouseDown(e);
        
        this.FMouseLBDowning = (e.button == TMouseButton.Left);
        this.FOutSelectInto = false;
        
        if (this.FMouseMoveArea != this.FActiveArea) {
            this.FActiveArea = this.FMouseMoveArea;
            this.OwnerData.Style.updateInfoReCaret();
        }

        let vS = "";
        let vX = 0;

        if (this.FActiveArea == TExpressArea.Top) {
            vS = this.FTopText;
            vX = e.x - this.FTopRect.left;
        } else if (this.FActiveArea == TExpressArea.Bottom) {
            vS = this.FBottomText;
            vX = e.x - this.FBottomRect.left;
        }
        
        let vOffset = -1;
        if (this.FActiveArea != TExpressArea.None) {
            this.OwnerData.Style.ApplyTempStyle(this.TextStyleNo);
            vOffset = HC.GetNorAlignCharOffsetAt(this.OwnerData.Style.TempCanvas, vS, vX);
        }

        if (vOffset != this.FCaretOffset) {
            this.FCaretOffset = vOffset;
            this.OwnerData.Style.updateInfoReCaret();
        }

        return vResult;
    }

    MouseMove(e) {
        if ((!this.FMouseLBDowning) && (e.button == TMouseButton.Left))
            this.FOutSelectInto = true;
        
        if (!this.FOutSelectInto) {
            let vArea = this.GetExpressArea(e.x, e.y);
            if (vArea != this.FMouseMoveArea) {
                this.FMouseMoveArea = vArea;
                this.OwnerData.Style.updateInfoRePaint();
            }
        } else
            this.FMouseMoveArea = TExpressArea.None;

        return super.MouseMove(e);
    }

    MouseUp(e) {
        this.FMouseLBDowning = false;
        this.FOutSelectInto = false;
        return super.MouseUp(e);
    }

    WantKeyDown(e) {
        return true;
    }

    KeyDown(e) {
        switch (e.keyCode) {
            case TKey.Back:
                if (this.FActiveArea == TExpressArea.Top) {
                    if (this.FCaretOffset > 0) {
                        this.FTopText = this.FTopText.remove(this.FCaretOffset - 1, 1);
                        this.FCaretOffset--;
                    }
                } else if (this.FActiveArea == TExpressArea.Bottom) {
                    if (this.FCaretOffset > 0) {
                        this.FBottomText = this.FBottomText.remove(this.FCaretOffset - 1, 1);
                        this.FCaretOffset--;
                    }
                }

                this.SizeChanged = true;
                break;

            case TKey.Left:
                if (this.FCaretOffset > 0)
                    this.FCaretOffset--;
                break;

            case TKey.Right: {
                    let vS = "";
                    if (this.FActiveArea == TExpressArea.Top)
                        vS = this.FTopText;
                    else if (this.FActiveArea == TExpressArea.Bottom)
                        vS = this.FBottomText;

                    if (this.FCaretOffset < vS.length)
                        this.FCaretOffset++;
                }
                break;

            case TKey.Delete:
                if (this.FActiveArea == TExpressArea.Top) {
                    if (this.FCaretOffset < this.FTopText.length)
                        this.FTopText = this.FTopText.remove(this.FCaretOffset, 1);
                } else if (this.FActiveArea == TExpressArea.Bottom) {
                    if (this.FCaretOffset < this.FBottomText.length)
                        this.FBottomText = this.FBottomText.remove(this.FCaretOffset, 1);
                }
                this.SizeChanged = true;

                break;

            case TKey.Home:
                this.FCaretOffset = 0;
                break;

            case TKey.End:
                if (this.FActiveArea == TExpressArea.Top)
                    this.FCaretOffset = this.FTopText.length;
                else if (this.FActiveArea == TExpressArea.Bottom)
                    this.FCaretOffset = this.FBottomText.length;

                break;
        }
    }

    KeyPress(key) {
        if (this.FActiveArea != TExpressArea.None)
            this.InsertText(String.fromCharCode(key));
        else
            return 0;
    }

    InsertText(text) {
        if (this.FActiveArea != TExpressArea.None) {
            if (this.FActiveArea == TExpressArea.Top)
                this.FTopText = this.FTopText.insert(this.FCaretOffset, text);
            else if (this.FActiveArea == TExpressArea.Bottom)
                this.FBottomText = this.FBottomText.insert(this.FCaretOffset, text);

            this.FCaretOffset += text.length;

            this.SizeChanged = true;
            return true;
        } else
            return false;
    }

    GetCaretInfo(caretInfo) {
        if ((this.FActiveArea != TExpressArea.None) && (this.FCaretOffset >= 0)) {
            this.OwnerData.Style.ApplyTempStyle(this.TextStyleNo);
            if (this.FActiveArea == TExpressArea.Top) {
                if (this.FCaretOffset < 0)
                    this.FCaretOffset = 0;

                caretInfo.height = this.FTopRect.bottom - this.FTopRect.top;
                caretInfo.x = this.FTopRect.left + this.OwnerData.Style.TempCanvas.textWidth(this.FTopText.substr(0, this.FCaretOffset));
                caretInfo.y = this.FTopRect.top;
            } else if (this.FActiveArea == TExpressArea.Bottom) {
                if (this.FCaretOffset < 0)
                    this.FCaretOffset = 0;

                caretInfo.height = this.FBottomRect.bottom - this.FBottomRect.top;
                caretInfo.x = this.FBottomRect.left + this.OwnerData.Style.TempCanvas.textWidth(this.FBottomText.substr(0, this.FCaretOffset));
                caretInfo.y = this.FBottomRect.top;
            }
        } else
            caretInfo.visible = false;
    }

    GetExpressArea(x, y) {
        if (this.FTopRect.pointInAt(x, y))
            return TExpressArea.Top;
        else if (this.FBottomRect.pointInAt(x, y))
            return TExpressArea.Bottom;
        else
            return TExpressArea.None;
    }

    get TopRect() {
        return this.FTopRect;
    }

    set TopRect(val) {
        this.FTopRect = val;
    }

    get BottomRect() {
        return this.FBottomRect;
    }

    set BottomRect(val) {
        this.FBottomRect = val;
    }

    Assign(source) {
        this.Assign(source);
        this.FTopText = source.TopText;
        this.FBottomText = source.BottomText;
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        HC.HCSaveTextToStream(stream, this.FTopText);
        HC.HCSaveTextToStream(stream, this.FBottomText);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        this.FTopText = HC.HCLoadTextFromStream(stream, fileVersion);
        this.FBottomText = HC.HCLoadTextFromStream(stream, fileVersion);
    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }

    get Padding() {
        return this.FPadding;
    }

    get LineHide() {
        return this.FLineHide;
    }

    set LineHide(val) {
        this.FLineHide = val;
    }

    get TopText() {
        return this.FTopText;
    }

    set TopText(val) {
        this.FTopText = val;
    }

    get BottomText() {
        return this.FBottomText;
    }

    set BottomText(val) {
        this.FBottomText = val;
    }
}