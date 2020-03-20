import { TList, TObject, TPoint, TRect } from "../hcl/System.js";
import { HC, THCAction } from "./HCCommon.js";
import { TSelectInfo } from "./HCCustomData.js";
import { THCRichData } from "./HCRichData.js";
import { THCStyle } from "./HCStyle.js";
import { TColor } from "../hcl/Graphics.js";

export class THCDataAnnotate extends TSelectInfo {
    constructor() {
        super();
        this.ID;
        this.StartDrawItemNo;
        this.EndDrawItemNo;
        this.Title;
        this.Text;
    }

    Initialize() {
        super.Initialize();
        this.ID = -1;
    }

    CopyRange(src) {
        this.StartItemNo = src.StartItemNo;
        this.StartItemOffset = src.StartItemOffset;
        this.EndItemNo = src.EndItemNo;
        this.EndItemOffset = src.EndItemOffset;
    }

    SaveToStream(stream) {
        stream.writeInt32(this.StartItemNo);
        stream.writeInt32(this.StartItemOffset);
        stream.writeInt32(this.EndItemNo);
        stream.writeInt32(this.EndItemOffset);
        stream.writeInt32(this.FID);

        HC.HCSaveTextToStream(stream, this.FTitle);
        HC.HCSaveTextToStream(stream, this.FText);
    }

    LoadFromStream(stream, fileVersion) {
        this.StartItemNo = stream.readInt32();
        this.StartItemOffset = stream.readInt32();
        this.EndItemNo = stream.readInt32();
        this.EndItemOffset = stream.readInt32();
        this.FID = stream.readInt32();

        this.FTitle = HC.HCLoadTextFromStream(stream, fileVersion);
        this.FText = HC.HCLoadTextFromStream(stream, fileVersion);
    }
}

export class THCDataAnnotates extends TList {
    constructor() {
        super();

        this.FOnInsertAnnotate = null;
        this.FOnRemoveAnnotate = null;
        this.onAdded = (item) => { this._HCDataAnnotate_OnInsert(item); }
        this.onRemoved = (item) => { this._HCDataAnnotate_OnRemove(item); }
    }

    _HCDataAnnotate_OnInsert(item) {
        if (this.FOnInsertAnnotate != null)
            this.FOnInsertAnnotate(item);
    }

    _HCDataAnnotate_OnRemove(item) {
        if (this.FOnRemoveAnnotate != null)
            this.FOnRemoveAnnotate(item);
    }

    DeleteByID(aID) {
        for (let i = 0; i <= this.count - 1; i++) {
            if (this[i].ID == aID) {
                this.delete(i);
                break;
            }
        }
    }

    NewDataAnnotate(selectInfo, title, text) {
        let vDataAnnotate = new THCDataAnnotate();
        vDataAnnotate.CopyRange(selectInfo);
        vDataAnnotate.Title = title;
        vDataAnnotate.Text = text;
        this.add(vDataAnnotate);
        vDataAnnotate.ID = this.count - 1;
    }

    get OnInsertAnnotate() {
        return this.FOnInsertAnnotate;
    }

    set OnInsertAnnotate(val) {
        this.FOnInsertAnnotate = val;
    }

    get OnRemoveAnnotate() {
        return this.FOnRemoveAnnotate;
    }

    set OnRemoveAnnotate(val) {
        this.FOnRemoveAnnotate = val;
    }
}

export var THCAnnotateMark = {
    amFirst: 0,
    amNormal: 1,
    amLast: 2,
    amBoth: 3
}

export class THCDrawItemAnnotate extends TObject {
    constructor() {
        super();
        this.DrawRect = new TRect();
        this.Mark = THCAnnotateMark.amNormal;
        this.DataAnnotate = null;
    }

    first() {
        return (this.Mark == THCAnnotateMark.amFirst) || (this.Mark == THCAnnotateMark.amBoth);
    }

    last() {
        return (this.Mark == THCAnnotateMark.amLast) | (this.Mark == THCAnnotateMark.amBoth);
    }
}

export class THCDrawItemAnnotates extends TList {
    constructor() {
        super();
    }

    NewDrawAnnotate(rect, mark, dataAnnotate) {
        let vDrawItemAnnotate = new THCDrawItemAnnotate();
        vDrawItemAnnotate.DrawRect.resetRect(rect);
        vDrawItemAnnotate.Mark = mark;
        vDrawItemAnnotate.DataAnnotate = dataAnnotate;
        this.add(vDrawItemAnnotate);
    }
}

export class THCAnnotateData extends THCRichData {
    constructor(style) {
        super(style);
        
        this.FDataAnnotates = new THCDataAnnotates();
        this.FDataAnnotates.OnInsertAnnotate = (sender) => { this.DoInsertAnnotate(sender); }
        this.FDataAnnotates.OnRemoveAnnotate = (sender) => { this.DoRemoveAnnotate(sender); }
        this.FDrawItemAnnotates = new THCDrawItemAnnotates();
        this.FHotAnnotate = null;
        this.FActiveAnnotate = null;
        this.FOnDrawItemAnnotate = null;
        this.FOnInsertAnnotate = null;
        this.FOnRemoveAnnotate = null;
    }

    DrawItemOfAnnotate(drawItemNo, hclCanvas, drawRect) {
        if (this.FDataAnnotates.count == 0)
            return false;

        let vItemNo = this.DrawItems[drawItemNo].ItemNo;
        if (vItemNo < this.FDataAnnotates.first.StartItemNo)
            return false;

        if (vItemNo > this.FDataAnnotates.last.EndItemNo)
            return false;

        let vResult = false;
        this.FDrawItemAnnotates.clear();
        for (let i = 0; i <= this.FDataAnnotates.count - 1; i++) {
            let vDataAnnotate = this.FDataAnnotates[i];
            if (vDataAnnotate.EndItemNo < vItemNo)
                continue;

            if (vDataAnnotate.StartItemNo > vItemNo)
                break;

            if (drawItemNo == vDataAnnotate.StartDrawItemNo) {
                if (drawItemNo == vDataAnnotate.EndDrawItemNo) {
                    this.FDrawItemAnnotates.NewDrawAnnotate(
                        TRect.Create(drawRect.left + this.GetDrawItemOffsetWidth(drawItemNo, vDataAnnotate.StartItemOffset - this.DrawItems[drawItemNo].CharOffs + 1, hclCanvas),
                            drawRect.top,
                            drawRect.left + this.GetDrawItemOffsetWidth(drawItemNo, vDataAnnotate.EndItemOffset - this.DrawItems[drawItemNo].CharOffs + 1, hclCanvas),
                            drawRect.bottom),
                        THCAnnotateMark.amBoth, vDataAnnotate);
                } else {
                    this.FDrawItemAnnotates.NewDrawAnnotate(
                        TRect.Create(drawRect.left + this.GetDrawItemOffsetWidth(drawItemNo, vDataAnnotate.StartItemOffset - this.DrawItems[drawItemNo].CharOffs + 1, hclCanvas),
                            drawRect.top, drawRect.right, drawRect.bottom),
                    THCAnnotateMark.amFirst, vDataAnnotate);
                }

                vResult = true;
            } else if (drawItemNo == vDataAnnotate.EndDrawItemNo) {
                this.FDrawItemAnnotates.NewDrawAnnotate(
                    TRect.Create(drawRect.left, drawRect.top,
                        drawRect.left + this.GetDrawItemOffsetWidth(drawItemNo, vDataAnnotate.EndItemOffset - this.DrawItems[drawItemNo].CharOffs + 1, hclCanvas),
                        drawRect.bottom),
                THCAnnotateMark.amLast, vDataAnnotate);

                vResult = true;
            } else {
                this.FDrawItemAnnotates.NewDrawAnnotate(drawRect, THCAnnotateMark.amNormal, vDataAnnotate);
                vResult = true;
            }
        }

        return vResult;
    }

    CheckAnnotateRange(firstDrawItemNo, lastDrawItemNo) {
        if (firstDrawItemNo < 0)
            return;

        let vFirstNo = this.DrawItems[firstDrawItemNo].ItemNo;
        let vLastNo = this.DrawItems[lastDrawItemNo].ItemNo;

        let vDataAnnotate;
        for (let i = 0; i <= this.FDataAnnotates.count - 1; i++) {
            vDataAnnotate = this.FDataAnnotates[i];

            if (vDataAnnotate.EndItemNo < vFirstNo)  // 未进入本次查找范围
                continue;

            if (vDataAnnotate.StartItemNo > vLastNo)  // 超出本次查找的范围
                break;

            vDataAnnotate.StartDrawItemNo = this.GetDrawItemNoByOffset(vDataAnnotate.StartItemNo, vDataAnnotate.StartItemOffset);
            vDataAnnotate.EndDrawItemNo = this.GetDrawItemNoByOffset(vDataAnnotate.EndItemNo, vDataAnnotate.EndItemOffset);
            if (vDataAnnotate.EndItemOffset == this.DrawItems[vDataAnnotate.EndDrawItemNo].CharOffs)
                vDataAnnotate.EndDrawItemNo = vDataAnnotate.EndDrawItemNo - 1;
        }
    }

    GetDrawItemFirstDataAnnotateAt(drawItemNo, x, y) {
        let vResult = null;

        let vStyleNo = this.GetDrawItemStyle(drawItemNo);
        if (vStyleNo > THCStyle.Null)
            this.Style.ApplyTempStyle(vStyleNo);

        if (this.DrawItemOfAnnotate(drawItemNo, this.Style.TempCanvas, this.DrawItems[drawItemNo].rect)) {
            let vPt = TPoint.Create(x, y);
            for (let i = 0; i <= this.FDrawItemAnnotates.count - 1; i++) {
                if (this.FDrawItemAnnotates[i].DrawRect.pointIn(vPt.x, vPt.y)) {
                    vResult = this.FDrawItemAnnotates[i].DataAnnotate;
                    break;
                }
            }
        }

        return vResult;
    }

    _AnnotateRemove(itemNo, offset) { }

     _AnnotateInsertChar(itemNo, offset) {
        let vDataAnn;

        for (let i = this.FDataAnnotates.count - 1; i >= 0; i--) {
            if (this.FDataAnnotates[i].StartItemNo > itemNo)
                continue;

            if (this.FDataAnnotates[i].EndItemNo < itemNo)
                break;

            vDataAnn = this.FDataAnnotates[i];
            if (vDataAnn.StartItemNo == itemNo) {
                if (vDataAnn.EndItemNo == itemNo) {
                    if (offset <= vDataAnn.StartItemOffset) {
                        vDataAnn.StartItemOffset = vDataAnn.StartItemOffset + 1;
                        vDataAnn.EndItemOffset = vDataAnn.EndItemOffset + 1;
                    } else {
                        if (offset < vDataAnn.StartItemOffset)
                            vDataAnn.StartItemOffset = vDataAnn.StartItemOffset + 1;
                    }

                    if (vDataAnn.StartItemOffset == vDataAnn.EndItemOffset)
                        this.FDataAnnotates.delete(i);
                } else {
                    if (offset <= vDataAnn.StartItemOffset)
                        vDataAnn.StartItemOffset = vDataAnn.StartItemOffset + 1;
                }
            } else {
                if (vDataAnn.EndItemNo == itemNo) {
                    if (offset <= vDataAnn.EndItemOffset)
                        vDataAnn.EndItemOffset = vDataAnn.EndItemOffset + 1;
                }
            }
        }
    }

    _AnnotateBackChar(itemNo, offset) {
        let vDataAnn;

        for (let i = this.FDataAnnotates.count - 1; i >= 0; i--) {
            if (this.FDataAnnotates[i].StartItemNo > itemNo)
                continue;

            if (this.FDataAnnotates[i].EndItemNo < itemNo)
                break;

            vDataAnn = this.FDataAnnotates[i];
            if (vDataAnn.StartItemNo == itemNo)  {
                if (vDataAnn.EndItemNo == itemNo) {
                    if ((offset > vDataAnn.StartItemOffset) && (offset <= vDataAnn.EndItemOffset)) {
                        vDataAnn.EndItemOffset = vDataAnn.EndItemOffset - 1;
                    } else {
                        vDataAnn.StartItemOffset = vDataAnn.StartItemOffset - 1;
                        vDataAnn.EndItemOffset = vDataAnn.EndItemOffset - 1;
                    }
                } else {
                    if (offset >= vDataAnn.StartItemOffset)
                        vDataAnn.StartItemOffset = vDataAnn.StartItemOffset - 1;
                }
            } else {
                if (vDataAnn.EndItemNo == itemNo) {
                    if (offset <= vDataAnn.EndItemOffset)
                        vDataAnn.EndItemOffset = vDataAnn.EndItemOffset - 1;
                }
            }
        }
    }

    _AnnotateDeleteChar(itemNo, offset) {
        let vDataAnn;

        for (let i = this.FDataAnnotates.count - 1; i >= 0; i--) {
            if (this.FDataAnnotates[i].StartItemNo > itemNo)
                continue;

            if (this.FDataAnnotates[i].EndItemNo < itemNo)
                break;

            vDataAnn = this.FDataAnnotates[i];
            if (vDataAnn.StartItemNo == itemNo) {
                if (vDataAnn.EndItemNo == itemNo) {
                    if (offset <= vDataAnn.StartItemOffset) {
                        vDataAnn.StartItemOffset = vDataAnn.StartItemOffset - 1;
                        vDataAnn.EndItemOffset = vDataAnn.EndItemOffset - 1;
                    } else {
                        if (offset <= vDataAnn.EndItemOffset)
                            vDataAnn.EndItemOffset = vDataAnn.EndItemOffset - 1;
                    }

                    if (vDataAnn.StartItemOffset == vDataAnn.EndItemOffset)
                        this.FDataAnnotates.delete(i);
                } else {
                    if (offset <= vDataAnn.StartItemOffset)
                        vDataAnn.StartItemOffset = vDataAnn.StartItemOffset - 1;
                }
            } else {
                if (vDataAnn.EndItemNo == itemNo) {
                    if (offset <= vDataAnn.EndItemOffset)
                        vDataAnn.EndItemOffset = vDataAnn.EndItemOffset - 1;
                }
            }
        }
    }

    DoLoadFromStream(stream, style, fileVersion) {
        super.DoLoadFromStream(stream, style, fileVersion);

        if (this.CanEdit() && (fileVersion > 22)) {
            let vAnnCount = stream.readUInt16();
            if (vAnnCount > 0) {
                for (let i = 0; i <= vAnnCount - 1; i++) {
                    let vAnn = new THCDataAnnotate();
                    vAnn.LoadFromStream(stream, fileVersion);
                    this.FDataAnnotates.add(vAnn);
                }
            }
        }
    }

    DoItemAction(itemNo, offset, action) {
        switch (action) {
            case THCAction.DeleteItem:
                this._AnnotateRemove(itemNo, offset);
                break;

            case THCAction.InsertText:
                this._AnnotateInsertChar(itemNo, offset);
                break;

            case THCAction.BackDeleteText:
                this._AnnotateBackChar(itemNo, offset);
                break;

            case THCAction.DeleteText:
                this._AnnotateDeleteChar(itemNo, offset);
                break;
        }
    }

    DoDrawItemPaintContent(data, itemNo, drawItemNo, drawRect, clearRect, drawText, dataDrawLeft,
        dataDrawRight, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo)
    {
        if ((this.FOnDrawItemAnnotate != null) && this.DrawItemOfAnnotate(drawItemNo, hclCanvas, clearRect)) {
            let vDrawAnnotate;
            let vActive;
            for (let i = 0; i <= this.FDrawItemAnnotates.count - 1; i++) {
                vDrawAnnotate = this.FDrawItemAnnotates[i];

                if (!paintInfo.print) {
                    vActive = (vDrawAnnotate.DataAnnotate === this.FHotAnnotate)
                        || (vDrawAnnotate.DataAnnotate === this.FActiveAnnotate);

                    if (vActive)
                        hclCanvas.brush.color = HC.AnnotateBKActiveColor;
                    else
                        hclCanvas.brush.color = HC.AnnotateBKColor;
                }

                if (vDrawAnnotate.first()) {
                    hclCanvas.pen.color = TColor.Red;
                    hclCanvas.beginPath();
                    try {
                        hclCanvas.moveTo(vDrawAnnotate.DrawRect.left + 2, vDrawAnnotate.DrawRect.top - 2);
                        hclCanvas.lineTo(vDrawAnnotate.DrawRect.left, vDrawAnnotate.DrawRect.top);
                        hclCanvas.lineTo(vDrawAnnotate.DrawRect.left, vDrawAnnotate.DrawRect.bottom);
                        hclCanvas.lineTo(vDrawAnnotate.DrawRect.left + 2, vDrawAnnotate.DrawRect.bottom + 2);
                    } finally {
                        hclCanvas.paintPath();
                    }
                }

                if (vDrawAnnotate.last()) {
                    hclCanvas.pen.color = TColor.Red;
                    hclCanvas.beginPath();
                    try {
                        hclCanvas.moveTo(vDrawAnnotate.DrawRect.right - 2, vDrawAnnotate.DrawRect.top - 2);
                        hclCanvas.lineTo(vDrawAnnotate.DrawRect.right, vDrawAnnotate.DrawRect.top);
                        hclCanvas.lineTo(vDrawAnnotate.DrawRect.right, vDrawAnnotate.DrawRect.bottom);
                        hclCanvas.lineTo(vDrawAnnotate.DrawRect.right - 2, vDrawAnnotate.DrawRect.bottom + 2);
                    } finally {
                        hclCanvas.paintPath();
                    }

                    this.FOnDrawItemAnnotate(data, drawItemNo, vDrawAnnotate.DrawRect, vDrawAnnotate.DataAnnotate);
                }
            }
        }

        super.DoDrawItemPaintContent(data, itemNo, drawItemNo, drawRect, clearRect, drawText,
            dataDrawLeft, dataDrawRight, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
    }

    DoInsertAnnotate(sender) {
        this.Style.updateInfoRePaint();
        if (this.FOnInsertAnnotate != null)
            this.FOnInsertAnnotate(this, sender);
    }

    DoRemoveAnnotate(sender) {
        this.Style.updateInfoRePaint();
        if (this.FOnRemoveAnnotate != null)
            this.FOnRemoveAnnotate(this, sender);
    }

    dispose() {
        super.dispose();
        this.FDataAnnotates.clear();
        this.FDrawItemAnnotates.clear();
    }

    GetCaretInfo(itemNo, offset, caretInfo) {
        super.GetCaretInfo(itemNo, offset, caretInfo);

        let vCaretDrawItemNo = -1;
        if (this.CaretDrawItemNo < 0) {
            if (this.Style.updateInfo.draging)
                vCaretDrawItemNo = this.GetDrawItemNoByOffset(this.MouseMoveItemNo, this.MouseMoveItemOffset);
            else
                vCaretDrawItemNo = this.GetDrawItemNoByOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
        } else
            vCaretDrawItemNo = this.CaretDrawItemNo;

        let vDataAnnotate = null;
        if (this.Style.updateInfo.draging) {
            vDataAnnotate = this.GetDrawItemFirstDataAnnotateAt(vCaretDrawItemNo,
                this.GetDrawItemOffsetWidth(vCaretDrawItemNo, this.MouseMoveItemOffset - this.DrawItems[vCaretDrawItemNo].CharOffs + 1),
                
            this.DrawItems[vCaretDrawItemNo].rect.top + 1);
        } else {
            vDataAnnotate = this.GetDrawItemFirstDataAnnotateAt(vCaretDrawItemNo,
                this.GetDrawItemOffsetWidth(vCaretDrawItemNo, this.SelectInfo.StartItemOffset - this.DrawItems[vCaretDrawItemNo].CharOffs + 1),
                
            this.DrawItems[vCaretDrawItemNo].rect.top + 1);
        }

        if (this.FActiveAnnotate != vDataAnnotate) {
            this.FActiveAnnotate = vDataAnnotate;
            this.Style.updateInfoRePaint();
        }
    }

    PaintDataRange(dataDrawLeft, dataDrawTop, dataDrawRight, dataDrawBottom, dataScreenTop, dataScreenBottom,
        voffset, firstDItemNo, lastDItemNo, hclCanvas, paintInfo)
    {
        this.CheckAnnotateRange(firstDItemNo, lastDItemNo);
        super.PaintDataRange(dataDrawLeft, dataDrawTop, dataDrawRight, dataDrawBottom, dataScreenTop,
            dataScreenBottom, voffset, firstDItemNo, lastDItemNo, hclCanvas, paintInfo);
        this.FDrawItemAnnotates.clear();
    }

    MouseMove(e) {
        super.MouseMove(e);

        let vDataAnnotate = this.GetDrawItemFirstDataAnnotateAt(this.MouseMoveDrawItemNo, e.x, e.y);
        if (this.FHotAnnotate != vDataAnnotate) {
            this.FHotAnnotate = vDataAnnotate;
            this.Style.updateInfoRePaint();
        }
    }

    InitializeField() {
        super.InitializeField();
        this.FHotAnnotate = null;
        this.FActiveAnnotate = null;
    }

    clear() {
        this.FDataAnnotates.clear();
        super.clear();
    }

    SaveToStreamRange(stream, startItemNo, startOffset, endItemNo, endOffset) {
        super.SaveToStreamRange(stream, startItemNo, startOffset, endItemNo, endOffset);
        stream.writeUInt16(this.FDataAnnotates.count);
        for (let i = 0; i < this.FDataAnnotates.count; i++)
            this.FDataAnnotates[i].SaveToStream(stream);
    }

    InsertAnnotate(title, text) {
        if (!this.CanEdit())
            return false;

        if (!this.SelectExists())
            return false;

        let vTopData = this.GetTopLevelData();
        if (vTopData.isClass(THCAnnotateData) && (vTopData != this))
            vTopData.InsertAnnotate(title, text);
        else
            this.FDataAnnotates.NewDataAnnotate(this.SelectInfo, title, text);

        return true;
    }

    get DataAnnotates() {
        return this.FDataAnnotates;
    }

    get HotAnnotate() {
        return this.FHotAnnotate;
    }

    get ActiveAnnotate() {
        return this.FActiveAnnotate;
    }

    get OnDrawItemAnnotate() {
        return this.FOnDrawItemAnnotate;
    }

    set OnDrawItemAnnotate(val) {
        this.FOnDrawItemAnnotate = val;
    }

    get OnInsertAnnotate() {
        return this.FOnInsertAnnotate;
    }

    set OnInsertAnnotate(val) {
        this.FOnInsertAnnotate = val;
    }

    get OnRemoveAnnotate() {
        return this.FOnRemoveAnnotate;
    }

    set OnRemoveAnnotate(val) {
        this.FOnRemoveAnnotate = val;
    }
}