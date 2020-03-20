import { system } from "../hcl/System.js";
import { TCursors, TKey, TKeyEventArgs, TMouseButton, TMouseEventArgs } from "../hcl/Controls.js";
import { hcl } from "../hcl/Kernel.js";
import { HC, THCState, THCAction } from "./HCCommon.js";
import { TParaAlignHorz } from "./HCParaStyle.js";
import { THCTextRectItem, THCCustomRectItem } from "./HCRectItem.js";
import { THCStyle } from "./HCStyle.js";
import { THCTableItem } from "./HCTableItem.js";
import { THCUndoData } from "./HCUndoData.js";
import { THCUnitConversion } from "./HCUnitConversion.js";
import { THCTextItem } from "./HCTextItem.js";
import { THCImageItem } from "./HCImageItem.js";
import { THCTabItem } from "./HCTabItem.js";
import { THCLineItem } from "./HCLineItem.js";
import { THCExpressItem } from "./HCExpressItem.js";
import { THCCheckBoxItem } from "./HCCheckBoxItem.js";
import { THCGifItem } from "./HCGifItem.js";
import { THCEditItem } from "./HCEditItem.js";
import { THCComboboxItem } from "./HCComboboxItem.js";
import { THCQRCodeItem } from "./HCQRCodeItem.js";
import { THCBarCodeItem } from "./HCBarCodeItem.js";
import { THCFractionItem } from "./HCFractionItem.js";
import { THCDateTimePicker } from "./HCDateTimePicker.js";
import { THCRadioGroup } from "./HCRadioGroup.js";
import { THCSupSubScriptItem } from "./HCSupSubScriptItem.js";
import TImage from "../hcl/StdCtrls.js";

export class THCRichData extends THCUndoData {
    constructor(style) {
        super(style);

        this.FMouseLBDouble = false;
        this.FMouseDownReCaret = false;
        this.FMouseDownX = -1; 
        this.FMouseDownY = -1;
        this.FMouseMoveDrawItemNo = -1;
        this.FSelectSeekNo = -1;
        this.FSelectSeekOffset = -1;
        this.FOnItemResized = null;
        this.FOnItemMouseDown = null;
        this.FOnItemMouseUp = null;
        this.FOnCreateItem = null;
        this.FOnAcceptAction = null;
        this.FReadOnly = false;

        this.InitializeField();
        this.SetEmptyData();
    }

    SelectByMouseDownShift(mouseDownItemNo, mouseDownItemOffset) {
        let vResult = true;

        let vRange;
        let vSelItemNo = -1, vSelItemOffset = -1;
        if (this.SelectExists()) {
            if (this.IsSelectSeekStart()) {
                if ((mouseDownItemNo < this.FSelectSeekNo)
                    || ((mouseDownItemNo == this.FSelectSeekNo) && (mouseDownItemOffset < this.FSelectSeekOffset)))
                {
                    vSelItemNo = this.SelectInfo.EndItemNo;
                    vSelItemOffset = this.SelectInfo.EndItemOffset;
                    vRange = this.AdjustSelectRange(mouseDownItemNo, mouseDownItemOffset, vSelItemNo, vSelItemOffset);
                    mouseDownItemNo = vRange.startItemNo;
                    mouseDownItemOffset = vRange.startItemOffset;
                    vSelItemNo = vRange.endItemNo;
                    vSelItemOffset = vRange.endItemOffset;
                } else if (((mouseDownItemNo > this.FSelectSeekNo) && (mouseDownItemNo < this.SelectInfo.EndItemNo))
                        || ((mouseDownItemNo == this.FSelectSeekNo) && (mouseDownItemOffset > this.FSelectSeekOffset))
                        || ((mouseDownItemNo == this.SelectInfo.EndItemNo) && (mouseDownItemOffset < this.SelectInfo.EndItemOffset)))
                {
                    vSelItemNo = this.SelectInfo.EndItemNo;
                    vSelItemOffset = this.SelectInfo.EndItemOffset;

                    vRange = this.AdjustSelectRange(mouseDownItemNo, mouseDownItemOffset, vSelItemNo, vSelItemOffset);
                    mouseDownItemNo = vRange.startItemNo;
                    mouseDownItemOffset = vRange.startItemOffset;
                    vSelItemNo = vRange.endItemNo;
                    vSelItemOffset = vRange.endItemOffset;
                } else if ((mouseDownItemNo > this.SelectInfo.EndItemNo)
                    || ((mouseDownItemNo == this.SelectInfo.EndItemNo) && (mouseDownItemOffset > this.SelectInfo.EndItemOffset)))
                {
                    vSelItemNo = this.SelectInfo.EndItemNo;
                    vSelItemOffset = this.SelectInfo.EndItemOffset;
                    vRange = this.AdjustSelectRange(vSelItemNo, vSelItemOffset, mouseDownItemNo, mouseDownItemOffset);
                    vSelItemNo = vRange.startItemNo;
                    vSelItemOffset = vRange.startItemOffset;
                    mouseDownItemNo = vRange.endItemNo;
                    mouseDownItemOffset = vRange.endItemOffset;
                } else
                    vResult = false;
            } else {
                if ((mouseDownItemNo > this.FSelectSeekNo)
                    || ((mouseDownItemNo == this.FSelectSeekNo) && (mouseDownItemOffset > this.FSelectSeekOffset)))
                {
                    vSelItemNo = this.SelectInfo.StartItemNo;
                    vSelItemOffset = this.SelectInfo.StartItemOffset;
                    vRange = this.AdjustSelectRange(vSelItemNo, vSelItemOffset, mouseDownItemNo, mouseDownItemOffset);
                    vSelItemNo = vRange.startItemNo;
                    vSelItemOffset = vRange.startItemOffset;
                    mouseDownItemNo = vRange.endItemNo;
                    mouseDownItemOffset = vRange.endItemOffset;
                } else if (((mouseDownItemNo > this.SelectInfo.StartItemNo) && (mouseDownItemNo < this.FSelectSeekNo))
                            || ((mouseDownItemNo == this.FSelectSeekNo) && (mouseDownItemOffset < this.FSelectSeekOffset))
                            || ((mouseDownItemNo == this.SelectInfo.StartItemNo) && (mouseDownItemOffset > this.SelectInfo.StartItemOffset)))
                {
                    vSelItemNo = this.SelectInfo.StartItemNo;
                    vSelItemOffset = this.SelectInfo.StartItemOffset;
                    vRange = this.AdjustSelectRange(vSelItemNo, vSelItemOffset, mouseDownItemNo, mouseDownItemOffset);
                    vSelItemNo = vRange.startItemNo;
                    vSelItemOffset = vRange.startItemOffset;
                    mouseDownItemNo = vRange.endItemNo;
                    mouseDownItemOffset = vRange.endItemOffset;
                } else if ((mouseDownItemNo < this.SelectInfo.StartItemNo)
                        || ((mouseDownItemNo == this.SelectInfo.StartItemNo) && (mouseDownItemOffset < this.SelectInfo.StartItemOffset)))
                {
                    vSelItemNo = this.SelectInfo.StartItemNo;
                    vSelItemOffset = this.SelectInfo.StartItemOffset;
                    vRange = this.AdjustSelectRange(mouseDownItemNo, mouseDownItemOffset, vSelItemNo, vSelItemOffset);
                    mouseDownItemNo = vRange.startItemNo;
                    mouseDownItemOffset = vRange.startItemOffset;
                    vSelItemNo = vRange.endItemNo;
                    vSelItemOffset = vRange.endItemOffset;
                } else
                    vResult = false;
            }
        } else if (this.SelectInfo.StartItemNo >= 0) {
            if ((mouseDownItemNo < this.SelectInfo.StartItemNo)
                || ((mouseDownItemNo == this.SelectInfo.StartItemNo) && (mouseDownItemOffset < this.SelectInfo.StartItemOffset)))
            {
                vSelItemNo = this.SelectInfo.StartItemNo;
                vSelItemOffset = this.SelectInfo.StartItemOffset;
                vRange = this.AdjustSelectRange(mouseDownItemNo, mouseDownItemOffset, vSelItemNo, vSelItemOffset);
                mouseDownItemNo = vRange.startItemNo;
                mouseDownItemOffset = vRange.startItemOffset;
                vSelItemNo = vRange.endItemNo;
                vSelItemOffset = vRange.endItemOffset;
            } else if ((mouseDownItemNo > this.SelectInfo.StartItemNo)
                    || ((mouseDownItemNo == this.SelectInfo.StartItemNo) && (mouseDownItemOffset > this.SelectInfo.StartItemOffset)))
            {
                vSelItemNo = this.SelectInfo.StartItemNo;
                vSelItemOffset = this.SelectInfo.StartItemOffset;
                vRange = this.AdjustSelectRange(vSelItemNo, vSelItemOffset, mouseDownItemNo, mouseDownItemOffset);
                vSelItemNo = vRange.startItemNo;
                vSelItemOffset = vRange.startItemOffset;
                mouseDownItemNo = vRange.endItemNo;
                mouseDownItemOffset = vRange.endItemOffset;
            } else
                vResult = false;
        }

        return {
            itemNo: mouseDownItemNo,
            offset: mouseDownItemOffset,
            result: vResult
        }
    }

    SetEmptyData() {
        if (this.Items.count == 0) {
            let vItem = this.CreateDefaultTextItem();
            vItem.ParaFirst = true;
            this.Items.add(vItem);
            this.ReFormat();
        }
    }

    EmptyDataInsertItem(item) {
        if ((item.StyleNo > THCStyle.Null) && (item.Text == ""))
            return false;

        item.ParaNo = this.Items[0].ParaNo;
        this.UndoAction_DeleteItem(0, 0);
        this.Items.clear();
        this.DrawItems.clear();
        item.ParaFirst = true;
        this.Items.add(item);
        this.UndoAction_InsertItem(0, 0);
        this.SelectInfo.StartItemOffset = this.GetItemOffsetAfter(0);
        this.ReFormat();
        return true;
    }

    SelectPerfect() {
        if (this.SelectInfo.EndItemNo >= 0) {
            for (let i = this.SelectInfo.StartItemNo; i <= this.SelectInfo.EndItemNo; i++) {
                if ((this.Items[i].StyleNo < THCStyle.Null) && !this.Items[i].IsSelectComplate)
                    return false;
            }
        }

        return true;
    }

    RectItemAction(action) {
        let vResult = false;
        let vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
        let vCurItemNo = this.GetActiveItemNo();
        if (this.Items[vCurItemNo].isClass(THCCustomRectItem)) {
            let vRange = this.GetFormatRangeByOffset(vCurItemNo, 1, vFormatFirstDrawItemNo, vFormatLastItemNo);
            vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
            vFormatLastItemNo = vRange.lastItemNo;
            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

            this.Undo_New();
            if (this.Items[vCurItemNo].MangerUndo)
                this.UndoAction_ItemSelf(this.SelectInfo.StartItemNo, HC.OffsetInner);
            else
                this.UndoAction_ItemMirror(this.SelectInfo.StartItemNo, HC.OffsetInner);

            this.vResult = action(this.Items[vCurItemNo]);
            if (vResult) {
                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo, 0);
                this.Style.updateInfoRePaint();
                this.Style.updateInfoReCaret();
            }

            this.InitializeMouseField();
        }

        return vResult;
    }

    TextItemAction(action) {
        let vResult = false;
        let vCurItemNo = this.GetActiveItemNo();
        let vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
        if (this.Items[vCurItemNo].isClass(THCTextItem)) {
            let vInfo = this.GetFormatRange(vCurItemNo, 1);
            vFormatFirstDrawItemNo = vInfo.firstDrawItemNo;
            vFormatLastItemNo = vInfo.lastItemNo;

            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

            this.Undo_New();
            this.UndoAction_ItemMirror(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);

            //UndoAction_ItemSelf(vCurItemNo, OffsetInner);
            vResult = action(this.Items[vCurItemNo]);
            if (vResult) {
                this. ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo, 0);
                //DisSelect;
                this.Style.updateInfoRePaint();
                this.Style.updateInfoReCaret();
            }

            this.InitializeMouseField();
        }

        return vResult;
    }

    InitializeMouseField() {
        this.FMouseLBDowning = false;
        this.FMouseDownItemNo = -1;
        this.FMouseDownItemOffset = -1;
        this.FMouseMoveItemNo = -1;
        this.FMouseMoveItemOffset = -1;
        this.FMouseMoveRestrain = false;
        this.FSelecting = false;
        this.FDraging = false;
    }

    IsSelectSeekStart() {
        return (this.FSelectSeekNo == this.SelectInfo.StartItemNo)
            && (this.FSelectSeekOffset == this.SelectInfo.StartItemOffset);
    }

    AdjustSelectRange(startItemNo, startItemOffset, endItemNo, endItemNoOffset) {
        let vLeftToRight = false;
        let vOldStartItemNo = this.SelectInfo.StartItemNo;
        let vOldEndItemNo = this.SelectInfo.EndItemNo;

        if (startItemNo < endItemNo) {
            vLeftToRight = true;

            if (startItemOffset == this.GetItemOffsetAfter(startItemNo)) {
                if (startItemNo < this.Items.count - 1) {
                    startItemNo = startItemNo + 1;
                    startItemOffset = 0;
                }
            }

            if ((startItemNo != endItemNo) && (endItemNo >= 0) && (endItemNoOffset == 0)) {
                this.Items[endItemNo].DisSelect();

                endItemNo = endItemNo - 1;
                endItemNoOffset = this.GetItemOffsetAfter(endItemNo);
            }
        } else if (endItemNo < startItemNo) {
            vLeftToRight = false;

            if ((startItemNo > 0) && (startItemOffset == 0)) {
                startItemNo = startItemNo - 1;
                startItemOffset = this.GetItemOffsetAfter(startItemNo);
            }

            if ((startItemNo != endItemNo) && (endItemNoOffset == this.GetItemOffsetAfter(endItemNo))) {
                this.Items[endItemNo].DisSelect();

                if (endItemNo < this.Items.count - 1) {
                    endItemNo = endItemNo + 1;
                    endItemNoOffset = 0;
                }
            }
        }

        if (startItemNo == endItemNo) {
            if (endItemNoOffset > startItemOffset) {
                if (this.Items[startItemNo].StyleNo < THCStyle.Null) {
                    this.SelectInfo.StartItemNo = startItemNo;
                    this.SelectInfo.StartItemOffset = startItemOffset;

                    if ((startItemOffset == HC.OffsetBefor) && (endItemNoOffset == HC.OffsetAfter)) {
                        this.SelectInfo.EndItemNo = endItemNo;
                        this.SelectInfo.EndItemOffset = endItemNoOffset;
                    } else {
                        this.SelectInfo.EndItemNo = -1;
                        this.SelectInfo.EndItemOffset = -1;
                    }
                } else {
                    this.SelectInfo.StartItemNo = startItemNo;
                    this.SelectInfo.StartItemOffset = startItemOffset;
                    this.SelectInfo.EndItemNo = startItemNo;
                    this.SelectInfo.EndItemOffset = endItemNoOffset;
                }
            } else if (endItemNoOffset < startItemOffset) {
                if (this.Items[startItemNo].StyleNo < THCStyle.Null) {
                    if (endItemNoOffset == HC.OffsetBefor) {
                        this.SelectInfo.StartItemNo = startItemNo;
                        this.SelectInfo.StartItemOffset = endItemNoOffset;
                        this.SelectInfo.EndItemNo = startItemNo;
                        this.SelectInfo.EndItemOffset = startItemOffset;
                    } else {
                        this.SelectInfo.StartItemNo = startItemNo;
                        this.SelectInfo.StartItemOffset = startItemOffset;
                        this.SelectInfo.EndItemNo = -1;
                        this.SelectInfo.EndItemOffset = -1;
                    }
                } else {
                    this.SelectInfo.StartItemNo = endItemNo;
                    this.SelectInfo.StartItemOffset = endItemNoOffset;
                    this.SelectInfo.EndItemNo = endItemNo;
                    this.SelectInfo.EndItemOffset = startItemOffset;
                }
            } else {
                if (this.SelectInfo.EndItemNo >= 0)
                    this.Items[this.SelectInfo.EndItemNo].DisSelect();

                this.SelectInfo.StartItemNo = startItemNo;
                this.SelectInfo.StartItemOffset = startItemOffset;
                this.SelectInfo.EndItemNo = -1;
                this.SelectInfo.EndItemOffset = -1;
            }
        } else {
            if (vLeftToRight) {
                this.SelectInfo.StartItemNo = startItemNo;
                this.SelectInfo.StartItemOffset = startItemOffset;
                this.SelectInfo.EndItemNo = endItemNo;
                this.SelectInfo.EndItemOffset = endItemNoOffset;
            } else {
                this.SelectInfo.StartItemNo = endItemNo;
                this.SelectInfo.StartItemOffset = endItemNoOffset;
                this.SelectInfo.EndItemNo = startItemNo;
                this.SelectInfo.EndItemOffset = startItemOffset;
            }
        }

        if (vOldStartItemNo >= 0) {
            if (vOldStartItemNo > this.SelectInfo.StartItemNo) {
                for (let i = vOldStartItemNo; i >= this.SelectInfo.StartItemNo + 1; i--)
                    this.Items[i].DisSelect();
            } else {
                for (let i = vOldStartItemNo; i <= this.SelectInfo.StartItemNo - 1; i++)
                    this.Items[i].DisSelect();
            }
        }

        if (this.SelectInfo.EndItemNo < 0) {
            for (let i = vOldEndItemNo; i >= this.SelectInfo.StartItemNo + 1; i--)
                this.Items[i].DisSelect();
        } else {
            for (let i = vOldEndItemNo; i >= this.SelectInfo.EndItemNo + 1; i--)
                this.Items[i].DisSelect();
        }

        return {
            startItemNo: startItemNo,
            startItemOffset: startItemOffset,
            endItemNo: endItemNo,
            endItemOffset: endItemNoOffset
        }
    }

    DoLoadFromStream(stream, style, fileVersion) {
        if (!this.CanEdit())
            return;

        super.DoLoadFromStream(stream, style, fileVersion);
        this.BeginFormat();
        try {
            this.InsertStream(stream, style, fileVersion);
            this.ReSetSelectAndCaretByOffset(0, 0);
        } finally {
            this.EndFormat();
        }
    }

    DoAcceptAction(itemNo, offset, action) {
        let vResult = this.CanEdit();
        if (vResult)
            this.Items[itemNo].AcceptAction(offset, this.SelectInfo.StartRestrain, action);
        
        if (vResult && (this.FOnAcceptAction != null))
            vResult = this.FOnAcceptAction(this, itemNo, offset, action);

        return vResult;
    }

    CheckInsertItemCount(startNo, endNo) {
        return endNo - startNo + 1;
    }

    DoItemMouseLeave(itemNo) {
        this.Items[itemNo].MouseLeave();
    }

    DoItemMouseEnter(itemNo) {
        this.Items[itemNo].MouseEnter();
    }

    DoItemResized(itemNo) {
        if (this.FOnItemResized != null)
            this.FOnItemResized(this, itemNo);
    }

    GetHeight() {
        return this.CalcContentHeight();
    }

    SetReadOnly(val) {
        this.FReadOnly = val;
    }

    get MouseMoveDrawItemNo() {
        return this.FMouseMoveDrawItemNo;
    }

    CreateItemByStyle(styleNo) {
        let vResult = null;
        if (styleNo < THCStyle.Null) {
            switch (styleNo) {
                case THCStyle.Image:
                    vResult = new THCImageItem(this, 0, 0);
                    break;

                case THCStyle.Table:
                    vResult = new THCTableItem(this, 1, 1, 1);
                    break;

                case THCStyle.Tab:
                    vResult = new THCTabItem(this, 0, 0);
                    break;

                case THCStyle.Line:
                    vResult = new THCLineItem(this, 1, 1);
                    break;

                case THCStyle.Express:
                    vResult = new THCExpressItem(this, "", "", "", "");
                    break;

                case THCStyle.Domain:
                    vResult = this.CreateDefaultDomainItem();
                    break;

                case THCStyle.CheckBox:
                    vResult = new THCCheckBoxItem(this, "勾选框", false);
                    break;

                case THCStyle.Gif:
                    vResult = new THCGifItem(this, 1, 1);
                    break;

                case THCStyle.Edit:
                    vResult = new THCEditItem(this, "");
                    break;

                case THCStyle.Combobox:
                    vResult = new THCComboboxItem(this, "");
                    break;

                case THCStyle.QRCode:
                    vResult = new THCQRCodeItem(this, "");
                    break;

                case THCStyle.BarCode:
                    vResult = new THCBarCodeItem(this, "");
                    break;

                case THCStyle.Fraction:
                    vResult = new THCFractionItem(this, "", "");
                    break;

                case THCStyle.DateTimePicker:
                    vResult = new THCDateTimePicker(this, DateTime.Now);
                    break;

                case THCStyle.RadioGroup:
                    vResult = new THCRadioGroup(this);
                    break;

                case THCStyle.SupSubScript:
                    vResult = new THCSupSubScriptItem(this, "", "");
                    break;

                default:
                    throw "未找到类型 " + styleNo.ToString() + " 对应的创建Item代码！";
            }
        } else {
            vResult = this.CreateDefaultTextItem();
            vResult.StyleNo = styleNo;
        }

        if (this.FOnCreateItem != null)
            this.FOnCreateItem(vResult);

        return vResult;
    }

    CanEdit() {
        let vResult = !this.FReadOnly;
        if (!vResult)
            system.beep(0);

        return vResult;
    }

    clear() {
        this.InitializeField();

        super.clear();
        this.SetEmptyData();
    }

    ApplySameItem(itemNo, vExtraCount, matchStyle) {
        let vItem = this.Items[itemNo];
        if (vItem.StyleNo < THCStyle.Null) {
            if (vItem.MangerUndo)
                this.UndoAction_ItemSelf(itemNo, HC.OffsetInner);
            else
                this.UndoAction_ItemMirror(itemNo, HC.OffsetInner);

            vItem.ApplySelectTextStyle(this.Style, matchStyle);
        } else {
            let vStyleNo = matchStyle.GetMatchStyleNo(this.Style, vItem.StyleNo);
            this.CurStyleNo = vStyleNo;
            if (vItem.IsSelectComplate) {
                this.UndoAction_ItemStyle(itemNo, this.SelectInfo.EndItemOffset, vStyleNo);
                vItem.StyleNo = vStyleNo;  // 直接修改样式编号

                if (this.MergeItemToNext(itemNo)) {
                    this.UndoAction_InsertText(itemNo, this.Items[itemNo].length - this.Items[itemNo + 1].length + 1, this.Items[itemNo + 1].Text);
                    this.UndoAction_DeleteItem(itemNo + 1, 0);
                    this.Items.delete(itemNo + 1);
                    vExtraCount--;
                }

                if (itemNo > 0) {
                    let vLen = this.Items[itemNo - 1].length;
                    if (this.MergeItemToPrio(itemNo)) {
                        this.UndoAction_InsertText(itemNo - 1, this.Items[itemNo - 1].length - this.Items[itemNo].length + 1, this.Items[itemNo].Text);
                        this.UndoAction_DeleteItem(itemNo, 0);
                        this.Items.delete(itemNo);
                        vExtraCount--;

                        this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                        this.SelectInfo.StartItemOffset = vLen;
                        this.SelectInfo.EndItemNo = this.SelectInfo.StartItemNo;
                        this.SelectInfo.EndItemOffset = vLen + this.SelectInfo.EndItemOffset;
                    }
                }
            } else {
                let vText = vItem.Text;
                let vSelText = vText.substr(this.SelectInfo.StartItemOffset + 1 - 1,  // 选中的文本
                    this.SelectInfo.EndItemOffset - this.SelectInfo.StartItemOffset);
                let vsBefor = vText.substr(1 - 1, this.SelectInfo.StartItemOffset);  // 前半部分文本
                let vAfterItem = this.Items[itemNo].BreakByOffset(this.SelectInfo.EndItemOffset);  // 后半部分对应的Item
                if (vAfterItem != null) {
                    this.UndoAction_DeleteText(itemNo, this.SelectInfo.EndItemOffset + 1, vAfterItem.Text);

                    this.Items.insert(itemNo + 1, vAfterItem);
                    this.UndoAction_InsertItem(itemNo + 1, 0);
                    vExtraCount++;
                }

                if (vsBefor != "") {
                    this.UndoAction_DeleteText(itemNo, this.SelectInfo.StartItemOffset + 1, vSelText);
                    vItem.Text = vsBefor;  // 保留前半部分文本

                    // 创建选中文本对应的Item
                    let vSelItem = this.CreateDefaultTextItem();
                    vSelItem.ParaNo = vItem.ParaNo;
                    vSelItem.StyleNo = vStyleNo;
                    vSelItem.Text = vSelText;

                    if (vAfterItem != null) {
                        this.Items.insert(itemNo + 1, vSelItem);
                        this.UndoAction_InsertItem(itemNo + 1, 0);
                        vExtraCount++;
                    } else {
                        if ((itemNo < this.Items.count - 1)
                            && (!this.Items[itemNo + 1].ParaFirst)
                            && this.MergeItemText(vSelItem, this.Items[itemNo + 1]))
                        {
                            this.UndoAction_InsertText(itemNo + 1, 1, vSelText);
                            this.Items[itemNo + 1].Text = vSelText + this.Items[itemNo + 1].Text;
                            vSelItem.Dispose();

                            this.SelectInfo.StartItemNo = itemNo + 1;
                            this.SelectInfo.StartItemOffset = 0;
                            this.SelectInfo.EndItemNo = itemNo + 1;
                            this.SelectInfo.EndItemOffset = vSelText.length;

                            return;
                        }

                        this.Items.insert(itemNo + 1, vSelItem);
                        this.UndoAction_InsertItem(itemNo + 1, 0);
                        vExtraCount++;
                    }

                    this.SelectInfo.StartItemNo = itemNo + 1;
                    this.SelectInfo.StartItemOffset = 0;
                    this.SelectInfo.EndItemNo = itemNo + 1;
                    this.SelectInfo.EndItemOffset = vSelText.length;
                } else {
                    this.UndoAction_ItemStyle(itemNo, this.SelectInfo.EndItemOffset, vStyleNo);
                    vItem.StyleNo = vStyleNo;

                    if (this.MergeItemToPrio(itemNo)) {
                        this.UndoAction_InsertText(itemNo - 1, this.Items[itemNo - 1].length - this.Items[itemNo].length + 1, this.Items[itemNo].Text);
                        this.UndoAction_DeleteItem(itemNo, 0);
                        this.Items.delete(itemNo);
                        vExtraCount--;

                        this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                        let vLen = this.Items[this.SelectInfo.StartItemNo].length;
                        this.SelectInfo.StartItemOffset = vLen - vSelText.length;
                        this.SelectInfo.EndItemNo = this.SelectInfo.StartItemNo;
                        this.SelectInfo.EndItemOffset = vLen;
                    }
                }
            }
        }

        return vExtraCount;
    }

    ApplyRangeStartItem(itemNo, vExtraCount, matchStyle) {
        let vItem = this.Items[itemNo];
        if (vItem.StyleNo < THCStyle.Null) {
            if (vItem.MangerUndo)
                this.UndoAction_ItemSelf(itemNo, this.SelectInfo.StartItemOffset);
            else
                this.UndoAction_ItemMirror(itemNo, this.SelectInfo.StartItemOffset);

            vItem.ApplySelectTextStyle(this.Style, matchStyle);
        } else {
            let vStyleNo = matchStyle.GetMatchStyleNo(this.Style, vItem.StyleNo);
            if (vItem.StyleNo != vStyleNo) {
                if (vItem.IsSelectComplate) {
                    this.UndoAction_ItemStyle(itemNo, 0, vStyleNo);
                    vItem.StyleNo = vStyleNo;
                } else {
                    let vAfterItem = this.Items[itemNo].BreakByOffset(this.SelectInfo.StartItemOffset);  // 后半部分对应的Item
                    this.UndoAction_DeleteText(itemNo, this.SelectInfo.StartItemOffset + 1, vAfterItem.Text);

                    this.Items.insert(itemNo + 1, vAfterItem);
                    this.UndoAction_InsertItem(itemNo + 1, 0);

                    this.UndoAction_ItemStyle(itemNo + 1, 0, vStyleNo);
                    vAfterItem.StyleNo = vStyleNo;

                    vExtraCount++;

                    this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                    this.SelectInfo.StartItemOffset = 0;
                    this.SelectInfo.EndItemNo = this.SelectInfo.EndItemNo + 1;
                }
            }
        }

        return vExtraCount;
    }
    
    ApplyRangeEndItem(itemNo, vExtraCount, matchStyle) {
        let vItem = this.Items[itemNo];
        if (vItem.StyleNo < THCStyle.Null) {
            if (vItem.MangerUndo)
                this.UndoAction_ItemSelf(itemNo, this.SelectInfo.EndItemOffset);
            else
                this.UndoAction_ItemMirror(itemNo, this.SelectInfo.EndItemOffset);

            vItem.ApplySelectTextStyle(this.Style, matchStyle);
        } else {
            let vStyleNo = matchStyle.GetMatchStyleNo(this.Style, vItem.StyleNo);

            if (vItem.StyleNo != vStyleNo) {
                if (vItem.IsSelectComplate) {
                    this.UndoAction_ItemStyle(itemNo, this.SelectInfo.EndItemOffset, vStyleNo);
                    vItem.StyleNo = vStyleNo;
                } else {
                    let vText = vItem.Text;
                    let vSelText = vText.substr(1 - 1, this.SelectInfo.EndItemOffset); // 选中的文本
                    this.UndoAction_DeleteBackText(itemNo, 1, vSelText);
                    vItem.Text = vText.delete(1 - 1, this.SelectInfo.EndItemOffset);

                    let vBeforItem = this.CreateDefaultTextItem();
                    vBeforItem.ParaNo = vItem.ParaNo;
                    vBeforItem.StyleNo = vStyleNo;
                    vBeforItem.Text = vSelText;  // 创建前半部分文本对应的Item
                    vBeforItem.ParaFirst = vItem.ParaFirst;
                    vItem.ParaFirst = false;

                    this.Items.insert(itemNo, vBeforItem);
                    this.UndoAction_InsertItem(itemNo, 0);
                    vExtraCount++;
                }
            }
        }

        return vExtraCount;
    }
    
    ApplyRangeNorItem(itemNo, matchStyle) {
        let vItem = this.Items[itemNo];
        if (vItem.StyleNo < THCStyle.Null) {
            if (vItem.MangerUndo)
                this.UndoAction_ItemSelf(itemNo, HC.OffsetInner);
            else
                this.UndoAction_ItemMirror(itemNo, HC.OffsetInner);

            vItem.ApplySelectTextStyle(this.Style, matchStyle);
        } else {
            let vNewStyleNo = matchStyle.GetMatchStyleNo(this.Style, vItem.StyleNo);
            this.UndoAction_ItemStyle(itemNo, 0, vNewStyleNo);
            vItem.StyleNo = vNewStyleNo;
        }
    }

    ApplySelectTextStyle(matchStyle) {
        this.Undo_New();

        this.InitializeField();
        let vExtraCount = 0, vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
        let vRange;

        if (!this.SelectExists()) {
            if (this.CurStyleNo > THCStyle.Null) {
                matchStyle.Append = !matchStyle.StyleHasMatch(this.Style, this.CurStyleNo);  // 根据当前判断是添加样式还是减掉样式
                this.CurStyleNo = matchStyle.GetMatchStyleNo(this.Style, this.CurStyleNo);

                this.Style.updateInfoRePaint();
                if (this.Items[this.SelectInfo.StartItemNo].length == 0) {
                    vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                    vFormatLastItemNo = vRange.lastItemNo;
                    this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                    this.UndoAction_ItemStyle(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, this.CurStyleNo);
                    this.Items[this.SelectInfo.StartItemNo].StyleNo = this.CurStyleNo;

                    this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    this.Style.updateInfoReCaret();
                } else {
                    if (this.Items[this.SelectInfo.StartItemNo].isClass(THCTextRectItem)) {
                        vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                        vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                        vFormatLastItemNo = vRange.lastItemNo;
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                        this.Items[this.SelectInfo.StartItemNo].TextStyleNo = this.CurStyleNo;
                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    }

                    this.Style.updateInfoReCaret(false);
                }
            }

            this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
            return;
        }

        if (this.SelectInfo.EndItemNo < 0) {
            if (this.Items[this.SelectInfo.StartItemNo].StyleNo < THCStyle.Null) {
                if (this.Items[this.SelectInfo.StartItemNo].MangerUndo)
                    this.UndoAction_ItemSelf(this.SelectInfo.StartItemNo, HC.OffsetInner);
                else
                    this.UndoAction_ItemMirror(this.SelectInfo.StartItemNo, HC.OffsetInner);

                this.Items[this.SelectInfo.StartItemNo].ApplySelectTextStyle(this.Style, matchStyle);
                if (this.Items[this.SelectInfo.StartItemNo].SizeChanged) {
                    vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                    vFormatLastItemNo = vRange.lastItemNo;
                    this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    this.Items[this.SelectInfo.StartItemNo].SizeChanged = false;
                } else
                    this.FormatInit();
            }
        } else {
            vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
            vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
            vFormatLastItemNo = vRange.lastItemNo;
            if (this.SelectInfo.StartItemNo != this.SelectInfo.EndItemNo)
                vFormatLastItemNo = this.GetParaLastItemNo(this.SelectInfo.EndItemNo);
                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
            for (let i = this.SelectInfo.StartItemNo; i <= this.SelectInfo.EndItemNo; i++) {
                if (this.Items[i].StyleNo > THCStyle.Null) {
                    matchStyle.Append = !matchStyle.StyleHasMatch(this.Style, this.Items[i].StyleNo);
                    break;
                } else {
                    if (this.Items[i].isClass(THCTextRectItem)) {
                        matchStyle.Append = !matchStyle.StyleHasMatch(this.Style, this.Items[i].TextStyleNo);
                        break;
                    }
                }
            }

            if (this.SelectInfo.StartItemNo == this.SelectInfo.EndItemNo)
                vExtraCount = this.ApplySameItem(this.SelectInfo.StartItemNo, vExtraCount, matchStyle);
            else {
                vExtraCount = this.ApplyRangeEndItem(this.SelectInfo.EndItemNo, vExtraCount, matchStyle);
                for (let i = this.SelectInfo.EndItemNo - 1; i >= this.SelectInfo.StartItemNo + 1; i--)
                    this.ApplyRangeNorItem(i, matchStyle);
                    
                vExtraCount = this.ApplyRangeStartItem(this.SelectInfo.StartItemNo, vExtraCount, matchStyle);
                if (this.SelectInfo.EndItemNo < vFormatLastItemNo + vExtraCount) {
                    if (this.MergeItemToNext(this.SelectInfo.EndItemNo)) {
                        this.UndoAction_InsertText(this.SelectInfo.EndItemNo,
                            this.Items[this.SelectInfo.EndItemNo].length - this.Items[this.SelectInfo.EndItemNo + 1].length + 1,
                            this.Items[this.SelectInfo.EndItemNo + 1].Text);

                        this.UndoAction_DeleteItem(this.SelectInfo.EndItemNo + 1, 0);
                        this.Items.delete(this.SelectInfo.EndItemNo + 1);
                        vExtraCount--;
                    }
                }

                let vLen = -1;
                for (let i = this.SelectInfo.EndItemNo; i >= this.SelectInfo.StartItemNo + 1; i--) {
                    vLen = this.Items[i - 1].length;
                    if (this.MergeItemToPrio(i)) {
                        this.UndoAction_InsertText(i - 1, this.Items[i - 1].length - this.Items[i].length + 1, this.Items[i].Text);
                        this.UndoAction_DeleteItem(i, 0);
                        this.Items.delete(i);
                        vExtraCount--;

                        if (i == this.SelectInfo.EndItemNo)
                            this.SelectInfo.EndItemOffset = this.SelectInfo.EndItemOffset + vLen;

                        this.SelectInfo.EndItemNo = this.SelectInfo.EndItemNo - 1;
                    }
                }

                if ((this.SelectInfo.StartItemNo > 0) && (!this.Items[this.SelectInfo.StartItemNo].ParaFirst)) {
                    vLen = this.Items[this.SelectInfo.StartItemNo - 1].length;
                    if (this.MergeItemToPrio(this.SelectInfo.StartItemNo)) {
                        this.UndoAction_InsertText(this.SelectInfo.StartItemNo - 1,
                            this.Items[this.SelectInfo.StartItemNo - 1].length - this.Items[this.SelectInfo.StartItemNo].length + 1,
                            this.Items[this.SelectInfo.StartItemNo].Text);

                        this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, 0);
                        this.Items.delete(this.SelectInfo.StartItemNo);
                        vExtraCount--;

                        this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                        this.SelectInfo.StartItemOffset = vLen;
                        this.SelectInfo.EndItemNo = this.SelectInfo.EndItemNo - 1;
                        if (this.SelectInfo.StartItemNo == this.SelectInfo.EndItemNo)
                            this.SelectInfo.EndItemOffset = this.SelectInfo.EndItemOffset + vLen;
                    }
                }
            }

            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo + vExtraCount, vExtraCount);
        }

        this.MatchItemSelectState();
        this.Style.updateInfoRePaint();
        this.Style.updateInfoReCaret();
    }

    DoApplyParagraphStyle(itemNo, matchStyle) {
        let vFirstNo = -1, vLastNo = -1;
        let vItemRang = this.GetParaItemRang(itemNo, vFirstNo, vLastNo);
        vFirstNo = vItemRang.a;
        vLastNo = vItemRang.b;
        let vParaNo = matchStyle.GetMatchParaNo(this.Style, this.GetItemParaStyle(itemNo));

        if (this.GetItemParaStyle(vFirstNo) != vParaNo) {
            this.UndoAction_ItemParaNo(vFirstNo, 0, vParaNo);
            for (let i = vFirstNo; i <= vLastNo; i++)
                this.Items[i].ParaNo = vParaNo;
        }
    }

    ApplyParagraphSelecteStyle(matchStyle) {
        let vFirstNo = -1, vLastNo = -1;
        let vItemRang = this.GetParaItemRang(this.SelectInfo.StartItemNo, vFirstNo, vLastNo);
        vFirstNo = vItemRang.a;
        vLastNo = vItemRang.b;
        this.DoApplyParagraphStyle(this.SelectInfo.StartItemNo, matchStyle);

        let i = vLastNo + 1;
        while (i <= this.SelectInfo.EndItemNo) {
            if (this.Items[i].ParaFirst)
            this.DoApplyParagraphStyle(i, matchStyle);

            i++;
        }
    }

    ApplySelectParaStyle(matchStyle) {
        if (this.SelectInfo.StartItemNo < 0)
            return;

        let vFormatFirstDrawItemNo = -1;
        let vFormatLastItemNo = -1;

        this.Undo_New();
        if (this.SelectInfo.EndItemNo >= 0) {
            vFormatFirstDrawItemNo = this.Items[this.GetParaFirstItemNo(this.SelectInfo.StartItemNo)].FirstDItemNo;
            vFormatLastItemNo = this.GetParaLastItemNo(this.SelectInfo.EndItemNo);
            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
            this.ApplyParagraphSelecteStyle(matchStyle);
            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
        } else {
            if ((this.GetItemStyle(this.SelectInfo.StartItemNo) < THCStyle.Null) && (this.SelectInfo.StartItemOffset == HC.OffsetInner)) {
                if (this.Items[this.SelectInfo.StartItemNo].MangerUndo)
                    this.UndoAction_ItemSelf(this.SelectInfo.StartItemNo, HC.OffsetInner);
                else
                    this.UndoAction_ItemMirror(this.SelectInfo.StartItemNo, HC.OffsetInner);

                vFormatFirstDrawItemNo = this.Items[this.SelectInfo.StartItemNo].FirstDItemNo;
                this.FormatPrepare(vFormatFirstDrawItemNo, this.SelectInfo.StartItemNo);
                this.Items[this.SelectInfo.StartItemNo].ApplySelectParaStyle(this.Style, matchStyle);
                this.ReFormatData(vFormatFirstDrawItemNo, this.SelectInfo.StartItemNo);
            } else {
                vFormatFirstDrawItemNo = this.Items[this.GetParaFirstItemNo(this.SelectInfo.StartItemNo)].FirstDItemNo;
                vFormatLastItemNo = this.GetParaLastItemNo(this.SelectInfo.StartItemNo);
                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                this.DoApplyParagraphStyle(this.SelectInfo.StartItemNo, matchStyle);  // 应用样式
                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
            }
        }

        this.Style.updateInfoRePaint();
        this.Style.updateInfoReCaret();
    }

    ApplyTableCellAlign(align) {
        if (!this.CanEdit()) 
            return;

        this.RectItemAction((rectItem) => {
            rectItem.ApplyContentAlign(align);
            return true;
        });
    }

    DisSelect() {
        let vResult = super.DisSelect();
        if (vResult) {
            // 拖拽完成时清除
            this.FDraging = false;  // 拖拽完成
            this.FSelecting = false;  // 准备划选
            this.Style.updateInfoRePaint();
        }
        
        this.Style.updateInfoReCaret();  // 选择起始信息被重置为-1
        return vResult;
    }

    DeleteItemSelectComplate(vDelCount, vParaFirstItemNo, vParaLastItemNo, vFormatFirstItemNo, vFormatLastItemNo) {
        if (!this.DoAcceptAction(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, THCAction.DeleteItem))
            return {
                delCount: vDelCount,
                result: false
            }

        this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, 0);
        this.Items.delete(this.SelectInfo.StartItemNo);

        vDelCount++;

        if ((this.SelectInfo.StartItemNo > vFormatFirstItemNo) && (this.SelectInfo.StartItemNo < vFormatLastItemNo)) {
            let vLen = this.Items[this.SelectInfo.StartItemNo - 1].length;
            if (this.MergeItemText(this.Items[this.SelectInfo.StartItemNo - 1], this.Items[this.SelectInfo.StartItemNo])) {
                this.UndoAction_InsertText(this.SelectInfo.StartItemNo - 1, vLen + 1, this.Items[this.SelectInfo.StartItemNo].Text);
                this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, 0);
                this.Items.delete(this.SelectInfo.StartItemNo);
                vDelCount++;

                this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                this.SelectInfo.StartItemOffset = vLen;
            } else {
                this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                this.SelectInfo.StartItemOffset = this.GetItemOffsetAfter(this.SelectInfo.StartItemNo);
            }
        } else {
            if (this.SelectInfo.StartItemNo == vParaFirstItemNo) {
                if (vParaFirstItemNo == vParaLastItemNo) {
                    let vNewItem = this.CreateDefaultTextItem();
                    this.CurStyleNo = vNewItem.StyleNo;
                    vNewItem.ParaFirst = true;
                    this.Items.insert(this.SelectInfo.StartItemNo, vNewItem);
                    this.UndoAction_InsertItem(this.SelectInfo.StartItemNo, 0);

                    this.SelectInfo.StartItemOffset = 0;
                    vDelCount--;
                } else {
                    this.SelectInfo.StartItemOffset = 0;

                    this.UndoAction_ItemParaFirst(this.SelectInfo.StartItemNo, 0, true);
                    this.Items[this.SelectInfo.StartItemNo].ParaFirst = true;
                }
            } else {
                if (this.SelectInfo.StartItemNo == vParaLastItemNo) {
                    this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                    this.SelectInfo.StartItemOffset = this.GetItemOffsetAfter(this.SelectInfo.StartItemNo);
                } else {
                    if (this.SelectInfo.StartItemNo > 0) {
                        let vLen = this.Items[this.SelectInfo.StartItemNo - 1].length;
                        if (this.MergeItemText(this.Items[this.SelectInfo.StartItemNo - 1], this.Items[this.SelectInfo.StartItemNo])) {
                            this.UndoAction_InsertText(this.SelectInfo.StartItemNo - 1, vLen + 1, this.Items[this.SelectInfo.StartItemNo].Text);
                            this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, 0);
                            this.Items.delete(this.SelectInfo.StartItemNo);
                            vDelCount++;
                            this.SelectInfo.StartItemOffset = vLen;
                        }

                        this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                        this.SelectInfo.StartItemOffset = this.GetItemOffsetAfter(this.SelectInfo.StartItemNo);
                    }
                }
            }
        }

        return {
            delCount: vDelCount,
            result: false
        }
    }

    DeleteSelected() {
        if (!this.CanEdit())
            return false;

        if (!this.SelectPerfect()) {
            this.DisSelect();
            return false;
        }

        if (!this.SelectExists())
            return true;

        let vResult = false;
        let vSelectSeekStart = this.IsSelectSeekStart();

        let vDelCount = 0;
        this.InitializeField();  // 删除后原鼠标处可能已经没有了

        let vFormatFirstDrawItemNo = -1, vFormatFirstItemNo = -1, vFormatLastItemNo = -1,
            vParaFirstItemNo = -1, vParaLastItemNo = -1, vRange;

        if ((this.SelectInfo.EndItemNo < 0) && (this.Items[this.SelectInfo.StartItemNo].StyleNo < THCStyle.Null)) {
            vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
            vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
            vFormatLastItemNo = vRange.lastItemNo;
            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
            if (this.FormatCount > 0)
                vFormatFirstItemNo = this.SelectInfo.StartItemNo;
            else
                vFormatFirstItemNo = this.DrawItems[vFormatFirstDrawItemNo].ItemNo;

            this.Undo_New();

            if (this.Items[this.SelectInfo.StartItemNo].IsSelectComplateTheory()) {
                let vItemRang = this.GetParaItemRang(this.SelectInfo.StartItemNo, vParaFirstItemNo, vParaLastItemNo);
                vParaFirstItemNo = vItemRang.a;
                vParaLastItemNo = vItemRang.b;
                let vDelInfo = this.DeleteItemSelectComplate(vDelCount, vParaFirstItemNo, vParaLastItemNo,
                    vFormatFirstItemNo, vFormatLastItemNo);

                vDelCount = vDelInfo.delCount;
                vResult = vDelInfo.result;
            } else {
                if (this.Items[this.SelectInfo.StartItemNo].MangerUndo)
                    this.UndoAction_ItemSelf(this.SelectInfo.StartItemNo, HC.OffsetInner);
                else
                    this.UndoAction_ItemMirror(this.SelectInfo.StartItemNo, HC.OffsetInner);

                vResult = this.Items[this.SelectInfo.StartItemNo].DeleteSelected();
            }

            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - vDelCount, -vDelCount);
        } else {
            let vEndItem = this.Items[this.SelectInfo.EndItemNo];
            if (this.SelectInfo.EndItemNo == this.SelectInfo.StartItemNo) {
                this.Undo_New();

                vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                vFormatLastItemNo = vRange.lastItemNo;
                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                if (this.FormatCount > 0)
                    vFormatFirstItemNo = this.SelectInfo.StartItemNo;
                else
                    vFormatFirstItemNo = this.DrawItems[vFormatFirstDrawItemNo].ItemNo;

                if (vEndItem.IsSelectComplate) {
                    let vItemRang = this.GetParaItemRang(this.SelectInfo.StartItemNo, vParaFirstItemNo, vParaLastItemNo);
                    vParaFirstItemNo = vItemRang.a;
                    vParaLastItemNo = vItemRang.b;
                    let vDelInfo = this.DeleteItemSelectComplate(vDelCount, vParaFirstItemNo, vParaLastItemNo,
                        vFormatFirstItemNo, vFormatLastItemNo);

                    vDelCount = vDelInfo.delCount;
                    vResult = vDelInfo.result;
                } else {
                    if (vEndItem.StyleNo < THCStyle.Null) {
                        if (this.Items[this.SelectInfo.StartItemNo].MangerUndo)
                            this.UndoAction_ItemSelf(this.SelectInfo.StartItemNo, HC.OffsetInner);
                        else
                            this.UndoAction_ItemMirror(this.SelectInfo.StartItemNo, HC.OffsetInner);

                        vEndItem.DeleteSelected();
                    } else if (this.DoAcceptAction(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, THCAction.BackDeleteText)) {
                        let vText = vEndItem.Text;
                        this.UndoAction_DeleteBackText(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset + 1,
                            vText.substr(this.SelectInfo.StartItemOffset + 1 - 1, this.SelectInfo.EndItemOffset - this.SelectInfo.StartItemOffset));

                        vEndItem.Text = vText.delete(this.SelectInfo.StartItemOffset + 1 - 1, this.SelectInfo.EndItemOffset - this.SelectInfo.StartItemOffset);
                    }
                }

                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - vDelCount, -vDelCount);
            } else {
                vFormatFirstItemNo = this.GetParaFirstItemNo(this.SelectInfo.StartItemNo);
                vFormatFirstDrawItemNo = this.Items[vFormatFirstItemNo].FirstDItemNo;
                vFormatLastItemNo = this.GetParaLastItemNo(this.SelectInfo.EndItemNo);
                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                let vSelStartParaFirst = this.Items[this.SelectInfo.StartItemNo].ParaFirst;
                let vSelStartComplate = this.Items[this.SelectInfo.StartItemNo].IsSelectComplate;
                let vSelEndComplate = this.Items[this.SelectInfo.EndItemNo].IsSelectComplate;

                this.Undo_New();

                if (vEndItem.StyleNo < THCStyle.Null) {
                    if (vSelEndComplate) {
                        if (this.DoAcceptAction(this.SelectInfo.EndItemNo, this.SelectInfo.EndItemOffset, THCAction.DeleteItem)) {
                            this.UndoAction_DeleteItem(this.SelectInfo.EndItemNo, HC.OffsetAfter);
                            this.Items.delete(this.SelectInfo.EndItemNo);

                            vDelCount++;
                        }
                    } else {
                        if (this.SelectInfo.EndItemOffset == HC.OffsetInner)  // 在其上
                            vEndItem.DeleteSelected();
                    }
                } else {
                    if (vSelEndComplate) {
                        if (this.DoAcceptAction(this.SelectInfo.EndItemNo, this.SelectInfo.EndItemOffset, THCAction.DeleteItem)) {
                            this.UndoAction_DeleteItem(this.SelectInfo.EndItemNo, vEndItem.length);
                            this.Items.delete(this.SelectInfo.EndItemNo);
                            vDelCount++;
                        }
                    } else if (this.DoAcceptAction(this.SelectInfo.EndItemNo, this.SelectInfo.EndItemOffset, THCAction.BackDeleteText)) {
                        this.UndoAction_DeleteBackText(this.SelectInfo.EndItemNo, 1, vEndItem.Text.substr(1 - 1, this.SelectInfo.EndItemOffset));
                        // 结束Item留下的内容
                        let vText = vEndItem.SubString(this.SelectInfo.EndItemOffset + 1, vEndItem.length - this.SelectInfo.EndItemOffset);
                        vEndItem.Text = vText;
                    }
                }

                for (let i = this.SelectInfo.EndItemNo - 1; i >= this.SelectInfo.StartItemNo + 1; i--) {
                    if (this.DoAcceptAction(i, 0, THCAction.DeleteItem)) {
                        this.UndoAction_DeleteItem(i, 0);
                        this.Items.delete(i);

                        vDelCount++;
                    }
                }

                let vStartItem = this.Items[this.SelectInfo.StartItemNo];  // 选中起始Item
                if (vStartItem.StyleNo < THCStyle.Null) {
                    if (this.SelectInfo.StartItemOffset == HC.OffsetBefor) {
                        if (this.DoAcceptAction(this.SelectInfo.StartItemNo, this.SelectInfo.startItemOffset, THCAction.DeleteItem)) {
                            this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, 0);
                            this.Items.delete(this.SelectInfo.StartItemNo);
                            vDelCount++;
                        }

                        if (this.SelectInfo.StartItemNo > vFormatFirstItemNo)
                            this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                    } else {
                        if (this.SelectInfo.StartItemOffset == HC.OffsetInner)
                            vStartItem.DeleteSelected();
                    }
                } else {
                    if (vSelStartComplate) {
                        if (this.DoAcceptAction(this.SelectInfo.StartItemNo, this.SelectInfo.startItemOffset, THCAction.DeleteItem)) {
                            this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, 0);
                            this.Items.delete(this.SelectInfo.StartItemNo);
                            vDelCount++;
                        }
                    } else if (this.DoAcceptAction(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, THCAction.BackDeleteText)) {
                        this.UndoAction_DeleteBackText(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset + 1,
                            vStartItem.Text.substr(this.SelectInfo.StartItemOffset + 1 - 1, vStartItem.length - this.SelectInfo.StartItemOffset));
                        
                        let vText = vStartItem.SubString(1, this.SelectInfo.StartItemOffset);
                        vStartItem.Text = vText;  // 起始留下的内容
                    }
                }

                if (vSelStartComplate && vSelEndComplate) {
                    if (this.SelectInfo.StartItemNo == vFormatFirstItemNo) {
                        if (this.SelectInfo.EndItemNo == vFormatLastItemNo) {
                            let vNewItem = this.CreateDefaultTextItem();
                            this.CurStyleNo = vNewItem.StyleNo;
                            vNewItem.ParaFirst = true;
                            this.Items.insert(this.SelectInfo.StartItemNo, vNewItem);
                            this.UndoAction_InsertItem(this.SelectInfo.StartItemNo, vNewItem.length);

                            vDelCount--;
                        } else
                            this.Items[this.SelectInfo.EndItemNo - vDelCount + 1].ParaFirst = true;
                    } else {
                        if (this.SelectInfo.EndItemNo == vFormatLastItemNo) {
                            this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                            this.SelectInfo.StartItemOffset = this.GetItemOffsetAfter(this.SelectInfo.StartItemNo);
                        } else {
                            let vLen = this.Items[this.SelectInfo.StartItemNo - 1].length;
                            if (this.MergeItemText(this.Items[this.SelectInfo.StartItemNo - 1], this.Items[this.SelectInfo.EndItemNo - vDelCount + 1])) {
                                this.UndoAction_InsertText(this.SelectInfo.StartItemNo - 1,
                                    this.Items[this.SelectInfo.StartItemNo - 1].length - this.Items[this.SelectInfo.EndItemNo - vDelCount + 1].length + 1,
                                    this.Items[this.SelectInfo.EndItemNo - vDelCount + 1].Text);

                                this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                                this.SelectInfo.StartItemOffset = vLen;

                                this.UndoAction_DeleteItem(this.SelectInfo.EndItemNo - vDelCount + 1, 0);
                                this.Items.delete(this.SelectInfo.EndItemNo - vDelCount + 1);
                                vDelCount++;
                            } else {
                                if (this.Items[this.SelectInfo.EndItemNo - vDelCount + 1].ParaFirst) {
                                    this.UndoAction_ItemParaFirst(this.SelectInfo.EndItemNo - vDelCount + 1, 0, false);
                                    this.Items[this.SelectInfo.EndItemNo - vDelCount + 1].ParaFirst = false;
                                }
                            }
                        }
                    }
                } else {
                    if (vSelStartComplate) {
                        if (this.Items[this.SelectInfo.EndItemNo - vDelCount].ParaFirst != vSelStartParaFirst) {
                            this.UndoAction_ItemParaFirst(this.SelectInfo.EndItemNo - vDelCount, 0, vSelStartParaFirst);
                            this.Items[this.SelectInfo.EndItemNo - vDelCount].ParaFirst = vSelStartParaFirst;
                        }
                    } else {
                        if ((!vSelEndComplate) && (this.SelectInfo.StartItemNo + 1 == this.SelectInfo.EndItemNo - vDelCount)) {
                            if (this.MergeItemText(this.Items[this.SelectInfo.StartItemNo], this.Items[this.SelectInfo.EndItemNo - vDelCount])) {
                                this.UndoAction_InsertText(this.SelectInfo.StartItemNo,
                                    this.Items[this.SelectInfo.StartItemNo].length - this.Items[this.SelectInfo.EndItemNo - vDelCount].length + 1,
                                    this.Items[this.SelectInfo.EndItemNo - vDelCount].Text);

                                this.UndoAction_DeleteItem(this.SelectInfo.EndItemNo - vDelCount, 0);
                                this.Items.delete(this.SelectInfo.EndItemNo - vDelCount);
                                vDelCount++;
                            } else {
                                if (this.SelectInfo.EndItemNo != vFormatLastItemNo) {
                                    if (this.Items[this.SelectInfo.EndItemNo - vDelCount].ParaFirst) {
                                        this.UndoAction_ItemParaFirst(this.SelectInfo.EndItemNo - vDelCount, 0, false);
                                        this.Items[this.SelectInfo.EndItemNo - vDelCount].ParaFirst = false;
                                    }
                                }
                            }
                        }
                    }
                }

                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - vDelCount, -vDelCount);
            }

            for (let i = this.SelectInfo.StartItemNo; i <= this.SelectInfo.EndItemNo - vDelCount; i++)
                this.Items[i].DisSelect();

            this.SelectInfo.EndItemNo = -1;
            this.SelectInfo.EndItemOffset = -1;
        }

        this.Style.updateInfoRePaint();
        this.Style.updateInfoReCaret();

        super.DeleteSelected();

        this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, !vSelectSeekStart);
        return true;
    }

    InitializeField() {
        this.InitializeMouseField();
        super.InitializeField();
    }

    InsertStream(stream, style, fileVersion) {
        if (!this.CanEdit())
            return false;

        if (!this.DoAcceptAction(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, THCAction.InsertItem)) 
            return false;

        if (!this.SelectPerfect())
            return false;

        let vResult = false;
        let vAfterItem = null;
        let vInsertBefor = false, vInsertEmptyLine = false;
        let vInsPos = 0, vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
        let vCaretParaNo = this.CurParaNo;
        let vRange;

        this.Undo_GroupBegin(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
        try {
            if (this.Items.count == 0)
                vInsPos = 0;
            else {
                this.DeleteSelected();
                vInsPos = this.SelectInfo.StartItemNo;
                if (this.Items[vInsPos].StyleNo < THCStyle.Null) {
                    if (this.SelectInfo.StartItemOffset == HC.OffsetInner) {
                        vRange = this.GetFormatRangeByOffset(this.SelectInfo.StartItemNo, HC.OffsetInner, vFormatFirstDrawItemNo, vFormatLastItemNo);
                        vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                        vFormatLastItemNo = vRange.lastItemNo;
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                        this.Undo_New();
                        if (this.Items[vInsPos].MangerUndo)
                            this.UndoAction_ItemSelf(this.lectInfo.StartItemNo, HC.OffsetInner);
                        else
                            this.UndoAction_ItemMirror(this.SelectInfo.StartItemNo, HC.OffsetInner);

                        vResult = this.Items[vInsPos].InsertStream(stream, style, fileVersion);
                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);

                        return vResult;
                    } else {
                        if (this.SelectInfo.StartItemOffset == HC.OffsetBefor)  // 其前
                            vInsertBefor = true;
                        else  // 其后
                            vInsPos = vInsPos + 1;
                    }
                } else {
                    if (this.SelectInfo.StartItemOffset == this.Items[vInsPos].length) {
                        vInsertEmptyLine = this.IsEmptyLine(vInsPos);
                        vInsPos = vInsPos + 1;
                    } else {
                        if (this.SelectInfo.StartItemOffset == 0)
                            vInsertBefor = this.Items[vInsPos].length != 0;
                        else {
                            this.Undo_New();
                            this.UndoAction_DeleteBackText(vInsPos, this.SelectInfo.StartItemOffset + 1,
                                this.Items[vInsPos].Text.substr(this.SelectInfo.StartItemOffset + 1 - 1, this.Items[vInsPos].length - this.SelectInfo.StartItemOffset));

                            vAfterItem = this.Items[vInsPos].BreakByOffset(this.SelectInfo.StartItemOffset);  // 后半部分对应的Item
                            vInsPos = vInsPos + 1;
                        }
                    }
                }
            }

            let vDataSize = stream.readInt64();
            if (vDataSize == 0)
                return vResult;

            let vItemCount = stream.readInt32();
            if (vItemCount == 0)
                return vResult;

            vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
            vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
            vFormatLastItemNo = vRange.lastItemNo;

            if (this.Items.count > 0)
                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
            else {
                vFormatFirstDrawItemNo = 0;
                vFormatLastItemNo = -1;
            }

            let vItemCountAct = 0;  // 实际插入的数量
            let vIgnoreCount = 0;  // 忽略掉的数据
            this.Undo_New();

            let vStyleNo = THCStyle.Null;
            let vItem = null;
            for (let i = 0; i <= vItemCount - 1; i++) {
                vStyleNo = stream.readInt32();
                vItem = this.CreateItemByStyle(vStyleNo);
                vItem.LoadFromStream(stream, style, fileVersion);
                if (style != null) {
                    if (vItem.StyleNo > THCStyle.Null)
                        vItem.StyleNo = this.Style.GetStyleNo(style.TextStyles[vItem.StyleNo], true);

                    if (this.Style.States.contain(THCState.Pasting))
                        vItem.ParaNo = vCaretParaNo;
                    else
                        vItem.ParaNo = this.Style.GetParaNo(style.ParaStyles[vItem.ParaNo], true);
                } else {
                    if (vItem.StyleNo > THCStyle.Null)
                        vItem.StyleNo = this.CurStyleNo;

                    vItem.ParaNo = vCaretParaNo;
                }

                if (i == 0) {
                    if (vInsertBefor) {
                        vItem.ParaFirst = this.Items[vInsPos].ParaFirst;

                        if (this.Items[vInsPos].ParaFirst) {
                            this.UndoAction_ItemParaFirst(vInsPos, 0, false);
                            this.Items[vInsPos].ParaFirst = false;
                        }
                    } else
                        vItem.ParaFirst = false;
                } else if (!vItem.ParaFirst && this.MergeItemText(this.Items[vInsPos + i - 1 - vIgnoreCount], vItem)) {
                    vIgnoreCount++;
                    vItem.dispose();
                    vItem = null;
                    continue;
                }

                this.Items.insert(vInsPos + i - vIgnoreCount, vItem);
                this.UndoAction_InsertItem(vInsPos + i - vIgnoreCount, 0);
                vItemCountAct++;
            }

            vItemCount = this.CheckInsertItemCount(vInsPos, vInsPos + vItemCountAct - 1);

            let vInsetLastNo = vInsPos + vItemCount - 1;
            let vCaretOffse = this.GetItemOffsetAfter(vInsetLastNo);

            if (vAfterItem != null) {
                if (this.MergeItemText(this.Items[vInsetLastNo], vAfterItem)) {
                    this.UndoAction_InsertText(vInsetLastNo, this.Items[vInsetLastNo].length - vAfterItem.length + 1, vAfterItem.Text);
                    vAfterItem.dispose();
                    vAfterItem = null;
                } else {
                    this.Items.insert(vInsetLastNo + 1, vAfterItem);
                    this.UndoAction_InsertItem(vInsetLastNo + 1, 0);

                    vItemCount++;
                }
            }

            if (vInsPos > 0) {
                if (vInsertEmptyLine) {
                    this.UndoAction_ItemParaFirst(vInsPos, 0, this.Items[vInsPos - 1].ParaFirst);
                    this.Items[vInsPos].ParaFirst = this.Items[vInsPos - 1].ParaFirst;

                    if (this.Items[vInsPos - 1].PageBreak) {
                        this.UndoAction_ItemPageBreak(vInsPos, 0, true);
                        this.Items[vInsPos].PageBreak = true;
                    }

                    this.UndoAction_DeleteItem(vInsPos - 1, 0);
                    this.Items.delete(vInsPos - 1);  // 删除空行

                    vItemCount--;
                    vInsetLastNo--;
                } else {
                    let vOffsetStart = this.Items[vInsPos - 1].length;
                    if ((!this.Items[vInsPos].ParaFirst) && this.MergeItemText(this.Items[vInsPos - 1], this.Items[vInsPos])) {
                        this.UndoAction_InsertText(vInsPos - 1,
                            this.Items[vInsPos - 1].length - this.Items[vInsPos].length + 1,
                            this.Items[vInsPos].Text);
                        
                        this.UndoAction_DeleteItem(vInsPos, 0);
                        this.Items.delete(vInsPos);

                        if (vItemCount == 1)
                            vCaretOffse = vOffsetStart + vCaretOffse;

                        vItemCount--;
                        vInsetLastNo--;
                    }
                }

                if ((vInsetLastNo < this.Items.count - 1)  // 插入最后Item和后面的能合并
                    && (!this.Items[vInsetLastNo + 1].ParaFirst)
                    && this.MergeItemText(this.Items[vInsetLastNo], this.Items[vInsetLastNo + 1]))
                {
                    this.UndoAction_InsertText(vInsetLastNo, this.Items[vInsetLastNo].length - this.Items[vInsetLastNo + 1].length + 1, 
                        this.Items[vInsetLastNo + 1].Text);
                    this.UndoAction_DeleteItem(vInsetLastNo + 1, 0);

                    this.Items.delete(vInsetLastNo + 1);
                    vItemCount--;
                }
            } else {
                if (this.MergeItemText(this.Items[vInsetLastNo], this.Items[vInsetLastNo + 1])) {
                    vItem = this.Items[vInsetLastNo + 1];
                    this.UndoAction_InsertText(vInsetLastNo, this.Items[vInsetLastNo].length - vItem.length + 1, vItem.Text);
                    this.UndoAction_DeleteItem(vInsPos + vItemCount, 0);

                    this.Items.delete(vInsPos + vItemCount);
                    vItemCount--;
                }
            }

            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo + vItemCount, vItemCount);
            this.ReSetSelectAndCaretByOffset(vInsetLastNo, vCaretOffse);  // 选中插入内容最后Item位置
        } finally {
            this.Undo_GroupEnd(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
        }

        this.InitializeMouseField();
        this.Style.updateInfoRePaint();
        this.Style.updateInfoReCaret();
        this.Style.updateInfoReScroll();
        return vResult;
    }

    ParseXml(node) {
        if (!this.CanEdit())
            return;

        super.ParseXml(node);

        this.ReFormat();

        this.Style.updateInfoRePaint();
        this.Style.updateInfoReCaret();
        this.Style.updateInfoReScroll();
    }

    InsertItem(item) {
        if (!this.CanEdit())
            return false;

        if (!this.DeleteSelected())
            return false;

        let vResult = false;

        if (item.ParaNo > this.Style.ParaStyles.count - 1)
            item.ParaNo = this.CurParaNo;

        if (!item.ParaFirst) {
            if (this.IsEmptyData()) {
                this.Undo_New();
                vResult = this.EmptyDataInsertItem(item);
                this.CurParaNo = item.ParaNo;
                return vResult;
            } else  // 随其后
                item.ParaNo = this.CurParaNo;
        }

        let vRange;
        let vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
        let vCurItemNo = this.GetActiveItemNo();
        if (this.Items[vCurItemNo].StyleNo < THCStyle.Null) {
            if (this.SelectInfo.StartItemOffset == HC.OffsetInner) {
                vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                vFormatLastItemNo = vRange.lastItemNo;
                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                this.Undo_New();
                this.UndoAction_ItemSelf(vCurItemNo, HC.OffsetInner);
                vResult = this.Items[vCurItemNo].InsertItem(item);
                if (vResult)
                    this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo, 0);
            } else {
                if (this.SelectInfo.StartItemOffset == HC.OffsetBefor)
                    vResult = this.InsertItemEx(this.SelectInfo.StartItemNo, item);
                else  // 其后
                    vResult = this.InsertItemEx(this.SelectInfo.StartItemNo + 1, item, false);
            }
        } else {
            if ((this.SelectInfo.StartItemOffset == this.Items[vCurItemNo].length))
                vResult = this.InsertItemEx(this.SelectInfo.StartItemNo + 1, item, false);
            else {
                if (this.SelectInfo.StartItemOffset == 0)
                    vResult = this.InsertItemEx(this.SelectInfo.StartItemNo, item);
                else {
                    vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                    vFormatLastItemNo = vRange.lastItemNo;
                    this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                    let vText = this.Items[vCurItemNo].Text;
                    let vsBefor = vText.substr(1 - 1, this.SelectInfo.StartItemOffset);
                    let vsAfter = vText.substr(this.SelectInfo.StartItemOffset + 1 - 1, 
                        this.Items[vCurItemNo].length - this.SelectInfo.StartItemOffset);

                    this.Undo_New();
                    if (this.Items[vCurItemNo].CanConcatItems(item)) {
                        if (item.ParaFirst) {
                            this.UndoAction_DeleteBackText(vCurItemNo, this.SelectInfo.StartItemOffset + 1, vsAfter);
                            this.Items[vCurItemNo].Text = vsBefor;
                            item.Text = item.Text + vsAfter;

                            vCurItemNo = vCurItemNo + 1;
                            this.Items.insert(vCurItemNo, item);
                            this.UndoAction_InsertItem(vCurItemNo, 0);

                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo + 1, 1);
                            this.ReSetSelectAndCaret(vCurItemNo);
                        } else {
                            this.UndoAction_InsertText(vCurItemNo, this.SelectInfo.StartItemOffset + 1, item.Text);
                            vsBefor = vsBefor + item.Text;
                            this.Items[vCurItemNo].Text = vsBefor + vsAfter;

                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo, 0);
                            this.SelectInfo.StartItemNo = vCurItemNo;
                            this.SelectInfo.StartItemOffset = vsBefor.length;
                        }
                    } else {
                        this.UndoAction_DeleteBackText(vCurItemNo, this.SelectInfo.StartItemOffset + 1, vsAfter);
                        let vAfterItem = this.Items[vCurItemNo].BreakByOffset(this.SelectInfo.StartItemOffset);
                        vCurItemNo = vCurItemNo + 1;
                        this.Items.insert(vCurItemNo, vAfterItem);
                        this.UndoAction_InsertItem(vCurItemNo, 0);
                        this.Items.insert(vCurItemNo, item);
                        this.UndoAction_InsertItem(vCurItemNo, 0);
                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo + 2, 2);
                        this.ReSetSelectAndCaret(vCurItemNo);
                    }

                    vResult = true;
                }
            }
        }

        return vResult;
    }

    InsertItemEx(index, item, offsetBefor = true) {
        if (!this.CanEdit())
            return false;

        if (item.ParaNo > this.Style.ParaStyles.count - 1)
            item.ParaNo = this.CurParaNo;

        if (!item.ParaFirst) {
            if (this.IsEmptyData()) {
                this.Undo_New();
                let vRe = this.EmptyDataInsertItem(item);
                this.CurParaNo = item.ParaNo;
                return vRe;
            } else
                item.ParaNo = this.CurParaNo;
        }

        let vRange;
        let vIncCount = 0, vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
        this.Undo_New();
        if (item.StyleNo < THCStyle.Null) {
            let vInsPos = index;
            if (index < this.Items.count) {
                if (offsetBefor) {
                    vRange = this.GetFormatRangeByOffset(index, 1, vFormatFirstDrawItemNo, vFormatLastItemNo);
                    vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                    vFormatLastItemNo = vRange.lastItemNo;
                    this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                    if (this.IsEmptyLine(index)) {
                        item.ParaFirst = true;
                        this.UndoAction_DeleteItem(index, 0);
                        this.Items.delete(index);
                        vIncCount--;
                    } else if (!item.ParaFirst) {
                        item.ParaFirst = this.Items[index].ParaFirst;
                        if (this.Items[index].ParaFirst) {
                            this.UndoAction_ItemParaFirst(index, 0, false);
                            this.Items[index].ParaFirst = false;

                            if (this.Items[index].PageBreak) {
                                this.UndoAction_ItemPageBreak(index, 0, false);
                                this.Items[index].PageBreak = false;
                                item.PageBreak = true;
                            }
                        }
                    }
                } else {
                    if ((index > 0)
                        && (this.Items[index - 1].StyleNo > THCStyle.Null)
                        && (this.Items[index - 1].Text == ""))
                    {
                        vRange = this.GetFormatRangeByOffset(index - 1, 1, vFormatFirstDrawItemNo, vFormatLastItemNo);
                        vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                        vFormatLastItemNo = vRange.lastItemNo;
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                        item.ParaFirst = true;
                        this.UndoAction_DeleteItem(index - 1, 0);
                        this.Items.delete(index - 1);
                        vIncCount--;
                        vInsPos--;
                    } else {
                        vRange = this.GetFormatRangeByOffset(index - 1, this.GetItemLastDrawItemNo(index - 1), vFormatFirstDrawItemNo, vFormatLastItemNo);
                        vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                        vFormatLastItemNo = vRange.lastItemNo;
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    }
                }
            } else {
                vRange = this.GetFormatRangeByOffset(index - 1, this.GetItemLastDrawItemNo(index - 1), vFormatFirstDrawItemNo, vFormatLastItemNo);
                vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                vFormatLastItemNo = vRange.lastItemNo;
                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                if ((!item.ParaFirst)  // 插入不是另起一段)
                    && (this.Items[index - 1].StyleNo > THCStyle.Null)  // 前面是TextItem
                    && (this.Items[index - 1].Text == "")) // 空行
                {
                    item.ParaFirst = true;
                    this.UndoAction_DeleteItem(index - 1, 0);
                    this.Items.delete(index - 1);
                    vIncCount--;
                    vInsPos--;
                }
            }

            this.Items.insert(vInsPos, item);
            this.UndoAction_InsertItem(vInsPos, HC.OffsetAfter);
            vIncCount++;

            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo + vIncCount, vIncCount);
            this.ReSetSelectAndCaret(vInsPos);
        } else {
            let vMerged = false;
            if (!item.ParaFirst) {
                if (offsetBefor) {
                    if ((index < this.Items.count) && (this.Items[index].CanConcatItems(item))) {
                        vRange = this.GetFormatRangeByOffset(index, 1, vFormatFirstDrawItemNo, vFormatLastItemNo);
                        vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                        vFormatLastItemNo = vRange.lastItemNo;
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                        this.UndoAction_InsertText(index, 1, item.Text);
                        this.Items[index].Text = item.Text + this.Items[index].Text;
                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo, 0);
                        this.ReSetSelectAndCaret(index);
                        vMerged = true;
                    } else if ((!this.Items[index].ParaFirst) && (index > 0) && this.Items[index - 1].CanConcatItems(item)) {
                        vRange = this.GetFormatRangeByOffset(index - 1, this.GetItemOffsetAfter(index - 1), vFormatFirstDrawItemNo, vFormatLastItemNo);
                        vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                        vFormatLastItemNo = vRange.lastItemNo;
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                        this.UndoAction_InsertText(index - 1, this.Items[index - 1].length + 1, item.Text);  // 201806261650
                        this.Items[index - 1].Text = this.Items[index - 1].Text + item.Text;
                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo, 0);
                        this.ReSetSelectAndCaret(index - 1);
                        vMerged = true;
                    }
                } else {
                    if (this.IsEmptyLine(index - 1)) {
                        vRange = this.GetFormatRangeByOffset(index - 1, 1, vFormatFirstDrawItemNo, vFormatLastItemNo);
                        vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                        vFormatLastItemNo = vRange.lastItemNo;
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                        item.ParaFirst = true;
                        this.Items.insert(index, item);
                        this.UndoAction_InsertItem(index, 0);
                        this.UndoAction_DeleteItem(index - 1, 0);
                        this.Items.delete(index - 1);
                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo, 0);
                        this.ReSetSelectAndCaret(index - 1);
                        vMerged = true;
                    } else if (this.Items[index - 1].CanConcatItems(item)) {
                        vRange = this.GetFormatRangeByOffset(index - 1, this.GetItemOffsetAfter(index - 1), vFormatFirstDrawItemNo, vFormatLastItemNo);
                        vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                        vFormatLastItemNo = vRange.lastItemNo;
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                        this.UndoAction_InsertText(index - 1, this.Items[index - 1].length + 1, item.Text);
                        this.Items[index - 1].Text = this.Items[index - 1].Text + item.Text;
                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo, 0);
                        this.ReSetSelectAndCaret(index - 1);
                        vMerged = true;
                    } else if ((index < this.Items.count) && (!this.Items[index].ParaFirst) && (this.Items[index].CanConcatItems(item))) {
                        vRange = this.GetFormatRangeByOffset(index, 1, vFormatFirstDrawItemNo, vFormatLastItemNo);
                        vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                        vFormatLastItemNo = vRange.lastItemNo;
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                        this.UndoAction_InsertText(index, 1, item.Text);
                        this.Items[index].Text = item.Text + this.Items[index].Text;
                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo, 0);
                        this.ReSetSelectAndCaretByOffset(index, item.length);
                        vMerged = true;
                    }
                }
            }

            if (!vMerged) {
                if (offsetBefor) {
                    vRange = this.GetFormatRangeByOffset(index, 1, vFormatFirstDrawItemNo, vFormatLastItemNo);
                    vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                    vFormatLastItemNo = vRange.lastItemNo;
                    if (!item.ParaFirst) {
                        item.ParaFirst = this.Items[index].ParaFirst;
                        if (this.Items[index].ParaFirst) {
                            this.UndoAction_ItemParaFirst(index, 0, false);
                            this.Items[index].ParaFirst = false;
                        }
                    }
                } else {
                    vRange = this.GetFormatRangeByOffset(index - 1, this.GetItemOffsetAfter(index - 1), vFormatFirstDrawItemNo, vFormatLastItemNo);
                    vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                    vFormatLastItemNo = vRange.lastItemNo;
                }

                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                this.Items.insert(index, item);
                this.UndoAction_InsertItem(index, 0);
                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo + 1, 1);
                this.ReSetSelectAndCaret(index);
            }
        }

        return true;
    }

     SetActiveItemText(text) {
        if (!this.CanEdit())
            return;

        if (text == "")
            return;

        this.InitializeField();
        let vActiveItem = this.GetActiveItem();
        if (vActiveItem == null)
            return;

        let vRange;
        let vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
        if ((vActiveItem.StyleNo < THCStyle.Null)
            && (this.SelectInfo.StartItemOffset == HC.OffsetInner))
        {
            this.Undo_New();

            let vRectItem = vActiveItem;// as HCCustomRectItem;
            if (vRectItem.MangerUndo)
                this.UndoAction_ItemSelf(this.SelectInfo.StartItemNo, HC.OffsetInner);
            else
                this.UndoAction_ItemMirror(this.SelectInfo.StartItemNo, HC.OffsetInner);

            vRectItem.SetActiveItemText(text);
            if (vRectItem.SizeChanged) {
                vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                vFormatLastItemNo = vRange.lastItemNo;
                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);

                vRectItem.SizeChanged = false;
            } else
                this.FormatInit();
        } else {
            if (text.indexOf("\r\n") >= 0) {
                this.Undo_GroupBegin(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
                try {
                    this.DeleteItems(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemNo, true);
                    this.InsertText(text);
                } finally {
                    this.Undo_GroupEnd(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
                }

                return;
            }

            this.Undo_New();
            this.UndoAction_SetItemText(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, text);
            this.Items[this.SelectInfo.StartItemNo].Text = text;

            vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
            vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
            vFormatLastItemNo = vRange.lastItemNo;
            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);

            this.SelectInfo.StartItemOffset = text.length;
            this.SelectInfo.EndItemNo = -1;
            this.SelectInfo.EndItemOffset = -1;
            this.Items[this.SelectInfo.StartItemNo].DisSelect();

            this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
        }

        this.Style.updateInfoRePaint();
        this.Style.updateInfoReCaret();
    }

    KillFocus() {
        let vItemNo = this.GetActiveItemNo();
        if (vItemNo > 0)
            this.Items[vItemNo].KillFocus();
    }

    DoItemMouseDown(itemNo, offset, e) {
        if (itemNo < 0)
            return;

        let vPoint = this.CoordToItemOffset(e.x, e.y, itemNo, offset, -1, -1);
        let vMouseArgs = new TMouseEventArgs();
        vMouseArgs.assign(e);
        vMouseArgs.x = vPoint.x;
        vMouseArgs.y = vPoint.y;
        this.Items[itemNo].MouseDown(vMouseArgs);

        if (this.FOnItemMouseDown != null)
            this.FOnItemMouseDown(this, itemNo, offset, vMouseArgs);
    }
    
    MouseDown(e) {
        this.FSelecting = false;
        this.FDraging = false;
        this.FMouseLBDouble = false;
        this.FMouseDownReCaret = false;
        this.FMouseLBDowning = (e.button == TMouseButton.Left);
        this.FMouseDownX = e.x;
        this.FMouseDownY = e.y;

        let vMouseDownItemNo = -1, vMouseDownItemOffset = -1, vDrawItemNo = -1;
        let vRestrain = false;
        let vInfo = this.GetItemAt(e.x, e.y, vMouseDownItemNo, vMouseDownItemOffset, vDrawItemNo, vRestrain);
        vMouseDownItemNo = vInfo.itemNo;
        vMouseDownItemOffset = vInfo.offset;
        vDrawItemNo = vInfo.drawItemNo;
        vRestrain = vInfo.restrain;

        if ((e.button == TMouseButton.Left) && hcl.keyDownStates[TKey.ShiftKey]) {
            let vInfo = this.SelectByMouseDownShift(vMouseDownItemNo,  vMouseDownItemOffset);
            vMouseDownItemNo = vInfo.itemNo;
            vMouseDownItemOffset = vInfo.offset;
            if (vInfo.result) {
                this.MatchItemSelectState();
                this.Style.updateInfoRePaint();
                this.Style.updateInfoReCaret();

                this.FMouseDownItemNo = vMouseDownItemNo;
                this.FMouseDownItemOffset = vMouseDownItemOffset;
                this.FSelectSeekNo = vMouseDownItemNo;
                this.FSelectSeekOffset = vMouseDownItemOffset;

                if ((!vRestrain) && (this.Items[this.FMouseDownItemNo].StyleNo < THCStyle.Null))  // RectItem
                    this.DoItemMouseDown(this.FMouseDownItemNo, this.FMouseDownItemOffset, e);

                return;
            }
        }

        let vMouseDownInSelect = this.CoordInSelect(e.x, e.y, vMouseDownItemNo, vMouseDownItemOffset, vRestrain);

        if (vMouseDownInSelect) {
            if (this.FMouseLBDowning) {
                this.FDraging = true;
                this.Style.updateInfo.draging = true;
            }

            if (this.Items[vMouseDownItemNo].StyleNo < THCStyle.Null)
                this.DoItemMouseDown(vMouseDownItemNo, vMouseDownItemOffset, e);
        } else {
            if (this.SelectInfo.StartItemNo >= 0) {
                if (this.Items[this.SelectInfo.StartItemNo].StyleNo < THCStyle.Null)
                    this.Items[this.SelectInfo.StartItemNo].DisSelect();

                this.Style.updateInfoRePaint();
            }

            if ((vMouseDownItemNo != this.FMouseDownItemNo)
                || (vMouseDownItemOffset != this.FMouseDownItemOffset)
                || (this.CaretDrawItemNo != vDrawItemNo))
            {
                this.Style.updateInfoReCaret();
                this.FMouseDownReCaret = true;
                this.DisSelect();
                this.FMouseDownItemNo = vMouseDownItemNo;
                this.FMouseDownItemOffset = vMouseDownItemOffset;
                this.SelectInfo.StartItemNo = this.FMouseDownItemNo;
                this.SelectInfo.StartItemOffset = this.FMouseDownItemOffset;
                this.SelectInfo.StartRestrain = vRestrain;
                this.CaretDrawItemNo = vDrawItemNo;
            }

            this.DoItemMouseDown(this.FMouseDownItemNo, this.FMouseDownItemOffset, e);
        }
    }

    DoItemMouseMove(itemNo, offset, e) {
        if (itemNo < 0)
            return;

        let vPoint = this.CoordToItemOffset(e.x, e.y, itemNo, offset, -1, -1);
        let vMouseArgs = new TMouseEventArgs();
        vMouseArgs.assign(e);
        vMouseArgs.x = vPoint.x;
        vMouseArgs.y = vPoint.y;
        this.Items[itemNo].MouseMove(vMouseArgs);
    }

    MouseMove(e) {
        if (this.SelectedResizing()) {
            this.FMouseMoveItemNo = this.FMouseDownItemNo;
            this.FMouseMoveItemOffset = this.FMouseDownItemOffset;
            this.FMouseMoveRestrain = false;
            this.DoItemMouseMove(this.FMouseMoveItemNo, this.FMouseMoveItemOffset, e);
            this.Style.updateInfoRePaint();

            return;
        }

        let vMouseMoveItemNo = -1, vMouseMoveItemOffset = -1;
        let vRestrain = false;
        let vInfo = this.GetItemAt(e.x, e.y, vMouseMoveItemNo, vMouseMoveItemOffset, this.FMouseMoveDrawItemNo, vRestrain);
        vMouseMoveItemNo = vInfo.itemNo;
        vMouseMoveItemOffset = vInfo.offset;
        this.FMouseMoveDrawItemNo = vInfo.drawItemNo;
        vRestrain = vInfo.restrain;

        if (this.FDraging || this.Style.updateInfo.draging) {
            HC.GCursor = TCursors.Drag;

            this.FMouseMoveItemNo = vMouseMoveItemNo;
            this.FMouseMoveItemOffset = vMouseMoveItemOffset;
            this.SelectInfo.StartItemNo = vMouseMoveItemNo;
            this.SelectInfo.StartItemOffset = vMouseMoveItemOffset;
            this.FMouseMoveRestrain = vRestrain;
            this.CaretDrawItemNo = this.FMouseMoveDrawItemNo;

            this.Style.updateInfoReCaret();

            if ((!vRestrain) && (this.Items[this.FMouseMoveItemNo].StyleNo < THCStyle.Null))
                this.DoItemMouseMove(this.FMouseMoveItemNo, this.FMouseMoveItemOffset, e);
        } else {
            if (this.FSelecting) {
                if ((this.Items[this.FMouseDownItemNo].StyleNo < THCStyle.Null)
                    && (this.FMouseDownItemOffset == HC.OffsetInner))
                {
                    this.FMouseMoveItemNo = this.FMouseDownItemNo;
                    this.FMouseMoveItemOffset = this.FMouseDownItemOffset;

                    if (vMouseMoveItemNo == this.FMouseDownItemNo)
                        this.FMouseMoveRestrain = vRestrain;
                    else
                        this.FMouseMoveRestrain = true;

                    this.DoItemMouseMove(this.FMouseMoveItemNo, this.FMouseMoveItemOffset, e);
                    this.Style.updateInfoRePaint();
                    this.Style.updateInfoReCaret();
                    return;
                } else {
                    this.FMouseMoveItemNo = vMouseMoveItemNo;
                    this.FMouseMoveItemOffset = vMouseMoveItemOffset;
                    this.FMouseMoveRestrain = vRestrain;
                }

                let vRange = this.AdjustSelectRange(this.FMouseDownItemNo, this.FMouseDownItemOffset,
                    this.FMouseMoveItemNo, this.FMouseMoveItemOffset);

                this.FMouseDownItemNo = vRange.startItemNo;
                this.FMouseDownItemOffset = vRange.startItemOffset;
                this.FMouseMoveItemNo = vRange.endItemNo;
                this.FMouseMoveItemOffset = vRange.endItemOffset;

                this.FSelectSeekNo = this.FMouseMoveItemNo;
                this.FSelectSeekOffset = this.FMouseMoveItemOffset;

                if (this.SelectExists())
                    this.MatchItemSelectState();
                else
                    this.CaretDrawItemNo = this.FMouseMoveDrawItemNo;

                if ((!vRestrain) && (this.Items[this.FMouseMoveItemNo].StyleNo < THCStyle.Null))
                    this.DoItemMouseMove(this.FMouseMoveItemNo, this.FMouseMoveItemOffset, e);
                
                this.Style.updateInfoRePaint();
                this.Style.updateInfoReCaret();
            } else {
                if (this.FMouseLBDowning && ((this.FMouseDownX != e.x) || (this.FMouseDownY != e.y))) {
                    this.FSelecting = true;
                    this.Style.updateInfo.selecting = true;
                } else {
                    if (vMouseMoveItemNo != this.FMouseMoveItemNo) {
                        if (this.FMouseMoveItemNo >= 0)
                            this.DoItemMouseLeave(this.FMouseMoveItemNo);

                        if ((vMouseMoveItemNo >= 0) && (!vRestrain))
                            this.DoItemMouseEnter(vMouseMoveItemNo);

                        this.Style.updateInfoRePaint();
                    } else {
                        if (vRestrain != this.FMouseMoveRestrain) {
                            if ((!this.FMouseMoveRestrain) && vRestrain) {
                                if (this.FMouseMoveItemNo >= 0)
                                    this.DoItemMouseLeave(this.FMouseMoveItemNo);
                            } else {
                                if (this.FMouseMoveRestrain && (!vRestrain)) {
                                    if (vMouseMoveItemNo >= 0)
                                        this.DoItemMouseEnter(vMouseMoveItemNo);
                                }
                            }

                            this.Style.updateInfoRePaint();
                        }
                    }

                    this.FMouseMoveItemNo = vMouseMoveItemNo;
                    this.FMouseMoveItemOffset = vMouseMoveItemOffset;
                    this.FMouseMoveRestrain = vRestrain;

                    if (!vRestrain) {
                        this.DoItemMouseMove(this.FMouseMoveItemNo, this.FMouseMoveItemOffset, e);
                        if (hcl.keyDownStates[TKey.ControlKey] && (this.Items[this.FMouseMoveItemNo].HyperLink != ""))
                            HC.GCursor = TCursors.HandPoint;
                    }
                }
            }
        }
    }

    DoItemMouseUp(itemNo, offset, e) {
        if (itemNo < 0)
            return;

        let vPoint = this.CoordToItemOffset(e.x, e.y, itemNo, offset, -1, -1);
        let vMouseArgs = new TMouseEventArgs();
        vMouseArgs.assign(e);
        vMouseArgs.x = vPoint.x;
        vMouseArgs.y = vPoint.y;
        this.Items[itemNo].MouseUp(vMouseArgs);

        if (this.FOnItemMouseUp != null)
            this.FOnItemMouseUp(this, itemNo, offset, vMouseArgs);
    }

    DoNormalMouseUp(vUpItemNo, vUpItemOffset, vDrawItemNo, vRestrain, e) {
        if (this.FMouseMoveItemNo < 0) {
            this.SelectInfo.StartItemNo = vUpItemNo;
            this.SelectInfo.StartItemOffset = vUpItemOffset;
            this.SelectInfo.StartRestrain = vRestrain;
            this.CaretDrawItemNo = vDrawItemNo;
        } else {
            this.SelectInfo.StartItemNo = this.FMouseMoveItemNo;
            this.SelectInfo.StartItemOffset = this.FMouseMoveItemOffset;
            this.SelectInfo.StartRestrain = vRestrain;
            this.CaretDrawItemNo = this.FMouseMoveDrawItemNo;
        }

        this.Style.updateInfoRePaint();

        if (!this.FMouseDownReCaret)
            this.Style.updateInfoReCaret();

        this.DoItemMouseUp(vUpItemNo, vUpItemOffset, e);  // 弹起，因为可能是移出Item后弹起，所以这里不受vRestrain约束
    }

    MouseUp(e) {
        this.FMouseLBDowning = false;

        if (this.FMouseLBDouble)
            return;

        if ((e.button == TMouseButton.Left) && (hcl.keyDownStates[TKey.ShiftKey]))
            return;

        if (this.SelectedResizing()) {
            this.Undo_New();
            this.UndoAction_ItemSelf(this.FMouseDownItemNo, this.FMouseDownItemOffset);

            this.DoItemMouseUp(this.FMouseDownItemNo, this.FMouseDownItemOffset, e);
            this.DoItemResized(this.FMouseDownItemNo);  // 缩放完成事件(可控制缩放不要超过页面)

            let vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
            let vRange = this.GetFormatRangeByOffset(this.FMouseDownItemNo, this.FMouseDownItemOffset, vFormatFirstDrawItemNo, vFormatLastItemNo);
            vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
            vFormatLastItemNo = vRange.lastItemNo;
            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
            this.Style.updateInfoRePaint();

            return;
        }

        let vUpItemNo = -1, vUpItemOffset = -1, vDrawItemNo = -1;
        let vRestrain = false;
        let vInfo = this.GetItemAt(e.x, e.y, vUpItemNo, vUpItemOffset, vDrawItemNo, vRestrain);
        vUpItemNo = vInfo.itemNo;
        vUpItemOffset = vInfo.offset;
        vDrawItemNo = vInfo.drawItemNo;
        vRestrain = vInfo.restrain;

        if (this.FSelecting || this.Style.updateInfo.selecting) {
            this.FSelecting = false;
            for (let i = this.SelectInfo.StartItemNo; i <= this.SelectInfo.EndItemNo; i++) {
                if ((i != vUpItemNo) && (this.Items[i].StyleNo < THCStyle.Null))
                    this.DoItemMouseUp(i, 0, e);
            }

            if (this.SelectInfo.EndItemNo < 0) {
                if ((this.FMouseDownItemNo >= 0) && (this.Items[this.FMouseDownItemNo].StyleNo < THCStyle.Null))  // 弹起时在RectItem
                    this.DoItemMouseUp(this.FMouseDownItemNo, HC.OffsetInner, e);
                else
                    this.DoItemMouseUp(vUpItemNo, vUpItemOffset,e);
            } else if (this.Items[vUpItemNo].StyleNo < THCStyle.Null)
                this.DoItemMouseUp(vUpItemNo, vUpItemOffset, e);
        } else {
            if (this.FDraging || this.Style.updateInfo.draging) {
                this.FDraging = false;
                //let vMouseUpInSelect = this.CoordInSelect(e.x, e.y, vUpItemNo, vUpItemOffset, vRestrain);

                if (this.SelectInfo.StartItemNo >= 0) {
                    if (this.SelectInfo.StartItemNo != vUpItemNo) {
                        this.Items[this.SelectInfo.StartItemNo].DisSelect();
                    }

                    for (let i = this.SelectInfo.StartItemNo + 1; i <= this.SelectInfo.EndItemNo; i++) {
                        if (i != vUpItemNo)
                            this.Items[i].DisSelect();
                    }
                }

                this.FMouseMoveItemNo = vUpItemNo;
                this.FMouseMoveItemOffset = vUpItemOffset;
                this.FMouseDownItemNo = vUpItemNo;
                this.FMouseDownItemOffset = vUpItemOffset;
                this.DoNormalMouseUp(vUpItemNo, vUpItemOffset, vDrawItemNo, vRestrain, e);
                this.SelectInfo.EndItemNo = -1;
                this.SelectInfo.EndItemOffset = -1;
            } else {
                if (this.SelectExists(false))
                    this.DisSelect();

                    this.DoNormalMouseUp(vUpItemNo, vUpItemOffset, vDrawItemNo, vRestrain, e);
            }
        }
    }

    MouseLeave() {
        if (this.FMouseMoveItemNo >= 0) {
            this.DoItemMouseLeave(this.FMouseMoveItemNo);
            this.FMouseMoveItemNo = -1;
            this.FMouseMoveItemOffset = -1;
            this.Style.updateInfoRePaint();
        }
    }

    KeyPress(key) {
        if (!this.CanEdit())
            return key;

        let vCarteItem = this.GetActiveItem();
        if (vCarteItem == null)
            return key;

        if ((vCarteItem.StyleNo < THCStyle.Null)
            && (this.SelectInfo.StartItemOffset == HC.OffsetInner))
        {
            this.Undo_New();

            let vRectItem = vCarteItem;// as HCCustomRectItem;
            if (vRectItem.MangerUndo)
                this.UndoAction_ItemSelf(this.SelectInfo.StartItemNo, HC.OffsetInner);
            else
                this.UndoAction_ItemMirror(this.SelectInfo.StartItemNo, HC.OffsetInner);

            vRectItem.KeyPress(key);
            if (vRectItem.SizeChanged) {
                vRectItem.SizeChanged = false;

                let vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
                let vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                vFormatLastItemNo = vRange.lastItemNo;
                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                if (key != 0)
                    this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);

                vRectItem.SizeChanged = false;
                this.Style.updateInfoRePaint();
                this.Style.updateInfoReCaret();
                this.Style.updateInfoReScroll();
            } else
                this.FormatInit();
        } else
            this.InsertText(String.fromCharCode(key));

        return key;
    }

    CheckSelectEndEff() {
        if ((this.SelectInfo.StartItemNo == this.SelectInfo.EndItemNo)
            && (this.SelectInfo.StartItemOffset == this.SelectInfo.EndItemOffset))
        {
            this.Items[this.SelectInfo.EndItemNo].DisSelect();
            this.SelectInfo.EndItemNo = -1;
            this.SelectInfo.EndItemOffset = -1;
        }
    }

    SetSelectSeekStart() {
        this.FSelectSeekNo = this.SelectInfo.StartItemNo;
        this.FSelectSeekOffset = this.SelectInfo.StartItemOffset;
    }

    SetSelectSeekEnd() {
        this.FSelectSeekNo = this.SelectInfo.EndItemNo;
        this.FSelectSeekOffset = this.SelectInfo.EndItemOffset;
    }

    TABKeyDown(vCurItem, e) {
        if ((this.SelectInfo.StartItemOffset == 0) && (this.Items[this.SelectInfo.StartItemNo].ParaFirst)) {
            let vParaStyle = this.Style.ParaStyles[vCurItem.ParaNo];
            this.ApplyParaFirstIndent(vParaStyle.FirstIndent + THCUnitConversion.pixXToMillimeter(HC.TabCharWidth));
        } else {
            if (vCurItem.StyleNo < THCStyle.Null) {
                if (this.SelectInfo.StartItemOffset == HC.OffsetInner) {
                    if (vCurItem.WantKeyDown(e)) {
                        let vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
                        let vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                        vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                        vFormatLastItemNo = vRange.lastItemNo;
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                        vCurItem.KeyDown(e);
                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    }
                } else {
                    let vTabItem = new THCTabItem(this);
                    this.InsertItem(vTabItem);
                }
            } else {
                let vTabItem = new THCTabItem(this);
                this.InsertItem(vTabItem);
            }
        }
    }

    SelectPrio(itemNo, offset) {
        if (offset > 0) {
            if (this.Items[itemNo].StyleNo > THCStyle.Null)
                offset = offset - 1;
            else
                offset = HC.OffsetBefor;
        } else if (itemNo > 0) {
            this.Items[itemNo].DisSelect();
            itemNo = itemNo - 1;
            if (this.Items[itemNo].StyleNo < THCStyle.Null)
                offset = HC.OffsetBefor;
            else
                offset = this.Items[itemNo].length - 1;
        }

        if (HC.UNPLACEHOLDERCHAR) {
            if ((this.Items[itemNo].StyleNo > THCStyle.Null) && HC.IsUnPlaceHolderChar(this.Items[itemNo].Text[offset + 1 - 1]))
                offset = this.GetItemActualOffset(itemNo, offset) - 1;
        }

        return {
            itemNo: itemNo,
            offset: offset
        }
    }

    SelectStartItemPrio() {
        let vSelInfo = this.SelectPrio(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
        this.SelectInfo.StartItemNo = vSelInfo.itemNo;
        this.SelectInfo.StartItemOffset = vSelInfo.offset;
    }

    SelectEndItemPrio() {
        let vSelInfo = this.SelectPrio(this.SelectInfo.EndItemNo, this.SelectInfo.EndItemOffset);
        this.SelectInfo.EndItemNo = vSelInfo.itemNo;
        this.SelectInfo.EndItemOffset = vSelInfo.offset;
    }

    LeftKeyDown(vSelectExist, e) {
        if (e.Shift) {
            if (this.SelectInfo.EndItemNo >= 0) {
                if (this.IsSelectSeekStart()) {
                    this.SelectStartItemPrio();
                    this.SetSelectSeekStart();
                } else {
                    this.SelectEndItemPrio();
                    this.SetSelectSeekEnd();
                }
            } else {
                if ((this.SelectInfo.StartItemNo > 0) && (this.SelectInfo.StartItemOffset == 0)) {
                    this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                    this.SelectInfo.StartItemOffset = this.GetItemOffsetAfter(this.SelectInfo.StartItemNo);
                }

                this.SelectInfo.EndItemNo = this.SelectInfo.StartItemNo;
                this.SelectInfo.EndItemOffset = this.SelectInfo.StartItemOffset;
                this.SelectStartItemPrio();
                this.SetSelectSeekStart();
            }

            this.CheckSelectEndEff();
            this.MatchItemSelectState();
            this.Style.updateInfoRePaint();
        } else {
            if (vSelectExist) {
                for (let i = this.SelectInfo.StartItemNo; i <= this.SelectInfo.EndItemNo; i++)
                    this.Items[i].DisSelect();

                this.SelectInfo.EndItemNo = -1;
                this.SelectInfo.EndItemOffset = -1;
            } else {
                if (this.SelectInfo.StartItemOffset != 0) {
                    this.SelectInfo.StartItemOffset = this.SelectInfo.StartItemOffset - 1;
                    
                    if (HC.UNPLACEHOLDERCHAR) {
                        if (HC.IsUnPlaceHolderChar(this.Items[this.SelectInfo.StartItemNo].Text[this.SelectInfo.StartItemOffset + 1 - 1]))
                            this.SelectInfo.StartItemOffset = this.GetItemActualOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset) - 1;                   
                    }
                } else {
                    if (this.SelectInfo.StartItemNo > 0) {
                        this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                        this.SelectInfo.StartItemOffset = this.GetItemOffsetAfter(this.SelectInfo.StartItemNo);

                        if (!this.DrawItems[this.Items[this.SelectInfo.StartItemNo + 1].FirstDItemNo].LineFirst) {
                            this.KeyDown(e);
                            return;
                        }
                    } else
                        e.Handled = true;
                }
            }

            if (!e.Handled) {
                let vNewCaretDrawItemNo = this.GetDrawItemNoByOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
                if (vNewCaretDrawItemNo != this.CaretDrawItemNo) {
                    if ((vNewCaretDrawItemNo == this.CaretDrawItemNo - 1)
                        && (this.DrawItems[vNewCaretDrawItemNo].ItemNo == this.DrawItems[this.CaretDrawItemNo].ItemNo)
                        && (this.DrawItems[this.CaretDrawItemNo].LineFirst)
                        && (this.SelectInfo.StartItemOffset == this.DrawItems[this.CaretDrawItemNo].CharOffs - 1))
                    {
                        //
                    } else
                        this.CaretDrawItemNo = vNewCaretDrawItemNo;
                }
                else if (this.SelectInfo.StartRestrain) {
                    this.SelectInfo.StartRestrain = false;
                    this.Items[this.DrawItems[vNewCaretDrawItemNo].ItemNo].Active = true;
                }

                this.Style.updateInfoRePaint();
            }
        }
    }

    SelectNext(itemNo, offset) {
        if (offset == this.GetItemOffsetAfter(itemNo)) {
            if (itemNo < this.Items.count - 1) {
                itemNo++;

                if (this.Items[itemNo].StyleNo < THCStyle.Null)
                    offset = HC.OffsetAfter;
                else
                    offset = 1;
            }
        } else {
            if (this.Items[itemNo].StyleNo < THCStyle.Null)
                offset = HC.OffsetAfter;
            else
                offset = offset + 1;
        }

        if (HC.UNPLACEHOLDERCHAR)
            offset = this.GetItemActualOffset(itemNo, offset, true);

        return {
            itemNo: itemNo,
            offset: offset
        }
    }

    SelectStartItemNext() {
        let vSelInfo = this.SelectNext(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
        this.SelectInfo.StartItemNo = vSelInfo.itemNo;
        this.SelectInfo.StartItemOffset = vSelInfo.offset;
    }

    SelectEndItemNext() {
        let vSelInfo = this.SelectNext(this.SelectInfo.EndItemNo, this.SelectInfo.EndItemOffset);
        this.SelectInfo.EndItemNo = vSelInfo.itemNo;
        this.SelectInfo.EndItemOffset = vSelInfo.offset;
    }

    RightKeyDown(vSelectExist, vCurItem, e) {
        if (e.Shift) {
            if (this.SelectInfo.EndItemNo >= 0) {
                if (this.IsSelectSeekStart()) {
                    this.SelectStartItemNext();
                    this.SetSelectSeekStart();
                } else {
                    this.SelectEndItemNext();
                    this.SetSelectSeekEnd();
                }
            } else {
                if (this.SelectInfo.StartItemNo < this.Items.count - 1) {
                    if (this.Items[this.SelectInfo.StartItemNo].StyleNo < THCStyle.Null) {
                        if (this.SelectInfo.StartItemOffset == HC.OffsetAfter) {
                            this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                            this.SelectInfo.StartItemOffset = 0;
                        }
                    } else {
                        if (this.SelectInfo.StartItemOffset == this.Items[this.SelectInfo.StartItemNo].length) {
                            this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                            this.SelectInfo.StartItemOffset = 0;
                        }
                    }
                }

                this.SelectInfo.EndItemNo = this.SelectInfo.StartItemNo;
                this.SelectInfo.EndItemOffset = this.SelectInfo.StartItemOffset;
                this.SelectEndItemNext();
                this.SetSelectSeekEnd();
            }

            this.CheckSelectEndEff();
            this.MatchItemSelectState();
            this.Style.updateInfoRePaint();
        } else {
            if (vSelectExist) {
                for (let i = this.SelectInfo.StartItemNo; i <= this.SelectInfo.EndItemNo; i++)
                    this.Items[i].DisSelect();

                this.SelectInfo.StartItemNo = this.SelectInfo.EndItemNo;
                this.SelectInfo.StartItemOffset = this.SelectInfo.EndItemOffset;
                this.SelectInfo.EndItemNo = -1;
                this.SelectInfo.EndItemOffset = -1;
            } else {
                if (this.SelectInfo.StartItemOffset < vCurItem.length) {
                    if (HC.UNPLACEHOLDERCHAR)
                        this.SelectInfo.StartItemOffset = this.GetItemActualOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset + 1, true);
                    else
                        this.SelectInfo.StartItemOffset = this.SelectInfo.StartItemOffset + 1;
                } else {
                    if (this.SelectInfo.StartItemNo < this.Items.count - 1) {
                        this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                        this.SelectInfo.StartItemOffset = 0;
                        if (!this.DrawItems[this.Items[this.SelectInfo.StartItemNo].FirstDItemNo].LineFirst) {
                            this.KeyDown(e);
                            return;
                        }
                    } else
                        e.Handled = true;
                }
            }

            if (!e.Handled) {
                let  vNewCaretDrawItemNo = this.GetDrawItemNoByOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
                if (vNewCaretDrawItemNo == this.CaretDrawItemNo) {
                    if ((this.SelectInfo.StartItemOffset == this.DrawItems[vNewCaretDrawItemNo].CharOffsetEnd())
                        && (vNewCaretDrawItemNo < this.DrawItems.count - 1)
                        && (this.DrawItems[vNewCaretDrawItemNo].ItemNo == this.DrawItems[vNewCaretDrawItemNo + 1].ItemNo)
                        && (this.DrawItems[vNewCaretDrawItemNo + 1].LineFirst)
                        && (this.SelectInfo.StartItemOffset == this.DrawItems[vNewCaretDrawItemNo + 1].CharOffs - 1))
                        this.CaretDrawItemNo = vNewCaretDrawItemNo + 1;
                } else
                    this.CaretDrawItemNo = vNewCaretDrawItemNo;

                this.Style.updateInfoRePaint();
            }
        }
    }

    HomeKeyDown(vSelectExist, e) {
        if (e.Shift) {
            let vFirstDItemNo = this.GetDrawItemNoByOffset(this.FSelectSeekNo, this.FSelectSeekOffset);
            while (vFirstDItemNo > 0) {
                if (this.DrawItems[vFirstDItemNo].LineFirst)
                    break;
                else
                    vFirstDItemNo--;
            }

            if (this.SelectInfo.EndItemNo >= 0) {
                if (this.IsSelectSeekStart()) {
                    this.SelectInfo.StartItemNo = this.DrawItems[vFirstDItemNo].ItemNo;
                    this.SelectInfo.StartItemOffset = this.DrawItems[vFirstDItemNo].CharOffs - 1;
                    this.SetSelectSeekStart();
                } else {
                    if (this.DrawItems[vFirstDItemNo].ItemNo > this.SelectInfo.StartItemNo) {
                        this.SelectInfo.EndItemNo = this.DrawItems[vFirstDItemNo].ItemNo;
                        this.SelectInfo.EndItemOffset = this.DrawItems[vFirstDItemNo].CharOffs - 1;
                        this.SetSelectSeekEnd();
                    } else {
                        if (this.DrawItems[vFirstDItemNo].ItemNo == this.SelectInfo.StartItemNo) {
                            if (this.DrawItems[vFirstDItemNo].CharOffs - 1 > this.SelectInfo.StartItemOffset) {
                                this.SelectInfo.EndItemNo = this.SelectInfo.StartItemNo;
                                this.SelectInfo.EndItemOffset = this.DrawItems[vFirstDItemNo].CharOffs - 1;
                                this.SetSelectSeekEnd();
                            }
                        } else {
                            this.SelectInfo.EndItemNo = this.SelectInfo.StartItemNo;
                            this.SelectInfo.EndItemOffset = this.SelectInfo.StartItemOffset;
                            this.SelectInfo.StartItemNo = this.DrawItems[vFirstDItemNo].ItemNo;
                            this.SelectInfo.StartItemOffset = this.DrawItems[vFirstDItemNo].CharOffs - 1;
                            this.SetSelectSeekStart();
                        }
                    }
                }
            } else {
                this.SelectInfo.EndItemNo = this.SelectInfo.StartItemNo;
                this.SelectInfo.EndItemOffset = this.SelectInfo.StartItemOffset;
                this.SelectInfo.StartItemNo = this.DrawItems[vFirstDItemNo].ItemNo;
                this.SelectInfo.StartItemOffset = this.DrawItems[vFirstDItemNo].CharOffs - 1;
                this.SetSelectSeekStart();
            }

            this.CheckSelectEndEff();
            this.MatchItemSelectState();
            this.Style.updateInfoRePaint();
        } else {
            if (vSelectExist) {
                for (let i = this.SelectInfo.StartItemNo; i <= this.SelectInfo.EndItemNo; i++)
                    this.Items[i].DisSelect();

                this.SelectInfo.EndItemNo = -1;
                this.SelectInfo.EndItemOffset = -1;
            } else {
                let vFirstDItemNo = this.GetSelectStartDrawItemNo();
                let vLastDItemNo = -1;
                let vItemRang = this.GetLineDrawItemRang(vFirstDItemNo, vLastDItemNo);
                vFirstDItemNo = vItemRang.a;
                vLastDItemNo = vItemRang.b;
                this.SelectInfo.StartItemNo = this.DrawItems[vFirstDItemNo].ItemNo;
                this.SelectInfo.StartItemOffset = this.DrawItems[vFirstDItemNo].CharOffs - 1;
            }

            if (!e.Handled)
                this.CaretDrawItemNo = this.GetDrawItemNoByOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);

            this.Style.updateInfoRePaint();
        }
    }

    EndKeyDown(vSelectExist, e) {
        if (e.Shift) {
            let vLastDItemNo = this.GetDrawItemNoByOffset(this.FSelectSeekNo, this.FSelectSeekOffset);
            vLastDItemNo = vLastDItemNo + 1;
            while (vLastDItemNo < this.DrawItems.count) {
                if (this.DrawItems[vLastDItemNo].LineFirst)
                    break;
                else
                    vLastDItemNo++;
            }

            vLastDItemNo--;

            if (this.SelectInfo.EndItemNo >= 0) {
                if (this.IsSelectSeekStart()) {
                    if (this.DrawItems[vLastDItemNo].ItemNo > this.SelectInfo.EndItemNo) {
                        this.SelectInfo.StartItemNo = this.DrawItems[vLastDItemNo].ItemNo;
                        this.SelectInfo.StartItemOffset = this.DrawItems[vLastDItemNo].CharOffsetEnd();
                        this.SetSelectSeekStart();
                    } else if (this.DrawItems[vLastDItemNo].ItemNo == this.SelectInfo.EndItemNo) {
                        this.SelectInfo.StartItemNo = this.SelectInfo.EndItemNo;
                        if (this.DrawItems[vLastDItemNo].CharOffsetEnd() < this.SelectInfo.EndItemOffset) {
                            this.SelectInfo.StartItemOffset = this.DrawItems[vLastDItemNo].CharOffsetEnd();
                            this.SetSelectSeekStart();
                        } else {
                            this.SelectInfo.StartItemOffset = this.SelectInfo.EndItemOffset;
                            this.SelectInfo.EndItemOffset = this.DrawItems[vLastDItemNo].CharOffsetEnd();
                            this.SetSelectSeekEnd();
                        }
                    } else {
                        this.SelectInfo.StartItemNo = this.SelectInfo.EndItemNo;
                        this.SelectInfo.StartItemOffset = this.SelectInfo.EndItemOffset;
                        this.SelectInfo.EndItemNo = this.DrawItems[vLastDItemNo].ItemNo;
                        this.SelectInfo.EndItemOffset = this.DrawItems[vLastDItemNo].CharOffsetEnd();
                        this.SetSelectSeekEnd();
                    }
                } else {
                    this.SelectInfo.EndItemNo = this.DrawItems[vLastDItemNo].ItemNo;
                    this.SelectInfo.EndItemOffset = this.DrawItems[vLastDItemNo].CharOffsetEnd();
                    this.SetSelectSeekEnd();
                }
            } else {
                this.SelectInfo.EndItemNo = this.DrawItems[vLastDItemNo].ItemNo;
                this.SelectInfo.EndItemOffset = this.DrawItems[vLastDItemNo].CharOffsetEnd();
                this.SetSelectSeekEnd();
            }

            this.CheckSelectEndEff();
            this.MatchItemSelectState();
            this.Style.updateInfoRePaint();
        } else {
            if (vSelectExist) {
                for (let i = this.SelectInfo.StartItemNo; i <= this.SelectInfo.EndItemNo; i++)
                    this.Items[i].DisSelect();

                this.SelectInfo.StartItemNo = this.SelectInfo.EndItemNo;
                this.SelectInfo.StartItemOffset = this.SelectInfo.EndItemOffset;
                this.SelectInfo.EndItemNo = -1;
                this.SelectInfo.EndItemOffset = -1;
            } else {
                let vFirstDItemNo = this.GetSelectStartDrawItemNo();
                let vLastDItemNo = -1;
                let vItemRang = this.GetLineDrawItemRang(vFirstDItemNo, vLastDItemNo);
                vFirstDItemNo = vItemRang.a;
                vLastDItemNo = vItemRang.b;
                this.SelectInfo.StartItemNo = this.DrawItems[vLastDItemNo].ItemNo;
                this.SelectInfo.StartItemOffset = this.DrawItems[vLastDItemNo].CharOffsetEnd();
            }

            if (!e.Handled)
                this.CaretDrawItemNo = this.GetDrawItemNoByOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);

            this.Style.updateInfoRePaint();
        }
    }

    GetUpDrawItemNo(drawItemNo, drawItemOffset) {
        let vResult = false;
        let vFirstDItemNo = drawItemNo;
        let vLastDItemNo = -1;
        let vItemRang = this.GetLineDrawItemRang(vFirstDItemNo, vLastDItemNo);
        vFirstDItemNo = vItemRang.a;
        vLastDItemNo = vItemRang.b;
        if (vFirstDItemNo > 0) {
            vResult = true;
            let vX = this.DrawItems[drawItemNo].rect.left + this.GetDrawItemOffsetWidth(drawItemNo, drawItemOffset);
            vFirstDItemNo = vFirstDItemNo - 1;
            vItemRang = this.GetLineDrawItemRang(vFirstDItemNo, vLastDItemNo);
            vFirstDItemNo = vItemRang.a;
            vLastDItemNo = vItemRang.b;

            for (let i = vFirstDItemNo; i <= vLastDItemNo; i++) {
                if (this.DrawItems[i].rect.right > vX) {
                    drawItemNo = i;
                    drawItemOffset = this.DrawItems[i].CharOffs + this.GetDrawItemOffsetAt(i, vX) - 1;

                    return {
                        drawItemNo: drawItemNo,
                        drawItemOffset: drawItemOffset,
                        result: vResult
                    }
                }
            }

            drawItemNo = vLastDItemNo;
            drawItemOffset = this.DrawItems[vLastDItemNo].CharOffsetEnd();
        }

        return {
            drawItemNo: drawItemNo,
            drawItemOffset: drawItemOffset,
            result: vResult
        }
    }

    UpKeyDown(vSelectExist, e) {
        if (e.Shift) {
            let vDrawItemNo = -1, vDrawItemOffset = -1;
            let vInfo;

            if (this.SelectInfo.EndItemNo >= 0) {
                if (this.IsSelectSeekStart()) {
                    vDrawItemNo = this.GetSelectStartDrawItemNo();
                    vDrawItemOffset = this.SelectInfo.StartItemOffset - this.DrawItems[vDrawItemNo].CharOffs + 1;
                    vInfo = this.GetUpDrawItemNo(vDrawItemNo, vDrawItemOffset);
                    vDrawItemNo = vInfo.drawItemNo;
                    vDrawItemOffset = vInfo.drawItemOffset;
                    if (vInfo.result) {
                        this.SelectInfo.StartItemNo = this.DrawItems[vDrawItemNo].ItemNo;
                        this.SelectInfo.StartItemOffset = vDrawItemOffset;
                        this.SetSelectSeekStart();
                    }
                } else {
                    vDrawItemNo = this.GetSelectEndDrawItemNo();
                    vDrawItemOffset = this.SelectInfo.EndItemOffset - this.DrawItems[vDrawItemNo].CharOffs + 1;
                    vInfo = this.GetUpDrawItemNo(vDrawItemNo, vDrawItemOffset);
                    vDrawItemNo = vInfo.drawItemNo;
                    vDrawItemOffset = vInfo.drawItemOffset;
                    if (vInfo.result) {
                        if (this.DrawItems[vDrawItemNo].ItemNo > this.SelectInfo.StartItemNo) {
                            this.SelectInfo.EndItemNo = vDrawItemNo;
                            this.SelectInfo.EndItemOffset = vDrawItemOffset;
                            this.SetSelectSeekEnd();
                        } else if (this.DrawItems[vDrawItemNo].ItemNo == this.SelectInfo.StartItemNo) {
                            this.SelectInfo.EndItemNo = this.SelectInfo.StartItemNo;
                            if (vDrawItemOffset > this.SelectInfo.StartItemOffset) {
                                this.SelectInfo.EndItemOffset = vDrawItemOffset;
                                this.SetSelectSeekEnd();
                            } else {
                                this.SelectInfo.EndItemOffset = this.SelectInfo.StartItemOffset;
                                this.SelectInfo.StartItemOffset = vDrawItemOffset;
                                this.SetSelectSeekStart();
                            }
                        } else {
                            this.SelectInfo.EndItemNo = this.SelectInfo.StartItemNo;
                            this.SelectInfo.EndItemOffset = this.SelectInfo.StartItemOffset;
                            this.SelectInfo.StartItemNo = this.DrawItems[vDrawItemNo].ItemNo;
                            this.SelectInfo.StartItemOffset = vDrawItemOffset;
                            this.SetSelectSeekStart();
                        }
                    }
                }
            } else {
                vDrawItemNo = this.CaretDrawItemNo;
                vDrawItemOffset = this.SelectInfo.StartItemOffset - this.DrawItems[vDrawItemNo].CharOffs + 1;
                vInfo = this.GetUpDrawItemNo(vDrawItemNo, vDrawItemOffset);
                vDrawItemNo = vInfo.drawItemNo;
                vDrawItemOffset = vInfo.drawItemOffset;
                if (vInfo.result) {
                    this.SelectInfo.EndItemNo = this.SelectInfo.StartItemNo;
                    this.SelectInfo.EndItemOffset = this.SelectInfo.StartItemOffset;
                    this.SelectInfo.StartItemNo = this.DrawItems[vDrawItemNo].ItemNo;
                    this.SelectInfo.StartItemOffset = vDrawItemOffset;
                    this.SetSelectSeekStart();
                }
            }

            this.CheckSelectEndEff();
            this.MatchItemSelectState();
            this.Style.updateInfoRePaint();
        } else {
            if (vSelectExist) {
                this.SelectInfo.EndItemNo = -1;
                this.SelectInfo.EndItemOffset = -1;
            } else {
                let vDrawItemNo = this.CaretDrawItemNo;
                let vDrawItemOffset = this.SelectInfo.StartItemOffset - this.DrawItems[vDrawItemNo].CharOffs + 1;
                let vInfo = this.GetUpDrawItemNo(vDrawItemNo, vDrawItemOffset);
                vDrawItemNo = vInfo.drawItemNo;
                vDrawItemOffset = vInfo.drawItemOffset;
                if (vInfo.result) {
                    this.SelectInfo.StartItemNo = this.DrawItems[vDrawItemNo].ItemNo;
                    this.SelectInfo.StartItemOffset = vDrawItemOffset;
                    this.CaretDrawItemNo = vDrawItemNo;
                    this.Style.updateInfoRePaint();
                } else
                    e.Handled = true;
            }
        }
    }

    GetDownDrawItemNo(drawItemNo, drawItemOffset) {
        let vResult = false;
        let vFirstDItemNo = drawItemNo;
        let vLastDItemNo = -1;
        let vItemRang = this.GetLineDrawItemRang(vFirstDItemNo, vLastDItemNo);
        vFirstDItemNo = vItemRang.a;
        vLastDItemNo = vItemRang.b;
        if (vLastDItemNo < this.DrawItems.count - 1) {
            vResult = true;
            let vX = this.DrawItems[drawItemNo].rect.left + this.GetDrawItemOffsetWidth(drawItemNo, drawItemOffset);

            vFirstDItemNo = vLastDItemNo + 1;
            vItemRang = this.GetLineDrawItemRang(vFirstDItemNo, vLastDItemNo);
            vFirstDItemNo = vItemRang.a;
            vLastDItemNo = vItemRang.b;

            for (let i = vFirstDItemNo; i <= vLastDItemNo; i++) {
                if (this.DrawItems[i].rect.right > vX) {
                    drawItemNo = i;
                    drawItemOffset = this.DrawItems[i].CharOffs + this.GetDrawItemOffsetAt(i, vX) - 1;

                    return {
                        drawItemNo: drawItemNo,
                        drawItemOffset: drawItemOffset,
                        result: vResult
                    }
                }
            }

            drawItemNo = vLastDItemNo;
            drawItemOffset = this.DrawItems[vLastDItemNo].CharOffsetEnd();
        }

        return {
            drawItemNo: drawItemNo,
            drawItemOffset: drawItemOffset,
            result: vResult
        }
    }

    DownKeyDown(vSelectExist, e) {
        if (e.Shift) {
            let vDrawItemNo = -1, vDrawItemOffset = -1, vInfo;
            if (this.SelectInfo.EndItemNo >= 0) {
                if (this.IsSelectSeekStart()) {
                    vDrawItemNo = this.GetSelectStartDrawItemNo();
                    vDrawItemOffset = this.SelectInfo.StartItemOffset - this.DrawItems[vDrawItemNo].CharOffs + 1;
                    vInfo = this.GetDownDrawItemNo(vDrawItemNo, vDrawItemOffset);
                    vDrawItemNo = vInfo.drawItemNo;
                    vDrawItemOffset = vInfo.drawItemOffset;
                    if (vInfo.result) {
                        if (this.DrawItems[vDrawItemNo].ItemNo < this.SelectInfo.EndItemNo) {
                            this.SelectInfo.StartItemNo = this.SelectInfo.EndItemNo;
                            this.SelectInfo.StartItemOffset = this.SelectInfo.EndItemOffset;
                            this.SetSelectSeekStart();
                        } else if (this.DrawItems[vDrawItemNo].ItemNo == this.SelectInfo.EndItemNo) {
                            this.SelectInfo.StartItemNo = this.SelectInfo.EndItemNo;
                            if (vDrawItemOffset < this.SelectInfo.EndItemOffset) {
                                this.SelectInfo.StartItemOffset = vDrawItemOffset;
                                this.SetSelectSeekStart();
                            } else {
                                this.SelectInfo.StartItemOffset = this.SelectInfo.EndItemOffset;
                                this.SelectInfo.EndItemOffset = vDrawItemOffset;
                                this.SetSelectSeekEnd();
                            }
                        } else {
                            this.SelectInfo.StartItemNo = this.SelectInfo.EndItemNo;
                            this.SelectInfo.StartItemOffset = this.SelectInfo.EndItemOffset;
                            this.SelectInfo.EndItemNo = this.DrawItems[vDrawItemNo].ItemNo;
                            this.SelectInfo.EndItemOffset = vDrawItemOffset;
                            this.SetSelectSeekEnd();
                        }
                    }
                } else {
                    vDrawItemNo = this.GetSelectEndDrawItemNo();
                    vDrawItemOffset = this.SelectInfo.EndItemOffset - this.DrawItems[vDrawItemNo].CharOffs + 1;
                    vInfo = this.GetDownDrawItemNo(vDrawItemNo, vDrawItemOffset);
                    vDrawItemNo = vInfo.drawItemNo;
                    vDrawItemOffset = vInfo.drawItemOffset;
                    if (vInfo.result) {
                        this.SelectInfo.EndItemNo = this.DrawItems[vDrawItemNo].ItemNo;
                        this.SelectInfo.EndItemOffset = vDrawItemOffset;
                        this.SetSelectSeekEnd();
                    }
                }
            } else {
                vDrawItemNo = this.CaretDrawItemNo;
                vDrawItemOffset = this.SelectInfo.StartItemOffset - this.DrawItems[vDrawItemNo].CharOffs + 1;
                vInfo = this.GetDownDrawItemNo(vDrawItemNo, vDrawItemOffset);
                vDrawItemNo = vInfo.drawItemNo;
                vDrawItemOffset = vInfo.drawItemOffset;
                if (vInfo.result) {
                    this.SelectInfo.EndItemNo = this.DrawItems[vDrawItemNo].ItemNo;
                    this.SelectInfo.EndItemOffset = vDrawItemOffset;
                    this.SetSelectSeekEnd();
                }
            }

            this.CheckSelectEndEff();
            this.MatchItemSelectState();
            this.Style.updateInfoRePaint();
        } else {
            if (vSelectExist) {
                this.SelectInfo.StartItemNo = this.SelectInfo.EndItemNo;
                this.SelectInfo.StartItemOffset = this.SelectInfo.EndItemOffset;
                this.SelectInfo.EndItemNo = -1;
                this.SelectInfo.EndItemOffset = -1;
            } else {
                let vDrawItemNo = this.CaretDrawItemNo;
                let vDrawItemOffset = this.SelectInfo.StartItemOffset - this.DrawItems[vDrawItemNo].CharOffs + 1;
                let vInfo = this.GetDownDrawItemNo(vDrawItemNo, vDrawItemOffset);
                vDrawItemNo = vInfo.drawItemNo;
                vDrawItemOffset = vInfo.drawItemOffset;
                if (vInfo.result) {
                    this.SelectInfo.StartItemNo = this.DrawItems[vDrawItemNo].ItemNo;
                    this.SelectInfo.StartItemOffset = vDrawItemOffset;
                    this.CaretDrawItemNo = vDrawItemNo;
                    this.Style.updateInfoRePaint();
                } else
                    e.Handled = true;
            }
        }
    }

    RectItemKeyDown(vSelectExist, vCurItem, e, pageBreak) {
        let Key = e.keyCode;
        let vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
        let vRectItem = vCurItem;// as HCCustomRectItem;
        let vRange;

        if (this.SelectInfo.StartItemOffset == HC.OffsetInner) {
            if (vRectItem.WantKeyDown(e)) {
                this.Undo_New();
                if (vRectItem.MangerUndo)
                    this.UndoAction_ItemSelf(this.SelectInfo.StartItemNo, HC.OffsetInner);
                else
                    this.UndoAction_ItemMirror(this.SelectInfo.StartItemNo, HC.OffsetInner);

                vRectItem.KeyDown(e);
                if (vRectItem.SizeChanged) {
                    vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                    vFormatLastItemNo = vRange.lastItemNo;
                    this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    vRectItem.SizeChanged = false;
                } else
                    this.FormatInit();
            } else {
                switch (Key) {
                    case TKey.Back:
                        this.SelectInfo.StartItemOffset = HC.OffsetAfter;
                        vCurItem = this.RectItemKeyDown(vSelectExist, vCurItem, e, pageBreak);
                        break;

                    case TKey.Delete:
                        this.SelectInfo.StartItemOffset = HC.OffsetBefor;
                        vCurItem = this.RectItemKeyDown(vSelectExist, vCurItem, e, pageBreak);
                        break;

                    case TKey.Left:
                        this.SelectInfo.StartItemOffset = HC.OffsetBefor;
                        vRectItem.Active = false;
                        this.Style.updateInfoRePaint();
                        break;

                    case TKey.Right:
                        this.SelectInfo.StartItemOffset = HC.OffsetAfter;
                        vRectItem.Active = false;
                        this.Style.updateInfoRePaint();
                        break;
                }
            }
        } else if (this.SelectInfo.StartItemOffset == HC.OffsetBefor) {
            switch (Key) {
                case TKey.Left:
                        this.LeftKeyDown(vSelectExist, e);
                    break;

                case TKey.Right:
                    if (e.Shift)
                        this.RightKeyDown(vSelectExist, vCurItem, e);
                    else {
                        if (vRectItem.WantKeyDown(e))
                            this.SelectInfo.StartItemOffset = HC.OffsetInner;
                        else
                            this.SelectInfo.StartItemOffset = HC.OffsetAfter;

                        this.CaretDrawItemNo = this.Items[this.SelectInfo.StartItemNo].FirstDItemNo;
                    }
                    break;

                case TKey.Up:
                    this.UpKeyDown(vSelectExist, e);
                    break;

                case TKey.Down:
                    this.DownKeyDown(vSelectExist, e);
                    break;

                case TKey.End:
                    this.EndKeyDown(vSelectExist, e);
                    break;

                case TKey.Home:
                    this.HomeKeyDown(vSelectExist, e);
                    break;

                case TKey.Return:
                    if (!this.DoAcceptAction(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, THCAction.ReturnItem))
                        return;

                    vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                    vFormatLastItemNo = vRange.lastItemNo;
                    this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                    if (vCurItem.ParaFirst) {
                        vCurItem = this.CreateDefaultTextItem();
                        vCurItem.ParaFirst = true;
                        this.Items.insert(this.SelectInfo.StartItemNo, vCurItem);

                        this.Undo_New();
                        this.UndoAction_InsertItem(this.SelectInfo.StartItemNo, 0);

                        if (pageBreak) {
                            this.UndoAction_ItemPageBreak(this.SelectInfo.StartItemNo + 1, 0, true);
                            this.Items[this.SelectInfo.StartItemNo + 1].PageBreak = true;
                        }

                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo + 1, 1);

                        this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                        this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
                    } else {
                        this.Undo_New();

                        this.UndoAction_ItemParaFirst(this.SelectInfo.StartItemNo, 0, true);
                        vCurItem.ParaFirst = true;

                        if (pageBreak) {
                            this.UndoAction_ItemPageBreak(this.SelectInfo.StartItemNo, 0, true);
                            vCurItem.PageBreak = true;
                        }

                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    }

                    break;

                case TKey.Back:
                    if (vCurItem.ParaFirst && this.DoAcceptAction(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, THCAction.BackDeleteText)) {
                        if (this.SelectInfo.StartItemNo > 0) {
                            if (vCurItem.ParaFirst && (this.SelectInfo.StartItemNo > 0)) {
                                vFormatFirstDrawItemNo = this.GetFormatFirstDrawItem(this.SelectInfo.StartItemNo - 1,
                                    this.GetItemOffsetAfter(this.SelectInfo.StartItemNo - 1));

                                vFormatLastItemNo = this.GetParaLastItemNo(this.SelectInfo.StartItemNo);
                            } else {
                                vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                                vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                                vFormatLastItemNo = vRange.lastItemNo;
                            }

                            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                            this.Undo_New();

                            if (this.IsEmptyLine(this.SelectInfo.StartItemNo - 1)) {
                                this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo - 1, 0);
                                this.Items.delete(this.SelectInfo.StartItemNo - 1);
                                this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);
                                this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo, 0);
                            } else {
                                this.UndoAction_ItemParaFirst(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, false);
                                vCurItem.ParaFirst = false;

                                if (vCurItem.PageBreak) {
                                    this.UndoAction_ItemPageBreak(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, false);
                                    vCurItem.PageBreak = false;
                                }

                                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
                            }
                        }
                    } else {
                        this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                        this.SelectInfo.StartItemOffset = this.GetItemOffsetAfter(this.SelectInfo.StartItemNo);
                        this.KeyDown(e);
                    }
                    break;

                case TKey.Delete:
                    if (!this.DoAcceptAction(this.SelectInfo.StartItemNo, this.SelectInfo.startItemOffset, THCAction.DeleteItem)) {
                        this.SelectInfo.StartItemOffset = HC.OffsetAfter;
                        return vCurItem;
                    }

                    vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                    vFormatLastItemNo = vRange.lastItemNo;
                    this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                    if (vCurItem.ParaFirst) {
                        if (this.SelectInfo.StartItemNo != vFormatLastItemNo) {
                            this.Undo_New();
                            this.UndoAction_ItemParaFirst(this.SelectInfo.StartItemNo + 1, 0, true);
                            this.Items[this.SelectInfo.StartItemNo + 1].ParaFirst = true;
                            this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, 0);
                            this.Items.delete(this.SelectInfo.StartItemNo);
                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);
                        } else {
                            this.Undo_New();
                            this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, 0);
                            this.Items.delete(this.SelectInfo.StartItemNo);
                            vCurItem = this.CreateDefaultTextItem();
                            vCurItem.ParaFirst = true;
                            this.Items.insert(this.SelectInfo.StartItemNo, vCurItem);
                            this.UndoAction_InsertItem(this.SelectInfo.StartItemNo, 0);
                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
                        }
                    } else {
                        if (this.SelectInfo.StartItemNo < vFormatLastItemNo) {
                            let vLen = this.GetItemOffsetAfter(this.SelectInfo.StartItemNo - 1);

                            this.Undo_New();
                            this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, 0);
                            this.Items.delete(this.SelectInfo.StartItemNo);
                            if (this.MergeItemText(this.Items[this.SelectInfo.StartItemNo - 1], this.Items[this.SelectInfo.StartItemNo])) {
                                this.UndoAction_InsertText(this.SelectInfo.StartItemNo - 1,
                                    this.Items[this.SelectInfo.StartItemNo - 1].length + 1, this.Items[this.SelectInfo.StartItemNo].Text);

                                this.Items.delete(this.SelectInfo.StartItemNo);
                                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 2, -2);
                            } else
                                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);

                            this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                            this.SelectInfo.StartItemOffset = vLen;
                        } else {
                            this.Undo_New();
                            this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, 0);
                            this.Items.delete(this.SelectInfo.StartItemNo);

                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);

                            this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                            this.SelectInfo.StartItemOffset = this.GetItemOffsetAfter(this.SelectInfo.StartItemNo);
                        }
                    }

                    this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
                    break;

                case TKey.Tab:
                    this.TABKeyDown(vCurItem, e);
                    break;
            }
        } else if (this.SelectInfo.StartItemOffset == HC.OffsetAfter) {
            switch (Key) {
                case TKey.Back:
                    if (!this.DoAcceptAction(this.SelectInfo.StartItemNo, this.SelectInfo.startItemOffset, THCAction.DeleteItem)) {
                        this.SelectInfo.StartItemOffset = HC.OffsetBefor;
                        return vCurItem;
                    }

                    vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                    vFormatLastItemNo = vRange.lastItemNo;
                    this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                    if (vCurItem.ParaFirst) {
                        if ((this.SelectInfo.StartItemNo >= 0)
                            && (this.SelectInfo.StartItemNo < this.Items.count - 1)
                            && (!this.Items[this.SelectInfo.StartItemNo + 1].ParaFirst))
                        {
                            this.Undo_New();
                            this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
                            this.Items.delete(this.SelectInfo.StartItemNo);

                            this.UndoAction_ItemParaFirst(this.SelectInfo.StartItemNo, 0, true);
                            this.Items[this.SelectInfo.StartItemNo].ParaFirst = true;
                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);

                            this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo, 0);
                        } else {
                            this.Undo_New();
                            this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, 0);
                            this.Items.delete(this.SelectInfo.StartItemNo);

                            let vItem = this.CreateDefaultTextItem();
                            vItem.ParaFirst = true;
                            this.Items.insert(this.SelectInfo.StartItemNo, vItem);
                            this.UndoAction_InsertItem(this.SelectInfo.StartItemNo, 0);
                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
                            this.SelectInfo.StartItemOffset = 0;
                        }
                    } else {
                        this.SelectInfo.StartItemOffset = HC.OffsetBefor;
                        let vKeys = TKey.Delete;
                        if (e.Shift)
                            vKeys |= TKey.ShiftKey;

                        if (e.Alt)
                            vKeys |= TKey.Menu;
                        
                        let vArgs = new TKeyEventArgs();
                        vArgs.assign(e);
                        vArgs.keyCode = vKeys;
                        vCurItem = this.RectItemKeyDown(vSelectExist, vCurItem, vArgs, pageBreak);
                    }
                    break;

                case TKey.Delete:
                    if (this.SelectInfo.StartItemNo < this.Items.count - 1) {
                        if (this.Items[this.SelectInfo.StartItemNo + 1].ParaFirst) {
                            vFormatFirstDrawItemNo = this.GetFormatFirstDrawItem(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
                            vFormatLastItemNo = this.GetParaLastItemNo(this.SelectInfo.StartItemNo + 1);
                            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                            this.Undo_New();
                            if (this.IsEmptyLine(this.SelectInfo.StartItemNo + 1)) {
                                this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo + 1, 0);
                                this.Items.delete(this.SelectInfo.StartItemNo + 1);
                                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);
                            } else {
                                this.UndoAction_ItemParaFirst(this.SelectInfo.StartItemNo + 1, 0, false);
                                this.Items[this.SelectInfo.StartItemNo + 1].ParaFirst = false;
                                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
                                this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo + 1, 0);
                            }
                        } else {
                            this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                            this.SelectInfo.StartItemOffset = 0;
                            this.KeyDown(e);
                        }
                    }
                    break;

                case TKey.Left:
                    if (e.Shift)
                        this.LeftKeyDown(vSelectExist, e);
                    else {
                        if (vRectItem.WantKeyDown(e))
                            this.SelectInfo.StartItemOffset = HC.OffsetInner;
                        else
                            this.SelectInfo.StartItemOffset = HC.OffsetBefor;

                        this.CaretDrawItemNo = this.Items[this.SelectInfo.StartItemNo].FirstDItemNo;
                    }
                    break;

                case TKey.Right:
                    this.RightKeyDown(vSelectExist, vCurItem, e);
                    break;

                case TKey.Up:
                    this.UpKeyDown(vSelectExist, e);
                    break;

                case TKey.Down:
                    this.DownKeyDown(vSelectExist, e);
                    break;

                case TKey.End:
                    this.EndKeyDown(vSelectExist, e);
                    break;

                case TKey.Home:
                    this.HomeKeyDown(vSelectExist, e);
                    break;

                case TKey.Return:
                    if (!this.DoAcceptAction(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, THCAction.ReturnItem))
                        return;

                    vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                    vFormatLastItemNo = vRange.lastItemNo;
                    this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                    this.Undo_New();
                    if ((this.SelectInfo.StartItemNo < this.Items.count - 1)
                            && (!this.Items[this.SelectInfo.StartItemNo + 1].ParaFirst))
                    {
                        this.UndoAction_ItemParaFirst(this.SelectInfo.StartItemNo + 1, 0, true);
                        this.Items[this.SelectInfo.StartItemNo + 1].ParaFirst = true;

                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
                        this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                        this.SelectInfo.StartItemOffset = 0;
                        this.CaretDrawItemNo = this.Items[this.SelectInfo.StartItemNo].FirstDItemNo;
                    } else {
                        vCurItem = this.CreateDefaultTextItem();
                        vCurItem.ParaFirst = true;
                        vCurItem.PageBreak = pageBreak;

                        this.Items.insert(this.SelectInfo.StartItemNo + 1, vCurItem);
                        this.UndoAction_InsertItem(this.SelectInfo.StartItemNo + 1, 0);

                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo + 1, 1);
                        this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo + 1, vCurItem.length);
                    }
                    break;

                case TKey.Tab:
                    this.TABKeyDown(vCurItem, e);
                    break;
            }
        }

        return vCurItem;
    }

    EnterKeyDown(vCurItem, e, pageBreak) {
        if (!this.DoAcceptAction(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, THCAction.ReturnItem))
            return;

        let vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
        let vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
        vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
        vFormatLastItemNo = vRange.lastItemNo;
        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
        if (this.SelectInfo.StartItemOffset == 0) {
            if (!vCurItem.ParaFirst) {
                this.Undo_New();
                this.UndoAction_ItemParaFirst(this.SelectInfo.StartItemNo, 0, true);
                vCurItem.ParaFirst = true;

                if (pageBreak) {
                    this.UndoAction_ItemPageBreak(this.SelectInfo.StartItemNo, 0, true);
                    vCurItem.PageBreak = true;
                }

                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo, 0, pageBreak);
            } else {
                if (pageBreak) {
                    this.Undo_New();
                    if (this.Items.count == 1) {
                        let vItem = this.CreateDefaultTextItem();
                        vItem.StyleNo = vCurItem.StyleNo;
                        vItem.ParaNo = vCurItem.ParaNo;
                        vItem.ParaFirst = true;

                        this.UndoAction_ItemPageBreak(this.SelectInfo.StartItemNo, 0, true);
                        vCurItem.PageBreak = true;

                        this.Items.insert(this.SelectInfo.StartItemNo, vItem);
                        this.UndoAction_InsertItem(this.SelectInfo.StartItemNo, 0);

                        this.SelectInfo.StartItemNo++;
                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo + 1, 1);
                    } else {
                        this.UndoAction_ItemPageBreak(this.SelectInfo.StartItemNo, 0, true);
                        vCurItem.PageBreak = true;
                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo, 0, true);
                    }
                } else {
                    let vItem = this.CreateDefaultTextItem();
                    vItem.ParaNo = vCurItem.ParaNo;
                    vItem.StyleNo = vCurItem.StyleNo;
                    vItem.ParaFirst = true;
                    this.Items.insert(this.SelectInfo.StartItemNo, vItem);

                    this.Undo_New();
                    this.UndoAction_InsertItem(this.SelectInfo.StartItemNo, 0);

                    this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                    this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo + 1, 1);
                }
            }
        } else if (this.SelectInfo.StartItemOffset == vCurItem.length) {
            let vItem = null;
            if (this.SelectInfo.StartItemNo < this.Items.count - 1) {
                vItem = this.Items[this.SelectInfo.StartItemNo + 1];  // 下一个Item
                if (!vItem.ParaFirst) {
                    this.Undo_New();
                    this.UndoAction_ItemParaFirst(this.SelectInfo.StartItemNo + 1, 0, true);
                    vItem.ParaFirst = true;

                    if (pageBreak) {
                        this.UndoAction_ItemPageBreak(this.SelectInfo.StartItemNo + 1, 0, true);
                        vItem.PageBreak = true;
                    }

                    this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo, 0, pageBreak);
                } else {
                    vItem = this.CreateDefaultTextItem();
                    vItem.ParaNo = vCurItem.ParaNo;
                    vItem.StyleNo = vCurItem.StyleNo;
                    vItem.ParaFirst = true;

                    if (pageBreak)
                        vItem.PageBreak = true;

                    this.Items.insert(this.SelectInfo.StartItemNo + 1, vItem);

                    this.Undo_New();
                    this.UndoAction_InsertItem(this.SelectInfo.StartItemNo + 1, 0);
                    this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo + 1, 1, pageBreak);
                }

                this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                this.SelectInfo.StartItemOffset = 0;
            } else {
                vItem = this.CreateDefaultTextItem();
                vItem.ParaNo = vCurItem.ParaNo;
                vItem.StyleNo = vCurItem.StyleNo;
                vItem.ParaFirst = true;

                if (pageBreak)
                    vItem.PageBreak = true;

                this.Items.insert(this.SelectInfo.StartItemNo + 1, vItem);

                this.Undo_New();
                this.UndoAction_InsertItem(this.SelectInfo.StartItemNo + 1, 0);

                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo + 1, 1, pageBreak);
                this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                this.SelectInfo.StartItemOffset = 0;
            }
        } else {
            let vItem = vCurItem.BreakByOffset(this.SelectInfo.StartItemOffset);

            this.Undo_New();
            this.UndoAction_DeleteText(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset + 1, vItem.Text);

            vItem.ParaFirst = true;

            if (pageBreak)
                vItem.PageBreak = true;

            this.Items.insert(this.SelectInfo.StartItemNo + 1, vItem);
            this.UndoAction_InsertItem(this.SelectInfo.StartItemNo + 1, 0);

            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo + 1, 1, pageBreak);

            this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
            this.SelectInfo.StartItemOffset = 0;
        }

        if (!e.Handled)
            this.CaretDrawItemNo = this.GetDrawItemNoByOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
    }

    DeleteKeyDown(vCurItem, e) {
        if (!this.DoAcceptAction(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, THCAction.DeleteText)) {
            this.SelectInfo.StartItemOffset = this.Items[this.SelectInfo.StartItemNo].length;
            this.ReSetSelectAndCaret(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
            return;
        }

        let vDelCount = 0, vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
        let vCurItemNo = this.SelectInfo.StartItemNo;
        let vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
        vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
        vFormatLastItemNo = vRange.lastItemNo;

        if (this.SelectInfo.StartItemOffset == vCurItem.length) {
            if (vCurItemNo != this.Items.count - 1) {
                if (this.Items[vCurItemNo + 1].ParaFirst) {
                    vFormatLastItemNo = this.GetParaLastItemNo(vCurItemNo + 1);
                    if (vCurItem.length == 0) {
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                        this.Undo_New();
                        this.UndoAction_DeleteItem(vCurItemNo, 0);
                        this.Items.delete(vCurItemNo);

                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);
                    } else {
                        if (this.Items[vCurItemNo + 1].StyleNo < THCStyle.Null) {
                            vFormatLastItemNo = this.GetParaLastItemNo(vCurItemNo + 1);  // 获取下一段最后一个
                            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                            this.Undo_New();
                            this.UndoAction_ItemParaFirst(vCurItemNo + 1, 0, false);
                            this.Items[vCurItemNo + 1].ParaFirst = false;

                            if (this.Items[vCurItemNo + 1].PageBreak) {
                                this.UndoAction_ItemPageBreak(vCurItemNo + 1, 0, false);
                                this.Items[vCurItemNo + 1].PageBreak = false;
                            }

                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);

                            this.SelectInfo.StartItemNo = vCurItemNo + 1;
                            this.SelectInfo.StartItemOffset = HC.OffsetBefor;
                        } else {
                            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                            if (this.Items[vCurItemNo + 1].length == 0) {
                                this.Undo_New();
                                this.UndoAction_DeleteItem(vCurItemNo + 1, 0);
                                this.Items.delete(vCurItemNo + 1);
                                vDelCount++;
                            } else {
                                if (vCurItem.CanConcatItems(this.Items[vCurItemNo + 1])) {
                                    this.Undo_New();
                                    this.UndoAction_InsertText(vCurItemNo, vCurItem.length + 1, this.Items[vCurItemNo + 1].Text);
                                    vCurItem.Text = vCurItem.Text + this.Items[vCurItemNo + 1].Text;

                                    this.UndoAction_DeleteItem(vCurItemNo + 1, 0);
                                    this.Items.delete(vCurItemNo + 1);

                                    vDelCount++;
                                } else
                                    this.Items[vCurItemNo + 1].ParaFirst = false;

                                let vParaNo = this.Items[vCurItemNo].ParaNo;
                                for (let i = vCurItemNo + 1; i <= vFormatLastItemNo - vDelCount; i++)
                                    this.Items[i].ParaNo = vParaNo;
                            }

                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - vDelCount, -vDelCount);
                        }
                    }
                } else {
                    this.SelectInfo.StartItemNo = vCurItemNo + 1;
                    this.SelectInfo.StartItemOffset = 0;
                    this.CaretDrawItemNo = this.Items[this.SelectInfo.StartItemNo].FirstDItemNo;

                    this.KeyDown(e);
                    return;
                }
            }
        } else {
            let vsDelete;
            let vText = this.Items[vCurItemNo].Text;
            if (HC.UNPLACEHOLDERCHAR) {
                let vCharCount = HC.GetTextActualOffset(vText, this.SelectInfo.StartItemOffset + 1, true) - this.SelectInfo.StartItemOffset;
                vsDelete = vText.substr(this.SelectInfo.StartItemOffset + 1 - 1, vCharCount);
                vText = vText.delete(this.SelectInfo.StartItemOffset + 1 - 1, vCharCount);
            } else {
                vsDelete = vText.substr(this.SelectInfo.StartItemOffset + 1 - 1, 1);
                vCurItem.Text = vText.delete(this.SelectInfo.StartItemOffset + 1 - 1, 1);
            }
            
            this.DoItemAction(vCurItemNo, this.SelectInfo.StartItemOffset + 1, THCAction.DeleteText);

            if (vText == "") {
                if (!this.DrawItems[this.Items[vCurItemNo].FirstDItemNo].LineFirst) {
                    if (vCurItemNo < this.Items.count - 1) {
                        let vLen = -1;
                        if (this.MergeItemText(this.Items[vCurItemNo - 1], this.Items[vCurItemNo + 1])) {
                            vLen = this.Items[vCurItemNo + 1].length;

                            this.Undo_New();
                            this.UndoAction_InsertText(vCurItemNo - 1, this.Items[vCurItemNo - 1].length - vLen + 1, this.Items[vCurItemNo + 1].Text);

                            vRange = this.GetFormatRangeByOffset(vCurItemNo - 1, vLen, vFormatFirstDrawItemNo, vFormatLastItemNo);
                            vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                            vFormatLastItemNo = vRange.lastItemNo;
                            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                                
                            this.UndoAction_DeleteItem(vCurItemNo, 0);
                            this.Items.delete(vCurItemNo);

                            this.UndoAction_DeleteItem(vCurItemNo, 0);
                            this.Items.delete(vCurItemNo);

                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 2, -2);
                        } else {
                            vLen = 0;
                            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                            this.Undo_New();
                            this.UndoAction_DeleteItem(vCurItemNo, 0);
                            this.Items.delete(vCurItemNo);

                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);
                        }

                        this.SelectInfo.StartItemNo = vCurItemNo - 1;
                        if (this.GetItemStyle(this.SelectInfo.StartItemNo) < THCStyle.Null)
                            this.SelectInfo.StartItemOffset = HC.OffsetAfter;
                        else
                            this.SelectInfo.StartItemOffset = this.Items[this.SelectInfo.StartItemNo].length - vLen;
                    } else {
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                        this.Undo_New();
                        this.UndoAction_DeleteItem(vCurItemNo, 0);
                        this.Items.delete(vCurItemNo);

                        this.SelectInfo.StartItemNo = vCurItemNo - 1;
                        this.SelectInfo.StartItemOffset = this.GetItemOffsetAfter(this.SelectInfo.StartItemNo);
                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);
                    }
                } else {
                    if (vCurItemNo != vFormatLastItemNo) {
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                        this.SelectInfo.StartItemOffset = 0;

                        this.Undo_New();
                        this.UndoAction_ItemParaFirst(vCurItemNo + 1, 0, this.Items[vCurItemNo].ParaFirst);
                        this.Items[vCurItemNo + 1].ParaFirst = this.Items[vCurItemNo].ParaFirst;

                        this.Undo_New();
                        this.UndoAction_DeleteItem(vCurItemNo, 0);
                        this.Items.delete(vCurItemNo);

                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);
                    } else {
                        this.FormatPrepare(vFormatFirstDrawItemNo);

                        let vPageBreak = vCurItem.PageBreak;

                        this.Undo_New();
                        this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, 0);
                        this.Items.delete(this.SelectInfo.StartItemNo);

                        let vItem = this.CreateDefaultTextItem();
                        vItem.ParaFirst = true;
                        vItem.PageBreak = vPageBreak;

                        this.Items.insert(this.SelectInfo.StartItemNo, vItem);
                        this.UndoAction_InsertItem(this.SelectInfo.StartItemNo, 0);

                        this.SelectInfo.StartItemOffset = 0;
                        this.ReFormatData(vFormatFirstDrawItemNo);
                    }
                }
            } else {
                vCurItem.Text = vText;

                this.Undo_New();
                this.UndoAction_DeleteText(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset + 1, vsDelete);

                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
            }
        }

        if (!e.Handled)
            this.CaretDrawItemNo = this.GetDrawItemNoByOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
    }

    BackspaceKeyDown(vSelectExist, vCurItem, vParaFirstItemNo, vParaLastItemNo, e) {
        if (!this.DoAcceptAction(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, THCAction.BackDeleteText)) {
            this.SelectInfo.StartItemOffset = 0;
            this.ReSetSelectAndCaret(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
            return;
        }

        let vCurItemNo = -1, vLen = -1, vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
        let vParaNo = -1, vDelCount = 0;
        let vParaFirst = false;
        let vRange;

        if (this.SelectInfo.StartItemOffset == 0) {
            if ((vCurItem.Text == "") && (this.Style.ParaStyles[vCurItem.ParaNo].AlignHorz != TParaAlignHorz.Justify))
                this.ApplyParaAlignHorz(TParaAlignHorz.Justify);
            else if (vCurItem.ParaFirst && (this.Style.ParaStyles[vCurItem.ParaNo].FirstIndent > 0)) {
                let vParaStyle = this.Style.ParaStyles[vCurItem.ParaNo];
                this.ApplyParaFirstIndent(vParaStyle.FirstIndent - THCUnitConversion.pixXToMillimeter(HC.TabCharWidth));
            } else if (vCurItem.PageBreak) {
                vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                vFormatLastItemNo = vRange.lastItemNo;
                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                this.Undo_New();
                this.UndoAction_ItemPageBreak(this.SelectInfo.StartItemNo, 0, false);
                vCurItem.PageBreak = false;

                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo, 0, true);
            } else if (this.SelectInfo.StartItemNo != 0) {
                if (vCurItem.ParaFirst) {
                    vLen = this.Items[this.SelectInfo.StartItemNo - 1].length;
                    if (vCurItem.CanConcatItems(this.Items[this.SelectInfo.StartItemNo - 1])) {
                        vFormatFirstDrawItemNo = this.GetFormatFirstDrawItem(this.SelectInfo.StartItemNo - 1, vLen);
                        vFormatLastItemNo = this.GetParaLastItemNo(this.SelectInfo.StartItemNo);
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                        this.Undo_New();
                        this.UndoAction_InsertText(this.SelectInfo.StartItemNo - 1, this.Items[this.SelectInfo.StartItemNo - 1].length + 1,
                            this.Items[this.SelectInfo.StartItemNo].Text);

                        this.Items[this.SelectInfo.StartItemNo - 1].Text = this.Items[this.SelectInfo.StartItemNo - 1].Text
                            + this.Items[this.SelectInfo.StartItemNo].Text;

                        this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
                        this.Items.delete(this.SelectInfo.StartItemNo);

                        vParaNo = this.Items[this.SelectInfo.StartItemNo - 1].ParaNo;
                        if (vParaNo != vCurItem.ParaNo) {
                            for (let i = this.SelectInfo.StartItemNo; i <= vFormatLastItemNo - 1; i++) {
                                this.Items[i].ParaNo = vParaNo;
                            }
                        }

                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);

                        this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo - 1, vLen);
                    } else {
                        if (this.IsEmptyLine(this.SelectInfo.StartItemNo - 1)) {
                            vFormatFirstDrawItemNo = this.GetFormatFirstDrawItem(this.SelectInfo.StartItemNo - 1, vLen);
                            vFormatLastItemNo = this.GetParaLastItemNo(this.SelectInfo.StartItemNo);
                            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                            this.Undo_New();
                            this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo - 1, 0);
                            this.Items.delete(this.SelectInfo.StartItemNo - 1);

                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);
                            this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo - 1, 0);
                        } else {
                            if (vCurItem.length == 0) {
                                vFormatFirstDrawItemNo = this.GetFormatFirstDrawItem(this.SelectInfo.StartItemNo - 1, vLen);
                                this.FormatPrepare(vFormatFirstDrawItemNo, this.SelectInfo.StartItemNo);

                                this.Undo_New();
                                this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
                                this.Items.delete(this.SelectInfo.StartItemNo);

                                this.ReFormatData(vFormatFirstDrawItemNo, this.SelectInfo.StartItemNo - 1, -1);
                                this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo - 1);
                            } else {
                                vFormatFirstDrawItemNo = this.GetFormatFirstDrawItem(this.SelectInfo.StartItemNo - 1, this.GetItemOffsetAfter(this.SelectInfo.StartItemNo - 1));
                                vFormatLastItemNo = this.GetParaLastItemNo(this.SelectInfo.StartItemNo);
                                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                                this.Undo_New();
                                this.UndoAction_ItemParaFirst(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, false);

                                vCurItem.ParaFirst = false;
                                vParaNo = this.Items[this.SelectInfo.StartItemNo - 1].ParaNo;
                                if (vParaNo != vCurItem.ParaNo) {
                                    for (let i = this.SelectInfo.StartItemNo; i <= vFormatLastItemNo; i++)
                                        this.Items[i].ParaNo = vParaNo;
                                }

                                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
                                this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo, 0);
                            }
                        }
                    }
                } else {
                   // 从前一个最后开始重新处理
                   this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                   this.SelectInfo.StartItemOffset = this.GetItemOffsetAfter(this.SelectInfo.StartItemNo);
                   this.CaretDrawItemNo = this.Items[this.SelectInfo.StartItemNo].FirstDItemNo;
                   this.KeyDown(e);
                   return;
                }
            }
        } else {
            if (vCurItem.length == 1) {
                vCurItemNo = this.SelectInfo.StartItemNo;
                if (!this.DrawItems[this.Items[vCurItemNo].FirstDItemNo].LineFirst) {
                    vLen = this.Items[vCurItemNo - 1].length;

                    if ((vCurItemNo > 0) && (vCurItemNo < vParaLastItemNo)
                        && this.MergeItemText(this.Items[vCurItemNo - 1], this.Items[vCurItemNo + 1]))
                    {
                        this.Undo_New();
                        this.UndoAction_InsertText(vCurItemNo - 1, this.Items[vCurItemNo - 1].length - this.Items[vCurItemNo + 1].length + 1,
                            this.Items[vCurItemNo + 1].Text);

                        vRange = this.GetFormatRangeByOffset(vCurItemNo - 1, vLen, vFormatFirstDrawItemNo, vFormatLastItemNo);
                        vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                        vFormatLastItemNo = vRange.lastItemNo;
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                        this.UndoAction_DeleteItem(vCurItemNo, this.Items[vCurItemNo].length);
                        this.Items.delete(vCurItemNo);

                        this.UndoAction_DeleteItem(vCurItemNo, 0);
                        this.Items.delete(vCurItemNo);

                        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 2, -2);
                        this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo - 1, vLen);
                    } else {
                        if (this.SelectInfo.StartItemNo == vParaLastItemNo) {
                            vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                            vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                            vFormatLastItemNo = vRange.lastItemNo;
                            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                            this.Undo_New();
                            this.UndoAction_DeleteItem(vCurItemNo, this.SelectInfo.StartItemOffset);
                            this.Items.delete(vCurItemNo);

                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);
                            this.ReSetSelectAndCaret(vCurItemNo - 1);
                        } else {
                            vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                            vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                            vFormatLastItemNo = vRange.lastItemNo;
                            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                            this.Undo_New();
                            this.UndoAction_DeleteItem(vCurItemNo, this.Items[vCurItemNo].length);
                            this.Items.delete(vCurItemNo);

                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);
                            this.ReSetSelectAndCaret(vCurItemNo - 1);
                        }
                    }
                } else {
                    if (this.Items[vCurItemNo].ParaFirst) {
                        vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                        vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                        vFormatLastItemNo = vRange.lastItemNo;
                        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                        if (vCurItemNo < vFormatLastItemNo) {
                            this.Undo_New();

                            vParaFirst = true;
                            this.UndoAction_DeleteItem(vCurItemNo, this.Items[vCurItemNo].length);
                            this.Items.delete(vCurItemNo);

                            if (vParaFirst) {
                                this.UndoAction_ItemParaFirst(vCurItemNo, 0, vParaFirst);
                                this.Items[vCurItemNo].ParaFirst = vParaFirst;
                            }

                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);
                            this.ReSetSelectAndCaretByOffset(vCurItemNo, 0);
                        } else {
                            let vPageBreak = vCurItem.PageBreak;

                            this.Undo_New();
                            this.UndoAction_DeleteItem(this.SelectInfo.StartItemNo, 0);
                            this.Items.delete(this.SelectInfo.StartItemNo);

                            let vItem = this.CreateDefaultTextItem();
                            vItem.ParaFirst = true;
                            vItem.PageBreak = vPageBreak;

                            this.Items.insert(this.SelectInfo.StartItemNo, vItem);
                            this.UndoAction_InsertItem(this.SelectInfo.StartItemNo, 0);
                            this.SelectInfo.StartItemOffset = 0;
                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
                        }
                    } else {
                        this.Undo_New();

                        if (vCurItemNo < this.GetParaLastItemNo(vCurItemNo)) {
                            vLen = this.Items[vCurItemNo - 1].length;
                            if (this.MergeItemText(this.Items[vCurItemNo - 1], this.Items[vCurItemNo + 1])) {
                                this.UndoAction_InsertText(vCurItemNo - 1,
                                    this.Items[vCurItemNo - 1].length - this.Items[vCurItemNo + 1].length + 1, this.Items[vCurItemNo + 1].Text);

                                vRange = this.GetFormatRangeByOffset(vCurItemNo - 1, this.GetItemOffsetAfter(vCurItemNo - 1), vFormatFirstDrawItemNo, vFormatLastItemNo);
                                vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                                vFormatLastItemNo = vRange.lastItemNo;
                                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                                this.UndoAction_DeleteItem(vCurItemNo, this.Items[vCurItemNo].length);
                                this.Items.delete(vCurItemNo);

                                this.UndoAction_DeleteItem(vCurItemNo, this.Items[vCurItemNo].length);
                                this.Items.delete(vCurItemNo);

                                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 2, -2);
                                this.ReSetSelectAndCaretByOffset(vCurItemNo - 1, vLen);
                            } else {
                                vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                                vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                                vFormatLastItemNo = vRange.lastItemNo;
                                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                                this.UndoAction_DeleteItem(vCurItemNo, this.Items[vCurItemNo].length);
                                this.Items.delete(vCurItemNo);

                                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);
                                this.ReSetSelectAndCaret(vCurItemNo - 1);
                            }
                        } else {
                            vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                            vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                            vFormatLastItemNo = vRange.lastItemNo;
                            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                            this.UndoAction_DeleteItem(vCurItemNo, this.Items[vCurItemNo].length);
                            this.Items.delete(vCurItemNo);

                            this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - 1, -1);
                            this.ReSetSelectAndCaret(vCurItemNo - 1);
                        }
                    }
                }
            } else {
                vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                vFormatLastItemNo = vRange.lastItemNo;
                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                this.DoItemAction(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, THCAction.BackDeleteText);
                let vText = vCurItem.Text;

                this.Undo_New();
                this.UndoAction_DeleteBackText(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, vText.substr(this.SelectInfo.StartItemOffset - 1, 1));

                vCurItem.Text = vText.delete(this.SelectInfo.StartItemOffset - 1, 1);
                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);

                this.SelectInfo.StartItemOffset = this.SelectInfo.StartItemOffset - 1;
                this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
            }
        }

        return vCurItem;
    }

    KeyDown(e, pageBreak = false) {
        if (HC.IsKeyDownEdit(e.keyCode) && (!this.CanEdit()))
            return;

        let Key = e.keyCode;

        if ((Key == TKey.Back)
            || (Key == TKey.Delete)
            || (Key == TKey.Return)
            || (Key == TKey.Tab))
            this.InitializeMouseField();  // 如果Item删除完了，原MouseMove处ItemNo可能不存在了，再MouseMove时清除旧的出错

        let vCurItem = this.GetActiveItem();
        if (vCurItem == null)
            return;

        let vSelectExist = this.SelectExists();
        if (vSelectExist && ((Key == TKey.Back)
                                || (Key == TKey.Delete)
                                || (Key == TKey.Return)
                                || (Key == TKey.Tab))
            )
        {
            if (!this.DeleteSelected())
                return;

            if ((Key == TKey.Back) || (Key == TKey.Delete))
                return;
        }

        let vParaFirstItemNo = -1, vParaLastItemNo = -1;
        let vItemRang = this.GetParaItemRang(this.SelectInfo.StartItemNo, vParaFirstItemNo, vParaLastItemNo);
        vParaFirstItemNo = vItemRang.a;
        vParaLastItemNo = vItemRang.b;

        if (vCurItem.StyleNo < THCStyle.Null)
            vCurItem = this.RectItemKeyDown(vSelectExist, vCurItem, e, pageBreak);
        else {
            switch (Key) {
                case TKey.Back:
                    vCurItem = this.BackspaceKeyDown(vSelectExist, vCurItem, vParaFirstItemNo, vParaLastItemNo, e);
                    break;

                case TKey.Return:
                    this.EnterKeyDown(vCurItem, e, pageBreak);
                    break;

                case TKey.Left:
                    this.LeftKeyDown(vSelectExist, e);
                    break;

                case TKey.Right:
                    this.RightKeyDown(vSelectExist, vCurItem, e);
                    break;

                case TKey.Delete:
                    this.DeleteKeyDown(vCurItem, e);
                    break;

                case TKey.Home:
                    this.HomeKeyDown(vSelectExist, e);
                    break;

                case TKey.End:
                    this.EndKeyDown(vSelectExist, e);
                    break;

                case TKey.Up:
                    this.UpKeyDown(vSelectExist, e);
                    break;

                case TKey.Down:
                    this.DownKeyDown(vSelectExist, e);
                    break;

                case TKey.Tab:
                    this.TABKeyDown(vCurItem, e);
                    break;
            }
        }

        switch (Key) {
            case TKey.Back:
            case TKey.Delete:
            case TKey.Return:
            case TKey.Tab:
                this.Style.updateInfoRePaint();
                this.Style.updateInfoReCaret();
                this.Style.updateInfoReScroll();
                break;

            case TKey.Left:
            case TKey.Right:
            case TKey.Up:
            case TKey.Down:
            case TKey.Home:
            case TKey.End:
                if (vSelectExist)
                    this.Style.updateInfoRePaint();

                this.Style.updateInfoReCaret();
                this.Style.updateInfoReScroll();
                break;
        }
    }

    KeyUp(e) {
        if (!this.CanEdit())
            return;
    }

    DoInsertTextBefor(itemNo, offset, text) {
        return text != "";
    }

    DblClick(x, y) {
        this.FMouseLBDouble = true;
        let vItemNo = -1, vItemOffset = -1, vDrawItemNo = -1;
        let vRestrain = false;
        let vInfo = this.GetItemAt(x, y, vItemNo, vItemOffset, vDrawItemNo, vRestrain);
        vItemNo = vInfo.itemNo;
        vItemOffset = vInfo.offset;
        vDrawItemNo = vInfo.drawItemNo;
        vRestrain = vInfo.restrain;

        if (vItemNo < 0)
            return;

        if (this.Items[vItemNo].StyleNo < THCStyle.Null) {
            let vPoint = this.CoordToItemOffset(x, y, vItemNo, vItemOffset, -1, -1);
            this.Items[vItemNo].DblClick(vPoint.x, vPoint.y);
        } else if (this.Items[vItemNo].length > 0) {
            let vText = this.GetDrawItemText(vDrawItemNo);
            vItemOffset = vItemOffset - this.DrawItems[vDrawItemNo].CharOffs + 1;

            let vPosType;
            if (vItemOffset > 0)
                vPosType = HC.GetUnicodeCharType(vText[vItemOffset - 1]);
            else
                vPosType = HC.GetUnicodeCharType(vText[1 - 1]);

            let vStartOffset = 0;
            for (let i = vItemOffset - 1; i >= 1; i--) {
                if (HC.GetUnicodeCharType(vText[i - 1]) != vPosType) {
                    vStartOffset = i;
                    break;
                }
            }

            let vEndOffset = vText.length;
            for (let i = vItemOffset + 1; i <= vText.length; i++) {
                if (HC.GetUnicodeCharType(vText[i - 1]) != vPosType) {
                    vEndOffset = i - 1;
                    break;
                }
            }

            this.SelectInfo.StartItemNo = vItemNo;
            this.SelectInfo.StartItemOffset = vStartOffset + this.DrawItems[vDrawItemNo].CharOffs - 1;

            if (vStartOffset != vEndOffset) {
                this.SelectInfo.EndItemNo = vItemNo;
                this.SelectInfo.EndItemOffset = vEndOffset + this.DrawItems[vDrawItemNo].CharOffs - 1;
                this.MatchItemSelectState();
            }
        }

        this.Style.updateInfoRePaint();
        this.Style.updateInfoReCaret(false);
    }

    DeleteItems(startNo, endNo, keepPara) {
        if (!this.CanEdit())
            return;

        if (endNo < startNo)
            return;

        this.InitializeField();

        let vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
        let vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
        vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
        vFormatLastItemNo = vRange.lastItemNo;

        if (this.Items[startNo].ParaFirst && (vFormatFirstDrawItemNo > 0))
            vFormatFirstDrawItemNo--;

        this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

        let vStartParaFirst = this.Items[startNo].ParaFirst;
        let vDelCount = endNo - startNo + 1;
        this.Undo_New();
        for (let i = endNo; i >= startNo; i--) {
            this.UndoAction_DeleteItem(i, 0);
            this.Items.delete(i);
        }

        if (this.Items.count == 0) {
            let vItem = this.CreateDefaultTextItem();
            this.CurStyleNo = vItem.StyleNo;
            vItem.ParaFirst = true;
            this.Items.add(vItem);
            vDelCount--;
            this.UndoAction_InsertItem(0, 0);
        } else if (vStartParaFirst) {
            if ((startNo < this.Items.count - 1) && (!this.Items[startNo].ParaFirst)) {
                this.UndoAction_ItemParaFirst(startNo, 0, true);
                this.Items[startNo].ParaFirst = true;
            } else if (keepPara) {
                let vItem = this.CreateDefaultTextItem();
                this.CurStyleNo = vItem.StyleNo;
                vItem.ParaFirst = true;
                this.Items.insert(startNo, vItem);
                vDelCount--;
                this.UndoAction_InsertItem(startNo, 0);
            }
        }

        this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo - vDelCount, -vDelCount);
        this.Style.updateInfoRePaint();
        this.Style.updateInfoReCaret();

        if (vStartParaFirst && keepPara)
            this.ReSetSelectAndCaretByOffset(startNo, 0);
        else if (startNo > 0)
            this.ReSetSelectAndCaretByOffset(startNo - 1);
        else
            this.ReSetSelectAndCaretByOffset(0, 0);
    }

    DeleteActiveDataItems(startNo, endNo, keepPara) {
        if ((startNo < 0) || (startNo > this.Items.count - 1))
            return;

        let vActiveItem = this.Items[startNo];
        if ((vActiveItem.StyleNo < THCStyle.Null)
            && (this.SelectInfo.StartItemOffset == HC.OffsetInner))
        {
            this.Undo_New();

            let vRectItem = vActiveItem;// as HCCustomRectItem;
            if (vRectItem.MangerUndo)
                this.UndoAction_ItemSelf(this.SelectInfo.StartItemNo, HC.OffsetInner);
            else
                this.UndoAction_ItemMirror(this.SelectInfo.StartItemNo, HC.OffsetInner);

            vRectItem.DeleteActiveDataItems(startNo, endNo, keepPara);
            if (vRectItem.SizeChanged) {
                let vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
                let vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                vFormatLastItemNo = vRange.lastItemNo;
                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
                vRectItem.SizeChanged = false;
            } else
                this.FormatInit();
        } else
            this.DeleteItems(startNo, endNo, keepPara);
    }

    AddData(srcData) {
        this.InitializeField();

        let vAddStartNo = 0;
        if ((this.Items.count > 0) && (this.Items[this.Items.count - 1].CanConcatItems(srcData.Items[0]))) {
            this.Items[this.Items.count - 1].Text = this.Items[this.Items.count - 1].Text + srcData.Items[0].Text;
            vAddStartNo = 1;
        } else
            vAddStartNo = 0;

        for (let i = vAddStartNo; i <= srcData.Items.count - 1; i++) {
            if (!srcData.IsEmptyLine(i)) {
                let vItem = this.CreateItemByStyle(srcData.Items[i].StyleNo);
                vItem.Assign(srcData.Items[i]);
                vItem.Active = false;
                vItem.DisSelect();
                this.Items.add(vItem);
            }
        }
    }

    InsertBreak() {
        if (!this.CanEdit())
            return false;

        let e = new TKeyEventArgs(TKey.Return);
        this.KeyDown(e);
        this.InitializeMouseField();
        return true;
    }

    DoTextItemInsert(text, newPara, vAddCount) {
        let vResult = false;
        let vTextItem = this.Items[this.SelectInfo.StartItemNo];// as HCTextItem;

        if (vTextItem.StyleNo == this.CurStyleNo) {
            let vOffset = 0;

            if (this.SelectInfo.StartItemOffset == 0) {
                vOffset = text.length;

                if (newPara) {
                    let vNewItem = this.CreateDefaultTextItem();
                    vNewItem.ParaFirst = true;
                    vNewItem.Text = text;

                    this.Items.insert(this.SelectInfo.StartItemNo, vNewItem);
                    this.UndoAction_InsertItem(this.SelectInfo.StartItemNo, 0);
                    vAddCount++;
                } else if (vTextItem.AcceptAction(0, this.SelectInfo.StartRestrain, THCAction.ConcatText)) {
                    this.UndoAction_InsertText(this.SelectInfo.StartItemNo, 1, text);
                    vTextItem.Text = text + vTextItem.Text;
                } else {
                    if (vTextItem.ParaFirst) {
                        let vNewItem = this.CreateDefaultTextItem();
                        vNewItem.Text = text;
                        vNewItem.ParaFirst = true;

                        this.UndoAction_ItemParaFirst(this.SelectInfo.StartItemNo, 0, false);
                        vTextItem.ParaFirst = false;

                        this.Items.insert(this.SelectInfo.StartItemNo, vNewItem);
                        this.UndoAction_InsertItem(this.SelectInfo.StartItemNo, 0);
                        vAddCount++;
                    } else if (this.Items[this.SelectInfo.StartItemNo - 1].StyleNo > THCStyle.Null) {
                            vTextItem = this.Items[this.SelectInfo.StartItemNo - 1];
                            if (vTextItem.AcceptAction(vTextItem.Length, true, THCAction.ConcatText))
                            //and MergeItemText(Items[SelectInfo.StartItemNo - 1], vNewItem)
                            {
                                this.UndoAction_InsertText(this.SelectInfo.StartItemNo - 1, vTextItem.length + 1, text);
                                vTextItem.Text = vTextItem.Text + text;
                                this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                                vOffset = vTextItem.length;
                            } else {
                                let vNewItem = this.CreateDefaultTextItem();
                                vNewItem.Text = text;

                                this.Items.insert(this.SelectInfo.StartItemNo, vNewItem);
                                this.UndoAction_InsertItem(this.SelectInfo.StartItemNo, 0);
                                vAddCount++;
                            }
                        } else {
                            let vNewItem = this.CreateDefaultTextItem();
                            vNewItem.Text = text;

                            this.Items.insert(this.SelectInfo.StartItemNo, vNewItem);
                            this.UndoAction_InsertItem(this.SelectInfo.StartItemNo, 0);
                            vAddCount++;
                        }
                    }
                } else if (this.SelectInfo.StartItemOffset == vTextItem.length) {
                    if (newPara) {
                        let vNewItem = this.CreateDefaultTextItem();
                        vNewItem.ParaFirst = true;
                        vNewItem.Text = text;

                        this.Items.insert(this.SelectInfo.StartItemNo + 1, vNewItem);
                        this.UndoAction_InsertItem(this.SelectInfo.StartItemNo + 1, 0);
                        vAddCount++;

                        this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                        vOffset = vNewItem.length;
                    } else if (vTextItem.AcceptAction(this.SelectInfo.StartItemOffset, this.SelectInfo.StartRestrain, THCAction.ConcatText)) {
                        this.UndoAction_InsertText(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset + 1, text);
                        vTextItem.Text = vTextItem.Text + text;
                        vOffset = vTextItem.length;
                    } else if (!this.IsParaLastItem(this.SelectInfo.StartItemNo)) {
                        if (this.Items[this.SelectInfo.StartItemNo + 1].StyleNo > THCStyle.Null) {
                            vTextItem = this.Items[this.SelectInfo.StartItemNo + 1];
                            if (vTextItem.AcceptAction(0, true, THCAction.ConcatText))
                            //and MergeItemText(Items[SelectInfo.StartItemNo - 1], vNewItem)
                            {
                                this.UndoAction_InsertText(this.SelectInfo.StartItemNo + 1, 1, text);
                                vTextItem.Text = text + vTextItem.Text;
                                this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                                vOffset = AText.length;
                            } else {
                                let vNewItem = this.CreateDefaultTextItem();
                                vNewItem.Text = text;

                                this.Items.Insert(this.SelectInfo.StartItemNo + 1, vNewItem);
                                this.UndoAction_InsertItem(this.SelectInfo.StartItemNo + 1, 0);
                                vAddCount++;
                                this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                                vOffset = AText.length;
                            }
                        } else {
                            let vNewItem = this.CreateDefaultTextItem();
                            vNewItem.Text = text;

                            this.Items.Insert(this.SelectInfo.StartItemNo + 1, vNewItem);
                            this.UndoAction_InsertItem(this.SelectInfo.StartItemNo + 1, 0);
                            vAddCount++;
                            this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                            vOffset = AText.length;
                        }
                    } else {
                        let vNewItem = this.CreateDefaultTextItem();
                        vNewItem.Text = text;

                        this.Items.Insert(this.SelectInfo.StartItemNo + 1, vNewItem);
                        this.UndoAction_InsertItem(this.SelectInfo.StartItemNo + 1, 0);
                        vAddCount++;
                        this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                        vOffset = AText.length;
                    }
                } else {
                    if (newPara) {
                        let vS = vTextItem.SubString(this.SelectInfo.StartItemOffset + 1 - 1, vTextItem.length - this.SelectInfo.StartItemOffset);
                        this.UndoAction_DeleteText(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset + 1, vS);
                        let vAfterItem = vTextItem.BreakByOffset(this.SelectInfo.StartItemOffset);
                        vAfterItem.Text = text + vAfterItem.Text;
                        vAfterItem.ParaFirst = true;
                        this.Items.insert(this.SelectInfo.StartItemNo + 1, vAfterItem);
                        this.UndoAction_InsertItem(this.SelectInfo.StartItemNo + 1, 0);
                        vAddCount++;

                        this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                        vOffset = text.length;
                    } else {
                        vOffset = this.SelectInfo.StartItemOffset + text.length;
                        let vS = vTextItem.Text;
                        vS = vS.insert(this.SelectInfo.StartItemOffset, text);
                        this.UndoAction_InsertText(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset + 1, text);
                        vTextItem.Text = vS;
                    }
                }

                this.SelectInfo.StartItemOffset = vOffset;

                vResult = true;
        } else {
            let vNewItem = this.CreateDefaultTextItem();
            vNewItem.ParaFirst = newPara;
            vNewItem.Text = text;

            if (this.SelectInfo.StartItemOffset == 0) {
                if ((!vNewItem.ParaFirst) && vTextItem.ParaFirst) {
                    vNewItem.ParaFirst = true;
                    this.UndoAction_ItemParaFirst(this.SelectInfo.StartItemNo, 0, false);
                    vTextItem.ParaFirst = false;
                }

                this.Items.insert(this.SelectInfo.StartItemNo, vNewItem);
                this.UndoAction_InsertItem(this.SelectInfo.StartItemNo, 0);
                vAddCount++;

                this.SelectInfo.StartItemOffset = vNewItem.length;
            } else if (this.SelectInfo.StartItemOffset == vTextItem.length) {
                this.Items.insert(this.SelectInfo.StartItemNo + 1, vNewItem);
                this.UndoAction_InsertItem(this.SelectInfo.StartItemNo + 1, 0);
                vAddCount++;

                this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                this.SelectInfo.StartItemOffset = vNewItem.length;
            } else {
                let vS = vTextItem.SubString(this.SelectInfo.StartItemOffset + 1, vTextItem.length - this.SelectInfo.StartItemOffset);
                this.UndoAction_DeleteText(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset + 1, vS);
                let vAfterItem = vTextItem.BreakByOffset(this.SelectInfo.StartItemOffset);
                vAfterItem.ParaFirst = false;
                this.Items.insert(this.SelectInfo.StartItemNo + 1, vNewItem);
                this.UndoAction_InsertItem(this.SelectInfo.StartItemNo + 1, 0);
                vAddCount++;
                this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                this.SelectInfo.StartItemOffset = vNewItem.length;
                this.Items.insert(this.SelectInfo.StartItemNo + 1, vAfterItem);
                this.UndoAction_InsertItem(this.SelectInfo.StartItemNo + 1, 0);
                vAddCount++;
            }
        }

        this.CurStyleNo = this.Items[this.SelectInfo.StartItemNo].StyleNo;
        return {
            addCount: vAddCount,
            result: vResult
        }
    }

    DoInsertTextEx(text, newPara, vAddCount) {
        let vItem = this.Items[this.SelectInfo.StartItemNo];

        if (vItem.StyleNo < THCStyle.Null) {
            if (this.SelectInfo.StartItemOffset == HC.OffsetAfter) {
                if ((this.SelectInfo.StartItemNo < this.Items.count - 1)
                    && (this.Items[this.SelectInfo.StartItemNo + 1].StyleNo > THCStyle.Null)
                    && (!this.Items[this.SelectInfo.StartItemNo + 1].ParaFirst))
                {
                    this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                    this.SelectInfo.StartItemOffset = 0;
                    this.CurStyleNo = this.Items[this.SelectInfo.StartItemNo].StyleNo;
                    vAddCount = this.DoInsertTextEx(text, newPara, vAddCount);
                } else {
                    vItem = this.CreateDefaultTextItem();
                    vItem.Text = text;
                    vItem.ParaFirst = newPara;

                    this.Items.insert(this.SelectInfo.StartItemNo + 1, vItem);
                    this.UndoAction_InsertItem(this.SelectInfo.StartItemNo + 1, 0);
                    vAddCount++;

                    this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo + 1;
                    this.SelectInfo.StartItemOffset = vItem.length;
                    this.CurStyleNo = vItem.StyleNo;
                }
            } else {
                if ((this.SelectInfo.StartItemNo > 0)
                    && (this.Items[this.SelectInfo.StartItemNo - 1].StyleNo > THCStyle.Null)
                    && (!this.Items[this.SelectInfo.StartItemNo].ParaFirst))
                {
                    this.SelectInfo.StartItemNo = this.SelectInfo.StartItemNo - 1;
                    this.SelectInfo.StartItemOffset = this.Items[this.SelectInfo.StartItemNo].length;
                    this.CurStyleNo = this.Items[this.SelectInfo.StartItemNo].StyleNo;
                    vAddCount = this.DoInsertTextEx(text, newPara, vAddCount);
                } else {
                    vItem = this.CreateDefaultTextItem();
                    vItem.Text = text;

                    if (newPara)
                        vItem.ParaFirst = true;
                    else if (this.Items[this.SelectInfo.StartItemNo].ParaFirst) {
                        this.UndoAction_ItemParaFirst(this.SelectInfo.StartItemNo, 0, false);
                        this.Items[this.SelectInfo.StartItemNo].ParaFirst = false;
                        vItem.ParaFirst = true;
                    }

                    this.Items.insert(this.SelectInfo.StartItemNo, vItem);  // 在两个RectItem中间插入
                    this.UndoAction_InsertItem(this.SelectInfo.StartItemNo, 0);
                    vAddCount++;

                    this.SelectInfo.StartItemOffset = vItem.length;
                    this.CurStyleNo = vItem.StyleNo;
                }
            }
        } else {
            let vInsInfo = this.DoTextItemInsert(text, newPara, vAddCount);
            vAddCount = vInsInfo.addCount;
        }

        return vAddCount;
    }

    InsertText(text) {
        if (!this.CanEdit())
            return false;

        if (!this.DoAcceptAction(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, THCAction.InsertText))
            return false;

        if (!this.DoInsertTextBefor(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, text))
            return false;

        if (!this.DeleteSelected())
            return false;

        let vResult = false;

        this.Undo_GroupBegin(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
        try {
            this.Undo_New();

            let vRange;
            let vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
            if ((this.Items[this.SelectInfo.StartItemNo].StyleNo < THCStyle.Null)
                && (this.SelectInfo.StartItemOffset == HC.OffsetInner))
            {
                let vRectItem = this.Items[this.SelectInfo.StartItemNo];// as HCCustomRectItem;
                if (vRectItem.MangerUndo)
                    this.UndoAction_ItemSelf(this.SelectInfo.StartItemNo, HC.OffsetInner);
                else
                    this.UndoAction_ItemMirror(this.SelectInfo.StartItemNo, HC.OffsetInner);

                vResult = vRectItem.InsertText(text);
                if (vRectItem.SizeChanged) {
                    vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                    vFormatLastItemNo = vRange.lastItemNo;
                    this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);
                    vRectItem.SizeChanged = false;
                } else
                    this.FormatInit();
            } else {
                let vNewPara = false;
                let vAddCount = 0;
                this.CurStyleNo = this.Items[this.SelectInfo.StartItemNo].StyleNo;
                vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                vFormatLastItemNo = vRange.lastItemNo;
                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

                let vStrings = text.split(HC.sLineBreak);

                let vS;
                for (let i = 0; i < vStrings.length; i++) {
                    vS = vStrings[i];
                    vAddCount = this.DoInsertTextEx(vS, vNewPara, vAddCount);
                    vNewPara = true;
                }

                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo + vAddCount, vAddCount);
                vResult = true;
            }

            this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
        } finally {
            this.Undo_GroupEnd(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
        }

        this.InitializeMouseField();

        this.Style.updateInfoRePaint();
        this.Style.updateInfoReCaret();
        this.Style.updateInfoReScroll();

        return vResult;
    }

    InsertTable(rowCount, colCount) {
        if (!this.CanEdit())
            return false;

        let vResult = false;

        let vTopData = this.GetTopLevelData();// as HCRichData;
        let vItem = new THCTableItem(vTopData, rowCount, colCount, vTopData.width);
        vResult = this.InsertItem(vItem);
        this.InitializeMouseField();
        return vResult;
    }

    InsertImage(image) {
        if (!this.CanEdit())
            return false;

        let vResult = false;
        let vTopData = this.GetTopLevelData();// as HCRichData;
        let vImageItem = new THCImageItem(vTopData);
        vImageItem.Image = image;
        vImageItem.width = image.width;
        vImageItem.height = image.height;
        vImageItem.RestrainSize(vTopData.width, vImageItem.height);
        vResult = this.InsertItem(vImageItem);
        this.InitializeMouseField();

        return vResult;
    }

    InsertGifImage(file) {
        if (!this.CanEdit())
            return false;

        let vResult = false;
        let vTopData = this.GetTopLevelData();// as HCRichData;
        let vGifItem = new THCGifItem(vTopData);
        vGifItem.LoadFromFile(file);
        vResult = this.InsertItem(vGifItem);
        this.InitializeMouseField();

        return vResult;
    }

    InsertLine(lineHeight) {
        if (!this.CanEdit())
            return false;

        let vResult = false;
        let vItem = new THCLineItem(this, this.width, lineHeight);
        vResult = this.InsertItem(vItem);
        this.InitializeMouseField();

        return vResult;
    }

    SetActiveImage(imageStream) {
        if (!this.CanEdit())
            return false;

        return this.RectItemAction((rectItem) => {
            rectItem.Image.loadFromStream(imageStream);// = new TImage(imageStream);
            return true;
        });
    }

    ActiveTableResetRowCol(rowCount, colCount) {
        if (!this.CanEdit())
            return false;

        return this.RectItemAction((rectItem) => {
            return rectItem.ResetRowCol(this.Width, rowCount, colCount);
        });
    }

    TableInsertRowAfter(rowCount) {
        if (!this.CanEdit())
            return false;

        return this.RectItemAction((rectItem) => {
            return rectItem.InsertRowAfter(rowCount);
        });
    }

    TableInsertRowBefor(rowCount) {
        if (!this.CanEdit())
            return false;

        return this.RectItemAction((item) => {
            return item.InsertRowBefor(rowCount);
        });
    }

    ActiveTableDeleteCurRow() {
        if (!this.CanEdit())
            return false;

        return this.RectItemAction((rectItem) => {
            return rectItem.DeleteCurRow();
        });
    }

    ActiveTableSplitCurRow() {
        if (!this.CanEdit())
            return false;

        return this.RectItemAction((rectItem) => {
            return rectItem.SplitCurRow();
        });
    }

    ActiveTableSplitCurCol() {
        if (!this.CanEdit())
            return false;

        return this.RectItemAction((rectItem) => {
            return rectItem.SplitCurCol();
        });
    }

    TableInsertColAfter(colCount) {
        if (!this.CanEdit())
            return false;

        return this.RectItemAction((rectItem) => {
            return rectItem.InsertColAfter(colCount);
        });
    }

    TableInsertColBefor(colCount) {
        if (!this.CanEdit())
            return false;

        return this.RectItemAction((rectItem) => {
            return rectItem.InsertColBefor(colCount);
        });
    }

    ActiveTableDeleteCurCol() {
        if (!this.CanEdit())
            return false;

        return this.RectItemAction((rectItem) => {
            return rectItem.DeleteCurCol();
        });
    }

    MergeTableSelectCells() {
        if (!this.CanEdit())
            return false;

        return this.RectItemAction((rectItem) => {
            return rectItem.MergeSelectCells();
        });
    }

    TableApplyContentAlign(align) {
        if (!this.CanEdit())
            return false;

        return this.RectItemAction((rectItem) => {
            rectItem.ApplyContentAlign(align);
            return true;
        });
    }

    ActiveItemReAdaptEnvironment() {
        if (!this.CanEdit())
            return;

        this.InitializeField();
        let vActiveItem = this.GetActiveItem();
        if (vActiveItem == null)
            return;

        let vRange;
        let vFormatFirstDrawItemNo = -1, vFormatLastItemNo = -1;
        if ((vActiveItem.StyleNo < THCStyle.Null)
            && (this.SelectInfo.StartItemOffset == HC.OffsetInner))
        {
            this.Undo_New();

            let vRectItem = vActiveItem;// as HCCustomRectItem;
            if (vRectItem.MangerUndo)
                this.UndoAction_ItemSelf(this.SelectInfo.StartItemNo, HC.OffsetInner);
            else
                this.UndoAction_ItemMirror(this.SelectInfo.StartItemNo, HC.OffsetInner);

            vRectItem.ActiveItemReAdaptEnvironment();
            if (vRectItem.SizeChanged) {
                vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
                vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                vFormatLastItemNo = vRange.lastItemNo;
                this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);
                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo);

                vRectItem.SizeChanged = false;
            } else
                this.FormatInit();
        } else {
            let vExtraCount = 0;
            vRange = this.GetFormatRange(vFormatFirstDrawItemNo, vFormatLastItemNo);
            vFormatFirstDrawItemNo = vRange.firstDrawItemNo;
            vFormatLastItemNo = vRange.lastItemNo;
            this.FormatPrepare(vFormatFirstDrawItemNo, vFormatLastItemNo);

            this.Undo_New();

            let vItemNo = this.SelectInfo.StartItemNo;
            if (this.MergeItemToNext(vItemNo)) {
                this.UndoAction_InsertText(vItemNo, this.Items[vItemNo].length - this.Items[vItemNo + 1].length + 1, this.Items[vItemNo + 1].Text);
                this.UndoAction_DeleteItem(vItemNo + 1, 0);
                this.Items.delete(vItemNo + 1);
                vExtraCount--;
            } if (vItemNo > 0) {
                let vLen = this.Items[vItemNo - 1].length;
                if (this.MergeItemToPrio(vItemNo)) {
                    this.UndoAction_InsertText(vItemNo - 1, this.Items[vItemNo - 1].length - this.Items[vItemNo].length + 1, this.Items[vItemNo].Text);
                    this.UndoAction_DeleteItem(vItemNo, 0);
                    this.Items.delete(vItemNo);
                    vExtraCount--;

                    this.ReSetSelectAndCaretByOffset(this.SelectInfo.StartItemNo - 1, vLen + this.SelectInfo.StartItemOffset);
                }
            }

            if (vExtraCount != 0) {
                this.ReFormatData(vFormatFirstDrawItemNo, vFormatLastItemNo + vExtraCount, vExtraCount);
                this.Style.updateInfoRePaint();
                this.Style.updateInfoReCaret();
            }
        }
    }

    DisActive() {
        this.InitializeField();

        if (this.Items.count > 0) {
            let vItem = this.GetActiveItem();
            if (vItem != null)
                vItem.Active = false;
        }
    }

    GetHint() {
        if ((!this.FMouseMoveRestrain) && (this.FMouseMoveItemNo >= 0))
            return this.Items[this.FMouseMoveItemNo].GetHint();
        else
            return "";
    }

    get MouseDownItemNo() {
        return this.FMouseDownItemNo;
    }

    get MouseDownItemOffset() {
        return this.FMouseDownItemOffset;
    }

    get MouseMoveItemNo() {
        return this.FMouseMoveItemNo;
    }

    get MouseMoveItemOffset() {
        return this.FMouseMoveItemOffset;
    }

    get MouseMoveRestrain() {
        return this.FMouseMoveRestrain;
    }

    get height() {
        return this.GetHeight();
    }

    get ReadOnly() {
        return this.FReadOnly;
    }

    set ReadOnly(val) {
        this.SetReadOnly(val);
    }

    get Selecting() {
        return this.FSelecting;
    }

    get OnItemResized() {
        return this.FOnItemResized;
    }

    set OnItemResized(val) {
        this.FOnItemResized = val;
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

    get OnCreateItem() {
        return this.FOnCreateItem;
    }

    set OnCreateItem(val) {
        this.FOnCreateItem = val;
    }

    get OnAcceptAction() {
        return this.FOnAcceptAction;
    }

    set OnAcceptAction(val) {
        this.FOnAcceptAction = val;
    }
}