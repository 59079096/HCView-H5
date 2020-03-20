import { TCursors, TKey, TMouseButton, TMouseEventArgs } from "../hcl/Controls.js";
import { TBrushStyle, TPenStyle } from "../hcl/Graphics.js";
import { system, TList, TPoint, TRect, TStream } from "../hcl/System.js";
import { HC, TBorderSide, THCContentAlign } from "./HCCommon.js";
import { TParaAlignHorz } from "./HCParaStyle.js";
import { THCDataItem } from "./HCRectItem.js";
import { THCStyle } from "./HCStyle.js";
import { THCAlignVert, THCTableCell, TResizeInfo, TTableSite, TSelectCellRang, TOutsideInfo } from "./HCTableCell.js";
import { THCTableRow } from "./HCTableRow.js";
import { THCCellUndoData, THCColSizeUndoData, THCDataUndo, THCMirrorUndoData, THCMulCellUndoData, THCRowSizeUndoData } from "./HCUndo.js";
import { THCUnitConversion } from "./HCUnitConversion.js";
import { THCTableCellData } from "./HCTableCellData.js";

export class TPageBreak {
    constructor() {
        this.PageIndex = -1;
        this.Row = -1;
        this.BreakSeat = 0;
        this.BreakBottom = 0;
    }
}

export class THCTableRows extends TList {
    constructor() {
        super();
        this.FOnRowAdd = null;
    }

    doAdded_(item) {
        super.doAdded_(item);
        if (this.FOnRowAdd != null)
            this.FOnRowAdd(item);
    }

    get onRowAdd() {
        return this.FOnRowAdd;
    }

    set onRowAdd(val) {
        this.FOnRowAdd = val;
    }
}

export class TColCross {
    constructor() {
        this.Col = -1;
        this.DrawItemNo = -1;
        this.VDrawOffset = 0;
    }
}

export class THCMulCellUndo {
    constructor() {
        this.FEnable = false;
        this.Row = -1;
        this.Col = -1;
    }

    SetEnable(val) {
        if (this.FEnable != val) {
            this.FEnable = val;
            if (this.FEnable)
                this.Init(-1, -1);
        }
    }

    Init(row, col) {
        this.Row = row;
        this.Col = col;
    }

    get Enable() {
        return this.FEnable;
    }

    set Enable(val) {
        this.SetEnable(val);
    }
}

export class THCTableItem extends THCDataItem {
    constructor(ownerData, aRowCount, aColCount, aWidth) {
        super(ownerData);
        if (aRowCount == 0)
            system.exception("异常：不能创建行数为0的表格！");
        if (aColCount == 0)
            system.exception("异常：不能创建列数为0的表格！");

        this.StyleNo = THCStyle.Table;
        this.ParaNo = ownerData.CurParaNo;
        this.GripSize = 2;
        this.FBorderWidthPix = 0;
        this.FCellHPaddingPix = 2;
        this.FCellVPaddingPix = 2;
        this.BorderWidthPt = 0.5;
        this.CellVPaddingMM = 0.5;
        this.CellHPaddingMM = 0;
        this.FOutsideInfo = new TOutsideInfo();
        this.FMouseDownRow = -1;
        this.FMouseDownCol = -1;
        this.FMouseMoveRow = -1;
        this.FMouseMoveCol = -1;
        this.FMouseDownX = 0;
        this.FMouseDownY = 0;
        this.FFormatHeight = 0;
        this.FResizeInfo = null;
        this.FMulCellUndo = new THCMulCellUndo();
        this.FBorderVisible = true;
        this.FMouseLBDowning = false;
        this.FSelecting = false;
        this.FDraging = false,
        this.FOutSelectInto = false;
        this.FFormatDirty = false;
        this.FResizeKeepWidth = false;
        this.FBorderColor = "black";
        this.BorderWidthPt = 0.5;
        this.FPageBreaks = new TList();
        this.FSelectCellRang = new TSelectCellRang();
        this.FColWidths = new TList();
        this.FRows = new THCTableRows();
        this.FRows.onRowAdd = (row) => { this.DoRowAdd(row); }
        this.ResetRowCol(aWidth, aRowCount, aColCount);
        this.FMangerUndo = true;
        this.FOnCellPaintBK = null;
        this.FOnCellPaintData = null;
    }

    InitializeMouseInfo() {
        this.FMouseDownRow = -1;
        this.FMouseDownCol = -1;
        this.FMouseMoveRow = -1;
        this.FMouseMoveCol = -1;
        this.FMouseLBDowning = false;
    }

    InitializeCellData(aCellData) {
        aCellData.OnInsertItem = (data, item) => { this.OwnerData.OnInsertItem(data, item); }
        aCellData.OnRemoveItem = (data, item) => { this.OwnerData.OnRemoveItem(data, item); }
        aCellData.OnSaveItem = (data, itemNo) => { return this.OwnerData.OnSaveItem(data, itemNo); }
        aCellData.OnAcceptAction = (data, itemNo, offset, action) => { return this.OwnerData.OnAcceptAction(data, itemNo, offset, action); }
        aCellData.OnItemMouseDown = (data, itemNo, offset, e) => { this.OwnerData.OnItemMouseDown(data, itemNo, offset, e); }
        aCellData.OnItemMouseUp = (data, itemNo, offset, e) => { this.OwnerData.OnItemMouseUp(data, itemNo, offset, e); }
        aCellData.OnItemRequestFormat = (data, item) => { this.OwnerData.OnItemRequestFormat(data, item); }

        aCellData.OnCreateItemByStyle = (data, styleNo) => { return this.OwnerData.OnCreateItemByStyle(data, styleNo); }      
        aCellData.OnDrawItemPaintBefor = (data, itemNo, aDrawItemNo, aDrawRect, aDataDrawLeft,
            aDataDrawRight, aDataDrawBottom, aDataScreenTop, aDataScreenBottom, aCanvas, aPaintInfo) => {
                this.OwnerData.OnDrawItemPaintBefor(data, itemNo, aDrawItemNo, aDrawRect, aDataDrawLeft,
                    aDataDrawRight, aDataDrawBottom, aDataScreenTop, aDataScreenBottom, aCanvas, aPaintInfo); 
        }

        aCellData.OnDrawItemPaintContent = (data, itemNo, drawItemNo, drawRect, clearRect, drawText,
            dataDrawLeft, dataDrawRight, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) => {
                this.OwnerData.OnDrawItemPaintContent(data, itemNo, drawItemNo, drawRect, clearRect, drawText,
                    dataDrawLeft, dataDrawRight, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
            }

        aCellData.OnDrawItemPaintAfter = (data, itemNo, aDrawItemNo, aDrawRect, aDataDrawLeft,
            aDataDrawRight, aDataDrawBottom, aDataScreenTop, aDataScreenBottom, aCanvas, aPaintInfo) => {
                this.OwnerData.OnDrawItemPaintAfter(data, itemNo, aDrawItemNo, aDrawRect, aDataDrawLeft,
                    aDataDrawRight, aDataDrawBottom, aDataScreenTop, aDataScreenBottom, aCanvas, aPaintInfo); 
        }

        aCellData.OnInsertAnnotate = (data, dataAnnotate) => { this.OwnerData.OnInsertAnnotate(data, dataAnnotate); }
        aCellData.OnRemoveAnnotate = (data, dataAnnotate) => { this.OwnerData.OnRemoveAnnotate(data, dataAnnotate); }
        aCellData.OnDrawItemAnnotate = (data, drawItemNo, drawRect, dataAnnotate) => {
            this.OwnerData.OnDrawItemAnnotate(data, drawItemNo, drawRect, dataAnnotate);
        }
        aCellData.OnCaretItemChanged = (data, item) => { this.OwnerData.OnCaretItemChanged(data, item); }

        aCellData.OnCanEdit = (sender) => { return this.OwnerData.OnCanEdit(sender); }
        aCellData.OnInsertTextBefor = (data, itemNo, offset, text) => { return this.OwnerData.OnInsertTextBefor(data, itemNo, offset, text); }
        aCellData.OnItemResized = (data, itemNo) => { this.OwnerData.OnItemResized(data, itemNo); }
        aCellData.OnCurParaNoChange = (sender) => { this.OwnerData.OnCurParaNoChange(sender); }

        aCellData.OnCreateItem = (sender) => { this.OwnerData.OnCreateItem(sender); }
        aCellData.OnGetUndoList = () => { return this.GetSelfUndoList(); }
        aCellData.OnGetRootData = () => { return this.DoCellDataGetRootData(); }
    }

    DoCellDataGetRootData() {
        return this.OwnerData.GetRootData();
    }

    DoRowAdd(row) {
        let vCellData = null;

        for (let i = 0; i < row.ColCount; i++) {
            vCellData = row[i].CellData;
            if (vCellData != null)
                this.InitializeCellData(vCellData);
        }
    }

    CellChangeByAction(row, col, procedure) {
        this.SizeChanged = false;
        procedure();
        if (!this.SizeChanged)
            this.SizeChanged = this.FRows[row][col].CellData.FormatHeightChange;
    }

    GetFormatHeight() {
        this.FFormatHeight = this.FBorderWidthPix;
        for (let i = 0; i < this.RowCount; i++)
            this.FFormatHeight = this.FFormatHeight + this.FRows[i].Height + this.FBorderWidthPix;

        return this.FFormatHeight;
    }

    CalcRowCellHeight(row) {
        let vNorHeightMax = 0;
        for (let vC = 0; vC < this.FRows[row].ColCount; vC++) {
            if ((this.FRows[row][vC].CellData != null) && (this.FRows[row][vC].RowSpan == 0))
                vNorHeightMax = Math.max(vNorHeightMax, this.FRows[row][vC].CellData.height);
        }

        vNorHeightMax = this.FCellVPaddingPix + vNorHeightMax + this.FCellVPaddingPix;

        if (this.FRows[row].AutoHeight)
            this.FRows[row].Height = vNorHeightMax;
        else {
            if (vNorHeightMax > this.FRows[row].Height) {
                this.FRows[row].AutoHeight = true;
                this.FRows[row].Height = vNorHeightMax;
            }
        }
    }

    CalcMergeRowHeightFrom(row) {
        let vDestRow = -1, vDestCol = -1, vExtraHeight = 0, vH = 0, vDestRow2 = -1, vDestCol2 = -1;

        for (let vR = row; vR < this.RowCount; vR++) {
            for (let vC = 0; vC < this.FRows[vR].ColCount; vC++) {
                if (this.FRows[vR][vC].CellData == null) {
                    if (this.FRows[vR][vC].ColSpan < 0)
                        continue;

                    let vInfo = this.GetDestCell(vR, vC);
                    vDestRow = vInfo.row;
                    vDestCol = vInfo.col;
                    if (vDestRow + this.FRows[vDestRow][vC].RowSpan == vR) {
                        vExtraHeight = this.FCellVPaddingPix + this.FRows[vDestRow][vC].CellData.height + this.FCellVPaddingPix;
                        this.FRows[vDestRow][vC].Height = vExtraHeight;
                        vExtraHeight = vExtraHeight - this.FRows[vDestRow].Height - this.FBorderWidthPix;

                        for (let i = vDestRow + 1; i <= vR - 1; i++)
                            vExtraHeight = vExtraHeight - this.FRows[i].FmtOffset - this.FRows[i].Height - this.FBorderWidthPix;
                        
                        if (vExtraHeight > this.FRows[vR].FmtOffset + this.FRows[vR].Height) {
                            vH = vExtraHeight - this.FRows[vR].FmtOffset - this.FRows[vR].Height;
                            this.FRows[vR].Height = vExtraHeight - this.FRows[vR].FmtOffset;

                            for (let i = 0; i <= this.FRows[vR].ColCount - 1; i++) {
                                if (this.FRows[vR][i].CellData == null) {
                                    vInfo = this.GetDestCell(vR, i);
                                    vDestRow2 = vInfo.row;
                                    vDestCol2 = vInfo.col;
                                    if ((vDestRow2 != vDestRow) && (vDestCol2 != vDestCol))
                                        this.FRows[vDestRow2][i].Height = this.FRows[vDestRow2][i].Height + vH;
                                }
                            }
                        } else
                            this.FRows[vDestRow][vC].Height += this.FRows[vR].FmtOffset + this.FRows[vR].Height - vExtraHeight;
                    }
                }
            }
        }
    }

    SrcCellDataTopDistanceToDest(srcRow, destRow) {
        let vResult = this.FBorderWidthPix + this.FRows[srcRow].FmtOffset;
        let vR = srcRow - 1;
        while (vR > destRow) {
            vResult += this.FRows[vR].Height + this.FBorderWidthPix + this.FRows[vR].FmtOffset;
            vR--;
        }

        return vResult + this.FRows[destRow].Height;
    }

    GetCellPostion(row, col) {
        let vResult = TPoint.Create(this.FBorderWidthPix, this.FBorderWidthPix);
        for (let i = 0; i < row; i++)
            vResult.y = vResult.y + this.FRows[i].FmtOffset + this.FRows[i].Height + this.FBorderWidthPix;

        vResult.y = vResult.y + this.FRows[row].FmtOffset;
        for (let i = 0; i < col; i++)
            vResult.x = vResult.x + this.FColWidths[i] + this.FBorderWidthPix;

        return vResult;
    }

    ActiveDataResizing() {
        if (this.FSelectCellRang.EditCell())
            return this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].CellData.SelectedResizing();
        else
            return false;
    }

    DisSelectSelectedCell(row = -1, col = -1) {
        if (this.FSelectCellRang.StartRow >= 0) {
            let vCellData = null;
            if ((this.FSelectCellRang.StartRow == row) && (this.FSelectCellRang.StartCol == col)) {
                //
            } else {
                this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].Active = false;
                vCellData = this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].CellData;
                if (vCellData != null) {
                    vCellData.DisSelect();
                    vCellData.InitializeField();
                }
            }
            
            for (let vRow = this.FSelectCellRang.StartRow; vRow <= this.FSelectCellRang.EndRow; vRow++) {
                for (let vCol = this.FSelectCellRang.StartCol; vCol <= this.FSelectCellRang.EndCol; vCol++) {
                    if ((vRow == row) && (vCol == col)) {
                        //
                    } else {
                        this.FRows[vRow][vCol].Active = false;
                        vCellData = this.FRows[vRow][vCol].CellData;
                        if (vCellData != null) {
                            vCellData.DisSelect();
                            vCellData.InitializeField();
                        }
                    }
                }
            }
        }
    }

    SetBorderWidthPt(val) {
        if (this.FBorderWidthPt != val) {
            this.FBorderWidthPt = val;
            this.FBorderWidthPix = THCUnitConversion.ptToPixel(this.FBorderWidthPt, THCUnitConversion.PixelsPerInchX);
            this.FormatDirty();
        }
    }

    SetCellVPaddingMM(val) {
        if (this.FCellVPaddingMM != val) {
            this.FCellVPaddingMM = val;
            this.FCellVPaddingPix = THCUnitConversion.millimeterToPixY(this.FCellVPaddingMM);
            this.FormatDirty();
        }
    }

    SetCellHPaddingMM(val) {
        if (this.FCellHPaddingMM != val) {
            this.FCellHPaddingMM = val;
            this.FCellHPaddingPix = THCUnitConversion.millimeterToPixX(this.FCellHPaddingMM);
            this.FormatDirty();
        }
    }

    CanDrag() {
        let vResult = super.CanDrag();
        if (vResult) {
            if (this.FSelectCellRang.EditCell())
                vResult = this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].CellData.SelectedCanDrag();
            else
                vResult = this.IsSelectComplate || this.IsSelectPart;
        }

        return vResult;
    }

    GetSelectComplate() {
        return (this.FSelectCellRang.StartRow == 0)
            && (this.FSelectCellRang.StartCol == 0)
            && (this.FSelectCellRang.EndRow == this.FRows.count - 1)
            && (this.FSelectCellRang.EndCol == this.FColWidths.count - 1);
    }

    SelectComplate() {
        super.SelectComplate();
        
        this.FSelectCellRang.StartRow = 0;
        this.FSelectCellRang.StartCol = 0;
        this.FSelectCellRang.EndRow = this.RowCount - 1;
        this.FSelectCellRang.EndCol = this.FColWidths.count - 1;
        
        for (let vRow = this.FSelectCellRang.StartRow; vRow <= this.FSelectCellRang.EndRow; vRow++) {
            for (let vCol = this.FSelectCellRang.StartCol; vCol <= this.FSelectCellRang.EndCol; vCol++) {
                if (this.FRows[vRow][vCol].CellData != null)
                    this.FRows[vRow][vCol].CellData.SelectAll();
            }
        }
    }

    GetResizing() {
        return (super.GetResizing()) || this.ActiveDataResizing();
    }

    SetResizing(val) {
        super.SetResizing(val);
    }

    // #region DoPaint子方法CheckRowBorderShouLian
    CheckRowBorderShouLian(row, dataDrawBottom, drawRect, vShouLian, vFirstDrawRow) {
        if (vShouLian == 0) {
            let vRowDataDrawTop = drawRect.top + this.FBorderWidthPix - 1;
            for (let i = 0; i < row; i++)
                vRowDataDrawTop = vRowDataDrawTop + this.FRows[i].FmtOffset + this.FRows[i].Height + this.FBorderWidthPix;
            
            if ((this.FRows[row].FmtOffset > 0) && (row != vFirstDrawRow)) {
                vShouLian = vRowDataDrawTop - this.FBorderWidthPix;
                return;
            }

            vRowDataDrawTop += this.FRows[row].FmtOffset + this.FCellVPaddingPix;
            
            let vBreakBottom = 0, vDestCellDataDrawTop = 0, vDestRow2 = -1, vDestCol2 = -1;
            let vCellData = null, vInfo, vRect;

            for (let vC = 0; vC < this.FRows[row].ColCount; vC++) {
                vDestCellDataDrawTop = vRowDataDrawTop;
                vInfo = this.GetDestCell(row, vC);
                vDestRow2 = vInfo.row;
                vDestCol2 = vInfo.col;

                if (vC != vDestCol2 + this.FRows[vDestRow2][vDestCol2].ColSpan)
                    continue;
                
                vCellData = this.FRows[vDestRow2][vDestCol2].CellData;
                if (vDestRow2 != row)
                    vDestCellDataDrawTop = vDestCellDataDrawTop - this.SrcCellDataTopDistanceToDest(row, vDestRow2);

                for (let i = 0; i < vCellData.DrawItems.count; i++) {
                    if (vCellData.DrawItems[i].LineFirst) {
                        vRect = TRect.CreateByRect(vCellData.DrawItems[i].rect);
                        vRect.bottom = vRect.bottom + this.FCellVPaddingPix;
                        if (vDestCellDataDrawTop + vRect.bottom > dataDrawBottom) {
                            if (i > 0) {
                                if (dataDrawBottom - vDestCellDataDrawTop - vCellData.DrawItems[i - 1].rect.bottom > this.FCellVPaddingPix)
                                    vShouLian = Math.max(vShouLian, vDestCellDataDrawTop + vCellData.DrawItems[i - 1].rect.bottom + this.FCellVPaddingPix);
                                else
                                    vShouLian = Math.max(vShouLian, vDestCellDataDrawTop + vCellData.DrawItems[i - 1].rect.bottom);
                            } else
                                vShouLian = Math.max(vShouLian, vDestCellDataDrawTop - this.FCellVPaddingPix - this.FBorderWidthPix);
                            
                            break;
                        }
                        else
                            vBreakBottom = Math.max(vBreakBottom, vDestCellDataDrawTop + vRect.bottom);
                    }
                }
            }
            
            vShouLian = Math.max(vShouLian, vBreakBottom);
        }
    }

    DoDrawPageBreakMark(pageEnd, hclCanvas, vBorderRight, vBorderBottom, dataDrawTop) {
        hclCanvas.pen.color = "gray";
        hclCanvas.pen.style = TPenStyle.Dot;
        hclCanvas.pen.width = 1;

        if (pageEnd) {
            hclCanvas.drawLineDriect(vBorderRight + 5, vBorderBottom - 1,
                vBorderRight + 20, vBorderBottom - 1);

            hclCanvas.pen.style = TPenStyle.Solid;
            hclCanvas.drawLineByPointsDriect(
                TPoint.Create(vBorderRight + 19, vBorderBottom - 3),
                TPoint.Create(vBorderRight + 19, vBorderBottom - 10),
                TPoint.Create(vBorderRight + 5, vBorderBottom - 10),
                TPoint.Create(vBorderRight + 5, vBorderBottom - 2));
        } else {
            hclCanvas.drawLineDriect(vBorderRight + 5, dataDrawTop + 1,
                vBorderRight + 20, dataDrawTop + 1);

            hclCanvas.pen.style = TPenStyle.Solid;
            hclCanvas.drawLineByPointsDriect(
                TPoint.Create(vBorderRight + 19, dataDrawTop + 3),
                TPoint.Create(vBorderRight + 19, dataDrawTop + 10),
                TPoint.Create(vBorderRight + 5, dataDrawTop + 10),
                TPoint.Create(vBorderRight + 5, dataDrawTop + 2));
        }
        
        hclCanvas.pen.color = "black";
    }
    //#endregion

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        let vFirstDrawRow = -1, vCellDataDrawBottom = 0, vCellDrawLeft = 0, vShouLian = 0,
            vDestCellDataDrawTop = 0, vDestRow = 0, vDestCol = 0, vDestRow2 = 0, vDestCol2 = 0,
            vBorderTop, vBorderBottom = 0, vCellScreenBottom = 0, vCellScreenTop = 0,
            vSrcRowBorderTop = 0, vBorderLeft = 0, vBorderRight = 0;
        let vDrawCellData = false;
        let vInfo, vCellData, vCellRect, vDrawDefault, vDrawBorder;
        let vFixHeight = this.GetFixRowHeight();
        let vBorderOffs = Math.trunc(this.FBorderWidthPix / 2);
        let vFirstDrawRowIsBreak = false;
        let vCellDataDrawTop = drawRect.top + this.FBorderWidthPix;

        for (let vR = 0; vR < this.FRows.count; vR++) {
            vCellDataDrawTop = vCellDataDrawTop + this.FRows[vR].FmtOffset + this.FCellVPaddingPix;
            if (vCellDataDrawTop > dataScreenBottom) {
                if ((vFirstDrawRow < 0) && this.IsBreakRow(vR))
                    vFirstDrawRowIsBreak = (this.FFixRow >= 0) && (vR > this.FFixRow + this.FFixRowCount - 1);

                break;
            }

            vCellDataDrawBottom = vCellDataDrawTop - this.FCellVPaddingPix + this.FRows[vR].Height - this.FCellVPaddingPix;

            if (vCellDataDrawBottom < dataScreenTop) {
                vCellDataDrawTop = vCellDataDrawBottom + this.FCellVPaddingPix + this.FBorderWidthPix;
                continue;
            }

            if (vFirstDrawRow < 0) {
                vFirstDrawRow = vR;

                if (this.IsBreakRow(vR))
                    vFirstDrawRowIsBreak = (this.FFixRow >= 0) && (vR > this.FFixRow + this.FFixRowCount - 1);
            }

            vCellDrawLeft = drawRect.left + this.FBorderWidthPix;

            vShouLian = 0;
            for (let vC = 0; vC < this.FRows[vR].ColCount; vC++) {
                if (this.FRows[vR][vC].ColSpan < 0) {
                    vCellDrawLeft = vCellDrawLeft + this.FColWidths[vC] + this.FBorderWidthPix;
                    continue;
                }
                
                vDrawCellData = true;
                if (this.FRows[vR][vC].RowSpan < 0) {
                    if (vR != vFirstDrawRow)
                        vDrawCellData = false;
                }

                vDestCellDataDrawTop = vCellDataDrawTop;
                vInfo = this.GetDestCell(vR, vC);
                vDestRow = vInfo.row;
                vDestCol = vInfo.col;

                if (vDestRow != vR)
                    vDestCellDataDrawTop = vDestCellDataDrawTop - this.SrcCellDataTopDistanceToDest(vR, vDestRow);
          
                //#region 绘制单元格数据
                if (vDrawCellData) {
                    vCellScreenBottom = Math.min(dataScreenBottom, vCellDataDrawTop
                        + Math.max(this.FRows[vR].Height, this.FRows[vDestRow][vDestCol].Height) - this.FCellVPaddingPix);

                    vCellData = this.FRows[vDestRow][vDestCol].CellData;
                    vCellScreenTop = Math.max(dataScreenTop, vCellDataDrawTop - this.FCellVPaddingPix);
                    if (vCellScreenTop - vDestCellDataDrawTop < vCellData.height) {
                        vCellRect = TRect.Create(vCellDrawLeft, vCellScreenTop, vCellDrawLeft + this.FRows[vR][vC].Width, vCellScreenBottom);

                        if ((this.IsSelectComplate || vCellData.CellSelectedAll) && (!paintInfo.print)) {
                            hclCanvas.brush.color = this.OwnerData.Style.SelColor;
                            hclCanvas.fillRect(vCellRect);
                        } else {
                            vDrawDefault = true;
                            if (this.FOnCellPaintBK != null)
                                vDrawDefault = this.FOnCellPaintBK(this, this.FRows[vDestRow][vDestCol], vCellRect, hclCanvas, paintInfo, vDrawDefault);

                            if (vDrawDefault) {
                                if (this.IsFixRow(vR) || this.IsFixCol(vC))
                                    hclCanvas.brush.color = HC.clBtnFace;
                                else if (this.FRows[vDestRow][vDestCol].BackgroundColor != HC.HCTransparentColor)
                                        hclCanvas.brush.color = this.FRows[vDestRow][vDestCol].BackgroundColor;
                                    else
                                        hclCanvas.brush.style = TBrushStyle.Clear;

                                hclCanvas.fillRect(vCellRect);
                            }
                        }

                        if (vCellScreenBottom - vCellScreenTop > this.FCellVPaddingPix) {
                            this.FRows[vDestRow][vDestCol].PaintTo(
                                vCellDrawLeft, vDestCellDataDrawTop - this.FCellVPaddingPix,
                                vCellDrawLeft + this.FColWidths[vC] + this.GetColSpanWidth(vDestRow, vDestCol),
                                dataDrawBottom, dataScreenTop, dataScreenBottom,
                                0, this.FCellHPaddingPix, this.FCellVPaddingPix, hclCanvas, paintInfo);

                            if (this.FOnCellPaintData != null) {
                                this.FOnCellPaintData(this, drawRect, vCellRect, vDestRow, vDestCol,
                                    vDestCellDataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom,
                                    hclCanvas, paintInfo);
                            }
                        }
                    }
                }
                //#endregion

                //#region 绘制各单元格边框线                    
                if (this.FBorderVisible || (!paintInfo.print)) {
                    vDrawBorder = true;
                    vBorderTop = vDestCellDataDrawTop - this.FCellVPaddingPix - this.FBorderWidthPix;
                    vBorderBottom = vBorderTop + this.FBorderWidthPix + Math.max(this.FRows[vR].Height, this.FRows[vDestRow][vDestCol].Height);
                    
                    if (vBorderBottom > dataScreenBottom) {
                        vSrcRowBorderTop = 0;

                        if (this.FRows[vR][vC].RowSpan > 0) {
                            vSrcRowBorderTop = vBorderTop;
                            vDestRow2 = vR;
                            while (vDestRow2 < this.FRows.count) {
                                vSrcRowBorderTop = vSrcRowBorderTop + this.FRows[vDestRow2].FmtOffset + this.FRows[vDestRow2].Height + this.FBorderWidthPix;
                                if (vSrcRowBorderTop > dataScreenBottom) {
                                    if (vSrcRowBorderTop > dataDrawBottom) {
                                        vInfo = this.CheckRowBorderShouLian(vDestRow2, dataDrawBottom, drawRect, vShouLian, vFirstDrawRow);
                                        vShouLian = vInfo.shouLian;
                                        vFirstDrawRow = vInfo.firstDrawRow;
                                        vBorderBottom = vShouLian;
                                    }
                                        
                                    break;
                                }
                                   
                                vDestRow2++;
                            }
                        } else if (this.FRows[vR][vC].RowSpan < 0) {
                            if (vR != vFirstDrawRow)
                                vDrawBorder = false;
                            else {
                                vSrcRowBorderTop = vBorderTop;
                                for (let i = vDestRow; i < vR; i++)
                                    vSrcRowBorderTop = vSrcRowBorderTop + this.FRows[i].Height + this.FBorderWidthPix;

                                vDestRow2 = vR;
                                while (vDestRow2 < this.FRows.count) {
                                    vSrcRowBorderTop = vSrcRowBorderTop + this.FRows[vDestRow2].Height + this.FBorderWidthPix;
                                    if (vSrcRowBorderTop > dataScreenBottom) {
                                        if (vSrcRowBorderTop > dataDrawBottom) {
                                            vInfo = this.CheckRowBorderShouLian(vDestRow2, dataDrawBottom, drawRect, vShouLian, vFirstDrawRow);
                                            vShouLian = vInfo.shouLian;
                                            vFirstDrawRow = vInfo.firstDrawRow;
                                            vBorderBottom = vShouLian;
                                        }
                                            
                                        break;
                                    }
                                        
                                    vDestRow2++;
                                }
                            }
                        } else {
                            vInfo = this.CheckRowBorderShouLian(vR, dataDrawBottom, drawRect, vShouLian, vFirstDrawRow);
                            vShouLian = vInfo.shouLian;
                            vFirstDrawRow = vInfo.firstDrawRow;
                            vBorderBottom = vShouLian;
                        }
                    }

                    if (vDrawBorder) {
                        if (paintInfo.print)
                            hclCanvas.pen.width = Math.max(1, THCUnitConversion.ptToPixel(this.FBorderWidthPt, paintInfo.DPI));
                        else
                            hclCanvas.pen.width = this.FBorderWidthPix;

                        if (this.FBorderVisible) {
                            hclCanvas.pen.color = "black";
                            hclCanvas.pen.style = TPenStyle.Solid;
                        } else if (!paintInfo.print) {
                            hclCanvas.pen.color = HC.clActiveBorder;
                            hclCanvas.pen.style = TPenStyle.Dot;
                        }
                        
                        vBorderLeft = vCellDrawLeft - this.FBorderWidthPix;
                        vBorderRight = vCellDrawLeft + this.FColWidths[vC] + this.GetColSpanWidth(vDestRow, vDestCol);
                        
                        if ((vBorderTop < dataScreenTop) && (dataDrawTop >= 0))
                            vBorderTop = dataScreenTop;

                        if ((vBorderTop > 0) && (this.FRows[vR][vC].BorderSides.has(TBorderSide.Top))) {
                            if (paintInfo.print) {
                                paintInfo.drawNoScaleLine(hclCanvas, [TPoint.Create(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs),
                                    TPoint.Create(vBorderRight + vBorderOffs, vBorderTop + vBorderOffs)]);
                            } else {
                                hclCanvas.drawLineDriect(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs,
                                    vBorderRight + vBorderOffs, vBorderTop + vBorderOffs);
                            }
                        }

                        if (this.FRows[vR][vC].BorderSides.has(TBorderSide.Right)) {
                            if (paintInfo.print) {
                                paintInfo.drawNoScaleLine(hclCanvas, [TPoint.Create(vBorderRight + vBorderOffs, vBorderTop + vBorderOffs),
                                    TPoint.Create(vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs)]);
                            } else {
                                hclCanvas.drawLineDriect(vBorderRight + vBorderOffs, vBorderTop + vBorderOffs,
                                    vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs);
                            }
                        }

                        if ((vBorderBottom <= dataScreenBottom) && (this.FRows[vR][vC].BorderSides.has(TBorderSide.Bottom))) {
                            if (paintInfo.print) {
                                paintInfo.drawNoScaleLine(hclCanvas, [TPoint.Create(vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs),
                                    TPoint.Create(vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs)]);
                            } else {
                                hclCanvas.drawLineDriect(vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs,
                                    vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs);
                            }
                        }

                        if (this.FRows[vR][vC].BorderSides.has(TBorderSide.Left)) {
                            if (paintInfo.print) {
                                paintInfo.drawNoScaleLine(hclCanvas, [TPoint.Create(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs),
                                    TPoint.Create(vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs)]);
                            } else {
                                hclCanvas.drawLineDriect(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs,
                                    vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs);
                            }
                        }

                        if (this.FRows[vR][vC].BorderSides.has(TBorderSide.LTRB)) {
                            if (paintInfo.print) {
                                paintInfo.drawNoScaleLine(hclCanvas, [TPoint.Create(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs),
                                    TPoint.Create(vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs)]);
                            } else {
                                hclCanvas.drawLineDriect(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs,
                                    vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs);
                            }
                        }

                        if (this.FRows[vR][vC].BorderSides.has(TBorderSide.RTLB)) {
                            if (paintInfo.print) {
                                paintInfo.drawNoScaleLine(hclCanvas, [TPoint.Create(vBorderRight + vBorderOffs, vBorderTop + vBorderOffs),
                                    TPoint.Create(vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs)]);
                            } else {
                                hclCanvas.drawLineDriect(vBorderRight + vBorderOffs, vBorderTop + vBorderOffs,
                                    vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs);
                            }
                        }

                        vDestCol2 = vC + this.FRows[vR][vC].ColSpan;
                        if ((!paintInfo.print) && (vDestCol2 == this.FColWidths.count - 1)) {
                            if (vCellDataDrawTop + this.FRows[vR].Height - this.FCellVPaddingPix > dataDrawBottom)
                                this.DoDrawPageBreakMark(true, hclCanvas, vBorderRight, vBorderBottom, dataDrawTop);
                            else
                            if ((vR < this.RowCount - 1)
                                && (vBorderBottom + this.FRows[vR + 1].FmtOffset + this.FRows[vR + 1].Height > dataDrawBottom))
                            {
                                if (this.FRows[vR + 1].FmtOffset > 0)
                                    this.DoDrawPageBreakMark(true, hclCanvas, vBorderRight, vBorderBottom, dataDrawTop);
                                else
                                if (vBorderBottom == dataDrawBottom)
                                    this.DoDrawPageBreakMark(true, hclCanvas, vBorderRight, vBorderBottom, dataDrawTop);
                            }
                                
                            if ((vFirstDrawRow != 0) && (vR == vFirstDrawRow) && (drawRect.top < dataDrawTop))
                                this.DoDrawPageBreakMark(false, hclCanvas, vBorderRight, vBorderBottom, dataDrawTop);
                        }
                    }
                }
                //#endregion

                vCellDrawLeft = vCellDrawLeft + this.FColWidths[vC] + this.FBorderWidthPix;
            }
                
            vCellDataDrawTop = vCellDataDrawBottom + this.FCellVPaddingPix + this.FBorderWidthPix;
        }

        if (vFirstDrawRowIsBreak)
            this.PaintFixRows(drawRect.left, dataDrawTop, dataScreenBottom, hclCanvas, paintInfo);

        if ((this.FFixCol >= 0) && (this.GetFixColLeft() + drawRect.left < 0))
            this.PaintFixCols(drawRect.top, 0, dataDrawTop, dataScreenBottom, hclCanvas, paintInfo);
        
        //#region 绘制拖动线
        if (this.Resizing && (this.FResizeInfo.TableSite == TTableSite.BorderRight)) {
            hclCanvas.pen.color = this.FBorderColor;
            hclCanvas.pen.style = TPenStyle.Dot;
            hclCanvas.pen.width = 1;

            hclCanvas.drawLineDriect(drawRect.left + this.FResizeInfo.DestX, Math.max(dataDrawTop, drawRect.top),
                drawRect.left + this.FResizeInfo.DestX, Math.min(dataDrawBottom, Math.min(drawRect.bottom, vBorderBottom)));
        } else if (this.Resizing && (this.FResizeInfo.TableSite == TTableSite.BorderBottom)) {
            hclCanvas.pen.color = this.FBorderColor;
            hclCanvas.pen.style = TPenStyle.Dot;
            hclCanvas.pen.width = 1;

            hclCanvas.drawLineDriect(drawRect.left, drawRect.top + this.FResizeInfo.DestY,
                drawRect.right, drawRect.top + this.FResizeInfo.DestY);
        }
        //#endregion
    }

    MouseDown(e) {
        let vResult = super.MouseDown(e);
        let vMouseDownRow = -1, vMouseDownCol = -1;
        let vCell = null, vEventArgs;
        let vCellPt = new TPoint();

        this.FMouseLBDowning = (e.button == TMouseButton.Left);
        this.FOutSelectInto = false;
        this.FSelecting = false;
        this.FDraging = false;
        this.FOutsideInfo.Row = -1;
        
        let vInfo = this.GetCellAt(e.x, e.y, vMouseDownRow, vMouseDownCol);
        this.FResizeInfo = vInfo.resizeInfo;
        vMouseDownRow = vInfo.row;
        vMouseDownCol = vInfo.col;

        this.Resizing = (e.button == TMouseButton.Left) 
          && ((this.FResizeInfo.TableSite == TTableSite.BorderRight) 
                ||(this.FResizeInfo.TableSite == TTableSite.BorderBottom)
              );

        if (this.Resizing) {
            if ((this.FMouseDownRow != vMouseDownRow) || (this.FMouseDownCol != vMouseDownCol)) {
                if (this.FMouseDownRow >= 0)
                    this.FRows[this.FMouseDownRow][this.FMouseDownCol].Active = false;

                this.FMouseDownRow = vMouseDownRow;
                this.FMouseDownCol = vMouseDownCol;
            }
            
            this.FMouseDownX = e.x;
            this.FMouseDownY = e.y;
            this.OwnerData.Style.updateInfoRePaint();
            return vResult;
        }

        if (this.FResizeInfo.TableSite == TTableSite.Cell) {
            if (this.CoordInSelect(e.x, e.y)) {
                if (this.FMouseLBDowning)
                    this.FDraging = true;
                
                if ((this.FMouseDownRow != vMouseDownRow) || (this.FMouseDownCol != vMouseDownCol)) {
                    if ((this.FMouseDownRow >= 0) && (e.button != TMouseButton.Right))
                        this.FRows[this.FMouseDownRow][this.FMouseDownCol].Active = false;

                    this.FMouseDownRow = vMouseDownRow;
                    this.FMouseDownCol = vMouseDownCol;
                }
                
                vCellPt = this.GetCellPostion(this.FMouseDownRow, this.FMouseDownCol);

                vEventArgs = new TMouseEventArgs();
                vEventArgs.assign(e);
                vEventArgs.x -= vCellPt.x;
                vEventArgs.y -= vCellPt.y;
                this.FRows[this.FMouseDownRow][this.FMouseDownCol].MouseDown(vEventArgs, this.FCellHPaddingPix, this.FCellVPaddingPix);
            } else {
                if ((vMouseDownRow != this.FMouseDownRow) || (vMouseDownCol != this.FMouseDownCol)) {
                    vCell = this.GetEditCell();
                    if (vCell != null)
                        vCell.Active = false;

                    this.OwnerData.Style.updateInfoReCaret();
                }

                this.DisSelect();
                
                if ((this.FMouseDownRow != vMouseDownRow) || (this.FMouseDownCol != vMouseDownCol)) {
                    if (this.FMouseDownRow >= 0)
                        this.FRows[this.FMouseDownRow][this.FMouseDownCol].Active = false;

                    this.FMouseDownRow = vMouseDownRow;
                    this.FMouseDownCol = vMouseDownCol;
                }
                
                this.FSelectCellRang.SetStart(this.FMouseDownRow, this.FMouseDownCol);
                
                vCellPt = this.GetCellPostion(this.FMouseDownRow, this.FMouseDownCol);
                
                vEventArgs = new TMouseEventArgs();
                vEventArgs.assign(e);
                vEventArgs.x -= vCellPt.x;
                vEventArgs.y -= vCellPt.y;
                this.FRows[this.FMouseDownRow][this.FMouseDownCol].MouseDown(vEventArgs, this.FCellHPaddingPix, this.FCellVPaddingPix);
            }
        } else {
            this.DisSelect();
            this.InitializeMouseInfo();

            if (this.FResizeInfo.TableSite == TTableSite.Outside) {
                this.FOutsideInfo.Row = vMouseDownRow;
                this.FOutsideInfo.Leftside = (e.x < 0);
            }
        }

        return vResult;
    }

    //#region MouseMove子方法
    AdjustSelectRang(vMoveRow, vMoveCol) {
        if (this.FSelectCellRang.StartRow >= 0) {
            for (let vR = this.FSelectCellRang.StartRow; vR <= this.FSelectCellRang.EndRow; vR++) {
                for (let vC = this.FSelectCellRang.StartCol; vC <= this.FSelectCellRang.EndCol; vC++) {
                    if ((vR == this.FMouseDownRow) && (vC == this.FMouseDownCol)) {
                        //
                    } else {
                        if (this.FRows[vR][vC].CellData != null)
                            this.FRows[vR][vC].CellData.DisSelect();
                    }
                }
            }
        }

        let vRow = -1, vCol = -1, vInfo;
        if (this.FMouseDownRow < 0){
            if (vMoveRow == 0) {
                this.FMouseDownRow = 0;
                this.FMouseDownCol = 0;
                
                this.FSelectCellRang.SetStart(this.FMouseDownRow, this.FMouseDownCol);
                this.FSelectCellRang.SetEnd(vMoveRow, vMoveCol);
            } else {
                vInfo = this.GetDestCell(this.RowCount - 1, this.FColWidths.count - 1);
                vRow = vInfo.row;
                vCol = vInfo.col;
                this.FMouseDownRow = vRow;
                this.FMouseDownCol = vCol;
                
                this.FSelectCellRang.SetStart(vMoveRow, vMoveCol);
                this.FSelectCellRang.SetEnd(this.FMouseDownRow, this.FMouseDownCol);
            }

            this.FOutSelectInto = true;
        } else if (this.FMouseMoveRow > this.FMouseDownRow) {
            this.FSelectCellRang.StartRow = this.FMouseDownRow;
            this.FSelectCellRang.EndRow = this.FMouseMoveRow;

            if (this.FMouseMoveCol < this.FMouseDownCol) {
                this.FSelectCellRang.StartCol = this.FMouseMoveCol;
                this.FSelectCellRang.EndCol = this.FMouseDownCol;
            } else {
                this.FSelectCellRang.StartCol = this.FMouseDownCol;
                this.FSelectCellRang.EndCol = this.FMouseMoveCol;
            }
        } else if (this.FMouseMoveRow < this.FMouseDownRow) {
            this.FSelectCellRang.StartRow = this.FMouseMoveRow;
            this.FSelectCellRang.EndRow = this.FMouseDownRow;
            
            if (this.FMouseMoveCol < this.FMouseDownCol) {
                this.FSelectCellRang.StartCol = this.FMouseMoveCol;
                this.FSelectCellRang.EndCol = this.FMouseDownCol;
            } else {
                this.FSelectCellRang.StartCol = this.FMouseDownCol;
                this.FSelectCellRang.EndCol = this.FMouseMoveCol;
            }
        } else {
            this.FSelectCellRang.StartRow = this.FMouseDownRow;
            this.FSelectCellRang.EndRow = this.FMouseMoveRow;
            
            if (this.FMouseMoveCol > this.FMouseDownCol) {
                this.FSelectCellRang.StartCol = this.FMouseDownCol;
                this.FSelectCellRang.EndCol = this.FMouseMoveCol;
            } else if (this.FMouseMoveCol < this.FMouseDownCol) {
                this.FSelectCellRang.StartCol = this.FMouseMoveCol;
                this.FSelectCellRang.EndCol = this.FMouseDownCol;
            } else {
                this.FSelectCellRang.StartCol = this.FMouseDownCol;
                this.FSelectCellRang.EndCol = this.FMouseMoveCol;
            }
        }

        if ((this.FSelectCellRang.StartRow == this.FSelectCellRang.EndRow)
            && (this.FSelectCellRang.StartCol == this.FSelectCellRang.EndCol))
        {
            this.FSelectCellRang.InitializeEnd();
        } else {
            if (this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].IsMergeSource()) {
                vInfo = this.GetDestCell(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol);
                vRow = vInfo.row;
                vCol = vInfo.col;
                this.FSelectCellRang.SetStart(vRow, vCol);
            }

            if (this.FRows[this.FSelectCellRang.EndRow][this.FSelectCellRang.EndCol].IsMergeDest()) {
                vInfo = this.GetSourceCell(this.FSelectCellRang.EndRow, this.FSelectCellRang.EndCol);
                vRow = vInfo.row;
                vCol = vInfo.col;
                this.FSelectCellRang.SetEnd(vRow, vCol);
            }

            if ((this.FSelectCellRang.StartRow == this.FSelectCellRang.EndRow)
                && (this.FSelectCellRang.StartCol == this.FSelectCellRang.EndCol))
                this.FSelectCellRang.InitializeEnd();
        }
    }

    MatchCellSelectState() {
        if (!this.FSelectCellRang.EditCell()) {
            for (let vR = this.FSelectCellRang.StartRow; vR <= this.FSelectCellRang.EndRow; vR++) {
                for (let vC = this.FSelectCellRang.StartCol; vC <= this.FSelectCellRang.EndCol; vC++) {
                    if (this.FRows[vR][vC].CellData != null)
                        this.FRows[vR][vC].CellData.SelectAll();
                }
            }
        }
    }
    //#endregion

    MouseMove(e) {
        let vResult = true;
        let vCellPt = new TPoint();

        if (this.ActiveDataResizing()) {
            vCellPt = this.GetCellPostion(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol);
            let vEventArgs = new TMouseEventArgs();
            vEventArgs.assign(e);
            e.x -= vCellPt.x;
            e.y -= vCellPt.y;
            this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].MouseMove(vEventArgs, this.FCellHPaddingPix, this.FCellVPaddingPix);

            return vResult;
        }

        if (this.Resizing) {
            this.FResizeInfo.DestX = e.x;
            this.FResizeInfo.DestY = e.y;
            this.OwnerData.Style.updateInfoRePaint();
            
            return vResult;
        }

        let vMoveRow = -1, vMoveCol = -1, vEventArgs;
        let vInfo = this.GetCellAt(e.x, e.y, vMoveRow, vMoveCol);
        let vResizeInfo = vInfo.resizeInfo;
        vMoveRow = vInfo.row;
        vMoveCol = vInfo.col;
        
        if (vResizeInfo.TableSite == TTableSite.Cell) {
            if (this.FMouseLBDowning || (e.button == TMouseButton.Left)) {
                if (this.FDraging || this.OwnerData.Style.updateInfo.draging) {
                    this.FMouseMoveRow = vMoveRow;
                    this.FMouseMoveCol = vMoveCol;
                    vCellPt = this.GetCellPostion(this.FMouseMoveRow, this.FMouseMoveCol);

                    vEventArgs = new TMouseEventArgs();
                    vEventArgs.assign(e);
                    vEventArgs.x -= vCellPt.x;
                    vEventArgs.y -= vCellPt.y;
                    this.FRows[this.FMouseMoveRow][this.FMouseMoveCol].MouseMove(vEventArgs, this.FCellHPaddingPix, this.FCellVPaddingPix);
                    
                    return vResult;
                }

                if (!this.FSelecting)
                    this.FSelecting = true;

                if ((vMoveRow != this.FMouseMoveRow) || (vMoveCol != this.FMouseMoveCol)) {
                    this.FMouseMoveRow = vMoveRow;
                    this.FMouseMoveCol = vMoveCol;

                    this.AdjustSelectRang(vMoveRow, vMoveCol);
                    this.MatchCellSelectState();
                }

                vCellPt = this.GetCellPostion(this.FMouseMoveRow, this.FMouseMoveCol);
                vEventArgs = new TMouseEventArgs();
                vEventArgs.assign(e);
                vEventArgs.x -= vCellPt.x;
                vEventArgs.y -= vCellPt.y;
                this.FRows[this.FMouseMoveRow][this.FMouseMoveCol].MouseMove(vEventArgs, this.FCellHPaddingPix, this.FCellVPaddingPix);
            } else {
                if ((vMoveRow != this.FMouseMoveRow) || (vMoveCol != this.FMouseMoveCol)) {
                    if ((this.FMouseMoveRow >= 0) && (this.FMouseMoveCol >= 0)) {
                        if (this.FRows[this.FMouseMoveRow][this.FMouseMoveCol].CellData != null)
                            this.FRows[this.FMouseMoveRow][this.FMouseMoveCol].CellData.MouseLeave();
                    }
                    
                    this.FMouseMoveRow = vMoveRow;
                    this.FMouseMoveCol = vMoveCol;
                }
                
                if ((this.FMouseMoveRow < 0) || (this.FMouseMoveCol < 0))
                    return vResult;
                
                vCellPt = this.GetCellPostion(this.FMouseMoveRow, this.FMouseMoveCol);
                vEventArgs = new TMouseEventArgs();
                vEventArgs.assign(e);
                vEventArgs.x -= vCellPt.x;
                vEventArgs.y -= vCellPt.y;
                this.FRows[this.FMouseMoveRow][this.FMouseMoveCol].MouseMove(vEventArgs, this.FCellHPaddingPix, this.FCellVPaddingPix);
            }
        } else {
            if ((this.FMouseMoveRow >= 0) && (this.FMouseMoveCol >= 0)) {
                if (this.FRows[this.FMouseMoveRow][this.FMouseMoveCol].CellData != null)
                    this.FRows[this.FMouseMoveRow][this.FMouseMoveCol].CellData.MouseLeave();
            }
            
            this.FMouseMoveRow = -1;
            this.FMouseMoveCol = -1;

            if (vResizeInfo.TableSite == TTableSite.BorderRight)
                HC.GCursor = TCursors.VSplit;
            else if (vResizeInfo.TableSite == TTableSite.BorderBottom)
                HC.GCursor = TCursors.HSplit;
        }

        if (this.OwnerData.Style.updateInfo.draging)
            this.FSelectCellRang.SetStart(this.FMouseMoveRow, this.FMouseMoveCol);

        return vResult;
    }

    MouseUp(e) {
        let vResult = true;
        let vCellPt = new TPoint();
        this.FMouseLBDowning = false;
        
        if (this.ActiveDataResizing()) {
            vCellPt = this.GetCellPostion(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol);
            let vEventArgs = new TMouseEventArgs();
            vEventArgs.assign(e);
            vEventArgs.x -= vCellPt.x;
            vEventArgs.y -= vCellPt.y;
            this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].MouseUp(vEventArgs, this.FCellHPaddingPix, this.FCellVPaddingPix);
            
            return vResult;
        }
        
        let vUpRow = -1, vUpCol = -1, vResizeInfo, vInfo, vEventArgs;
        if (this.Resizing) {
            if (this.FResizeInfo.TableSite == TTableSite.BorderRight) {
                vCellPt.x = e.x - this.FMouseDownX;
                if (vCellPt.x != 0) {
                    vInfo = this.GetCellAt(this.FMouseDownX, this.FMouseDownY, vUpRow, vUpCol, false);
                    vResizeInfo = vInfo.resizeInfo;
                    vUpRow = vInfo.row;
                    vUpCol = vInfo.col;
                    if ((vResizeInfo.TableSite != TTableSite.Outside) && (vCellPt.x != 0)) {
                        if (vCellPt.x > 0) {
                            if (vUpCol < this.FColWidths.count - 1) {
                                if (this.FColWidths[vUpCol + 1] - vCellPt.x < HC.MinColWidth)
                                    vCellPt.x = this.FColWidths[vUpCol + 1] - HC.MinColWidth;
                               
                                if (vCellPt.x != 0) {
                                    this.Undo_ColResize(vUpCol, this.FColWidths[vUpCol], this.FColWidths[vUpCol] + vCellPt.x);
                                    
                                    this.FColWidths[vUpCol] = this.FColWidths[vUpCol] + vCellPt.x;
                                    if (this.FResizeKeepWidth && (vUpCol < this.FColWidths.count - 1))
                                        this.FColWidths[vUpCol + 1] -= vCellPt.x;
                                }
                            } else {
                                if (this.FResizeKeepWidth && (this.FColWidths[vUpCol] + vCellPt.x > this.OwnerData.Width))
                                    vCellPt.x = this.OwnerData.Width - this.FColWidths[vUpCol + 1];

                                this.Undo_ColResize(vUpCol, this.FColWidths[vUpCol], this.FColWidths[vUpCol] + vCellPt.x);
                                this.FColWidths[vUpCol] = this.FColWidths[vUpCol] + vCellPt.x;
                            }
                        } else {
                            if (this.FColWidths[vUpCol] + vCellPt.x < HC.MinColWidth)
                                vCellPt.x = HC.MinColWidth - this.FColWidths[vUpCol];
                            
                            if (vCellPt.x != 0) {
                                this.Undo_ColResize(vUpCol, this.FColWidths[vUpCol], this.FColWidths[vUpCol] + vCellPt.x);
                                
                                this.FColWidths[vUpCol] = this.FColWidths[vUpCol] + vCellPt.x;
                                if (this.FResizeKeepWidth && (vUpCol < this.FColWidths.count - 1))
                                    this.FColWidths[vUpCol + 1] += vCellPt.x;
                            }
                        }
                    }
                }
            } else if (this.FResizeInfo.TableSite == TTableSite.BorderBottom) {
                vCellPt.y = e.y - this.FMouseDownY;
                if (vCellPt.y != 0) {
                    this.Undo_RowResize(this.FMouseDownRow, this.FRows[this.FMouseDownRow].Height, this.FRows[this.FMouseDownRow].Height + vCellPt.y);
                    this.FRows[this.FMouseDownRow].Height = this.FRows[this.FMouseDownRow].Height + vCellPt.y;
                    this.FRows[this.FMouseDownRow].AutoHeight = false;
                }
            }

            this.FormatDirty();
            this.Resizing = false;
            HC.GCursor = TCursors.Default;
            this.OwnerData.Style.updateInfoRePaint();
            this.OwnerData.Style.updateInfoReCaret();
            
            return vResult;
        }

        if (this.FSelecting || this.OwnerData.Style.updateInfo.Selecting) {
            this.FSelecting = false;
            
            if ((this.FMouseDownRow >= 0) && (!this.FOutSelectInto)) {
                vCellPt = this.GetCellPostion(this.FMouseDownRow, this.FMouseDownCol);

                vEventArgs = new TMouseEventArgs();
                vEventArgs.assign(e);
                vEventArgs.x -= vCellPt.x;
                vEventArgs.y -= vCellPt.y;
                this.FRows[this.FMouseDownRow][this.FMouseDownCol].MouseUp(vEventArgs, this.FCellHPaddingPix, this.FCellVPaddingPix);
            }

            vInfo = this.GetCellAt(e.x, e.y, vUpRow, vUpCol);
            vResizeInfo = vInfo.resizeInfo;
            vUpRow = vInfo.row;
            vUpCol = vInfo.col;
            if (vResizeInfo.TableSite == TTableSite.Cell) {
                if ((vUpRow != this.FMouseDownRow) || (vUpCol != this.FMouseDownCol)) {
                    vCellPt = this.GetCellPostion(vUpRow, vUpCol);

                    vEventArgs = new TMouseEventArgs();
                    vEventArgs.assign(e);
                    vEventArgs.x -= vCellPt.x;
                    vEventArgs.y -= vCellPt.y;
                    this.FRows[vUpRow][vUpCol].MouseUp(vEventArgs, this.FCellHPaddingPix, this.FCellVPaddingPix);
                }
            }
        } else if (this.FDraging || this.OwnerData.Style.updateInfo.draging) {
            this.FDraging = false;
            vInfo = this.GetCellAt(e.x, e.y, vUpRow, vUpCol);
            vResizeInfo = vInfo;
            vUpRow = vInfo.row;
            vUpCol = vInfo.col;

            if (vResizeInfo.TableSite == TTableSite.Cell) {
                this.DisSelect();
                this.FMouseMoveRow = vUpRow;
                this.FMouseMoveCol = vUpCol;
       
                this.FSelectCellRang.StartRow = vUpRow;
                this.FSelectCellRang.StartCol = vUpCol;
                vCellPt = this.GetCellPostion(vUpRow, vUpCol);

                vEventArgs = new TMouseEventArgs();
                vEventArgs.assign(e);
                vEventArgs.x -= vCellPt.x;
                vEventArgs.y -= vCellPt.y;
                this.FRows[vUpRow][vUpCol].MouseUp(vEventArgs, this.FCellHPaddingPix, this.FCellVPaddingPix);
            }
        } else if (this.FMouseDownRow >= 0) {
            vCellPt = this.GetCellPostion(this.FMouseDownRow, this.FMouseDownCol);

            vEventArgs = new TMouseEventArgs();
            vEventArgs.assign(e);
            vEventArgs.x -= vCellPt.x;
            vEventArgs.y -= vCellPt.y;
            this.FRows[this.FMouseDownRow][this.FMouseDownCol].MouseUp(vEventArgs, this.FCellHPaddingPix, this.FCellVPaddingPix);
        }

        return vResult;
    }

    MouseLeave() {
        super.MouseLeave();
        if ((this.FMouseMoveRow < 0) || (this.FMouseMoveCol < 0))
            return;

        if (this.FRows[this.FMouseMoveRow][this.FMouseMoveCol].CellData != null)
            this.FRows[this.FMouseMoveRow][this.FMouseMoveCol].CellData.MouseLeave();

        if (!this.SelectExists())
            this.InitializeMouseInfo();
    }

    ClearFormatExtraHeight() {
        if (this.Height == this.FFormatHeight)
            return 0;

        let vOldHeight = this.Height, vRowFrom = -1, vResult = 0, vCell;
        for (let vR = this.FRows.count - 1; vR >= 0; vR--) {
            if (this.FRows[vR].FmtOffset != 0) {
                vRowFrom = vR;
                this.FRows[vR].FmtOffset = 0;
            }

            for (let vC = 0; vC < this.ColCount; vC++) {
                vCell = this.FRows[vR][vC];
                if ((vCell.ClearFormatExtraHeight() != 0)
                     || ((vCell.CellData != null) && (vCell.Height != this.FCellHPaddingPix + vCell.CellData.height + this.FCellHPaddingPix)))
                {
                    vRowFrom = vR;
                    this.CalcRowCellHeight(vR);
                }
            }
        }

        if (vRowFrom >= 0) {
            this.CalcMergeRowHeightFrom(vRowFrom);
            this.Height = this.GetFormatHeight();
            vResult = vOldHeight - this.Height;
        }

        return vResult;
    }

    DeleteSelected() {
        let vResult = super.DeleteSelected();

        if (this.FSelectCellRang.StartRow >= 0) {
            if (this.FSelectCellRang.EndRow >= 0) {
                this.FMulCellUndo.Enable = true;
                try {
                    let vUndoList = this.GetSelfUndoList();
                    vUndoList.UndoGroupBegin(0, 0);
                    try {
                        for (let vR = this.FSelectCellRang.StartRow; vR <= this.FSelectCellRang.EndRow; vR++) {
                            for (let vC = this.FSelectCellRang.StartCol; vC <= this.FSelectCellRang.EndCol; vC++) {
                                if (this.FRows[vR][vC].CellData != null) {
                                    this.FMulCellUndo.Init(vR, vC);
                                    this.FRows[vR][vC].CellData.DeleteSelected();
                                }
                            }
                        }
                    } finally {
                        vUndoList.UndoGroupEnd(0, 0);
                    }
                } finally {
                    this.FMulCellUndo.Enable = false;
                }

                this.FormatDirty();
                vResult = true;
            } else {
                let vEvent = () => {
                    vResult = this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].CellData.DeleteSelected();
                }

                this.CellChangeByAction(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol, vEvent);
            }
        }

        return vResult;
    }

    DisSelect() {
        super.DisSelect();
        this.DisSelectSelectedCell();
        this.InitializeMouseInfo();
        this.FSelectCellRang.Initialize();
        this.FSelecting = false;
        this.FDraging = false;
        this.FOutSelectInto = false;
    }


    FormatDirty() {
        this.FFormatDirty = true;
        super.FormatDirty();
    }

    MarkStyleUsed(mark) {
        super.MarkStyleUsed(mark);
        for (let vR = 0; vR <= this.FRows.count - 1; vR++) {
            for (let vC = 0; vC < this.FRows[vR].ColCount; vC++) {
                if (this.FRows[vR][vC].CellData != null)
                    this.FRows[vR][vC].CellData.MarkStyleUsed(mark);
            }
        }
    }

    GetCaretInfo(aCaretInfo) {
        let vRow = -1, vCol = -1;

        if (this.OwnerData.Style.updateInfo.draging) {
            vRow = this.FMouseMoveRow;
            vCol = this.FMouseMoveCol;
        } else {
            vRow = this.FSelectCellRang.StartRow;
            vCol = this.FSelectCellRang.StartCol;
        }

        let vCaretCell = null, vTop = -1, vBottom = -1;
        if (vRow < 0) {
            if (this.FOutsideInfo.Row >= 0) {
                if (this.FOutsideInfo.Leftside)
                    aCaretInfo.x = aCaretInfo.x - 2;

                vTop = 0;
                for (let i = this.FPageBreaks.count - 1; i >= 0; i--) {
                    if (this.FPageBreaks[i].Row <= this.FOutsideInfo.Row) {
                        if (this.FPageBreaks[i].PageIndex == aCaretInfo.PageIndex - 1) {
                            vTop = this.FPageBreaks[i].BreakBottom;
                            break;
                        }
                    }
                }

                vBottom = this.Height;
                for (let i = 0; i <= this.FPageBreaks.count - 1; i++) {
                    if (this.FPageBreaks[i].Row >= this.FOutsideInfo.Row) {
                        if (this.FPageBreaks[i].PageIndex == aCaretInfo.PageIndex) {
                            vBottom = this.FPageBreaks[i].BreakSeat;
                            break;
                        }
                    }
                }

                aCaretInfo.y = aCaretInfo.y + vTop;
                aCaretInfo.height = vBottom - vTop;
            } else
                aCaretInfo.visible = false;

            return;
        } else
            vCaretCell = this.FRows[vRow][vCol];

        if (this.OwnerData.Style.updateInfo.draging) {
            if ((vCaretCell.CellData.MouseMoveItemNo < 0)
                || (vCaretCell.CellData.MouseMoveItemOffset < 0))
            {
                aCaretInfo.visible = false;
                return;
            }

            vCaretCell.GetCaretInfo(vCaretCell.CellData.MouseMoveItemNo,
                vCaretCell.CellData.MouseMoveItemOffset, this.FCellHPaddingPix, this.FCellVPaddingPix, aCaretInfo);
        } else {
            if ((vCaretCell.CellData.SelectInfo.StartItemNo < 0)
                || (vCaretCell.CellData.SelectInfo.StartItemOffset < 0))
            {
                aCaretInfo.visible = false;
                return;
            }

            vCaretCell.GetCaretInfo(vCaretCell.CellData.SelectInfo.StartItemNo,
                vCaretCell.CellData.SelectInfo.StartItemOffset, this.FCellHPaddingPix, 
                this.FCellVPaddingPix, aCaretInfo);
        }

        let vPos = this.GetCellPostion(vRow, vCol);
        aCaretInfo.x = vPos.x + aCaretInfo.x;
        aCaretInfo.y = vPos.y + aCaretInfo.y;
    }

    SetActive(val) {
        if (this.Active != val) {
            let vCell = this.GetEditCell();
            if (vCell != null)
                vCell.Active = val;

            if (!val)
                this.InitializeMouseInfo();

            super.SetActive(val);
        }
    }

    DoSelfUndoNew() {
        if (this.FMulCellUndo.Enable) {
            let vResult = new THCDataUndo();
            let vMulCellUndoData = new THCMulCellUndoData();
            vMulCellUndoData.Row = this.FMulCellUndo.Row;
            vMulCellUndoData.Col = this.FMulCellUndo.Col;
            vResult.Data = vMulCellUndoData;
            return vResult;
        } else if (this.FSelectCellRang.EditCell()) {
            let vResult = new THCDataUndo();
            let vCellUndoData = new THCCellUndoData();
            vCellUndoData.Row = this.FSelectCellRang.StartRow;
            vCellUndoData.Col = this.FSelectCellRang.StartCol;
            vResult.Data = vCellUndoData;
            return vResult;
        } else
            return super.DoSelfUndoNew();
    }

    DoSelfUndoDestroy(aUndo) {
        if (aUndo.Data.isClass(THCCellUndoData)) {
            aUndo.Data.dispose();
            aUndo.Data = null;
        }

        super.DoSelfUndoDestroy(aUndo);
    }

    DoSelfUndo(aUndo) {
        this.InitializeMouseInfo();
        this.FSelectCellRang.Initialize();

        if (aUndo.Data.isClass(THCMulCellUndoData)) {
            let vMulCellUndoData = aUndo.Data;
            this.FRows[vMulCellUndoData.Row][vMulCellUndoData.Col].CellData.Undo(aUndo);
            this.FormatDirty();
        } else if (aUndo.Data.isClass(THCCellUndoData)) {
            let vCellUndoData = aUndo.Data;
            this.FSelectCellRang.StartRow = vCellUndoData.Row;
            this.FSelectCellRang.StartCol = vCellUndoData.Col;

            let vEvent = () => {
                this.FRows[vCellUndoData.Row][vCellUndoData.Col].CellData.Undo(aUndo);
            }

            this.CellChangeByAction(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol, vEvent);
        } else if (aUndo.Data.isClass(THCColSizeUndoData)) {
            let vColSizeUndoData = aUndo.Data;
            if (this.FResizeKeepWidth && (vColSizeUndoData.Col < this.FColWidths.count - 1)) {
                this.FColWidths[vColSizeUndoData.Col + 1] = this.FColWidths[vColSizeUndoData.Col + 1]
                    + vColSizeUndoData.NewWidth - vColSizeUndoData.OldWidth;
            }

            this.FColWidths[vColSizeUndoData.Col] = vColSizeUndoData.OldWidth;
            this.FormatDirty();
        } else if (aUndo.Data.isClass(THCRowSizeUndoData)) {
            let vRowSizeUndoData = aUndo.Data;
            this.FRows[vRowSizeUndoData.Row].Height = vRowSizeUndoData.OldHeight;
            this.FormatDirty();
        } else if (aUndo.Data.isClass(THCMirrorUndoData)) {
            let vStream = new TStream();
            try {
                this.SaveToStream(vStream);
                let vMirrorUndoData = aUndo.Data;
                vMirrorUndoData.Stream.Position = 0;
                let vStyleNo = vMirrorUndoData.Stream.readInt32();
                this.LoadFromStream(vMirrorUndoData.Stream, this.OwnerData.Style, HC.HC_FileVersionInt);

                vMirrorUndoData.Stream.SetLength(0);
                vStream.copyTo(vMirrorUndoData.Stream);
                this.FormatDirty();
            } finally {
                //vStream.dispose();
                vStream = null;
            }
        } else
            super.DoSelfUndo(aUndo);
    }

    DoSelfRedo(aRedo) {
        this.InitializeMouseInfo();
        this.FSelectCellRang.Initialize();

        if (aRedo.Data.isClass(THCMulCellUndoData)) {
            let vMulCellUndoData = aRedo.Data;
            this.FRows[vMulCellUndoData.Row][vMulCellUndoData.Col].CellData.Redo(aRedo);
            this.FormatDirty();
        } else if (aRedo.Data.isClass(THCCellUndoData)) {
            let vCellUndoData = aRedo.Data;
            this.FSelectCellRang.StartRow = vCellUndoData.Row;
            this.FSelectCellRang.StartCol = vCellUndoData.Col;

            let vEvent = () => {
                this.FRows[vCellUndoData.Row][vCellUndoData.Col].CellData.Redo(aRedo);
            }

            this.CellChangeByAction(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol, vEvent);
        } else if (aRedo.Data.isClass(THCColSizeUndoData)) {
            let vColSizeUndoData = aRedo.Data;
            if (this.FResizeKeepWidth && (vColSizeUndoData.Col < this.FColWidths.count - 1)) {
                this.FColWidths[vColSizeUndoData.Col + 1] = this.FColWidths[vColSizeUndoData.Col + 1]
                    - vColSizeUndoData.NewWidth - vColSizeUndoData.OldWidth;
            }

            this.FColWidths[vColSizeUndoData.Col] = vColSizeUndoData.NewWidth;
            this.FormatDirty();
        } else if (aRedo.Data.isClass(THCRowSizeUndoData)) {
            let vRowSizeUndoData = aRedo.Data;
            this.FRows[vRowSizeUndoData.Row].Height = vRowSizeUndoData.NewHeight;
            this.FormatDirty();
        } else if (aRedo.Data.isClass(THCMirrorUndoData)) {
            let vStream = new TStream();
            try {
                this.SaveToStream(vStream);
                let vMirrorUndoData = aRedo.Data;
                vMirrorUndoData.Stream.Position = 0;
                let vStyleNo = vMirrorUndoData.Stream.readInt32();
                this.LoadFromStream(vMirrorUndoData.Stream, this.OwnerData.Style, HC.HC_FileVersionInt);

                vMirrorUndoData.Stream.SetLength(0);
                vStream.copyTo(vMirrorUndoData.Stream);  // 保存恢复前状态
                this.FormatDirty();
            } finally {
                //vStream.dispose();
                vStream = null;
            }
        } else
            super.DoSelfRedo(aRedo);
    }

    Undo_ColResize(col, oldWidth, newWidth) {
        let vUndoList = this.GetSelfUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            this.SelfUndo_New();
            let vUndo = vUndoList.last;
            if (vUndo != null) {
                let vColSizeUndoData = new THCColSizeUndoData();
                vColSizeUndoData.Col = col;
                vColSizeUndoData.OldWidth = oldWidth;
                vColSizeUndoData.NewWidth = newWidth;

                vUndo.Data = vColSizeUndoData;
            }
        }
    }

    Undo_RowResize(row, oldHeight, newHeight) {
        let vUndoList = this.GetSelfUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            this.SelfUndo_New();
            let vUndo = vUndoList.last;
            if (vUndoList != null) {
                let vRowSizeUndoData = new THCRowSizeUndoData();
                vRowSizeUndoData.Row = row;
                vRowSizeUndoData.OldHeight = oldHeight;
                vRowSizeUndoData.NewHeight = newHeight;

                vUndo.Data = vRowSizeUndoData;
            }
        }
    }

    Undo_Mirror() {
        let vUndoList = this.GetSelfUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            this.SelfUndo_New();
            let vUndo = vUndoList.last;
            if (vUndo != null) {
                let vMirrorUndoData = new THCMirrorUndoData();
                this.SaveToStream(vMirrorUndoData.Stream);
                vUndo.Data = vMirrorUndoData;
            }
        }
    }

    GetRowCount() {
        return this.FRows.count;
    }

    GetColCount() {
        return this.FColWidths.count;
    }

    CheckFixColSafe(col) {
        if (this.FFixCol + this.FFixColCount - 1 >= col) {
            this.FFixCol = -1;
            this.FFixColCount = 0;
        }
    }

    CheckFixRowSafe(row) {
        if (this.FFixRow + this.FFixRowCount - 1 >= row) {
            this.FFixRow = -1;
            this.FFixRowCount = 0;
        }
    }

    AdjustCellRange(aStartRow, aStartCol, aEndRow, aEndCol) {
        let vLastRow = aEndRow;
        let vLastCol = aEndCol;
        let vCell = null, vInfo;
        let vDestRow = -1, vDestCol = -1;
        for (let vR = aStartRow; vR <= aEndRow; vR++) {
            for (let vC = aStartCol; vC <= aEndCol; vC++) {
                vCell = this.FRows[vR][vC];
                if ((vCell.RowSpan > 0) || (vCell.ColSpan > 0)) {
                    vInfo = this.GetDestCell(vR, vC);
                    vDestRow = vInfo.row;
                    vDestCol = vInfo.col;
                    vCell = this.FRows[vDestRow][vDestCol];
                    vDestRow = vDestRow + vCell.RowSpan;
                    vDestCol = vDestCol + vCell.ColSpan;
                    if (vLastRow < vDestRow)
                        vLastRow = vDestRow;

                    if (vLastCol < vDestCol)
                        vLastCol = vDestCol;
                }
            }
        }

        aEndRow = vLastRow;
        aEndCol = vLastCol;
    }
    //#region

    DeleteEmptyRows(aSRow, aERow) {
        let vEmptyRow;
        for (let vR = aERow; vR >= aSRow; vR--) {
            vEmptyRow = true;
            for (let vC = 0; vC < this.FRows[vR].ColCount; vC++) {
                if (this.FRows[vR][vC].CellData != null) {
                    vEmptyRow = false;  // 不是空行
                    break;
                }
            }

            if (vEmptyRow) {
                for (let i = 0; i < vR; i++) {
                    for (let vC = 0; vC < this.FRows[i].ColCount; vC++) {
                        if (this.FRows[i][vC].RowSpan > 0)
                            this.FRows[i][vC].RowSpan--;
                    }
                }

                for (let i = vR + 1; i < this.FRows.count; i++) {
                    for (let vC = 0; vC < this.FRows[i].ColCount; vC++) {
                        if (this.FRows[i][vC].RowSpan < 0)
                            this.FRows[i][vC].RowSpan++;
                    }
                }

                this.FRows.RemoveAt(vR);
            }
        }
    }

    DeleteEmptyCols(aSCol, aECol) {
        let vEmptyCol = false;

        for (let vC = aECol; vC >= aSCol; vC--) {
            vEmptyCol = true;
            for (let vR = 0; vR < this.RowCount; vR++) {
                if (this.FRows[vR][vC].CellData != null) {
                    vEmptyCol = false;
                    break;
                }
            }

            if (vEmptyCol) {
                let vTableCell = null;
                for (let vR = this.RowCount - 1; vR >= 0; vR--) {
                    for (let i = 0; i < vC; i++) {
                        vTableCell = this.FRows[vR][i];
                        if (i + vTableCell.ColSpan >= vC)
                            vTableCell.ColSpan = vTableCell.ColSpan - 1;
                    }

                    for (let i = vC; i < this.FRows[vR].ColCount; i++) {
                        vTableCell = this.FRows[vR][i];
                        if (i + vTableCell.ColSpan < vC)
                            vTableCell.ColSpan = vTableCell.ColSpan + 1;
                    }

                    this.FRows[vR].RemoveAt(vC);
                }

                this.FColWidths[vC - 1] += this.FBorderWidthPix + this.FColWidths[vC];
                this.FColWidths.RemoveAt(vC);
            }
        }
    }
    //#endregion

    MergeCells(aStartRow, aStartCol, aEndRow, aEndCol) {
        let vResult = false;
        let vEndRow = aEndRow;
        let vEndCol = aEndCol;

        let vInfo = this.AdjustCellRange(aStartRow, aStartCol, vEndRow, vEndCol);
        vEndRow = vInfo.row;
        vEndCol = vInfo.col;

        vResult = this.CellsCanMerge(aStartRow, aStartCol, vEndRow, vEndCol);
        if (!vResult)
            return vResult;

        if (aStartRow == vEndRow) {
            for (let vC = aStartCol + 1; vC <= vEndCol; vC++) {
                if (this.FRows[aStartRow][vC].CellData != null) {
                    this.FRows[aStartRow][aStartCol].CellData.AddData(this.FRows[aStartRow][vC].CellData);
                    this.FRows[aStartRow][vC].CellData.dispose();
                    this.FRows[aStartRow][vC].CellData = null;
                }

                this.FRows[aStartRow][vC].ColSpan = aStartCol - vC;
            }

            this.FRows[aStartRow][aStartCol].ColSpan = vEndCol - aStartCol;

            this.DeleteEmptyCols(aStartCol + 1, vEndCol);
            vResult = true;
        } else if (aStartCol == vEndCol) {
            for (let vR = aStartRow + 1; vR <= vEndRow; vR++) {
                if (this.FRows[vR][aStartCol].CellData != null) {
                    this.FRows[aStartRow][aStartCol].CellData.AddData(this.FRows[vR][aStartCol].CellData);
                    this.FRows[vR][aStartCol].CellData.dispose();
                    this.FRows[vR][aStartCol].CellData = null;
                }

                this.FRows[vR][aStartCol].RowSpan = aStartRow - vR;
            }

            this.FRows[aStartRow][aStartCol].RowSpan = vEndRow - aStartRow;

            this.DeleteEmptyRows(aStartRow + 1, vEndRow);
            vResult = true;
        } else {
            for (let vC = aStartCol + 1; vC <= vEndCol; vC++) {
                if (this.FRows[aStartRow][vC].CellData != null) {
                    this.FRows[aStartRow][aStartCol].CellData.AddData(this.FRows[aStartRow][vC].CellData);
                    this.FRows[aStartRow][vC].CellData.dispose();
                    this.FRows[aStartRow][vC].CellData = null;
                }

                this.FRows[aStartRow][vC].RowSpan = 0;
                this.FRows[aStartRow][vC].ColSpan = aStartCol - vC;
            }

            for (let vR = aStartRow + 1; vR <= vEndRow; vR++) {
                for (let vC = aStartCol; vC <= vEndCol; vC++) {
                    if (this.FRows[vR][vC].CellData != null) {
                        this.FRows[aStartRow][aStartCol].CellData.AddData(this.FRows[vR][vC].CellData);
                        this.FRows[vR][vC].CellData.dispose();
                        this.FRows[vR][vC].CellData = null;
                    }

                    this.FRows[vR][vC].ColSpan = aStartCol - vC;
                    this.FRows[vR][vC].RowSpan = aStartRow - vR;
                }
            }

            this.FRows[aStartRow][aStartCol].RowSpan = vEndRow - aStartRow;
            this.FRows[aStartRow][aStartCol].ColSpan = vEndCol - aStartCol;

            this.DeleteEmptyRows(aStartRow + 1, vEndRow);
            this.DeleteEmptyCols(aStartCol + 1, vEndCol);
            vResult = true;
        }

        return vResult;
    }

    GetCells(aRow, aCol) {
        return this.FRows[aRow][aCol];
    }

    GetColWidth(aIndex) {
        return this.FColWidths[aIndex];
    }

    InsertCol(aCol, aCount) {
        let viDestRow = -1, viDestCol = -1, vCell, vInfo;
        let vWidth = HC.MinColWidth - this.FBorderWidthPix;
        for (let i = 0; i < aCount; i++) {
            for (let vRow = 0; vRow < this.RowCount; vRow++) {
                vCell = new THCTableCell(this.OwnerData.Style);
                vCell.Width = vWidth;
                this.InitializeCellData(vCell.CellData);

                if ((aCol < this.FColWidths.count) && (this.FRows[vRow][aCol].ColSpan < 0)) {
                    vInfo = this.GetDestCell(vRow, aCol);
                    viDestRow = vInfo.row;
                    viDestCol = vInfo.col;

                    vCell.CellData.dispose();
                    vCell.CellData = null;
                    vCell.RowSpan = this.FRows[vRow][aCol].RowSpan;
                    vCell.ColSpan = this.FRows[vRow][aCol].ColSpan;

                    for (let j = aCol; j <= viDestCol + this.FRows[viDestRow][viDestCol].ColSpan; j++)
                        this.FRows[vRow][j].ColSpan = this.FRows[vRow][j].ColSpan - 1;

                    if (vRow == viDestRow + this.FRows[viDestRow][viDestCol].RowSpan)
                        this.FRows[viDestRow][viDestCol].ColSpan++;
                }

                this.FRows[vRow].insert(aCol, vCell);
            }

            this.FColWidths.insert(aCol, vWidth);
        }

        this.InitializeMouseInfo();
        this.FSelectCellRang.Initialize();
        this.SizeChanged = true;

        return true;
    }

    InsertRow(aRow, aCount) {
        let viDestRow = -1, viDestCol = -1, vTableRow, vInfo;

        for (let i = 0; i < aCount; i++) {
            vTableRow = new THCTableRow(this.OwnerData.Style, this.FColWidths.count);
            for (let vCol = 0; vCol <= this.FColWidths.count - 1; vCol++) {
                vTableRow[vCol].Width = this.FColWidths[vCol];

                if ((aRow < this.FRows.count) && (this.FRows[aRow][vCol].RowSpan < 0)) {
                    vInfo = this.GetDestCell(aRow, vCol);
                    viDestRow = vInfo.row;
                    viDestCol = vInfo.col;

                    vTableRow[vCol].CellData.dispose();
                    vTableRow[vCol].CellData = null;
                    vTableRow[vCol].RowSpan = this.FRows[aRow][vCol].RowSpan;
                    vTableRow[vCol].ColSpan = this.FRows[aRow][vCol].ColSpan;

                    for (let j = aRow; j <= viDestRow + this.FRows[viDestRow][viDestCol].RowSpan; j++)
                        this.FRows[j][vCol].RowSpan--;

                    if (vCol == viDestCol + this.FRows[viDestRow][viDestCol].ColSpan)
                        this.FRows[viDestRow][viDestCol].RowSpan++;
                }
            }

            this.FRows.insert(aRow, vTableRow);
        }

        this.InitializeMouseInfo();
        this.FSelectCellRang.Initialize();
        this.SizeChanged = true;

        return true;
    }

    DeleteCol(aCol) {
        if (!this.ColCanDelete(aCol))
            return false;

        let viDestRow = -1, viDestCol = -1, vInfo;
        for (let vRow = 0; vRow < this.RowCount; vRow++) {
            if (this.FRows[vRow][aCol].ColSpan < 0) {
                vInfo = this.GetDestCell(vRow, aCol);
                viDestRow = vInfo.row;
                viDestCol = vInfo.col;

                for (let i = aCol; i <= viDestCol + this.FRows[viDestRow][viDestCol].ColSpan; i++)
                    this.FRows[vRow][i].ColSpan++;

                if (vRow == viDestRow + this.FRows[viDestRow][viDestCol].RowSpan)
                    this.FRows[viDestRow][viDestCol].ColSpan--;
            } else if (this.FRows[vRow][aCol].ColSpan > 0) {
                //
            }

            this.FRows[vRow].RemoveAt(aCol);
        }

        this.FColWidths.RemoveAt(aCol);
        this.CheckFixColSafe(aCol);
        this.InitializeMouseInfo();
        this.FSelectCellRang.Initialize();
        this.SizeChanged = true;

        return true;
    }

    DeleteRow(aRow) {
        if (!this.RowCanDelete(aRow))
            return false;

        let viDestRow = -1, viDestCol = -1, vInfo;
        for (let vCol = 0; vCol < this.FColWidths.count; vCol++) {
            if (this.FRows[aRow][vCol].RowSpan < 0) {
                vInfo = this.GetDestCell(aRow, vCol);
                viDestRow = vInfo.row;
                viDestCol = vInfo.col;
                for (let i = aRow; i <= viDestRow + this.FRows[viDestRow][viDestCol].RowSpan; i++)
                    this.FRows[i][vCol].RowSpan++;

                if (vCol == viDestCol + this.FRows[viDestRow][viDestCol].ColSpan)
                    this.FRows[viDestRow][viDestCol].RowSpan--;
            } else if (this.FRows[aRow][vCol].ColSpan > 0) {
                //
            }
        }

        this.FRows.RemoveAt(aRow);
        this.CheckFixRowSafe(aRow);
        this.InitializeMouseInfo();
        this.FSelectCellRang.Initialize();
        this.SizeChanged = true;

        return true;
    }

    dispose() {
        this.FSelectCellRang.dispose();
        this.FRows.clear();
        super.dispose();
    }

    Assign(source) {
        super.Assign(source);
        let vSrcTable = source;

        this.FBorderVisible = vSrcTable.BorderVisible;
        this.BorderWidthPt = vSrcTable.BorderWidthPt;
        this.CellHPaddingMM = vSrcTable.CellHPaddingMM;
        this.CellVPaddingMM = vSrcTable.CellVPaddingMM;
        this.FFixRow = vSrcTable.FixRow;
        this.FFixRowCount = vSrcTable.FixRowCount;
        this.FFixCol = vSrcTable.FixCol;
        this.FFixColCount = vSrcTable.FixColCount;

        for (let vC = 0; vC < this.ColCount; vC++)
            this.FColWidths[vC] = vSrcTable.FColWidths[vC];

        for (let vR = 0; vR < this.RowCount; vR++) {
            this.FRows[vR].AutoHeight = vSrcTable.Rows[vR].AutoHeight;
            this.FRows[vR].Height = vSrcTable.Rows[vR].Height;

            for (let vC = 0; vC <= this.ColCount - 1; vC++) {
                this.FRows[vR][vC].Width = this.FColWidths[vC];
                this.FRows[vR][vC].RowSpan = vSrcTable[vR, vC].RowSpan;
                this.FRows[vR][vC].ColSpan = vSrcTable[vR, vC].ColSpan;
                this.FRows[vR][vC].BackgroundColor = vSrcTable[vR, vC].BackgroundColor;
                this.FRows[vR][vC].AlignVert = vSrcTable[vR, vC].AlignVert;
                this.FRows[vR][vC].BorderSides = vSrcTable[vR, vC].BorderSides;

                if (vSrcTable[vR][vC].CellData != null)
                    this.FRows[vR][vC].CellData.AddData(vSrcTable[vR, vC].CellData);
                else {
                    this.FRows[vR][vC].CellData.dispose();
                    this.FRows[vR][vC].CellData = null;
                }
            }
        }
    }

    DblClick(x, y) {
        if (this.FSelectCellRang.EditCell()) {
            let vPt = this.GetCellPostion(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol);
            this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].CellData.DblClick(
                x - vPt.x - this.FCellHPaddingPix, y - vPt.y - this.FCellVPaddingPix);
        } else
            super.DblClick(x, y);
    }

    CoordInSelect(x, y) {
        let vResult = super.CoordInSelect(x, y);
        if (vResult) {
            let vRow = -1, vCol = -1;
            let vInfo = this.GetCellAt(x, y, vRow, vCol);
            let vResizeInfo = vInfo.resizeInfo;
            vRow = vInfo.row;
            vCol = vInfo.col;
            
            vResult = vResizeInfo.TableSite == TTableSite.Cell;
            if (vResult) {
                if (this.FSelectCellRang.StartRow >= 0) {
                    if (this.FSelectCellRang.EndRow >= 0) {
                        vResult = (vRow >= this.FSelectCellRang.StartRow)
                            && (vRow <= this.FSelectCellRang.EndRow)
                            && (vCol >= this.FSelectCellRang.StartCol)
                            && (vCol <= this.FSelectCellRang.EndCol);
                    } else {
                        let vCellData = this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].CellData;
                        if (vCellData.SelectExists()) {
                            let vCellPt = this.GetCellPostion(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol);
                            let vX = x - vCellPt.x - this.FCellHPaddingPix;
                            let vY = y - vCellPt.y - this.FCellVPaddingPix;
                            let vItemNo = -1, vOffset = -1, vDrawItemNo = -1;
                            let vRestrain = false;
                            vInfo = vCellData.GetItemAt(vX, vY, vItemNo, vOffset, vDrawItemNo, vRestrain);
                            vItemNo = vInfo.itemNo;
                            vOffset = vInfo.offset;
                            vDrawItemNo = vInfo.drawItemNo;
                            vRestrain = vInfo.restrain;
                            vResult = vCellData.CoordInSelect(vX, vY, vItemNo, vOffset, vRestrain);
                        }
                    }
                }
            }
        }

        return vResult;
    }

    GetTopLevelDataAt(x, y) {
        let vResult = null;
        let vRow = -1, vCol = -1;
        let vInfo = this.GetCellAt(x, y, vRow, vCol);
        let vResizeInfo = vInfo.resizeInfo;
        vRow = vInfo.row;
        vCol = vInfo.col;
        if ((vRow < 0) || (vCol < 0))
            return vResult;

        let vCellPt = this.GetCellPostion(vRow, vCol);
        vResult = this.FRows[vRow][vCol].CellData.GetTopLevelDataAt(
            x - vCellPt.x - this.FCellHPaddingPix, y - vCellPt.y - this.FCellVPaddingPix);

        return vResult;
    }

    GetTopLevelData() {
        let vCell = this.GetEditCell();
        if (vCell != null)
            return vCell.CellData.GetTopLevelData();
        else
            return super.GetTopLevelData();
    }

    GetActiveData() {
        let vCell = this.GetEditCell();
        if (vCell != null)
            return vCell.CellData.GetTopLevelData();
        else
            return super.GetActiveData();
    }

    GetActiveItem() {
        let vCell = this.GetEditCell();
        if (vCell != null)
            return vCell.CellData.GetActiveItem();
        else
            return super.GetActiveItem();
    }

    GetTopLevelItem() {
        let vCell = this.GetEditCell();
        if (vCell != null)
            return vCell.CellData.GetTopLevelItem();
        else
            return super.GetTopLevelItem();
    }

    GetTopLevelDrawItem() {
        let vCellData = this.GetActiveData();
        if (vCellData != null)
            return vCellData.GetTopLevelDrawItem();
        else
            return super.GetTopLevelDrawItem();
    }

    GetTopLevelDrawItemCoord() {
        let vResult = TPoint.Create(0, 0);
        let vCell = this.GetEditCell();
        if (vCell != null) {
            vResult = vCell.CellData.GetTopLevelDrawItemCoord();
            let vPt = this.GetCellPostion(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol);
            vResult.x = vResult.x + vPt.x + this.FCellHPaddingPix;
            vResult.y = vResult.y + vPt.y + vCell.GetCellDataTop(this.FCellVPaddingPix);
        }

        return vResult;
    }

    GetTopLevelRectDrawItem() {
        let vCellData = this.GetActiveData();
        if (vCellData != null)
            return vCellData.GetTopLevelRectDrawItem();
        else
            return super.GetTopLevelRectDrawItem();
    }

    GetTopLevelRectDrawItemCoord() {
        let vResult = TPoint.Create(-1, -1);
        let vCell = this.GetEditCell();
        if (vCell != null) {
            let vPt = vCell.CellData.GetTopLevelRectDrawItemCoord();
            if (vPt.x >= 0) {
                vResult = this.GetCellPostion(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol);
                vResult.x = vResult.x + vPt.x + this.FCellHPaddingPix;
                vResult.y = vResult.y + vPt.y + vCell.GetCellDataTop(this.FCellVPaddingPix);
            }
        }

        return vResult;
    }

    GetHint() {
        let vResult = super.GetHint();
        if ((this.FMouseMoveRow < 0) || (this.FMouseMoveCol < 0))
            return vResult;

        let vCell = this.FRows[this.FMouseMoveRow][this.FMouseMoveCol];
        if ((vCell != null) && (vCell.CellData != null))
            vResult = vCell.CellData.GetHint();

        return vResult;
    }

    InsertText(aText) {
        let vResult = false;

        if (this.FSelectCellRang.EditCell()) {
            let vEvent = () => {
                let vEditCell = this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol];
                vResult = vEditCell.CellData.InsertText(aText);
            }

            this.CellChangeByAction(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol, vEvent);
            return vResult;
        }
        else
            return super.InsertText(aText);
    }

    InsertItem(itme) {
        let vCell = this.GetEditCell();
        if (vCell == null)
            return false;

        let vResult = false;
        let vEvent = () => {
            vResult = vCell.CellData.InsertItem(itme);
        }

        this.CellChangeByAction(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol, vEvent);
        return vResult;
    }

    InsertStream(stream, style, fileVersion) {
        let vResult = false;

        if (this.FSelectCellRang.EditCell()) {
            let vEvent = () => {
                let vEditCell = this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol];
                vResult = vEditCell.CellData.InsertStream(stream, style, fileVersion);
            }

            this.CellChangeByAction(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol, vEvent);
            return vResult;
        } else
            return super.InsertStream(stream, style, fileVersion);
    }

    ReFormatActiveItem() {
        if (this.FSelectCellRang.EditCell()) {
            let vEvent = () => {
                let vEditCell = this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol];
                vEditCell.CellData.ReFormatActiveItem();
            }

            this.CellChangeByAction(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol, vEvent);
        }

        this.FormatDirty();
    }

    ActiveItemReAdaptEnvironment() {
        if (this.FSelectCellRang.EditCell()) {
            let vEvent = () => {
                let vEditCell = this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol];
                vEditCell.CellData.ActiveItemReAdaptEnvironment();
            }

            this.CellChangeByAction(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol, vEvent);
        }
    }

    DeleteActiveDomain() {
        let vResult = super.DeleteActiveDomain();
        if (this.FSelectCellRang.EditCell()) {
            let vEvent = () => {
                let vEditCell = this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol];
                vResult = vEditCell.CellData.DeleteActiveDomain();
            }

            this.CellChangeByAction(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol, vEvent);
        }

        return vResult;
    }

    DeleteActiveDataItems(aStartNo, aEndNo, aKeepPara) {
        if (this.FSelectCellRang.EditCell()) {
            let vEvent = () => {
                let vEditCell = this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol];
                vEditCell.CellData.DeleteActiveDataItems(aStartNo, aEndNo, aKeepPara);
            }

            this.CellChangeByAction(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol, vEvent);
        }
    }

    SetActiveItemText(text) {
        super.SetActiveItemText(text);

        if (this.FSelectCellRang.EditCell()) {
            let vEvent = () => {
                let vEditCell = this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol];
                vEditCell.CellData.SetActiveItemText(text);
            }

            this.CellChangeByAction(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol, vEvent);
        }
    }

    //#region KeyDown子方法
    DoCrossCellKey(aKey, vEditCell) {
        let vResult = false;
        let vRow = -1, vCol = -1;
        let vOldRow = this.FSelectCellRang.StartRow;
        let vOldCol = this.FSelectCellRang.StartCol;

        if (aKey == TKey.Left) {
            if (vEditCell.CellData.SelectFirstItemOffsetBefor()) {
                for (let i = this.FSelectCellRang.StartCol - 1; i >= 0; i--) {
                    if (this.FRows[this.FSelectCellRang.StartRow][i].ColSpan >= 0) {
                        if (this.FRows[this.FSelectCellRang.StartRow][i].RowSpan < 0)
                            this.FSelectCellRang.StartRow += this.FRows[this.FSelectCellRang.StartRow][i].RowSpan;

                        vCol = i;
                        break;
                    }
                }

                if (vCol >= 0) {
                    if ((vOldRow >= 0) && (vOldCol >= 0))
                        this.FRows[vOldRow][vOldCol].Active = false;

                    this.FSelectCellRang.StartCol = vCol;
                    this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].Active = true;
                    this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].CellData.SelectLastItemAfterWithCaret();
                    vResult = true;
                }
            }
        } else if (aKey == TKey.Right) {
            if (vEditCell.CellData.SelectLastItemOffsetAfter()) {
                for (let i = this.FSelectCellRang.StartCol + 1; i < this.FColWidths.count; i++) {
                    if (this.FRows[this.FSelectCellRang.StartRow][i].ColSpan >= 0) {
                        if (this.FRows[this.FSelectCellRang.StartRow][i].RowSpan < 0)
                            this.FSelectCellRang.StartRow += this.FRows[this.FSelectCellRang.StartRow][i].RowSpan;

                        vCol = i;
                        break;
                    }
                }

                if (vCol >= 0) {
                    if ((vOldRow >= 0) && (vOldCol >= 0))
                        this.FRows[vOldRow][vOldCol].Active = false;

                    this.FSelectCellRang.StartCol = vCol;
                    this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].Active = true;
                    this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].CellData.SelectFirstItemBeforWithCaret();
                    vResult = true;
                }
            }
        } else if (aKey == TKey.Up) {
            if ((vEditCell.CellData.SelectFirstLine()) && (this.FSelectCellRang.StartRow > 0)) {
                let vInfo = this.GetDestCell(this.FSelectCellRang.StartRow - 1, this.FSelectCellRang.StartCol);
                vRow = vInfo.row;
                vCol = vInfo.col;
                if ((vRow >= 0) && (vCol >= 0)) {
                    if ((vOldRow >= 0) && (vOldCol >= 0))
                        this.FRows[vOldRow][vOldCol].Active = false;

                    this.FSelectCellRang.StartRow = vRow;
                    this.FSelectCellRang.StartCol = vCol;
                    this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].Active = true;
                    this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].CellData.SelectLastItemAfterWithCaret();
                    vResult = true;
                }
            }
        } else if (aKey == TKey.Down) {
            if ((vEditCell.CellData.SelectLastLine()) && (this.FSelectCellRang.StartRow < this.RowCount - 1)) {
                let vInfo = this.GetDestCell(this.FSelectCellRang.StartRow + 1, this.FSelectCellRang.StartCol);
                vRow = vInfo.row;
                vCol = vInfo.col;
                if ((vRow >= 0) && (vCol >= 0)) {
                    if ((vOldRow >= 0) && (vOldCol >= 0))
                        this.FRows[vOldRow][vOldCol].Active = false;

                    this.FSelectCellRang.StartRow = vRow;
                    this.FSelectCellRang.StartCol = vCol;
                    this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].Active = true;
                    this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].CellData.SelectFirstItemBeforWithCaret();
                    vResult = true;
                }
            }
        }

        return vResult;
    }
    //#endregion

    KeyDown(e) {
        this.SizeChanged = false;
        let vEditCell = this.GetEditCell();
        if (vEditCell != null) {
            let vOldKey = e.Handled;
            switch (e.keyCode) {
                case TKey.Back:
                case TKey.Delete:
                case TKey.Return:
                case TKey.Tab: {
                    let vEvent = () => {
                        vEditCell.CellData.KeyDown(e);
                    }

                    this.CellChangeByAction(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol, vEvent);
                    break;
                }

                case TKey.Left:
                case TKey.Right:
                case TKey.Up:
                case TKey.Down:
                case TKey.Home:
                case TKey.End:
                    vEditCell.CellData.KeyDown(e);
                    if ((e.Handled) && (HC.IsDirectionKey(e.KeyCode))) {
                        if (this.DoCrossCellKey(e.KeyValue, vEditCell)) {
                            this.OwnerData.Style.updateInfoReCaret();
                            e.Handled = vOldKey;
                        }
                    }
                    break;
            }
        } else
            e.Handled = true;
    }

    KeyPress(e) {
        let vEditCell = this.GetEditCell();
        if (vEditCell != null) {
            let vEvent = () => {
                vEditCell.CellData.KeyPress(e);
            }

            this.CellChangeByAction(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol, vEvent);
        }
    }

    IsSelectComplateTheory() {
        return this.IsSelectComplate;
    }

    SelectExists() {
        let vResult = false;
        if (this.IsSelectComplate)
            vResult = true;
        else if (this.FSelectCellRang.StartRow >= 0) {
            if (this.FSelectCellRang.EndRow >= 0)
                vResult = true;
            else
                vResult = this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].CellData.SelectExists();
        }

        return vResult;
    }

    TraverseItem(aTraverse) {
        for (let vR = 0; vR < this.FRows.count; vR++) {
            if (aTraverse.Stop)
                break;

            for (let vC = 0; vC < this.FColWidths.count; vC++) {
                if (aTraverse.Stop)
                    break;

                if (this.FRows[vR][vC].CellData != null)
                    this.FRows[vR][vC].CellData.TraverseItem(aTraverse);
            }
        }
    }

    Search(aKeyword, aForward, aMatchCase) {
        let Result = false;
        let vRow = -1, vCol = -1;
        let vCellData = null;
        if (aForward) {
            if (this.FSelectCellRang.StartRow < 0) {
                this.FSelectCellRang.StartRow = this.FRows.count - 1;
                this.FSelectCellRang.StartCol = this.FColWidths.count - 1;

                vRow = this.FSelectCellRang.StartRow;
                vCol = this.FSelectCellRang.StartCol;

                if (this.FRows[vRow][vCol].CellData != null) {
                    vCellData = this.FRows[vRow][vCol].CellData;
                    vCellData.SelectInfo.StartItemNo = vCellData.Items.count - 1;
                    vCellData.SelectInfo.StartItemOffset = vCellData.GetItemOffsetAfter(vCellData.Items.count - 1);
                }
            }

            vRow = this.FSelectCellRang.StartRow;
            vCol = this.FSelectCellRang.StartCol;

            if ((vRow >= 0) && (vCol >= 0)) {
                if (this.FRows[vRow][vCol].CellData != null)
                    Result = this.FRows[vRow][vCol].CellData.Search(aKeyword, aForward, aMatchCase);

                if (!Result) {
                    for (let j = vCol; j >= 0; j--) {
                        if ((this.FRows[vRow][j].ColSpan < 0) || (this.FRows[vRow][j].RowSpan < 0))
                            continue;
                        else {
                            vCellData = this.FRows[vRow][j].CellData;
                            vCellData.SelectInfo.StartItemNo = vCellData.Items.count - 1;
                            vCellData.SelectInfo.StartItemOffset = vCellData.GetItemOffsetAfter(vCellData.Items.count - 1);

                            Result = this.FRows[vRow][j].CellData.Search(aKeyword, aForward, aMatchCase);
                        }

                        if (Result) {
                            this.FSelectCellRang.StartCol = j;
                            break;
                        }
                    }
                }

                if (!Result) {
                    for (let i = this.FSelectCellRang.StartRow; i >= 0; i--) {
                        for (let j = this.FColWidths.count; j >= 0; j--) {
                            if ((this.FRows[i][j].ColSpan < 0) || (this.FRows[i][j].RowSpan < 0))
                                continue;
                            else {
                                vCellData = this.FRows[i][j].CellData;
                                vCellData.SelectInfo.StartItemNo = vCellData.Items.count - 1;
                                vCellData.SelectInfo.StartItemOffset = vCellData.GetItemOffsetAfter(vCellData.Items.count - 1);

                                Result = this.FRows[i][j].CellData.Search(aKeyword, aForward, aMatchCase);
                            }

                            if (Result) {
                                this.FSelectCellRang.StartCol = j;
                                break;
                            }
                        }

                        if (Result) {
                            this.FSelectCellRang.StartRow = i;
                            break;
                        }
                    }
                }
            }
        } else {
            if (this.FSelectCellRang.StartRow < 0) {
                this.FSelectCellRang.StartRow = 0;
                this.FSelectCellRang.StartCol = 0;
                this.FRows[0][0].CellData.SelectInfo.StartItemNo = 0;
                this.FRows[0][0].CellData.SelectInfo.StartItemOffset = 0;
            }

            vRow = this.FSelectCellRang.StartRow;
            vCol = this.FSelectCellRang.StartCol;

            if ((vRow >= 0) && (vCol >= 0)) {
                Result = this.FRows[vRow][vCol].CellData.Search(aKeyword, aForward, aMatchCase);
                if (!Result) {
                    for (let j = vCol; j < this.FColWidths.count; j++) {
                        if ((this.FRows[vRow][j].ColSpan < 0) || (this.FRows[vRow][j].RowSpan < 0))
                            continue;
                        else {
                            this.FRows[vRow][j].CellData.SelectInfo.StartItemNo = 0;
                            this.FRows[vRow][j].CellData.SelectInfo.StartItemOffset = 0;
                            Result = this.FRows[vRow][j].CellData.Search(aKeyword, aForward, aMatchCase);
                        }

                        if (Result) {
                            this.FSelectCellRang.StartCol = j;
                            break;
                        }
                    }
                }

                if (!Result) {
                    for (let i = this.FSelectCellRang.StartRow; i < this.FRows.count; i++) {
                        for (let j = 0; j < this.FColWidths.count; j++) {
                            if ((this.FRows[i][j].ColSpan < 0) || (this.FRows[i][j].RowSpan < 0))
                                continue;
                            else {
                                this.FRows[i][j].CellData.SelectInfo.StartItemNo = 0;
                                this.FRows[i][j].CellData.SelectInfo.StartItemOffset = 0;
                                Result = this.FRows[i][j].CellData.Search(aKeyword, aForward, aMatchCase);
                            }

                            if (Result) {
                                this.FSelectCellRang.StartCol = j;
                                break;
                            }
                        }

                        if (Result) {
                            this.FSelectCellRang.StartRow = i;
                            break;
                        }
                    }
                }
            }
        }

        if (!Result)
            this.FSelectCellRang.Initialize();

        return Result;
    }

    CheckFormatPageBreakBefor() {
        this.FPageBreaks.clear();
    }

    ApplySelectTextStyle(aStyle, aMatchStyle) {
        let vData = null;
        if (this.FSelectCellRang.EditCell()) {
            vData = this.GetEditCell().CellData;
            vData.ApplySelectTextStyle(aMatchStyle);
            this.SizeChanged = vData.FormatHeightChange || vData.FormatDrawItemCountChange;
        } else if (this.FSelectCellRang.StartRow >= 0) {
            for (let vR = this.FSelectCellRang.StartRow; vR <= this.FSelectCellRang.EndRow; vR++) {
                for (let vC = this.FSelectCellRang.StartCol; vC <= this.FSelectCellRang.EndCol; vC++) {
                    vData = this.FRows[vR][vC].CellData;
                    if (vData != null) {
                        if (this.SizeChanged) {
                            vData.BeginFormat();
                            try {
                                vData.ApplySelectTextStyle(aMatchStyle);
                            } finally {
                                vData.EndFormat(false);
                            }
                        } else {
                            vData.ApplySelectTextStyle(aMatchStyle);
                            this.SizeChanged = vData.FormatHeightChange | vData.FormatDrawItemCountChange;
                        }
                    }
                }
            }
        }
    }

    ApplySelectParaStyle(aStyle, aMatchStyle) {
        super.ApplySelectParaStyle(aStyle, aMatchStyle);

        if (this.FSelectCellRang.StartRow >= 0) {
            let vData = null;

            if (this.FSelectCellRang.EndRow >= 0) {
                for (let vR = this.FSelectCellRang.StartRow; vR <= this.FSelectCellRang.EndRow; vR++) {
                    for (let vC = this.FSelectCellRang.StartCol; vC <= this.FSelectCellRang.EndCol; vC++) {
                        vData = this.FRows[vR][vC].CellData;
                        if (vData != null) {
                            if (this.SizeChanged) {
                                vData.BeginFormat();
                                try {
                                    vData.ApplySelectParaStyle(aMatchStyle);
                                } finally {
                                    vData.EndFormat(false);
                                }
                            } else {
                                vData.ApplySelectParaStyle(aMatchStyle);
                                this.SizeChanged = vData.FormatHeightChange || vData.FormatDrawItemCountChange;
                            }
                        }
                    }
                }
            } else {
                vData = this.GetEditCell().CellData;
                vData.ApplySelectParaStyle(aMatchStyle);
                this.SizeChanged = vData.FormatHeightChange || vData.FormatDrawItemCountChange;
            }
        } else
            this.ParaNo = aMatchStyle.GetMatchParaNo(this.OwnerData.Style, this.ParaNo);
    }

    //#region ApplyContentAlign子方法
    ApplyCellAlign_(aCell, aAlign) {
        switch (aAlign) {
            case THCContentAlign.TopLeft:
            case THCContentAlign.TopCenter:
            case THCContentAlign.TopRight:
                aCell.AlignVert = THCAlignVert.Top;
                break;

            case THCContentAlign.CenterLeft:
            case THCContentAlign.CenterCenter:
            case THCContentAlign.CenterRight:
                aCell.AlignVert = THCAlignVert.Center;
                break;

            default:
                aCell.AlignVert = THCAlignVert.Bottom;
                break;
        }

        let vData = aCell.CellData;
        if (vData != null) {
            vData.BeginFormat();
            try {
                switch(aAlign) {
                    case THCContentAlign.TopLeft:
                    case THCContentAlign.CenterLeft:
                    case THCContentAlign.BottomLeft:
                        vData.ApplyParaAlignHorz(TParaAlignHorz.Left);
                        break;

                    case THCContentAlign.TopCenter:
                    case THCContentAlign.CenterCenter:
                    case THCContentAlign.BottomCenter:
                        vData.ApplyParaAlignHorz(TParaAlignHorz.Center);
                        break;

                    default:
                        vData.ApplyParaAlignHorz(TParaAlignHorz.Right);
                        break;
                }
            } finally {
                vData.EndFormat(true);
            }
        }
    }
    //#endregion

    ApplyContentAlign(aAlign) {
        super.ApplyContentAlign(aAlign);

        if (this.FSelectCellRang.StartRow >= 0) {
            if (this.FSelectCellRang.EndRow >= 0) {
                for (let vR = this.FSelectCellRang.StartRow; vR <= this.FSelectCellRang.EndRow; vR++) {
                    for (let vC = this.FSelectCellRang.StartCol; vR <= this.FSelectCellRang.EndCol; vC++)
                        this.ApplyCellAlign_(this.FRows[vR][vC], aAlign);
                }
            } else
                this.ApplyCellAlign_(this.GetEditCell(), aAlign);
        }
    }

    FormatToDrawItem(aRichData, aItemNo) {
        if (!this.FFormatDirty) {
            this.ClearFormatExtraHeight();
            return;
        }

        for (let vR = 0; vR < this.RowCount; vR++) {
            this.FormatRow(vR);
            this.CalcRowCellHeight(vR);
        }

        this.FFormatDirty = false;
        this.CalcMergeRowHeightFrom(0);
        this.Height = this.GetFormatHeight();
        this.Width = this.GetFormatWidth();
    }

    WantKeyDown(e) {
        return true;
    }

    AddPageBreak(ARow, ABreakSeat, APageIndex, APageDataFmtBottom, ADrawItemRectTop) {
        let vPageBreak = new TPageBreak();
        vPageBreak.PageIndex = APageIndex;
        vPageBreak.Row = ARow;
        vPageBreak.BreakSeat = ABreakSeat;
        vPageBreak.BreakBottom = APageDataFmtBottom - ADrawItemRectTop;
        this.FPageBreaks.add(vPageBreak);
    }
    //#endregion

    CheckFormatPageBreak(aPageIndex, aDrawItemRectTop, aDrawItemRectBottom, aPageDataFmtTop, aPageDataFmtBottom,
        aStartRow, aBreakRow, aFmtOffset, aCellMaxInc)
    {
        aBreakRow = -1;
        aFmtOffset = 0;
        aCellMaxInc = 0;
        
        let vBreakRowFmtTop = aDrawItemRectTop + this.FBorderWidthPix - 1;
        for (let vR1 = 0; vR1 < aStartRow; vR1++)
            vBreakRowFmtTop += this.FRows[vR1].FmtOffset + this.FRows[vR1].Height + this.FBorderWidthPix;
        
        let vR = aStartRow, vBreakRowBottom = 0;
        while (vR < this.RowCount) {
            vBreakRowBottom = vBreakRowFmtTop + this.FRows[vR].FmtOffset + this.FRows[vR].Height + this.FBorderWidthPix;
            if (vBreakRowBottom > aPageDataFmtBottom) {
                aBreakRow = vR;
                break;
            }

            vBreakRowFmtTop = vBreakRowBottom;
            vR++;
        }

        if (aBreakRow < 0)
            return;

        if ((!this.CanPageBreak) && (aBreakRow == 0)) {
            aFmtOffset = aPageDataFmtBottom - aDrawItemRectTop;
            return;
        }

        let vFirstLinePlace = true;
        let vPageBreakBottom = aPageDataFmtBottom;
        
        let vDestRow = -1, vDestCol = -1, vDestCellDataFmtTop = 0;
        let vCellData = null, vDrawItem = null, vInfo;

        for (let vC = 0; vC < this.FRows[aBreakRow].ColCount; vC++) {
            if (this.FRows[aBreakRow][vC].ColSpan < 0)
                continue;

            vInfo = this.GetDestCell(aBreakRow, vC);
            vDestRow = vInfo.row;
            vDestCol = vInfo.col;
            vCellData = this.FRows[vDestRow][vDestCol].CellData;
            
            vDestCellDataFmtTop = vBreakRowFmtTop + this.FCellVPaddingPix;

            if (aBreakRow != vDestRow)
                vDestCellDataFmtTop = vDestCellDataFmtTop - this.SrcCellDataTopDistanceToDest(aBreakRow, vDestRow);
            
            for (let i = 0; i < vCellData.DrawItems.count; i++) {
                vDrawItem = vCellData.DrawItems[i];
                if (!vDrawItem.LineFirst)
                    continue;

                if (vDestCellDataFmtTop + vDrawItem.rect.bottom + this.FCellVPaddingPix + this.FBorderWidthPix > aPageDataFmtBottom) {
                    if (i == 0) {
                        vFirstLinePlace = false;
                        vPageBreakBottom = vBreakRowFmtTop;
                        break;
                    }
                }
            }
        
            if (!vFirstLinePlace)
                break;
        }
  
        let vCellInc = 0;
        let vRowBreakSeat = 0, vLastDFromRowBottom = 0, vH = 0, vColCross;
        let vColCrosses = new TList();

        for (let vC = 0; vC < this.FRows[aBreakRow].ColCount; vC++) {
            if (this.FRows[aBreakRow][vC].ColSpan < 0)
                continue;

            vInfo = this.GetDestCell(aBreakRow, vC);
            vDestRow = vInfo.row;
            vDestCol = vInfo.col;
            vCellData = this.FRows[vDestRow][vDestCol].CellData;
            vLastDFromRowBottom =
                this.FRows[vDestRow][vDestCol].Height - (this.FCellVPaddingPix + vCellData.height + this.FCellVPaddingPix);
                
            vDestCellDataFmtTop = vBreakRowFmtTop + this.FCellVPaddingPix;
            if (aBreakRow != vDestRow)
                vDestCellDataFmtTop = vDestCellDataFmtTop - this.SrcCellDataTopDistanceToDest(aBreakRow, vDestRow);
            
            vColCross = new TColCross();
            vColCross.Col = vC;
            
            for (let i = 0; i < vCellData.DrawItems.count; i++) {
                vDrawItem = vCellData.DrawItems[i];
                if (!vDrawItem.LineFirst)
                    continue;
                    
                if (vDestCellDataFmtTop + vDrawItem.rect.bottom + this.FCellVPaddingPix + this.FBorderWidthPix > vPageBreakBottom) {

                    vH = aPageDataFmtBottom - (vDestCellDataFmtTop + vDrawItem.rect.top)
                        + this.FBorderWidthPix + this.FCellVPaddingPix - 1;
                   
                    if (vH > vLastDFromRowBottom)
                        vCellInc = vH - vLastDFromRowBottom;
                    else
                        vCellInc = 0;
                    
                    vColCross.DrawItemNo = i;
                    vColCross.VDrawOffset = vH;
                    
                    if (i > 0) {
                        if (vDestCellDataFmtTop + vCellData.DrawItems[i - 1].rect.bottom + this.FCellVPaddingPix + this.FBorderWidthPix > vRowBreakSeat)
                            vRowBreakSeat = vDestCellDataFmtTop + vCellData.DrawItems[i - 1].rect.bottom + this.FCellVPaddingPix + this.FBorderWidthPix;
                    } else {
                        if (vDestCellDataFmtTop > vRowBreakSeat)
                            vRowBreakSeat = vDestCellDataFmtTop - this.FCellVPaddingPix;
                    }
            
                    break;
                }
            }
        
            if (aCellMaxInc < vCellInc)
                aCellMaxInc = vCellInc;
        
            vColCrosses.add(vColCross);
        }
        
        vRowBreakSeat = vRowBreakSeat - aDrawItemRectTop + 1;

        let vFixHeight = 0;
        if ((this.FFixRow >= 0) && (aBreakRow > this.FFixRow + this.FFixRowCount - 1)) {
            vFixHeight = this.GetFixRowHeight();
            aCellMaxInc = aCellMaxInc + vFixHeight;
        }

        if (!vFirstLinePlace) {
            if (aBreakRow == 0) {
                aFmtOffset = aPageDataFmtBottom - aDrawItemRectTop;
                aCellMaxInc = 0;
                return;
            }

            for (let i = 0; i < vColCrosses.count; i++) {
                if ((vColCrosses[i].VDrawOffset > 0) && (vColCrosses[i].DrawItemNo == 0)) {
                    this.FRows[aBreakRow].FmtOffset = vColCrosses[i].VDrawOffset + vFixHeight;
                    vColCrosses[i].VDrawOffset = 0;
                }
            }
        } else
            this.FRows[aBreakRow].Height = this.FRows[aBreakRow].Height + aCellMaxInc;
        
        this.AddPageBreak(aBreakRow, vRowBreakSeat, aPageIndex, aPageDataFmtBottom, aDrawItemRectTop);
        
        for (let vC = 0; vC < vColCrosses.count; vC++) {
            if ((vColCrosses[vC].DrawItemNo < 0) || (vColCrosses[vC].VDrawOffset == 0))
                continue;

            vInfo = this.GetDestCell(aBreakRow, vColCrosses[vC].Col);
            vCellData = this.FRows[vDestRow][vDestCol].CellData;
            for (let i = vColCrosses[vC].DrawItemNo; i < vCellData.DrawItems.count; i++)
                vCellData.DrawItems[i].rect.offset(0, vColCrosses[vC].VDrawOffset + vFixHeight);
        }
        
        this.CalcMergeRowHeightFrom(aBreakRow);
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);

        stream.writeBoolean(this.FBorderVisible);
        stream.writeSingle(this.FBorderWidthPt);
        stream.writeSingle(this.FCellVPaddingMM);
        stream.writeSingle(this.FCellHPaddingMM);

        stream.writeInt32(this.FRows.count);
        stream.writeInt32(this.FColWidths.count);

        stream.writeByte(this.FFixCol);
        stream.writeByte(this.FFixRowCount);
        stream.writeByte(this.FFixRow);
        stream.writeByte(this.FFixColCount);
        
        for (let i = 0; i <= this.FColWidths.count - 1; i++)
            stream.writeInt32(this.FColWidths[i]);

        for (let vR = 0; vR <= this.FRows.count - 1; vR++) {
            stream.writeBoolean(this.FRows[vR].AutoHeight);
            if (!this.FRows[vR].AutoHeight)
                stream.writeInt32(this.FRows[vR].Height);
                        
            for (let vC = 0; vC <= this.FRows[vR].ColCount - 1; vC++)
                this.FRows[vR][vC].SaveToStream(stream);
        }
    }

    SaveSelectToStream(stream) {
        if (this.IsSelectComplate)
            system.exception("保存选中内容出错，表格不应该由内部处理全选中的保存！");
        else if (this.FSelectCellRang.EditCell()) {
            let vCellData = this.GetActiveData();
            if (vCellData != null)
                vCellData.SaveSelectToStream(stream);
        } else if (this.FSelectCellRang.SelectExists()) {
            let vData = new THCTableCellData(this.OwnerData.Style);
            vData.BeginFormat();
            vData.OnSaveItem = (data, itemNo) => { return this.OwnerData.OnSaveItem(data, itemNo); }

            let vCellData = null;
            for (let vRow = this.FSelectCellRang.StartRow; vRow <= this.FSelectCellRang.EndRow; vRow++) {
                for (let vCol = this.FSelectCellRang.StartCol; vCol <= this.FSelectCellRang.EndCol; vCol++) {
                    vCellData = this.FRows[vRow][vCol].CellData;
                    if (vCellData != null)
                        vData.AddData(vCellData);
                }
            }

            vData.SaveToStream(stream);
            vData.dispose();
        }
    }

    LoadFromStream(stream, style, fileVersion) {
        this.FRows.clear();
        super.LoadFromStream(stream, style, fileVersion);
        this.FBorderVisible = stream.readBoolean();

        if (fileVersion > 31)
            this.BorderWidthPt = stream.readSingle();
        else if (fileVersion > 29) {
            this.FBorderWidthPix = stream.readByte();
            this.FBorderWidthPt = Math.min(0.5, THCUnitConversion.pixelToPt(this.FBorderWidthPix, THCUnitConversion.PixelsPerInchX));
        }

        if (fileVersion > 34) {
            this.FCellVPaddingMM = stream.readSingle();
            this.FCellVPaddingPix = THCUnitConversion.millimeterToPixY(this.FCellVPaddingMM);

            this.FCellHPaddingMM =  stream.readSingle();
            this.FCellHPaddingPix = THCUnitConversion.millimeterToPixY(this.FCellHPaddingMM);
        } else {
            this.FCellVPaddingMM = THCUnitConversion.pixYToMillimeter(2);
            this.FCellVPaddingPix = 2;
            this.FCellHPaddingMM = THCUnitConversion.pixXToMillimeter(2);
            this.FCellHPaddingPix = 2;
        }

        let vRowCount = stream.readInt32();
        let vColCount = stream.readInt32();
        
        if (fileVersion > 24) {
            this.FFixRow = stream.readInt8();
            this.FFixRowCount = stream.readByte();
            this.FFixCol = stream.readInt8();
            this.FFixColCount = stream.readByte();
        }

        let vRow;
        for (let i = 0; i < vRowCount; i++) {
            vRow = new THCTableRow(this.OwnerData.Style, vColCount);
            this.FRows.add(vRow);
        }

        this.FColWidths.clear();

        let vWidth = HC.MinColWidth;
        for (let i = 0; i < vColCount; i++) {
            vWidth = stream.readInt32();
            this.FColWidths.add(vWidth);
        }

        let vAutoHeight = false;
        for (let vR = 0; vR < this.FRows.count; vR++) {
            vAutoHeight = stream.readBoolean();
            this.FRows[vR].AutoHeight = vAutoHeight;
            if (!this.FRows[vR].AutoHeight)
                this.FRows[vR].Height = stream.readInt32();

            for (let vC = 0; vC < this.FRows[vR].ColCount; vC++) {
                this.FRows[vR][vC].CellData.Width = this.FColWidths[vC] - 2 * this.FCellHPaddingPix;
                this.FRows[vR][vC].LoadFromStream(stream, style, fileVersion);
            }
        }
    }

    ToHtml(aPath) {
        // string Result = "<table border=\"" + FBorderWidthPix.ToString()
        //     + "\" cellpadding=\"0\"; cellspacing=\"0\"";
        // for (int vR = 0; vR <= FRows.count - 1; vR++)
        // {
        //     Result = Result + HC.sLineBreak + "<tr>";
        //     for (int vC = 0; vC <= FColWidths.count - 1; vC++)
        //     {
        //         HCTableCell vCell = FRows[vR][vC];
        //         if ((vCell.RowSpan < 0) || (vCell.ColSpan < 0))
        //             continue;

        //         Result = Result + HC.sLineBreak + string.Format("<td rowspan=\"{0}\"; colspan=\"{1}\"; width=\"{2}\"; height=\"{3}\">",
        //             vCell.RowSpan + 1, vCell.ColSpan + 1, vCell.Width, vCell.Height);

        //         if (vCell.CellData != null)
        //             Result = Result + vCell.CellData.ToHtml(aPath);

        //         Result = Result + HC.sLineBreak + "</td>";
        //     }
        //     Result = Result + HC.sLineBreak + "</tr>";
        // }
        // Result = Result + HC.sLineBreak + "</table>";

        // return Result;
    }

    ToXml(aNode) {
        // super.ToXml(aNode);

        // string vS = FColWidths[0].ToString();
        // for (int vC = 1; vC <= FColWidths.count - 1; vC++)
        //     vS = vS + "," + FColWidths[vC].ToString();

        // aNode.SetAttribute("bordervisible", FBorderVisible.ToString());
        // //aNode.SetAttribute("borderwidth", FBorderWidthPix.ToString());
        // aNode.SetAttribute("borderwidthpt", string.Format("{0:0.##}", FBorderWidthPt));
        // aNode.SetAttribute("row", FRows.count.ToString());
        // aNode.SetAttribute("col", FColWidths.count.ToString());
        // aNode.SetAttribute("colwidth", vS);
        // aNode.SetAttribute("link", "");

        // for (int vR = 0; vR <= FRows.count - 1; vR++)
        // {
        //     XmlElement vNode = aNode.OwnerDocument.CreateElement("row");
        //     FRows[vR].ToXml(vNode);
        //     aNode.AppendChild(vNode);
        // }
    }

    ParseXml(aNode) {
        // FRows.clear();

        // super.ParseXml(aNode);
        // FBorderVisible = bool.Parse(aNode.Attributes["bordervisible"].Value);
        // if (aNode.HasAttribute("borderwidth"))
        // {
        //     FBorderWidthPix = byte.Parse(aNode.Attributes["borderwidth"].Value);
        //     FBorderWidthPt = Math.min(0.5f, HCUnitConversion.PixelToPt(FBorderWidthPix, HCUnitConversion.PixelsPerInchX));
        // }

        // if (aNode.HasAttribute("borderwidthpt"))
        //     BorderWidthPt = Single.Parse(aNode.Attributes["borderwidthpt"].Value);

        // int vR = int.Parse(aNode.Attributes["row"].Value);
        // int vC = int.Parse(aNode.Attributes["col"].Value);

        // // 创建行、列
        // for (int i = 0; i <= vR - 1; i++)
        // {
        //     HCTableRow vRow = new HCTableRow(OwnerData.Style, vC);  // 注意行创建时是table拥有者的Style，加载时是传入的AStyle
        //     FRows.add(vRow);
        // }

        // // 加载各列标准宽度
        // FColWidths.clear();
        // string[] vStrings = aNode.Attributes["colwidth"].Value.Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries);
        // for (int i = 0; i <= vC - 1; i++)
        //     FColWidths.add(int.Parse(vStrings[i]));

        // // 加载各列数据
        // for (int i = 0; i <= aNode.ChildNodes.count - 1; i++)
        //     FRows[i].ParseXml(aNode.ChildNodes[i] as XmlElement);
    }

    ResetRowCol(aWidth, aRowCount, aColCount) {
        this.FFixRow = -1;
        this.FFixRowCount = 0;
        this.FFixCol = -1;
        this.FFixColCount = 0;

        this.InitializeMouseInfo();
        this.FSelectCellRang.Initialize();
        
        this.Width = aWidth;
        this.Height = aRowCount * (HC.MinRowHeight + this.FBorderWidthPix) + this.FBorderWidthPix;
        let vDataWidth = aWidth - (aColCount + 1) * this.FBorderWidthPix;
        let vRow;
        this.FRows.clear();
        for (let i = 0; i < aRowCount; i++) {
            vRow = new THCTableRow(this.OwnerData.Style, aColCount);
            vRow.SetRowWidth(vDataWidth);
            this.FRows.add(vRow);
        }

        this.FColWidths.clear();
        for (let i = 0; i < aColCount; i++)
            this.FColWidths.add(this.FRows[0][i].Width);

        this.FormatDirty();
        return true;
    }

    GetFormatWidth() {
        let vResult = this.FBorderWidthPix;
        for (let i = 0; i < this.FColWidths.count; i++)
            vResult = vResult + this.FColWidths[i] + this.FBorderWidthPix;

        return vResult;
    }

    //#region GetCellAt子方法
    CheckRowBorderRang(y, bottom) {
        return ((y >= bottom - this.GripSize) && (y <= bottom + this.GripSize));
    }

    CheckColBorderRang(x, left) {
        return ((x >= left - this.GripSize) && (x <= left + this.GripSize));
    }
    //#endregion

    GetCellAt(x, y, arow, acol, redest = true) {
        let vResizeInfo = new TResizeInfo();
        vResizeInfo.TableSite = TTableSite.Outside;
        vResizeInfo.DestX = -1;
        vResizeInfo.DestY = -1;
        
        arow = -1;
        acol = -1;
        if ((y < 0) || (y > this.Height))
            return {
                resizeInfo: vResizeInfo,
                row: arow,
                col: acol
            }

        let vTop = 0, vBottom =0;

        if ((x < 0) || (x > this.Width)) {
            vTop = this.FBorderWidthPix;
            for (let i = 0; i < this.RowCount; i++) {
                vTop = vTop + this.FRows[i].FmtOffset;
                vBottom = vTop + this.FRows[i].Height;

                if ((vTop < y) && (vBottom > y)) {
                    arow = i;
                    break;
                }
                
                vTop = vBottom;
            }
            
            return {
                resizeInfo: vResizeInfo,
                row: arow,
                col: acol
            }
        }
        
        vTop = this.FBorderWidthPix;
        if (this.CheckRowBorderRang(y, vTop)) {
            vResizeInfo.TableSite = TTableSite.BorderTop;
            return {
                resizeInfo: vResizeInfo,
                row: arow,
                col: acol
            }
        }

        if (this.CheckColBorderRang(x, vTop)) {
            vResizeInfo.TableSite = TTableSite.BorderLeft;
            return {
                resizeInfo: vResizeInfo,
                row: arow,
                col: acol
            }
        }
        
        for (let i = 0; i < this.RowCount; i++) {
            vTop = vTop + this.FRows[i].FmtOffset;
            vBottom = vTop + this.FRows[i].Height + this.FBorderWidthPix;
            if (this.CheckRowBorderRang(y, vBottom)) {
                arow = i;
                vResizeInfo.TableSite = TTableSite.BorderBottom;
                vResizeInfo.DestY = vBottom;
                break;
            }

            if ((vTop < y) && (vBottom > y)) {
                arow = i;
                break;
            }
            
            vTop = vBottom;
        }

        if (arow < 0)
            return {
                resizeInfo: vResizeInfo,
                row: arow,
                col: acol
            }

        let vLeft = this.FBorderWidthPix, vRight = 0, vDestRow = -1, vDestCol = -1, vInfo;

        for (let i = 0; i < this.FColWidths.count; i++) {
            vRight = vLeft + this.FColWidths[i] + this.FBorderWidthPix;
            vInfo = this.GetDestCell(arow, i);
            vDestRow = vInfo.row;
            vDestCol = vInfo.col;
            if (this.CheckColBorderRang(x, vRight)) {
                acol = i;
                if (vDestCol + this.FRows[vDestRow][vDestCol].ColSpan != i)
                    vResizeInfo.TableSite = TTableSite.Cell;
                else
                    vResizeInfo.TableSite = TTableSite.BorderRight;
                
                vResizeInfo.DestX = vRight;
                break;
            }

            if ((vLeft < x) && (vRight > x)) {
                acol = i;
                if ((vResizeInfo.TableSite == TTableSite.BorderBottom)
                    && (vDestRow + this.FRows[vDestRow][vDestCol].RowSpan != arow))
                    vResizeInfo.TableSite = TTableSite.Cell;
                
                break;
            }
            
            vLeft = vRight;
        }
        
        if (acol >= 0) {
            if (vResizeInfo.TableSite == TTableSite.Outside)
                vResizeInfo.TableSite = TTableSite.Cell;
            
            if (redest && (this.FRows[arow][acol].CellData == null)) {
                vInfo = this.GetDestCell(arow, acol);
                arow = vInfo.row;
                acol = vInfo.col;
            }
        }

        return {
            resizeInfo: vResizeInfo,
            row: arow,
            col: acol
        }
    }

    GetDestCell(arow, acol) {
        let destRow = arow;
        let destCol = acol;

        if (this.FRows[arow][acol].RowSpan < 0)
            destRow = destRow + this.FRows[arow][acol].RowSpan;

        if (this.FRows[arow][acol].ColSpan < 0)
            destCol = destCol + this.FRows[arow][acol].ColSpan;

        return {
            row: destRow,
            col: destCol
        }
    }

    GetSourceCell(arow, acol) {
        if (this.FRows[arow][acol].CellData != null)
            return {
                row: arow + this.FRows[arow][acol].RowSpan,
                col: acol + this.FRows[arow][acol].ColSpan
            }
        else
            system.exception(HC.HCS_EXCEPTION_VOIDSOURCECELL);
    }

    SelectAll() {
        this.SelectComplate();
    }

    PaintRow(aRow, aLeft, aTop, aBottom, aCanvas, aPaintInfo) {
        let vBorderOffs = Math.trunc(this.FBorderWidthPix / 2);
        let vCellDrawLeft = aLeft + this.FBorderWidthPix;
        let vCellDataDrawTop = aTop + this.FBorderWidthPix + this.FCellVPaddingPix;
        let vCellDrawBottom = -1, vBorderTop = -1, vBorderBottom = -1, vBorderLeft = -1, vBorderRight = -1;
        let vCellData = null;
        let vDrawDefault = false;
        let vCellRect;
        for (let vC = 0; vC < this.FRows[aRow].ColCount; vC++) {
            if ((this.FRows[aRow][vC].ColSpan < 0) || (this.FRows[aRow][vC].RowSpan < 0)) {
                vCellDrawLeft = vCellDrawLeft + this.FColWidths[vC] + this.FBorderWidthPix;
                continue;
            }

            vCellDrawBottom = Math.min(aBottom,
                vCellDataDrawTop + Math.max(this.FRows[aRow].Height, this.FRows[aRow][vC].Height) - this.FCellVPaddingPix);
            
            vCellRect = TRect.Create(vCellDrawLeft, aTop + this.FBorderWidthPix, vCellDrawLeft + this.FRows[aRow][vC].Width, vCellDrawBottom);
            vCellData = this.FRows[aRow][vC].CellData;
        
            if ((this.IsSelectComplate || vCellData.CellSelectedAll) && (!aPaintInfo.print)) {
                aCanvas.brush.color = this.OwnerData.Style.SelColor;
                aCanvas.fillRect(vCellRect);
            } else {
                vDrawDefault = true;
                if (this.FOnCellPaintBK != null)
                    vDrawDefault = this.FOnCellPaintBK(this, this.FRows[aRow][vC], vCellRect, aCanvas, aPaintInfo, vDrawDefault);

                if (vDrawDefault) {
                    if (this.FRows[aRow][vC].BackgroundColor != HC.HCTransparentColor)
                        aCanvas.brush.color = this.FRows[aRow][vC].BackgroundColor;
                    else
                        aCanvas.brush.style = TBrushStyle.Clear;

                    aCanvas.fillRect(vCellRect);
                }
            }

            if (vCellDrawBottom - vCellDataDrawTop > this.FCellVPaddingPix) {
                this.FRows[aRow][vC].PaintTo(vCellDrawLeft, vCellDataDrawTop - this.FCellVPaddingPix, vCellRect.right,
                    vCellDrawBottom, aTop, aBottom, 0, this.FCellHPaddingPix, this.FCellVPaddingPix, aCanvas, aPaintInfo);
            }
       
            if (this.FBorderVisible || (!aPaintInfo.print)) {
                if (aPaintInfo.print)
                    aCanvas.pen.width = Math.max(1, THCUnitConversion.ptToPixel(this.FBorderWidthPt, aPaintInfo.DPI));
                else
                    aCanvas.pen.width = this.FBorderWidthPix;

                if (this.FBorderVisible) {
                    aCanvas.pen.color = "black";
                    aCanvas.pen.style = TPenStyle.Solid;
                } else if (!aPaintInfo.print) {
                    aCanvas.pen.color = HC.clActiveBorder;
                    aCanvas.pen.style = TPenStyle.Dot;
                }

                vBorderTop = vCellDataDrawTop - this.FCellVPaddingPix - this.FBorderWidthPix;
                vBorderBottom = vBorderTop + this.FBorderWidthPix
                    + Math.max(this.FRows[aRow].Height, this.FRows[aRow][vC].Height);
            
                vBorderLeft = vCellDrawLeft - this.FBorderWidthPix;
                vBorderRight = vCellDrawLeft + this.FColWidths[vC] + this.GetColSpanWidth(aRow, vC);
            
                if ((vBorderTop >= 0) && (this.FRows[aRow][vC].BorderSides.has(TBorderSide.Top))) {
                    if (aPaintInfo.print) {
                        aPaintInfo.drawNoScaleLine(aCanvas, [TPoint.Create(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs),
                            TPoint.Create(vBorderRight + vBorderOffs, vBorderTop + vBorderOffs)]);
                    }  else {
                        aCanvas.drawLineDriect(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs,
                            vBorderRight + vBorderOffs, vBorderTop + vBorderOffs);
                    }
                }

                if (this.FRows[aRow][vC].BorderSides.has(TBorderSide.Right)) {
                    if (aPaintInfo.print) {
                        aPaintInfo.drawNoScaleLine(aCanvas, [TPoint.Create(vBorderRight + vBorderOffs, vBorderTop + vBorderOffs),
                            TPoint.Create(vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs)]);
                    } else {
                        aCanvas.MoveTo(vBorderRight + vBorderOffs, vBorderTop + vBorderOffs);  // 右上
                        aCanvas.LineTo(vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs);  // 右下
                    }
                }

                if ((vBorderBottom <= aBottom) && (this.FRows[aRow][vC].BorderSides.has(TBorderSide.Bottom))) {
                    if (aPaintInfo.print) {
                        aPaintInfo.drawNoScaleLine(aCanvas, [TPoint.Create(vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs),
                            TPoint.Create(vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs)]);
                    } else {
                        aCanvas.drawLineDriect(vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs,
                            vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs);
                    }
                }

                if (this.FRows[aRow][vC].BorderSides.has(TBorderSide.Left)) {
                    if (aPaintInfo.print) {
                        aPaintInfo.drawNoScaleLine(aCanvas, [TPoint(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs),
                            TPoint.Create(vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs)]);
                    } else {
                        aCanvas.drawLineDriect(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs,
                            vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs);
                    }
                }

                if (this.FRows[aRow][vC].BorderSides.has(TBorderSide.LTRB)) {
                    if (aPaintInfo.print) {
                        aPaintInfo.drawNoScaleLine(aCanvas, [TPoint.Create(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs),
                            TPoint(vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs)]);
                    } else {
                        aCanvas.drawLineDriect(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs,
                            vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs);
                    }
                }

                if (this.FRows[aRow][vC].BorderSides.has(TBorderSide.RTLB)) {
                    if (aPaintInfo.print) {
                        aPaintInfo.drawNoScaleLine(aCanvas, [TPoint.Create(vBorderRight + vBorderOffs, vBorderTop + vBorderOffs),
                            TPoint.Create(vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs)]);
                    } else {
                        aCanvas.drawLineDriect(vBorderRight + vBorderOffs, vBorderTop + vBorderOffs,
                            vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs);
                    }
                }
            }
    
            vCellDrawLeft = vCellDrawLeft + this.FColWidths[vC] + this.FBorderWidthPix;
        }
    }

    PaintFixRows(left, top, bottom, hclCanvas, paintInfo) {
        let vRect = TRect.CreateByBounds(left, top, this.Width, this.GetFixRowHeight());
        hclCanvas.brush.color = HC.clBtnFace;
        hclCanvas.fillRect(vRect);

        let vTop = top, vH = -1;
        for (let vR = this.FFixRow; vR < this.FFixRow + this.FFixRowCount; vR++) {
            vH = 0;
            for (let vC = 0; vC < this.FRows[vR].ColCount; vC++) {
                if ((this.FRows[vR][vC].CellData != null)
                && (this.FRows[vR][vC].RowSpan >= 0))
                vH = Math.max(vH, this.FRows[vR][vC].CellData.height);
            }

            vH = this.FCellVPaddingPix + vH + this.FCellVPaddingPix;
            vH = Math.max(vH, this.FRows[vR].Height) + this.FBorderWidthPix + this.FBorderWidthPix;

            vRect = TRect.CreateByBounds(left, vTop, this.Width, vH);
            if (vRect.top >= bottom)
                break;

            this.PaintRow(vR, vRect.left, vRect.top, vRect.bottom, hclCanvas, paintInfo);
            
            vTop = vTop + this.FBorderWidthPix + this.FRows[vR].Height;
        }
    }

    PaintFixCols(aTableDrawTop, aLeft, aTop, aBottom, aCanvas, aPaintInfo) {
        let vCellTop = Math.max(aTop, aTableDrawTop) + this.FBorderWidthPix;
        for (let vR = 0; vR < this.FFixRow + this.FFixRowCount; vR++)
            vCellTop = vCellTop + this.FRows[vR].FmtOffset + this.FRows[vR].Height + this.FBorderWidthPix;

        let vRect = TRect.CreateByBounds(aLeft, vCellTop, this.GetFixColWidth(), aBottom - vCellTop);
        aCanvas.brush.color = HC.clBtnFace;
        aCanvas.fillRect(vRect);

        let vCellBottom = 0, vCellLeft = 0, vBorderTop = 0, vBorderBottom = 0, vBorderLeft = 0, vBorderRight = 0;

        let vBorderOffs = Math.trunc(this.FBorderWidthPix / 2);

        vCellTop = aTableDrawTop + this.FBorderWidthPix;
    
        for (let vR = 0; vR < this.FRows.count; vR++) {
            vCellTop = vCellTop + this.FRows[vR].FmtOffset;
            vCellBottom = vCellTop + this.FRows[vR].Height;
            if ((vCellBottom < aTop) || (vR < this.FFixRow + this.FFixRowCount)) {
                vCellTop = vCellBottom + this.FBorderWidthPix;
                continue;
            }

            vCellLeft = aLeft + this.FBorderWidthPix;
            for (let vC = this.FFixCol; vC < this.FFixCol + this.FFixColCount; vC++) {
                vRect = TRect.Create(vCellLeft, vCellTop, vCellLeft + this.FColWidths[vC], vCellBottom);
                if (vRect.top > aBottom)
                    break;

                if (vRect.bottom > aBottom)
                    vRect.bottom = aBottom;

                this.FRows[vR][vC].PaintTo(vCellLeft, vCellTop, vRect.right, vCellBottom, aTop, aBottom, 0,
                    this.FCellHPaddingPix, this.FCellVPaddingPix, aCanvas, aPaintInfo);

                if (this.FBorderVisible || (!aPaintInfo.print)) {
                    if (aPaintInfo.print)
                        aCanvas.pen.width = Math.max(1, THCUnitConversion.ptToPixel(this.FBorderWidthPt, aPaintInfo.DPI));
                    else
                        aCanvas.pen.width = this.FBorderWidthPix;
                
                    if (this.FBorderVisible) {
                        aCanvas.pen.color = "black";
                        aCanvas.pen.style = TPenStyle.Solid;
                    } else if (!aPaintInfo.print) {
                        aCanvas.pen.color = HC.clActiveBorder;
                        aCanvas.pen.style = TPenStyle.Dot;
                    }

                    vBorderTop = vCellTop - this.FBorderWidthPix;
                    vBorderBottom = vBorderTop + this.FBorderWidthPix
                        + Math.max(this.FRows[vR].Height, this.FRows[vR][vC].Height);
                
                    vBorderLeft = vCellLeft - this.FBorderWidthPix;
                    vBorderRight = vCellLeft + this.FColWidths[vC] + this.GetColSpanWidth(vR, vC);
                
                    if ((vBorderTop >= 0) && (this.FRows[vR][vC].BorderSides.has(TBorderSide.Top))) {
                        if (aPaintInfo.print) {
                            aPaintInfo.drawNoScaleLine(aCanvas, [TPoint.Create(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs),
                                TPoint.Create(vBorderRight + vBorderOffs, vBorderTop + vBorderOffs)]);
                        } else {
                            aCanvas.drawLineDriect(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs,
                                vBorderRight + vBorderOffs, vBorderTop + vBorderOffs);
                        }
                    }

                    if (this.FRows[vR][vC].BorderSides.has(TBorderSide.Right)) {
                        if (aPaintInfo.print) {
                            aPaintInfo.drawNoScaleLine(aCanvas, [TPoint.Create(vBorderRight + vBorderOffs, vBorderTop + vBorderOffs),
                                TPoint.Create(vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs)]);
                        } else {
                            aCanvas.drawLineDriect(vBorderRight + vBorderOffs, vBorderTop + vBorderOffs,
                                vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs);
                        }
                    }

                    if ((vBorderBottom <= aBottom) && (this.FRows[vR][vC].BorderSides.has(TBorderSide.Bottom))) {
                        if (aPaintInfo.print) {
                            aPaintInfo.drawNoScaleLine(aCanvas, [TPoint.Create(vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs),
                                TPoint.Create(vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs)]);
                        } else {
                            aCanvas.drawLineDriect(vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs,
                                vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs);
                        }
                    }

                    if (this.FRows[vR][vC].BorderSides.has(TBorderSide.Left)) {
                        if (aPaintInfo.print) {
                            aPaintInfo.drawNoScaleLine(aCanvas, [TPoint.Create(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs),
                                TPoint.Create(vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs)]);
                        } else {
                            aCanvas.drawLineDriect(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs,
                                vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs);
                        }
                    }

                    if (this.FRows[vR][vC].BorderSides.has(TBorderSide.LTRB)) {
                        if (aPaintInfo.print) {
                            aPaintInfo.drawNoScaleLine(aCanvas, [TPoint.Create(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs),
                                TPoint.Create(vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs)]);
                        } else {
                            aCanvas.drawLineDriect(vBorderLeft + vBorderOffs, vBorderTop + vBorderOffs,
                                vBorderRight + vBorderOffs, vBorderBottom + vBorderOffs);
                        }
                    }

                    if (this.FRows[vR][vC].BorderSides.has(TBorderSide.RTLB)) {
                        if (aPaintInfo.print) {
                            aPaintInfo.drawNoScaleLine(aCanvas, [TPoint.Create(vBorderRight + vBorderOffs, vBorderTop + vBorderOffs),
                                TPoint.Create(vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs)]);
                        } else {
                            aCanvas.drawLineDriect(vBorderRight + vBorderOffs, vBorderTop + vBorderOffs,
                                vBorderLeft + vBorderOffs, vBorderBottom + vBorderOffs);
                        }
                    }
                }
        
                vCellLeft = vCellLeft + this.FColWidths[vC] + this.FBorderWidthPix;
            }

            vCellTop = vCellBottom + this.FBorderWidthPix;
        }
    }

    FormatRow(ARow) {
        let vRow = this.FRows[ARow];
        vRow.FmtOffset = 0;

        let vWidth;
        for (let vC = 0; vC < vRow.ColCount; vC++) {
            if (vRow[vC].CellData != null) {
                vWidth = this.FColWidths[vC] + this.GetColSpanWidth(ARow, vC);
                vRow[vC].Width = vWidth;
                vRow[vC].CellData.width = vWidth - this.FCellHPaddingPix - this.FCellHPaddingPix;
                vRow[vC].CellData.ReFormat();
            }
        }
    }

    GetColSpanWidth(ARow, ACol) {
        let vResult = 0;
        for (let i = 1; i <= this.FRows[ARow][ACol].ColSpan; i++)
            vResult = vResult + this.FBorderWidthPix + this.FColWidths[ACol + i];

        return vResult;
    }

    CellsCanMerge(aStartRow, aStartCol, aEndRow, aEndCol) {
        let vResult = false;
        for (let vR = aStartRow; vR <= aEndRow; vR++) {
            for (let vC = aStartCol; vC <= aEndCol; vC++) {
                if (this.FRows[vR][vC].CellData != null) {
                    if (!this.FRows[vR][vC].CellData.CellSelectedAll)
                        return vResult;
                }
            }
        }
        
        vResult = true;
        return vResult;
    }

    RowCanDelete(aRow) {
        let vResult = false;
        for (let vCol = 0; vCol < this.FColWidths.count; vCol++) {
            if (this.FRows[aRow][vCol].RowSpan > 0)
                return vResult;
        }
        vResult = true;
        return vResult;
    }

    CurRowCanDelete() {
        return (this.FSelectCellRang.EndRow < 0)
            && (this.FSelectCellRang.StartRow >= 0)
            && this.RowCanDelete(this.FSelectCellRang.StartRow);
    }

    ColCanDelete(aCol) {
        let vResult = false;
        for (let vRow = 0; vRow < this.RowCount; vRow++) {
            if (this.FRows[vRow][aCol].ColSpan > 0)
                return vResult;
        }

        vResult = true;
        return vResult;
    }

    CurColCanDelete() {
        return (this.FSelectCellRang.EndCol < 0)
            && (this.FSelectCellRang.StartCol >= 0)
            && this.ColCanDelete(this.FSelectCellRang.StartCol);
    }

    MergeSelectCells() {
        let vResult = false;

        if ((this.FSelectCellRang.StartRow >= 0) && (this.FSelectCellRang.EndRow >= 0)) {
            this.Undo_Mirror();

            vResult = this.MergeCells(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol,
                this.FSelectCellRang.EndRow, this.FSelectCellRang.EndCol);

            if (vResult) {
                this.FormatDirty();
                let vSelRow = this.FSelectCellRang.StartRow;
                let vSelCol = this.FSelectCellRang.StartCol;
                this.FSelectCellRang.InitializeEnd();
                this.DisSelect();
                this.FSelectCellRang.SetStart(vSelRow, vSelCol);
                this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].CellData.InitializeField();
            }
        } else if (this.FSelectCellRang.EditCell())
            vResult = this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol].CellData.MergeTableSelectCells();
        else
            vResult = false;

        return vResult;
    }

    SelectedCellCanMerge() {
        let vResult = false;
        if (this.FSelectCellRang.SelectExists()) {
            let vEndRow = this.FSelectCellRang.EndRow;
            let vEndCol = this.FSelectCellRang.EndCol;
            let vInfo = this.AdjustCellRange(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol, vEndRow, vEndCol);
            vEndRow = vInfo.row;
            vEndCol = vInfo.col;
            vResult = this.CellsCanMerge(this.FSelectCellRang.StartRow, this.FSelectCellRang.StartCol, vEndRow, vEndCol);
        }

        return vResult;
    }

    GetEditCell() {
        if (this.FSelectCellRang.EditCell())
            return this.FRows[this.FSelectCellRang.StartRow][this.FSelectCellRang.StartCol];
        else
            return null;
    }

    GetEditCellWith(aRow, aCol) {
        aRow = -1;
        aCol = -1;
        if (this.FSelectCellRang.EditCell()) {
            aRow = this.FSelectCellRang.StartRow;
            aCol = this.FSelectCellRang.StartCol;
        }

        return {
            row: aRow,
            col: aCol
        }
    }

    InsertRowAfter(aCount) {
        let vCell = this.GetEditCell();
        if (vCell == null)
            return false;

        vCell.CellData.InitializeField();

        if (vCell.RowSpan > 0)
            return this.InsertRow(this.FSelectCellRang.StartRow + vCell.RowSpan + 1, aCount);
        else
            return this.InsertRow(this.FSelectCellRang.StartRow + 1, aCount);
    }

    InsertRowBefor(aCount) {
        let vCell = this.GetEditCell();
        if (vCell == null)
            return false;
        
        vCell.CellData.InitializeField();

        return this.InsertRow(this.FSelectCellRang.StartRow, aCount);
    }

    InsertColAfter(aCount) {
        let vCell = this.GetEditCell();
        if (vCell == null)
            return false;

        vCell.CellData.InitializeField();

        if (vCell.ColSpan > 0)
            return this.InsertCol(this.FSelectCellRang.StartCol + vCell.ColSpan + 1, aCount);
        else
            return this.InsertCol(this.FSelectCellRang.StartCol + 1, aCount);
    }

    InsertColBefor(aCount) {
        let vCell = this.GetEditCell();
        if (vCell == null)
            return false;

        vCell.CellData.InitializeField();

        return this.InsertCol(this.FSelectCellRang.StartCol, aCount);
    }

    DeleteCurCol() {
        let vCell = this.GetEditCell();
        if (vCell == null)
            return false;

        vCell.CellData.InitializeField();

        if (this.FColWidths.count > 1)
            return this.DeleteCol(this.FSelectCellRang.StartCol);
        else
            return false;
    }

    DeleteCurRow() {
        let vCell = this.GetEditCell();
        if (vCell == null)
            return false;

        vCell.CellData.InitializeField();

        if (this.FRows.count > 1)
            return this.DeleteRow(this.FSelectCellRang.StartRow);
        else
            return false;
    }

    SplitCurRow() {
        let vTopCell = this.GetEditCell();
        if (vTopCell == null)
            return false;

        vTopCell.CellData.InitializeField();
        
        let vCurRow = this.FSelectCellRang.StartRow;
        let vCurCol = this.FSelectCellRang.StartCol;
        let vSrcRow = -1, vSrcCol = -1, vDestRow = -1, vDestCol = -1;
        
        if (this.FRows[vCurRow][vCurCol].RowSpan > 0) {
            let vInfo = this.GetSourceCell(vCurRow, vCurCol);
            vSrcRow = vInfo.row;
            vSrcCol = vInfo.col;
            this.FRows[vCurRow][vCurCol].RowSpan = 0;
            for (let i = vCurRow; i <= vSrcRow; i++) {
                for (let vC = vCurCol; vC <= vSrcCol; vC++)
                    this.FRows[i][vC].RowSpan = this.FRows[i][vC].RowSpan + 1;
            }
            
            this.FRows[vCurRow + 1][vCurCol].CellData = new HC.TableCellData(this.OwnerData.Style);
            this.FRows[vCurRow + 1][vCurCol].RowSpan = vSrcRow - (vCurRow + 1);
            this.FRows[vCurRow + 1][vCurCol].ColSpan = vSrcCol - vCurCol;
        } else if (this.InsertRow(vCurRow + 1, 1)) {
            let vC = 0;
            while (vC < this.ColCount) {
                vTopCell = this.FRows[vCurRow][vC];
                if (vC == vCurCol) {
                    if (vTopCell.ColSpan > 0) {
                        vSrcCol = vCurCol + vTopCell.ColSpan;
                        while (vC <= vSrcCol) {
                            this.FRows[vCurRow + 1][vC].ColSpan = this.FRows[vCurRow][vC].ColSpan;
                            if (this.FRows[vCurRow + 1][vC].ColSpan < 0) {
                                this.FRows[vCurRow + 1][vC].CellData.dispose();
                                this.FRows[vCurRow + 1][vC].CellData = null;
                            }
                            
                            vC++;
                        }
                    } else
                        vC++;
                } else {
                    if (vTopCell.ColSpan == 0) {
                        if (vTopCell.RowSpan == 0) {
                            this.FRows[vCurRow + 1][vC].CellData.dispose();
                            this.FRows[vCurRow + 1][vC].CellData = null;
                            this.FRows[vCurRow + 1][vC].RowSpan = -1;
                            vTopCell.RowSpan = 1;
                            vC++;
                        } else if (vTopCell.RowSpan < 0) {
                            vDestRow = vCurRow + vTopCell.RowSpan;
                            vSrcRow = vDestRow + this.FRows[vDestRow][vC].RowSpan;
                            if (vCurRow == vSrcRow) {
                                this.FRows[vCurRow + 1][vC].CellData.dispose();
                                this.FRows[vCurRow + 1][vC].CellData = null;
                                this.FRows[vCurRow + 1][vC].RowSpan = vTopCell.RowSpan - 1;
                                this.FRows[vDestRow][vC].RowSpan = this.FRows[vDestRow][vC].RowSpan + 1;
                            }
                            
                            vC++;
                        } else
                            vC++;
                    } else if (vTopCell.ColSpan > 0) {
                        if (vTopCell.RowSpan == 0) {
                            vTopCell.RowSpan = 1;
                            vDestCol = vC;
                            vSrcCol = vC + vTopCell.ColSpan;
                            
                            while (vC <= vSrcCol) {
                                this.FRows[vCurRow + 1][vC].CellData.dispose();
                                this.FRows[vCurRow + 1][vC].CellData = null;
                                this.FRows[vCurRow + 1][vC].ColSpan = vDestCol - vC;
                                this.FRows[vCurRow + 1][vC].RowSpan = -1;
                                vC++;
                            }
                        } else
                            vC++;
                    } else
                        vC++;
                }
            }
        }
        
        return true;
    }

    SplitCurCol() {
        let vLeftCell = this.GetEditCell();
        if (vLeftCell == null)
            return false;

        vLeftCell.CellData.InitializeField();

        let vCurRow = this.FSelectCellRang.StartRow;
        let vCurCol = this.FSelectCellRang.StartCol;
        let vSrcRow = -1, vSrcCol = -1, vDestRow = -1, vDestCol = -1;
        
        if (this.FRows[vCurRow][vCurCol].ColSpan > 0) {
            let vInfo = this.GetSourceCell(vCurRow, vCurCol);
            vSrcRow = vInfo.row;
            vSrcCol = vInfo.col;
            
            this.FRows[vCurRow][vCurCol].ColSpan = 0;
            for (let i = vCurCol; i <= vSrcCol; i++) {
                for (let vR = vCurRow; vR <= vSrcRow; vR++)
                    this.FRows[vR][i].ColSpan = this.FRows[vR][i].ColSpan + 1;
            }

            this.FRows[vCurRow][vCurCol + 1].CellData = new HC.TableCellData(this.OwnerData.Style);
            this.FRows[vCurRow][vCurCol + 1].RowSpan = vSrcRow - vCurRow;
            this.FRows[vCurRow][vCurCol + 1].ColSpan = vSrcCol - (vCurCol + 1);
        } else if (this.InsertCol(vCurCol + 1, 1)) {
            let vR = 0;
            while (vR < this.RowCount) {
                vLeftCell = this.FRows[vR][vCurCol];
                
                if (vR == vCurRow) {
                    if (vLeftCell.RowSpan > 0) {
                        vSrcRow = vCurRow + vLeftCell.RowSpan;
                        while (vR <= vSrcRow) {
                            this.FRows[vR][vCurCol + 1].RowSpan = this.FRows[vR][vCurCol].RowSpan;
                            if (this.FRows[vR][vCurCol + 1].RowSpan < 0) {
                                this.FRows[vR][vCurCol + 1].CellData.dispose();
                                this.FRows[vR][vCurCol + 1].CellData = null;
                            }
                            
                            vR++;
                        }
                    } else
                        vR++;
                } else {
                    if (vLeftCell.RowSpan == 0) {
                        if (vLeftCell.ColSpan == 0) {
                            this.FRows[vR][vCurCol + 1].CellData.dispose();
                            this.FRows[vR][vCurCol + 1].CellData = null;
                            this.FRows[vR][vCurCol + 1].ColSpan = -1;
                            vLeftCell.ColSpan = 1;
                            vR++;
                        } else if (vLeftCell.ColSpan < 0) {
                            vDestCol = vCurCol + vLeftCell.ColSpan;
                            vSrcCol = vDestCol + this.FRows[vR][vDestCol].ColSpan;
                            if (vCurCol == vSrcCol) {
                                this.FRows[vR][vCurCol + 1].CellData.dispose();
                                this.FRows[vR][vCurCol + 1].CellData = null;
                                this.FRows[vR][vCurCol + 1].ColSpan = vLeftCell.ColSpan - 1;
                                this.FRows[vR][vDestCol].ColSpan = this.FRows[vR][vDestCol].ColSpan + 1;
                            }
                            
                            vR++;
                        } else
                            vR++;
                    } else if (vLeftCell.RowSpan > 0) {
                        if (vLeftCell.ColSpan == 0) {
                            vLeftCell.ColSpan = 1;
                            vDestRow = vR;
                            vSrcRow = vR + vLeftCell.RowSpan;
                            
                            while (vR <= vSrcRow) {
                                this.FRows[vR][vCurCol + 1].CellData.dispose();
                                this.FRows[vR][vCurCol + 1].CellData = null;
                                this.FRows[vR][vCurCol + 1].RowSpan = vDestRow - vR;
                                this.FRows[vR][vCurCol + 1].ColSpan = -1;
                                vR++;
                            }
                        } else
                            vR++;
                    } else
                        vR++;
                }
            }
        }
        
        return true;
    }

    IsBreakRow(ARow) {
        let vResult = false;
        for (let i = 0; i < this.FPageBreaks.count; i++) {
            if (ARow == this.FPageBreaks[i].Row) {
                vResult = true;
                break;
            }
        }

        return vResult;
    }

    IsFixRow(ARow) {
        if (this.FFixRow >= 0)
            return (ARow >= this.FFixRow) && (ARow <= this.FFixRow + this.FFixRowCount - 1);
        else
            return false;
    }

    IsFixCol(ACol) {
        if (this.FFixCol >= 0)
            return (ACol >= this.FFixCol) && (ACol <= this.FFixCol + this.FFixColCount - 1);
        else
            return false;
    }

    GetFixRowHeight() {
        if (this.FFixRow < 0)
            return 0;
        else {
            let vResult = this.FBorderWidthPix;
            for (let vR = this.FFixRow; vR < this.FFixRow + this.FFixRowCount; vR++)
                vResult = vResult + this.FRows[vR].Height + this.FBorderWidthPix;

            return vResult;
        }
    }

    GetFixColWidth() {
        if (this.FFixCol < 0)
            return 0;
        else {
            let vResult = this.FBorderWidthPix;
            for (let vC = this.FFixCol; vC < this.FFixCol + this.FFixColCount; vC++)
                vResult = vResult + this.FColWidths[vC] + this.FBorderWidthPix;

            return vResult;
        }
    }

    GetFixColLeft() {
        if (this.FFixCol < 0)
            return 0;
        else {
            let vResult = this.FBorderWidthPix;
            for (let vC = 0; vC < this.FFixCol; vC++)
                vResult = vResult + this.FColWidths[vC] + this.FBorderWidthPix;

            return vResult;
        }
    }

    ColWidth(aIndex) {
        return this.GetColWidth(aIndex);
    }

    SetColWidth(aCol, aWidth) {
        this.FColWidths[aCol] = aWidth;
        for (let vR = 0; vR < this.RowCount; vR++) {
            this.FRows[vR][aCol].Width = aWidth;
            if (this.FRows[vR][aCol].CellData != null)
                this.FRows[vR][aCol].CellData.Width = aWidth - this.FCellHPaddingPix - this.FCellHPaddingPix;
        }
    }

    get Rows(){
        return this.FRows;
    }

    get RowCount() {
        return this.GetRowCount();
    }

    get ColCount() {
        return this.GetColCount();
    }

    get SelectCellRang() {
        return this.FSelectCellRang;
    }

    get BorderVisible() {
        return this.FBorderVisible;
    }

    set BorderVisible(val) {
        this.FBorderVisible = val;
    }

    get BorderWidthPt() {
        return this.FBorderWidthPt;
    }

    set BorderWidthPt(val) {
        this.SetBorderWidthPt(val);
    }

    get CellHPaddingPix() {
        return this.FCellHPaddingPix;
    }

    get CellVPaddingPix() {
        return this.FCellVPaddingPix;
    }

    get CellVPaddingMM() {
        return this.FCellVPaddingMM;
    }

    set CellVPaddingMM(val) {
        this.SetCellVPaddingMM(val);
    }

    get CellHPaddingMM() {
        return this.FCellHPaddingMM; 
    }

    set CellHPaddingMM(val) {
        this.SetCellHPaddingMM(val);
    }

    get FixCol() {
        return this.FFixCol;
    }

    set FixCol(val) {
        this.FFixCol = val;
    }

    get FixColCount() {
        return this.FFixColCount;
    }

    set FixColCount(val) {
        this.FFixColCount = val;
    }

    get FixRow() {
        return this.FFixRow;
    }

    set FixRow(val) {
        this.FFixRow = val;
    }

    get FixRowCount() {
        return this.FFixRowCount;
    }

    set FixRowCount(val) {
        this.FFixRowCount = val;
    }

    get OnCellPaintBK() {
        return this.FOnCellPaintBK;
    }

    set OnCellPaintBK(val) {
        this.OnCellPaintBK = val;
    }

    get OnCellPaintData() {
        return this.OnCellPaintData;
    }

    set OnCellPaintData(val) {
        this.OnCellPaintData = val;
    }
}