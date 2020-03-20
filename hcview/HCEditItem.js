import { THCControlItem } from "./HCRectItem.js";
import { THCBorderSides, TBorderSide, HC, THCState } from "./HCCommon.js";
import { THCStyle } from "./HCStyle.js";
import { TRect, system } from "../hcl/System.js";
import { TColor, TPenStyle } from "../hcl/Graphics.js";
import { TKey, TMouseButton } from "../hcl/Controls.js";
import { clipboard } from "../hcl/Clipboard.js";

export class THCEditItem extends THCControlItem {
    constructor(ownerData, text) {
        super(ownerData);
        this.StyleNo = THCStyle.Edit;
        this.FText = text;
        this.FBorderWidth = 1;
        this.FMouseIn = false;
        this.FReadOnly = false;
        this.FPrintOnlyText = false;
        this.FCaretOffset = -1;
        this.FSelEnd = -1;
        this.FSelMove = -1;
        this.FLeftOffset = 0;
        this.FPaddingLeft = 4;
        this.FPaddingRight = 4;
        this.FPaddingTop = 4;
        this.FPaddingBottom = 4;
        this.Width = 50;
        this.FTextSize = null;
        this.FBorderSides = new THCBorderSides();
        this.FBorderSides.add(TBorderSide.Left);
        this.FBorderSides.add(TBorderSide.Top);
        this.FBorderSides.add(TBorderSide.Right);
        this.FBorderSides.add(TBorderSide.Bottom);
    }

    CalcTextSize() {
        this.OwnerData.Style.ApplyTempStyle(this.TextStyleNo);
        if (this.FText != "")
            this.FTextSize = this.OwnerData.Style.TempCanvas.textMetric(this.FText);
        else
            this.FTextSize = this.OwnerData.Style.TempCanvas.textMetric("H");
    }

    ScrollAdjust(offset) {
        if (this.AutoSize) {
            this.FLeftOffset = 0;
            return;
        }

        if (this.FTextSize.width + this.FPaddingLeft <= this.Width - this.FPaddingRight) {
            this.FLeftOffset = 0;
            return;
        }

        if (this.FTextSize.width + this.FPaddingLeft - this.FLeftOffset < this.Width - this.FPaddingRight) {
            this.FLeftOffset = this.FLeftOffset - (this.Width - this.FPaddingLeft - this.FTextSize.width + this.FLeftOffset - this.FPaddingRight);
            return;
        }

        this.OwnerData.Style.ApplyTempStyle(this.TextStyleNo);
        let vText = this.FText.substr(0, offset);
        let vRight = this.OwnerData.Style.TempCanvas.textWidth(vText) + this.FPaddingLeft - this.FLeftOffset;
        if (vRight > this.Width - this.FPaddingRight)
            this.FLeftOffset = this.FLeftOffset + vRight - this.Width + this.FPaddingRight;
        else if (vRight < 0)
            this.FLeftOffset = this.FLeftOffset + vRight;
    }

    GetCharDrawLeft(offset) {
        let vResult = 0;
        if (offset > 0) {
            if (offset == this.FText.length)
                vResult = this.Width;
            else {
                this.OwnerData.Style.ApplyTempStyle(this.TextStyleNo);
                vResult = this.FPaddingLeft + this.OwnerData.Style.TempCanvas.textWidth(this.FText.substr(0, offset)) - this.FLeftOffset;
            }
        }

        return vResult;
    }

    OffsetInSelect(offset) {
        return (offset >= this.FCaretOffset) && (offset <= this.FSelEnd);
    }

    SelectTextExists() {
        return (this.FSelEnd >= 0) && (this.FSelEnd != this.FCaretOffset);
    }

    DeleteSelectText() {
        this.FText = this.FText.delete(this.FCaretOffset, this.FSelEnd - this.FCaretOffset);
        this.FSelEnd = -1;
        this.FSelMove = this.FCaretOffset;
        this.CalcTextSize();
    }

    DisSelectText() {
        this.FSelMove = this.FCaretOffset;
        if (this.SelectTextExists())
            this.FSelEnd = -1;
    }

    FormatToDrawItem(data, itemno) {
        this.CalcTextSize();

        if (this.AutoSize) {
            this.Width = this.FPaddingLeft + this.FTextSize.width + this.FPaddingRight;
            this.Height = this.FPaddingTop + this.FTextSize.height + this.FPaddingBottom;
        }
        
        if (this.Width < this.FMinWidth)
            this.Width = this.FMinWidth;

        if (this.Height < this.FMinHeight)
            this.Height = this.FMinHeight;
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, 
        dataScreenTop, dataScreenBottom, hclCanvas, paintInfo)
    {
        super.DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop,
            dataScreenBottom, hclCanvas, paintInfo);
        
            if (!paintInfo.print) {
                if (this.IsSelectComplate) {
                    hclCanvas.brush.color = style.SelColor;
                    hclCanvas.fillRect(drawRect);
                } else if (this.SelectTextExists()) {
                    hclCanvas.brush.color = style.SelColor;
                    let vLeft = this.GetCharDrawLeft(this.FCaretOffset);
                    let vRight = this.GetCharDrawLeft(this.FSelEnd);
                    vLeft = Math.max(0, Math.min(vLeft, this.Width));
                    vRight = Math.max(0, Math.min(vRight, this.Width));
                    hclCanvas.fillRect(TRect.Create(drawRect.left + vLeft, drawRect.top, drawRect.left + vRight, drawRect.bottom));
                }
            }

        style.TextStyles[this.TextStyleNo].ApplyStyle(hclCanvas, paintInfo.ScaleY / paintInfo.Zoom);

        if (!this.AutoSize)
            hclCanvas.textRect(drawRect, drawRect.left + this.FPaddingLeft - this.FLeftOffset, drawRect.top + this.FPaddingTop, this.FText);
        else
            hclCanvas.textOut(drawRect.left + this.FPaddingLeft, drawRect.top + this.FPaddingTop, this.FText);

        if (paintInfo.print && this.FPrintOnlyText)
            return;

        if (this.FBorderSides.value > 0) {
            if (this.FMouseIn || this.Active)
                hclCanvas.pen.color = TColor.Blue;
            else
                hclCanvas.pen.color = TColor.Black;

            hclCanvas.pen.width = this.FBorderWidth;
            hclCanvas.pen.style = TPenStyle.Solid;

            hclCanvas.beginPath();
            try {
                if (this.FBorderSides.has(TBorderSide.Left))
                    hclCanvas.drawLine(drawRect.left, drawRect.top, drawRect.left, drawRect.bottom);

                if (this.FBorderSides.has(TBorderSide.Top))
                    hclCanvas.drawLine(drawRect.left, drawRect.top, drawRect.right, drawRect.top);

                if (this.FBorderSides.has(TBorderSide.Right))
                    hclCanvas.drawLine(drawRect.right - 1, drawRect.top, drawRect.right - 1, drawRect.bottom);

                if (this.FBorderSides.has(TBorderSide.Bottom))
                    hclCanvas.drawLine(drawRect.left, drawRect.bottom - 1, drawRect.right, drawRect.bottom - 1);
            } finally {
                hclCanvas.paintPath();
            }
        }
    }

    GetOffsetAt(x) {
        if (x <= this.FPaddingLeft)
            return HC.OffsetBefor;
        else if (x >= this.Width - this.FPaddingRight)
            return HC.OffsetAfter;
        else
            return HC.OffsetInner;
    }

    SetActive(val) {
        super.SetActive(val);
        if (!val) {
            this.DisSelectText();
            this.FLeftOffset = 0;
            this.FCaretOffset = -1;
        }
    }

    MouseEnter() {
        super.MouseEnter();
        this.FMouseIn = true;
    }

    MouseLeave() {
        super.MouseLeave();
        this.FMouseIn = false;
    }

    MouseDown(e) {
        let vResult = super.MouseDown(e);
        if (!this.Active)
            return vResult;

        this.OwnerData.Style.ApplyTempStyle(this.TextStyleNo);
        let vOffset = HC.GetNorAlignCharOffsetAt(this.OwnerData.Style.TempCanvas, this.FText, e.x - this.FPaddingLeft + this.FLeftOffset);
        if (e.button == TMouseButton.Left)
            this.DisSelectText();
        else {
            if (!this.OffsetInSelect(vOffset))
                this.DisSelectText();
            else
                return vResult;
        }

        if (vOffset != this.FCaretOffset) {
            this.FCaretOffset = vOffset;
            this.FSelMove = vOffset;
            this.ScrollAdjust(vOffset);
            this.OwnerData.Style.updateInfoReCaret();
        }

        return vResult;
    }

    MouseMove(e) {
        let vResult = super.MouseMove(e);
        if (e.button == TMouseButton.Left) {
            if (e.x < 0)
                this.FLeftOffset = Math.max(0, this.FLeftOffset - this.OwnerData.Style.TextStyles[this.TextStyleNo].TextMetric_tmAveCharWidth);
            else if (e.x > this.Width - this.FPaddingRight)
                this.FLeftOffset = Math.max(0, Math.min(this.FTextSize.width - this.Width + this.FPaddingRight, 
                    this.FLeftOffset + this.OwnerData.Style.TextStyles[this.TextStyleNo].TextMetric_tmAveCharWidth));

            this.FSelEnd = HC.GetNorAlignCharOffsetAt(this.OwnerData.Style.TempCanvas, this.FText, e.x - this.FPaddingLeft + this.FLeftOffset);
            this.FSelMove = this.FSelEnd;
            if (!this.SelectTextExists() && (this.FSelEnd >= 0)) {
                this.FSelEnd = -1;
                this.FSelMove = this.FCaretOffset;
            }

            this.ScrollAdjust(this.FSelMove);
        }

        return vResult;
    }

    MouseUp(e) {
        if ((e.button == TMouseButton.Left) && (this.FSelEnd >= 0) && (this.FSelEnd < this.FCaretOffset)) {
            let vSel = this.FCaretOffset;
            this.FCaretOffset = this.FSelEnd;
            this.FSelEnd = vSel;
        }

        return super.MouseUp(e);
    }

    WantKeyDown(e) {
        let vResult = false;

        if (e.keyCode == TKey.Left) {
            if (this.FCaretOffset == 0)
                this.FCaretOffset = -1;
            else if (this.FCaretOffset < 0) {
                this.FCaretOffset = this.FText.length;
                this.ScrollAdjust(this.FCaretOffset);
                this.OwnerData.Style.updateInfoRePaint();
                vResult = true;
            } else
                vResult = true;
        } else if (e.keyCode == TKey.Right) {
            if (this.FCaretOffset == this.FText.length)
                this.FCaretOffset = -1;
            else if (this.FCaretOffset < 0) {
                this.FCaretOffset = 0;
                this.ScrollAdjust(this.FCaretOffset);
                this.OwnerData.Style.updateInfoRePaint();
                vResult = true;
            } else
                vResult = true;
        } else
            vResult = true;

        return vResult;
    }

    KeyDown(e) {
        if (!this.FReadOnly) {
            switch (e.keyCode) {
                case TKey.Back:
                    if (this.SelectTextExists())
                        this.DeleteSelectText();
                    else if (this.FCaretOffset > 0) {
                        this.FText = this.FText.remove(this.FCaretOffset - 1, 1);
                        this.FCaretOffset--;
                        this.CalcTextSize();
                    }

                    this.ScrollAdjust(this.FCaretOffset);
                    this.SizeChanged = true;
                    break;

                case TKey.Left:
                    this.DisSelectText();
                    if (this.FCaretOffset > 0)
                        this.FCaretOffset--;

                    this.ScrollAdjust(this.FCaretOffset);
                    this.OwnerData.Style.updateInfoRePaint();
                    break;

                case TKey.Right:
                    this.DisSelectText();
                    if (this.FCaretOffset < this.FText.length)
                        this.FCaretOffset++;

                    this.ScrollAdjust(this.FCaretOffset);
                    this.OwnerData.Style.updateInfoRePaint();
                    break;

                case TKey.Delete:
                    if (this.SelectTextExists())
                        this.DeleteSelectText();
                    else if (this.FCaretOffset < this.FText.length) {
                        this.FText = this.FText.remove(this.FCaretOffset, 1);
                        this.CalcTextSize();
                    }

                    this.ScrollAdjust(this.FCaretOffset);
                    this.SizeChanged = true;
                    break;

                case TKey.Home:
                    this.FCaretOffset = 0;
                    this.ScrollAdjust(this.FCaretOffset);
                    break;

                case TKey.End:
                    this.FCaretOffset = this.FText.length;
                    this.ScrollAdjust(this.FCaretOffset);
                    break;

                default:
                    super.KeyDown(e);
                    break;
            }
        } else
            super.KeyDown(e);
    }

    KeyPress(key) {
        if (!this.FReadOnly) {
            if (this.SelectTextExists())
                this.DeleteSelectText();

            this.FText = this.FText.insert(this.FCaretOffset, String.fromCharCode(key));
            this.FCaretOffset++;
            this.CalcTextSize();
            this.ScrollAdjust(this.FCaretOffset);
            this.SizeChanged = true;
        } else
            super.KeyPress(key);
    }

    InsertText(text) {
        this.FText = this.FText.insert(this.FCaretOffset, text);
        this.FCaretOffset += text.length;
        this.ScrollAdjust(this.FCaretOffset);
        this.SizeChanged = true;
        return true;
    }

    InsertStream(stream, style, fileVersion) {
        if (this.OwnerData.Style.States.contain(THCState.Pasting))
            return this.InsertText(clipboard.toString());
        else
            return false;
    }

    GetCaretInfo(caretInfo) {
        if (this.FCaretOffset < 0) {
            caretInfo.visible = false;
            return;
        }

        if (this.SelectTextExists()) {
            caretInfo.visible = false;
            return;
        }

        let vS = this.FText.substring(0, this.FCaretOffset);
        this.OwnerData.Style.ApplyTempStyle(this.TextStyleNo);
        
        if (vS != "") {
            let vSize = this.OwnerData.Style.TempCanvas.textMetric(vS);
            caretInfo.height = vSize.height;
            caretInfo.x = this.FPaddingLeft - this.FLeftOffset + vSize.width;
        } else {
            caretInfo.height = this.OwnerData.Style.TextStyles[this.TextStyleNo].FontHeight;
            caretInfo.x = this.FPaddingLeft;
        }
        
        caretInfo.y = this.FPaddingTop;

        if ((!this.AutoSize) && (caretInfo.x > this.Width))
            caretInfo.visible = false;
    }

    GetText() {
        return this.FText;
    }

    SetText(val) {
        if ((!this.FReadOnly) && (this.FText != val)) {
            this.FText = val;
            if (this.FCaretOffset > this.FText.length)
                this.FCaretOffset = 0;

            if (this.AutoSize)
                this.OwnerData.ItemRequestFormat(this);
            else
                this.OwnerData.Style.updateInfoRePaint();
        }
    }

    // public
    Assign(source) {
        super.Assign(source);
        this.FText = source.Text;
        this.FReadOnly = source.ReadOnly;
        this.FPrintOnlyText = source.PrintOnlyText;
        this.FBorderSides.Value = source.BorderSides.Value;
        this.FBorderWidth = source.BorderWidth;
    }

    Clear() {
        this.Text = "";
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        HC.HCSaveTextToStream(stream, this.FText);

        let vByte = 0;
        if (this.FReadOnly)
            vByte = (vByte | (1 << 7));

        if (this.FPrintOnlyText)
            vByte = (vByte | (1 << 6));

        stream.writeByte(vByte);

        stream.writeByte(this.FBorderSides.value);
        stream.writeByte(this.FBorderWidth);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        this.FText = HC.HCLoadTextFromStream(stream, fileVersion);

        if (fileVersion > 33) {
            let vByte = stream.readByte();
            this.FReadOnly = system.isOdd(vByte >> 7);
            this.FPrintOnlyText = system.isOdd(vByte >> 6);
        } else {
            this.FReadOnly = stream.readBoolean();
            this.FPrintOnlyText = false;
        }


        if (fileVersion > 15) {
            this.FBorderSides.Value = stream.readByte();
            this.FBorderWidth = stream.readByte();
        }
    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }

    get ReadOnly() {
        return this.FReadOnly;
    }

    set ReadOnly(val) {
        this.FReadOnly = val;
    }

    get PrintOnlyText() {
        return this.FPrintOnlyText;
    }

    set PrintOnlyText(val) {
        this.FPrintOnlyText = val;
    }

    get BorderSides() {
        return this.FBorderSides;
    }

    set BorderSides(val) {
        this.FBorderSides = val;
    }

    get BorderWidth() {
        return this.FBorderWidth;
    }

    set BorderWidth(val) {
        this.FBorderWidth = val;
    }
}