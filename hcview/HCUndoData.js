import { HC, THCAction } from "./HCCommon.js";
import { THCFormatData } from "./HCFormatData.js";
import { THCStyle } from "./HCStyle.js";
import { THCDataUndo, THCItemPageBreakUndoAction, THCItemParaFirstUndoAction, THCItemParaUndoAction, THCItemStyleUndoAction, THCUndoGroupBegin, THCUndoGroupEnd, TItemProperty } from "./HCUndo.js";
import { system } from "../hcl/System.js";

export class THCUndoData extends THCFormatData {
    constructor(style) {
        super(style);
        this.FFormatFirstItemNo;
        this.FFormatFirstDrawItemNo;
        this.FFormatLastItemNo;
        this.FUndoGroupCount = 0;
        this.FItemAddCount = 0;
        this.FForceClearExtra;
    }

    UndoRedoDeleteBackText(action, isUndo, caretItemNo, caretOffset) {
        let vAction = action;
        caretItemNo = vAction.ItemNo;
        let vLen = vAction.Text.length;
        let vText = this.Items[vAction.ItemNo].Text;
        if (isUndo) {
            vText = vText.insert(vAction.Offset - 1, vAction.Text);
            caretOffset = vAction.Offset - 1;  // 不 + vLen，防止Offset超过当前CaretDrawItem范围
        } else {
            vText = vText.delete(vAction.Offset - 1, vLen);
            caretOffset = vAction.Offset - 1;
        }

        this.Items[vAction.ItemNo].Text = vText;

        return {
            itemNo: caretItemNo,
            offset: caretOffset
        }
    }

    UndoRedoDeleteText(action, isUndo, caretItemNo, caretOffset) {
        let vAction = action;// as HCTextUndoAction;
        caretItemNo = vAction.ItemNo;
        let vLen = vAction.Text.length;
        let vText = this.Items[vAction.ItemNo].Text;
        if (isUndo)
            vText = vText.insert(vAction.Offset - 1, vAction.Text);
        else
            vText = vText.delete(vAction.Offset - 1, vLen);

        caretOffset = vAction.Offset - 1;
        this.Items[vAction.ItemNo].Text = vText;
        return {
            itemNo: caretItemNo,
            offset: caretOffset
        }
    }

    UndoRedoInsertText(action, isUndo, caretItemNo, caretOffset) {
        let vAction = action;// as HCTextUndoAction;
        caretItemNo = vAction.ItemNo;
        let vText = this.Items[vAction.ItemNo].Text;
        let vLen = vAction.Text.length;

        if (isUndo) {
            vText = vText.delete(vAction.Offset - 1, vLen);
            caretOffset = vAction.Offset - 1;
        } else {
            vText = vText.insert(vAction.Offset - 1, vAction.Text);
            caretOffset = vAction.Offset + vLen - 1;
        }

        this.Items[vAction.ItemNo].Text = vText;
        return {
            itemNo: caretItemNo,
            offset: caretOffset
        }
    }

    UndoRedoSetItemText(action, isUndo, caretItemNo, caretOffset) {
        let vAction = action;// as HCSetItemTextUndoAction;
        caretItemNo = vAction.ItemNo;

        if (isUndo) {
            this.Items[vAction.ItemNo].Text = vAction.Text;
            caretOffset = vAction.Offset;
        } else {
            this.Items[vAction.ItemNo].Text = vAction.NewText;
            caretOffset = vAction.NewText.length;
        }

        return {
            itemNo: caretItemNo,
            offset: caretOffset
        }
    }

    UndoRedoDeleteItem(action, isUndo, caretItemNo, caretOffset) {
        let vAction = action;
        caretItemNo = vAction.ItemNo;

        if (isUndo) {
            let vItem = this.LoadItemFromStreamAlone(vAction.ItemStream);
            this.Items.insert(vAction.ItemNo, vItem);
            this.FItemAddCount++;

            caretOffset = vAction.Offset;
        } else {
            this.Items.delete(vAction.ItemNo);
            this.FItemAddCount--;

            if (caretItemNo > 0) {
                caretItemNo--;

                if (this.Items[caretItemNo].StyleNo > THCStyle.Null)
                    caretOffset = this.Items[caretItemNo].length;
                else
                    caretOffset = HC.OffsetAfter;
            } else
                caretOffset = 0;
        }

        return {
            itemNo: caretItemNo,
            offset: caretOffset
        }
    }

    UndoRedoInsertItem(undo, action, isUndo, caretItemNo, caretOffset, caretDrawItemNo) {
        let vAction = action;// as HCItemUndoAction;
        caretItemNo = vAction.ItemNo;

        if (isUndo) {
            if (caretItemNo < this.Items.count - 1) {
                if (this.Items[caretItemNo].ParaFirst) {
                    caretOffset = 0;
                    caretDrawItemNo = this.Items[caretItemNo + 1].FirstDItemNo;
                } else {
                    caretItemNo--;
                    if (this.Items[caretItemNo].StyleNo > THCStyle.Null)
                        caretOffset = this.Items[caretItemNo].length;
                    else
                        caretOffset = HC.OffsetAfter;

                    caretDrawItemNo = undo.CaretDrawItemNo;
                }
            } else if (caretItemNo > 0) {
                caretItemNo--;
                if (this.Items[caretItemNo].StyleNo > THCStyle.Null)
                    caretOffset = this.Items[caretItemNo].length;
                else
                    caretOffset = HC.OffsetAfter;

                caretDrawItemNo = undo.CaretDrawItemNo - 1;
            } else
                caretOffset = 0;

            this.Items.delete(vAction.ItemNo);
            this.FItemAddCount--;
        } else {
            let vItem = this.LoadItemFromStreamAlone(vAction.ItemStream);
            this.Items.insert(vAction.ItemNo, vItem);
            this.FItemAddCount++;

            caretItemNo = vAction.ItemNo;
            if (this.Items[caretItemNo].StyleNo > THCStyle.Null)
                caretOffset = this.Items[caretItemNo].length;
            else
                caretOffset = HC.OffsetAfter;

            caretDrawItemNo = undo.CaretDrawItemNo + 1;
        }

        return {
            itemNo: caretItemNo,
            offset: caretOffset,
            drawItemNo: caretDrawItemNo
        }
    }

    UndoRedoItemProperty(action, isUndo, caretItemNo, caretOffset) {
        let vAction = action;  // as HCItemPropertyUndoAction;
        caretItemNo = vAction.ItemNo;
        caretOffset = vAction.Offset;
        let vItem = this.Items[vAction.ItemNo];

        switch (vAction.ItemProperty) {
            case TItemProperty.StyleNo:
                if (isUndo)
                    vItem.StyleNo = vAction.OldStyleNo;
                else
                    vItem.StyleNo = vAction.NewStyleNo;
                
                break;
            
            case TItemProperty.ParaNo: {
                let vParaLastItemNo = this.GetParaLastItemNo(vAction.ItemNo);
                if (isUndo) {
                    for (let i = vAction.ItemNo; i <= vParaLastItemNo; i++)
                        this.Items[i].ParaNo = vAction.OldParaNo;
                } else {
                    for (let i = vAction.ItemNo; i <= vParaLastItemNo; i++)
                        this.Items[i].ParaNo = vAction.NewParaNo;
                }
                
                break;
            }
            
            case TItemProperty.ParaFirst:
                if (isUndo)
                    vItem.ParaFirst = vAction.OldParaFirst;
                else
                    vItem.ParaFirst = vAction.NewParaFirst;
                
                break;

            case TItemProperty.PageBreak:
                    this.FForceClearExtra = true;

                    if (isUndo)
                        vItem.PageBreak = vAction.OldPageBreak;
                    else
                        vItem.PageBreak = vAction.NewPageBreak;
                
                break;
        }

        return {
            itemNo: caretItemNo,
            offset: caretOffset
        }
    }

    UndoRedoItemSelf(action, isUndo, caretItemNo, caretOffset) {
        let vAction = action;// as HCItemSelfUndoAction;
        caretItemNo = vAction.ItemNo;
        caretOffset = vAction.Offset;
        if (isUndo)
            this.Items[caretItemNo].Undo(vAction);
        else
            this.Items[caretItemNo].Redo(vAction);

        return {
            itemNo: caretItemNo,
            offset: caretOffset
        }
    }

    UndoRedoItemMirror(action, isUndo, caretItemNo, caretOffset) {
        let vAction = action;// as HCItemUndoAction;
        caretItemNo = vAction.ItemNo;
        caretOffset = vAction.Offset;
        //let vItem = this.Items[caretItemNo];
        if (isUndo)
            this.Items[caretItemNo] = this.LoadItemFromStreamAlone(vAction.ItemStream);
        else
            this.Items[caretItemNo] = this.LoadItemFromStreamAlone(vAction.ItemStream);

        return {
            itemNo: caretItemNo,
            offset: caretOffset
        }            
    }

    DoUndoRedoAction(undo, action, isUndo, caretItemNo, caretOffset, caretDrawItemNo) {
        let vInfo;
        switch (action.Tag) {
            case THCAction.BackDeleteText: 
                vInfo = this.UndoRedoDeleteBackText(action, isUndo, caretItemNo, caretOffset);
                caretItemNo = vInfo.itemNo;
                caretOffset = vInfo.offset;
                break;

            case THCAction.DeleteText: 
                vInfo = this.UndoRedoDeleteText(action, isUndo, caretItemNo, caretOffset);
                caretItemNo = vInfo.itemNo;
                caretOffset = vInfo.offset;
                break;

            case THCAction.InsertText:
                vInfo = this.UndoRedoInsertText(action, isUndo, caretItemNo, caretOffset);
                caretItemNo = vInfo.itemNo;
                caretOffset = vInfo.offset;
                break;

            case THCAction.SetItemText:
                vInfo = this.UndoRedoSetItemText(action, isUndo, caretItemNo, caretOffset);
                caretItemNo = vInfo.itemNo;
                caretOffset = vInfo.offset;
                break;

            case THCAction.DeleteItem: 
                vInfo = this.UndoRedoDeleteItem(action, isUndo, caretItemNo, caretOffset);
                caretItemNo = vInfo.itemNo;
                caretOffset = vInfo.offset;
                break;

            case THCAction.InsertItem: 
                vInfo = this.UndoRedoInsertItem(undo, action, isUndo, caretItemNo, caretOffset, caretDrawItemNo);
                caretItemNo = vInfo.itemNo;
                caretOffset = vInfo.offset;
                caretDrawItemNo = vInfo.drawItemNo;
                break;

            case THCAction.ItemProperty: 
                vInfo = this.UndoRedoItemProperty(action, isUndo, caretItemNo, caretOffset);
                caretItemNo = vInfo.itemNo;
                caretOffset = vInfo.offset;
                break;

            case THCAction.ItemSelf:
                vInfo = this.UndoRedoItemSelf(action, isUndo, caretItemNo, caretOffset);
                caretItemNo = vInfo.itemNo;
                caretOffset = vInfo.offset;
                break;

            case THCAction.ItemMirror: 
                vInfo = this.UndoRedoItemMirror(action, isUndo, caretItemNo, caretOffset);
                caretItemNo = vInfo.itemNo;
                caretOffset = vInfo.offset;
                break;
        }

        return {
            itemNo: caretItemNo,
            offset: caretOffset,
            drawItemNo: caretDrawItemNo
        }
    }

    GetActionAffectFirst(action, isUndo) {
        let vResult = action.ItemNo;
        switch (action.Tag) {
            case THCAction.DeleteItem:
                if (vResult > 0)
                    vResult--;
                
                break;

            case THCAction.InsertItem:
                if (isUndo) {
                    if (vResult > 0)
                        vResult--;
                } else {
                    if (vResult > this.Items.count - 1)
                        vResult--;
                }
                
                break;

            case THCAction.ItemProperty: {
                let vPropAction = action;
                if ((vPropAction.ItemProperty == TItemProperty.ParaFirst)
                    && (vPropAction.ItemProperty == TItemProperty.PageBreak))
                {
                    if (vResult > 0)
                        vResult--;
                }

                break;
            }
        }
        
        if (vResult > this.Items.count - 1)
            vResult = this.Items.count - 1;
        
        return vResult;
    }

    GetActionAffectLast(action, isUndo) {
        let vResult = action.ItemNo;
        switch (action.Tag) {
            case THCAction.DeleteItem:
                if (isUndo) {
                    if (vResult > 0)
                        vResult--;
                } else {
                    if (vResult < this.Items.count - 1)
                        vResult++;
                }
                break;

            case THCAction.InsertItem:
                if (isUndo) {
                    if ((vResult < this.Items.count - 1) && action.ParaFirst)
                        vResult++;
                } else {
                    if (vResult > this.Items.count - 1)
                        vResult--;
                }

                break;
        }

        if (vResult > this.Items.count - 1)
            vResult = this.Items.count - 1;

        return vResult;
    }

    DoUndoRedo(undo) {
        this.FForceClearExtra = false;

        if (undo.isClass(THCUndoGroupEnd)) {
            if (undo.IsUndo) {
                if (this.FUndoGroupCount == 0) {
                    let vUndoList = this.GetUndoList();
                    this.FFormatFirstItemNo = vUndoList[vUndoList.CurGroupBeginIndex].ItemNo;
                    this.FFormatLastItemNo = vUndoList[vUndoList.CurGroupEndIndex].ItemNo;

                    if (this.FFormatFirstItemNo > 0)
                        this.FFormatFirstItemNo--;

                    if (this.FFormatLastItemNo < this.Items.count - 1)
                        this.FFormatLastItemNo++;

                    if (this.FFormatFirstItemNo != this.FFormatLastItemNo) {
                        this.FFormatFirstItemNo = this.GetParaFirstItemNo(this.FFormatFirstItemNo);
                        this.FFormatFirstDrawItemNo = this.Items[this.FFormatFirstItemNo].FirstDItemNo;
                        this.FFormatLastItemNo = this.GetParaLastItemNo(this.FFormatLastItemNo);
                    } else {
                        let vRange = this.GetFormatRangeByOffset(this.FFormatFirstItemNo, 1, this.FFormatFirstDrawItemNo, this.FFormatLastItemNo);
                        this.FFormatFirstDrawItemNo = vRange.firstDrawItemNo;
                        this.FFormatLastItemNo = vRange.lastItemNo;
                    }

                    this.FormatPrepare(this.FFormatFirstDrawItemNo, this.FFormatLastItemNo);

                    this.SelectInfo.Initialize();
                    this.InitializeField();
                    this.FItemAddCount = 0;
                }

                this.FUndoGroupCount++;
            } else {
                this.FUndoGroupCount--;

                if (this.FUndoGroupCount == 0) {
                    this.ReFormatData(this.FFormatFirstDrawItemNo, this.FFormatLastItemNo + this.FItemAddCount,
                        this.FItemAddCount, this.FForceClearExtra);

                    this.SelectInfo.StartItemNo = undo.ItemNo;
                    this.SelectInfo.StartItemOffset = undo.Offset;
                    this.CaretDrawItemNo = undo.CaretDrawItemNo;

                    this.Style.updateInfoReCaret();
                    this.Style.updateInfoRePaint();
                }
            }

            return;
        } else if (undo.isClass(THCUndoGroupBegin)) {
            if (undo.IsUndo) {
                this.FUndoGroupCount--;

                if (this.FUndoGroupCount == 0) {
                    this.ReFormatData(this.FFormatFirstDrawItemNo, this.FFormatLastItemNo + this.FItemAddCount,
                        this.FItemAddCount, this.FForceClearExtra);

                    this.SelectInfo.StartItemNo = undo.ItemNo;
                    this.SelectInfo.StartItemOffset = undo.Offset;
                    this.CaretDrawItemNo = undo.CaretDrawItemNo;

                    this.Style.updateInfoReCaret();
                    this.Style.updateInfoRePaint();
                }
            } else {
                if (this.FUndoGroupCount == 0) {
                    let vUndoList = this.GetUndoList();
                    this.FFormatFirstItemNo = -1;
                    this.FFormatLastItemNo = -1;
                    let vItemNo = -1;

                    for (let i = vUndoList.CurGroupBeginIndex; i <= vUndoList.CurGroupEndIndex; i++) {
                        if (vUndoList[i].isClass(THCUndoGroupBegin)) {
                            if (this.FFormatFirstItemNo > vUndoList[i].ItemNo)
                                this.FFormatFirstItemNo = vUndoList[i].ItemNo;
                        } else if (vUndoList[i].isClass(THCUndoGroupEnd)) {
                            if (this.FFormatLastItemNo < vUndoList[i].ItemNo)
                                this.FFormatLastItemNo = vUndoList[i].ItemNo;
                        } else {
                            vItemNo = this.GetParaFirstItemNo(this.GetActionAffectFirst(vUndoList[i].Actions.first, vUndoList[i].IsUndo));
                            if (this.FFormatFirstItemNo > vItemNo)
                                this.FFormatFirstItemNo = vItemNo;

                            vItemNo = this.GetParaLastItemNo(this.GetActionAffectLast(vUndoList[i].Actions.last, vUndoList[i].IsUndo));
                            if (this.FFormatLastItemNo < vItemNo)
                                this.FFormatLastItemNo = vItemNo;
                        }
                    }

                    if (this.FFormatFirstItemNo < 0)
                        this.FFormatFirstItemNo = 0;

                    if (this.FFormatLastItemNo > this.Items.count - 1)
                        this.FFormatLastItemNo = this.Items.count - 1;

                    this.FFormatFirstDrawItemNo = this.GetFormatFirstDrawItem(this.Items[this.FFormatFirstItemNo].FirstDItemNo);
                    this.FormatPrepare(this.FFormatFirstDrawItemNo, this.FFormatLastItemNo);
                    this.SelectInfo.Initialize();
                    this.InitializeField();
                    this.FItemAddCount = 0;
                }

                this.FUndoGroupCount++;
            }

            return;
        }

        if (undo.Actions.count == 0)
            return;

        let vCaretDrawItemNo = -1, vCaretItemNo = -1, vCaretOffset = -1;

        if (this.FUndoGroupCount == 0) {
            this.SelectInfo.Initialize();
            this.InitializeField();
            this.FItemAddCount = 0;
            vCaretDrawItemNo = undo.CaretDrawItemNo;

            if (undo.Actions[0].ItemNo > undo.Actions[undo.Actions.count - 1].ItemNo) {
                this.FFormatFirstItemNo = this.GetParaFirstItemNo(this.GetActionAffectFirst(undo.Actions.last, undo.IsUndo));
                this.FFormatLastItemNo = this.GetParaLastItemNo(this.GetActionAffectLast(undo.Actions.first, undo.IsUndo));
            } else {
                this.FFormatFirstItemNo = this.GetParaFirstItemNo(this.GetActionAffectFirst(undo.Actions.first, undo.IsUndo));
                this.FFormatLastItemNo = this.GetParaLastItemNo(this.GetActionAffectLast(undo.Actions.last, undo.IsUndo));
            }

            this.FFormatFirstDrawItemNo = this.Items[this.FFormatFirstItemNo].FirstDItemNo;
            this.FormatPrepare(this.FFormatFirstDrawItemNo, this.FFormatLastItemNo);
        }

        let vInfo;
        if (undo.IsUndo) {
            for (let i = undo.Actions.count - 1; i >= 0; i--) {
                vInfo = this.DoUndoRedoAction(undo, undo.Actions[i], true, vCaretItemNo, vCaretOffset, vCaretDrawItemNo);
                vCaretItemNo = vInfo.itemNo;
                vCaretOffset = vInfo.offset;
                vCaretDrawItemNo = vInfo.drawItemNo;
            }
        } else {
            for (let i = 0; i <= undo.Actions.count - 1; i++) {
                vInfo = this.DoUndoRedoAction(undo, undo.Actions[i], false, vCaretItemNo, vCaretOffset, vCaretDrawItemNo);
                vCaretItemNo = vInfo.itemNo;
                vCaretOffset = vInfo.offset;
                vCaretDrawItemNo = vInfo.drawItemNo;
            }
        }

        if (this.FUndoGroupCount == 0) {
            this.ReFormatData(this.FFormatFirstDrawItemNo, this.FFormatLastItemNo + this.FItemAddCount, this.FItemAddCount, this.FForceClearExtra);
            let vCaretDIItem = this.GetDrawItemNoByOffset(vCaretItemNo, vCaretOffset);

            if ((vCaretDrawItemNo < 0) || (vCaretDrawItemNo > this.DrawItems.count - 1))
                vCaretDrawItemNo = vCaretDIItem;
            else if (vCaretDIItem != vCaretDrawItemNo) {
                if ((this.DrawItems[vCaretDrawItemNo].ItemNo == vCaretItemNo) && (this.DrawItems[vCaretDrawItemNo].CharOffs == vCaretOffset)) {
                    //
                } else
                    vCaretDrawItemNo = vCaretDIItem;  // 纠正
            }
            
            this.CaretDrawItemNo = vCaretDrawItemNo;

            this.Style.updateInfoReCaret();
            this.Style.updateInfoRePaint();
        }

        this.SelectInfo.StartItemNo = vCaretItemNo;
        this.SelectInfo.StartItemOffset = vCaretOffset;
    }

    GetUndoList() {
        if (this.Loading)
            return null;
        else
            return super.GetUndoList();
    }

    Undo_New() {
        let vUndoList = this.GetUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            let vUndo = vUndoList.UndoNew();
            if (vUndo.isClass(THCDataUndo))
                vUndo.CaretDrawItemNo = this.CaretDrawItemNo;
        }
    }

    Undo_GroupBegin(itemNo, offset) {
        let vUndoList = this.GetUndoList();
        if ((vUndoList != null) && vUndoList.Enable)
            vUndoList.UndoGroupBegin(itemNo, offset);
    }

    Undo_GroupEnd(itemNo, offset) {
        let vUndoList = this.GetUndoList();
        if ((vUndoList != null) && vUndoList.Enable)
            vUndoList.UndoGroupEnd(itemNo, offset);
    }

    UndoAction_DeleteBackText(itemNo, offset, text) {
        let vUndoList = this.GetUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            let vUndo = vUndoList.last;
            if (vUndo != null) {
                let vTextAction = vUndo.ActionAppend(THCAction.BackDeleteText, itemNo, offset, this.Items[itemNo].ParaFirst);// as HCTextUndoAction;
                vTextAction.Text = text;
            }
        }
    }

    UndoAction_DeleteText(itemNo, offset, text) {
        let vUndoList = this.GetUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            let vUndo = vUndoList.last;
            if (vUndo != null) {
                let vTextAction = vUndo.ActionAppend(THCAction.DeleteText, itemNo, offset, this.Items[itemNo].ParaFirst);// as HCTextUndoAction;
                vTextAction.Text = text;
            }
        }
    }

    UndoAction_InsertText(itemNo, offset, text) {
        let vUndoList = this.GetUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            let vUndo = vUndoList.last;
            if (vUndo != null) {
                let vTextAction = vUndo.ActionAppend(THCAction.InsertText, itemNo, offset, this.Items[itemNo].ParaFirst);// as HCTextUndoAction;
                vTextAction.Text = text;
            }
        }
    }

    UndoAction_SetItemText(itemNo, offset, newText) {
        let vUndoList = this.GetUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            let vUndo = vUndoList.last;
            if (vUndo != null) {
                let vTextAction = vUndo.ActionAppend(THCAction.SetItemText, itemNo, offset, this.Items[itemNo].ParaFirst);// as HCSetItemTextUndoAction;
                vTextAction.Text = this.Items[itemNo].Text;
                vTextAction.NewText = newText;
            }
        }
    }

    UndoAction_DeleteItem(itemNo, offset) {
        let vUndoList = this.GetUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            let vUndo = vUndoList.last;
            if (vUndo != null) {
                let vItemAction = vUndo.ActionAppend(THCAction.DeleteItem, itemNo, offset, this.Items[itemNo].ParaFirst);// as HCItemUndoAction;
                this.SaveItemToStreamAlone(vItemAction.ItemStream, this.Items[itemNo]);
            }
        }
    }

    UndoAction_InsertItem(itemNo, offset) {
        let vUndoList = this.GetUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            let vUndo = vUndoList.last;
            if (vUndo != null) {
                let vItemAction = vUndo.ActionAppend(THCAction.InsertItem, itemNo, offset, this.Items[itemNo].ParaFirst);// as HCItemUndoAction;
                this.SaveItemToStreamAlone(vItemAction.ItemStream, this.Items[itemNo]);
            }
        }
    }

    UndoAction_ItemStyle(itemNo, offset, newStyleNo) {
        let vUndoList = this.GetUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            let vUndo = vUndoList.last;
            if (vUndo != null) {
                let vItemAction = new THCItemStyleUndoAction();
                vItemAction.ItemNo = itemNo;
                vItemAction.Offset = offset;
                vItemAction.OldStyleNo = this.Items[itemNo].StyleNo;
                vItemAction.NewStyleNo = newStyleNo;

                vUndo.Actions.add(vItemAction);
            }
        }
    }

    UndoAction_ItemParaNo(itemNo, offset, newParaNo) {
        let vUndoList = this.GetUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            let vUndo = vUndoList.last;
            if (vUndo != null) {
                let vItemAction = new THCItemParaUndoAction();
                vItemAction.ItemNo = itemNo;
                vItemAction.Offset = offset;
                vItemAction.OldParaNo = this.Items[itemNo].ParaNo;
                vItemAction.NewParaNo = newParaNo;

                vUndo.Actions.add(vItemAction);
            }
        }
    }

    UndoAction_ItemParaFirst(itemNo, offset, newParaFirst) {
        let vUndoList = this.GetUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            let vUndo = vUndoList.last;
            if (vUndo != null) {
                let vItemAction = new THCItemParaFirstUndoAction();
                vItemAction.ItemNo = itemNo;
                vItemAction.Offset = offset;
                vItemAction.OldParaFirst = this.Items[itemNo].ParaFirst;
                vItemAction.NewParaFirst = newParaFirst;

                vUndo.Actions.add(vItemAction);
            }
        }
    }

    UndoAction_ItemPageBreak(itemNo, offset, newPageBreak) {
        let vUndoList = this.GetUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            let vUndo = vUndoList.last;
            if (vUndo != null) {
                let vItemAction = new THCItemPageBreakUndoAction();
                vItemAction.ItemNo = itemNo;
                vItemAction.Offset = offset;
                vItemAction.OldPageBreak = this.Items[itemNo].PageBreak;
                vItemAction.NewPageBreak = newPageBreak;

                vUndo.Actions.add(vItemAction);
            }
        }
    }

    UndoAction_ItemSelf(itemNo, offset) {
        let vUndoList = this.GetUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            let vUndo = vUndoList.last;
            if (vUndo != null)
                vUndo.ActionAppend(THCAction.ItemSelf, itemNo, offset, this.Items[itemNo].ParaFirst);
        }
    }

    UndoAction_ItemMirror(itemNo, offset) {
        let vUndoList = this.GetUndoList();
        if ((vUndoList != null) && vUndoList.Enable) {
            let vUndo = vUndoList.last;
            if (vUndo != null) {
                let vItemAction = vUndo.ActionAppend(THCAction.ItemMirror, itemNo, offset, this.Items[itemNo].ParaFirst);// as HCItemUndoAction;
                this.SaveItemToStreamAlone(vItemAction.ItemStream, this.Items[itemNo]);
            }
        }
    }

    Clear() {
        if (this.Items.count > 0) {
            let vUndoList = this.GetUndoList();
            if ((vUndoList != null) && vUndoList.Enable) {
                this.Undo_New();
                for (let i = this.Items.count - 1; i >= 0; i--)
                    this.UndoAction_DeleteItem(i, 0);
            }
        }

        super.clear();
    }

    Undo(undo) {
        this.DoUndoRedo(undo);
    }

    Redo(aRedo) {
        this.DoUndoRedo(aRedo);
    }

    UndoItemMirror(itemNo, offset) {
        this.UndoAction_ItemMirror(itemNo, offset);
    }

    SaveItemToStreamAlone(stream, item) {
        HC._SaveFileFormatAndVersion(stream);
        this.Style.SaveToStream(stream);
        item.SaveToStream(stream);
    }

    LoadItemFromStreamAlone(stream, item) {
        stream.position = 0;
        let vInfo = HC._LoadFileFormatAndVersion(stream);
        let vFileExt = vInfo.fileExt;
        let vFileVersion = vInfo.fileVersion;
        if ((vFileExt != HC.HC_EXT) && (vFileExt != "cff."))
            system.exception("加载失败，不是" + HC.HC_EXT + "文件！");

        let vStyle = new THCStyle();
        vStyle.LoadFromStream(stream, vFileVersion);

        let vStyleNo = stream.readInt32();
        if (vStyleNo > THCStyle.Null) {
            let vTextStyle = vStyle.TextStyles[vStyleNo];
            vStyleNo = this.Style.GetStyleNo(vTextStyle, true);
        }

        if (item == null)
            item = this.CreateItemByStyle(vStyleNo);

        item.LoadFromStream(stream, vStyle, vFileVersion);
        item.StyleNo = vStyleNo;

        let vParaNo = item.ParaNo;
        let vParaStyle = vStyle.ParaStyles[vParaNo];
        vParaNo = this.Style.GetParaNo(vParaStyle, true);
        item.ParaNo = vParaNo;

        return item;
    }
}