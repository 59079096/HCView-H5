import { THCResizeRectItem } from "./HCRectItem.js";
import { THCStyle } from "./HCStyle.js";
import { HC } from "./HCCommon.js";
import { THCCode128 } from "./HCCode128.js";

export class THCBarCodeItem extends THCResizeRectItem {
    constructor(ownerData, text) {
        super(ownerData);
        this.StyleNo = THCStyle.BarCode;
        this.FCode128 = new THCCode128(text);
        this.FCode128.onWidthChanged = () => {
            this.Width = this.FCode128.Width;
        }
        this.Width = this.FCode128.Width;
        this.Height = 100;
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        this.FCode128.PaintTo(hclCanvas, drawRect);
        super.DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
    }

    GetText() {
        return this.FCode128.FText;
    }

    SetText(val) {
        this.FCode128.Text = val;
    }

    SetWidth(val) {
        super.SetWidth(this.FCode128.Width);
    }

    SetHeight(val) {
        super.SetHeight(val);
        this.FCode128.Height = this.Height;
    }

    Assign(source) {
        super.Assign(source);
        this.FCode128.Text = source.Text;
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        HC.HCSaveTextToStream(stream, this.FCode128.Text);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        this.FCode128.Text = HC.HCLoadTextFromStream(stream, fileVersion);
    }

    ToXml(node) {
        super.ToXml(node);
        //node.InnerText = this.FCode128.Text;
    }

    ParseXml(node) {
        super.ParseXml(node);
        //this.FCode128.Text = node.InnerText;
    }

    RestrainSize(width, height) {
        if (this.Height != height)
            this.Height = height;
    }
}