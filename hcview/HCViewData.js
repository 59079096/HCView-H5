import { TMouseButton } from "../hcl/Controls.js";
import { TPenStyle } from "../hcl/Graphics.js";
import { TList } from "../hcl/System.js";
import { HC, THCState, TMarkType, THCAction } from "./HCCommon.js";
import { THCDomainItem } from "./HCRectItem.js";
import { THCStyle } from "./HCStyle.js";
import { THCViewDevData } from "./HCViewDevData.js";
import { THCDomainInfo } from "./HCCustomData.js";
import { THCRectRegion } from "./HCRectRegion.js";

export class THCViewData extends THCViewDevData {
    constructor(style) {
        super(style);

        this.FDomainStartDeletes = new TList();
        this.FCaretItemChanged = false;
        this.FHotDomain = new THCDomainInfo();
        this.FHotDomain.Data = this;
        this.FActiveDomain = new THCDomainInfo();
        this.FActiveDomain.Data = this;

        this.FHotDomainRGN = new THCRectRegion();
        this.FActiveDomainRGN = new THCRectRegion();
        this.FDrawActiveDomainRegion = false;
        this.FDrawHotDomainRegion = false;
        this.FOnCreateItemByStyle = null;
        this.FOnCanEdit = null;
        this.FOnInsertTextBefor = null;
        this.FOnCaretItemChanged = null;
    }

    DoAcceptAction(itemNo, offset, action) {
        if (this.Style.States.contain(THCState.Loading)
            || this.Style.States.contain(THCState.Undoing)
            || this.Style.States.contain(THCState.Redoing))
            return true;

        let vResult = true;
        if (action == THCAction.DeleteItem) {
            if (this.Items[itemNo].StyleNo == THCStyle.Domain) {
                if (this.Items[itemNo].MarkType == TMarkType.End) {
                    let vItemNo = this.GetDomainAnother(itemNo);
                    vResult = (vItemNo >= this.SelectInfo.StartItemNo) && (vItemNo <= this.SelectInfo.EndItemNo);
                    if (vResult)
                        this.FDomainStartDeletes.add(vItemNo);
                } else
                    vResult = this.FDomainStartDeletes.indexOf(itemNo) >= 0;
            }
        }

        if (vResult)
            vResult = super.DoAcceptAction(itemNo, offset, action);

        return vResult;
    }

    DoSaveItem(itemNo) {
        let vResult = super.DoSaveItem(itemNo);
        if (vResult && this.Style.States.contain(THCState.hosCopying)) {
            if (this.Items[itemNo].StyleNo == THCStyle.Domain) {
                let vItemNo = this.GetDomainAnother(itemNo);
                vResult = (vItemNo >= this.SelectInfo.StartItemNo) && (vItemNo <= this.SelectInfo.EndItemNo);
            }
        }

        return vResult;
    }

    CheckInsertItemCount(startNo, endNo) {
        return super.CheckInsertItemCount(startNo, endNo);
    }

    DoCaretItemChanged() {
        this.FCaretItemChanged = true;
    }

    DoDrawItemPaintBefor(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom,
        dataScreenTop, ADataScreenBottom, hclCanvas, paintInfo)
    {
        super.DoDrawItemPaintBefor(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight,
            dataDrawBottom, dataScreenTop, ADataScreenBottom, hclCanvas, paintInfo);

        if (!paintInfo.print) {
            let vDrawHotDomainBorde = false;
            let vDrawActiveDomainBorde = false;
            let vItemNo = this.DrawItems[drawItemNo].ItemNo;
            
            if (this.FHotDomain.BeginNo >= 0)
                vDrawHotDomainBorde = this.FHotDomain.Contain(vItemNo);
            
            if (this.FActiveDomain.BeginNo >= 0)
                vDrawActiveDomainBorde = this.FActiveDomain.Contain(vItemNo);

            if (vDrawHotDomainBorde || vDrawActiveDomainBorde) {
                if (drawRect.left == drawRect.right)
                    drawRect.right += 3;

                if ((this.FHotDomain.BeginNo >= 0) && vDrawHotDomainBorde)
                    this.FHotDomainRGN.combineRect(drawRect);

                if ((this.FActiveDomain.BeginNo >= 0) && vDrawActiveDomainBorde)
                    this.FActiveDomainRGN.combineRect(drawRect);
            }
        }
    }

    DrawLineLastMrak(hclCanvas, drawRect, paintInfo) {
        hclCanvas.pen.width = 1;
        hclCanvas.pen.style = TPenStyle.Solid;
        hclCanvas.pen.color = HC.clActiveBorder;

        hclCanvas.beginPath();
        try {
            if (paintInfo.scaleX != 1) {
                //let vPt = new TSize();
                // GDI.SetViewportExtEx(hclCanvas.Handle, paintInfo.WindowWidth, paintInfo.WindowHeight, vPt);
                // try {
                    hclCanvas.moveTo(paintInfo.getScaleX(drawRect.right) + 4, paintInfo.getScaleY(drawRect.bottom) - 8);
                    hclCanvas.lineTo(paintInfo.getScaleX(drawRect.right) + 6, paintInfo.getScaleY(drawRect.bottom) - 8);

                    hclCanvas.moveTo(paintInfo.getScaleX(drawRect.right) + 6, paintInfo.getScaleY(drawRect.bottom) - 8);
                    hclCanvas.lineTo(paintInfo.getScaleX(drawRect.right) + 6, paintInfo.getScaleY(drawRect.bottom) - 3);

                    hclCanvas.moveTo(paintInfo.getScaleX(drawRect.right), paintInfo.getScaleY(drawRect.bottom) - 3);
                    hclCanvas.lineTo(paintInfo.getScaleX(drawRect.right) + 6, paintInfo.getScaleY(drawRect.bottom) - 3);

                    hclCanvas.moveTo(paintInfo.getScaleX(drawRect.right) + 1, paintInfo.getScaleY(drawRect.bottom) - 4);
                    hclCanvas.lineTo(paintInfo.getScaleX(drawRect.right) + 1, paintInfo.getScaleY(drawRect.bottom) - 1);

                    hclCanvas.moveTo(paintInfo.getScaleX(drawRect.right) + 2, paintInfo.getScaleY(drawRect.bottom) - 5);
                    hclCanvas.lineTo(paintInfo.getScaleX(drawRect.right) + 2, paintInfo.getScaleY(drawRect.bottom));
                // } finally {
                //     GDI.SetViewportExtEx(hclCanvas.Handle, paintInfo.getScaleX(paintInfo.WindowWidth),
                //         paintInfo.getScaleY(paintInfo.WindowHeight), vPt);
                // }
            } else {
                hclCanvas.moveTo(drawRect.right + 4, drawRect.bottom - 8);
                hclCanvas.lineTo(drawRect.right + 6, drawRect.bottom - 8);

                hclCanvas.moveTo(drawRect.right + 6, drawRect.bottom - 8);
                hclCanvas.lineTo(drawRect.right + 6, drawRect.bottom - 3);

                hclCanvas.moveTo(drawRect.right, drawRect.bottom - 3);
                hclCanvas.lineTo(drawRect.right + 6, drawRect.bottom - 3);

                hclCanvas.moveTo(drawRect.right + 1, drawRect.bottom - 4);
                hclCanvas.lineTo(drawRect.right + 1, drawRect.bottom - 1);

                hclCanvas.moveTo(drawRect.right + 2, drawRect.bottom - 5);
                hclCanvas.lineTo(drawRect.right + 2, drawRect.bottom);
            }
        } finally {
            hclCanvas.paintPath();
        }
    }

    DoDrawItemPaintAfter(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom,
        dataScreenTop, dataScreenBottom, hclCanvas, paintInfo)
    {
        super.DoDrawItemPaintAfter(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight,
            dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
        
        if (!paintInfo.print) {
            if (data.Style.ShowParaLastMark) {
                if ((drawItemNo < this.DrawItems.count - 1) && this.DrawItems[drawItemNo + 1].ParaFirst)
                    this.DrawLineLastMrak(hclCanvas, drawRect, paintInfo);
                else if (drawItemNo == this.DrawItems.count - 1)
                    this.DrawLineLastMrak(hclCanvas, drawRect, paintInfo);
            }
        }
    }

    CreateItemByStyle(styleNo) {
        let vResult = null;

        if (this.FOnCreateItemByStyle != null)
            vResult = this.FOnCreateItemByStyle(this, styleNo);

        if (vResult == null)
            vResult = super.CreateItemByStyle(styleNo);

        return vResult;
    }

    PaintDataRange(dataDrawLeft, dataDrawTop, dataDrawRight, dataDrawBottom, dataScreenTop, dataScreenBottom,
        voffset, fristDItemNo, lastDItemNo, hclCanvas, paintInfo)
    {
        if (!paintInfo.print) {
            if (this.FDrawHotDomainRegion)
                this.FHotDomainRGN.clear();
            
            if (this.FDrawActiveDomainRegion)
                this.FActiveDomainRGN.clear();
        }
        
        super.PaintDataRange(dataDrawLeft, dataDrawTop, dataDrawRight, dataDrawBottom, dataScreenTop, dataScreenBottom, 
            voffset, fristDItemNo, lastDItemNo, hclCanvas, paintInfo);
        
        if (!paintInfo.print) {
            let vOldColor = hclCanvas.pen.color;
            try {
                if (this.FDrawHotDomainRegion) {
                    hclCanvas.pen.color = HC.clActiveBorder;
                    this.FHotDomainRGN.frameRgn(hclCanvas);
                }
            
                if (this.FDrawActiveDomainRegion) {
                    hclCanvas.pen.color = "blue";
                    this.FActiveDomainRGN.frameRgn(hclCanvas);
                }
            } finally {
                hclCanvas.pen.color = vOldColor;
            }
        }
    }

    InitializeField() {
        super.InitializeField();
        if (this.FActiveDomain != null)
            this.FActiveDomain.clear();
        
        if (this.FHotDomain != null)
            this.FHotDomain.clear();
    }

    GetCaretInfo(itemNo, offset, caretInfo) {
        super.GetCaretInfo(itemNo, offset, caretInfo);
        
        if (this.SelectInfo.StartItemNo >= 0) {
            let vTopData = this.GetTopLevelData();
            if (vTopData == this) {
                if (this.FActiveDomain.BeginNo >= 0) {
                    this.FActiveDomain.clear();
                    this.FDrawActiveDomainRegion = false;
                    this.Style.updateInfoRePaint();
                }

                this.GetDomainFrom(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, this.FActiveDomain);

                if (this.FActiveDomain.BeginNo >= 0) {
                    this.FDrawActiveDomainRegion = true;
                    this.Style.updateInfoRePaint();
                }
            }
        }

        if (this.FCaretItemChanged) {
            this.FCaretItemChanged = false;
            if (this.FOnCaretItemChanged != null)
                this.FOnCaretItemChanged(this, this.Items[this.SelectInfo.StartItemNo]);
        }
    }

    DeleteSelected() {
        this.FDomainStartDeletes.clear();
        return super.DeleteSelected();
    }

    DeleteActiveDomain() {
        if (this.SelectExists())
            return false;

        let vResult = false;
        if (this.FActiveDomain.BeginNo >= 0)
            vResult = this.DeleteDomain(this.FActiveDomain);
        else if (this.Items[this.SelectInfo.StartItemNo].StyleNo < THCStyle.Null) {
            vResult = this.Items[this.SelectInfo.StartItemNo].DeleteActiveDomain();
            if (vResult) {
                let vFirstDrawItemNo = -1, vLastItemNo = -1;
                let vRange = this.GetFormatRange(vFirstDrawItemNo, vLastItemNo);
                vFirstDrawItemNo = vRange.firstDrawItemNo;
                vLastItemNo = vRange.lastItemNo;
                this.FormatPrepare(vFirstDrawItemNo, vLastItemNo);
                this.ReFormatData(vFirstDrawItemNo, vLastItemNo);

                this.Style.updateInfoRePaint();
                this.Style.updateInfoReCaret();
            }
        }

        return vResult;
    }

    DeleteDomain(domain) {
        return this.DeleteDomainByItemNo(domain.BeginNo, domain.EndNo);
    }

    DeleteDomainByItemNo(startNo, endNo) {
        if (startNo < 0)
            return false;
    
        this.Undo_New();


        let vFirstDrawItemNo = this.GetFormatFirstDrawItem(this.Items[startNo].FirstDItemNo);
        let vParaLastItemNo = this.GetParaLastItemNo(endNo);
    
        if (this.Items[startNo].ParaFirst) {
            if (endNo == vParaLastItemNo) {
                if (startNo > 0)
                    vFirstDrawItemNo = this.GetFormatFirstDrawItem(this.Items[startNo].FirstDItemNo - 1);
            } else {
                this.UndoAction_ItemParaFirst(endNo + 1, 0, true);
                this.Items[endNo + 1].ParaFirst = true;
            }
        }
    
        this.FormatPrepare(vFirstDrawItemNo, vParaLastItemNo);
    
        let vDelCount = 0;
        let vBeginPageBreak = this.Items[startNo].PageBreak;

        for (let i = endNo; i >= startNo; i--) {
            this.UndoAction_DeleteItem(i, 0);
            this.Items.delete(i);
            vDelCount++;
        }

        this.FActiveDomain.clear();

        if (startNo == 0) {
            let vItem = this.CreateDefaultTextItem();
            vItem.ParaFirst = true;
            vItem.PageBreak = vBeginPageBreak;

            this.Items.insert(startNo, vItem);
            this.UndoAction_InsertItem(startNo, 0);
            vDelCount--;
        }

        this.ReFormatData(vFirstDrawItemNo, vParaLastItemNo - vDelCount, -vDelCount);
    
        this.InitializeField();
        if (startNo > this.Items.count - 1)
            this.ReSetSelectAndCaret(startNo - 1);
        else
            this.ReSetSelectAndCaretByOffset(startNo, 0);

        this.Style.updateInfoRePaint();
        this.Style.updateInfoReCaret();

        return true;
    }

    MouseDown(e) {
        if (this.FActiveDomain.BeginNo >= 0)
            this.Style.updateInfoRePaint();

        this.FActiveDomain.clear();
        this.FDrawActiveDomainRegion = false;

        super.MouseDown(e);

        if (e.button == TMouseButton.Right)
            this.Style.updateInfoReCaret();
    }

    MouseMove(e) {
        if (this.FHotDomain.BeginNo >= 0)
            this.Style.updateInfoRePaint();

        this.FHotDomain.clear();
        this.FDrawHotDomainRegion = false;

        super.MouseMove(e);

        if (!this.MouseMoveRestrain) {
            this.GetDomainFrom(this.MouseMoveItemNo, this.MouseMoveItemOffset, this.FHotDomain);

            let vTopData = this.GetTopLevelDataAt(e.x, e.y);// as HCViewData;
            if ((vTopData == this) || (!vTopData.FDrawHotDomainRegion)) {
                if (this.FHotDomain.BeginNo >= 0) {
                    this.FDrawHotDomainRegion = true;
                    this.Style.updateInfoRePaint();
                }
            }
        }
    }

    InsertItem(item) {
        let vResult = super.InsertItem(item);
        if (vResult) {
            this.Style.updateInfoRePaint();
            this.Style.updateInfoReCaret();
            this.Style.updateInfoReScroll();
        }

        return vResult;
    }

    InsertItemEx(index, item, offsetBefor = true) {
        let vResult = super.InsertItemEx(index, item, offsetBefor);
        if (vResult) {
            this.Style.updateInfoRePaint();
            this.Style.updateInfoReCaret();
            this.Style.updateInfoReScroll();
        }

        return vResult;
    }

    CanEdit() {
        let vResult = super.CanEdit();
        if ((vResult) && (this.FOnCanEdit != null))
            vResult = this.FOnCanEdit(this);

        return vResult;
    }

    DoInsertTextBefor(itemNo, offset, text) {
        let vResult = super.DoInsertTextBefor(itemNo, offset, text);
        if (vResult && (this.FOnInsertTextBefor != null))
            vResult = this.FOnInsertTextBefor(this, itemNo, offset, text);

        return vResult;
    }

    InsertDomain(mouldDomain) {
        if (!this.CanEdit())
            return false;

        let vResult = false;
        let vDomainItem = null;
        this.Undo_GroupBegin(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
        try {
            this.Style.States.include(THCState.BatchInsert);
            try {
                vDomainItem = this.CreateDefaultDomainItem();
                if (mouldDomain != null)
                    vDomainItem.Assign(mouldDomain);

                vDomainItem.MarkType = TMarkType.Beg;
                if (this.FActiveDomain.BeginNo >= 0)
                    vDomainItem.Level = this.Items[this.FActiveDomain.BeginNo].Level + 1;

                vResult = this.InsertItem(vDomainItem);

                if (vResult) {
                    vDomainItem = this.CreateDefaultDomainItem();// as HCDomainItem;
                    if (mouldDomain != null)
                        vDomainItem.Assign(mouldDomain);

                    vDomainItem.MarkType = TMarkType.End;
                    if (this.FActiveDomain.BeginNo >= 0)
                        vDomainItem.Level = this.Items[this.FActiveDomain.BeginNo].Level + 1;

                    vResult = this.InsertItem(vDomainItem);
                }
            } finally {
                this.Style.States.exclude(THCState.BatchInsert);
            }
        } finally {
            this.Undo_GroupEnd(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);
        }

        return vResult;
    }

    GetDomainStackFrom(itemNo, offset, domainStack) {
        let vDomainInfo;
        for (let i = 0; i < itemNo; i++) {
            if (this.Items[i].isClass(THCDomainItem)) {
                if (THCDomainItem.IsBeginMark(this.Items[i])) {
                    vDomainInfo = new THCDomainInfo();
                    vDomainInfo.Data = this;
                    vDomainInfo.BeginNo = i;
                    domainStack.push(vDomainInfo);
                } else
                    domainStack.pop();
            }
        }
    }

    GetDomainFrom(itemNo, offset, domainInfo) {
        domainInfo.clear();

        if ((itemNo < 0) || (offset < 0))
            return;

        let vCount = 0;
        let vLevel = 0;
        let vStartNo = itemNo;
        let vEndNo = itemNo;
        if (this.Items[itemNo].isClass(THCDomainItem)) {
            if (this.Items[itemNo].MarkType == TMarkType.Beg) {
                if (offset == HC.OffsetAfter) {
                    domainInfo.Data = this;
                    domainInfo.BeginNo = itemNo;
                    vLevel = this.Items[itemNo].Level;
                    vEndNo = itemNo + 1;
                } else {
                    if (itemNo > 0)
                        vStartNo = itemNo - 1;
                    else
                        return;
                }
            } else {
                if (offset == HC.OffsetAfter) {
                    if (itemNo < this.Items.count - 1)
                        vEndNo = itemNo + 1;
                    else
                        return;
                } else {
                    domainInfo.EndNo = itemNo;
                    vStartNo = itemNo - 1;
                }
            }
        }

        if (domainInfo.BeginNo < 0) {
            vCount = 0;

            if (vStartNo < this.Items.count / 2) {
                for (let i = vStartNo; i >= 0; i--) {
                    if (this.Items[i].isClass(THCDomainItem)) {
                        if (this.Items[i].MarkType == TMarkType.Beg) {
                            if (vCount != 0)
                                vCount--;
                            else {
                                domainInfo.BeginNo = i;
                                vLevel = this.Items[i].Level;
                                break;
                            }
                        } else
                            vCount++;
                    }
                }

                if ((domainInfo.BeginNo >= 0) && (domainInfo.EndNo < 0)) {
                    for (let i = vEndNo; i <= this.Items.count - 1; i++) {
                        if (this.Items[i].isClass(THCDomainItem)) {
                            if (this.Items[i].MarkType == TMarkType.End) {
                                if (this.Items[i].Level == vLevel) {
                                    domainInfo.EndNo = i;
                                    break;
                                }
                            }
                        }
                    }

                    if (domainInfo.EndNo < 0)
                        throw "异常：获取数据组结束出错！";
                }
            } else {
                for (let i = vEndNo; i <= this.Items.count - 1; i++) {
                    if (this.Items[i].isClass(THCDomainItem)) {
                        if (this.Items[i].MarkType == TMarkType.End) {
                            if (vCount > 0)
                                vCount--;
                            else {
                                domainInfo.EndNo = i;
                                vLevel = this.Items[i].Level;
                                break;
                            }
                        } else
                            vCount++;
                    }
                }

                if ((domainInfo.EndNo >= 0) && (domainInfo.BeginNo < 0)) {
                    for (let i = vStartNo; i >= 0; i--) {
                        if (this.Items[i].isClass(THCDomainItem)) {
                            if (this.Items[i].MarkType == TMarkType.Beg) {
                                if (this.Items[i].Level == vLevel) {
                                    domainInfo.BeginNo = i;
                                    break;
                                }
                            }
                        }
                    }

                    if (domainInfo.BeginNo < 0)
                        throw "异常：获取域起始位置出错！";
                }
            }
        } else if (domainInfo.EndNo < 0) {
            for (let i = vEndNo; i <= this.Items.count - 1; i++) {
                if (this.Items[i].isClass(THCDomainItem)) {
                    if (this.Items[i].MarkType == TMarkType.End) {
                        if (this.Items[i].Level == vLevel) {
                            domainInfo.EndNo = i;
                            break;
                        }
                    }
                }
            }

            if (domainInfo.EndNo < 0)
                throw "异常：获取域起始位置出错！";
        }
    }

    SetSelectBound(startNo, startOffset, endNo, endOffset, silence = true) {
        let vStartNo = -1, vEndNo = -1, vStartOffset = -1, vEndOffset = -1;
        if (endNo < 0) {
            vStartNo = startNo;
            vStartOffset = startOffset;
            vEndNo = -1;
            vEndOffset = -1;
        } else if (endNo >= startNo) {
            vStartNo = startNo;
            vEndNo = endNo;

            if (endNo == startNo) {
                if (endOffset >= startOffset) {
                    vStartOffset = startOffset;
                    vEndOffset = endOffset;
                } else {
                    vStartOffset = endOffset;
                    vEndOffset = startOffset;
                }
            } else {
                vStartOffset = startOffset;
                vEndOffset = endOffset;
            }
        } else {
            vStartNo = endNo;
            vStartOffset = endOffset;

            vEndNo = startNo;
            vEndOffset = vStartOffset;
        }

        let vRange = this.AdjustSelectRange(vStartNo, vStartOffset, vEndNo, vEndOffset);
        vStartNo = vRange.startItemNo;
        vStartOffset = vRange.startItemOffset;
        vEndNo = vRange.endItemNo;
        vEndOffset = vRange.endItemOffset;

        this.MatchItemSelectState();

        if (!silence) {
            this.ReSetSelectAndCaretByOffset(vStartNo, startOffset, true);
            this.Style.updateInfoRePaint();
        }
    }

    SelectItemAfterWithCaret(itemNo) {
        this.ReSetSelectAndCaret(itemNo);
    }

    SelectLastItemAfterWithCaret() {
        this.SelectItemAfterWithCaret(this.Items.count - 1);
    }

    SelectFirstItemBeforWithCaret() {
        this.ReSetSelectAndCaretByOffset(0, 0);
    }

    GetDomainAnother(itemNo) {
        let vResult = -1;
        
        let vDomainItem = this.Items[itemNo];
        if (vDomainItem.MarkType == TMarkType.End) {
            for (let i = itemNo - 1; i >= 0; i--) {
                if (this.Items[i].StyleNo == THCStyle.Domain) {
                    if (this.Items[i].MarkType == TMarkType.Beg) {
                        if (this.Items[i].Level == vDomainItem.Level) {
                            vResult = i;
                            break;
                        }
                    }
                }
            }
        } else {
            for (let i = itemNo + 1; i <= this.Items.count - 1; i++) {
                if (this.Items[i].StyleNo == THCStyle.Domain) {
                    if (this.Items[i].MarkType == TMarkType.End) {
                        if (this.Items[i].Level == vDomainItem.Level) {
                            vResult = i;
                            break;
                        }
                    }
                }
            }
        }

        return vResult;
    }

    ReversePos(subStr, s) {
        return s.lastIndexOf(subStr)
    }

    DoSearchByOffset(keyword, vKeyword, forward, matchCase, itemNo, offset) {
        let vText, vConcatText, vOverText;
        let vPos = -1, vItemNo = -1;
        let vResult = false;
        if (this.Items[itemNo].StyleNo < THCStyle.Null) {
            vResult = this.Items[itemNo].Search(keyword, forward, matchCase);
            
            if (vResult) {
                this.SelectInfo.StartItemNo = itemNo;
                this.SelectInfo.StartItemOffset = HC.OffsetInner;
                this.SelectInfo.EndItemNo = -1;
                this.SelectInfo.EndItemOffset = -1;
            }
        } else {
            if (forward) {
                vText = this.Items[itemNo].SubString(1, offset);
                if (!matchCase)
                    vText = vText.ToUpper();
        
                vPos = this.ReversePos(vKeyword, vText); 
            } else {
                vText = this.Items[itemNo].SubString(offset + 1, this.Items[itemNo].length - offset);
                if (!matchCase)
                    vText = vText.ToUpper();
                    
                vPos = vText.indexOf(vKeyword);
            }
            
            if (vPos > 0) {
                this.SelectInfo.StartItemNo = itemNo;
            
                if (forward)
                    this.SelectInfo.StartItemOffset = vPos - 1;
                else
                    this.SelectInfo.StartItemOffset = offset + vPos - 1;
        
                this.SelectInfo.EndItemNo = itemNo;
                this.SelectInfo.EndItemOffset = this.SelectInfo.StartItemOffset + vKeyword.length;
        
                vResult = true;
            } else if ((vText != "") && (vKeyword.length > 1)) {
                if (forward) {
                    vItemNo = itemNo;
                    vConcatText = vText;
                    vOverText = "";

                    while ((vItemNo > 0)
                        && (!this.Items[vItemNo].ParaFirst)
                        && (this.Items[vItemNo - 1].StyleNo > THCStyle.Null))
                    {
                        vText = this.Items[vItemNo - 1].Text.substr(vKeyword.length - 1, this.Items[vItemNo - 1].Text.length - vKeyword.length + 1);
                        vOverText = vOverText + vText;
                        vConcatText = vText + vConcatText;
                        if (!matchCase)
                            vConcatText = vConcatText.ToUpper();
        
                        vPos = vConcatText.indexOf(vKeyword);
                        if (vPos > 0) {
                            this.SelectInfo.StartItemNo = vItemNo - 1;
                            this.SelectInfo.StartItemOffset = this.Items[vItemNo - 1].length - (vText.length - vPos) - 1;
                        
                            this.SelectInfo.EndItemNo = itemNo;
                            this.SelectInfo.EndItemOffset = vPos + vKeyword.length - 1 - vText.length;
                            while (vItemNo < itemNo) {
                                this.SelectInfo.EndItemOffset = this.SelectInfo.EndItemOffset - this.Items[vItemNo].length;
                                vItemNo++;
                            }
        
                            vResult = true;
                            break;
                        } else {
                            if (vOverText.length >= vKeyword.length - 1)
                                break;
                        }
        
                        vItemNo--;
                    }
                } else {
                    vItemNo = itemNo;
                    vConcatText = vText;
                    vOverText = "";
        
                    while ((vItemNo < this.Items.count - 1)
                        && (!this.Items[vItemNo + 1].ParaFirst)
                        && (this.Items[vItemNo + 1].StyleNo > THCStyle.Null))
                    {
                        vText = this.Items[vItemNo + 1].Text.substr(0, vKeyword.length - 1);
                        vOverText = vOverText + vText;
                        vConcatText = vConcatText + vText;
                        if (!matchCase)
                            vConcatText = vConcatText.ToUpper();
        
                        vPos = vConcatText.indexOf(vKeyword);
                        if (vPos > 0) {
                            this.SelectInfo.StartItemNo = itemNo;
                            this.SelectInfo.StartItemOffset = offset + vPos - 1;
                        
                            this.SelectInfo.EndItemNo = vItemNo + 1;
                            this.SelectInfo.EndItemOffset = vPos + vKeyword.length - 1 - (this.Items[itemNo].length - offset);
        
                            while (vItemNo >= itemNo + 1) {
                                this.SelectInfo.EndItemOffset = this.SelectInfo.EndItemOffset - this.Items[vItemNo].length;
                                vItemNo--;
                            }
        
                            vResult = true;
                            break;
                        } else {
                            if (vOverText.length >= vKeyword.length - 1)
                                break;
                        }
        
                        vItemNo++;
                    }
                }
            }
        }

        return vResult;
    }

    Search(keyword, forward, matchCase) {
        let vResult = false;
        let vKeyword = "";
        if (!matchCase)
            vKeyword = keyword.ToUpper();
        else
            vKeyword = keyword;
        
        let vItemNo = -1, vOffset = -1;
        if (this.SelectInfo.StartItemNo < 0) {
            vItemNo = 0;
            vOffset = 0;
        } else if (this.SelectInfo.EndItemNo >= 0) {
            vItemNo = this.SelectInfo.EndItemNo;
            vOffset = this.SelectInfo.EndItemOffset;
        } else {
            vItemNo = this.SelectInfo.StartItemNo;
            vOffset = this.SelectInfo.StartItemOffset;
        }
        
        vResult = this.DoSearchByOffset(keyword, vKeyword, forward, matchCase, vItemNo, vOffset);
        
        if (!vResult) {
            if (forward) {
                for (let i = vItemNo - 1; i >= 0; i--) {
                    if (this.DoSearchByOffset(keyword, vKeyword, forward, matchCase, i, this.GetItemOffsetAfter(i))) {
                        vResult = true;
                        break;
                    }
                }
            } else {
                for (let i = vItemNo + 1; i <= this.Items.count - 1; i++) {
                    if (this.DoSearchByOffset(keyword, vKeyword, forward, matchCase, i, 0)) {
                        vResult = true;
                        break;
                    }
                }
            }
        }

        if (!vResult) {
            if (this.SelectInfo.EndItemNo >= 0) {
                if (!forward) {
                    this.SelectInfo.StartItemNo = this.SelectInfo.EndItemNo;
                    this.SelectInfo.StartItemOffset = this.SelectInfo.EndItemOffset;
                }

                this.SelectInfo.EndItemNo = -1;
                this.SelectInfo.EndItemOffset = -1;
            }
        }

        this.Style.updateInfoRePaint();
        this.Style.updateInfoReCaret();

        return vResult;
    }

    Replace(text) {
        return this.InsertText(text);
    }

    GetCaretInfoCur(caretInfo) {
        if (this.Style.updateInfo.draging)
            this.GetCaretInfo(this.MouseMoveItemNo, this.MouseMoveItemOffset, caretInfo);
        else
            this.GetCaretInfo(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, caretInfo);
    }

    TraverseItem(traverse) {
        if (traverse != null) {
            let vDomainInfo;
            for (let i = 0; i <= this.Items.count - 1; i++) {
                if (traverse.Stop)
                    break;

                if (this.Items[i].isClass(THCDomainItem)) {
                    if (THCDomainItem.IsBeginMark(this.Items[i])) {
                        vDomainInfo = new THCDomainInfo();
                        this.GetDomainFrom(i, HC.OffsetAfter, vDomainInfo);
                        traverse.DomainStack.push(vDomainInfo);
                    }
                    else
                        traverse.DomainStack.pop();
                }

                traverse.Process(this, i, traverse.Tag, traverse.domainStack, traverse.Stop);
                if (this.Items[i].StyleNo < THCStyle.Null)
                    this.Items[i].TraverseItem(traverse);
            }
        }
    }

    SaveDomainToStream(stream, domainItemNo)
    {
        let vGroupBeg = -1;
        let vGroupEnd = this.GetDomainAnother(domainItemNo);
        if (vGroupEnd > domainItemNo)
            vGroupBeg = domainItemNo;
        else {
            vGroupBeg = vGroupEnd;
            vGroupEnd = domainItemNo;
        }

        HC._SaveFileFormatAndVersion(stream);
        this.Style.SaveToStream(stream);
        this.SaveItemToStream(stream, vGroupBeg + 1, 0, vGroupEnd - 1, this.GetItemOffsetAfter(vGroupEnd - 1));
    }

    get OnCaretItemChanged() {
        return this.FOnCaretItemChanged;
    }

    set OnCaretItemChanged(val) {
        this.FOnCaretItemChanged = val;
    }

    get HotDomain() {
        return this.FHotDomain;
    }

    get ActiveDomain() {
        return this.FActiveDomain;
    }

    get OnCreateItemByStyle() {
        return this.FOnCreateItemByStyle;
    }

    set OnCreateItemByStyle(val) {
        this.FOnCreateItemByStyle = val;
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
}