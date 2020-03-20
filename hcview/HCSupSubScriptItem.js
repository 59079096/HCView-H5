import { THCTextRectItem } from "./HCRectItem.js";
import { THCStyle } from "./HCStyle.js";
import { TExpressArea, HC } from "./HCCommon.js";
import { TRect } from "../hcl/System.js";
import { TBrushStyle, TColor } from "../hcl/Graphics.js";
import { THCFontStyle } from "./HCTextStyle.js";
import { TMouseButton, TKey } from "../hcl/Controls.js";

export class THCSupSubScriptItem extends THCTextRectItem {
    constructor(ownerData, supText, subText) {
        super(ownerData);
        this.StyleNo = THCStyle.SupSubScript;
        this.FPadding = 1;
        this.FActiveArea = TExpressArea.None;
        this.FMouseMoveArea = TExpressArea.None;
        this.FCaretOffset = -1;
        this.FSupText = supText;
        this.FSubText = subText;
        this.FSupRect = new TRect();
        this.FSubRect = new TRect();
        this.FMouseLBDowning = false;
        this.FOutSelectInto = false;
    }

    ApplySupSubStyle(textStyle, hclCanvas) {
        if (textStyle.BackColor == HC.HCTransparentColor)
            hclCanvas.brush.style = TBrushStyle.Clear;
        else
            hclCanvas.brush.color = textStyle.BackColor;
        
        hclCanvas.font.color = textStyle.Color;
        hclCanvas.font.name = textStyle.Family;
        hclCanvas.font.size = Math.round(textStyle.Size * 2 / 3);
        if (textStyle.FontStyles.has(THCFontStyle.Bold))
            hclCanvas.font.styles.add(THCFontStyle.Bold);
        else
            hclCanvas.font.styles.remove(THCFontStyle.Bold);
    
        if (textStyle.FontStyles.has(THCFontStyle.Italic))
            hclCanvas.font.styles.add(THCFontStyle.Italic);
        else
            hclCanvas.font.styles.remove(THCFontStyle.Italic);
    
        if (textStyle.FontStyles.has(THCFontStyle.Underline))
            hclCanvas.font.styles.add(THCFontStyle.Underline);
        else
            hclCanvas.font.styles.remove(THCFontStyle.Underline);
    
        if (textStyle.FontStyles.has(THCFontStyle.StrikeOut))
            hclCanvas.font.styles.add(THCFontStyle.StrikeOut);
        else
            hclCanvas.font.styles.remove(THCFontStyle.StrikeOut);
    }

    FormatToDrawItem(richData, itemNo) {
        let vStyle = richData.Style;
        this.ApplySupSubStyle(vStyle.TextStyles[this.TextStyleNo], vStyle.TempCanvas);
        let vH = vStyle.TempCanvas.textHeight("H");
        let vTopW = Math.max(vStyle.TempCanvas.textWidth(this.FSupText), this.FPadding);
        let vBottomW = Math.max(vStyle.TempCanvas.textWidth(this.FSubText), this.FPadding);

        if (vTopW > vBottomW)
            this.Width = vTopW + 4 * this.FPadding;
        else
            this.Width = vBottomW + 4 * this.FPadding;

        this.Height = vH * 2 + 4 * this.FPadding;

        this.FSupRect.resetBounds(this.FPadding, this.FPadding, vTopW, vH);
        this.FSubRect.resetBounds(this.FPadding, this.Height - this.FPadding - vH, vBottomW, vH);
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        if (this.Active && (!paintInfo.Print)) {
            hclCanvas.brush.color = HC.clBtnFace;
            hclCanvas.fillRect(drawRect);
        }
                  
        if (!paintInfo.Print) {
            let vFocusRect = new TRect();
            if (this.FActiveArea != TExpressArea.None) {
                if (this.FActiveArea == TExpressArea.Top)
                    vFocusRect.resetRect(this.FSupRect);
                else if (this.FActiveArea == TExpressArea.Bottom)
                    vFocusRect.resetRect(this.FSubRect);
            
                vFocusRect.offset(drawRect.left, drawRect.top);
                vFocusRect.inFlate(2, 2);
                hclCanvas.pen.color = TColor.Blue;
                hclCanvas.rectangleRect(vFocusRect);
            }
        
            if ((this.FMouseMoveArea != TExpressArea.None) && (this.FMouseMoveArea != this.FActiveArea)) {
                if (this.FMouseMoveArea == TExpressArea.Top)
                    vFocusRect.resetRect(this.FSupRect);
                else if (this.FMouseMoveArea == TExpressArea.Bottom)
                    vFocusRect.resetRect(this.FSubRect);
            
                vFocusRect.offset(drawRect.left, drawRect.top);
                vFocusRect.inFlate(2, 2);
                hclCanvas.pen.color = HC.clMedGray;
                hclCanvas.rectangleRect(vFocusRect);
            }
        }

        this.ApplySupSubStyle(style.TextStyles[this.TextStyleNo], hclCanvas, paintInfo.ScaleY / paintInfo.Zoom);
        hclCanvas.textOut(drawRect.left + this.FSupRect.left, drawRect.top + this.FSupRect.top, this.FSupText);
        hclCanvas.textOut(drawRect.left + this.FSubRect.left, drawRect.top + this.FSubRect.top, this.FSubText);
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
            vS = this.FSupText;
            vX = e.x - this.FSupRect.left;
        } else if (this.FActiveArea == TExpressArea.Bottom) {
            vS = this.FSubText;
            vX = e.x - this.FSubRect.left;
        }
        
        let vOffset = 0;
        if (this.FActiveArea != TExpressArea.None) {
            this.ApplySupSubStyle(this.OwnerData.Style.TextStyles[this.TextStyleNo], this.OwnerData.Style.TempCanvas);
            vOffset = HC.GetNorAlignCharOffsetAt(this.OwnerData.Style.TempCanvas, vS, vX);
        } else
            vOffset = -1;
        
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

    KeyDown(e) {
        switch (e.keyCode) {
            case TKey.Back:
                if (this.FActiveArea == TExpressArea.Top) {
                    if (this.FCaretOffset > 0) {
                        this.FSupText = this.FSupText.remove(this.FCaretOffset - 1, 1);
                        this.FCaretOffset--;
                    }
                } else if (this.FActiveArea == TExpressArea.Bottom) {
                        if (this.FCaretOffset > 0) {
                            this.FSubText = this.FSubText.remove(this.FCaretOffset - 1, 1);
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
                        vS = this.FSupText;
                    else if (this.FActiveArea == TExpressArea.Bottom)
                        vS = this.FSubText;

                    if (this.FCaretOffset < vS.length)
                        this.FCaretOffset--;
                }
                break;

            case TKey.Delete:
                if (this.FActiveArea == TExpressArea.Top) {
                    if (this.FCaretOffset < this.FSupText.length)
                        this.FSupText = this.FSupText.remove(this.FCaretOffset, 1);
                } else if (this.FActiveArea == TExpressArea.Bottom) {
                        if (this.FCaretOffset < this.FSubText.length)
                            this.FSubText = this.FSubText.remove(this.FCaretOffset, 1);
                }

                this.SizeChanged = true;
                break;

            case TKey.Home:
                this.FCaretOffset = 0;
                break;

            case TKey.End:
                if (this.FActiveArea == TExpressArea.Top)
                    this.FCaretOffset = this.FSupText.length;
                else if (this.FActiveArea == TExpressArea.Bottom)
                    this.FCaretOffset = this.FSubText.length;
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
                this.FSupText = this.FSupText.insert(this.FCaretOffset, text);
            else if (this.FActiveArea == TExpressArea.Bottom)
                this.FSubText = this.FSubText.insert(this.FCaretOffset, text);

            this.FCaretOffset += text.length;
            this.SizeChanged = true;
            return true;
        } else
            return false;
    }

    GetCaretInfo(caretInfo) {
        if (this.FActiveArea != TExpressArea.None) {
            this.ApplySupSubStyle(this.OwnerData.Style.TextStyles[this.TextStyleNo], this.OwnerData.Style.TempCanvas);
            if (this.FActiveArea == TExpressArea.Top) {
                caretInfo.height = this.FSupRect.bottom - this.FSupRect.top;
                caretInfo.x = this.FSupRect.left + this.OwnerData.Style.TempCanvas.textWidth(this.FSupText.substr(0, this.FCaretOffset));
                caretInfo.y = this.FSupRect.top;
            } else if (this.FActiveArea == TExpressArea.Bottom) {
                caretInfo.height = this.FSubRect.bottom - this.FSubRect.top;
                caretInfo.x = this.FSubRect.left + this.OwnerData.Style.TempCanvas.textWidth(this.FSubText.substr(0, this.FCaretOffset));
                caretInfo.y = this.FSubRect.top;
            }
        } else
            caretInfo.visible = false;
    }

    GetExpressArea(x, y) {
        let vResult = TExpressArea.None;
        if (this.FSupRect.pointInAt(x, y))
            vResult = TExpressArea.Top;
        else if (this.FSubRect.pointInAt(x, y))
            vResult = TExpressArea.Bottom;

        return vResult;
    }

    get SupRect() {
        return this.FSupRect;
    }

    set SupRect(val) {
        this.FSupRect = val;
    }

    get SubRect() {
        return this.FSubRect;
    }

    set SubRect(val) {
        this.FSubRect = val;
    }

    Assign(source) {
        super.Assign(source);
        this.FSupText = source.SupText;
        this.FSubText = source.SubText;
    }

    WantKeyDown(e) {
        return true;
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        HC.HCSaveTextToStream(stream, this.FSupText);
        HC.HCSaveTextToStream(stream, this.FSubText);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        this.FSupText = HC.HCLoadTextFromStream(stream, fileVersion);
        this.FSubText = HC.HCLoadTextFromStream(stream, fileVersion);
    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }

    get SupText() {
        return this.FSupText;
    }

    set SupText(val) {
        this.FSupText = val;
    }

    get SubText() {
        return this.FSubText;
    }

    set SubText(val) {
        this.FSubText = val;
    }
}