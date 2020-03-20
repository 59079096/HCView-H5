import { THCFractionItem } from "./HCFractionItem.js";
import { TRect } from "../hcl/System.js";
import { THCStyle } from "./HCStyle.js";
import { HC, TExpressArea } from "./HCCommon.js";
import { TColor } from "../hcl/Graphics.js";
import { TMouseButton, TKey } from "../hcl/Controls.js";

export class THCExpressItem extends THCFractionItem {
    constructor(ownerData, leftText, topText, rightText, bottomText) {
        super(ownerData, topText, bottomText);
        this.StyleNo = THCStyle.Express;
        this.FLeftText = leftText;
        this.FRightText = rightText;
        this.FLeftRect = new TRect();
        this.FRightRect = new TRect();
    }

    FormatToDrawItem(richData, itemNo) {
        let vStyle = richData.Style;
        vStyle.ApplyTempStyle(this.TextStyleNo);
        let vH = vStyle.TempCanvas.textHeight("H");
        let vLeftW = Math.max(vStyle.TempCanvas.textWidth(this.FLeftText), this.Padding);
        let vTopW = Math.max(vStyle.TempCanvas.textWidth(this.TopText), this.Padding);
        let vRightW = Math.max(vStyle.TempCanvas.textWidth(this.FRightText), this.Padding);
        let vBottomW = Math.max(vStyle.TempCanvas.textWidth(this.BottomText), this.Padding);

        if (vTopW > vBottomW)
            this.Width = vLeftW + vTopW + vRightW + 6 * this.Padding;
        else
            this.Width = vLeftW + vBottomW + vRightW + 6 * this.Padding;
        
        this.Height = vH * 2 + 4 * this.Padding;
        
        this.FLeftRect.resetBounds(this.Padding, Math.trunc((this.Height - vH) / 2), vLeftW, vH);
        this.FRightRect.resetBounds(this.Width - this.Padding - vRightW, Math.trunc((this.Height - vH) / 2), vRightW, vH);
        this.TopRect.resetBounds(this.FLeftRect.right + this.Padding + Math.trunc((this.FRightRect.left - this.Padding - (this.FLeftRect.right + this.Padding) - vTopW) / 2),
            this.Padding, vTopW, vH);
        this.BottomRect.resetBounds(this.FLeftRect.right + this.Padding + Math.trunc((this.FRightRect.left - this.Padding - (this.FLeftRect.right + this.Padding) - vBottomW) / 2),
            this.Height - this.Padding - vH, vBottomW, vH);
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        if (this.Active && (!paintInfo.Print)) {
            hclCanvas.brush.color = HC.clBtnFace;
            hclCanvas.fillRect(drawRect);
        }
        
        hclCanvas.pen.color = TColor.Black;
        hclCanvas.drawLineDriect(drawRect.left + this.FLeftRect.right + this.Padding, drawRect.top + this.TopRect.bottom + this.Padding,
            drawRect.left + this.FRightRect.left - this.Padding, drawRect.top + this.TopRect.bottom + this.Padding);
        
        if (!paintInfo.Print) {
            let vFocusRect = new TRect();

            if (this.FActiveArea != TExpressArea.None) {
                switch (this.FActiveArea) {
                    case TExpressArea.Left: 
                        vFocusRect.resetRect(this.FLeftRect);
                        break;

                    case TExpressArea.Top:
                        vFocusRect.resetRect(this.TopRect);
                        break;

                    case TExpressArea.Right: 
                        vFocusRect.resetRect(this.FRightRect);
                        break;

                    case TExpressArea.Bottom: 
                        vFocusRect.resetRect(this.BottomRect);
                        break;
                }

                vFocusRect.offset(drawRect.left, drawRect.top);
                vFocusRect.inFlate(2, 2);
                hclCanvas.pen.color = TColor.Blue;
                hclCanvas.rectangleRect(vFocusRect);
            }

            if ((this.FMouseMoveArea != TExpressArea.None) && (this.FMouseMoveArea != this.FActiveArea)) {
                switch (this.FMouseMoveArea) {
                    case TExpressArea.Left: 
                        vFocusRect.resetRect(this.FLeftRect);
                        break;

                    case TExpressArea.Top: 
                        vFocusRect.resetRect(this.TopRect);
                        break;

                    case TExpressArea.Right: 
                        vFocusRect.resetRect(this.FRightRect);
                        break;

                    case TExpressArea.Bottom: 
                        vFocusRect.resetRect(this.BottomRect);
                        break;
                }
            
                vFocusRect.offset(drawRect.left, drawRect.top);
                vFocusRect.inFlate(2, 2);
                hclCanvas.pen.color = HC.clMedGray;
                hclCanvas.rectangleRect(vFocusRect);
            }
        }

        style.TextStyles[this.TextStyleNo].ApplyStyle(hclCanvas, paintInfo.ScaleY / paintInfo.Zoom);
        hclCanvas.textOut(drawRect.left + this.FLeftRect.left, drawRect.top + this.FLeftRect.top, this.FLeftText);
        hclCanvas.textOut(drawRect.left + this.TopRect.left, drawRect.top + this.TopRect.top, this.TopText);
        hclCanvas.textOut(drawRect.left + this.FRightRect.left, drawRect.top + this.FRightRect.top, this.FRightText);
        hclCanvas.textOut(drawRect.left + this.BottomRect.left, drawRect.top + this.BottomRect.top, this.BottomText);
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
        switch (this.FActiveArea) {
            case TExpressArea.Left:
                vS = this.FLeftText;
                vX = e.x - this.FLeftRect.left;
                break;

            case TExpressArea.Top:
                vS = this.TopText;
                vX = e.x - this.TopRect.left;
                break;

            case TExpressArea.Right:
                vS = this.FRightText;
                vX = e.x - this.FRightRect.left;
                break;

            case TExpressArea.Bottom:
                vS = this.BottomText;
                vX = e.x - this.BottomRect.left;
                break;
        }

        let vOffset = 0;
        if (this.FActiveArea != TExpressArea.None) {
            this.OwnerData.Style.ApplyTempStyle(this.TextStyleNo);
            vOffset = HC.GetNorAlignCharOffsetAt(this.OwnerData.Style.TempCanvas, vS, vX);
        } else
            vOffset = -1;
        
        if (vOffset != this.FCaretOffset) {
            this.FCaretOffset = vOffset;
            this.OwnerData.Style.updateInfoReCaret();
        }

        return vResult;
    }

    KeyDown(e) {
        if ((this.FActiveArea == TExpressArea.Left) || (this.FActiveArea == TExpressArea.Right)) {
            switch (e.keyCode) {
                case TKey.Back:
                    if (this.FActiveArea == TExpressArea.Left) {
                        if (this.FCaretOffset > 0) {
                            this.FLeftText = this.FLeftText.remove(this.FCaretOffset - 1, 1);
                            this.FCaretOffset--;
                        }
                    } else {
                        if (this.FCaretOffset > 0) {
                            this.FRightText = this.FRightText.remove(this.FCaretOffset - 1, 1);
                            this.FCaretOffset--;
                        }
                    }

                    this.SizeChanged = true;
                    break;

                case TKey.Left:
                    if (this.FCaretOffset > 0)
                        this.FCaretOffset--;
                    break;

                case TKey.Right:
                    let vS = this.FRightText;
                    if (this.FActiveArea == TExpressArea.Left)
                        vS = this.FLeftText;

                    if (this.FCaretOffset < vS.length)
                        this.FCaretOffset++;
                    break;

                case TKey.Delete:
                    if (this.FActiveArea == TExpressArea.Left) {
                        if (this.FCaretOffset < this.FLeftText.length)
                            this.FLeftText = this.FLeftText.remove(this.FCaretOffset, 1);
                    } else {
                        if (this.FCaretOffset < this.FRightText.length)
                            this.FRightText = this.FRightText.remove(this.FCaretOffset, 1);
                    }

                    this.SizeChanged = true;
                    break;

                case TKey.Home:
                    this.FCaretOffset = 0;
                    break;

                case TKey.End:
                    if (this.FActiveArea == TExpressArea.Left)
                        this.FCaretOffset = this.FLeftText.length;
                    else
                        this.FCaretOffset = this.FRightText.length;

                    break;
            }
        } else
            super.KeyDown(e);
    }

    GetExpressArea(x, y) {
        let vResult = super.GetExpressArea(x, y);
        if (vResult == TExpressArea.None) {
            if (this.FLeftRect.pointInAt(x, y))
                return TExpressArea.Left;
            else if (this.FRightRect.pointInAt(x, y))
                return TExpressArea.Right;
            else
                return vResult;
        } else
            return vResult;
    }

    InsertText(text) {
        if (this.FActiveArea != TExpressArea.None) {
            switch (this.FActiveArea) {
                case TExpressArea.Left:
                    this.FLeftText = this.FLeftText.insert(this.FCaretOffset, text);
                    this.FCaretOffset += text.length;
                    this.SizeChanged = true;
                    return true;

                case TExpressArea.Right:
                    this.FRightText = this.FRightText.insert(this.FCaretOffset, text);
                    this.FCaretOffset += text.length;
                    this.SizeChanged = true;
                    return true;

                default:
                    return super.InsertText(text);
            }
        } else
            return false;
    }

    GetCaretInfo(caretInfo) {
        if (this.FActiveArea != TExpressArea.None) {
            this.OwnerData.Style.ApplyTempStyle(this.TextStyleNo);
            
            switch (this.FActiveArea) {
                case TExpressArea.Left:
                    if (this.FCaretOffset < 0)
                        this.FCaretOffset = 0;

                    caretInfo.height = this.FLeftRect.bottom - this.FLeftRect.top;
                    caretInfo.x = this.FLeftRect.left + this.OwnerData.Style.TempCanvas.textWidth(this.FLeftText.substr(0, this.FCaretOffset));
                    caretInfo.y = this.FLeftRect.top;
                    break;
            
                case TExpressArea.Top:
                    if (this.FCaretOffset < 0)
                        this.FCaretOffset = 0;

                    caretInfo.height = this.TopRect.bottom - this.TopRect.top;
                    caretInfo.x = this.TopRect.left + this.OwnerData.Style.TempCanvas.textWidth(this.TopText.substr(0, this.FCaretOffset));
                    caretInfo.y = this.TopRect.top;
                    break;
            
                case TExpressArea.Right:
                    if (this.FCaretOffset < 0)
                        this.FCaretOffset = 0;

                    caretInfo.height = this.FRightRect.bottom - this.FRightRect.top;
                    caretInfo.x = this.FRightRect.left + this.OwnerData.Style.TempCanvas.textWidth(this.FRightText.substr(0, this.FCaretOffset));
                    caretInfo.y = this.FRightRect.top;
                    break;

                case TExpressArea.Bottom:
                    if (this.FCaretOffset < 0)
                        this.FCaretOffset = 0;

                    caretInfo.height = this.BottomRect.bottom - this.BottomRect.top;
                    caretInfo.x = this.BottomRect.left + this.OwnerData.Style.TempCanvas.textWidth(this.BottomText.substr(0, this.FCaretOffset));
                    caretInfo.y = this.BottomRect.top;
                    break;
            }
        } else
            caretInfo.visible = false;
    }

    Assign(source) {
        super.Assign(source);
        this.FLeftText = source.LeftText;
        this.FRightText = source.RightText;
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        HC.HCSaveTextToStream(stream, this.FLeftText);
        HC.HCSaveTextToStream(stream, this.FRightText);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        this.FLeftText = HC.HCLoadTextFromStream(stream, fileVersion);
        this.FRightText = HC.HCLoadTextFromStream(stream, fileVersion);
    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }

    get LeftRect() {
        return this.FLeftRect;
    }

    set LeftRect(val) {
        this.FLeftRect = val;
    }

    get RightRect() {
        return this.FRightRect;
    }

    set RightRect(val) {
        this.FRightRect = val;
    }

    get LeftText() {
        return this.FLeftText;
    }

    set LeftText(val) {
        this.FLeftText = val;
    }

    get RightText() {
        return this.FRightText;
    }

    set RightText(val) {
        this.FRightText = val;
    }
}