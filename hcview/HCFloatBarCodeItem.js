import { THCCustomFloatItem } from "./HCCustomFloatItem.js";
import { THCStyle } from "./HCStyle.js";
import { THCCode128 } from "./HCCode128.js";
import { HC } from "./HCCommon.js";

export class THCFloatBarCodeItem extends THCCustomFloatItem {
    constructor(ownerData) {
        super(ownerData);
        this.StyleNo = THCStyle.FloatBarCode;
        this.FAutoSize = true;
        this.FCode128 = new THCCode128("123456");
        this.FCode128.onWidthChanged = () => {
            this.doCodeWidthChanged();
        }
        this.Width = this.FCode128.Width;
        this.Height = 100;
    }

    doCodeWidthChanged() {
        this.Width = this.FCode128.Width;
    }

    GetPenWidth() {
        return this.FCode128.Zoom;
    }

    SetPenWidth(val) {
        this.FCode128.Zoom = val;
    }

    GetShowText() {
        return this.FCode128.TextVisible;
    }

    SetShowText(val) {
        this.FCode128.TextVisible = val;
    }

    GetText() {
        return this.FCode128.Text;
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

    // public
    Assign(source) {
        super.Assign(source);
        this.FCode128.Text = source.Text;
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        this.FCode128.PaintTo(hclCanvas, drawRect);
        super.DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        HC.HCSaveTextToStream(stream, this.FCode128.Text);
        stream.writeBoolean(this.FAutoSize);
        stream.writeBoolean(this.FCode128.TextVisible);
        stream.WriteByte(this.FCode128.Zoom);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        this.FCode128.Text = HC.HCLoadTextFromStream(stream, fileVersion);
        
        if (fileVersion > 34) {
            this.FAutoSize = stream.readBoolean();
            this.FCode128.TextVisible = stream.readBoolean();
            this.FCode128.Zoom = stream.readByte();
        }
    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }

    get PenWidth() {
        return this.GetPenWidth();
    }
            
    set PenWidth(val) {
        this.SetPenWidth(val);
    }

    get AutoSize() {
        return this.FAutoSize;
    }
    
    set AutoSize(val) {
        this.FAutoSize = val;
    }

    get ShowText() {
        return this.GetShowText();
    }

    set ShowText(val) {
        this.SetShowText(val);
    }
}