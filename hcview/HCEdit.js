/*=======================================================

    HCView V1.0
    文档内容呈现控件
    作者：荆通(18114532@qq.com)
    QQ群：649023932

=======================================================*/

import { TCustomControl, TScrollBar, TCursors, TOrientation, TAlign, TMouseEventArgs, TMouseButton, TKey } from "../hcl/Controls.js";
import { THCViewData } from "./HCViewData.js";
import { THCCanvas, TColor } from "../hcl/Graphics.js";
import { THCUnitConversion } from "./HCUnitConversion.js";
import { HC, THCCaret, THCCaretInfo, THCState } from "./HCCommon.js";
import { clipboard, TDataFormat } from "../hcl/Clipboard.js";
import { THCUndoList, THCEditUndo, THCUndoEditGroupBegin, THCUndoEditGroupEnd } from "./HCUndo.js";
import { THCStyle } from "./HCStyle.js";
import { THCStatusScrollBar } from "./HCStatusScrollBar.js";
import { TImeMode, ime } from "../hcl/Ime.js";
import { hcl } from "../hcl/HCL.js";
import { TStream, system, TRect } from "../hcl/System.js";
import { TPaintInfo } from "./HCItem.js";

export class THCEdit extends TCustomControl {
    constructor() {
        super();
        this.color = TColor.rgbaToColor(82, 89, 107);
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

        this.FUpdateCount = 0;
        this.FViewWidth = 0;
        this.FViewHeight = 0;

        this.FStyle = new THCStyle(true, true);
        this.FStyle.onInvalidateRect = (rect) => { this.DoStyleInvalidateRect(rect); }
        this.FData = new THCViewData(this.FStyle);
        this.FData.width = 200;
        this.FData.OnGetUndoList = () => {
            return this.DoGetUndoList();
        }

        this.FData.OnCreateItemByStyle = (data, styleNo) => {
            return this.DoDataCreateStyleItem(data, styleNo);
        }

        this.FData.OnInsertItem = (data, item) => {
            this.DoDataInsertItem(data, item);
        }

        this.FData.OnRemoveItem = (data, item) => {
            this.DoDataRemoveItem(data, item);
        }

        this.FVScrollBar = new TScrollBar();
        this.FVScrollBar.orientation = TOrientation.Vertical;
        this.FVScrollBar.align = TAlign.None;
        this.FVScrollBar.onScroll = (sender, scrollCode, scrollPos) => { this.DoVerScroll(sender, scrollCode, scrollPos); }

        this.FHScrollBar = new THCStatusScrollBar();
        this.FHScrollBar.orientation = TOrientation.Horizontal;
        this.FHScrollBar.addStatus(100);
        this.FHScrollBar.align = TAlign.None;
        this.FHScrollBar.onScroll = (sender, scrollCode, scrollPos) => { this.DoVerScroll(sender, scrollCode, scrollPos); }

        this.controls.add(this.FHScrollBar);
        this.controls.add(this.FVScrollBar);

        this.handle_ = hcl.handleAllocate();
        this.FCaret = new THCCaret();
        this.FCaret.control = this;
        this.imeMode = TImeMode.Active;
        this._innerPasted = false;
        this.FChanged = false;
    }

    DoVerScroll(sender, scrollCode, scrollPos) {
        this.FStyle.updateInfoRePaint();
        this.FStyle.updateInfoReCaret(false);
        this.CheckUpdateInfo();
    }

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

    GetCurStyleNo() {
        return this.FData.GetTopLevelData().CurParaNo;
    }

    GetCurParaNo() {
        return this.FData.GetTopLevelData().CurStyleNo;
    }

    ReBuildCaret(scrollBar = false) {
        if (this.FCaret == null)
            return;

        if ((!this.focused) || (!this.FStyle.updateInfo.draging && this.FData.SelectExists())) {
            this.FCaret.hide();
            return;
        }

        let vCaretInfo = new THCCaretInfo();
        vCaretInfo.x = 0;
        vCaretInfo.y = 0;
        vCaretInfo.height = 0;
        vCaretInfo.visible = true;
    
        this.FData.GetCaretInfo(this.FData.SelectInfo.StartItemNo, 
            this.FData.SelectInfo.StartItemOffset, vCaretInfo);

        if (!vCaretInfo.visible) {
            this.FCaret.hide();
            return;
        }

        this.FCaret.x = vCaretInfo.x - this.FHScrollBar.position + this.paddingLeft;
        this.FCaret.y = vCaretInfo.y - this.FVScrollBar.position + this.paddingTop;
        this.FCaret.height = vCaretInfo.height;

        if (scrollBar) {
            if ((this.FCaret.x < 0) || (this.FCaret.x > this.FViewWidth)) {
                this.FCaret.hide();
                return;
            }

            if ((this.FCaret.y + this.FCaret.height < 0) || (this.FCaret.y > this.FViewHeight)) {
                this.FCaret.height();
                return;
            }
        } else {
            if (this.FCaret.height < this.FViewHeight) {
                if (this.FCaret.y < 0)
                    this.FVScrollBar.position = this.FVScrollBar.position + this.FCaret.y - this.paddingTop;
                else if (this.FCaret.y + this.FCaret.height + this.paddingTop > this.FViewHeight)
                    this.FVScrollBar.position = this.FVScrollBar.position + this.FCaret.y + this.FCaret.height + this.paddingTop - this.FViewHeight;
            }
        }


        if (this.FCaret.y + this.FCaret.height > this.FViewHeight)
            this.FCaret.height = this.FViewHeight - this.FCaret.y;

        this.FCaret.show();
        this.DoCaretChange();
    }

    CheckUpdateInfo(scrollBar = false) {
        if ((this.FCaret != null) && this.FStyle.updateInfo.reCaret) {
            this.FStyle.updateInfo.reCaret = false;
            this.ReBuildCaret(scrollBar);
        } if (this.FStyle.updateInfo.rePaint) {
            this.FStyle.updateInfo.rePaint = false;
            this.UpdateView();
        }
    }

    DoVScrollChange(sender, scrollCode, scrollPos) {
        this.FStyle.updateInfoRePaint();
        this.FStyle.updateInfoReCaret(false);
        this.CheckUpdateInfo(true);
    }

    DoMapChanged() {
        if (this.FUpdateCount == 0) {
            this.CalcScrollRang();
            this.CheckUpdateInfo();
        }
    }

    DoCaretChange() {
        if (this.FOnCaretChange != null)
            this.FOnCaretChange(this, null);
    }

    DoDataCheckUpdateInfo() {
        if (this.FUpdateCount == 0)
            this.CheckUpdateInfo();
    }

    DoChange() {
        this.FChanged = true;
        this.DoMapChanged();
        if (this.FOnChange != null)
            this.FOnChange(this, null);
    }

    CalcScrollRang() {
        this.FHScrollBar.max = this.paddingLeft + this.paddingRight;
        this.FVScrollBar.max = this.FData.height + this.paddingTop + this.paddingBottom;
    }

    _DeleteUnUsedStyle() {
        for (let i = 0; i < this.FStyle.TextStyles.count; i++) {
            this.FStyle.TextStyles[i].CheckSaveUsed = false;
            this.FStyle.TextStyles[i].TempNo = THCStyle.Null;
        } for (let i = 0; i < this.FStyle.ParaStyles.count; i++) {
            this.FStyle.ParaStyles[i].CheckSaveUsed = false;
            this.FStyle.ParaStyles[i].TempNo = THCStyle.Null;
        }

        this.FData.MarkStyleUsed(true);
        
        let vUnCount = 0;
        for (let i = 0; i < this.FStyle.TextStyles.count; i++) {
            if (this.FStyle.TextStyles[i].CheckSaveUsed)
                this.FStyle.TextStyles[i].TempNo = i - vUnCount;
            else
                vUnCount++;
        }

        vUnCount = 0;
        for (let i = 0; i < this.FStyle.ParaStyles.count; i++) {
            if (this.FStyle.ParaStyles[i].CheckSaveUsed)
                this.FStyle.ParaStyles[i].TempNo = i - vUnCount;
            else
                vUnCount++;
        }

        this.FData.MarkStyleUsed(false);

        for (let i = this.FStyle.TextStyles.count - 1; i >= 0; i--) {
            if (!this.FStyle.TextStyles[i].CheckSaveUsed)
                this.FStyle.TextStyles.removeAt(i);
        }

        for (let i = this.FStyle.ParaStyles.count - 1; i >= 0; i--) {
            if (!this.FStyle.ParaStyles[i].CheckSaveUsed)
                this.FStyle.ParaStyles.removeAt(i);
        }
    }

    doPaint_(hclCanvas) {
        hclCanvas.bitBlt(0, 0, this.FViewWidth, this.FViewHeight, this.FDataBmpCanvas, 0, 0, this.FViewWidth, this.FViewHeight);
        hclCanvas.brush.color = this.color;
        hclCanvas.fillBounds(this.FVScrollBar.left, this.FHScrollBar.top, this.FVScrollBar.width, this.FHScrollBar.height);
        super.doPaint_(hclCanvas);
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
            this.FDataBmpCanvas.prepareConext(hcl._scale);
        }

        this.FData.width = this.FViewWidth - this.paddingLeft - this.paddingRight;
        this.FData.ReFormat();
        this.FStyle.updateInfoRePaint();
        if (this.FCaret != null)
            this.FStyle.updateInfoReCaret(false);

        this.DoMapChanged();
    }

    doSetBounds_() {
        this.FVScrollBar.left = this.width - this.FVScrollBar.width;
        this.FVScrollBar.height = this.height - this.FHScrollBar.height;
        this.FVScrollBar.pageSize = this.FVScrollBar.height;

        this.FHScrollBar.top = this.height - this.FHScrollBar.height;
        this.FHScrollBar.width = this.width - this.FVScrollBar.width;
        this.FHScrollBar.pageSize = this.FHScrollBar.width;
        super.doSetBounds_();
    }

    doSetFocus_(accept) { 
        super.doSetFocus_(accept);
        if (this.focused && (this.imeMode == TImeMode.Active))
            ime.setControl(this);
    }

    imeActive() {
        this.FCaret.show();
    }

    doMouseDown_(e) {
        let vArgs = new TMouseEventArgs();
        vArgs.assign(e);
        vArgs.x = e.x - this.paddingLeft - this.FHScrollBar.position;
        vArgs.y = e.y - this.paddingTop + this.FVScrollBar.position;
        this.FData.MouseDown(vArgs);

        this.CheckUpdateInfo();
        super.doMouseDown_(e);
    }

    doMouseMove_(e) {
        super.doMouseMove_(e);
        HC.GCursor = TCursors.Ibeam;

        let vArgs = new TMouseEventArgs();
        vArgs.assign(e);
        vArgs.x = e.x - this.paddingLeft - this.FHScrollBar.position;
        vArgs.y = e.y - this.paddingTop + this.FVScrollBar.position;
        this.FData.MouseMove(vArgs);

        this.cursor = HC.GCursor;
        this.CheckUpdateInfo();
    }

    doMouseUp_(e) {
        super.doMouseUp_(e);
        if (this.imeMode == TImeMode.Active)
            ime.setControl(this);

        if (e.button == TMouseButton.Right)
            return;

        let vArgs = new TMouseEventArgs();
        vArgs.assign(e);
        vArgs.x = e.x - this.paddingLeft - this.FHScrollBar.position;
        vArgs.y = e.y - this.paddingTop + this.FVScrollBar.position;
        this.FData.MouseUp(vArgs);

        if (this.FStyle.updateInfo.draging)
            HC.GCursor = TCursors.Default;

        this.cursor = HC.GCursor;
        this.CheckUpdateInfo();

        this.FStyle.updateInfo.selecting = false;
        this.FStyle.updateInfo.draging = false;
    }

    doMouseWheel_(e) {
        if (hcl.keyDownStates[TKey.ControlKey])
            this.FHScrollBar.position -= e.delta;
        else
            this.FVScrollBar.position -= e.delta;
    }

    doKeyDown_(e) {
        super.doKeyDown_(e);
        //if (hcl.keyDownStates[TKey.ControlKey] && hcl.keyDownStates[TKey.ShiftKey] && (e.keyCode == TKey.C))
        //    this.CopyAsText();
        //else 
        if (hcl.keyDownStates[TKey.ControlKey] && (e.keyCode == TKey.C))
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
        else {
            this.FData.KeyDown(e);

            if (HC.IsKeyDownEdit(e.keyCode))
                this.DoChange();
            else if (HC.IsDirectionKey(e.keyCode))
                this.DoDataCheckUpdateInfo();
        }

        this.CheckUpdateInfo();
    }

    doKeyUp_(e) {
        super.doKeyUp_(e);
        this.FData.KeyUp(e);
    }

    doKeyPress_(e) {
        super.onKeyPress(e);
        if (HC.IsKeyPressWant(e)) {
            this.FData.KeyPress(e.keyCode);
            this.DoChange();
            this.CheckUpdateInfo();
        }
    }

    imeInput(text, isPaste) {
        if (isPaste && this._innerPasted)
            return;

        if (text != "") {
            this.FData.InsertText(text);
            this.FStyle.updateInfoRePaint();
            this.FStyle.updateInfoReCaret();
            this.CheckUpdateInfo();
        }
    }

    DoDataCreateStyleItem(data, styleNo) {
        if (this.FOnCreateStyleItem != null)
            return this.FOnCreateStyleItem(data, styleNo);
        else
            return null;
    }

    DoDataInsertItem(data, item) {
        if (this.FOnInsertItem != null)
            this.FOnInsertItem(data, item);
    }

    DoDataRemoveItem(data, item) {
        if (this.FOnRemoveItem != null)
            this.FOnRemoveItem(data, item);
    }

    Cut() {
        this.Copy();
        this.FData.DeleteSelected();
        this.CheckUpdateInfo();
    }

    Copy() {
        if (this.ActiveSection.SelectExists()) {
            this.FStyle.States.include(THCState.Copying);
            try {
                let vStream = new TStream();
                HC._SaveFileFormatAndVersion(vStream);
                this._DeleteUnUsedStyle();

                this.FStyle.SaveToStream(vStream);
                this.FData.GetTopLevelData().SaveSelectToStream(vStream);
                vStream.position = 0;

                let vText = this.FData.GetTopLevelData().SaveSelectToText();
                clipboard.clear();
                if (this.DoCopyRequest(HC.HCExtFormat))
                    clipboard.setFormatData(HC.HCExtFormat, vStream);

                if (this.DoCopyRequest(TDataFormat.UnicodeText))
                    clipboard.setText(vText);
            } finally {
                this.FStyle.States.exclude(THCState.Copying);
            }
        }
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
                // if (!this.DoPasteFormatStream(vStream))
                //     return;

                let vStyle = new THCStyle();
                vStyle.LoadFromStream(vStream, vInfo.fileVersion);
                this.BeginUpdate();
                try {
                    this.FData.InsertStream(vStream, vStyle, vInfo.fileVersion);
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
                this.FData.InsertText(clipboard.getUnicodeText());
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

    DataChangeByAction(fun) {
        let vResult = fun();
        this.DoChange();
        return vResult;
    }

    DoGetUndoList() {
        return this.FUndoList;
    }

    DoUndoNew() {
        let vResult = new THCEditUndo();
        vResult.HScrollPos = this.FHScrollBar.position;
        vResult.VScrollPos = this.FVScrollBar.position;
        vResult.Data = this.FData;

        return vResult;
    }

    DoUndoGroupBegin(itemNo, offset) {
        let vResult = new THCUndoEditGroupBegin();
        vResult.HScrollPos = this.FHScrollBar.position;
        vResult.VScrollPos = this.FVScrollBar.position;
        vResult.Data = this.FData;
        vResult.CaretDrawItemNo = this.FData.CaretDrawItemNo;

        return vResult;
    }

    DoUndoGroupEnd(itemNo, offset) {
        let vResult = new THCUndoEditGroupEnd();
        vResult.HScrollPos = this.FHScrollBar.position;
        vResult.VScrollPos = this.FVScrollBar.position;
        vResult.Data = this.FData;
        vResult.CaretDrawItemNo = this.FData.CaretDrawItemNo;

        return vResult;
    }

    DoUndo(sender) {
        if (sender.isClass(THCEditUndo)) {
            this.FHScrollBar.position = sender.HScrollPos;
            this.FVScrollBar.position = sender.VScrollPos;
        } else if (sender.isClass(THCUndoEditGroupBegin)) {
            this.FHScrollBar.position = sender.HScrollPos;
            this.FVScrollBar.position = sender.VScrollPos;
        }

        let vUndoList = this.DoGetUndoList();
        if (!vUndoList.GroupWorking) {
            this.DataChangeByAction(() => {
                this.FData.Undo(sender);
                return true;
            });
        } else
            this.FData.Undo(sender);
    }

    DoRedo(sender) {
        if (sender.isClass(THCEditUndo)) {
            this.FHScrollBar.position = sender.HScrollPos;
            this.FVScrollBar.position = sender.VScrollPos;
        } else if (sender.isClass(THCUndoEditGroupBegin)) {
            this.FHScrollBar.position = sender.HScrollPos;
            this.FVScrollBar.position = sender.VScrollPos;
        }

        let vUndoList = this.DoGetUndoList();
        if (!vUndoList.GroupWorking) {
            this.DataChangeByAction(() => {
                this.FData.Redo(sender);
                return true;
            });
        } else
            this.FData.Redo(sender);
    }

    ApplyParaAlignHorz(align) {
        this.FData.ApplyParaAlignHorz(align);
        this.CheckUpdateInfo();
    }

    ApplyParaAlignVert(align) {
        this.FData.ApplyParaAlignVert(align);
        this.CheckUpdateInfo();
    }

    ApplyParaBackColor(color) {
        this.FData.ApplyParaBackColor(color);
        this.CheckUpdateInfo();
    }

    ApplyParaLineSpace(spaceMode, space = 1) {
        this.FData.ApplyParaLineSpace(spaceMode, space);
        this.CheckUpdateInfo();
    }

    ApplyTextStyle(fontStyle) {
        this.FData.ApplyTextStyle(fontStyle);
        this.CheckUpdateInfo();
    }

    ApplyTextFontName(fontName) {
        this.FData.ApplyTextFontName(fontName);
        this.CheckUpdateInfo();
    }

    ApplyTextFontSize(fontSize) {
        this.FData.ApplyTextFontSize(fontSize);
        this.CheckUpdateInfo();
    }

    ApplyTextColor(color) {
        this.FData.ApplyTextColor(color);
        this.CheckUpdateInfo();
    }

    ApplyTextBackColor(color) {
        this.FData.ApplyTextBackColor(color);
        this.CheckUpdateInfo();
    }

    InsertItem(item) {
        return this.DataChangeByAction(() => {
            return this.FData.InsertItem(item);
        });
    }

    InsertItemEx(index, item) {
        return this.DataChangeByAction(() => {
            return this.FData.InsertItemEx(index, item);
        });
    }

    InsertDomain(domain)
    {
        return this.DataChangeByAction(() => {
            return this.FData.InsertDomain(domain);
        });
    }

    InsertTable(rowCount, colCount) {
        return this.DataChangeByAction(() => {
            let vTopData = this.FData.GetTopLevelData();
            return vTopData.InsertTable(rowCount, colCount);
        });
    }

    TopLevelData() {
        return this.FData.GetTopLevelData();
    }

    SetActiveItemText(text) {
        this.FData.SetActiveItemText(text);
        this.CheckUpdateInfo();
    }

    SelectAll() {
        this.FData.SelectAll();

        this.FStyle.UpdateInfoRePaint();
        this.CheckUpdateInfo();
    }

    SaveToFile(fileName) {
        //this.SaveToStream(vStream);
    }

    LoadFromFile(file) {
        //LoadFromStream(vStream);
    }

    SaveToStream(stream) {
        HC._SaveFileFormatAndVersion(stream);
        this._DeleteUnUsedStyle();
        this.FStyle.SaveToStream(stream);
        this.FData.SaveToStream(stream);
    }

    LoadFromStream(stream) {
        this.BeginUpdate();
        try {
            this.FUndoList.clear();
            this.FUndoList.SaveState();
            try {
                this.FUndoList.Enable = false;

                this.FData.Clear();
                this.FStyle.Initialize();

                stream.position = 0;
                let vInfo = HC._LoadFileFormatAndVersion(stream);
                if (vInfo.fileExt != HC.HC_EXT)
                    system.exception("加载失败，不是" + HC.HC_EXT + "文件！");

                this.FStyle.LoadFromStream(stream, vInfo.fileVersion);
                this.FData.LoadFromStream(stream, this.FStyle, vInfo.fileVersion);
                this.DoMapChanged();
            } finally {
                this.FUndoList.RestoreState();
            }
        } finally {
            this.EndUpdate();
        }
    }

    Clear() {
        this.FData.Clear();
    }

    Undo() {
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
    }

    Redo() {
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
    }

    UndoGroupBegin() {
        if (this.FUndoList.Enable)
            this.FUndoList.UndoGroupBegin(this.FData.SelectInfo.StartItemNo, this.FData.SelectInfo.StartItemOffset);
    }

    UndoGroupEnd() {
        if (this.FUndoList.Enable)
            this.FUndoList.UndoGroupEnd(this.FData.SelectInfo.StartItemNo, this.FData.SelectInfo.StartItemOffset);
    }

    GetViewRect() {
        return TRect.CreateByBounds(this.paddingLeft, this.paddingTop, this.FViewWidth, this.FViewHeight);
    }

    UpdateView() {
        this.UpdateViewRect(this.GetViewRect());
    }

    UpdateViewRect(rect) {
        if (this.FStyle.States.contain(THCState.Destroying))
            return;

        if (this.FUpdateCount != 0)
            return;

        this.FDataBmpCanvas.save();
        try {
            this.FDataBmpCanvas.clipRect(rect);

            this.FDataBmpCanvas.brush.color = TColor.White;
            this.FDataBmpCanvas.fillRect(TRect.CreateByBounds(0, 0, this.FViewWidth, this.FViewHeight));

            let vPaintInfo = new TPaintInfo();
            this.FData.PaintData(this.paddingLeft - this.FHScrollBar.position,
                this.paddingTop,
                this.width - this.FHScrollBar.position - this.paddingRight,
                this.paddingTop + this.FData.height,
                this.paddingTop,
                this.height - this.FHScrollBar.height,
                this.FVScrollBar.position,
                this.FDataBmpCanvas,
                vPaintInfo);

            for (let i = 0; i < vPaintInfo.topItems.count; i++)
                vPaintInfo.TopItems[i].PaintTop(this.FDataBmpCanvas);
        } finally {
            this.FDataBmpCanvas.restore();
        }

        this.updateRect(rect);
    }

    BeginUpdate() {
        this.FUpdateCount++;
    }

    EndUpdate() {
        this.FUpdateCount--;
        this.DoMapChanged();
    }

    get CurStyleNo() {
        return this.GetCurStyleNo();
    }

    get CurParaNo() {
        return this.GetCurParaNo();
    }

    get Data() {
        return this.FData;
    }

    get Style() {
        return this.FStyle;
    }

    get Changed() {
        return this.FChanged;
    }

    set Changed(val) {
        this.FChanged = val;
    }

    get OnChange() {
        return this.FOnChange;
    }

    set OnChange(val) {
        this.FOnChange = val;
    }    
}