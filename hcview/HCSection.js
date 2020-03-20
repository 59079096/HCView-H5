import { TCursors, TKey, TMouseButton, TMouseEventArgs } from "../hcl/Controls.js";
import { TPenStyle } from "../hcl/Graphics.js";
import { system, TObject, TPoint, TRect } from "../hcl/System.js";
import { HC, THCCaretInfo, TPaperOrientation, TSectionArea } from "./HCCommon.js";
import { THCViewModel, TPaintInfo } from "./HCItem.js";
import { THCPage, THCPages, THCPaper } from "./HCPage.js";
import { THCFooterData, THCHeaderData, THCPageData } from "./HCSectionData.js";
import { THCStyle } from "./HCStyle.js";

export class TSectionPaintInfo extends TPaintInfo {
    constructor() {
        super();
        this.sectionIndex = -1;
        this.pageIndex  = -1;
        this.pageDataFmtTop = 0;
    }
}

export class THCCustomSection extends TObject {
    constructor(style) {
        super();
        this.FStyle = style;
        this.FPaper = new THCPaper();
        this.FPaperOrientation = TPaperOrientation.Portrait;
        this.FViewModel = THCViewModel.Film;
        
        this.FMoveData = null;
        this.FPageNoVisible = true;
        this.FPagePadding = 20;
        this.FPageNoFrom = 1;
        this.FActivePageIndex = 0;
        this.FMousePageIndex = 0;
        this.FDisplayFirstPageIndex = -1;
        this.FDisplayLastPageIndex = -1;
        this.FHeaderOffset = 20;

        let vWidth = this.GetPageWidth();
        this.FPage = new THCPageData(style);
        this.SetDataProperty(vWidth, this.FPage);
        this.FHeader = new THCHeaderData(style);
        this.SetDataProperty(vWidth, this.FHeader);
        this.FFooter = new THCFooterData(style);
        this.SetDataProperty(vWidth, this.FFooter);
        this.FActiveData = this.FPage;
        this.FSymmetryMargin = true;
        this.FPages = new THCPages();
        this.NewEmptyPage();
        this.FPages[0].startDrawItemNo = 0;
        this.FPages[0].endDrawItemNo = 0;

        this.FOnDataChange = null;
        this.FOnCheckUpdateInfo = null;
        this.FOnReadOnlySwitch = null;
        this.FOnChangeTopLevelData = null;
        this.FOnGetScreenCoord = null;
        this.FOnPaintHeader = null;
        this.FOnPaintFooter = null;
        this.FOnPaintPage = null;
        this.FOnPaintPaperBefor = null;
        this.FOnPaintPaperAfter = null;
        this.FOnDrawItemPaintBefor = null;
        this.FOnDrawItemPaintAfter = null;
        this.FOnInsertAnnotate = null;
        this.FOnRemoveAnnotate = null;
        this.FOnDrawItemAnnotate = null;
        this.FOnDrawItemPaintContent = null;
        this.FOnInsertItem = null;
        this.FOnRemoveItem = null;
        this.FOnSaveItem = null;
        this.FOnDataAcceptAction = null;
        this.FOnItemMouseDown = null;
        this.FOnItemMouseUp = null;
        this.FOnItemResize = null;
        this.FOnCreateItem = null;
        this.FOnCaretItemChanged = null;
        this.FOnCurParaNoChange = null;
        this.FOnActivePageChange = null;
        this.FOnCreateItemByStyle = null;
        this.FOnCreateFloatItemByStyle = null;
        this.FOnCanEdit = null;
        this.FOnInsertTextBefor = null;
        this.FOnGetUndoList = null;
    }

    // #region private
    GetPageIndexByFilm(voffset) {
        let Result = -1;
        let vPos = 0;
        for (let i = 0; i <= this.FPages.count - 1; i++)
        {
            if (this.FViewModel == THCViewModel.Film)
                vPos = vPos + this.FPagePadding + this.FPaper.heightPix;
            else
                vPos = vPos + this.GetPageHeight();

            if (vPos >= voffset)
            {
                Result = i;
                break;
            }
        }

        if ((Result < 0) && (voffset > vPos))
            Result = this.FPages.count - 1;

        return Result;
    }

    DoActiveDataCheckUpdateInfo() {
        if (this.FOnCheckUpdateInfo != null)
            this.FOnCheckUpdateInfo(this);
    }

    DoDataReadOnlySwitch(sender) {
        if (this.FOnReadOnlySwitch != null)
            this.FOnReadOnlySwitch(this);
    }

    DoGetScreenCoordEvent(x, y) {
        if (this.FOnGetScreenCoord != null)
            return this.FOnGetScreenCoord(x, y);
        else
            return TPoint.Create(0, 0);
    }

    DoDataDrawItemPaintBefor(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, 
        dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        if (this.FOnDrawItemPaintBefor != null)
            this.FOnDrawItemPaintBefor(this, data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight,
                dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
    }

    DoDataDrawItemPaintContent(data, itemNo, drawItemNo, drawRect, clearRect, drawText,
        dataDrawLeft, dataDrawRight, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        if (this.FOnDrawItemPaintContent != null)
            this.FOnDrawItemPaintContent(data, itemNo, drawItemNo, drawRect, clearRect, drawText,
                dataDrawLeft, dataDrawRight, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
    }

    DoDataDrawItemPaintAfter(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom, 
        dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        if (this.FOnDrawItemPaintAfter != null)
            this.FOnDrawItemPaintAfter(this, data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight,
                dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
    }

    DoDataInsertAnnotate(data, dataAnnotate) {
        if (this.FOnInsertAnnotate != null)
            this.FOnInsertAnnotate(this, data, dataAnnotate);
    }

    DoDataRemoveAnnotate(data, dataAnnotate) {
        if (this.FOnRemoveAnnotate != null)
            this.FOnRemoveAnnotate(this, data, dataAnnotate);
    }

    DoDataDrawItemAnnotate(data, drawItemNo, drawRect, dataAnnotate) {
        if (this.FOnDrawItemAnnotate != null)
            this.FOnDrawItemAnnotate(this, data, drawItemNo, drawRect, dataAnnotate);
    }

    DoDataInsertItem(data, item) {
        if (this.FOnInsertItem != null)
            this.FOnInsertItem(this, data, item);
    }

    DoDataRemoveItem(data, item) {
        if (this.FOnRemoveItem != null)
            this.FOnRemoveItem(this, data, item);
    }

    DoDataSaveItem(data, itemNo) {
        if (this.FOnSaveItem != null)
            return this.FOnSaveItem(this, data, itemNo);
        else
            return true;
    }

    DoDataAcceptAction(data, itemNo, offset, action) {
        if (this.FOnDataAcceptAction != null)
            return this.FOnDataAcceptAction(this, data, itemNo, offset, action);
        else
            return true;
    }

    DoDataItemMouseDown(data, itemNo, offset, e) {
        if (this.FOnItemMouseDown != null)
            this.FOnItemMouseDown(this, data, itemNo, offset, e);
    }

    DoDataItemMouseUp(data, itemNo, offset, e) {
        if (this.FOnItemMouseUp != null)
            this.FOnItemMouseUp(this, data, itemNo, offset, e);
    }

    DoDataChanged(sender) {
        if (this.FOnDataChange != null)
            this.FOnDataChange(sender, null);
    }

    DoDataItemRequestFormat(sectionData, item) {
        this.DoSectionDataAction(sectionData, () => {
            sectionData.ReFormatActiveItem();
            return true;
        });
    }

    /// <summary> 缩放Item约束不要超过整页宽、高 </summary>
    DoDataItemResized(data, itemNo) {
        let vResizeItem = data.Items[itemNo];// as HCResizeRectItem;
        let vWidth = this.GetPageWidth();  // 页宽
        let vHeight = 0;
        let vData = data.GetRootData();  // 获取是哪一部分的ResizeItem

        if (vData == this.FHeader)
            vHeight = this.GetHeaderAreaHeight();
        else
        if (vData == this.FFooter)
            vHeight = this.FPaper.marginBottomPix;
        else
            vHeight = this.GetPageHeight();  // - FStyle.ParaStyles[vResizeItem.ParaNo].LineSpace;

        vResizeItem.RestrainSize(vWidth, vHeight);
        if (this.FOnItemResize != null)
            this.FOnItemResize(data, itemNo);
    }

    DoDataCreateStyleItem(data, styleNo) {
        if (this.FOnCreateItemByStyle != null)
            return this.FOnCreateItemByStyle(data, styleNo);
        else
            return null;
    }

    DoDataCreateFloatStyleItem(data, styleNo) {
        if (this.FOnCreateFloatItemByStyle != null)
            return this.FOnCreateFloatItemByStyle(data, styleNo);
        else
            return null;
    }

    DoDataCanEdit(sender) {
        if (this.FOnCanEdit != null)
            return this.FOnCanEdit(sender);
        else
            return true;
    }

    DoDataInsertTextBefor(data, itemNo, offset, text) {
        if (this.FOnInsertTextBefor != null)
            return this.FOnInsertTextBefor(data, itemNo, offset, text);
        else
            return true;
    }

    DoDataCreateItem(sender) {
        if (this.FOnCreateItem != null)
            this.FOnCreateItem(sender, null);
    }

    DoDataCurParaNoChange(sender) {
        if (this.FOnCurParaNoChange != null)
            this.FOnCurParaNoChange(sender);
    }

    DoDataCaretItemChanged(data, item) {
        if (this.FOnCaretItemChanged != null)
            this.FOnCaretItemChanged(this, data, item);
    }

    DoDataGetUndoList() {
        if (this.FOnGetUndoList != null)
            return this.FOnGetUndoList();
        else
            return null;
    }

    /// <summary> 返回页面Data指定DrawItem所在的页(跨页的按最后位置所在页) </summary>
    /// <param name="drawItemNo"></param>
    /// <returns></returns>
    GetPageIndexByPageDataDrawItem(drawItemNo) {
        if (drawItemNo < 0)
            return 0;

        let Result = this.FPages.count - 1;
        for (let i = 0; i <= this.FPages.count - 1; i++)
        {
            if (this.FPages[i].endDrawItemNo >= drawItemNo)
            {
                Result = i;
                break;
            }
        }

        return Result;
    }

    PaperCoordToData(pageIndex, data, ax, ay, restrain = true) {
        if (this.FViewModel != THCViewModel.Film)
            return {
                x: ax,
                y: ay
            }

        let viTemp = -1;
        let vMarginLeft = this.GetPageMarginLeft(pageIndex);
        ax = ax - vMarginLeft;

        // 为避免边界(激活正文，在页眉页脚点击时判断仍是在正文位置造成光标错误)约束后都偏移1
        if (data == this.FHeader) {
            ay = ay - this.GetHeaderPageDrawTop();  // 相对页眉绘制位置
            if (restrain) {
                if (ay < 0)
                    ay = 1;
                else {
                    viTemp = this.FHeader.height;
                    if (ay > viTemp)
                        ay = viTemp - 1;
                }
            }
        } else if (data == this.FFooter) {
            ay = ay - this.FPaper.heightPix + this.FPaper.marginBottomPix;
            if (restrain) {
                if (ay < 0)
                    ay = 1;
                else if (ay > this.FPaper.marginBottomPix)
                    ay = this.FPaper.marginBottomPix - 1;
            }
        } else if (data == this.FPage) {
            ay = ay - this.GetHeaderAreaHeight();
            if (restrain) {
                if (ay < 0)
                    ay = 1;  // 处理激活正文，在页眉页脚中点击
                else {
                    viTemp = this.GetPageHeight();
                    if (ay >= viTemp)
                        ay = viTemp - 1;
                }
            }
        }

        return {
            x: ax,
            y: ay
        }
    }

    GetReadOnly() {
        return this.FHeader.ReadOnly && this.FFooter.ReadOnly && this.FPage.ReadOnly;
    }

    SetReadOnly(val) {
        this.FHeader.ReadOnly = val;
        this.FFooter.ReadOnly = val;
        this.FPage.ReadOnly = val;
    }

    SetActivePageIndex(Value) {
        if (this.FActivePageIndex != Value) {
            this.FActivePageIndex = Value;
            if (this.FOnActivePageChange != null)
                this.FOnActivePageChange(this, null);
        }
    }

    GetCurStyleNo() {
        return this.FActiveData.GetTopLevelData().CurStyleNo;
    }

    GetCurParaNo() {
        return this.FActiveData.GetTopLevelData().CurParaNo;
    }
    // #endregion

    // #region protected
    /// <summary> 当前Data需要UpdateInfo更新 </summary>
    DoActiveDataCheckUpdateInfo_() {
        if (this.FOnCheckUpdateInfo != null)
            this.FOnCheckUpdateInfo(this, null);
    }

    KillFocus() {
        this.FActiveData.KillFocus();
    }

    GetPaperSize() {
        return this.FPaper.Size;
    }

    SetPaperSize(Value) {
        this.FPaper.Size = Value;
    }

    GetPaperWidth() {
        return this.FPaper.width;
    }

    GetPaperHeight() {
        return this.FPaper.height;
    }

    GetPaperMarginTop() {
        return this.FPaper.marginTop;
    }

    GetPaperMarginLeft() {
        return this.FPaper.marginLeft;
    }

    GetPaperMarginRight() {
        return this.FPaper.marginRight;
    }

    GetPaperMarginBottom() {
        return this.FPaper.marginBottom;
    }

    SetPaperWidth(val) {
        this.FPaper.width = val;
    }

    SetPaperHeight(val) {
        this.FPaper.height = val;
    }

    SetPaperMarginTop(val) {
        this.FPaper.marginTop = val;
    }

    SetPaperMarginLeft(val) {
        this.FPaper.marginLeft = val;
    }

    SetPaperMarginRight(val) {
        this.FPaper.marginRight = val;
    }

    SetPaperMarginBottom(val) {
        this.FPaper.marginBottom = val;
    }

    GetPaperWidthPix() {
        return this.FPaper.widthPix;
    }

    GetPaperHeightPix() {
        return this.FPaper.heightPix;
    }

    GetPaperMarginTopPix() {
        return this.FPaper.marginTopPix;
    }

    GetPaperMarginLeftPix() {
        return this.FPaper.marginLeftPix;
    }

    GetPaperMarginRightPix() {
        return this.FPaper.marginRightPix;
    }

    GetPaperMarginBottomPix() {
        return this.FPaper.marginBottomPix;
    }

    SetHeaderOffset(val) {
        if (this.FHeaderOffset != val) {
            this.FHeaderOffset = val;
            this.BuildSectionPages(0);
            this.DoDataChanged(this);
        }
    }

    NewEmptyPage() {
        let vResult = new THCPage();
        this.FPages.add(vResult);
        return vResult;
    }

    GetPageCount() {
        return this.FPages.count;
    }

    GetSectionDataAt(x, y) {
        //let vPageIndex = this.GetPageIndexByFilm(y);

        if (x < 0)
            return this.FActiveData;
        
        if (x > this.FPaper.widthPix)
            return this.FActiveData;
        
        if (y < 0)
            return this.FActiveData;
        
        if (y > this.FPaper.heightPix)
            return this.FActiveData;
        
        if (y >= this.FPaper.heightPix - this.FPaper.marginBottomPix)
            return this.FFooter;

        if (y < this.GetHeaderAreaHeight())
            return this.FHeader;

        return this.FPage;
    }

    GetActiveArea() {
        if (this.FActiveData == this.FHeader)
            return TSectionArea.saHeader;
        else if (this.FActiveData == this.FFooter)
            return TSectionArea.saFooter;
        else
            return TSectionArea.saPage;
    }

    SetActiveData(val) {
        if (this.FActiveData != val) {
            if (this.FActiveData != null) {
                this.FActiveData.DisSelect();
                this.FActiveData.DisActive();
            }

            this.FActiveData = val;
            this.FStyle.updateInfoReScroll();
        }
    }

    GetDataFmtTopFilm(vertical) {
        let Result = 0;
        let vTop = 0;
        let vPageHeight = this.GetPageHeight();

        for (let i = 0; i <= this.FPages.count - 1; i++) {
            vTop = vTop + vPageHeight;
            if (vTop >= vertical) {
                vTop = vertical - (vTop - vPageHeight);
                break;
            }
            else
                Result = Result + this.FPagePadding + this.FPaper.heightPix;
        }

        Result = Result + this.FPagePadding + this.GetHeaderAreaHeight() + vTop;

        return Result;
    }

    DoSectionDataAction(data, action) {
        if (!data.CanEdit())
            return false;

        if (data.FloatItemIndex >= 0)
            return false;

        let Result = action();

        if (data.FormatChange) {
            data.FormatChange = false;

            if (data === this.FPage)
                this.BuildSectionPages(data.FormatStartDrawItemNo);
            else
                this.BuildSectionPages(0);
        }

        this.DoDataChanged(this);

        return Result;
    }

    get Style() {
        return this.FStyle;
    }

    SetDataProperty(vWidth, data) {
        data.width = vWidth;
        data.OnInsertItem = (data, item) => { this.DoDataInsertItem(data, item); }
        data.OnRemoveItem = (data, item) => { this.DoDataRemoveItem(data, item); }
        data.OnSaveItem = (data, itemNo) => { return this.DoDataSaveItem(data, itemNo); }
        data.OnAcceptAction = (data, itemNo, offset, action) => { return this.DoDataAcceptAction(data, itemNo, offset, action); }
        data.OnItemResized = (data, itemNo) => { this.DoDataItemResized(data, itemNo); }
        data.OnItemMouseDown = (data, itemNo, offset, e) => { this.DoDataItemMouseDown(data, itemNo, offset, e); }
        data.OnItemMouseUp = (data, itemNo, offset, e) => { this.DoDataItemMouseUp(data, itemNo, offset, e); }
        data.OnItemRequestFormat = (data, item) => { this.DoDataItemRequestFormat(data, item); }
        data.OnCreateItemByStyle = (data, styleNo) => { return this.DoDataCreateStyleItem(data, styleNo); }
        data.OnCreateFloatItemByStyle = (data, styleNo) => { return this.DoDataCreateFloatStyleItem(data, styleNo); }
        data.OnCanEdit = (sender) => { return this.DoDataCanEdit(sender); }
        data.OnInsertTextBefor = (data, itemNo, offset, text) => { return this.DoDataInsertTextBefor(data, itemNo, offset, text); }
        data.OnCreateItem = (sender) => { this.DoDataCreateItem(sender); }
        data.OnReadOnlySwitch = (sender) => { this.DoDataReadOnlySwitch(sender); }
        data.OnGetScreenCoord = (x, y) => { return this.DoGetScreenCoordEvent(x, y); }
        data.OnDrawItemPaintBefor = (data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, 
            dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) => {
                this.DoDataDrawItemPaintBefor(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, 
                    dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
        }

        data.OnDrawItemPaintAfter = (data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom, 
            dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) => {
                this.DoDataDrawItemPaintAfter(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom, 
                    dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
        }

        data.OnDrawItemPaintContent = (data, itemNo, drawItemNo, drawRect, clearRect, drawText,
            dataDrawLeft, dataDrawRight, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) => {
                this.DoDataDrawItemPaintContent(data, itemNo, drawItemNo, drawRect, clearRect, drawText,
                    dataDrawLeft, dataDrawRight, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
        }

        data.OnInsertAnnotate = (data, aDataAnnotate) => { this.DoDataInsertAnnotate(data, aDataAnnotate); }
        data.OnRemoveAnnotate = (data, aDataAnnotate) => { this.DoDataRemoveAnnotate(data, aDataAnnotate); }
        data.OnDrawItemAnnotate = (data, drawItemNo, drawRect, aDataAnnotate) => { this.DoDataDrawItemAnnotate(data, drawItemNo, drawRect, aDataAnnotate); }
        data.OnGetUndoList = () => { return this.DoDataGetUndoList(); }
        data.OnCurParaNoChange = (sender) => { this.DoDataCurParaNoChange(sender); }
        data.OnCaretItemChanged = (data, item) => { this.DoDataCaretItemChanged(data, item); }
    }
    // #endregion

    // #region public

    dispose() {
        this.FHeader.dispose();
        this.FFooter.dispose();
        this.FPage.dispose();
        this.FPaper.dispose();
        super.dispose();
    }

    /// <summary> 修改纸张边距 </summary>
    ResetMargin() {
        this.FPage.width = this.GetPageWidth();
        this.FHeader.width = this.FPage.width;
        this.FFooter.width = this.FPage.width;
        this.FormatData();
        this.BuildSectionPages(0);
        this.FStyle.updateInfoRePaint();
        this.FStyle.updateInfoReCaret(false);
        this.DoDataChanged(this);
    }

    ActiveItemReAdaptEnvironment() {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ActiveItemReAdaptEnvironment();
            return true;
        });
    }

    DisActive() {
        this.FActiveData.DisSelect();
        this.FHeader.InitializeField();
        this.FFooter.InitializeField();
        this.FPage.InitializeField();
        this.FActiveData = this.FPage;
    }

    SelectExists() {
        return this.FActiveData.SelectExists();
    }

    SelectAll() {
        this.FActiveData.SelectAll();
    }

    GetHint() {
        return this.FActiveData.GetTopLevelData().GetHint();
    }

    GetActiveItem() {
        return this.FActiveData.GetActiveItem();
    }

    GetTopLevelItem() {
        return this.FActiveData.GetTopLevelItem();
    }

    GetTopLevelDrawItem() {
        return this.FActiveData.GetTopLevelDrawItem();
    }

    GetTopLevelDrawItemCoord() {
        return this.FActiveData.GetTopLevelDrawItemCoord();
    }

    GetTopLevelRectDrawItemCoord() {
        return this.FActiveData.GetTopLevelRectDrawItemCoord();
    }

    GetPageIndexByCurrent() {
        let Result = -1;
        let vCaretDrawItemNo = -1;
        if (this.FActiveData != this.FPage)
            Result = this.FActivePageIndex;
        else {
            if (this.FPage.CaretDrawItemNo < 0) {
                vCaretDrawItemNo = this.FPage.GetDrawItemNoByOffset(this.FPage.SelectInfo.StartItemNo,
                    this.FPage.SelectInfo.StartItemOffset);
            } else
                vCaretDrawItemNo = this.FPage.CaretDrawItemNo;

            let vCaretInfo = new THCCaretInfo();
            for (let i = 0; i <= this.FPages.count - 1; i++) {
                if (this.FPages[i].endDrawItemNo >= vCaretDrawItemNo) {
                    if ((i < this.FPages.count - 1) && (this.FPages[i + 1].startDrawItemNo == vCaretDrawItemNo)) {
                        if (this.FPage.SelectInfo.StartItemNo >= 0) {
                            vCaretInfo.y = 0;
                            this.FPage.GetCaretInfo(this.FPage.SelectInfo.StartItemNo,
                                this.FPage.SelectInfo.StartItemOffset, vCaretInfo);

                            Result = this.GetPageIndexByFormat(vCaretInfo.y);
                        } else
                            Result = this.GetPageIndexByPageDataDrawItem(vCaretDrawItemNo);
                    } else
                        Result = i;

                    break;
                }
            }
        }

        return Result;
    }

    /// <summary> 返回正文格式位置所在页序号 </summary>
    GetPageIndexByFormat(voffset) {
        return Math.trunc(voffset / this.GetPageHeight());
    }

    /// <summary> 直接设置当前TextItem的Text值 </summary>
    SetActiveItemText(text) {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.SetActiveItemText(text);
            return true;
        });
    }

    PaintDisplayPage(filmOffsetX, filmOffsetY, hclCanvas, paintInfo) {
        for (let i = this.FDisplayFirstPageIndex; i <= this.FDisplayLastPageIndex; i++) {
            paintInfo.pageIndex = i;
            let vPaperFilmTop = 0;
            if (paintInfo.viewModel == THCViewModel.Film)
                vPaperFilmTop = this.GetPageTopFilm(i);
            else
                vPaperFilmTop = this.GetPageTop(i);

            this.paintPaper(i, filmOffsetX, vPaperFilmTop - filmOffsetY, hclCanvas, paintInfo);
        }
    }

    KeyPress(e) {
        if (!this.FActiveData.CanEdit())
            return;

        if (HC.IsKeyPressWant(e)) {
            let vKey = e.keyCode;

            this.DoSectionDataAction(this.FActiveData, () => {
                vKey = this.FActiveData.KeyPress(vKey);
                return true;
            });

            e.keyCode = vKey;
        }
        else
            e.keyCode = 0;
    }

    KeyDown(e) {
        if (!this.FActiveData.CanEdit())
            return;

        if (this.FActiveData.KeyDownFloatItem(e)) {
            this.DoActiveDataCheckUpdateInfo();
            return;
        }

        let vKey = e.keyCode;
        if (HC.IsKeyDownWant(vKey)) {
            switch (vKey)
            {
                case TKey.Back:
                case TKey.Delete:
                case TKey.Return:
                case TKey.Tab:
                    this.DoSectionDataAction(this.FActiveData, () => {
                        this.FActiveData.KeyDown(e);
                        return true;
                    });
                    
                    break;

                case TKey.Left:
                case TKey.Right:
                case TKey.Up:
                case TKey.Down:
                case TKey.Home:
                case TKey.End:
                    this.FActiveData.KeyDown(e);
                    this.SetActivePageIndex(this.GetPageIndexByCurrent());
                    this.DoActiveDataCheckUpdateInfo();
                    break;
            }
        }
    }

    KeyUp(e) {
        if (!this.FActiveData.CanEdit())
            return;

        this.FActiveData.KeyUp(e);
    }

    ApplyTextStyle(fontStyle) {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ApplyTextStyle(fontStyle);
            return true;
        });
    }

    ApplyTextFontName(fontName) {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ApplyTextFontName(fontName);
            return true;
        });
    }

    ApplyTextFontSize(fontSize) {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ApplyTextFontSize(fontSize);
            return true;
        });
    }

    ApplyTextColor(color) {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ApplyTextColor(color);
            return true;
        });
    }

    ApplyTextBackColor(color) {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ApplyTextBackColor(color);
            return true;
        });
    }

    ApplyTableCellAlign(align) {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ApplyTableCellAlign(align);
            return true;
        });
    }

    InsertText(text) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.InsertText(text);
        });
    }

    InsertTable(rowCount, colCount) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.InsertTable(rowCount, colCount);
        });
    }

    InsertImage(image) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.InsertImage(image);
        });
    }

    InsertGifImage(file) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.InsertGifImage(file);
        });
    }

    InsertLine(lineHeight) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.InsertLine(lineHeight);
        });
    }

    InsertItem(item) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.InsertItem(item);
        });
    }

    InsertItemEx(index, item) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.InsertItemEx(index, item);
        });
    }

    InsertBreak() {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.InsertBreak();
        });
    }

    InsertPageBreak() {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FPage.InsertPageBreak();
        });
    }

    InsertDomain(mouldDomain) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.InsertDomain(mouldDomain);
        });
    }

    InsertAnnotate(title, text) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.InsertAnnotate(title, text);
        });
    }

    SetActiveImage(imageStream) {
        return this.DoSectionDataAction(this.FActiveData, ()=> {
            return this.FActiveData.SetActiveImage(imageStream);
        });
    }

    ActiveTableResetRowCol(rowCount, colCount) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.ActiveTableResetRowCol(rowCount, colCount);
        });
    }

    ActiveTableInsertRowAfter(rowCount) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.TableInsertRowAfter(rowCount);
        });
    }

    ActiveTableInsertRowBefor(rowCount) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.TableInsertRowBefor(rowCount);
        });
    }

    ActiveTableDeleteCurRow() {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.ActiveTableDeleteCurRow();
        });
    }

    ActiveTableSplitCurRow() {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.ActiveTableSplitCurRow();
        });
    }

    ActiveTableSplitCurCol() {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.ActiveTableSplitCurCol();
        });
    }

    ActiveTableInsertColAfter(colCount) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.TableInsertColAfter(colCount);
        });
    }

    ActiveTableInsertColBefor(colCount) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.TableInsertColBefor(colCount);
        });
    }

    ActiveTableDeleteCurCol() {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.ActiveTableDeleteCurCol();
        });
    }

    SectionCoordToPaper(pageIndex, x, y, pageX, pageY) {
        pageX = x;

        let vPageFilmTop = 0;
        if (this.FViewModel == THCViewModel.Film)
            vPageFilmTop = this.GetPageTopFilm(pageIndex);
        else
            vPageFilmTop = this.GetPageTop(pageIndex);

        pageY = y - vPageFilmTop;

        return {
            x: pageX,
            y: pageY
        }
    }

    ApplyParaAlignHorz(align) {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ApplyParaAlignHorz(align);
            return true;
        });
    }

    ApplyParaAlignVert(align) {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ApplyParaAlignVert(align);
            return true;
        });
    }

    ApplyParaBackColor(color) {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ApplyParaBackColor(color);
            return true;
        });
    }

    ApplyParaBreakRough(rough) {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ApplyParaBreakRough(rough);
            return true;
        });
    }

    ApplyParaLineSpace(spaceMode, space) {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ApplyParaLineSpace(spaceMode, space);
            return true;
        });
    }

    ApplyParaLeftIndent(indent) {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ApplyParaLeftIndent(indent);
            return true;
        });
    }

    ApplyParaRightIndent(indent) {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ApplyParaRightIndent(indent);
            return true;
        });
    }

    ApplyParaFirstIndent(indent) {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ApplyParaFirstIndent(indent);
            return true;
        });
    }

    GetPageCaretInfo(caretInfo) {
        let vMarginLeft = -1;
        let vPageIndex = -1;
        if (this.FStyle.updateInfo.draging)
            vPageIndex = this.FMousePageIndex;
        else
            vPageIndex = this.FActivePageIndex;

        if ((this.FActiveData.SelectInfo.StartItemNo < 0) || (vPageIndex < 0)) {
            caretInfo.visible = false;
            return;
        }

        caretInfo.pageIndex = vPageIndex;  // 鼠标点击处所在的页
        this.FActiveData.GetCaretInfoCur(caretInfo);

        if (caretInfo.visible) {
            if (this.FActiveData == this.FPage) {
                vMarginLeft = this.GetPageIndexByFormat(caretInfo.y);
                if (vPageIndex != vMarginLeft) {
                    vPageIndex = vMarginLeft;
                    this.SetActivePageIndex(vPageIndex);
                }
            }

            if (this.FViewModel == THCViewModel.Film) {
                vMarginLeft = this.GetPageMarginLeft(vPageIndex);
                caretInfo.x = caretInfo.x + vMarginLeft;
                caretInfo.y = caretInfo.y + this.GetPageTopFilm(vPageIndex);

                if (this.FActiveData == this.FHeader)
                    caretInfo.y = caretInfo.y + this.GetHeaderPageDrawTop();
                else if (this.FActiveData == this.FPage)
                    caretInfo.y = caretInfo.y + this.GetHeaderAreaHeight() - this.GetPageDataFmtTop(vPageIndex);
                else if (this.FActiveData == this.FFooter)
                    caretInfo.y = caretInfo.y + this.FPaper.heightPix - this.FPaper.marginBottomPix;
            } else {
                caretInfo.y = caretInfo.y + this.GetPageTop(vPageIndex);
                if (this.FActiveData == this.FPage)
                    caretInfo.y = caretInfo.y - this.GetPageDataFmtTop(vPageIndex);
            }
        }
    }

    // #region 绘制页眉数据
    PaintHeader(vPaperDrawTop, vPageDrawTop, vPageDrawLeft, vPageDrawRight, vMarginLeft, vMarginRight,
        vHeaderAreaHeight, pageIndex, hclCanvas, paintInfo) {
        let vScreenBottom = vHeaderAreaHeight + vPaperDrawTop;
        if (vPaperDrawTop > 0)
            vScreenBottom = vPaperDrawTop + vHeaderAreaHeight;

        let vHeaderDataDrawTop = vPaperDrawTop + this.GetHeaderPageDrawTop();

        this.FHeader.PaintData(vPageDrawLeft, vHeaderDataDrawTop, vPageDrawRight,
            vPageDrawTop, Math.max(vHeaderDataDrawTop, 0),
            vScreenBottom, 0, hclCanvas, paintInfo);

        if (this.FOnPaintHeader != null) {
            hclCanvas.save();
            try {
                this.FOnPaintHeader(this, pageIndex,
                    TRect.Create(vPageDrawLeft, vHeaderDataDrawTop, vPageDrawRight, vPageDrawTop), hclCanvas, paintInfo);
            } finally {
                hclCanvas.restore();
            }
        }
    }
    // #endregion

    // #region 绘制页脚数据
    PaintFooter(vPaperDrawBottom, vPageDrawLeft, vPageDrawRight, vPageDrawBottom, vMarginLeft,
        vMarginRight, pageIndex, hclCanvas, paintInfo) {
            let vScreenBottom = paintInfo.windowHeight - paintInfo.getScaleY(vPageDrawBottom);
            if (vScreenBottom > this.FPaper.MarginBottomPix)
                vScreenBottom = vPaperDrawBottom;
            else
                vScreenBottom = paintInfo.windowHeight;

            this.FFooter.PaintData(vPageDrawLeft, vPageDrawBottom, vPageDrawRight, vPaperDrawBottom,
            Math.max(vPageDrawBottom, 0), Math.min(vPaperDrawBottom, paintInfo.windowHeight),
            0, hclCanvas, paintInfo);

        if (this.FOnPaintFooter != null) {
            hclCanvas.save();
            try {
                this.FOnPaintFooter(this, pageIndex,
                    TRect.Create(vPageDrawLeft, vPageDrawBottom, vPageDrawRight, vPaperDrawBottom), hclCanvas, paintInfo);
            } finally {
                hclCanvas.restore();
            }
        }
    }
    // #endregion

    // #region 绘制页面数据
    PaintPage(vPageDrawLeft, vPageDrawTop, vPageDrawRight, vPageDrawBottom,
        vMarginLeft, vMarginRight, vHeaderAreaHeight, vPageDataScreenTop, vPageDataScreenBottom,
        pageIndex, hclCanvas, paintInfo) {
        if ((this.FPages[pageIndex].startDrawItemNo < 0) || (this.FPages[pageIndex].endDrawItemNo < 0))
            return;

        this.FPage.PaintDataRange(vPageDrawLeft, vPageDrawTop, vPageDrawRight, vPageDrawBottom,
            vPageDataScreenTop, vPageDataScreenBottom, paintInfo.PageDataFmtTop,
            this.FPages[pageIndex].startDrawItemNo, this.FPages[pageIndex].endDrawItemNo,
            hclCanvas, paintInfo);

        if (this.FOnPaintPage != null) {
            hclCanvas.save();
            try {
                this.FOnPaintPage(this, pageIndex, TRect.Create(vPageDrawLeft, vPageDrawTop, vPageDrawRight, vPageDrawBottom), hclCanvas, paintInfo);
            } finally {
                hclCanvas.restore();
            }
        }
    }
    // #endregion

    paintPaper(pageIndex, left, top, hclCanvas, paintInfo) {
        let vScaleWidth = Math.round(paintInfo.windowWidth / paintInfo.scaleX);
        let vScaleHeight = Math.round(paintInfo.windowHeight / paintInfo.scaleY);

        let vPaperDrawLeft = left, vPaperDrawTop = top, vPaperDrawRight, vPaperDrawBottom,
            vPageDrawLeft, vPageDrawTop, vPageDrawRight = 0, vPageDrawBottom = 0, vMarginLeft = 0, vMarginRight = 0, vHeaderAreaHeight = 0;

        if (paintInfo.viewModel == THCViewModel.Film) {
            vPaperDrawRight = left + this.FPaper.widthPix;
            vPaperDrawBottom = vPaperDrawTop + this.FPaper.heightPix;

            let vMrg = this.GetPageMarginLeftAndRight(pageIndex);
            vMarginLeft = vMrg.left;
            vMarginRight = vMrg.right;
            vPageDrawLeft = vPaperDrawLeft + vMarginLeft;
            vPageDrawRight = vPaperDrawRight - vMarginRight;
            vHeaderAreaHeight = this.GetHeaderAreaHeight();
            vPageDrawTop = vPaperDrawTop + vHeaderAreaHeight;
            vPageDrawBottom = vPaperDrawBottom - this.FPaper.marginBottomPix;
        } else {
            vPaperDrawRight = left + this.GetPageWidth();
            vPaperDrawBottom = top + this.GetPageHeight();

            vPageDrawLeft = vPaperDrawLeft;
            vPageDrawRight = vPaperDrawRight;
            vHeaderAreaHeight = 0;
            vMarginLeft = 0;
            vMarginRight = 0;
            vPageDrawTop = vPaperDrawTop;
            vPageDrawBottom = vPaperDrawBottom - 1;
        }

        let vPageDataScreenTop = Math.max(vPageDrawTop, 0);
        let vPageDataScreenBottom = Math.min(vPageDrawBottom, vScaleHeight);

        paintInfo.PageDataFmtTop = this.GetPageDataFmtTop(pageIndex);

        hclCanvas.save();
        try {
            if (!paintInfo.print) {
                hclCanvas.brush.color = this.FStyle.BackgroundColor;
                hclCanvas.fillRect(TRect.Create(vPaperDrawLeft, vPaperDrawTop, Math.min(vPaperDrawRight, vScaleWidth),
                    Math.min(vPaperDrawBottom, vScaleHeight)));

                if (paintInfo.viewModel == THCViewModel.Film) {
                    if (vPageDrawTop > 0) {
                        if (vHeaderAreaHeight > this.FPaper.marginTopPix) {
                            hclCanvas.pen.style = TPenStyle.Dot;
                            hclCanvas.pen.color = "gray";
                            paintInfo.drawNoScaleLine(hclCanvas, [TPoint.Create(vPageDrawLeft, vPageDrawTop - 1), TPoint.Create(vPageDrawRight, vPageDrawTop - 1)]);
                        }

                        if (this.FActiveData == this.FHeader) {
                            hclCanvas.pen.width = 1;
                            hclCanvas.pen.color = "blue";
                            hclCanvas.pen.style = TPenStyle.Solid;
                            hclCanvas.drawLine(vPageDrawLeft, vPageDrawTop, vPageDrawRight, vPageDrawTop);
                            
                            hclCanvas.brush.color = "rgb(216, 232, 245)";
                            hclCanvas.fillRect(TRect.Create(vPageDrawLeft - 40, vPageDrawTop, vPageDrawLeft, vPageDrawTop + 20));
                            hclCanvas.font.size = 10;
                            hclCanvas.font.name = "宋体";
                            hclCanvas.font.styles.clear();
                            hclCanvas.font.color = "rgb(21, 66, 139)";

                            hclCanvas.textOut(vPageDrawLeft - 32, vPageDrawTop + 4, "页眉");
                        } else {
                            hclCanvas.pen.width = 1;
                            hclCanvas.pen.color = "gray";
                            hclCanvas.pen.style = TPenStyle.Solid;
                        }

                        paintInfo.drawNoScaleLine(hclCanvas, [TPoint.Create(vPageDrawLeft - HC.PMSLineHeight, vPageDrawTop),
                            TPoint.Create(vPageDrawLeft, vPageDrawTop), TPoint.Create(vPageDrawLeft, vPageDrawTop - HC.PMSLineHeight)]);
                        paintInfo.drawNoScaleLine(hclCanvas, [TPoint.Create(vPageDrawRight + HC.PMSLineHeight, vPageDrawTop),
                            TPoint.Create(vPageDrawRight, vPageDrawTop), TPoint.Create(vPageDrawRight, vPageDrawTop - HC.PMSLineHeight)]);
                    }

                    if (paintInfo.getScaleY(vPageDrawBottom) < paintInfo.windowHeight) {
                        if (this.FActiveData == this.FFooter) {
                            hclCanvas.pen.width = 1;
                            hclCanvas.pen.color = "blue";
                            hclCanvas.pen.style = TPenStyle.Solid;
                            hclCanvas.drawLine(vPageDrawLeft, vPageDrawBottom, vPageDrawRight, vPageDrawBottom);

                            hclCanvas.brush.color = "rgb(216, 232, 245)";
                            hclCanvas.fillRect(TRect.Create(vPageDrawLeft - 40, vPageDrawBottom, vPageDrawLeft, vPageDrawBottom - 20));
                            hclCanvas.font.size = 10;
                            hclCanvas.font.family = "宋体";
                            hclCanvas.font.styles.clear();
                            hclCanvas.font.color = "rgb(21, 66, 139)";

                            hclCanvas.textOut(vPageDrawLeft - 32, vPageDrawBottom - 16, "页脚");
                        } else {
                            hclCanvas.pen.width = 1;
                            hclCanvas.pen.color = "gray";
                            hclCanvas.pen.style = TPenStyle.Solid;
                        }

                        paintInfo.drawNoScaleLine(hclCanvas, [TPoint.Create(vPageDrawLeft - HC.PMSLineHeight, vPageDrawBottom),
                            TPoint.Create(vPageDrawLeft, vPageDrawBottom), TPoint.Create(vPageDrawLeft, vPageDrawBottom + HC.PMSLineHeight)]);
                        paintInfo.drawNoScaleLine(hclCanvas, [TPoint.Create(vPageDrawRight + HC.PMSLineHeight, vPageDrawBottom),
                           TPoint.Create(vPageDrawRight, vPageDrawBottom), TPoint.Create(vPageDrawRight, vPageDrawBottom + HC.PMSLineHeight)]);
                    }
                } else {
                    if (vPageDrawTop > 0) {
                        hclCanvas.pen.Width = 1;
                        hclCanvas.pen.color = "gray";
                        hclCanvas.pen.style = TPenStyle.DashDot;
                        hclCanvas.drawLine(vPaperDrawLeft, vPageDrawTop, vPaperDrawRight, vPageDrawTop);
                    }

                    if (paintInfo.getScaleY(vPageDrawBottom) < paintInfo.windowHeight) {
                        hclCanvas.pen.width = 1;
                        hclCanvas.pen.color = "gray";
                        hclCanvas.pen.style = TPenStyle.DashDot;
                        hclCanvas.drawLine(vPaperDrawLeft, vPageDrawBottom, vPaperDrawRight, vPageDrawBottom);
                    }
                }
            }

            if (this.FOnPaintPaperBefor != null) {
                hclCanvas.save();
                try {
                    this.FOnPaintPaperBefor(this, pageIndex,
                        TRect.Create(vPaperDrawLeft, vPaperDrawTop, vPaperDrawRight, vPaperDrawBottom), hclCanvas, paintInfo);
                } finally {
                    hclCanvas.restore();
                }
            }

            let vPaintRegion = new TRect();
            if (paintInfo.viewModel == THCViewModel.Film) {
                if (vPageDrawTop > 0) {
                    vPaintRegion.reset(paintInfo.getScaleX(vPageDrawLeft),
                        Math.max(paintInfo.getScaleY(vPaperDrawTop + this.FHeaderOffset), 0),
                        paintInfo.getScaleX(vPaperDrawRight),
                        Math.min(paintInfo.getScaleY(vPageDrawTop), paintInfo.windowHeight));

                    hclCanvas.save();
                    try {
                        hclCanvas.clipRect(vPaintRegion);
                        this.PaintHeader(vPaperDrawTop, vPageDrawTop, vPageDrawLeft, vPageDrawRight, vMarginLeft, vMarginRight,
                            vHeaderAreaHeight, pageIndex, hclCanvas, paintInfo);
                    } finally {
                        hclCanvas.restore();
                    }
                }

                if (paintInfo.getScaleY(vPageDrawBottom) < paintInfo.windowHeight) {
                    vPaintRegion.reset(paintInfo.getScaleX(vPageDrawLeft),
                        Math.max(paintInfo.getScaleY(vPageDrawBottom), 0),
                        paintInfo.getScaleX(vPaperDrawRight),
                        Math.min(paintInfo.getScaleY(vPaperDrawBottom), paintInfo.windowHeight));

                    hclCanvas.save();
                    try {
                        hclCanvas.clipRect(vPaintRegion);
                        this.PaintFooter(vPaperDrawBottom, vPageDrawLeft, vPageDrawRight, vPageDrawBottom, vMarginLeft, vMarginRight,
                            pageIndex, hclCanvas, paintInfo);
                    } finally {
                        hclCanvas.restore();
                    }
                }
            }

            if (vPageDataScreenBottom > vPageDataScreenTop) {
                vPaintRegion.reset(paintInfo.getScaleX(vPaperDrawLeft),
                        paintInfo.getScaleY(Math.max(vPageDrawTop, vPageDataScreenTop)),
                        paintInfo.getScaleX(vPaperDrawRight),
                        paintInfo.getScaleY(Math.min(vPageDrawBottom, vPageDataScreenBottom)) + 1);

                hclCanvas.save();
                try {
                    hclCanvas.clipRect(vPaintRegion);
                    this.PaintPage(vPageDrawLeft, vPageDrawTop, vPageDrawRight, vPageDrawBottom,
                        vMarginLeft, vMarginRight, vHeaderAreaHeight, vPageDataScreenTop, vPageDataScreenBottom,
                        pageIndex, hclCanvas, paintInfo);
                } finally {
                    hclCanvas.restore();
                }
            }

            vPaintRegion.reset(
                paintInfo.getScaleX(vPaperDrawLeft),
                paintInfo.getScaleX(vPaperDrawTop),
                paintInfo.getScaleX(vPaperDrawRight),
                paintInfo.getScaleX(vPaperDrawBottom));

            hclCanvas.save();
            try {
                hclCanvas.clipRect(vPaintRegion);

                this.FHeader.PaintFloatItems(pageIndex, vPageDrawLeft,
                    vPaperDrawTop + this.GetHeaderPageDrawTop(), 0, hclCanvas, paintInfo);

                this.FFooter.PaintFloatItems(pageIndex, vPageDrawLeft,
                    vPageDrawBottom, 0, hclCanvas, paintInfo);

                this.FPage.PaintFloatItems(pageIndex, vPageDrawLeft,
                    vPageDrawTop,
                    this.GetPageDataFmtTop(pageIndex),
                    hclCanvas,
                    paintInfo);
            } finally {
                hclCanvas.restore();
            }
        } finally {
            hclCanvas.restore();
        }
        
        /*vPaintRegion.reset(
            paintInfo.getScaleX(vClipBoxRect.left),
            paintInfo.getScaleX(vClipBoxRect.left),
            paintInfo.getScaleX(vClipBoxRect.right),
            paintInfo.getScaleX(vClipBoxRect.bottom));
        try
        {
            GDI.SelectClipRgn(hclCanvas.Handle, vPaintRegion);
        }
        finally
        {
            GDI.DeleteObject(vPaintRegion);
        }*/

        if (this.FOnPaintPaperAfter != null) {
            hclCanvas.save();
            try {
                this.FOnPaintPaperAfter(this, pageIndex,
                    TRect.Create(vPaperDrawLeft, vPaperDrawTop, vPaperDrawRight, vPaperDrawBottom), hclCanvas, paintInfo);
            } finally {
                hclCanvas.restore();
            }
        }
    }

    clear() {
        this.FHeader.clear();
        this.FFooter.clear();
        this.FPage.clear();
        this.FPages.clearEx();
        this.FActivePageIndex = 0;
    }

    MouseDown(e) {
        let vChangeActiveData = false;
        let vOldTopData = this.FActiveData.GetTopLevelData();
        let vPageIndex = this.GetPageIndexByFilm(e.y);
        if (this.FActivePageIndex != vPageIndex)
        this.FActivePageIndex = vPageIndex;

        let vCoord = this.SectionCoordToPaper(this.FActivePageIndex, e.x, e.y, -1, -1);
        let vX = vCoord.x;
        let vY = vCoord.y;
        let vNewActiveData = this.GetSectionDataAt(vX, vY);

        if ((vNewActiveData != this.FActiveData) && (e.clicks == 2)) {
            this.SetActiveData(vNewActiveData);
            vChangeActiveData = true;
        }

        if (this.FActiveData.FloatItems.count > 0) {
            let vCoord = this.PaperCoordToData(this.FActivePageIndex, this.FActiveData, vX, vY, false);
            if (this.FActiveData == this.FPage)
                vCoord.y = vCoord.y + this.GetPageDataFmtTop(this.FActivePageIndex);

            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x = vCoord.x;
            vMouseArgs.y = vCoord.y;
            if (this.FActiveData.MouseDownFloatItem(vMouseArgs))
                return;
        }

        vCoord = this.PaperCoordToData(this.FActivePageIndex, this.FActiveData, vX, vY);
        vX = vCoord.x;
        vY = vCoord.y;

        if (this.FActiveData == this.FPage)
            vY = vY + this.GetPageDataFmtTop(this.FActivePageIndex);

        if ((e.clicks == 2) && (!vChangeActiveData))
            this.FActiveData.DblClick(vX, vY);
        else {
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x = vX;
            vMouseArgs.y = vY;
            this.FActiveData.MouseDown(vMouseArgs);
        }

        if (vOldTopData != this.FActiveData.GetTopLevelData()) {
            if (this.FOnChangeTopLevelData != null)
            this.FOnChangeTopLevelData(this, null);
        }
    }

    MouseMove(e) {
        let vMrg = this.GetPageMarginLeftAndRight(this.FMousePageIndex);
        let vMarginLeft = vMrg.left;
        let vMarginRight = vMrg.right;

        if (e.x < vMarginLeft)
            HC.GCursor = TCursors.Default;
        else
        if (e.x > this.FPaper.widthPix - vMarginRight)
            HC.GCursor = TCursors.Default;
        else
            HC.GCursor = TCursors.Ibeam;

        this.FMousePageIndex = this.GetPageIndexByFilm(e.y);

        let vX = -1, vY = -1, vCoord;

        if (this.FActiveData.FloatItems.count > 0) {
            if ((e.button == TMouseButton.Left) && (this.FActiveData.FloatItemIndex >= 0)) {
                if (!this.FActiveData.ActiveFloatItem.Resizing)
                this.FActiveData.ActiveFloatItem.PageIndex = this.FMousePageIndex;
            }

            if (this.FActiveData == this.FPage) {
                if ((this.FActiveData.FloatItemIndex >= 0) && (this.FActiveData.ActiveFloatItem.Resizing)) {
                    vCoord = this.SectionCoordToPaper(this.FActiveData.ActiveFloatItem.PageIndex, e.x, e.y, vX, vY);
                    vCoord = this.PaperCoordToData(this.FActiveData.ActiveFloatItem.PageIndex, this.FActiveData, vCoord.x, vCoord.y, false);
                    vX = vCoord.x;
                    vY = vCoord.y + this.GetPageDataFmtTop(this.FActiveData.ActiveFloatItem.PageIndex);
                } else {
                    vCoord = this.SectionCoordToPaper(this.FMousePageIndex, e.x, e.y, vX, vY);
                    vCoord = this.PaperCoordToData(this.FMousePageIndex, this.FActiveData, vCoord.x, vCoord.y, false);
                    vX = vCoord.x;
                    vY = vCoord.y + this.GetPageDataFmtTop(this.FMousePageIndex);
                }
            } else {
                if ((this.FActiveData.FloatItemIndex >= 0) && (this.FActiveData.ActiveFloatItem.Resizing)) {
                    vCoord = this.SectionCoordToPaper(this.FActivePageIndex, e.x, e.y, vX, vY);
                    vCoord = this.PaperCoordToData(this.FActivePageIndex, this.FActiveData, vCoord.x, vCoord.y, false);
                    vX = vCoord.x;
                    vY = vCoord.y;
                } else {
                    vCoord = this.SectionCoordToPaper(this.FMousePageIndex, e.x, e.y, vX, vY);
                    vCoord = this.PaperCoordToData(this.FMousePageIndex, this.FActiveData, vCoord.x, vCoord.y, false);
                    vX = vCoord.x;
                    vY = vCoord.y;
                }
            }

            let vEventArgs = new TMouseEventArgs();
            vEventArgs.assign(e);
            vEventArgs.x = vX;
            vEventArgs.y = vY;
            if (this.FActiveData.MouseMoveFloatItem(vEventArgs))
                return;
        }

        vCoord = this.SectionCoordToPaper(this.FMousePageIndex, e.x, e.y, vX, vY);
        vX = vCoord.x;
        vY = vCoord.y;

        let vMoveData = this.GetSectionDataAt(vX, vY);
        if (vMoveData != this.FMoveData) {
            if (this.FMoveData != null)
                this.FMoveData.MouseLeave();

            this.FMoveData = vMoveData;
        }

        vCoord = this.PaperCoordToData(this.FMousePageIndex, this.FActiveData, vX, vY, e.button != 0);
        vX = vCoord.x;
        vY = vCoord.y;

        if (this.FActiveData == this.FPage)
            vY = vY + this.GetPageDataFmtTop(this.FMousePageIndex);

        let vEventArgs2 = new TMouseEventArgs();
        vEventArgs2.assign(e);
        vEventArgs2.x = vX;
        vEventArgs2.y = vY;
        this.FActiveData.MouseMove(vEventArgs2);
    }

    MouseUp(e) {
        let vPageIndex = this.GetPageIndexByFilm(e.y);

        let vX = -1, vY = -1;
        let vEventArgs = null, vCoord;

        if ((this.FActiveData.FloatItems.count > 0) && (this.FActiveData.FloatItemIndex >= 0)) {
            if (this.FActiveData == this.FPage) {
                vCoord = this.SectionCoordToPaper(this.FActiveData.ActiveFloatItem.PageIndex, e.x, e.y, vX, vY);
                vCoord = this.PaperCoordToData(this.FActiveData.ActiveFloatItem.PageIndex, this.FActiveData, vCoord.x, vCoord.y, false);
                vX = vCoord.x;
                vY = vCoord.y + this.GetPageDataFmtTop(this.FActiveData.ActiveFloatItem.PageIndex);
            }
            else {
                vCoord = this.SectionCoordToPaper(vPageIndex, e.x, e.y, vX, vY);
                vCoord = this.PaperCoordToData(vPageIndex, this.FActiveData, vCoord.x, vCoord.y, false);
                vX = vCoord.x;
                vY = vCoord.y;
            }

            vEventArgs = new TMouseEventArgs();
            vEventArgs.assign(e);
            vEventArgs.x = vX;
            vEventArgs.y = vY;
            if (this.FActiveData.MouseUpFloatItem(vEventArgs))
                return;
        }

        vCoord = this.SectionCoordToPaper(vPageIndex, e.x, e.y, vX, vY);
        vCoord = this.PaperCoordToData(vPageIndex, this.FActiveData, vCoord.x, vCoord.y);
        vX = vCoord.x;
        vY = vCoord.y;

        if (this.FActiveData == this.FPage)
            vY = vY + this.GetPageDataFmtTop(vPageIndex);

        if (this.FActiveData.SelectedResizing()) {
            this.DoSectionDataAction(this.FActiveData, () => {
                let vEventArgs = new TMouseEventArgs();
                vEventArgs.assign(e);
                vEventArgs.x = vX;
                vEventArgs.y = vY;
                this.FActiveData.MouseUp(vEventArgs);
                return true;
            });
        } else {
            let vEventArgs = new TMouseEventArgs();
            vEventArgs.assign(e);
            vEventArgs.x = vX;
            vEventArgs.y = vY;
            this.FActiveData.MouseUp(vEventArgs);
        }
    }

    GetPageTopFilm(pageIndex) {
        let Result = this.FPagePadding;
        for (let i = 0; i <= pageIndex - 1; i++)
            Result = Result + this.FPaper.heightPix + this.FPagePadding;

        return Result;
    }

    GetPageTop(pageIndex) {
        let Result = 0;
        let vPageHeight = this.GetPageHeight();
        for (let i = 0; i <= pageIndex - 1; i++)
            Result = Result + vPageHeight;

        return Result;
    }

    GetPageDataFmtTop(pageIndex) {
        let Result = 0;
        if (pageIndex > 0) {
            let vPageHeight = this.GetPageHeight();

            for (let i = 0; i <= pageIndex - 1; i++)
                Result = Result + vPageHeight;
        }

        return Result;
    }

    GetHeaderPageDrawTop() {
        let Result = this.FHeaderOffset;
        let vHeaderHeight = this.FHeader.height;
        if (vHeaderHeight < (this.FPaper.marginTopPix - this.FHeaderOffset))
            Result = Result + Math.trunc((this.FPaper.marginTopPix - this.FHeaderOffset - vHeaderHeight) / 2);

        return Result;
    }

    GetPageMarginLeft(pageIndex) {
        return this.GetPageMarginLeftAndRight(pageIndex).left;
    }

    GetPageMarginLeftAndRight(pageIndex) {
        if (this.FSymmetryMargin && system.isOdd(pageIndex))
            return {
                left: this.FPaper.marginRightPix,
                right: this.FPaper.marginLeftPix
            }
        else
            return {
                left: this.FPaper.marginLeftPix,
                right: this.FPaper.marginRightPix
            }
    }

    _FormatNewPage(vPageIndex, prioEndDItemNo, newStartDItemNo) {
        this.FPages[vPageIndex].endDrawItemNo = prioEndDItemNo;
        let vPage = new THCPage();
        vPage.startDrawItemNo = newStartDItemNo;
        this.FPages.insert(vPageIndex + 1, vPage);
        vPageIndex++;
        return vPageIndex;
    }

    _RectItemCheckPage(drawItemNo, startSeat, vPageHeight, vRectItem, vPageIndex,
        vBreakSeat, vSuplus, vPageDataFmtTop, vPageDataFmtBottom) {
        let vFmtHeightInc = -1, vFmtOffset = -1;

        if (this.FPage.DrawItems[drawItemNo].rect.bottom > vPageDataFmtBottom) {
            if ((this.FPages[vPageIndex].startDrawItemNo == drawItemNo)
                && (startSeat == 0)
                && (!vRectItem.CanPageBreak))
            {
                vFmtHeightInc = vPageDataFmtBottom - this.FPage.DrawItems[drawItemNo].rect.bottom;
                vSuplus = vSuplus + vFmtHeightInc;
                this.FPage.DrawItems[drawItemNo].rect.bottom = this.FPage.DrawItems[drawItemNo].rect.bottom + vFmtHeightInc;
                vRectItem.height = vRectItem.height + vFmtHeightInc;
                return {
                    pageIndex: vPageIndex,
                    breakSeat: vBreakSeat,
                    suplus: vSuplus,
                    pageFmtTop: vPageDataFmtTop,
                    pageFmtBottom: vPageDataFmtBottom
                }
            }

            let vDrawRect = this.FPage.DrawItems[drawItemNo].rect;
            vDrawRect.inFlate(0, -this.FPage.GetLineBlankSpace(drawItemNo) / 2);

            vRectItem.CheckFormatPageBreak(this.FPages.count - 1, vDrawRect.left, vDrawRect.bottom,
                vPageDataFmtTop, vPageDataFmtBottom, startSeat, vBreakSeat, vFmtOffset, vFmtHeightInc);

            if (vBreakSeat < 0) {
                vSuplus = vSuplus + vPageDataFmtBottom - vDrawRect.bottom;
            } else if (vFmtOffset > 0) {
                vFmtOffset = vFmtOffset + this.FPage.GetLineBlankSpace(drawItemNo) / 2;
                vSuplus = vSuplus + vFmtOffset + vFmtHeightInc;
                this.FPage.DrawItems[drawItemNo].rect.offset(0, vFmtOffset);
                vPageDataFmtTop = vPageDataFmtBottom;
                vPageDataFmtBottom = vPageDataFmtTop + vPageHeight;
                vPageIndex = this._FormatNewPage(vPageIndex, drawItemNo - 1, drawItemNo);
                return this._RectItemCheckPage(drawItemNo, startSeat, vPageHeight,
                    vRectItem, vPageIndex, vBreakSeat, vSuplus, vPageDataFmtTop, vPageDataFmtBottom);
            } else {
                vSuplus = vSuplus + vFmtHeightInc;
                this.FPage.DrawItems[drawItemNo].rect.bottom = this.FPage.DrawItems[drawItemNo].rect.bottom + vFmtHeightInc;
                vRectItem.height = vRectItem.height + vFmtHeightInc;
                vPageDataFmtTop = vPageDataFmtBottom;
                vPageDataFmtBottom = vPageDataFmtTop + vPageHeight;
                vPageIndex = this._FormatNewPage(vPageIndex, drawItemNo, drawItemNo);
                return this._RectItemCheckPage(drawItemNo, startSeat, vPageHeight,
                    vRectItem, vPageIndex, vBreakSeat, vSuplus, vPageDataFmtTop, vPageDataFmtBottom);
            }
        }

        return {
            pageIndex: vPageIndex,
            breakSeat: vBreakSeat,
            suplus: vSuplus,
            pageFmtTop: vPageDataFmtTop,
            pageFmtBottom: vPageDataFmtBottom
        }
    }

    _FormatRectItemCheckPageBreak(drawItemNo, vPageHeight, vPageIndex, vPageDataFmtTop, vPageDataFmtBottom) {
        let vSuplus = 0;
        let vBreakSeat = 0;

        let vRectItem = this.FPage.Items[this.FPage.DrawItems[drawItemNo].ItemNo];

        vRectItem.CheckFormatPageBreakBefor();
        let vCheckInfo = this._RectItemCheckPage(drawItemNo, 0, vPageHeight, vRectItem,
            vPageIndex, vBreakSeat, vSuplus, vPageDataFmtTop, vPageDataFmtBottom);

        vPageIndex = vCheckInfo.pageIndex;
        vBreakSeat = vCheckInfo.breakSeat;
        vSuplus = vCheckInfo.suplus;
        vPageDataFmtTop = vCheckInfo.pageFmtTop;
        vPageDataFmtBottom = vCheckInfo.pageFmtBottom;

        if (vSuplus != 0) {
            for (let i = drawItemNo + 1; i <= this.FPage.DrawItems.count - 1; i++)
                this.FPage.DrawItems[i].rect.offset(0, vSuplus);
        }

        return {
            pageIndex: vPageIndex,
            pageFmtTop: vPageDataFmtTop,
            pageFmtBottom: vPageDataFmtBottom
        }
    }

    _FormatTextItemCheckPageBreak(vPageHeight, drawItemNo, vPageDataFmtTop, vPageDataFmtBottom, vPageIndex) {
        if (this.FPage.DrawItems[drawItemNo].rect.bottom > vPageDataFmtBottom) {
            let vH = vPageDataFmtBottom - this.FPage.DrawItems[drawItemNo].rect.top;
            for (let i = drawItemNo; i <= this.FPage.DrawItems.count - 1; i++)
                this.FPage.DrawItems[i].rect.offset(0, vH);

            vPageDataFmtTop = vPageDataFmtBottom;
            vPageDataFmtBottom = vPageDataFmtTop + vPageHeight;
            vPageIndex = this._FormatNewPage(vPageIndex, drawItemNo - 1, drawItemNo); // 新建页
        }

        return {
            pageFmtTop: vPageDataFmtTop,
            pageFmtBottom: vPageDataFmtBottom,
            pageIndex: vPageIndex
        }
    }

    BuildSectionPages(startDrawItemNo) {
        if (this.FPage.FormatCount > 0)
            return;

        let vPrioDrawItemNo = startDrawItemNo;
        let vPage = null;

        while (vPrioDrawItemNo > 0) {
            if (this.FPage.DrawItems[vPrioDrawItemNo].LineFirst)
                break;

            vPrioDrawItemNo--;
        }

        vPrioDrawItemNo--;
        
        let vPageIndex = 0;
        if (vPrioDrawItemNo > 0) {
            for (let i = this.FPages.count - 1; i >= 0; i--) {
                vPage = this.FPages[i];
                if ((vPrioDrawItemNo >= vPage.startDrawItemNo)
                    && (vPrioDrawItemNo <= vPage.endDrawItemNo))
                {
                    vPageIndex = i;
                    break;
                }
            }
        }

        this.FPages.removeRange(vPageIndex + 1, this.FPages.count - vPageIndex - 1);

        if (this.FPages.count == 0) {
            vPage = new THCPage();
            vPage.startDrawItemNo = 0;
            this.FPages.add(vPage);
            vPageIndex = 0;
        }

        let vPageDataFmtTop = this.GetPageDataFmtTop(vPageIndex);
        let vPageHeight = this.GetPageHeight();
        let vPageDataFmtBottom = vPageDataFmtTop + vPageHeight;
        let vFmtPageOffset = 0;
        let vItem = null;
        for (let i = vPrioDrawItemNo + 1; i <= this.FPage.DrawItems.count - 1; i++) {
            if (this.FPage.DrawItems[i].LineFirst) {
                vItem = this.FPage.Items[this.FPage.DrawItems[i].ItemNo];
                if (vItem.PageBreak && (vItem.FirstDItemNo == i)) {
                    vFmtPageOffset = vPageDataFmtBottom - this.FPage.DrawItems[i].rect.top;
                    if (vFmtPageOffset > 0) {
                        for (let j = i; j <= this.FPage.DrawItems.count - 1; j++)
                            this.FPage.DrawItems[j].rect.offset(0, vFmtPageOffset);
                    }

                    vPageDataFmtTop = vPageDataFmtBottom;
                    vPageDataFmtBottom = vPageDataFmtTop + vPageHeight;
                    vPageIndex = this._FormatNewPage(vPageIndex, i - 1, i);
                }

                if (this.FPage.GetDrawItemStyle(i) < THCStyle.Null) {
                    let vCheckInfo = this._FormatRectItemCheckPageBreak(i, vPageHeight, vPageIndex, vPageDataFmtTop, vPageDataFmtBottom);
                    vPageIndex = vCheckInfo.pageIndex;
                    vPageDataFmtTop = vCheckInfo.pageFmtTop;
                    vPageDataFmtBottom = vCheckInfo.pageFmtBottom;
                }
                else {
                    let vCheckInfo = this._FormatTextItemCheckPageBreak(vPageHeight, i, vPageDataFmtTop, vPageDataFmtBottom, vPageIndex);
                    vPageIndex = vCheckInfo.pageIndex;
                    vPageDataFmtTop = vCheckInfo.pageFmtTop;
                    vPageDataFmtBottom = vCheckInfo.pageFmtBottom;
                }
            }
        }

        this.FPages[vPageIndex].endDrawItemNo = this.FPage.DrawItems.count - 1;
        this.SetActivePageIndex(this.GetPageIndexByCurrent());

        for (let i = this.FPage.FloatItems.count - 1; i >= 0; i--) {
            if (this.FPage.FloatItems[i].PageIndex > this.FPages.count - 1)
            this.FPage.FloatItems.delete(i);
        }
    }

    DeleteSelected() {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.DeleteSelected();
        });
    }

    DisSelect() {
        this.FActiveData.GetTopLevelData().DisSelect();
    }

    DeleteActiveDomain() {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.DeleteActiveDomain();
        });
    }

    DeleteActiveDataItems(startNo, endNo, keepPara) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.DeleteActiveDataItems(startNo, endNo, keepPara);
            return true;
        });
    }

    MergeTableSelectCells() {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.MergeTableSelectCells();
        });
    }

    TableApplyContentAlign(align) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.TableApplyContentAlign(align);
        });
    }

    ReFormatActiveParagraph() {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ReFormatActiveParagraph();
            return true;
        });
    }

    ReFormatActiveItem() {
        this.DoSectionDataAction(this.FActiveData, () => {
            this.FActiveData.ReFormatActiveItem();
            return true;
        });
    }

    GetHeaderAreaHeight() {
        let Result = this.FHeaderOffset + this.FHeader.height;
        if (Result < this.FPaper.marginTopPix)
            Result = this.FPaper.marginTopPix;

        return Result;
    }

    GetPageHeight() {
        return this.FPaper.heightPix - this.GetHeaderAreaHeight() - this.FPaper.marginBottomPix;
    }

    GetPageWidth() {
        return this.FPaper.widthPix - this.FPaper.marginLeftPix - this.FPaper.marginRightPix;
    }

    GetFilmHeight() {
        if (this.FViewModel == THCViewModel.Film)
            return this.FPages.count * (this.FPagePadding + this.FPaper.heightPix);
        else
            return this.FPages.count * this.GetPageHeight();
    }

    GetFilmWidth() {
        return this.FPages.count * (this.FPagePadding + this.FPaper.widthPix);
    }

    MarkStyleUsed(mark, parts) {
        if (parts.has(TSectionArea.Header))
            this.FHeader.MarkStyleUsed(mark);

        if (parts.has(TSectionArea.Footer))
            this.FFooter.MarkStyleUsed(mark);

        if (parts.has(TSectionArea.Page))
            this.FPage.MarkStyleUsed(mark);
    }

    SaveToStream(stream, saveParts) {
        let vBegPos = stream.position;
        stream.writeUInt64(vBegPos);
        
        if (saveParts.count > 0) {
            stream.writeBoolean(this.FSymmetryMargin);
            stream.writeByte(this.FPaperOrientation);
            stream.writeBoolean(this.FPageNoVisible);
            this.FPaper.saveToStream(stream);

            let vArea = saveParts.has(TSectionArea.Header);
            stream.writeBoolean(vArea);
            vArea = saveParts.has(TSectionArea.Footer);
            stream.writeBoolean(vArea);
            vArea = saveParts.has(TSectionArea.Page);
            stream.writeBoolean(vArea);

            if (saveParts.has(TSectionArea.Header)) {
                stream.writeInt32(this.FHeaderOffset);
                this.FHeader.SaveToStream(stream);
            }

            if (saveParts.has(TSectionArea.Footer))
                this.FFooter.SaveToStream(stream);

            if (saveParts.has(TSectionArea.Page))
                this.FPage.SaveToStream(stream);
        }

        let vEndPos = stream.position;
        stream.position = vBegPos;
        vBegPos = vEndPos - vBegPos - 8;

        stream.writeUInt64(vBegPos);
        stream.position = vEndPos;
    }

    SaveToText() {
        return this.FPage.SaveToText();
    }

    LoadFromStream(stream, style, fileVersion) {
        let vDataSize = stream.readInt64();
        this.FSymmetryMargin = stream.readBoolean();
        if (fileVersion > 11) {
            this.FPaperOrientation = stream.readByte();
            this.FPageNoVisible = stream.readBoolean();
        }

        this.FPaper.loadFromStream(stream, fileVersion);
        this.FPage.width = this.GetPageWidth();

        let vLoadParts = new Set([]);
        if (stream.readBoolean())
            vLoadParts.add(TSectionArea.Header);

        if (stream.readBoolean())
            vLoadParts.add(TSectionArea.Footer);

        if (stream.readBoolean())
            vLoadParts.add(TSectionArea.Page);

        if (vLoadParts.has(TSectionArea.Header)) {
            this.FHeaderOffset = stream.readInt32();
            this.FHeader.Width = this.FPage.width;
            this.FHeader.LoadFromStream(stream, this.FStyle, fileVersion);
        }

        if (vLoadParts.has(TSectionArea.Footer)) {
            this.FFooter.Width = this.FPage.width;
            this.FFooter.LoadFromStream(stream, this.FStyle, fileVersion);
        }

        if (vLoadParts.has(TSectionArea.Page))
            this.FPage.LoadFromStream(stream, this.FStyle, fileVersion);

        this.BuildSectionPages(0);
    }

    InsertStream(stream, style, fileVersion) {
        return this.DoSectionDataAction(this.FActiveData, () => {
            return this.FActiveData.InsertStream(stream, style, fileVersion);
        });
    }

    FormatData() {
        this.FActiveData.DisSelect();
        this.FHeader.ReFormat();
        this.Footer.ReFormat();
        this.FPage.ReFormat();
    }

    ActiveDataSetSelectBound(startNo, startOffset, endNo, endOffset) {
        this.FActiveData.SetSelectBound(startNo, startOffset, endNo, endOffset, false);
        this.FStyle.updateInfoRePaint();
        this.FStyle.updateInfoReCaret();
        this.FStyle.updateInfoReScroll();

        this.DoActiveDataCheckUpdateInfo();
    }

    Undo(undo) {
        let vUndoList = this.DoDataGetUndoList();
        if (!vUndoList.GroupWorking) {
            if (this.FActiveData != undo.Data)
                this.SetActiveData(undo.Data);// as HCSectionData);

            this.DoSectionDataAction(this.FActiveData, () => {
                this.FActiveData.Undo(undo);
                return true;
            });
        }
        else
            undo.Data.Undo(undo);
    }

    Redo(redo) {
        let vUndoList = this.DoDataGetUndoList();
        if (!vUndoList.GroupWorking) {
            if (this.FActiveData != redo.Data)
                this.SetActiveData(redo.Data);

            this.DoSectionDataAction(this.FActiveData, () => {
                this.FActiveData.Redo(redo);
                return true;
            });
        } else
            redo.Data.Redo(redo);
    }

    get PaperSize() {
        return this.GetPaperSize(); 
    }

    set PaperSize(val) {
        this.SetPaperSize(val);
    }

    get PaperWidth() {
        return this.GetPaperWidth();
    }
        
    set PaperWidth(val) {
        this.SetPaperWidth(val);
    }

    get PaperHeight() {
        return this.GetPaperHeight();
    }

    set PaperHeight(val) {
        this.SetPaperHeight(val);
    }

    get PaperMarginTop() {
        return this.GetPaperMarginTop();
    }

    set PaperMarginTop(val) {
        this.SetPaperMarginTop(val);
    }

    get PaperMarginLeft() {
        return this.GetPaperMarginLeft();
    }

    set PaperMarginLeft(val) {
        this.SetPaperMarginLeft(val);
    }

    get PaperMarginRight() {
        return this.GetPaperMarginRight();
    }

    set PaperMarginRight(val) {
        this.SetPaperMarginRight(val);
    }

    get PaperMarginBottom() {
        return this.GetPaperMarginBottom();
    }

    set PaperMarginBottom(val) {
        this.SetPaperMarginBottom(val);
    }

    get PaperOrientation() {
        return this.FPaperOrientation;
    }

    set PaperOrientation(val) {
        this.FPaperOrientation = val;
    }

    get PaperWidthPix() {
        return this.GetPaperWidthPix();
    }

    get PaperHeightPix() {
        return this.GetPaperHeightPix();
    }

    get PaperMarginTopPix() {
        return this.GetPaperMarginTopPix();
    }

    get PaperMarginLeftPix() {
        return this.GetPaperMarginLeftPix();
    }

    get PaperMarginRightPix() {
        return this.GetPaperMarginRightPix();
    }

    get PaperMarginBottomPix() {
        return this.GetPaperMarginBottomPix();
    }

    get HeaderOffset() {
        return this.FHeaderOffset;
    }

    set HeaderOffset(val) {
        this.SetHeaderOffset(val);
    }

    get Header() {
        return this.FHeader;
    }

    get Footer() {
        return this.FFooter;
    }

    get Page() {
        return this.FPage;
    }

    get CurStyleNo() {
        return this.GetCurStyleNo();
    }

    get CurParaNo() {
        return this.GetCurParaNo();
    }

    get ActiveData() {
        return this.FActiveData;
    }

    set ActiveData(val) {
        this.SetActiveData(val);
    }

    get ActiveArea() {
        return this.GetActiveArea();
    }

    get ActivePageIndex() {
        return this.FActivePageIndex;
    }

    get ViewModel() {
        return this.FViewModel;
    }

    set ViewModel(val) {
        this.FViewModel = val;
    }

    get SymmetryMargin() {
        return this.FSymmetryMargin;
    }

    set SymmetryMargin(val) {
        this.FSymmetryMargin = val;
    }

    get DisplayFirstPageIndex() {
        return this.FDisplayFirstPageIndex;
    }

    set DisplayFirstPageIndex(val) {
        this.FDisplayFirstPageIndex = val;
    }

    get DisplayLastPageIndex() {
        return this.FDisplayLastPageIndex;
    }

    set DisplayLastPageIndex(val) {
        this.FDisplayLastPageIndex = val;
    }

    get PageCount() {
        return this.GetPageCount();
    }

    get PageNoVisible() {
        return this.FPageNoVisible; 
    }

    set PageNoVisible(val) {
        this.FPageNoVisible = val;
    }

    get PageNoFrom() {
        return this.FPageNoFrom;
    }

    set PageNoFrom(val) {
        this.FPageNoFrom = val;
    }

    get PagePadding() {
        return this.FPagePadding;
    }

    set PagePadding(val) {
        this.FPagePadding = val;
    }

    get ReadOnly() {
        return this.GetReadOnly();
    }

    set ReadOnly(val) {
        this.SetReadOnly(val);
    }

    get OnDataChange()
    {
        return this.FOnDataChange;
    }

    set OnDataChange(val) {
        this.FOnDataChange = val;
    }

    get OnChangeTopLevelData() {
        return this.FOnChangeTopLevelData;
    }

    set OnChangeTopLevelData(val) {
        this.FOnChangeTopLevelData = val;
    }

    get OnReadOnlySwitch() {
        return this.FOnReadOnlySwitch;
    }

    set OnReadOnlySwitch(val) {
        this.FOnReadOnlySwitch = val;
    }

    get OnGetScreenCoord() {
        return this.FOnGetScreenCoord;
    }

    set OnGetScreenCoord(val) {
        this.FOnGetScreenCoord = val;
    }

    get OnCheckUpdateInfo() {
        return this.FOnCheckUpdateInfo;
    }

    set OnCheckUpdateInfo(val) {
        this.FOnCheckUpdateInfo = val;
    }

    get OnInsertItem() {
        return this.FOnInsertItem;
    }

    set OnInsertItem(val) {
        this.FOnInsertItem = val;
    }

    get OnRemoveItem() {
        return this.FOnRemoveItem;
    }

    set OnRemoveItem(val) {
        this.FOnRemoveItem = val;
    }

    get OnSaveItem() {
        return this.FOnSaveItem;
    }

    set OnSaveItem(val) {
        this.FOnSaveItem = val;
    }

    get OnItemResize() {
        return this.FOnItemResize;
    }

    set OnItemResize(val) {
        this.FOnItemResize = val;
    }

    get OnItemMouseDown() {
        return this.FOnItemMouseDown;
    }

    set OnItemMouseDown(val) {
        this.FOnItemMouseDown = val;
    }

    get OnItemMouseUp() {
        return this.FOnItemMouseUp;
    }

    set OnItemMouseUp(val) {
        this.FOnItemMouseUp = val;
    }

    get OnPaintHeader() {
        return this.FOnPaintHeader;
    }

    set OnPaintHeader(val) {
        this.FOnPaintHeader = val;
    }

    get OnPaintFooter() {
        return this.FOnPaintFooter;
    }

    set OnPaintFooter(val) {
        this.FOnPaintFooter = val;
    }

    get OnPaintPage() {
        return this.FOnPaintPage;
    }

    set OnPaintPage(val) {
        this.FOnPaintPage = val;
    }

    get OnPaintPaperBefor() {
        return this.FOnPaintPaperBefor;
    }

    set OnPaintPaperBefor(val) {
        this.FOnPaintPaperBefor = val;
    }

    get OnPaintPaperAfter() {
        return this.FOnPaintPaperAfter;
    }

    set OnPaintPaperAfter(val) {
        this.FOnPaintPaperAfter = val;
    }

    get OnDrawItemPaintBefor() {
        return this.FOnDrawItemPaintBefor;
    }

    set OnDrawItemPaintBefor(val) {
        this.FOnDrawItemPaintBefor = val;
    }

    get OnDrawItemPaintAfter() {
        return this.FOnDrawItemPaintAfter;
    }

    set OnDrawItemPaintAfter(val) {
        this.FOnDrawItemPaintAfter = val;
    }

    get OnDrawItemPaintContent() {
        return this.FOnDrawItemPaintContent;
    }

    set OnDrawItemPaintContent(val) {
        this.FOnDrawItemPaintContent = val;
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

    get OnDrawItemAnnotate() {
        return this.FOnDrawItemAnnotate;
    }

    set OnDrawItemAnnotate(val) {
        this.FOnDrawItemAnnotate = val;
    }

    get OnCreateItem() {
        return this.FOnCreateItem;
    }

    set OnCreateItem(val) {
        this.FOnCreateItem = val;
    }

    get OnDataAcceptAction() {
        return this.FOnDataAcceptAction;
    }

    set OnDataAcceptAction(val) {
        this.FOnDataAcceptAction = val;
    }

    get OnCreateItemByStyle() {
        return this.FOnCreateItemByStyle;
    }

    set OnCreateItemByStyle(val) {
        this.FOnCreateItemByStyle = val;
    }

    get OnCreateFloatItemByStyle() {
        return this.FOnCreateFloatItemByStyle;
    }

    set OnCreateFloatItemByStyle(val) {
        this.FOnCreateFloatItemByStyle = val;
    }

    get OnCanEdit() {
        return this.FOnCanEdit;
    }

    set OnCanEdit(val) {
        this.FOnCanEdit = val;
    }

    get OnInsertTextBefor() {
        return this.FOnInsertTextBefor;
    }

    set OnInsertTextBefor(val) {
        this.FOnInsertTextBefor = val;
    }

    get OnGetUndoList() {
        return this.FOnGetUndoList;
    }

    set OnGetUndoList(val) {
        this.FOnGetUndoList = val;
    }

    get OnCurParaNoChange() {
        return this.FOnCurParaNoChange;
    }

    set OnCurParaNoChange(val) {
        this.FOnCurParaNoChange = val;
    }

    get OnCaretItemChanged() {
        return this.FOnCaretItemChanged;
    }

    set OnCaretItemChanged(val) { 
        this.FOnCaretItemChanged = val;
    }

    get OnActivePageChange() {
        return this.FOnActivePageChange;
    }

    set OnActivePageChange(val) {
        this.FOnActivePageChange = val;
    }
}

export class THCSection extends THCCustomSection {
    constructor(style) {
        super(style);
    }

    Search(keyword, forward, matchCase) {
        let Result = this.ActiveData.Search(keyword, forward, matchCase);
        this.DoActiveDataCheckUpdateInfo();
        return Result;
    }

    Replace(text) {
        return this.DoSectionDataAction(this.ActiveData, () => {
            return this.ActiveData.Replace(text);
        });
    }

    ParseHtml(htmlText) {
        this.DoSectionDataAction(this.ActiveData, () => {
            return true;
        });
        return true;
    }

    InsertFloatItem(floatItem) {
        if (!this.ActiveData.CanEdit())
            return false;

        floatItem.PageIndex = this.ActivePageIndex;
        let Result = this.ActiveData.InsertFloatItem(floatItem);
        this.DoDataChanged(this);

        return Result;
    }

    ToHtml(path) {
        return this.Page.ToHtml(path);
    }

    ToXml(aNode) {

    }

    ParseXml(aNode) {

    }
}