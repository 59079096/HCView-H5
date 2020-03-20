import { THCCustomRectItem } from "./HCRectItem.js";
import { THCStyle } from "./HCStyle.js";
import { TPenStyle, TColor } from "../hcl/Graphics.js";
import { HC } from "./HCCommon.js";

export class THCLineItem extends THCCustomRectItem {
    constructor(ownerData, width, height) {
        super(ownerData);
        this.StyleNo = THCStyle.Line;
        this.FLineHeight = 1;
        this.Width = width;
        this.Height = height;
        this.FLineStyle = TPenStyle.Solid;      
    }

    GetOffsetAt(x) {
        if (x < this.Width / 2)
            return HC.OffsetBefor;
        else
            return HC.OffsetAfter;
    }

    FormatToDrawItem(richData, itemNo) {
        this.Width = richData.width;
        this.Height = this.FLineHeight;
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        hclCanvas.pen.width = this.FLineHeight;
        hclCanvas.pen.style = this.FLineStyle;
        hclCanvas.pen.color = TColor.Black;
        let vTop = Math.trunc((drawRect.top + drawRect.bottom) / 2);
        hclCanvas.drawLineDriect(drawRect.left, vTop, drawRect.right, vTop);
    }

    Assign(source) {
        super.Assign(source);
        this.FLineHeight = source.LineHeight;
        this.FLineStyle = source.FLineStyle;
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        stream.writeByte(this.FLineHeight);
        stream.writeByte(this.FLineStyle);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        this.FLineHeight = stream.readByte();
        this.FLineStyle = stream.readByte();
    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }

    get LineStyle() {
        return this.FLineStyle;
    }

    set LineStyle(val) {
        this.FLineStyle = val;
    }

    get LineHeight() {
        return this.FLineHeight;
    }

    set LineHeight(val) {
        this.FLineHeight = val;
    }
}