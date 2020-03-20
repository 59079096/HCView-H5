import { TCursors } from "../hcl/Controls.js";
import { TBrushStyle, TPenStyle, TColor } from "../hcl/Graphics.js";
import { TPoint, TRect } from "../hcl/System.js";
import { HC, TMarkType } from "./HCCommon.js";
import { THCCustomItem } from "./HCItem.js";
import { THCStyle } from "./HCStyle.js";
import { THCItemSelfUndoAction, THCSizeUndoData, THCUndo, THCUndoList } from "./HCUndo.js";

export class THCCustomRectItem extends THCCustomItem {
    constructor(ownerData) {
        super(ownerData);
        this.FOwnerData = ownerData;
        this.FWidth = 100;
        this.FHeight = 50;
        this.ParaNo = ownerData.CurParaNo;
        this.FOnGetMainUndoList = ownerData.OnGetUndoList;
        this.FTextWrapping = false;
        this.FSizeChanged = false;
        this.FCanPageBreak = false;
        this.FMangerUndo = false;
    }

    GetWidth() {
        return this.FWidth;
    }

    SetWidth(val) {
        this.FWidth = val;
    }

    GetHeight() {
        return this.FHeight;
    }

    SetHeight(val) {
        this.FHeight = val;
    }

    DoSizeChanged() {
        this.FormatDirty();
    }

    SetSizeChanged(val) {
        if (this.FSizeChanged != val) {
            this.FSizeChanged = val;
            this.DoSizeChanged();
        }
    }

    SelfUndoListInitializate(undoList) {
        undoList.OnUndoNew = () => { return this.DoSelfUndoNew(); }
        undoList.OnUndo = (undo) => { this.DoSelfUndo(undo); }
        undoList.OnRedo = (redo) => { this.DoSelfRedo(redo); }
        undoList.OnUndoDestroy = (undo) => { this.DoSelfUndoDestroy(undo); }
    }

    SelfUndo_New() {
        let vUndoList = this.GetSelfUndoList();
        if ((vUndoList != null) && vUndoList.Enable)
            vUndoList.UndoNew();
    }

    GetSelfUndoList() {
        if (this.FOnGetMainUndoList == null)
            return null;

        let vResult = this.FOnGetMainUndoList();
        if ((vResult != null) && vResult.Enable && vResult.last.Actions.last.isClass(THCItemSelfUndoAction)) {
            let vItemAction = vResult.last.Actions.last;
            if (vItemAction.Object == null) {
                vItemAction.Object = new THCUndoList();
                this.SelfUndoListInitializate(vItemAction.Object);
            }

            vResult = vItemAction.Object;
        }

        return vResult;
    }

    DoSelfUndoDestroy(undo) {
        if (undo.Data != null) {
            undo.Data.Dispose();
            undo.Data = null;
        }
    }

    DoSelfUndoNew() {
        return new THCUndo();
    }

    DoSelfUndo(undo) { }

    DoSelfRedo(redo) { }

    static Create(ownerData, width, height) {
        let vRectItem = new THCCustomRectItem(ownerData);
        vRectItem.Width = width;
        vRectItem.Height = height;

        return vRectItem;
    }

    ApplySelectParaStyle(style, matchStyle) { }

    ApplySelectTextStyle(style, matchStyle) { }

    ApplyContentAlign(align) { }

    FormatToDrawItem(richData, itemNo) { }

    ClearFormatExtraHeight() {
        return 0;
    }

    ReFormatActiveItem() { }

    ActiveItemReAdaptEnvironment() { }

    DeleteSelected() {
        return false;
    }

    DeleteActiveDomain() {
        return false;
    }

    DeleteActiveDataItems(startNo, endNo, keepPara) { }

    SetActiveItemText(text) { }

    MarkStyleUsed(mark) { }

    SaveSelectToStream(stream) { }

    SaveSelectToText() {
        return "";
    }

    GetActiveItem() {
        return this;
    }

    GetTopLevelItem() {
        return this;
    }

    GetTopLevelDrawItem() {
        return null;
    }

    GetTopLevelDrawItemCoord() {
        return TPoint.Create(-1, -1);
    }

    GetTopLevelRectDrawItem() {
        return null;
    }

    GetTopLevelRectDrawItemCoord() {
        return TPoint.Create(-1, -1);
    }

    GetOffsetAt(x) {
        if (x <= 0)
            return HC.OffsetBefor;
        else if (x >= this.Width)
            return HC.OffsetAfter;
        else
            return HC.OffsetInner;
    }

    CoordInSelect(x, y) {
        return false;
    }

    WantKeyDown(e) {
        return false;
    }

    JustifySplit() {
        return true;
    }

    GetCaretInfo(caretInfo) { }

    CheckFormatPageBreakBefor() { }

    CheckFormatPageBreak(pageIndex, drawItemRectTop, drawItemRectBottom, pageDataFmtTop,
        pageDataFmtBottom, startSeat, breakSeat, fmtOffset, fmtHeightInc)
    {
        breakSeat = -1;
        fmtOffset = 0;
        fmtHeightInc = 0;

        if (this.FCanPageBreak) {
            breakSeat = this.Height - startSeat - (pageDataFmtBottom - drawItemRectTop);
            if (drawItemRectBottom > pageDataFmtBottom)
                fmtHeightInc = pageDataFmtBottom - drawItemRectBottom;
        } else {
            breakSeat = 0;
            if (drawItemRectBottom > pageDataFmtBottom)
                fmtOffset = pageDataFmtBottom - drawItemRectTop;
        }
    }

    InsertItem(item) {
        return false;
    }

    InsertText(text) {
        return false;
    }

    InsertGraphic(graphic, newPara) {
        return false;
    }

    InsertStream(stream, style, fileVersion) {
        return false;
    }

    KeyDown(e) {
        e.Handled = true;
    }

    KeyPress(key) {
        key = 0;
    }

    IsSelectComplateTheory() {
        return this.IsSelectComplate || this.Active;
    }

    SelectExists() {
        return false;
    }

    Search(keyword, forward, matchCase) {
        return false;
    }

    Clear() { }

    GetActiveData() {
        return null;
    }

    GetTopLevelDataAt(x, y) {
        return null;
    }

    GetTopLevelData() {
        return null;
    }

    FormatDirty() { }

    TraverseItem(traverse) { }

    SaveToBitmap(bitmap) {
        if ((this.FWidth == 0) || (this.FHeight == 0))
            return false;

        // bitmap = new Bitmap(FWidth, FHeight);
        // PaintInfo vPaintInfo = new PaintInfo();
        // vPaintInfo.print = true;
        // vPaintInfo.WindowWidth = bitmap.Width;
        // vPaintInfo.WindowHeight = bitmap.Height;
        // vPaintInfo.ScaleX = 1;
        // vPaintInfo.ScaleY = 1;
        // vPaintInfo.Zoom = 1;
        
        // using (HCCanvas vCanvas = new HCCanvas())
        // {
        //     vCanvas.Graphics = Graphics.FromImage(bitmap);
        //     vCanvas.brush.color = white;
        //     vCanvas.fillRect(new RECT(0, 0, bitmap.Width, bitmap.Height));
        //     this.DoPaint(OwnerData.Style, new RECT(0, 0, bitmap.Width, bitmap.Height),
        //         0, bitmap.Height, 0, bitmap.Height, vCanvas, vPaintInfo);
                
        //     vCanvas.Dispose();
        // }

        return true;
    }

    MouseDown(e) {
        this.Active = TRect.CreateByBounds(0, 0, this.FWidth, this.FHeight).pointInAt(e.x, e.y);
        return this.Active;
    }

    BreakByOffset(offset) {
        return null;
    }

    CanConcatItems(item) {
        return false;
    }

    Assign(source) {
        super.Assign(source);
        this.FWidth = source.Width;
        this.FHeight = source.Height;
    }

    Undo(undoAction) {
        if (undoAction.isClass(THCItemSelfUndoAction)) {
            let vUndoList = undoAction.Object;
            if (vUndoList != null)
                vUndoList.Undo();
            else
                super.Undo(undoAction);
        } else
            super.Undo(undoAction);
    }

    Redo(redoAction) {
        if (redoAction.isClass(THCItemSelfUndoAction)) {
            let vUndoList = redoAction.Object;
            if (vUndoList != null) {
                if (vUndoList.Seek < 0)
                    this.SelfUndoListInitializate(vUndoList);

                vUndoList.Redo();
            } else
                super.Redo(redoAction);
        } else
            super.Redo(redoAction);
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        stream.writeInt32(this.FWidth);
        stream.writeInt32(this.FHeight);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        this.FWidth = stream.readInt32();
        this.FHeight = stream.readInt32();
        this.FormatDirty();
    }

    ToHtml(aPath) {
        // Bitmap vBitmap = null;
        // if (!this.SaveToBitmap(ref vBitmap))
        //     return "";

        // string Result = "";
        // if (aPath != "") {
        //     if (!Directory.Exists(aPath + "images"))
        //         Directory.CreateDirectory(aPath + "images");

        //     string vFileName = OwnerData.Style.GetHtmlFileTempName() + ".bmp";
        //     vBitmap.Save(aPath + "images\\" + vFileName);

        //     Result = "<img width=\"" + FWidth.ToString() + "\" height=\"" + FHeight.ToString()
        //         + "\" src=\"images/" + vFileName + "\" alt=\"" + this.GetType().Name + "\" />";
        // } else {
        //     Result = "<img width=\"" + FWidth.ToString() + "\" height=\"" + FHeight.ToString()
        //         + "\" src=\"data:img/jpg;base64," + HC.GraphicToBase64(vBitmap, vBitmap.RawFormat) + "\" alt=\"THCImageItem\" />";
        // }

        // return Result;
    }

    ToXml(aNode) {
        // super.ToXml(aNode);
        // aNode.SetAttribute("width", FWidth.ToString());
        // aNode.SetAttribute("height", FHeight.ToString());
    }

    ParseXml(aNode) {
        // super.ParseXml(aNode);
        // FWidth = int.Parse(aNode.Attributes["width"].Value);
        // FHeight = int.Parse(aNode.Attributes["height"].Value);
    }

    GetLength() {
        return 1;
    }

    get Width() {
        return this.GetWidth();
    }

    set Width(val) {
        this.SetWidth(val);
    }

    get Height() {
        return this.GetHeight();
    }

    set Height(val) {
        this.SetHeight(val);
    }

    get TextWrapping() {
        return this.FTextWrapping;
    }

    set TextWrapping(val) {
        this.FTextWrapping = val;
    }

    get SizeChanged() {
        return this.FSizeChanged;
    }

    set SizeChanged(val) {
        this.SetSizeChanged(val);
    }

    get CanPageBreak() {
        return this.FCanPageBreak;
    }

    set CanPageBreak(val) {
        this.FCanPageBreak = val;
    }

    get OwnerData() {
        return this.FOwnerData;
    }

    get MangerUndo() {
        return this.FMangerUndo;
    }
}

export class THCDomainItem extends THCCustomRectItem {
    constructor(ownerData) {
        super(ownerData);
        this.FMarkType = TMarkType.Beg;
        this.StyleNo = THCStyle.Domain;
        this.FLevel = 0;
        this.Width = 0;
        this.Height = ownerData.Style.TextStyles[0].FontHeight;
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom,
        hclCanvas, paintInfo)
    {
        super.DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom,
            hclCanvas, paintInfo);

        if (!paintInfo.print) {
            if (this.FMarkType == TMarkType.Beg) {
                hclCanvas.pen.width = 1;
                hclCanvas.pen.style = TPenStyle.Solid;
                hclCanvas.pen.color = TColor.Blue;
                hclCanvas.drawLineByPointsDriect(new Array(
                    TPoint.Create(drawRect.left + 2, drawRect.top - 1),
                    TPoint.Create(drawRect.left, drawRect.top - 1),
                    TPoint.Create(drawRect.left, drawRect.bottom + 1),
                    TPoint.Create(drawRect.left + 2, drawRect.bottom + 1)));
            } else {
                    hclCanvas.pen.width = 1;
                    hclCanvas.pen.style = TPenStyle.Solid;
                    hclCanvas.pen.color = TColor.Blue;

                hclCanvas.drawLineByPointsDriect(new Array(
                    TPoint.Create(drawRect.right - 2, drawRect.top - 1),
                    TPoint.Create(drawRect.right, drawRect.top - 1),
                    TPoint.Create(drawRect.right, drawRect.bottom + 1),
                    TPoint.Create(drawRect.right - 2, drawRect.bottom + 1)));
            }
        }
    }

    IsBeginMark(item) {
        return (item.isClass(THCDomainItem)) && (item.MarkType == TMarkType.Beg);
    }

    IsEndMark(item) {
        return (item.isClass(THCDomainItem)) && (item.MarkType == TMarkType.End);
    }

    GetOffsetAt(x) {
        if ((x >= 0) && (x <= this.Width)) {
            if (this.FMarkType == TMarkType.Beg)
                return HC.OffsetAfter;
            else
                return HC.OffsetBefor;
        } else
            return super.GetOffsetAt(x);
    }

    JustifySplit() {
        return false;
    }

    FormatToDrawItem(richData, itemNo) {
        this.Width = 0;
        this.Height = richData.Style.TextStyles[0].FontHeight;
        if (this.MarkType == TMarkType.Beg) {
            if (itemNo < richData.Items.count - 1) {
                let vItem = richData.Items[itemNo + 1];
                if ((vItem.StyleNo == this.StyleNo) && (vItem.MarkType == TMarkType.End))
                    this.Width = 10;
                else if (vItem.ParaFirst)
                    this.Width = 10;
                else if (vItem.StyleNo > THCStyle.Null)
                    this.Height = richData.Style.TextStyles[vItem.StyleNo].FontHeight;
            } else
                this.Width = 10;
        } else {
            let vItem = richData.Items[itemNo - 1];
            if ((vItem.StyleNo == this.StyleNo) && (vItem.MarkType == TMarkType.Beg))
                this.Width = 10;
            else if (this.ParaFirst)
                this.Width = 10;
            else if (vItem.StyleNo > THCStyle.Null)
                this.Height = richData.Style.TextStyles[vItem.StyleNo].FontHeight;
        }
    }

    SaveToBitmap(bitmap) {
        return false;
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        stream.writeByte(this.FMarkType);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        this.FMarkType = stream.readByte();
    }

    ToXml(aNode) {
        // super.ToXml(aNode);
        // aNode.SetAttribute("mark", ((byte)FMarkType).ToString());
    }

    ParseXml(aNode) {
        // super.ParseXml(aNode);
        // FMarkType = (MarkType)byte.Parse(aNode.Attributes["mark"].Value);
    }

    get MarkType() {
        return this.FMarkType;
    }

    set MarkType(val) {
        this.FMarkType = val;
    }

    get Level() {
        return this.FLevel;
    }
        
    set Level(val) {
        this.FLevel = val;
    }
}

export class THCTextRectItem extends THCCustomRectItem {
    constructor(ownerData) {
        super(ownerData);
        this.FTextStyleNo = 0;
        if (ownerData.CurStyleNo > THCStyle.Null)
            this.FTextStyleNo = ownerData.CurStyleNo;
    }

    SetTextStyleNo(val) {
        if (this.FTextStyleNo != val)
            this.FTextStyleNo = val;
    }

    Assign(source) {
        super.Assign(source);
        this.FTextStyleNo = source.TextStyleNo;
    }

    GetOffsetAt(x) {
        if (x < this.Width / 2)
            return HC.OffsetBefor;
        else
            return HC.OffsetAfter;
    }

    JustifySplit() {
        return false;
    }

    ApplySelectTextStyle(style, matchStyle) {
        this.FTextStyleNo = matchStyle.GetMatchStyleNo(style, this.FTextStyleNo);
    }

    MarkStyleUsed(mark) {
        if (mark)
            this.OwnerData.Style.TextStyles[this.FTextStyleNo].CheckSaveUsed = true;
        else
            this.FTextStyleNo = this.OwnerData.Style.TextStyles[this.FTextStyleNo].TempNo;
    }

    SelectExists() {
        return this.GetSelectComplate();
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        stream.writeInt32(this.FTextStyleNo);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        this.FTextStyleNo = stream.readInt32();
        if ((style != null) && (this.FTextStyleNo > style.TextStyles.count - 1))
            this.FTextStyleNo = 0;
    }

    ToXml(aNode) {
        // super.ToXml(aNode);
        // aNode.SetAttribute("textsno", FTextStyleNo.ToString());
    }

    ParseXml(aNode) {
        // super.ParseXml(aNode);
        // FTextStyleNo = int.Parse(aNode.Attributes["textsno"].Value);
    }

    get TextStyleNo() {
        return this.FTextStyleNo;
    }

    set TextStyleNo(val) {
        this.SetTextStyleNo(val);
    }    
}

export class THCControlItem extends THCTextRectItem {
    constructor(ownerData) {
        super(ownerData);
        this.FAutoSize = true;
        this.FPaddingLeft = 5;
        this.FPaddingRight = 5;
        this.FPaddingTop = 5;
        this.FPaddingBottom = 5;
        this.FMinWidth = 20;
        this.FMinHeight = 10;
    }

    Assign(source) {
        super.Assign(source);
        this.FAutoSize = source.AutoSize;
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        stream.writeBoolean(this.FAutoSize);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        this.FAutoSize = stream.readBoolean();
    }

    ToXml(aNode) {
        // super.ToXml(aNode);
        // aNode.SetAttribute("autosize", FAutoSize.ToString());
    }

    ParseXml(aNode) {
        // super.ParseXml(aNode);
        // FAutoSize = bool.Parse(aNode.Attributes["autosize"].Value);
    }

    get AutoSize() {
        return this.FAutoSize;
    }

    set AutoSize(val) {
        this.FAutoSize = val;
    }    
}

var TGripType = {
    None: 0,
    LeftTop: 1,
    RightTop: 2,
    LeftBottom: 3,
    RightBottom: 4,
    Left: 5,
    Top: 6,
    Right: 7,
    Bottom: 8
}

export class THCResizeRectItem extends THCCustomRectItem {
    constructor(ownerData) {
        super(ownerData);
        this.FCanResize = true;
        this.FGripSize = 8;
        this.FResizing = false;
        this.FResizeRect = null;
        this.FResizeWidth = 0;
        this.FResizeHeight = 0;

        this.FResizeX = 0; 
        this.FResizeY = 0;
    }

    static Create(ownerData, width, height) {
        let vResizeRectItem = new THCResizeRectItem(ownerData);
        vResizeRectItem.Width = width;
        vResizeRectItem.Height = height;
        vResizeRectItem.CanResize = true;
        vResizeRectItem.GripSize = 8;

        return vResizeRectItem;
    }

    GetGripType(x, y) {
        let vPt = TPoint.Create(x, y);

        if (TRect.CreateByBounds(0, 0, this.GripSize, this.GripSize).pointIn(vPt))
            return TGripType.LeftTop;
        else if (TRect.CreateByBounds(this.Width - this.GripSize, 0, this.GripSize, this.GripSize).pointIn(vPt))
            return TGripType.RightTop;
        else if (TRect.CreateByBounds(0, this.Height - this.GripSize, this.GripSize, this.GripSize).pointIn(vPt))
            return TGripType.LeftBottom;
        else if (TRect.CreateByBounds(this.Width - this.GripSize, this.Height - this.GripSize, this.GripSize, this.GripSize).pointIn(vPt))
            return TGripType.RightBottom;
        else
            return TGripType.None;
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom,
        hclCanvas, paintInfo)
    {
        super.DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom,
            hclCanvas, paintInfo);

        if ((!paintInfo.print) && this.Active) {
            if (this.Resizing) {
                switch (this.FResizeGrip) {
                    case TGripType.LeftTop:
                        this.FResizeRect = TRect.CreateByBounds(drawRect.left + this.Width - this.FResizeWidth,
                            drawRect.top + this.Height - this.FResizeHeight, this.FResizeWidth, this.FResizeHeight);
                        break;

                    case TGripType.RightTop:
                        this.FResizeRect = TRect.CreateByBounds(drawRect.left,
                            drawRect.top + this.Height - this.FResizeHeight, this.FResizeWidth, this.FResizeHeight);
                        break;

                    case TGripType.LeftBottom:
                        this.FResizeRect = TRect.CreateByBounds(drawRect.left + this.Width - this.FResizeWidth,
                            drawRect.top, this.FResizeWidth, this.FResizeHeight);
                        break;

                    case TGripType.RightBottom:
                        this.FResizeRect = TRect.CreateByBounds(drawRect.left, drawRect.top, this.FResizeWidth, this.FResizeHeight);
                        break;
                }
            
                paintInfo.topItems.add(this);
            }

            hclCanvas.brush.color = "gray";
            hclCanvas.fillRect(TRect.CreateByBounds(drawRect.left, drawRect.top, this.GripSize, this.GripSize));
            hclCanvas.fillRect(TRect.CreateByBounds(drawRect.right - this.GripSize, drawRect.top, this.GripSize, this.GripSize));
            hclCanvas.fillRect(TRect.CreateByBounds(drawRect.left, drawRect.bottom - this.GripSize, this.GripSize, this.GripSize));
            hclCanvas.fillRect(TRect.CreateByBounds(drawRect.right - this.GripSize, drawRect.bottom - this.GripSize, this.GripSize, this.GripSize));
        }
    }

    MouseDown(e) {
        this.FResizeGrip = TGripType.None;
        let vResult = super.MouseDown(e);
        if (this.Active) {
            this.FResizeGrip = this.GetGripType(e.x, e.y);
            this.FResizing = this.FResizeGrip != TGripType.None;

            if (this.FResizing) {
                this.FResizeX = e.x;
                this.FResizeY = e.y;
                this.FResizeWidth = this.Width;
                this.FResizeHeight = this.Height;
            }
        }

        return vResult;
    }

    SelfUndo_Resize(newWidth, newHeight) {
        let vUndoList = this.GetSelfUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            this.SelfUndo_New();
            let vUndo = vUndoList.last;
            if (vUndo != null) {
                let vSizeUndoData = new THCSizeUndoData();
                vSizeUndoData.OldWidth = this.Width;
                vSizeUndoData.OldHeight = this.Height;
                vSizeUndoData.NewWidth = newWidth;
                vSizeUndoData.NewHeight = newHeight;

                vUndo.Data = vSizeUndoData;
            }
        }
    }

    DoSelfUndoDestroy(undo) {
        if ((undo.Data != null) && (undo.Data.isClass(THCSizeUndoData))) {
            undo.Data.Dispose();
            undo.Data = null;
        }

        super.DoSelfUndoDestroy(undo);
    }

    DoSelfUndo(undo) {
        if (undo.Data.isClass(THCSizeUndoData)) {
            let vSizeAction = undo.Data;
            this.Width = vSizeAction.OldWidth;
            this.Height = vSizeAction.OldHeight;
        } else
            super.DoSelfUndo(undo);
    }

    DoSelfRedo(redo) {
        if (redo.Data.isClass(THCSizeUndoData)) {
            let vSizeAction = redo.Data;
            this.Width = vSizeAction.NewWidth;
            this.Height = vSizeAction.NewHeight;
        } else
            super.DoSelfRedo(redo);
    }

    GetResizing() {
        return this.FResizing;
    }

    SetResizing(val) {
        if (this.FResizing != val)
            this.FResizing = val;
    }

    get ResizeGrip() {
        return this.FResizeGrip;
    }

    get ResizeRect() {
        return this.FResizeRect;
    }

    CoordInSelect(x, y) {
        return this.SelectExists() && TRect.CreateByBounds(0, 0, this.Width, this.Height).pointInAt(x, y) && (this.GetGripType(x, y) == TGripType.None);
    }

    PaintTop(hclCanvas) {
        super.PaintTop(hclCanvas);
        if (this.FResizing) {
            hclCanvas.brush.style = TBrushStyle.Clear;
            hclCanvas.rectangleRect(this.FResizeRect);
            hclCanvas.brush.color = TColor.White;
            hclCanvas.font.size = 8;
            hclCanvas.font.color = TColor.Black;
            hclCanvas.font.styles.value = 0;
            hclCanvas.textOut(this.FResizeRect.left + 2, this.FResizeRect.top + 2,
                this.FResizeWidth + ' x ' + this.FResizeHeight);
        }
    }

    MouseMove(e) {
        let vResult = super.MouseMove(e);
        HC.GCursor = TCursors.Default;
        if (this.Active) {
            let vW = 0, vH = 0, vTempW = 0, vTempH = 0;
            let vBL = 0;
            if (this.FResizing) {
                vBL = this.Width / this.Height;
                vW = e.x - this.FResizeX;
                vH = e.y - this.FResizeY;

                switch (this.FResizeGrip) {
                    case TGripType.LeftTop:
                        vTempW = Math.round(vH * vBL);
                        vTempH = Math.round(vW / vBL);
                        if (vTempW > vW)
                            vH = vTempH;
                        else
                            vW = vTempW;
                        
                        this.FResizeWidth = this.Width - vW;
                        this.FResizeHeight = this.Height - vH;
                        break;
                    
                    case TGripType.RightTop:
                        vTempW = Math.abs(Math.round(vH * vBL));
                        vTempH = Math.abs(Math.round(vW / vBL));
                    
                        if (vW < 0) {
                            if (vH > vTempH)
                                vH = vTempH;
                            else if (vH > 0)
                                vW = -vTempW;
                            else
                                vW = vTempW;
                        } else {
                            if (-vH < vTempH)
                                vH = -vTempH;
                            else
                                vW = vTempW;
                        }

                        this.FResizeWidth = this.Width + vW;
                        this.FResizeHeight = this.Height - vH;
                        break;
                
                    case TGripType.LeftBottom:
                        vTempW = Math.abs(Math.round(vH * vBL));
                        vTempH = Math.abs(Math.round(vW / vBL));
                        
                        if (vW < 0) {
                            if (vH < vTempH)
                                vH = vTempH;
                            else
                                vW = -vTempW;
                        } else {
                            if ((vW > vTempW) || (vH > vTempH)) {
                                if (vH < 0)
                                    vW = vTempW;
                                else
                                    vW = -vTempW;
                            } else
                                vH = -vTempH;
                        }

                        this.FResizeWidth = this.Width - vW;
                        this.FResizeHeight = this.Height + vH;
                        break;
                
                    case TGripType.RightBottom:
                        vTempW = Math.round(vH * vBL);
                        vTempH = Math.round(vW / vBL);
                        if (vTempW > vW)
                            vW = vTempW;
                        else
                            vH = vTempH;
                    
                        this.FResizeWidth = this.Width + vW;
                        this.FResizeHeight = this.Height + vH;
                        break;
                }
            } else {
                switch (this.GetGripType(e.x, e.y)) {
                    case TGripType.LeftTop:
                    case TGripType.RightBottom:
                        HC.GCursor = TCursors.SizeNWSE;
                        break;
                    
                    case TGripType.RightTop:
                    case TGripType.LeftBottom:
                        HC.GCursor = TCursors.SizeNESW;
                        break;

                    case TGripType.Left:
                    case TGripType.Right:
                        HC.GCursor = TCursors.SizeWE;
                        break;

                    case TGripType.Top:
                    case TGripType.Bottom:
                        HC.GCursor = TCursors.SizeNS;
                        break;
                }
            }
        }

        return vResult;
    }

    MouseUp(e) {
        let vResult = super.MouseUp(e);
        if (this.FResizing) {
            if ((this.FResizeWidth < 0) || (this.FResizeHeight < 0)) {
                this.FResizing = false;
                return vResult;
            }

            this.SelfUndo_Resize(this.FResizeWidth, this.FResizeHeight);
            this.Width = this.FResizeWidth;
            this.Height = this.FResizeHeight;
            this.FResizing = false;
        }

        return vResult;
    }

    CanDrag() {
        return !this.FResizing;
    }

    GetCaretInfo(caretInfo) {
        if (this.Active)
            caretInfo.Visible = false;
    }

    SelectExists() {
        return this.IsSelectComplateTheory();
    }

    RestrainSize(width, height) { }

    get GripSize() {
        return this.FGripSize;
    }

    set GripSize(val) {
        this.FGripSize = val;
    }

    get Resizing() {
        return this.GetResizing();
    }

    set Resizing(val) {
        this.SetResizing(val);
    }

    get ResizeWidth() {
        return this.FResizeWidth;
    }

    get ResizeHeight() {
        return this.FResizeHeight;
    }

    get CanResize() {
        return this.FCanResize;
    }

    set CanResize(val) {
        this.FCanResize = val;
    }    
}

export class THCAnimateRectItem extends THCCustomRectItem {
    constructor(ownerData) {
        super(ownerData);
    }

    GetOffsetAt(x) {
        if (x < this.Width / 2)
            return HC.OffsetBefor;
        else
            return HC.OffsetAfter;
    }
}

export class THCDataItem extends THCResizeRectItem {
    constructor(ownerData) {
        super(ownerData);
    }
}

THCDomainItem.HCDefaultDomainItemClass = THCDomainItem;