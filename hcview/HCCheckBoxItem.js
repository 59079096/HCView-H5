import { THCControlItem } from "./HCRectItem.js";
import { THCStyle } from "./HCStyle.js";
import { TRect } from "../hcl/System.js";
import { HC } from "./HCCommon.js";
import { TCursors } from "../hcl/Controls.js";
import { TBrushStyle, TPenStyle, TColor } from "../hcl/Graphics.js";

export class THCCheckBoxItem extends THCControlItem {
    constructor(ownerData, text, checked) {
        super(ownerData);
        this.StyleNo = THCStyle.CheckBox;
        this.FChecked = checked;
        this.FText = text;
        this.FMouseIn = false;
        this.FPaddingLeft = 2;
        this.FMouseIn = false;
        this.CheckBoxSize = 14;
    }

    GetBoxRect() {
        return TRect.CreateByBounds(this.FPaddingLeft, 
            Math.trunc((this.Height - this.CheckBoxSize) / 2), this.CheckBoxSize, this.CheckBoxSize);
    }

    SetChecked(val) {
        if (this.FChecked != val)
            this.FChecked = val;
    }

    GetText() {
        return this.FText;
    }

    SetText(val) {
        this.FText = val;
    }

    MouseEnter() {
        super.MouseEnter();
        this.FMouseIn = true;
    }

    MouseLeave() {
        super.MouseLeave();
        this.FMouseIn = false;
    }

    MouseMove(e) {
        HC.GCursor = TCursors.Arrow;
        return super.MouseMove(e);
    }

    MouseUp(e) {
        if (this.OwnerData.CanEdit() && this.GetBoxRect().pointInAt(e.x, e.y))
            this.Checked = !this.FChecked;

        return super.MouseUp(e);
    }

    FormatToDrawItem(richData, itemNo) {
        if (this.AutoSize) {
            richData.Style.ApplyTempStyle(this.TextStyleNo);
            let vSize = richData.Style.TempCanvas.textMetric(this.FText);
            this.Width = this.FPaddingLeft + this.CheckBoxSize + this.FPaddingLeft + vSize.width;
            this.Height = Math.max(vSize.height, this.CheckBoxSize);
        }

        if (this.Width < this.FMinWidth)
            this.Width = this.FMinWidth;

        if (this.Height < this.FMinHeight)
            this.Height = this.FMinHeight;
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        super.DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);

        if ((this.FMouseIn) && (!paintInfo.Print)) {
            hclCanvas.brush.color = HC.clBtnFace;
            hclCanvas.fillRect(drawRect);
        }

        let vBoxRect = this.GetBoxRect();
        vBoxRect.offset(drawRect.left, drawRect.top);

        if (this.IsSelectComplate && (!paintInfo.Print)) {
            hclCanvas.brush.color = style.SelColor;
            hclCanvas.fillRect(drawRect);
        }

        hclCanvas.brush.style = TBrushStyle.Clear;

        style.TextStyles[this.TextStyleNo].ApplyStyle(hclCanvas, paintInfo.ScaleY / paintInfo.Zoom);
        hclCanvas.textOut(drawRect.left + this.FPaddingLeft + this.CheckBoxSize + this.FPaddingLeft, 
            Math.trunc(drawRect.top + (this.Height - hclCanvas.textHeight("H")) / 2), 
            this.FText);

        if (this.FChecked) {
            hclCanvas.font.color = TColor.Black;
            hclCanvas.font.size = 8;
            hclCanvas.textOut(vBoxRect.left, vBoxRect.top, "√");
        }
        hclCanvas.pen.style = TPenStyle.Solid;
        if (this.FMouseIn && (!paintInfo.Print)) {
            hclCanvas.pen.color = TColor.Blue;
            hclCanvas.rectangleRect(vBoxRect);
            vBoxRect.inFlate(1, 1);
            hclCanvas.pen.color = HC.clBtnFace;
            hclCanvas.rectangleRect(vBoxRect);
        } else {
            hclCanvas.pen.color = TColor.Black;
            hclCanvas.rectangleRect(vBoxRect);
        }
    }

    Assign(source) {
        super.Assign(source);
        this.FChecked = source.Checked;
        this.FText = source.Text;
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        stream.writeBoolean(this.FChecked);
        HC.HCSaveTextToStream(stream, this.FText);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        this.FChecked = stream.readBoolean();
        this.FText = HC.HCLoadTextFromStream(stream, fileVersion);
    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }

    get Checked() {
        return this.FChecked;
    }

    set Checked(val) {
        this.FChecked = val;
    }
}