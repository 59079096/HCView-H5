import { TAlign, TCursors, TCustomControl, TKey, TMouseButton, TMouseEventArgs, TOrientation } from "../hcl/Controls.js";
import { TBrushStyle, THCCanvas, TPenStyle, TColor } from "../hcl/Graphics.js";
import { ime, TImeMode } from "../hcl/Ime.js";
import { hcl } from "../hcl/Kernel.js";
import { system, TList, TPoint, TRect, TStream } from "../hcl/System.js";
import { THCDrawItemAnnotate } from "./HCAnnotateData.js";
import { HC, THCCaret, THCCaretInfo, THCState, TSectionArea } from "./HCCommon.js";
import { THCViewModel } from "./HCItem.js";
import { THCRichScrollBar } from "./HCRichScrollBar.js";
import { THCSection, TSectionPaintInfo } from "./HCSection.js";
import { THCStyle } from "./HCStyle.js";
import { THCSectionUndo, THCSectionUndoGroupBegin, THCSectionUndoGroupEnd, THCUndoList } from "./HCUndo.js";
import { THCUnitConversion } from "./HCUnitConversion.js";
import { THCStatusScrollBar } from "./HCStatusScrollBar.js";
import { clipboard, TDataFormat } from "../hcl/Clipboard.js";

class THCDrawAnnotate extends THCDrawItemAnnotate {
    constructor() {
        super();
        this.Data = null;
        this.rect = new TRect();
    }
}

class THCDrawAnnotateDynamic extends THCDrawAnnotate {
    constructor() {
        super();
        this.Title;
        this.Text;
    }
}

export class THCAnnotatePre {
    constructor() {
        this.FDrawAnnotates = new TList();
        this.FCount = 0;
        this.FVisible = false;
        this.FMouseIn = false;
        this.FActiveDrawAnnotateIndex = -1;
        this.FDrawRect = new TRect();
        this.FOnUpdateView = null;
    }

    _getDrawCount() {
        return this.FDrawAnnotates.count;
    }

    _getDrawAnnotateAt(x, y) {
        return this._getDrawAnnotateAtPt(TPoint.Create(x, y));
    }

    _getDrawAnnotateAtPt(point) {
        let vResult = -1;
        for (let i = 0; i < this.FDrawAnnotates.count; i++) {
            if (this.FDrawAnnotates[i].rect.pointIn(point)) {
                vResult = i;
                return;
            }
        }

        return vResult;
    }

    _doUpdateView() {
        if (this.FOnUpdateView != null)
            this.FOnUpdateView(this);
    }

    paintDrawAnnotate(sender, pageRect, hclCanvas, paintInfo) {
        this.FDrawRect.reset(pageRect.right, pageRect.top, pageRect.right + HC.AnnotationWidth, pageRect.bottom);

        if (!paintInfo.print) {
            if (this.FMouseIn)
                hclCanvas.brush.color = "#d0d1d5";
            else
                hclCanvas.brush.color = "#f4f4f4";

            hclCanvas.fillRect(this.FDrawRect);
        }

        if (this.FDrawAnnotates.count > 0) {
            let vFirst = -1, vLast = -1;
            let vDrawAnnotate = null;
            let vText = "";
            let vSection = sender;
            let vHeaderAreaHeight = vSection.GetHeaderAreaHeight();
            let vVOffset = pageRect.top + vHeaderAreaHeight - paintInfo.PageDataFmtTop;
            let vTop = paintInfo.PageDataFmtTop + vVOffset;
            let vBottom = vTop + vSection.PaperHeightPix - vHeaderAreaHeight - vSection.PaperMarginBottomPix;

            for (let i = 0; i <= this.FDrawAnnotates.count - 1; i++) {
                vDrawAnnotate = this.FDrawAnnotates[i];
                if (vDrawAnnotate.DrawRect.top > vBottom)
                    break;
                else if (vDrawAnnotate.DrawRect.bottom > vTop) {
                    vLast = i;
                    if (vFirst < 0)
                        vFirst = i;
                }
            }

            if (vFirst >= 0) {
                hclCanvas.font.size = 8;
                hclCanvas.font.name = "宋体";
                hclCanvas.font.color = TColor.Black;
                vTop = this.FDrawAnnotates[vFirst].DrawRect.top;
                for (let i = vFirst; i <= vLast; i++) {
                    vDrawAnnotate = this.FDrawAnnotates[i];
                    if (vDrawAnnotate.DrawRect.top > vTop)
                        vTop = vDrawAnnotate.DrawRect.top;

                    if (vDrawAnnotate.isClass(THCDrawAnnotateDynamic))
                        vText = vDrawAnnotate.Title + ":" + vDrawAnnotate.Text;
                    else
                        vText = vDrawAnnotate.DataAnnotate.Title + ":" + vDrawAnnotate.DataAnnotate.Text;

                    vDrawAnnotate.rect.reset(0, 0, HC.AnnotationWidth - 30, hclCanvas.font.height);

                    //hclCanvas.textOut(vDrawAnnotate.rect.left, vDrawAnnotate.rect.top, vText);
                    // User.DrawTextEx(hclCanvas.Handle, vText, -1, vDrawAnnotate.rect,
                    //     User.DT_TOP | User.DT_LEFT | User.DT_WORDBREAK | User.DT_CALCRECT, IntPtr.Zero);
                    if (vDrawAnnotate.rect.right < HC.AnnotationWidth - 30)
                        vDrawAnnotate.rect.right = HC.AnnotationWidth - 30;

                    vDrawAnnotate.rect.offset(pageRect.right + 20, vTop + 5);
                    vDrawAnnotate.rect.inFlate(5, 5);

                    vTop = vDrawAnnotate.rect.bottom + 5;
                }

                if (this.FDrawAnnotates[vLast].rect.bottom > pageRect.bottom) {
                    vVOffset = this.FDrawAnnotates[vLast].rect.bottom - pageRect.bottom + 5;
                    let vSpace = 0;
                    let vRePlace = -1;
                    vTop = this.FDrawAnnotates[vLast].rect.top;
                    for (let i = vLast; i >= vFirst; i--) {
                        vSpace = vTop - this.FDrawAnnotates[i].rect.bottom - 5;
                        vVOffset = vVOffset - vSpace;
                        if (vVOffset <= 0) {
                            vRePlace = i + 1;
                            if (vVOffset < 0)
                                vSpace = vSpace + vVOffset;

                            break;
                        }

                        vTop = this.FDrawAnnotates[i].rect.top;
                    }

                    if (vRePlace < 0) {
                        vRePlace = vFirst;
                        vSpace = this.FDrawAnnotates[vFirst].rect.top - pageRect.top - 5;
                        if (vSpace > vVOffset)
                            vSpace = vVOffset;
                    }

                    this.FDrawAnnotates[vRePlace].rect.offset(0, -vSpace);
                    vTop = this.FDrawAnnotates[vRePlace].rect.bottom + 5;
                    for (let i = vRePlace; i <= vLast; i++) {
                        vVOffset = vTop - this.FDrawAnnotates[i].rect.top;
                        this.FDrawAnnotates[i].rect.offset(0, vVOffset);
                        vTop = this.FDrawAnnotates[i].rect.bottom + 5;
                    }
                }

                let vData;
                let vTextRect = new TRect();
                hclCanvas.pen.color = "red";
                for (let i = vFirst; i <= vLast; i++) {
                    vDrawAnnotate = this.FDrawAnnotates[i];
                    if (vDrawAnnotate.isClass(THCDrawAnnotateDynamic)) {
                        vText = vDrawAnnotate.Title + ":" + vDrawAnnotate.Text;
                        hclCanvas.pen.style = TPenStyle.Dot;
                        hclCanvas.pen.width = 1;
                        hclCanvas.brush.color = HC.AnnotateBKColor;
                    } else {
                        vText = vDrawAnnotate.DataAnnotate.Title + ":" + vDrawAnnotate.DataAnnotate.Text;
                        vData = vDrawAnnotate.Data;

                        if (vDrawAnnotate.DataAnnotate == vData.HotAnnotate) {
                            hclCanvas.pen.style = TPenStyle.Solid;
                            hclCanvas.pen.width = 1;
                            hclCanvas.brush.color = HC.AnnotateBKActiveColor;
                        } else if (vDrawAnnotate.DataAnnotate == vData.ActiveAnnotate) {
                            hclCanvas.pen.style = TPenStyle.Solid;
                            hclCanvas.pen.width = 2;
                            hclCanvas.brush.color = HC.AnnotateBKActiveColor;
                        } else {
                            hclCanvas.pen.style = TPenStyle.Dot;
                            hclCanvas.pen.width = 1;
                            hclCanvas.brush.color = HC.AnnotateBKColor;
                        }
                    }

                    if (paintInfo.print)
                        hclCanvas.brush.style = TBrushStyle.Clear;

                    hclCanvas.fillRoundRect(vDrawAnnotate.rect, 5);
                    vTextRect.resetRect(vDrawAnnotate.rect);
                    vTextRect.inFlate(-5, -5);

                    hclCanvas.textOut(vTextRect.left, vTextRect.top, vText);
                    // User.DrawTextEx(hclCanvas.Handle, i.ToString() + vText, -1, vTextRect,
                    //     User.DT_VCENTER | User.DT_LEFT | User.DT_WORDBREAK, IntPtr.Zero);

                    hclCanvas.brush.style = TBrushStyle.Clear;
                    hclCanvas.beginPath()
                    try {
                        hclCanvas.moveTo(vDrawAnnotate.DrawRect.right, vDrawAnnotate.DrawRect.bottom);
                        hclCanvas.lineTo(pageRect.right, vDrawAnnotate.DrawRect.bottom);
                        hclCanvas.lineTo(vDrawAnnotate.rect.left, vTextRect.top);
                    } finally {
                        hclCanvas.paintPath();
                    }
                }
            }
        }
    }

    insertDataAnnotate(dataAnnotate) {
        this.FCount++;
        this.FVisible = true;
    }

    removeDataAnnotate(dataAnnotate) {
        this.FCount--;
        if (this.FCount == 0)
            this.FVisible = false;
    }

    addDrawAnnotate(drawAnnotate) {
        this.FDrawAnnotates.add(drawAnnotate);
    }

    clearDrawAnnotate() {
        this.FDrawAnnotates.clear();
    }

    activeAnnotate() {
        if (this.FActiveDrawAnnotateIndex < 0)
            return null;
        else
            return this.FDrawAnnotates[this.FActiveDrawAnnotateIndex].dataAnnotate;
    }

    deleteDataAnnotateByDraw(index) {
        if (index >= 0) {
            this.FDrawAnnotates[index].data.dataAnnotates.deleteByID(this.FDrawAnnotates[index].dataAnnotate.ID);
            this._doUpdateView();
        }
    }

    mouseDown(x, y) {
        this.FActiveDrawAnnotateIndex = this._getDrawAnnotateAt(x, y);
    }

    mouseMove(x, y) {
        this.mouseIn = this.FDrawRect.pointInAt(x, y);
    }

    get drawCount() {
        return this._getDrawCount();
    }

    get drawAnnotates() {
        return this.FDrawAnnotates;
    }

    get visible() {
        return this.FVisible;
    }

    get count() {
        return this.FCount;
    }

    get drawRect() {
        return this.FDrawRect;
    }

    get mouseIn() {
        return this.FMouseIn;
    }

    set mouseIn(val) {
        if (this.FMouseIn != val) {
            this.FMouseIn = val;
            this._doUpdateView();
        }
    }

    get activeDrawAnnotateIndex() {
        return this.FActiveDrawAnnotateIndex;
    }

    get onUpdateView() {
        return this.FOnUpdateView;
    }

    set onUpdateView(val) {
        this.FOnUpdateView = val;
    }
}

export class THCView extends TCustomControl {
    constructor() {
        super();
        this.color = 'rgb(82, 89, 107)';
        this.canFocus = true;
        this.cursor = TCursors.Ibeam;
        this._canvas = document.createElement("canvas");
        this._context = this._canvas.getContext("2d");
        this.FDataBmpCanvas = new THCCanvas(this._context);

        THCUnitConversion.Initialization();
        if (HC.HCExtFormat == 0)
            HC.HCExtFormat = clipboard.registerFormat();

        this.FUndoList = new THCUndoList();
        this.FUndoList.OnUndo = (sender) => { this.DoUndo(sender); }
        this.FUndoList.OnRedo = (sender) => { this.DoRedo(sender); }
        this.FUndoList.OnUndoNew = () => { return this.DoUndoNew(); }
        this.FUndoList.OnUndoGroupStart = (itemNo, offset) => { return this.DoUndoGroupBegin(itemNo, offset); }
        this.FUndoList.OnUndoGroupEnd = (itemNo, offset) => { return this.DoUndoGroupEnd(itemNo, offset); }
        this.FUndoList.OnUndoDestroy = (sender) => { this.DoUndoDestroy(sender); }
        this.FAnnotatePre = new THCAnnotatePre();
        this.FAnnotatePre.onUpdateView = (sender) => { this.DoAnnotatePreUpdateView(sender); }

        this.FUpdateCount = 0;
        this.FFileName = "";
        this.FPageNoFormat = "{0}/{1}";
        this.FViewWidth = 0;
        this.FViewHeight = 0;
        this.FIsChanged = false;
        this.FZoom = 1;
        this.FAutoZoom = false;
        this.FViewModel = THCViewModel.Film;
        this.FPagePadding = 20;

        this.FStyle = new THCStyle(true, true);
        this.FStyle.onInvalidateRect = (rect) => { this.DoStyleInvalidateRect(rect); }
        this.FSections = new TList();
        this.FSections.add(this.NewDefaultSection());
        this.FActiveSectionIndex = 0;
        this.FDisplayFirstSection = 0;
        this.FDisplayLastSection = 0;
        // 垂直滚动条，范围在Resize中设置
        this.FVScrollBar = new THCRichScrollBar();
        this.FVScrollBar.orientation = TOrientation.Vertical;
        this.FVScrollBar.align = TAlign.None;
        this.FVScrollBar.onScroll = (sender, scrollCode, scrollPos) => { this.DoVerScroll(sender, scrollCode, scrollPos); }
        this.FVScrollBar.onPageUpClick = (sender) => { this.DoPageUp(sender); }
        this.FVScrollBar.onPageDownClick = (sender) => { this.DoPageDown(sender); }
        // 水平滚动条，范围在Resize中设置
        this.FHScrollBar = new THCStatusScrollBar();
        this.FHScrollBar.orientation = TOrientation.Horizontal;
        this.FHScrollBar.addStatus(100);
        this.FHScrollBar.align = TAlign.None;
        this.FHScrollBar.onScroll = (sender, scrollCode, scrollPos) => { this.DoHorScroll(sender, scrollCode, scrollPos); }

        this.controls.add(this.FHScrollBar);
        this.controls.add(this.FVScrollBar);

        this.handle_ = hcl.handleAllocate();
        this.FCaret = new THCCaret();
        this.FCaret.control = this;
        this.imeMode = TImeMode.Active;
        this._innerPasted = false;

        this.FOnCaretChange = null;
        this.FOnVerScroll = null;
        this.FOnHorScroll = null;
        this.FOnSectionCreateItem = null;
        this.FOnSectionReadOnlySwitch = null;
        this.FOnSectionCurParaNoChange = null;
        this.FOnSectionActivePageChange = null;
        this.FOnSectionCreateStyleItem = null;
        this.FOnSectionCaretItemChanged = null;
        this.FOnSectionCreateFloatStyleItem = null;
        this.FOnSectionCanEdit = null;
        this.FOnSectionInsertTextBefor = null;
        this.FOnSectionInsertItem = null;
        this.FOnSectionRemoveItem = null;
        this.FOnSectionSaveItem = null;
        this.FOnSectionAcceptAction = null;
        this.FOnSectionDrawItemPaintAfter = null;
        this.FOnSectionDrawItemPaintBefor = null;
        this.FOnSectionPaintHeader = null;
        this.FOnSectionPaintFooter = null;
        this.FOnSectionPaintPage = null;
        this.FOnSectionPaintPaperBefor = null;
        this.FOnSectionPaintPaperAfter = null;
        this.FOnPaintViewBefor = null;
        this.FOnPaintViewAfter = null;
        this.FOnChange = null;
        this.FOnChangedSwitch = null;
        this.FOnZoomChanged = null;
        this.FOnViewResize = null;

        this.CalcScrollRang();
    }

    dispose() {
        this.FStyle.States.include(THCState.Destroying);
        super.dispose();
    }

    SetPrintBySectionInfo(pageSettings, sectionIndex) { }

    GetViewWidth() {
        if (this.FVScrollBar.visible)
            this.FViewWidth = this.width - this.FVScrollBar.width;
        else
            this.FViewWidth = this.width;
    }

    GetViewHeight() {
        if (this.FHScrollBar.visible)
            this.FViewHeight = this.height - this.FHScrollBar.height;
        else
            this.FViewHeight = this.height;
    }

    GetSymmetryMargin() {
        return this.ActiveSection.SymmetryMargin;
    }

    SetSymmetryMargin(val) {
        if (this.ActiveSection.SymmetryMargin != val) {
            this.ActiveSection.SymmetryMargin = val;
            this.FStyle.updateInfoRePaint();
            this.FStyle.updateInfoReCaret(false);
            this.DoMapChanged();
            this.DoViewResize();
        }
    }

    DoVerScroll(sender, scrollCode, scrollPos) {
        this.FStyle.updateInfoRePaint();
        this.FStyle.updateInfoReCaret(false);
        this.CheckUpdateInfo();
        this.GetPagesAndActive();
        if (this.FOnVerScroll != null)
            this.FOnVerScroll(this);
    }

    DoHorScroll(sender, scrollCode, scrollPos) {
        this.FStyle.updateInfoRePaint();
        this.FStyle.updateInfoReCaret(false);
        this.CheckUpdateInfo();
        if (this.FOnHorScroll != null)
            this.FOnHorScroll(this);
    }

    DoSectionDataChange(sender) {
        this.DoChange();
    }

    DoSectionChangeTopLevelData(sender) {
        this.DoViewResize();
    }

    DoSectionDataCheckUpdateInfo(sender) {
        this.CheckUpdateInfo();
    }

    DoLoadFromStream(stream, style, loadSectionProc) {
        stream.position = 0;

        let vInfo = HC._LoadFileFormatAndVersion(stream);
        let vFileExt = vInfo.fileExt;
        let vFileVersion = vInfo.fileVersion;
        let vLang = vInfo.lang;

        if (vFileExt != HC.HC_EXT)
            system.exception("加载失败，不是" + HC.HC_EXT + "文件！");

        this.DoLoadStreamBefor(stream, vFileVersion);
        style.LoadFromStream(stream, vFileVersion);
        loadSectionProc(vFileVersion);
        this.DoLoadStreamAfter(stream, vFileVersion);
        this.DoMapChanged();
    }

    DoUndoNew() {
        let vResult = new THCSectionUndo();
        vResult.SectionIndex = this.FActiveSectionIndex;
        vResult.HScrollPos = this.FHScrollBar.position;
        vResult.VScrollPos = this.FVScrollBar.position;
        vResult.Data = this.ActiveSection.ActiveData;

        return vResult;
    }

    DoUndoGroupBegin(itemNo, offset) {
        let vResult = new THCSectionUndoGroupBegin();
        vResult.SectionIndex = this.FActiveSectionIndex;
        vResult.HScrollPos = this.FHScrollBar.position;
        vResult.VScrollPos = this.FVScrollBar.position;
        vResult.Data = this.ActiveSection.ActiveData;
        vResult.CaretDrawItemNo = this.ActiveSection.ActiveData.CaretDrawItemNo;

        return vResult;
    }

    DoUndoGroupEnd(itemNo, offset) {
        let vResult = new THCSectionUndoGroupEnd();
        vResult.SectionIndex = this.FActiveSectionIndex;
        vResult.HScrollPos = this.FHScrollBar.position;
        vResult.VScrollPos = this.FVScrollBar.position;
        vResult.Data = this.ActiveSection.ActiveData;
        vResult.CaretDrawItemNo = this.ActiveSection.ActiveData.CaretDrawItemNo;

        return vResult;
    }

    DoUndo(sender) {
        if (sender.isClass(THCSectionUndo)) {
            if (this.FActiveSectionIndex != sender.SectionIndex)
                this.SetActiveSectionIndex(sender.SectionIndex);

            this.FHScrollBar.position = sender.HScrollPos;
            this.FVScrollBar.position = sender.VScrollPos;
        } else if (sender.isClass(THCSectionUndoGroupBegin)) {
            if (this.FActiveSectionIndex != sender.SectionIndex)
                this.SetActiveSectionIndex(sender.SectionIndex);

            this.FHScrollBar.position = sender.HScrollPos;
            this.FVScrollBar.position = sender.VScrollPos;
        }

        this.ActiveSection.Undo(sender);
    }

    DoRedo(sender) {
        if (sender.isClass(THCSectionUndo)) {
            if (this.FActiveSectionIndex != sender.SectionIndex)
                this.SetActiveSectionIndex(sender.SectionIndex);

            this.FHScrollBar.position = sender.HScrollPos;
            this.FVScrollBar.position = sender.VScrollPos;
        } else if (sender.isClass(THCSectionUndoGroupEnd)) {
            if (this.FActiveSectionIndex != sender.SectionIndex)
                this.SetActiveSectionIndex(sender.SectionIndex);

            this.FHScrollBar.position = sender.HScrollPos;
            this.FVScrollBar.position = sender.VScrollPos;
        }

        this.ActiveSection.Redo(sender);
    }

    DoUndoDestroy(sender) { }

    DoViewResize() {
        if (this.FOnViewResize != null)
            this.FOnViewResize(this);
    }

    DoMapChanged() {
        if (this.FUpdateCount == 0) {
            this.CalcScrollRang();
            this.CheckUpdateInfo();
        }
    }

    DoSectionReadOnlySwitch(sender) {
        if (this.FOnSectionReadOnlySwitch != null)
        this.FOnSectionReadOnlySwitch(this);
    }

    DoSectionGetScreenCoord(x, y) {
        let vPt = this.clientToScreen(TPoint.Create(x, y));
        return TPoint.Create(vPt.x, vPt.y);
    }

    DoSectionItemResize(data, itemNo) {
        this.DoViewResize();
    }

    DoSectionPaintHeader(sender, pageIndex, rect, hclCanvas, paintInfo) {
        if (this.FOnSectionPaintHeader != null)
            this.FOnSectionPaintHeader(sender, pageIndex, rect, hclCanvas, paintInfo);
    }

    DoSectionPaintFooter(sender, pageIndex, rect, hclCanvas, paintInfo) {
        let vSection = sender;// as HCSection;
        if (vSection.PageNoVisible) {
            let vSectionIndex = this.FSections.indexOf(vSection);
            let vSectionStartPageIndex = 0;
            let vAllPageCount = 0;
            for (let i = 0; i <= this.FSections.count - 1; i++) {
                if (i == vSectionIndex)
                    vSectionStartPageIndex = vAllPageCount;

                vAllPageCount = vAllPageCount + this.FSections[i].PageCount;
            }

            let vS = this.FPageNoFormat.format(vSectionStartPageIndex + vSection.PageNoFrom + pageIndex, vAllPageCount);
            hclCanvas.font.size = 10;
            hclCanvas.font.name = "宋体";
            hclCanvas.textOut(rect.left + Math.trunc((rect.width - hclCanvas.textWidth(vS)) / 2), rect.top + vSection.Footer.height, vS);
        }

        if (this.FOnSectionPaintFooter != null)
            this.FOnSectionPaintFooter(vSection, pageIndex, rect, hclCanvas, paintInfo);
    }

    DoSectionPaintPage(sender, pageIndex, rect, hclCanvas, paintInfo) {
        if (this.FOnSectionPaintPage != null)
            this.FOnSectionPaintPage(sender, pageIndex, rect, hclCanvas, paintInfo);
    }

    DoSectionPaintPaperBefor(sender, pageIndex, rect, hclCanvas, paintInfo) {
        if (paintInfo.print && (this.FAnnotatePre.drawCount > 0))
            this.FAnnotatePre.clearDrawAnnotate();

        if (this.FOnSectionPaintPaperBefor != null)
            this.FOnSectionPaintPaperBefor(sender, pageIndex, rect, hclCanvas, paintInfo);
    }

    DoSectionPaintPaperAfter(sender, pageIndex, rect, hclCanvas, paintInfo) {
        if (!paintInfo.print && (this.FViewModel == THCViewModel.Film) && (sender.PagePadding > 10)) {
            hclCanvas.font.size = 10;
            hclCanvas.font.name = "宋体";
            hclCanvas.font.color = "#d0d1d5";
            hclCanvas.font.styles.clear();
            hclCanvas.textOut(rect.left, rect.bottom + 4, "编辑器由 HCView 提供，技术交流QQ群：649023932");
        }

        if (this.FAnnotatePre.visible)
            this.FAnnotatePre.paintDrawAnnotate(sender, rect, hclCanvas, paintInfo);

        if (this.FOnSectionPaintPaperAfter != null)
            this.FOnSectionPaintPaperAfter(sender, pageIndex, rect, hclCanvas, paintInfo);
    }

    DoSectionDrawItemAnnotate(sender, data, drawItemNo, drawRect, dataAnnotate) {
        let vDrawAnnotate = new THCDrawAnnotate();
        vDrawAnnotate.Data = data;
        vDrawAnnotate.DrawRect.resetRect(drawRect);
        vDrawAnnotate.DataAnnotate = dataAnnotate;
        this.FAnnotatePre.addDrawAnnotate(vDrawAnnotate);
    }

    DoSectionGetUndoList() {
        return this.FUndoList;
    }

    DoSectionInsertAnnotate(sender, data, dataAnnotate) {
        this.FAnnotatePre.insertDataAnnotate(dataAnnotate);
    }

    DoSectionRemoveAnnotate(sender, data, dataAnnotate) {
        this.FAnnotatePre.removeDataAnnotate(dataAnnotate);
    }

    DoSectionCurParaNoChange(sender) {
        if (this.FOnSectionCurParaNoChange != null)
            this.FOnSectionCurParaNoChange(sender);
    }

    DoSectionActivePageChange(sender) {
        if (this.FOnSectionActivePageChange != null)
            this.FOnSectionActivePageChange(sender);
    }

    DoStyleInvalidateRect(rect) {
        this.UpdateViewRect(rect);
    }

    DoAnnotatePreUpdateView(sender) {
        if (this.FAnnotatePre.visible) {
            this.FStyle.updateInfoRePaint();
            this.DoMapChanged();
        }
        else
            this.UpdateView();
    }

    NewDefaultSection() {
        let vResult = new THCSection(this.FStyle);
        vResult.OnDataChange = (sender) => { this.DoSectionDataChange(sender); }
        vResult.OnChangeTopLevelData = (sender) => { this.DoSectionChangeTopLevelData(sender); }
        vResult.OnCheckUpdateInfo = (sender) => { this.DoSectionDataCheckUpdateInfo(sender); }
        vResult.OnCreateItem = (sender) => { this.DoSectionCreateItem(sender); }
        vResult.OnDataAcceptAction = (sender, data, itemNo, offset, action) => { return this.DoSectionAcceptAction(sender, data, itemNo, offset, action); }
        vResult.OnCreateItemByStyle = (data, styleNo) => { return this.DoSectionCreateStyleItem(data, styleNo); }
        vResult.OnCreateFloatItemByStyle = (data, styleNo) => { return this.DoSectionCreateFloatStyleItem(data, styleNo); }
        vResult.OnCanEdit = (sender) => { return this.DoSectionCanEdit(sender); }
        vResult.OnInsertTextBefor = (data, itemNo, offset, text) => { return this.DoSectionInsertTextBefor(data, itemNo, offset, text); }
        vResult.OnInsertItem = (sender, data, item) => { this.DoSectionInsertItem(sender, data, item); }
        vResult.OnRemoveItem = (sender, data, item) => { this.DoSectionRemoveItem(sender, data, item); }
        vResult.OnSaveItem = (sender, data, itemNo) => { return this.DoSectionSaveItem(sender, data, itemNo); }
        vResult.OnItemMouseUp = (sender, data, itemNo, offset) => { this.DoSectionItemMouseUp(sender, data, itemNo, offset); }
        vResult.OnItemResize = (data, itemNo) => { this.DoSectionItemResize(data, itemNo); }
        vResult.OnReadOnlySwitch = (sender) => { this.DoSectionReadOnlySwitch(sender); }
        vResult.OnGetScreenCoord = (x, y) => { return this.DoSectionGetScreenCoord(x, y); }
        vResult.OnDrawItemPaintAfter = (sender, data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom,
            dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) => {
                this.DoSectionDrawItemPaintAfter(sender, data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom,
                    dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
        }

        vResult.OnDrawItemPaintBefor = (sender, data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom,
            dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) => {
                this.DoSectionDrawItemPaintBefor(sender, data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom,
                    dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
        }

        vResult.OnPaintHeader = (sender, pageIndex, rect, hclCanvas, paintInfo) => {
            this.DoSectionPaintHeader(sender, pageIndex, rect, hclCanvas, paintInfo);
        }

        vResult.OnPaintFooter = (sender, pageIndex, rect, hclCanvas, paintInfo) => {
            this.DoSectionPaintFooter(sender, pageIndex, rect, hclCanvas, paintInfo);
        }

        vResult.OnPaintPage = (sender, pageIndex, rect, hclCanvas, paintInfo) => {
            this.DoSectionPaintPage(sender, pageIndex, rect, hclCanvas, paintInfo);
        }

        vResult.OnPaintPaperBefor = (sender, pageIndex, rect, hclCanvas, paintInfo) => {
            this.DoSectionPaintPaperBefor(sender, pageIndex, rect, hclCanvas, paintInfo);
        }

        vResult.OnPaintPaperAfter = (sender, pageIndex, rect, hclCanvas, paintInfo) => {
            this.DoSectionPaintPaperAfter(sender, pageIndex, rect, hclCanvas, paintInfo);
        }

        vResult.OnInsertAnnotate = (sender, data, dataAnnotate) => { this.DoSectionInsertAnnotate(sender, data, dataAnnotate); }
        vResult.OnRemoveAnnotate = (sender, data, dataAnnotate) => { this.DoSectionRemoveAnnotate(sender, data, dataAnnotate); }
        vResult.OnDrawItemAnnotate = (sender, data, drawItemNo, drawRect, dataAnnotate) => {
            this.DoSectionDrawItemAnnotate(sender, data, drawItemNo, drawRect, dataAnnotate);
        }

        vResult.OnGetUndoList = () => { return this.DoSectionGetUndoList(); }
        vResult.OnCurParaNoChange = (sender) => { this.DoSectionCurParaNoChange(sender); }
        vResult.OnCaretItemChanged = (sender, data, item) => { this.DoSectionCaretItemChanged(sender, data, item); }
        vResult.OnActivePageChange = (sender) => { this.DoSectionActivePageChange(sender); }

        return vResult;
    }

    GetViewRect() {
        return TRect.CreateByBounds(0, 0, this.FViewWidth, this.FViewHeight);
    }

    GetPageIndexTop(pageIndex) {
        let vInfo = this.GetSectionPageIndexByPageIndex(pageIndex, -1);
        let vPageIndex = vInfo.pageIndex;
        let vSectionIndex = vInfo.result;
        let vResult = this.GetSectionTopFilm(vSectionIndex);

        if (vPageIndex > 0) {
            if (this.FSections[vSectionIndex].ViewModel == THCViewModel.Film)
                vResult = vResult + vPageIndex * (this.FPagePadding + this.FSections[vSectionIndex].PaperHeightPix);
            else
                vResult = vResult + vPageIndex * (this.FPagePadding + this.FSections[vSectionIndex].GetPageHeight());
        }

        return vResult;
    }

    DoPageUp(sender) {
        let vPageIndex = this.GetPagePreviewFirst();
        if (vPageIndex > 0)
            this.FVScrollBar.position = this.GetPageIndexTop(vPageIndex - 1);
    }

    DoPageDown(sender) {
        let vPageIndex = this.GetPagePreviewFirst();
        if (vPageIndex < this.GetPageCount() - 1)
            this.FVScrollBar.position = this.GetPageIndexTop(vPageIndex + 1);
    }

    ReBuildCaret() {
        if (this.FCaret == null)
            return;

        if ((!this.focused && !this.FStyle.updateInfo.draging) || this.ActiveSection.SelectExists()) {
            this.FCaret.hide();
            return;
        }

        let vCaretInfo = new THCCaretInfo();
        vCaretInfo.x = 0;
        vCaretInfo.y = 0;
        vCaretInfo.height = 0;
        vCaretInfo.visible = true;

        this.ActiveSection.GetPageCaretInfo(vCaretInfo);

        if (!vCaretInfo.visible) {
            this.FCaret.hide();
            return;
        }

        vCaretInfo.y += this.GetSectionTopFilm(this.FActiveSectionIndex);
        this.FVScrollBar.SetAreaPos(-1, vCaretInfo.y, vCaretInfo.height);

        this.FCaret.x = this.ZoomIn(this.GetSectionDrawLeft(this.FActiveSectionIndex) + vCaretInfo.x) - this.FHScrollBar.position;
        this.FCaret.y = this.ZoomIn(vCaretInfo.y) - this.FVScrollBar.position;
        this.FCaret.height = this.ZoomIn(vCaretInfo.height);

        if (!this.FStyle.updateInfo.reScroll) {
            if ((this.FCaret.x < 0) || (this.FCaret.x > this.FViewWidth)) {
                this.FCaret.hide();
                return;
            }

            if ((this.FCaret.y + this.FCaret.height < 0) || (this.FCaret.y > this.FViewHeight)) {
                this.FCaret.hide();
                return;
            }
        } else {
            if (this.FCaret.height < this.FViewHeight) {
                if (!this.FCaret.VScroll) {
                    this.FCaret.VScroll = true;
                    try {
                        if (this.FCaret.y < 0)
                            this.FVScrollBar.position = this.FVScrollBar.position + this.FCaret.y - this.FPagePadding;
                        else if (this.FCaret.y + this.FCaret.height + this.FPagePadding > this.FViewHeight)
                            this.FVScrollBar.position = this.FVScrollBar.position + this.FCaret.y + this.FCaret.height + this.FPagePadding - this.FViewHeight;
                    } finally {
                        this.FCaret.VScroll = false;
                    }
                }

                if (!this.FCaret.HScroll) {
                    this.FCaret.HScroll = true;
                    try {
                        if (this.FCaret.x < 0)
                            this.FHScrollBar.position = this.FHScrollBar.position + this.FCaret.x - this.FPagePadding;
                        else if (this.FCaret.x + this.FPagePadding > this.FViewWidth)
                            this.FHScrollBar.position = this.FHScrollBar.position + this.FCaret.x + this.FPagePadding - this.FViewWidth;
                    } finally {
                        this.FCaret.HScroll = false;
                    }
                }
            }
        }

        if (this.FCaret.VScroll || this.FCaret.HScroll)
            return;

        if (this.FCaret.y + this.FCaret.height > this.FViewHeight)
            this.FCaret.height = this.FViewHeight - this.FCaret.y;

        this.FCaret.show();
        this.DoCaretChange();
    }

    GetSectionByCrood(X, Y, sectionIndex) {
        sectionIndex = -1;
        let vY = 0;
        for (let i = 0; i <= this.FSections.count - 1; i++) {
            vY = vY + this.FSections[i].GetFilmHeight();
            if (vY > Y) {
                sectionIndex = i;
                break;
            }
        }

        if ((sectionIndex < 0) && (vY + this.FPagePadding >= Y))
            sectionIndex = this.FSections.count - 1;

        if (sectionIndex < 0)
            sectionIndex = 0;

        return sectionIndex;
    }

    SetZoom(val) {
        let vValue = val;
        if (vValue < 0.25)
            vValue = 0.25;
        else if (vValue > 5)
            vValue = 5;

        if (this.FZoom != vValue) {
            this.setFocus();
            this.FZoom = vValue;
            this.FStyle.updateInfoRePaint();
            this.FStyle.updateInfoReCaret(false);
            if (this.FOnZoomChanged != null)
                this.FOnZoomChanged(this);

            this.DoMapChanged();
            this.DoViewResize();
        }
    }

    GetHScrollValue() {
        return this.FHScrollBar.position;
    }

    GetCurStyleNo() {
        return this.ActiveSection.CurStyleNo;
    }

    GetCurParaNo() {
        return this.ActiveSection.CurParaNo;
    }

    GetShowLineActiveMark() {
        return this.FSections[0].Page.ShowLineActiveMark;
    }

    SetShowLineActiveMark(Value) {
        for (let i = 0; i <= this.FSections.count - 1; i++)
            this.FSections[i].Page.ShowLineActiveMark = Value;

        this.UpdateView();
    }

    GetShowLineNo() {
        return this.FSections[0].Page.ShowLineNo;
    }

    SetShowLineNo(val) {
        for (let i = 0; i <= this.FSections.count - 1; i++)
            this.FSections[i].Page.ShowLineNo = val;

        this.UpdateView();
    }

    GetShowUnderLine() {
        return this.FSections[0].Page.ShowUnderLine;
    }

    SetShowUnderLine(val) {
        for (let i = 0; i <= this.FSections.count - 1; i++)
            this.FSections[i].Page.ShowUnderLine = val;

        this.UpdateView();
    }

    GetReadOnly() {
        for (let i = 0; i <= this.FSections.count - 1; i++) {
            if (!this.FSections[i].ReadOnly)
                return false;
        }

        return true;
    }

    SetReadOnly(val) {
        for (let i = 0; i <= this.FSections.count - 1; i++)
            this.FSections[i].ReadOnly = val;

        this.UpdateView();
    }

    SetPageNoFormat(val) {
        if (this.FPageNoFormat != val) {
            this.FPageNoFormat = val;
            this.UpdateView();
        }
    }

    SetViewModel(val) {
        if (this.FViewModel != val) {
            this.FViewModel = val;

            for (let i = 0; i <= this.FSections.count - 1; i++)
                this.FSections[i].ViewModel = val;

            if (val == THCViewModel.Film)
                this.PagePadding = 20;
            else
                this.PagePadding = 0;
        }
    }

    SetActiveSectionIndex(val) {
        if (this.FActiveSectionIndex != val) {
            if (this.FActiveSectionIndex >= 0)
                this.FSections[this.FActiveSectionIndex].DisActive();

            this.FActiveSectionIndex = val;
            this.DoViewResize();
        }
    }

    SetIsChanged(val) {
        if (this.FIsChanged != val) {
            this.FIsChanged = val;
            if (this.FOnChangedSwitch != null)
                this.FOnChangedSwitch(this);
        }
    }

    SetPagePadding(val) {
        if (this.FPagePadding != val) {
            this.FPagePadding = val;
            for (let i = 0; i <= this.FSections.count - 1; i++)
                this.FSections[i].PagePadding = this.FPagePadding;

            this.FStyle.updateInfoRePaint();
            this.FStyle.updateInfoReCaret(false);
            this.DoMapChanged();
            this.DoViewResize();
        }
    }

    GetActiveSection() {
        return this.FSections[this.FActiveSectionIndex];
    }

    AutoScrollTimer(start) {
        // if (!start)
        //     User.KillTimer(Handle, 2);
        // else {
        //     if (User.SetTimer(Handle, 2, 100, IntPtr.Zero) == 0)
        //         throw HC.HCS_EXCEPTION_TIMERRESOURCEOUTOF;
        // }
    }

    GetPagesAndActive() {
        this.FHScrollBar.Statuses[0].text = "预览" + (this.PagePreviewFirst + 1).toString()
        + " 光标" + (this.ActivePageIndex + 1).toString()
        + "/" + this.PageCount.toString() + "页";
    }

    doContextMenu_(x, y) {
        let vPoint = this.clientToScreen(new TPoint(0, 0));
        this.popupMenu.popup(vPoint.x + x, vPoint.y + y);
    }

    doPaint_(hclCanvas) {
        hclCanvas.bitBlt(0, 0, this.FViewWidth, this.FViewHeight, this.FDataBmpCanvas, 0, 0, this.FViewWidth, this.FViewHeight);
        hclCanvas.brush.color = this.color;
        hclCanvas.fillBounds(this.FVScrollBar.left, this.FHScrollBar.top, this.FVScrollBar.width, this.FHScrollBar.height);
        super.doPaint_(hclCanvas);
    }

    doSetBounds_() {
        this.FVScrollBar.left = this.width - this.FVScrollBar.width;
        this.FVScrollBar.height = this.height - this.FHScrollBar.height;
        this.FHScrollBar.top = this.height - this.FHScrollBar.height;
        this.FHScrollBar.width = this.width - this.FVScrollBar.width;
        super.doSetBounds_();
    }

    doResize_() {
        super.doResize_();

        this.GetViewWidth();
        this.GetViewHeight();

        if ((this.FViewWidth > 0) && (this.FViewHeight > 0)) {
            this._canvas.width = this.FViewWidth;
            this._canvas.height = this.FViewHeight;
            this._context = this._canvas.getContext("2d");
            this.FDataBmpCanvas = new THCCanvas(this._context);
        }

        if (this.FAutoZoom) {
            if (this.FAnnotatePre.visible)
                this.FZoom = (this.FViewWidth - this.FPagePadding * 2) / (this.ActiveSection.PaperWidthPix + HC.AnnotationWidth);
            else
                this.FZoom = (this.FViewWidth - this.FPagePadding * 2) / this.ActiveSection.PaperWidthPix;
        }

        this.CalcScrollRang();
        this.FStyle.updateInfoRePaint();
        if (this.FCaret != null)
            this.FStyle.updateInfoReCaret(false);

        this.CheckUpdateInfo();
        this.DoViewResize();
    }

    DoChange() {
        this.SetIsChanged(true);
        this.DoMapChanged();
        if (this.FOnChange != null)
            this.FOnChange(this);
    }

    DoCaretChange() {
        this.GetPagesAndActive();
        if (this.FOnCaretChange != null)
            this.FOnCaretChange(this, null);
    }

    DoKillFocus() {
        if (this.FCaret != null) {
            this.FCaret.hide(true);
            this.UpdateViewRect(TRect.CreateByBounds(this.FCaret.x - 1, this.FCaret.y, this.FCaret.width + 1, this.FCaret.height));
        }
    }

    DoSectionCreateItem(sender) {
        if (this.FOnSectionCreateItem != null)
            this.FOnSectionCreateItem(this);
    }

    DoSectionAcceptAction(sender, data, itemNo, offset, action) {
        if (this.FOnSectionAcceptAction != null)
            return this.FOnSectionAcceptAction(sender, data, itemNo, offset, action);
        else
            return true;
    }

    DoSectionCreateStyleItem(data, styleNo) {
        if (this.FOnSectionCreateStyleItem != null)
            return this.FOnSectionCreateStyleItem(data, styleNo);
        else
            return null;
    }

    DoSectionCaretItemChanged(sender, data, item) {
        if (this.FOnSectionCaretItemChanged != null)
            this.FOnSectionCaretItemChanged(sender, data, item);
    }

    DoSectionCreateFloatStyleItem(data, styleNo) {
        if (this.FOnSectionCreateFloatStyleItem != null)
            return this.FOnSectionCreateFloatStyleItem(data, styleNo);
        else
            return null;
    }

    DoSectionInsertItem(sender, data, item) {
        if (this.FOnSectionInsertItem != null)
            this.FOnSectionInsertItem(sender, data, item);
    }

    DoSectionRemoveItem(sender, data, item) {
        if (this.FOnSectionRemoveItem != null)
            this.FOnSectionRemoveItem(sender, data, item);
    }

    DoSectionSaveItem(sender, data, itemNo) {
        if (this.FOnSectionSaveItem != null)
            return this.FOnSectionSaveItem(sender, data, itemNo);
        else
            return true;
    }

    DoSectionItemMouseUp(sender, data, itemNo, offset) {
        if (hcl.keyDownStates[TKey.ControlKey] && (data.Items[itemNo].HyperLink != ""))
            system.openURL(data.Items[itemNo].HyperLink);
    }

    DoSectionCanEdit(sender) {
        if (this.FOnSectionCanEdit != null)
            return this.FOnSectionCanEdit(sender);
        else
            return true;
    }

    DoSectionInsertTextBefor(data, itemNo, offset, text) {
        if (this.FOnSectionInsertTextBefor != null)
            return this.FOnSectionInsertTextBefor(data, itemNo, offset, text);
        else
            return true;
    }

    DoSectionDrawItemPaintBefor(sender, data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom,
        dataScreenTop, dataScreenBottom, hclCanvas, paintInfo)
    {
        if (this.FOnSectionDrawItemPaintBefor != null)
            this.FOnSectionDrawItemPaintBefor(this, data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight,
                dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
    }

    DoSectionDrawItemPaintAfter(sender, data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom,
        dataScreenTop, dataScreenBottom, hclCanvas, paintInfo)
    {
        if (data.Items[itemNo].HyperLink != "") {
            hclCanvas.pen.style = TPenStyle.Solid;
            hclCanvas.pen.color = "rgb(0, 0, 255)";
            hclCanvas.pen.width = 1;

            hclCanvas.drawLineDriect(drawRect.left, drawRect.bottom, drawRect.right, drawRect.bottom);
        }

        if (this.FOnSectionDrawItemPaintAfter != null)
            this.FOnSectionDrawItemPaintAfter(this, data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight,
                dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
    }

    DoInsertText(text) {
        return this.ActiveSection.InsertText(text);
    }

    DoCopyRequest(format) {
        return true;
    }

    DoPasteRequest(format) {
        return true;
    }

    DoPasteFormatStream(stream) {
        return true;
    }

    DoCopyAsStream(stream) { }

    DoPaintViewBefor(hclCanvas, paintInfo) {
        if (this.FOnPaintViewBefor != null)
            this.FOnPaintViewBefor(hclCanvas, paintInfo);
    }

    DoPaintViewAfter(hclCanvas, paintInfo) {
        if (this.FOnPaintViewAfter != null)
            this.FOnPaintViewAfter(hclCanvas, paintInfo);
    }

    DoSaveStreamBefor(stream) { }

    DoSaveStreamAfter(stream) { }

    DoLoadStreamBefor(stream, fileVersion) { }

    DoLoadStreamAfter(stream, fileVersion) { }

    doMouseDown_(e) {
        super.doMouseDown_(e);
        let vSectionIndex = this.GetSectionByCrood(this.ZoomOut(this.FHScrollBar.position + e.x), this.ZoomOut(this.FVScrollBar.position + e.y), -1);
        if (vSectionIndex != this.FActiveSectionIndex)
            this.SetActiveSectionIndex(vSectionIndex);

        if (this.FActiveSectionIndex < 0)
            return;

        let vSectionDrawLeft = this.GetSectionDrawLeft(this.FActiveSectionIndex);

        if (this.FAnnotatePre.drawCount > 0)
            this.FAnnotatePre.mouseDown(this.ZoomOut(e.x), this.ZoomOut(e.y));

        let vPt = new TPoint();
        vPt.x = this.ZoomOut(this.FHScrollBar.position + e.x) - vSectionDrawLeft;
        vPt.y = this.ZoomOut(this.FVScrollBar.position + e.y) - this.GetSectionTopFilm(this.FActiveSectionIndex);
        let vMouseArgs = new TMouseEventArgs();
        vMouseArgs.assign(e);
        vMouseArgs.x = vPt.x;
        vMouseArgs.y = vPt.y;
        this.FSections[this.FActiveSectionIndex].MouseDown(vMouseArgs);
        this.CheckUpdateInfo();
    }

    doMouseMove_(e) {
        super.doMouseMove_(e);
        if (this.FActiveSectionIndex >= 0) {
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x = this.ZoomOut(this.FHScrollBar.position + e.x) - this.GetSectionDrawLeft(this.FActiveSectionIndex);
            vMouseArgs.y = this.ZoomOut(this.FVScrollBar.position + e.y) - this.GetSectionTopFilm(this.FActiveSectionIndex);
            this.FSections[this.FActiveSectionIndex].MouseMove(vMouseArgs);

            if (this.FStyle.updateInfo.selecting)
                this.AutoScrollTimer(true);
        }

        if (this.FAnnotatePre.drawCount > 0)
            this.FAnnotatePre.mouseMove(this.ZoomOut(e.x), this.ZoomOut(e.y));

        this.CheckUpdateInfo();
        this.cursor = HC.GCursor;
    }

    doMouseUp_(e) {
        if (this.FStyle.updateInfo.selecting)
            this.AutoScrollTimer(false);

        if (e.button == TMouseButton.Right) {
            super.doMouseUp_(e);
            return;
        }

        if (this.FActiveSectionIndex >= 0) {
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x = this.ZoomOut(this.FHScrollBar.position + e.x) - this.GetSectionDrawLeft(this.FActiveSectionIndex);
            vMouseArgs.y = this.ZoomOut(this.FVScrollBar.position + e.y) - this.GetSectionTopFilm(this.FActiveSectionIndex);
            this.FSections[this.FActiveSectionIndex].MouseUp(vMouseArgs);
        }

        if (this.FStyle.updateInfo.draging)
            HC.GCursor = TCursors.Default;

        this.cursor = HC.GCursor;

        this.CheckUpdateInfo();

        this.FStyle.updateInfo.selecting = false;
        this.FStyle.updateInfo.draging = false;

        super.doMouseUp_(e);
        if (this.imeMode == TImeMode.Active)
            ime.setControl(this);
    }

    doMouseWheel_(e) {
        if (hcl.keyDownStates[TKey.ControlKey]) {
            if (e.delta > 0)
                this.Zoom = this.Zoom + 0.1;
            else
                this.Zoom = this.Zoom - 0.1;
        } else {
            if (hcl.keyDownStates[TKey.ShiftKey])
                this.FHScrollBar.position -= e.delta;
            else
                this.FVScrollBar.position -= e.delta;
        }
    }

    doKeyDown_(e) {
        if (hcl.keyDownStates[TKey.ControlKey] && hcl.keyDownStates[TKey.ShiftKey] && (e.keyCode == TKey.C))
            this.CopyAsText();
        else if (hcl.keyDownStates[TKey.ControlKey] && (e.keyCode == TKey.C))
            this.Copy();
        else if (hcl.keyDownStates[TKey.ControlKey] && (e.keyCode == TKey.X))
            this.Cut();
        else if (hcl.keyDownStates[TKey.ControlKey] && (e.keyCode == TKey.V))
            this.Paste();
        else if (hcl.keyDownStates[TKey.ControlKey] && (e.keyCode == TKey.A))
            this.SelectAll();
        else if (hcl.keyDownStates[TKey.ControlKey] && (e.keyCode == TKey.Z))
            this.Undo();
        else if (hcl.keyDownStates[TKey.ControlKey] && (e.keyCode == TKey.Y))
            this.Redo();
        else
            this.ActiveSection.KeyDown(e);
    }

    doKeyUp_(e) {
        super.doKeyUp_(e);
        this.ActiveSection.KeyUp(e);
    }

    doKeyPress_(e) {
        super.doKeyPress_(e);
        if (hcl.keyDownStates[TKey.ControlKey])
            return;

        this.ActiveSection.KeyPress(e);
    }

    imeInput(text, isPaste) {
        if (isPaste && this._innerPasted)
            return;

        if (text != "")
            this.InsertText(text);
    }

    // WndProc(Message) {
    //     switch (Message.Msg) {
    //         case User.WM_GETDLGCODE:
    //             Message.vResult = (IntPtr)(User.DLGC_WANTTAB | User.DLGC_WANTARROWS);
    //             return;

    //         case User.WM_ERASEBKGND:
    //             Message.vResult = (IntPtr)1;
    //             return;

    //         case User.WM_SETFOCUS:
    //             //case User.WM_NCPAINT:
    //             super.WndProc(ref Message);
    //             if (Message.HWnd != this.Handle)
    //             {
    //                 FStyle.updateInfoReCaret(false);
    //                 FStyle.updateInfoRePaint();
    //                 //FStyle.updateInfoReScroll();
    //                 CheckUpdateInfo();
    //             }
    //             return;

    //         case User.WM_KILLFOCUS:
    //             super.WndProc(ref Message);
    //             if (Message.WParam != Handle)
    //                 DoKillFocus();

    //             return;

    //         case User.WM_IME_SETCONTEXT:
    //             if (Message.WParam.ToInt32() == 1)
    //             {
    //                 Imm.ImmAssociateContext(this.Handle, FhImc);
    //             }
    //             break;

    //         case User.WM_IME_COMPOSITION:
    //             UpdateImeComposition(Message.LParam.ToInt32());
    //             break;

    //         case User.WM_LBUTTONDOWN:
    //         case User.WM_LBUTTONDBLCLK:
    //             if ((!DesignMode) && (!this.Focused))
    //             {
    //                 User.SetFocus(Handle);
    //                 if (!Focused)
    //                     return;
    //             }
    //             break;

    //         case User.WM_TIMER:
    //             if (Message.WParam.ToInt32() == 2)  // 划选时自动滚动
    //             {
    //                 POINT vPt = new POINT();
    //                 User.GetCursorPos(out vPt);
    //                 User.ScreenToClient(Handle, ref vPt);
    //                 if (vPt.y > this.height - FHScrollBar.height)
    //                     FVScrollBar.position = FVScrollBar.position + 60;
    //                 else
    //                     if (vPt.y < 0)
    //                         FVScrollBar.position = FVScrollBar.position - 60;

    //                 if (vPt.x > this.width - FVScrollBar.width)
    //                     FHScrollBar.position = FHScrollBar.position + 60;
    //                 else
    //                     if (vPt.x < 0)
    //                         FHScrollBar.position = FHScrollBar.position - 60;
    //             }
    //             break;

    //         case User.WM_IME_CHAR:
    //             Message.vResult = (IntPtr)1;
    //             return;
    //     }

    //     super.WndProc(ref Message);
    // }

    CalcScrollRang() {
        let vVMax = 0, vHMax = 0, vWidth = 0;

        if (this.FViewModel == THCViewModel.Film) {
            vHMax = this.FSections[0].PaperWidthPix;
            for (let i = 0; i <= this.FSections.count - 1; i++) {
                vVMax = vVMax + this.FSections[i].GetFilmHeight();
                vWidth = this.FSections[i].PaperWidthPix;

                if (vWidth > vHMax)
                    vHMax = vWidth;
            }
        } else {
            vHMax = this.FSections[0].GetPageWidth();
            for (let i = 0; i <= this.FSections.count - 1; i++) {
                vVMax = vVMax + this.FSections[i].GetFilmHeight();

                vWidth = this.FSections[i].GetPageWidth();

                if (vWidth > vHMax)
                    vHMax = vWidth;
            }
        }

        if (this.FAnnotatePre.visible)
            vHMax = vHMax + HC.AnnotationWidth;

        vVMax = this.ZoomIn(vVMax + this.FPagePadding);
        vHMax = this.ZoomIn(vHMax + this.FPagePadding + this.FPagePadding);

        this.FVScrollBar.max = vVMax;
        this.FHScrollBar.max = vHMax;
    }

    CheckUpdateInfo() {
        if (this.FUpdateCount > 0)
            return;

        if ((this.FCaret != null) && this.FStyle.updateInfo.reCaret) {
            this.ReBuildCaret();
            this.FStyle.updateInfo.reCaret = false;
            this.FStyle.updateInfo.reStyle = false;
            this.FStyle.updateInfo.reScroll = false;
        }

        if (this.FStyle.updateInfo.rePaint) {
            this.FStyle.updateInfo.rePaint = false;
            this.UpdateView();
        }
    }

    InitializeComponent() {
        this.SuspendLayout();
        this.Name = "HCView";
        this.ResumeLayout(false);
    }

    get Caret() {
        return this.FCaret;
    }

    DeleteUnUsedStyle(style, sections, parts) {
        for (let i = 0; i <= style.TextStyles.count - 1; i++) {
            style.TextStyles[i].CheckSaveUsed = false;
            style.TextStyles[i].TempNo = THCStyle.Null;
        }

        for (let i = 0; i <= style.ParaStyles.count - 1; i++) {
            style.ParaStyles[i].CheckSaveUsed = false;
            style.ParaStyles[i].TempNo = THCStyle.Null;
        }

        for (let i = 0; i <= sections.count - 1; i++)
            sections[i].MarkStyleUsed(true, parts);
        
        let vUnCount = 0;
        for (let i = 0; i <= style.TextStyles.count - 1; i++) {
            if (style.TextStyles[i].CheckSaveUsed)
                style.TextStyles[i].TempNo = i - vUnCount;
            else
                vUnCount++;
        }
        
        vUnCount = 0;
        for (let i = 0; i <= style.ParaStyles.count - 1; i++) {
            if (style.ParaStyles[i].CheckSaveUsed)
                style.ParaStyles[i].TempNo = i - vUnCount;
            else
                vUnCount++;
        }

        let vData = null;
        for (let i = 0; i <= sections.count - 1; i++) {
            sections[i].MarkStyleUsed(false, parts);

            vData = sections[i].ActiveData.GetTopLevelData();
            if (vData.CurStyleNo > THCStyle.Null)
                vData.CurStyleNo = style.TextStyles[vData.CurStyleNo].TempNo;

            vData.CurParaNo = style.ParaStyles[vData.CurParaNo].TempNo;
        }

        for (let i = style.TextStyles.count - 1; i >= 0; i--) {
            if (!style.TextStyles[i].CheckSaveUsed)
                style.TextStyles.delete(i);
        }

        for (let i = style.ParaStyles.count - 1; i >= 0; i--) {
            if (!style.ParaStyles[i].CheckSaveUsed)
                style.ParaStyles.delete(i);
        }
    }

    ResetActiveSectionMargin() {
        this.ActiveSection.ResetMargin();
        this.DoViewResize();
    }

    ActiveItemReAdaptEnvironment() {
        this.ActiveSection.ActiveItemReAdaptEnvironment();
    }

    clear() {
        this.BeginUpdate();
        try {
            this.FStyle.initialize();
            this.FSections.removeRange(1, this.FSections.count - 1);
            this.FActiveSectionIndex = 0;
            this.FDisplayFirstSection = -1;
            this.FDisplayLastSection = -1;

            this.FUndoList.SaveState();
            try {
                this.FUndoList.Enable = false;
                this.FSections[0].clear();
                this.FUndoList.clear();
            } finally {
                this.FUndoList.RestoreState();
            }

            this.FHScrollBar.position = 0;
            this.FVScrollBar.position = 0;
            this.FStyle.updateInfoRePaint();
            this.FStyle.updateInfoReCaret();
            this.DoMapChanged();
            this.DoViewResize();
        } finally {
            this.EndUpdate();
        }
    }

    DisSelect() {
        this.ActiveSection.DisSelect();
        this.DoSectionDataCheckUpdateInfo(this, null);
    }

    DeleteSelected() {
        this.ActiveSection.DeleteSelected();
    }

    DeleteActiveDomain() {
        return this.ActiveSection.DeleteActiveDomain();
    }

    DeleteActiveDataItems(startNo, endNo = -1, keepPara = true) {
        if (endNo < startNo)
            this.ActiveSection.DeleteActiveDataItems(startNo, startNo, keepPara);
        else
            this.ActiveSection.DeleteActiveDataItems(startNo, endNo, keepPara);
    }

    DeleteActiveSection() {
        if (this.FActiveSectionIndex > 0) {
            this.FSections.delete(this.FActiveSectionIndex);
            this.FActiveSectionIndex = this.FActiveSectionIndex - 1;
            this.FDisplayFirstSection = -1;
            this.FDisplayLastSection = -1;
            this.FStyle.updateInfoRePaint();
            this.FStyle.updateInfoReCaret();

            this.DoChange();
        }
    }

    FormatData() {
        for (let i = 0; i <= this.FSections.count - 1; i++) {
            this.FSections[i].FormatData();
            this.FSections[i].BuildSectionPages(0);
        }

        this.FStyle.updateInfoRePaint();
        this.FStyle.updateInfoReCaret();
        this.DoMapChanged();
    }

    InsertStream(stream) {
        let vResult = false;
        this.BeginUpdate();
        try {
            let vStyle = new THCStyle();
            this.DoLoadFromStream(stream, vStyle, (fileVersion) => {
                let vByte = stream.readByte();
                let vSection = new THCSection(vStyle);
                vSection.OnCreateItemByStyle = (data, styleNo) => { return this.DoSectionCreateStyleItem(data, styleNo); }
                let vDataStream = new TStream();
                vSection.LoadFromStream(stream, vStyle, fileVersion);
                vSection.Page.SaveToStream(vDataStream);
                vDataStream.position = 0;
                let vShowUnderLine = vDataStream.readBoolean();
                vResult = this.ActiveSection.InsertStream(vDataStream, vStyle, HC.HC_FileVersionInt);
            });
        } finally {
            this.EndUpdate();
        }

        return vResult;
    }

    InsertText(text) {
        this.BeginUpdate();
        try {
            return this.DoInsertText(text);
        } finally {
            this.EndUpdate();
        }
    }

    InsertTable(rowCount, colCount) {
        this.BeginUpdate();
        try {
            return this.ActiveSection.InsertTable(rowCount, colCount);
        } finally {
            this.EndUpdate();
        }
    }

    InsertImageFile(file) {
        // Bitmap vImage = new Bitmap(file);
        // return InsertImage(vImage);
    }

    InsertImage(image) {
        this.BeginUpdate();
        try {
            return this.ActiveSection.InsertImage(image);
        } finally {
            this.EndUpdate();
        }
    }

    InsertGifImage(file) {
        this.BeginUpdate();
        try {
            return this.ActiveSection.InsertGifImage(file);
        } finally {
            this.EndUpdate();
        }
    }

    InsertLine(lineHeight) {
        return this.ActiveSection.InsertLine(lineHeight);
    }

    InsertItem(item) {
        return this.ActiveSection.InsertItem(item);
    }

    InsertItemEx(index, item) {
        return this.ActiveSection.InsertItemEx(index, item);
    }

    InsertFloatItem(floatItem) {
        return this.ActiveSection.InsertFloatItem(floatItem);
    }

    InsertAnnotate(title, text) {
        return this.ActiveSection.InsertAnnotate(title, text);
    }

    InsertBreak() {
        return this.ActiveSection.InsertBreak();
    }

    InsertPageBreak() {
        return this.ActiveSection.InsertPageBreak();
    }

    InsertSectionBreak() {
        let vResult = false;
        let vSection = this.NewDefaultSection();
        this.FSections.insert(this.FActiveSectionIndex + 1, vSection);
        this.FActiveSectionIndex = this.FActiveSectionIndex + 1;
        vResult = true;
        this.FStyle.updateInfoRePaint();
        this.FStyle.updateInfoReCaret();
        this.FStyle.updateInfoReScroll();
        this.DoChange();

        return vResult;
    }

    InsertDomain(mouldDomain) {
        return this.ActiveSection.InsertDomain(mouldDomain);
    }

    SetActiveImage(imageStream) {
        return this.ActiveSection.SetActiveImage(imageStream);
    }

    ActiveTableResetRowCol(rowCount, colCount) {
        return this.ActiveSection.ActiveTableResetRowCol(rowCount, colCount);
    }

    ActiveTableInsertRowAfter(rowCount) {
        return this.ActiveSection.ActiveTableInsertRowAfter(rowCount);
    }

    ActiveTableInsertRowBefor(rowCount) {
        return this.ActiveSection.ActiveTableInsertRowBefor(rowCount);
    }

    ActiveTableDeleteCurRow() {
        return this.ActiveSection.ActiveTableDeleteCurRow();
    }

    ActiveTableSplitCurRow() {
        return this.ActiveSection.ActiveTableSplitCurRow();
    }

    ActiveTableSplitCurCol() {
        return this.ActiveSection.ActiveTableSplitCurCol();
    }

    ActiveTableInsertColBefor(colCount) {
        return this.ActiveSection.ActiveTableInsertColBefor(colCount);
    }

    ActiveTableInsertColAfter(colCount) {
        return this.ActiveSection.ActiveTableInsertColAfter(colCount);
    }

    ActiveTableDeleteCurCol() {
        return this.ActiveSection.ActiveTableDeleteCurCol();
    }

    ApplyParaAlignHorz(align) {
        this.ActiveSection.ApplyParaAlignHorz(align);
    }

    ApplyParaAlignVert(align) {
        this.ActiveSection.ApplyParaAlignVert(align);
    }

    ApplyParaBackColor(color) {
        this.ActiveSection.ApplyParaBackColor(color);
    }

    ApplyParaBreakRough(rough) {
        this.ActiveSection.ApplyParaBreakRough(rough);
    }

    ApplyParaLineSpace(spaceMode, space = 1) {
        this.ActiveSection.ApplyParaLineSpace(spaceMode, space);
    }

    ApplyParaLeftIndentAdd(add = true) {
        if (add)
            this.ActiveSection.ApplyParaLeftIndent(this.FStyle.ParaStyles[this.CurParaNo].LeftIndent + THCUnitConversion.pixXToMillimeter(HC.TabCharWidth));
        else
            this.ActiveSection.ApplyParaLeftIndent(this.FStyle.ParaStyles[this.CurParaNo].LeftIndent - THCUnitConversion.pixXToMillimeter(HC.TabCharWidth));
    }

    ApplyParaLeftIndent(indent) {
        this.ActiveSection.ApplyParaLeftIndent(indent);
    }

    ApplyParaRightIndent(indent) {
        this.ActiveSection.ApplyParaRightIndent(indent);
    }

    ApplyParaFirstIndent(indent) {
        this.ActiveSection.ApplyParaFirstIndent(indent);
    }

    ApplyTextStyle(fontStyle) {
        this.ActiveSection.ApplyTextStyle(fontStyle);
    }

    ApplyTextFontName(fontName) {
        this.ActiveSection.ApplyTextFontName(fontName);
    }

    ApplyTextFontSize(fontSize) {
        this.ActiveSection.ApplyTextFontSize(fontSize);
    }

    ApplyTextColor(color) {
        this.ActiveSection.ApplyTextColor(color);
    }

    ApplyTextBackColor(color) {
        this.ActiveSection.ApplyTextBackColor(color);
    }

    SelectAll() {
        for (let i = 0; i <= this.FSections.count - 1; i++)
            this.FSections[i].SelectAll();

        this.FStyle.updateInfoRePaint();
        this.CheckUpdateInfo();
    }

    Cut() {
        this.Copy();
        this.ActiveSection.DeleteSelected();
    }

    Copy() {
        if (this.ActiveSection.SelectExists()) {
            this.FStyle.States.include(THCState.Copying);
            try {
                let vStream = new TStream();
                HC._SaveFileFormatAndVersion(vStream);
                this.DoCopyAsStream(vStream);

                this.FStyle.SaveToStream(vStream);
                this.ActiveSectionTopLevelData().SaveSelectToStream(vStream);
                vStream.position = 0;

                let vText = this.ActiveSectionTopLevelData().SaveSelectToText();
                clipboard.clear();
                if (this.DoCopyRequest(HC.HCExtFormat))
                    clipboard.setFormatData(HC.HCExtFormat, vStream);  // HC格式

                if (this.DoCopyRequest(TDataFormat.UnicodeText))
                    clipboard.setText(vText);  // 文本格式
            } finally {
                this.FStyle.States.exclude(THCState.Copying);
            }
        }
    }

    CopyAsText() {
        if (this.DoCopyRequest(TDataFormat.UnicodeText))
            clipboard.setText(this.ActiveSectionTopLevelData().SaveSelectToText());  // 文本格式
    }

    Paste() {
        this._innerPasted = false;
        this.FStyle.States.include(THCState.Pasting);
        try {
            if (clipboard.hasFormat(HC.HCExtFormat) && this.DoPasteRequest(HC.HCExtFormat)) {
                this._innerPasted = true;
                let vStream = clipboard.getData(HC.HCExtFormat);
                vStream.position = 0;
                let vInfo = HC._LoadFileFormatAndVersion(vStream);
                let vFileFormat = vInfo.fileExt;
                let vFileVersion = vInfo.fileVersion;
                let vLang = vInfo.lang;
                if (!this.DoPasteFormatStream(vStream))
                    return;

                let vStyle = new THCStyle();
                vStyle.LoadFromStream(vStream, vFileVersion);
                this.BeginUpdate();
                try {
                    this.ActiveSection.InsertStream(vStream, vStyle, vFileVersion);
                } finally {
                    this.EndUpdate();
                }
            } else if (clipboard.hasFormat(TDataFormat.RTF) && this.DoPasteRequest(TDataFormat.RTF)) {
                this._innerPasted = true;
                //let vs = clipboard.getData(TDataFormat.RTF);
                //let vRtfRW = new THCRtfRW();
                //vRtfRW.InsertString(this, vs);
            } else if (clipboard.hasFormat(TDataFormat.UnicodeText) && this.DoPasteRequest(TDataFormat.UnicodeText)) {
                this._innerPasted = true;
                this.InsertText(clipboard.getUnicodeText());
            }
            else if (clipboard.hasFormat(TDataFormat.Bitmap) && this.DoPasteRequest(TDataFormat.Bitmap)) {
                this._innerPasted = true;
                //let vImage = clipboard.getData(TDataFormat.Bitmap);
                //let vTopData = this.ActiveSectionTopLevelData();
                //let vImageItem = new THCImageItem(vTopData);
                //vImageItem.Image = new Bitmap(vImage);
                //vImageItem.Width = vImageItem.Image.Width;
                //vImageItem.Height = vImageItem.Image.Height;
                //vImageItem.RestrainSize(vTopData.Width, vImageItem.Height);
                //this.InsertItem(vImageItem);
            }
        } finally {
            this.FStyle.States.exclude(THCState.Pasting);
        }
    }

    ZoomIn(val) {
        return Math.round(val * this.FZoom);
    }

    ZoomOut(val) {
        return Math.round(val / this.FZoom);
    }

    UpdateView() {
        this.UpdateViewRect(this.GetViewRect());
    }

    CalcDisplaySectionAndPage() {
        if (this.FDisplayFirstSection >= 0) {
            this.FSections[this.FDisplayFirstSection].DisplayFirstPageIndex = -1;
            this.FSections[this.FDisplayFirstSection].DisplayLastPageIndex = -1;
            this.FDisplayFirstSection = -1;
        }

        if (this.FDisplayLastSection >= 0) {
            this.FSections[this.FDisplayLastSection].DisplayFirstPageIndex = -1;
            this.FSections[this.FDisplayLastSection].DisplayLastPageIndex = -1;
            this.FDisplayLastSection = -1;
        }
        
        let vFirstPage = -1;
        let vLastPage = -1;
        let vPos = 0;

        for (let i = 0; i <= this.FSections.count - 1; i++) {
            for (let j = 0; j <= this.FSections[i].PageCount - 1; j++) {
                if (this.FSections[i].ViewModel == THCViewModel.Film)
                    vPos = vPos + this.ZoomIn(this.FPagePadding + this.FSections[i].PaperHeightPix);
                else
                    vPos = vPos + this.ZoomIn(this.FPagePadding + this.FSections[i].GetPageHeight());

                if (vPos > this.FVScrollBar.position) {
                    vFirstPage = j;
                    break;
                }
            }

            if (vFirstPage >= 0) {
                this.FDisplayFirstSection = i;
                this.FSections[this.FDisplayFirstSection].DisplayFirstPageIndex = vFirstPage;
                break;
            }
        }
            
        if (this.FDisplayFirstSection >= 0) {
            let vY = this.FVScrollBar.position + this.FViewHeight;
            for (let i = this.FDisplayFirstSection; i <= this.FSections.count - 1; i++) {
                for (let j = vFirstPage; j <= this.FSections[i].PageCount - 1; j++) {
                    if (vPos < vY) {
                        if (this.FSections[i].ViewModel == THCViewModel.Film)
                            vPos = vPos + this.ZoomIn(this.FPagePadding + this.FSections[i].PaperHeightPix);
                        else
                            vPos = vPos + this.ZoomIn(this.FPagePadding + this.FSections[i].GetPageHeight());
                    } else {
                        vLastPage = j;
                        break;
                    }
                }

                if (vLastPage >= 0) {
                    this.FDisplayLastSection = i;
                    this.FSections[this.FDisplayLastSection].DisplayLastPageIndex = vLastPage;
                    break;
                }

                vFirstPage = 0;
            }

            if (this.FDisplayLastSection < 0) {
                this.FDisplayLastSection = this.FSections.count - 1;
                this.FSections[this.FDisplayLastSection].DisplayLastPageIndex = this.FSections[this.FDisplayLastSection].PageCount - 1;
            }
        }
        
        if ((this.FDisplayFirstSection < 0) || (this.FDisplayLastSection < 0))
            throw "异常：获取当前显示起始页和结束页失败！";
        else {
            if (this.FDisplayFirstSection != this.FDisplayLastSection) {
                this.FSections[this.FDisplayFirstSection].DisplayLastPageIndex = this.FSections[this.FDisplayFirstSection].PageCount - 1;
                this.FSections[this.FDisplayLastSection].DisplayFirstPageIndex = 0;
            }
        }
    }

    UpdateViewRect(rect) {
        if (this.FStyle.States.contain(THCState.Destroying))
            return;

        if (this.FUpdateCount != 0)
            return;

        this.FDataBmpCanvas.save();
        try {
            this.FDataBmpCanvas.clipRect(rect);

            if (this.FViewModel == THCViewModel.Film)
                this.FDataBmpCanvas.brush.color = this.color;
            else
                this.FDataBmpCanvas.brush.color = this.FStyle.BackgroundColor;

            this.FDataBmpCanvas.fillBounds(0, 0, this.FViewWidth, this.FViewHeight);

            this.CalcDisplaySectionAndPage();
            let vPaintInfo = new TSectionPaintInfo();
            try {
                vPaintInfo.scaleX = this.FZoom;
                vPaintInfo.scaleY = this.FZoom;
                vPaintInfo.zoom = this.FZoom;
                vPaintInfo.viewModel = this.FViewModel;
                vPaintInfo.windowWidth = this.FViewWidth;
                vPaintInfo.windowHeight = this.FViewHeight;
                vPaintInfo.DPI = THCUnitConversion.PixelsPerInchX;

                let vScaleInfo = vPaintInfo.scaleCanvas(this.FDataBmpCanvas);
                try {
                    this.DoPaintViewBefor(this.FDataBmpCanvas, vPaintInfo);

                    if (this.FAnnotatePre.drawCount > 0)
                        this.FAnnotatePre.clearDrawAnnotate();

                    let vOffsetY = 0;
                    for (let i = this.FDisplayFirstSection; i <= this.FDisplayLastSection; i++) {
                        vPaintInfo.sectionIndex = i;

                        vOffsetY = this.ZoomOut(this.FVScrollBar.position) - this.GetSectionTopFilm(i);
                        this.FSections[i].PaintDisplayPage(this.GetSectionDrawLeft(i) - this.ZoomOut(this.FHScrollBar.position),
                            vOffsetY, this.FDataBmpCanvas, vPaintInfo);
                    }

                    for (let i = 0; i <= vPaintInfo.topItems.count - 1; i++)
                        vPaintInfo.topItems[i].PaintTop(this.FDataBmpCanvas);

                    this.DoPaintViewAfter(this.FDataBmpCanvas, vPaintInfo);

                    if ((!vPaintInfo.print) && (this.FCaret != null) && (this.FCaret.disFocus)) {
                        this.FDataBmpCanvas.pen.color = "gray";
                        this.FDataBmpCanvas.pen.style = TPenStyle.Solid;
                        this.FDataBmpCanvas.pen.width = this.FCaret.width;
                        this.FDataBmpCanvas.drawLineDriect(this.FCaret.x, this.FCaret.y, this.FCaret.x, this.FCaret.y + this.FCaret.height);
                    }
                } finally {
                    vPaintInfo.restoreCanvasScale(this.FDataBmpCanvas, vScaleInfo);
                }
            } finally {
                vPaintInfo = null;
            }
        } finally {
            this.FDataBmpCanvas.restore();
        }

        this.updateRect(rect);
    }

    BeginUpdate() {
        this.FUpdateCount++;
    }

    EndUpdate() {
        if (this.FUpdateCount > 0)
            this.FUpdateCount--;

        this.DoMapChanged();
    }

    UndoGroupBegin() {
        if (this.FUndoList.Enable) {
            let vData = this.ActiveSection.ActiveData;
            this.FUndoList.UndoGroupBegin(vData.SelectInfo.StartItemNo, vData.SelectInfo.StartItemOffset);
        }
    }

    UndoGroupEnd() {
        if (this.FUndoList.Enable) {
            let vData = this.ActiveSection.ActiveData;
            this.FUndoList.UndoGroupEnd(vData.SelectInfo.StartItemNo, vData.SelectInfo.StartItemOffset);
        }
    }

    GetActiveItem() {
        return this.ActiveSection.GetActiveItem();
    }

    GetTopLevelItem() {
        return this.ActiveSection.GetTopLevelItem();
    }

    GetTopLevelDrawItem() {
        return this.ActiveSection.GetTopLevelDrawItem();
    }

    GetActivePageIndex() {
        let vResult = 0;
        for (let i = 0; i <= this.ActiveSectionIndex - 1; i++)
            vResult = vResult + this.FSections[i].PageCount;
        
        return vResult + this.ActiveSection.ActivePageIndex;
    }

    GetPagePreviewFirst() {
        let vResult = 0;
        for (let i = 0; i <= this.ActiveSectionIndex - 1; i++)
            vResult = vResult + this.FSections[i].PageCount;

        return vResult + this.FSections[this.FActiveSectionIndex].DisplayFirstPageIndex;
    }

    GetPageCount() {
        let vResult = 0;
        for (let i = 0; i <= this.FSections.count - 1; i++)
            vResult = vResult + this.FSections[i].PageCount;

        return vResult;
    }

    PageUp() {
        this.DoPageUp(this);
    }

    PageDown() {
        this.DoPageDown(this);
    }

    GetSectionDrawLeft(sectionIndex) {
        let vResult = 0;
        if (this.FViewModel == THCViewModel.Film) {
            if (this.FAnnotatePre.visible)
                vResult = Math.max(Math.trunc((this.FViewWidth - this.ZoomIn(this.FSections[sectionIndex].PaperWidthPix + HC.AnnotationWidth)) / 2), this.ZoomIn(this.FPagePadding));
            else
                vResult = Math.max(Math.trunc((this.FViewWidth - this.ZoomIn(this.FSections[sectionIndex].PaperWidthPix)) / 2), this.ZoomIn(this.FPagePadding));
        }

        vResult = this.ZoomOut(vResult);

        return vResult;
    }

    GetFormatPointToViewCoord(point) {
        let vResult = TPoint.Create(point.x, point.y);
        let vSection = this.ActiveSection;

        let vPageIndex = -1;
        if (vSection.ActiveData == vSection.Page)
            vPageIndex = vSection.GetPageIndexByFormat(vResult.y);
        else
            vPageIndex = vSection.ActivePageIndex;

        vResult.x = this.ZoomIn(this.GetSectionDrawLeft(this.ActiveSectionIndex)
            + (vSection.GetPageMarginLeft(vPageIndex) + vResult.x)) - this.FHScrollBar.position;

        if (vSection.ActiveData == vSection.Header)  // 页眉
            vResult.y = this.ZoomIn(this.GetSectionTopFilm(this.ActiveSectionIndex)
                + vSection.GetPageTopFilm(vPageIndex)  // 20
                + vSection.GetHeaderPageDrawTop()
                + vResult.y)
                - this.FVScrollBar.position;
        else if (vSection.ActiveData == vSection.Footer)  // 页脚
            vResult.y = this.ZoomIn(this.GetSectionTopFilm(this.ActiveSectionIndex)
                + vSection.GetPageTopFilm(vPageIndex)  // 20
                + vSection.PaperHeightPix - vSection.PaperMarginBottomPix
                + vResult.y)
                - this.FVScrollBar.position;
        else
            vResult.y = this.ZoomIn(this.GetSectionTopFilm(this.ActiveSectionIndex)
            + vSection.GetPageTopFilm(vPageIndex)  // 20
            + vSection.GetHeaderAreaHeight() // 94
            + vResult.y
            - vSection.GetPageDataFmtTop(vPageIndex))  // 0
            - this.FVScrollBar.position;

        return vResult;
    }

    GetTopLevelDrawItemViewCoord() {
        let vResult = this.ActiveSection.GetTopLevelDrawItemCoord();
        vResult = this.GetFormatPointToViewCoord(vResult);
        return vResult;
    }

    GetTopLevelRectDrawItemViewCoord() {
        let vResult = this.ActiveSection.GetTopLevelRectDrawItemCoord();
        vResult = this.GetFormatPointToViewCoord(vResult);
        return vResult;
    }

    SetActiveItemText(text) {
        this.ActiveSection.SetActiveItemText(text);
    }

    FormatSection(sectionIndex) {
        this.FSections[sectionIndex].FormatData();
        this.FSections[sectionIndex].BuildSectionPages(0);
        this.FStyle.updateInfoRePaint();
        this.FStyle.updateInfoReCaret();

        this.DoChange();
    }

    ActiveSectionTopLevelData() {
        return this.ActiveSection.ActiveData.GetTopLevelData();
    }

    GetSectionTopFilm(sectionIndex) {
        let vResult = 0;
        for (let i = 0; i <= sectionIndex - 1; i++)
            vResult = vResult + this.FSections[i].GetFilmHeight();

        return vResult;
    }

    SaveToFile(fileName, quick = false) {
        // FileStream vStream = new FileStream(fileName, FileMode.Create, FileAccess.Write);
        // try {
        //     HashSet<SectionArea> vParts = new HashSet<SectionArea> { SectionArea.saHeader, SectionArea.saPage, SectionArea.saFooter };
        //     SaveToStream(vStream, quick, vParts);
        // } finally {
        //     vStream.Close();
        //     vStream.Dispose();
        // }
    }

    LoadFromFile(file) {
        let vResult = false;
        TStream.loadFromFile(file, (stream) => {
            vResult = this.LoadFromStream(stream);
            if (vResult)
                this.FFileName = file;
        });

        return vResult;
    }

    SaveToText() {
        let vResult = "";
        for (let i = 0; i <= this.FSections.count - 1; i++)
            vResult = vResult + HC.sLineBreak + this.FSections[i].SaveToText();

        return vResult;
    }

    SaveToImage(path, aPrefix, aImageType, aOnePaper = true) {
        // HCCanvas vBmpCanvas = new HCCanvas();
        // SectionPaintInfo vPaintInfo = new SectionPaintInfo();
        // try {
        //     vPaintInfo.scaleX = 1;
        //     vPaintInfo.scaleY = 1;
        //     vPaintInfo.zoom = 1;
        //     vPaintInfo.print = true;
        //     vPaintInfo.DPI = THCUnitConversion.PixelsPerInchX;
        //     vPaintInfo.viewModel = HCViewModel.hvmFilm;

        //     int vWidth = 0, vHeight = 0;
        //     if (aOnePaper) {
        //         for (int i = 0; i < FSections.count; i++) {
        //             vHeight = vHeight + FSections[i].PaperHeightPix * FSections[i].PageCount;
        //             if (vWidth < FSections[i].PaperWidthPix)
        //                 vWidth = FSections[i].PaperWidthPix;
        //         }

        //         vPaintInfo.windowWidth = vWidth;
        //         vPaintInfo.windowHeight = vHeight;

        //         using (Bitmap vBmp = new Bitmap(vWidth, vHeight))
        //         {
        //             vBmpCanvas.Graphics = Graphics.FromImage(vBmp);

        //             int vSectionIndex = 0, vSectionPageIndex = 0, vTop = 0;
        //             for (int i = 0; i < this.PageCount; i++)
        //             {
        //                 vSectionIndex = GetSectionPageIndexByPageIndex(i, ref vSectionPageIndex);
        //                 //vWidth = FSections[vSectionIndex].PaperWidthPix;
        //                 vHeight = FSections[vSectionIndex].PaperHeightPix;

        //                 vBmpCanvas.brush.color = color.White;
        //                 vBmpCanvas.fillRect(new RECT(0, vTop, vWidth, vTop + vHeight));

        //                 ScaleInfo vScaleInfo = vPaintInfo.scaleCanvas(vBmpCanvas);
        //                 try
        //                 {
        //                     FSections[vSectionIndex].PaintPaper(vSectionPageIndex, 0, vTop, vBmpCanvas, vPaintInfo);
        //                     vTop = vTop + vHeight;
        //                 }
        //                 finally
        //                 {
        //                     vPaintInfo.restoreCanvasScale(vBmpCanvas, vScaleInfo);
        //                 }                            
        //             }

        //             vBmpCanvas.Dispose();
        //             if (aImageType == "BMP")
        //                 vBmp.Save(path + aPrefix + ".bmp", System.Drawing.Imaging.ImageFormat.Bmp);
        //             else
        //             if (aImageType == "JPG")
        //                 vBmp.Save(path + aPrefix + ".jpg", System.Drawing.Imaging.ImageFormat.Jpeg);
        //             else
        //                 vBmp.Save(path + aPrefix + ".png", System.Drawing.Imaging.ImageFormat.Png);
        //         }
        //     }
        //     else
        //     {
        //         int vSectionIndex = 0, vSectionPageIndex = 0;
        //         for (int i = 0; i < this.PageCount; i++)
        //         {
        //             vSectionIndex = GetSectionPageIndexByPageIndex(i, ref vSectionPageIndex);

        //             using (Bitmap vBmp = new Bitmap(FSections[vSectionIndex].PaperWidthPix, FSections[vSectionIndex].PaperHeightPix))
        //             {
        //                 vBmpCanvas.Graphics = Graphics.FromImage(vBmp);
        //                 vBmpCanvas.brush.color = color.White;
        //                 vBmpCanvas.fillRect(new RECT(0, 0, vBmp.width, vBmp.height));

        //                 vPaintInfo.windowWidth = vBmp.width;
        //                 vPaintInfo.windowHeight = vBmp.height;
        //                 ScaleInfo vScaleInfo = vPaintInfo.scaleCanvas(vBmpCanvas);
        //                 try
        //                 {
        //                     vBmpCanvas.brush.color = color.White;
        //                     vBmpCanvas.fillRect(new RECT(0, 0, vBmp.width, vBmp.height));
        //                     FSections[vSectionIndex].PaintPaper(vSectionPageIndex, 0, 0, vBmpCanvas, vPaintInfo);
        //                 }
        //                 finally
        //                 {
        //                     vPaintInfo.restoreCanvasScale(vBmpCanvas, vScaleInfo);
        //                 }

        //                 vBmpCanvas.Dispose();
        //                 if (aImageType == "BMP")
        //                     vBmp.Save(path + aPrefix + (i + 1).ToString() + ".bmp", System.Drawing.Imaging.ImageFormat.Bmp);
        //                 else
        //                 if (aImageType == "JPG")
        //                     vBmp.Save(path + aPrefix + (i + 1).ToString() + ".jpg", System.Drawing.Imaging.ImageFormat.Jpeg);
        //                 else
        //                     vBmp.Save(path + aPrefix + (i + 1).ToString() + ".png", System.Drawing.Imaging.ImageFormat.Png);
        //             }
        //         }
        //     }
        // }
        // finally
        // {
        //     vPaintInfo.Dispose();
        // }
    }

    LoadFromText(text) {
        if (this.ReadOnly)
            return false;

        this.clear();
        this.FStyle.initialize();

        if (text != "")
            return this.ActiveSection.InsertText(text);
        else
            return false;
    }

    SaveToTextFile(fileName, encoding) {
        // using (FileStream vStream = new FileStream(fileName, FileMode.Create))
        // {
        //     SaveToTextStream(vStream, encoding);
        // }
    }

    LoadFromTextFile(fileName, encoding) {
        // using (FileStream vStream = new FileStream(fileName, FileMode.Open))
        // {
        //     vStream.position = 0;
        //     LoadFromTextStream(vStream, encoding);
        // }
    }

    SaveToTextStream(stream, encoding) {
        // string vText = SaveToText();
        // byte[] vBuffer = encoding.GetBytes(vText);
        // byte[] vPreamble = encoding.GetPreamble();
        // if (vPreamble.length > 0)
        //     stream.Write(vPreamble, 0, vPreamble.length);

        // stream.Write(vBuffer, 0, vBuffer.length);
    }

    LoadFromTextStream(stream, encoding) {
        // long vSize = stream.length - stream.position;
        // byte[] vBuffer = new byte[vSize];
        // stream.Read(vBuffer, 0, (int)vSize);
        // string vS = encoding.GetString(vBuffer);
        // LoadFromText(vS);
    }

    SaveToStream(stream, quick = false, areas = null) {
        HC._SaveFileFormatAndVersion(stream);
        this.DoSaveStreamBefor(stream);

        let vArea = areas;
        if (vArea == null) {
            vArea = new Set([]);
            vArea.add(TSectionArea.Header);
            vArea.add(TSectionArea.Footer);
            vArea.add(TSectionArea.Page);
        }

        if (!quick) {
            this.FUndoList.clear();
            this.DeleteUnUsedStyle(this.FStyle, this.FSections, vArea);
        }

        this.FStyle.SaveToStream(stream);
        stream.writeByte(this.FSections.count);
    
        for (let i = 0; i <= this.FSections.count - 1; i++)
            this.FSections[i].SaveToStream(stream, vArea);
        
        this.DoSaveStreamAfter(stream);
    }

    LoadFromStream(stream) {
        if (this.ReadOnly)
            return false;

        let vResult = false;
        this.BeginUpdate();
        try {
            this.FUndoList.clear();
            this.FUndoList.SaveState();
            try {
                this.FUndoList.Enable = false;
                this.clear();

                this.FStyle.States.include(THCState.Loading);
                try {
                    stream.position = 0;
                    let vEvent = (fileVersion) => {
                        let vByte = stream.readByte();  // 节数量
                        this.FSections[0].LoadFromStream(stream, this.FStyle, fileVersion);
                        for (let i = 1; i <= vByte - 1; i++) {
                            let vSection = this.NewDefaultSection();
                            vSection.LoadFromStream(stream, this.FStyle, fileVersion);
                            this.FSections.add(vSection);
                        }
                    }

                    this.DoLoadFromStream(stream, this.FStyle, vEvent);
                } finally {
                    this.FStyle.States.exclude(THCState.Loading);
                }

                vResult = true;
                this.DoViewResize();
            } finally {
                this.FUndoList.RestoreState();
            }
        } finally {
            this.EndUpdate();
        }

        return vResult;
    }

    SaveToXml(fileName, encoding) {
        // FUndoList.clear();
        // HashSet<SectionArea> vParts = new HashSet<SectionArea> { SectionArea.saHeader, SectionArea.saPage, SectionArea.saFooter };
        // DeleteUnUsedStyle(FStyle, FSections, vParts);

        // XmlDocument vXml = new XmlDocument();
        // vXml.PreserveWhitespace = true;
        // //vXml. = "1.0";
        // //vXml.DocumentElement
        // XmlElement vElement = vXml.CreateElement("HCView");
        // vElement.SetAttribute("EXT", HC.HC_EXT);
        // vElement.SetAttribute("ver", HC.HC_FileVersion);
        // vElement.SetAttribute("lang", HC.HC_PROGRAMLANGUAGE.ToString());
        // vXml.AppendChild(vElement);

        // XmlElement vNode = vXml.CreateElement("style");
        // FStyle.ToXml(vNode);  // 样式表
        // vElement.AppendChild(vNode);

        // vNode = vXml.CreateElement("sections");
        // vNode.SetAttribute("count", FSections.count.ToString());  // 节数量
        // vElement.AppendChild(vNode);

        // for (int i = 0; i <= FSections.count - 1; i++) {
        //     XmlElement vSectionNode = vXml.CreateElement("sc");
        //     FSections[i].ToXml(vSectionNode);
        //     vNode.AppendChild(vSectionNode);
        // }

        // vXml.Save(fileName);
    }

    SaveToXmlStream(stream, encoding) {

    }

    LoadFromXml(fileName) {

    }

    LoadFromXmlStream(stream) {

    }

    SaveToHtml(fileName, separateSrc = false) {

    }

    GetSectionPageIndexByPageIndex(pageIndex, sectionPageIndex) {
        let vResult = -1, vPageCount = 0;

        for (let i = 0; i <= this.FSections.count - 1; i++) {
            if (vPageCount + this.FSections[i].PageCount > pageIndex) {
                vResult = i;
                sectionPageIndex = pageIndex - vPageCount;
                break;
            }
            else
                vPageCount = vPageCount + this.FSections[i].PageCount;
        }

        return {
            pageIndex: sectionPageIndex,
            result: vResult
        }
    }

    Print() {
        return this.Print("");
    }

    PrintCopies(printer, copies = 1) {
        return this.Print(printer, 0, this.PageCount - 1, copies);
    }

    PrintRange(printer, startPageIndex, endPageIndex, copies) {
        let vPages = new Array(endPageIndex - startPageIndex + 1);
        for (let i = startPageIndex; i <= endPageIndex; i++)
            vPages[i - startPageIndex] = i;

        return this.PrintPages(printer, copies, vPages);
    }

    PrintPages(printer, copies, pages) {          

    }

    PrintOdd(printer) {
        let vPages = new Array(0);
        // for (int i = 0; i < PageCount; i++) {
        //     if (!system.isOdd(i))
        //         vPages.add(i);
        // }

        return this.PrintPages(printer, 1, vPages);
    }

    PrintEven(printer) {
        let vPages = new Array(0);
        // for (int i = 0; i < PageCount; i++) {
        //     if (system.isOdd(i))
        //         vPages.add(i);
        // }

        return this.PrintPages(printer, 1, vPages);
    }

    PrintCurPageByActiveLine(printer, printHeader, printFooter) {

    }

    PrintCurPageByItemRange(printer, printHeader, printFooter, startItemNo, startOffset, endItemNo, endOffset) {

    }

    PrintCurPageSelected(printer, printHeader, printFooter) {
        if (this.ActiveSection.ActiveData.SelectExists(false))
            return this.PrintCurPageByItemRange(printer, printHeader, printFooter,
                this.ActiveSection.ActiveData.SelectInfo.StartItemNo,
                this.ActiveSection.ActiveData.SelectInfo.StartItemOffset,
                this.ActiveSection.ActiveData.SelectInfo.EndItemNo,
                this.ActiveSection.ActiveData.SelectInfo.EndItemOffset);
        else
            return TPrintResult.prNoSupport;
    }

    MergeTableSelectCells() {
        return this.ActiveSection.MergeTableSelectCells();
    }

    TableApplyContentAlign(align) {
        return this.ActiveSection.TableApplyContentAlign(align);
    }

    Undo() {
        this.FStyle.States.include(THCState.Undoing);
        try {
            if (this.FUndoList.Enable) {
                try {
                    this.FUndoList.Enable = false;
                    this.BeginUpdate();
                    try {
                        this.FUndoList.Undo();
                    } finally {
                        this.EndUpdate();
                    }
                } finally {
                    this.FUndoList.Enable = true;
                }
            }
        } finally {
            this.FStyle.States.exclude(THCState.Undoing);
        }
    }

    Redo() {
        this.FStyle.States.include(THCState.Redoing);
        try {
            if (this.FUndoList.Enable) {
                try {
                    this.FUndoList.Enable = false;
                    this.BeginUpdate();
                    try {
                        this.FUndoList.Redo();
                    } finally {
                        this.EndUpdate();
                    }
                } finally {
                    this.FUndoList.Enable = true;
                }
            }
        } finally {
            this.FStyle.States.exclude(THCState.Redoing);
        }
    }

    Search(keyword, forward = false, matchCase = false) {
        let vResult = this.ActiveSection.Search(keyword, forward, matchCase);
        if (vResult) {
            let vPt = this.GetTopLevelDrawItemViewCoord();  // 返回光标处DrawItem相对当前页显示的窗体坐标，有选中时，以选中结束位置的DrawItem格式化坐标
            let vTopData = this.ActiveSectionTopLevelData();

            let vStartDrawItemNo = vTopData.GetDrawItemNoByOffset(vTopData.SelectInfo.StartItemNo, vTopData.SelectInfo.StartItemOffset);
            let vEndDrawItemNo = vTopData.GetDrawItemNoByOffset(vTopData.SelectInfo.EndItemNo, vTopData.SelectInfo.EndItemOffset);
                
            let vStartDrawRect = new TRect();
            let vEndDrawRect = new TRect();

            if (vStartDrawItemNo == vEndDrawItemNo) {
                vStartDrawRect.left = vPt.x + this.ZoomIn(vTopData.GetDrawItemOffsetWidth(vStartDrawItemNo,
                    vTopData.SelectInfo.StartItemOffset - vTopData.DrawItems[vStartDrawItemNo].CharOffs + 1));
                vStartDrawRect.top = vPt.y;
                vStartDrawRect.right = vPt.x + this.ZoomIn(vTopData.GetDrawItemOffsetWidth(vEndDrawItemNo,
                    vTopData.SelectInfo.EndItemOffset - vTopData.DrawItems[vEndDrawItemNo].CharOffs + 1));
                vStartDrawRect.bottom = vPt.y + this.ZoomIn(vTopData.DrawItems[vEndDrawItemNo].rect.height);
                
                vEndDrawRect = vStartDrawRect;
            } else {
                vStartDrawRect.left = vPt.x + this.ZoomIn(vTopData.DrawItems[vStartDrawItemNo].rect.left - vTopData.DrawItems[vEndDrawItemNo].rect.left
                    + vTopData.GetDrawItemOffsetWidth(vStartDrawItemNo, vTopData.SelectInfo.StartItemOffset - vTopData.DrawItems[vStartDrawItemNo].CharOffs + 1));
                vStartDrawRect.top = vPt.y + this.ZoomIn(vTopData.DrawItems[vStartDrawItemNo].rect.top - vTopData.DrawItems[vEndDrawItemNo].rect.top);
                vStartDrawRect.right = vPt.x + this.ZoomIn(vTopData.DrawItems[vStartDrawItemNo].rect.left - vTopData.DrawItems[vEndDrawItemNo].rect.left
                    + vTopData.DrawItems[vStartDrawItemNo].rect.width);
                vStartDrawRect.bottom = vStartDrawRect.top + this.ZoomIn(vTopData.DrawItems[vStartDrawItemNo].rect.height);
                
                vEndDrawRect.left = vPt.x;
                vEndDrawRect.top = vPt.y;
                vEndDrawRect.right = vPt.x + this.ZoomIn(vTopData.GetDrawItemOffsetWidth(vEndDrawItemNo,
                    vTopData.SelectInfo.EndItemOffset - vTopData.DrawItems[vEndDrawItemNo].CharOffs + 1));
                vEndDrawRect.bottom = vPt.y + this.ZoomIn(vTopData.DrawItems[vEndDrawItemNo].rect.height);
            }
        
            if (vStartDrawRect.top < 0)
                this.FVScrollBar.position = this.FVScrollBar.position + vStartDrawRect.top;
            else if (vStartDrawRect.bottom > this.FViewHeight)
                this.FVScrollBar.position = this.FVScrollBar.position + vStartDrawRect.bottom - this.FViewHeight;
            
            if (vStartDrawRect.left < 0)
                this.FHScrollBar.position = this.FHScrollBar.position + vStartDrawRect.left;
            else if (vStartDrawRect.right > this.FViewWidth)
                this.FHScrollBar.position = this.FHScrollBar.position + vStartDrawRect.right - this.FViewWidth;
        }

        return vResult;
    }

    Replace(text) {
        return this.ActiveSection.Replace(text);
    }

    get FileName() {
        return this.FFileName;
    }

    set FileName(val) {
        this.FFileName = val;
    }

    get Style() {
        return this.FStyle;
    }

    get SymmetryMargin() {
        return this.GetSymmetryMargin();
    }

    set SymmetryMargin(val) {
        this.SetSymmetryMargin(val);
    }

    get ActivePageIndex() {
        return this.GetActivePageIndex();
    }

    get PagePreviewFirst() {
        return this.GetPagePreviewFirst();
    }

    get PageCount() {
        return this.GetPageCount();
    }

    get ActiveSectionIndex() {
        return this.FActiveSectionIndex;
    }

    set ActiveSectionIndex(val) {
        this.SetActiveSectionIndex(val);
    }

    get ActiveSection() {
        return this.GetActiveSection();
    }

    get HScrollBar() {
        return this.FHScrollBar;
    }

    get VScrollBar() {
        return this.FVScrollBar;
    }

    get CurStyleNo() {
        return this.GetCurStyleNo();
    }

    get CurParaNo() {
        return this.GetCurParaNo();
    }

    get Zoom() {
        return this.FZoom;
    }

    set Zoom(val) {
        this.SetZoom(val);
    }

    get Sections() {
        return this.FSections;
    }

    get ShowLineActiveMark() {
        return this.GetShowLineActiveMark();
    }

    set ShowLineActiveMark(val) {
        this.SetShowLineActiveMark(val);
    }

    get ShowLineNo() {
        return this.GetShowLineNo();
    }

    set ShowLineNo(val) {
        this.SetShowLineNo(val);
    }

    get ShowUnderLine() {
        return this.GetShowUnderLine();
    }

    set ShowUnderLine(val) {
        this.SetShowUnderLine(val);
    }

    get IsChanged() {
        return this.FIsChanged;
    }

    set IsChanged(val) {
        this.SetIsChanged(val);
    }

    get PagePadding() {
        return this.FPagePadding;
    }

    set PagePadding(val) {
        this.SetPagePadding(val);
    }

    get AnnotatePre() {
        return this.FAnnotatePre;
    }

    get ViewWidth() {
        return this.FViewWidth;
    }

    get ViewHeight() {
        return this.FViewHeight;
    }

    get OnSectionCreateItem() {
        return this.FOnSectionCreateItem;
    }

    set OnSectionCreateItem(val) {
        this.FOnSectionCreateItem = val;
    }

    get OnSectionItemInsert() {
        return this.FOnSectionInsertItem;
    }

    set OnSectionItemInsert(val) {
        this.FOnSectionInsertItem = val;
    }

    get OnSectionRemoveItem() {
        return this.FOnSectionRemoveItem;
    }

    set OnSectionRemoveItem(val) {
        this.FOnSectionRemoveItem = val;
    }

    get OnSectionSaveItem() {
        return this.FOnSectionSaveItem;
    }

    set OnSectionSaveItem(val) {
        this.FOnSectionSaveItem = val;
    }

    get OnSectionAcceptAction() {
        return this.FOnSectionAcceptAction;
    }

    set OnSectionAcceptAction(val) {
        this.FOnSectionAcceptAction = val;
    }

    get OnSectionDrawItemPaintBefor() {
        return this.FOnSectionDrawItemPaintBefor;
    }

    set OnSectionDrawItemPaintBefor(val) {
        this.FOnSectionDrawItemPaintBefor = val;
    }

    get OnSectionDrawItemPaintAfter() {
        return this.FOnSectionDrawItemPaintAfter;
    }

    set OnSectionDrawItemPaintAfter(val) {
        this.FOnSectionDrawItemPaintAfter = val;
    }

    get OnSectionPaintHeader() {
        return this.FOnSectionPaintHeader;
    }

    set OnSectionPaintHeader(val) {
        this.FOnSectionPaintHeader = val;
    }

    get OnSectionPaintFooter() {
        return this.FOnSectionPaintFooter;
    }

    set OnSectionPaintFooter(val) {
        this.FOnSectionPaintFooter = val;
    }

    get OnSectionPaintPage() {
        return this.FOnSectionPaintPage;
    }

    set OnSectionPaintPage(val) {
        this.FOnSectionPaintPage = val;
    }

    get OnSectionPaintPaperBefor() {
        return this.FOnSectionPaintPaperBefor;
    }

    set OnSectionPaintPaperBefor(val) {
        this.FOnSectionPaintPaperBefor = val;
    }

    get OnSectionPaintPaperAfter() {
        return this.FOnSectionPaintPaperAfter;
    }
    
    set OnSectionPaintPaperAfter(val) {
        this.FOnSectionPaintPaperAfter = val;
    }

    get OnSectionReadOnlySwitch() {
        return this.FOnSectionReadOnlySwitch;
    }

    set OnSectionReadOnlySwitch(val) {
        this.FOnSectionReadOnlySwitch = val;
    }

    get ViewModel() {
        return this.FViewModel;
    }

    set ViewModel(val) {
        this.SetViewModel(val);
    }

    get AutoZoom() {
        return this.FAutoZoom;
    }

    set AutoZoom(val) {
        this.FAutoZoom = val;
    }

    get ReadOnly() {
        return this.GetReadOnly();
    }

    set ReadOnly(val) {
        this.SetReadOnly(val);
    }

    get PageNoFormat() {
        return this.FPageNoFormat;
    }

    set PageNoFormat(val) {
        this.SetPageNoFormat(val);
    }

    get OnCaretChange() {
        return this.FOnCaretChange;
    }

    set OnCaretChange(val) {
        this.FOnCaretChange = val;
    }

    get OnVerScroll() {
        return this.FOnVerScroll;
    }

    set OnVerScroll(val) {
        this.FOnVerScroll = val;
    }

    get OnHorScroll() {
        return this.FOnHorScroll;
    }

    set OnHorScroll(val) {
        this.FOnHorScroll = val;
    }

    get OnChange() {
        return this.FOnChange;
    }

    set OnChange(val) {
        this.FOnChange = val;
    }

    get OnChangedSwitch() {
        return this.FOnChangedSwitch;
    }

    set OnChangedSwitch(val) {
        this.FOnChangedSwitch = val;
    }

    get OnZoomChanged() {
        return this.FOnZoomChanged;
    }

    set OnZoomChanged(val) {
        this.FOnZoomChanged = val;
    }

    get OnPaintViewBefor() {
        return this.FOnPaintViewBefor;
    }

    set OnPaintViewBefor(val) {
        this.FOnPaintViewBefor = val;
    }

    get OnPaintViewAfter() {
        return this.FOnPaintViewAfter;
    }

    set OnPaintViewAfter(val) {
        this.FOnPaintViewAfter = val;
    }

    get OnSectionCreateStyleItem() {
        return this.FOnSectionCreateStyleItem;
    }

    set OnSectionCreateStyleItem(val) {
        this.FOnSectionCreateStyleItem = val;
    }

    get OnSectionCreateFloatStyleItem() {
        return this.FOnSectionCreateFloatStyleItem;
    }

    set OnSectionCreateFloatStyleItem(val) {
        this.FOnSectionCreateFloatStyleItem = val;
    }

    get OnSectionCanEdit() {
        return this.FOnSectionCanEdit;
    }

    set OnSectionCanEdit(val) {
        this.FOnSectionCanEdit = val;
    }

    get OnSectionInsertTextBefor() {
        return this.FOnSectionInsertTextBefor;
    }

    set OnSectionInsertTextBefor(val) {
        this.FOnSectionInsertTextBefor = val;
    }

    get OnSectionCurParaNoChange() {
        return this.FOnSectionCurParaNoChange;
    }

    set OnSectionCurParaNoChange(val) {
        this.FOnSectionCurParaNoChange = val;
    }

    get OnSectionCaretItemChanged() {
        return this.FOnSectionCaretItemChanged;
    }

    set OnSectionCaretItemChanged(val){
        this.FOnSectionCaretItemChanged = val;
    }

    get OnSectionActivePageChange() {
        return this.FOnSectionActivePageChange;
    }

    set OnSectionActivePageChange(val) {
        this.FOnSectionActivePageChange = val;
    }

    get OnViewResize() {
        return this.FOnViewResize;
    }

    set OnViewResize(val) {
        this.FOnViewResize = val;
    }
} 