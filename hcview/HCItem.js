import { TEnumSet, TList, TObject, TPoint, TSize, system } from "../hcl/System.js";
import { THCStyle } from "./HCStyle.js";

export class TScaleInfo {
    constructor() {
        this.mapMode = 0;
        this.windowOrg = new TPoint();
        this.windowExt = new TSize();
        this.viewportOrg = new TPoint();
        this.viewportExt = new TSize();
    }
}

export var THCViewModel = {
    Film: 1,
    Page: 2
}

export var TItemOption = {
    ParaFirst: 1, 
    PageBreak: 1 << 1
}

export var TItemSelectState = {
    None: 0,
    Part: 1,
    Complate: 2
}

export class TPaintInfo {
    constructor() {
        this.FTopItems = new TList();
        this.print = false;
        this.viewMode = THCViewModel.Film;
        this.windowWidth = 0;
        this.windowHeight = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.zoom = 1;
    }

    scaleCanvas(hclCanvas) { 
        let result = new TScaleInfo();

        if ((this.scaleX == 1) && (this.scaleY == 1)) {
            result.mapMode = 0;
            return result;
        }

        return result;
    }

    restoreCanvasScale(hclCanvas, oldInfo) { }

    getScaleX(val) {
        return Math.round(val * this.scaleX);
    }

    getScaleY(val) {
        return Math.round(val * this.scaleY);
    }

    drawNoScaleLine(hclCanvas, points) {
        let vScale = hclCanvas.scaleSize;
        hclCanvas.scale(this.scaleX, this.scaleY);
        try {
            hclCanvas.drawLineByPointsDriect(points);
        } finally {
            hclCanvas.scale(vScale.x, vScale.y);
        }
    }

    get topItems() {
        return this.FTopItems;
    }
}

export class THCCustomItem extends TObject {
    constructor() {
        super();
        this.FParaNo = THCStyle.Null;
        this.FStyleNo = THCStyle.Null;
        this.FFirstDItemNo = -1;
        this.FActive = false;
        this.FVisible = true;
        this.FPrintInvisible = false;
        this.FOptions = new TEnumSet();
        this.FSelectState = TItemSelectState.None;
    }

    GetParaFirst() {
        return this.FOptions.has(TItemOption.ParaFirst);
    }

    SetParaFirst(val) {
        if (val)
            this.FOptions.add(TItemOption.ParaFirst);
        else
            this.FOptions.remove(TItemOption.ParaFirst);
    }

    GetPageBreak() {
        return this.FOptions.has(TItemOption.PageBreak);
    }

    SetPageBreak(val) {
        if (val)
            this.FOptions.add(TItemOption.PageBreak);
        else
            this.FOptions.remove(TItemOption.PageBreak);
    }

    GetSelectComplate() {
        return this.FSelectState == TItemSelectState.Complate;
    }

    GetSelectPart() {
        return this.FSelectState == TItemSelectState.Part;
    }

    GetText() {
        return "";
    }

    SetText(val) { }

    GetHyperLink() {
        return "";
    }

    SetHyperLink(val) { }

    SetActive(val) {
        this.FActive = val;
    }

    GetLength() {
        return 0;
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) { }

    Assign(source) {
        this.FStyleNo = source.StyleNo;
        this.FParaNo = source.ParaNo;
        this.FOptions.value = source.Options.value;
    }

    PaintTo(style, drawRect, pageDataDrawTop, pageDataDrawBottom, pageDataScreenTop, pageDataScreenBottom, hclCanvas, paintInfo) {
        if (paintInfo.print && this.FPrintInvisible)
            return;

        hclCanvas.save();
        try {
            this.DoPaint(style, drawRect, pageDataDrawTop, pageDataDrawBottom,
                pageDataScreenTop, pageDataScreenBottom, hclCanvas, paintInfo);
        } finally {
            hclCanvas.restore();
        }
    }

    PaintTop(hclCanvas) { }

    CanConcatItems(item) {
        return ((this.className == item.className) && (this.FStyleNo == item.StyleNo));
    }

    DisSelect() {
        this.FSelectState = TItemSelectState.None;
    }

    CanDrag() {
        return true;
    }

    KillFocus() { }

    DblClick(x, y) { }

    MouseDown(e) {
        this.Active = true;
        return this.FActive;
    }

    MouseMove(e) {
        return this.FActive;
    }

    MouseUp(e) {
        return this.FActive;
    }

    MouseEnter() { }

    MouseLeave() { }

    GetHint() {
        return "";
    }

    SelectComplate() {
        this.FSelectState = TItemSelectState.Complate;
    }

    SelectPart() {
        this.FSelectState = TItemSelectState.Part;
    }

    Selected() {
        return this.FSelectState != TItemSelectState.None;
    }

    AcceptAction(offset, restrain, action) {
        return true;
    }

    BreakByOffset(offset) {
        let vResult = this.newInstance();
        vResult.Assign(this);
        vResult.ParaFirst = false;
        return vResult;
    }

    SaveToStream(stream) {
        this.SaveToStreamRange(stream, 0, this.length);
    }

    SaveToStreamRange(stream, start, end) {
        stream.writeInt32(this.FStyleNo);
        stream.writeInt32(this.FParaNo);
        stream.writeByte(this.FOptions.value);

        let vByte = 0;
        if (this.FPrintInvisible)
            vByte = (vByte | (1 << 7));

        stream.writeByte(vByte);
    }

    LoadFromStream(stream, style, fileVersion) {
        this.FParaNo = stream.readInt32();

        if (fileVersion > 25)
            this.FOptions.value = stream.readByte();
        else
            this.ParaFirst = stream.readBoolean();

        if (fileVersion > 33) {
            let vByte = stream.readByte();
            this.FPrintInvisible = system.isOdd(vByte >> 7);
        }            
    }

    ToHtml(path) {
        return "";
    }

    ToXml(node) { }

    ParseXml(node) { }

    Undo(undoAction) { }

    Redo(redoAction) { }

    get Options() {
        return this.FOptions;
    }

    get Text() {
        return this.GetText();
    }

    set Text(val) {
        this.SetText(val);
    }

    get length() {
        return this.GetLength();
    }

    get ParaFirst() {
        return this.GetParaFirst();
    }

    set ParaFirst(val) {
        this.SetParaFirst(val);
    }

    get PageBreak() {
        return this.GetPageBreak();
    }

    set PageBreak(val) {
        this.SetPageBreak(val);
    }

    get HyperLink() {
        return this.GetHyperLink();
    }

    set HyperLink(val) {
        this.SetHyperLink(val);
    }

    get IsSelectComplate() {
        return this.GetSelectComplate();
    }

    get IsSelectPart() {
        return this.GetSelectPart();
    }

    get StyleNo() {
        return this.FStyleNo;
    }

    set StyleNo(val) {
        this.FStyleNo = val;
    }

    get ParaNo() {
        return this.FParaNo;
    }

    set ParaNo(val) {
        this.FParaNo = val;
    }

    get FirstDItemNo() {
        return this.FFirstDItemNo;
    }

    set FirstDItemNo(val) {
        this.FFirstDItemNo = val;
    }

    get Active() {
        return this.FActive;
    }

    set Active(val) {
        this.SetActive(val);
    }

    get visible() {
        return this.FVisible;
    }

    set visible(val) {
        this.FVisible = val;
    }

    get PrintInvisible() {
        return this.FPrintInvisible;
    }

    set PrintInvisible(val) {
        this.FPrintInvisible = val;
    }
}

export class THCItems extends TList { constructor() { super(); } }