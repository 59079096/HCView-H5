import { TBrushStyle, TFontStyle } from "../hcl/Graphics.js";
import { TList, TObject, TPoint, TRect, TStack } from "../hcl/System.js";
import { HC, THCState } from "./HCCommon.js";
import { THCDrawItems } from "./HCDrawItem.js";
import { THCItems } from "./HCItem.js";
import { TParaAlignHorz, TParaAlignVert, TParaLineSpaceMode } from "./HCParaStyle.js";
import { THCDomainItem, THCResizeRectItem, THCTextRectItem } from "./HCRectItem.js";
import { THCStyle } from "./HCStyle.js";
import { TBackColorStyleMatch, TColorStyleMatch, TFontNameStyleMatch, TFontSizeStyleMatch, TParaAlignHorzMatch, TParaAlignVertMatch, TParaBackColorMatch, TParaBreakRoughMatch, TParaFirstIndentMatch, TParaLeftIndentMatch, TParaLineSpaceMatch, TParaRightIndentMatch, TTextStyleMatch } from "./HCStyleMatch.js";
import { THCTextItem } from "./HCTextItem.js";
import { THCUnitConversion } from "./HCUnitConversion.js";

export class THCDomainInfo extends TObject {
    constructor() {
        super();
        this.clear();
    }

    clear() {
        this.Data = null;
        this.BeginNo = -1;
        this.EndNo = -1;
    }

    Contain(itemNo) {
        return (itemNo >= this.BeginNo) && (itemNo <= this.EndNo);
    }
}

export class THCItemTraverse extends TObject {
    constructor() {
        super();
        this.Areas = new Set([]);
        this.Tag = 0;
        this.Stop = false;
        this.Process = null;
        this.DomainStack = new TStack();
    }
}

export class TSelectInfo extends TObject {
    constructor() {
        super();
        this.Initialize();        
    }

    Initialize() {
        this.StartItemNo = -1;
        this.StartItemOffset = -1;
        this.StartRestrain = false;
        this.EndItemNo = -1;
        this.EndItemOffset = -1;
    }
}

export class THCCustomData extends TObject {
    constructor(style) {
        super();
        this.FStyle = style;
        this.FCurStyleNo = -1;
        this.FCurParaNo = -1;
        this.FDrawItems = new THCDrawItems();
        this.FItems = new THCItems();
        this.FItems.onAdded = (item) => { this.DoInsertItem(item); }
        this.FItems.onRemoved = (item) => { this.DoRemoveItem(item); }

        this.FLoading = false;
        this.FCurStyleNo = 0;
        this.FCurParaNo = 0;
        this.FCaretDrawItemNo = -1;
        this.FSelectInfo = new TSelectInfo();
        this.FDrawOptions = new Set([]);

        this.FOnInsertItem = null;
        this.FOnRemoveItem = null;
        this.FOnSaveItem = null;
        this.FOnGetUndoList = null;
        this.FOnCurParaNoChange = null;
        this.FOnDrawItemPaintBefor = null;
        this.FOnDrawItemPaintAfter = null;
        this.FOnDrawItemPaintContent = null;
    }

    DrawItemPaintBefor(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom, 
        dataScreenTop, dataScreenBottom, hclCanvas, paintInfo)
    {
        hclCanvas.save();
        try {
            this.DoDrawItemPaintBefor(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom, 
                dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
        } finally {
            hclCanvas.restore();
        }
    }

    DrawItemPaintAfter(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom, 
        dataScreenTop, dataScreenBottom, hclCanvas, paintInfo)
    {
        hclCanvas.save();
        try {
            this.DoDrawItemPaintAfter(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom, 
                dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
        } finally {
            hclCanvas.restore();
        }
    }

    DrawItemPaintContent(data, itemNo, drawItemNo, drawRect, clearRect, drawText, dataDrawLeft, dataDrawRight, dataDrawBottom, 
        dataScreenTop, dataScreenBottom, hclCanvas, paintInfo)
    {
        hclCanvas.save();
        try {
            this.DoDrawItemPaintContent(data, itemNo, drawItemNo, drawRect, clearRect, drawText,
                dataDrawLeft, dataDrawRight, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
        } finally {
            hclCanvas.restore();
        }
    }

    SetCurStyleNo(val) {
        if (this.FCurStyleNo != val)
            this.FCurStyleNo = val;
    }

    SetCurParaNo(val) {
        if (this.FCurParaNo != val) {
            this.FCurParaNo = val;
            if (this.FOnCurParaNoChange != null)
                this.FOnCurParaNoChange(this, null);
        }
    }

    MergeItemText(destItem, srcItem) {
        let vResult = destItem.CanConcatItems(srcItem);
        if (vResult)
            destItem.Text = destItem.Text + srcItem.Text;

        return vResult;
    }

    MergeItemToPrio(itemNo) {
        return (itemNo > 0) && (!this.FItems[itemNo].ParaFirst)
            && this.MergeItemText(this.FItems[itemNo - 1], this.FItems[itemNo]);
    }

    MergeItemToNext(itemNo) {
        return (itemNo < this.FItems.count - 1) && (!this.FItems[itemNo + 1].ParaFirst)
            && this.MergeItemText(this.FItems[itemNo], this.FItems[itemNo + 1]);
    }

    CalcContentHeight() {
        if (this.FDrawItems.count > 0)
            return this.FDrawItems.last.rect.bottom - this.FDrawItems[0].rect.top;
        else
            return 0;
    }

    // #region CheckItemSelectedState
    CheckItemSelectedState(itemNo) {
        if ((itemNo > this.FSelectInfo.StartItemNo) && (itemNo < this.FSelectInfo.EndItemNo))
            this.FItems[itemNo].SelectComplate();
        else if (itemNo == this.FSelectInfo.StartItemNo) {
            if (itemNo == this.FSelectInfo.EndItemNo) {
                if (this.FItems[itemNo].StyleNo < THCStyle.Null) {
                    if ((this.FSelectInfo.StartItemOffset == HC.OffsetInner) || (this.FSelectInfo.EndItemOffset == HC.OffsetInner))
                        this.FItems[itemNo].SelectPart();
                    else
                        this.FItems[itemNo].SelectComplate();
                } else {
                    if ((this.FSelectInfo.StartItemOffset == 0) && (this.FSelectInfo.EndItemOffset == this.FItems[itemNo].length)) 
                        this.FItems[itemNo].SelectComplate();
                    else
                        this.FItems[itemNo].SelectPart();
                }
            } else {
                if (this.FSelectInfo.StartItemOffset == 0)
                    this.FItems[itemNo].SelectComplate();
                else
                    this.FItems[itemNo].SelectPart();
            }
        } else {
            if (this.FItems[itemNo].StyleNo < THCStyle.Null) {
                if (this.FSelectInfo.EndItemOffset == HC.OffsetAfter)
                    this.FItems[itemNo].SelectComplate();
                else
                    this.FItems[itemNo].SelectPart();
            
            } else {
                if (this.FSelectInfo.EndItemOffset == this.FItems[itemNo].length)
                    this.FItems[itemNo].SelectComplate();
                else
                    this.FItems[itemNo].SelectPart();
            }
        }
    }
    //#endregion

    MatchItemSelectState() {
        if (this.SelectExists()) {
            for (let i = this.FSelectInfo.StartItemNo; i <= this.FSelectInfo.EndItemNo; i++)
            this.CheckItemSelectedState(i);
        }
    }

    GetParaItemRang(itemNo, firstItemNo, lastItemNo) {
        firstItemNo = itemNo;
        while (firstItemNo > 0) {
            if (this.FItems[firstItemNo].ParaFirst)
                break;
            else
                firstItemNo--;
        }

        lastItemNo = itemNo + 1;
        while (lastItemNo < this.FItems.count) {
            if (this.FItems[lastItemNo].ParaFirst)
                break;
            else
                lastItemNo++;
        }

        lastItemNo--;

        return {
            a: firstItemNo,
            b: lastItemNo
        }
    }

    GetParaFirstItemNo(itemNo) {
        let vResult = itemNo;
        while (vResult > 0) {
            if (this.FItems[vResult].ParaFirst)
                break;
            else
                vResult--;
        }

        return vResult;
    }

    GetParaLastItemNo(itemNo) {
        let vResult = itemNo + 1;
        while (vResult < this.FItems.count) {
            if (this.FItems[vResult].ParaFirst)
                break;
            else
                vResult++;
        }

        vResult--;
        return vResult;
    }

    GetLineFirstItemNo(itemNo, offset) {
        let vResult = this.GetDrawItemNoByOffset(itemNo, offset);
        while (vResult > 0) {
            if (this.FDrawItems[vResult].LineFirst)
                break;
            else
                vResult--;
        }

        return vResult;
    }

    GetLineLastItemNo(itemNo, offset) {
        let vResult = itemNo;
        let vLastDItemNo = this.GetDrawItemNoByOffset(itemNo, offset) + 1;
        while (vLastDItemNo < this.FDrawItems.count) {
            if (this.FDrawItems[vLastDItemNo].LineFirst)
                break;
            else
                vLastDItemNo++;
        }

        vLastDItemNo--;
        vResult = this.FDrawItems[vLastDItemNo].ItemNo;
        return vResult;
    }

    GetLineDrawItemRang(firstDItemNo, lastDItemNo) {
        while (firstDItemNo > 0) {
            if (this.FDrawItems[firstDItemNo].LineFirst)
                break;
            else
                firstDItemNo--;
        }

        lastDItemNo = firstDItemNo + 1;
        while (lastDItemNo < this.FDrawItems.count) {
            if (this.FDrawItems[lastDItemNo].LineFirst)
                break;
            else
                lastDItemNo++;
        }

        lastDItemNo--;

        return {
            a: firstDItemNo,
            b: lastDItemNo
        }
    }

    GetJustifyCount(text, charIndexs) {
        let vResult = 0;
        if (text == "")
            throw "异常：不能对空字符串计算分散!";

        if (charIndexs != null)
            charIndexs.clear();

        for (let i = 1; i <= text.length; i++) {
            if (HC.UNPLACEHOLDERCHAR && (HC.UnPlaceholderChar.indexOf(text[i - 1]) < 0)) {
                vResult++;
                if (charIndexs != null)
                    charIndexs.add(i);
            } else {
                vResult++;
                if (charIndexs != null)
                    charIndexs.add(i);
            }
        }

        if (charIndexs != null)
            charIndexs.add(text.length + 1);

        return vResult;
    }

    SetCaretDrawItemNo(val) {
        let vItemNo;

        if (this.FCaretDrawItemNo != val) {
            if ((this.FCaretDrawItemNo >= 0) && (this.FCaretDrawItemNo < this.FDrawItems.count)) {
                vItemNo = this.FDrawItems[this.FCaretDrawItemNo].ItemNo;
                if ((val >= 0) && (vItemNo != this.FDrawItems[val].ItemNo))
                    this.FItems[vItemNo].Active = false;
            } else
                vItemNo = -1;

            this.FCaretDrawItemNo = val;

            if (this.FStyle.States.contain(THCState.Loading))
                return;

            this.SetCurStyleNo(this.FItems[this.FDrawItems[this.FCaretDrawItemNo].ItemNo].StyleNo);
            this.SetCurParaNo(this.FItems[this.FDrawItems[this.FCaretDrawItemNo].ItemNo].ParaNo);

            if ((this.FCaretDrawItemNo >= 0) && (this.FDrawItems[this.FCaretDrawItemNo].ItemNo != vItemNo)) {
                if (this.FItems[this.FDrawItems[this.FCaretDrawItemNo].ItemNo].StyleNo < THCStyle.Null) {
                    if (this.FSelectInfo.StartItemOffset == HC.OffsetInner) {
                        this.FItems[this.FDrawItems[this.FCaretDrawItemNo].ItemNo].Active = true;
                        this.DoCaretItemChanged();
                    }
                } else {
                    this.FItems[this.FDrawItems[this.FCaretDrawItemNo].ItemNo].Active = true;
                    this.DoCaretItemChanged();
                }
            }
        }
    }

    CalculateLineHeight(textStyle, paraStyle) {
        let vResult = textStyle.FontHeight;
        if (paraStyle.LineSpaceMode == TParaLineSpaceMode.PLSMin)
            return vResult;

        if (paraStyle.LineSpaceMode == TParaLineSpaceMode.PLSFix) {
            let vLineSpacing = THCUnitConversion.millimeterToPixY(paraStyle.LineSpace * 0.3527);
            if (vLineSpacing < vResult)
                return vResult;
            else
                return vLineSpacing;
        }

        let vAscent = 0, vDescent = 0;
        if ((textStyle.trueType > 0) && textStyle.CJKFont) {
            if ((textStyle.OutlineTextmetric_otmfsSelection & 128) != 0) {
                vAscent = textStyle.OutlineTextmetric_otmAscent;
                vDescent = -textStyle.OutlineTextmetric_otmDescent;
            } else {
                vAscent = textStyle.Textmetric_tmAscent;
                vDescent = textStyle.Textmetric_tmDescent;
                let vLineSpacing = Math.ceil(1.3 * (vAscent + vDescent));
                let vDelta = vLineSpacing - (vAscent + vDescent);
                let vLeading = Math.trunc(vDelta / 2);
                let vOtherLeading = vDelta - vLeading;
                vAscent = vAscent + vLeading;
                vDescent = vDescent + vOtherLeading;
                vResult = vAscent + vDescent;
                switch (paraStyle.LineSpaceMode) {
                    case TParaLineSpaceMode.PLS115: 
                        vResult = vResult + Math.trunc(3 * vResult / 20);
                        break;

                    case TParaLineSpaceMode.PLS150: 
                        vResult = Math.trunc(3 * vResult / 2);
                        break;

                    case TParaLineSpaceMode.PLS200: 
                        vResult = vResult * 2;
                        break;

                    case TParaLineSpaceMode.PLSMult:
                        vResult = Math.trunc(vResult * paraStyle.LineSpace);
                        break;
                }
            }
        } else {
            switch (paraStyle.LineSpaceMode) {
                case TParaLineSpaceMode.PLS100:
                    vResult = vResult + textStyle.TextMetric_tmExternalLeading; // Round(vTextMetric.tmHeight * 0.2);
                    break;

                case TParaLineSpaceMode.PLS115:
                    vResult = vResult + textStyle.TextMetric_tmExternalLeading + Math.round((textStyle.TextMetric_tmHeight + textStyle.TextMetric_tmExternalLeading) * 0.15);
                    break;

                case TParaLineSpaceMode.PLS150:
                    vResult = vResult + textStyle.TextMetric_tmExternalLeading + Math.round((textStyle.TextMetric_tmHeight + textStyle.TextMetric_tmExternalLeading) * 0.5);
                    break;

                case TParaLineSpaceMode.PLS200:
                    vResult = vResult + textStyle.TextMetric_tmExternalLeading + textStyle.TextMetric_tmHeight + textStyle.TextMetric_tmExternalLeading;
                    break;

                case TParaLineSpaceMode.PLSMult:
                    vResult = vResult + textStyle.TextMetric_tmExternalLeading + Math.round((textStyle.TextMetric_tmHeight + textStyle.TextMetric_tmExternalLeading) * paraStyle.LineSpace);
                    break;
            }
        }

        return vResult;
    }

    GetUndoList() {
        if (this.FOnGetUndoList != null)
            return this.FOnGetUndoList();
        else
            return null;
    }

    DoSaveItem(itemNo) {
        if (this.FOnSaveItem != null)
            return this.FOnSaveItem(this, itemNo);
        else
            return true;
    }

    DoInsertItem(item) {
        if (this.FOnInsertItem != null)
            this.FOnInsertItem(this, item);
    }

    DoRemoveItem(item) {
        if ((this.FOnRemoveItem != null) && (!this.FStyle.States.contain(THCState.Destroying)))
            this.FOnRemoveItem(this, item);
    }

    DoItemAction(itemNo, offset, action) { }

    DoDrawItemPaintBefor(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom,
        dataScreenTop, dataScreenBottom, hclCanvas, paintInfo)
    {
        if (this.FOnDrawItemPaintBefor != null) {
            this.FOnDrawItemPaintBefor(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight,
                dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
        }
    }

    DoDrawItemPaintContent(data, itemNo, drawItemNo, drawRect, clearRect, drawText, dataDrawLeft, dataDrawRight, 
        dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo)
    {
        if (this.FOnDrawItemPaintContent != null) {
            this.FOnDrawItemPaintContent(data, itemNo, drawItemNo, drawRect, clearRect, drawText,
                dataDrawLeft, dataDrawRight, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
        }
    }

    DoDrawItemPaintAfter(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom,
        dataScreenTop, dataScreenBottom, hclCanvas, paintInfo)
    {
        if (this.FOnDrawItemPaintAfter != null) {
            this.FOnDrawItemPaintAfter(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight,
                dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
        }
    }

    DoLoadFromStream(stream, style, fileVersion) {
        this.clear();
    }

    DoCaretItemChanged() { }

    get Loading() {
        return this.FLoading;
    }

    CanEdit() {
        return true;
    }

    SelectAll() {
        if (this.FItems.count > 0) {
            this.FSelectInfo.StartItemNo = 0;
            this.FSelectInfo.StartItemOffset = 0;

            if (!this.IsEmptyData()) {
                this.FSelectInfo.EndItemNo = this.FItems.count - 1;
                this.FSelectInfo.EndItemOffset = this.GetItemOffsetAfter(this.FSelectInfo.EndItemNo);
            } else {
                this.FSelectInfo.EndItemNo = -1;
                this.FSelectInfo.EndItemOffset = -1;
            }

            this.MatchItemSelectState();
        }
    }

    SelectedAll() {
        return ((this.FSelectInfo.StartItemNo == 0)
                && (this.FSelectInfo.StartItemOffset == 0)
                && (this.FSelectInfo.EndItemNo == this.FItems.count - 1)
                && (this.FSelectInfo.EndItemOffset == this.GetItemOffsetAfter(this.FItems.count - 1)));
    }

    clear() {
        this.FSelectInfo.Initialize();
        this.FCaretDrawItemNo = -1;
        this.FDrawItems.clear();
        this.FItems.clear();
        this.FCurStyleNo = 0;
        this.FCurParaNo = 0;
    }

    InitializeField() {
        this.FCaretDrawItemNo = -1;
    }

    GetRootData() {
        return this;
    }

    GetScreenCoord(x, y) {
        return this.GetRootData().GetScreenCoord(x, y);
    }

    CreateDefaultTextItem() {
        let vItem = new THCTextItem.HCDefaultTextItemClass("");
        if (this.FCurStyleNo < THCStyle.Null)
            vItem.StyleNo = this.FStyle.GetStyleNo(this.FStyle.DefaultTextStyle, true);
        else
            vItem.StyleNo = this.FCurStyleNo;

        vItem.ParaNo = this.FCurParaNo;
        return vItem;
    }

    CreateDefaultDomainItem() {
        let vItem = new THCDomainItem.HCDefaultDomainItemClass(this);
        vItem.ParaNo = this.FCurParaNo;
        return vItem;
    }

    CreateItemByStyle(styleNo) {
        return null;
    }

    GetCaretInfo(itemNo, offset, caretInfo) {
        let vDrawItemNo, vStyleItemNo;

        if (this.FCaretDrawItemNo < 0)
        {
            if (this.FItems[itemNo].StyleNo < THCStyle.Null)
                vDrawItemNo = this.FItems[itemNo].FirstDItemNo;
            else
                vDrawItemNo = this.GetDrawItemNoByOffset(itemNo, offset);
        }
        else
            vDrawItemNo = this.FCaretDrawItemNo;

        let vDrawItem = this.FDrawItems[vDrawItemNo];
        caretInfo.height = vDrawItem.height;

        if (this.FStyle.updateInfo.reStyle)
        {
            vStyleItemNo = itemNo;
            if (offset == 0) {
                if ((!this.FItems[itemNo].ParaFirst)
                && (itemNo > 0)
                && (this.Items[itemNo - 1].StyleNo > THCStyle.Null))
                    vStyleItemNo = itemNo - 1;
            }

            if (this.Items[vStyleItemNo].isClass(THCTextRectItem) && (this.FSelectInfo.StartItemOffset == HC.OffsetInner))
                this.CurStyleNo = this.FItems[vStyleItemNo].TextStyleNo;
            else
                this.CurStyleNo = this.FItems[vStyleItemNo].StyleNo;

            this.CurParaNo = this.FItems[vStyleItemNo].ParaNo;
        }

        if (this.FItems[itemNo].StyleNo < THCStyle.Null) {
            let vRectItem = this.FItems[itemNo];

            if (offset == HC.OffsetBefor) {
                if (vRectItem.CanPageBreak)
                    this.GetRectItemInnerCaretInfo(vRectItem, itemNo, vDrawItemNo, vDrawItem, caretInfo);

                caretInfo.x = caretInfo.x + vDrawItem.rect.left;
            } else if (offset == HC.OffsetInner) {
                this.GetRectItemInnerCaretInfo(vRectItem, itemNo, vDrawItemNo, vDrawItem, caretInfo);
                caretInfo.x = caretInfo.x + vDrawItem.rect.left;
            } else {
                if (vRectItem.CanPageBreak)
                    this.GetRectItemInnerCaretInfo(vRectItem, itemNo, vDrawItemNo, vDrawItem, caretInfo);

                caretInfo.x = caretInfo.x + vDrawItem.rect.right;
            }

            if (vRectItem.JustifySplit()) {
                if (((this.FStyle.ParaStyles[vRectItem.ParaNo].AlignHorz == TParaAlignHorz.Justify) && (!this.IsParaLastDrawItem(vDrawItemNo)))
                    || (this.FStyle.ParaStyles[vRectItem.ParaNo].AlignHorz == TParaAlignHorz.Scatter))
                {
                    if (this.IsLineLastDrawItem(vDrawItemNo))
                        caretInfo.x = caretInfo.x + vDrawItem.width - vRectItem.width;
                } else
                    caretInfo.x = caretInfo.x + vDrawItem.width - vRectItem.Width;
            }
        } else
            caretInfo.x = caretInfo.x + vDrawItem.rect.left + this.GetDrawItemOffsetWidth(vDrawItemNo, offset - vDrawItem.CharOffs + 1);

        caretInfo.y = caretInfo.y + vDrawItem.rect.top;
    }

    GetItemAt(x, y, itemNo, offset, drawItemNo, restrain) {
        itemNo = -1;
        offset = -1;
        drawItemNo = -1;
        restrain = true;

        if (this.IsEmptyData()) {
            itemNo = 0;
            offset = 0;
            drawItemNo = 0;
            return {
                itemNo: itemNo,
                offset: offset,
                drawItemNo: drawItemNo,
                restrain: restrain
            }
        }

        let vStartDItemNo, vEndDItemNo = -1, vi;
        let vDrawRect;

        if (y < 0)
            vStartDItemNo = 0;
        else {
            vDrawRect = this.FDrawItems.last.rect;
            if (y > vDrawRect.bottom)
                vStartDItemNo = this.FDrawItems.count - 1;
            else {
                vStartDItemNo = 0;
                vEndDItemNo = this.FDrawItems.count - 1;

                while (true) {
                    if (vEndDItemNo - vStartDItemNo > 1) {
                        vi = Math.trunc(vStartDItemNo + (vEndDItemNo - vStartDItemNo) / 2);
                        if (y > this.FDrawItems[vi].rect.bottom) {
                            vStartDItemNo = vi + 1;
                            continue;
                        } else if (y < this.FDrawItems[vi].rect.top) {
                            vEndDItemNo = vi - 1;
                            continue;
                        } else {
                            vStartDItemNo = vi;
                            break;
                        }
                    } else {
                        if (y >= this.FDrawItems[vEndDItemNo].rect.bottom)
                            vStartDItemNo = vEndDItemNo;
                        else if (y > this.FDrawItems[vEndDItemNo].rect.top)
                            vStartDItemNo = vEndDItemNo;

                        break;
                    }
                }
            }

            if (y < this.FDrawItems[vStartDItemNo].rect.top)
                vStartDItemNo--;
        }

        let vItemRang = this.GetLineDrawItemRang(vStartDItemNo, vEndDItemNo);
        vStartDItemNo = vItemRang.a;
        vEndDItemNo = vItemRang.b;

        if (x <= this.FDrawItems[vStartDItemNo].rect.left) {
            drawItemNo = vStartDItemNo;
            itemNo = this.FDrawItems[vStartDItemNo].ItemNo;
            if (this.FItems[itemNo].StyleNo < THCStyle.Null)
                offset = HC.OffsetBefor;
            else
                offset = this.FDrawItems[vStartDItemNo].CharOffs - 1;
        } else if (x >= this.FDrawItems[vEndDItemNo].rect.right) {
            drawItemNo = vEndDItemNo;
            itemNo = this.FDrawItems[vEndDItemNo].ItemNo;
            if (this.FItems[itemNo].StyleNo < THCStyle.Null)
                offset = HC.OffsetAfter;
            else
                offset = this.FDrawItems[vEndDItemNo].CharOffs + this.FDrawItems[vEndDItemNo].CharLen - 1;
        } else {
            for (let i = vStartDItemNo; i <= vEndDItemNo; i++) {
                vDrawRect = this.FDrawItems[i].rect;
                if ((x >= vDrawRect.left) && (x < vDrawRect.right)) {
                    restrain = ((y < vDrawRect.top) || (y > vDrawRect.bottom));

                    drawItemNo = i;
                    itemNo = this.FDrawItems[i].ItemNo;
                    if (this.FItems[itemNo].StyleNo < THCStyle.Null) {
                        if (restrain) {
                            if (x < vDrawRect.left + vDrawRect.width / 2)
                                offset = HC.OffsetBefor;
                            else
                                offset = HC.OffsetAfter;
                        } else
                            offset = this.GetDrawItemOffsetAt(i, x);
                    } else 
                        offset = this.FDrawItems[i].CharOffs + this.GetDrawItemOffsetAt(i, x) - 1;

                    break;
                }
            }
        }

        return {
            itemNo: itemNo,
            offset: offset,
            drawItemNo: drawItemNo,
            restrain: restrain
        }
    }

    CoordInSelect(x, y, itemNo, offset, restrain) {
        let vResult = false;

        if ((itemNo < 0) || (offset < 0))
            return vResult;

        if (restrain)
            return vResult;

        let vDrawItemNo = this.GetDrawItemNoByOffset(itemNo, offset);
        let vDrawRect = this.FDrawItems[vDrawItemNo].rect;
        vResult = vDrawRect.pointInAt(x, y);
        if (vResult) {
            if (this.FItems[itemNo].StyleNo < THCStyle.Null) {
                let vX = x - vDrawRect.left;
                let vY = y - vDrawRect.left - Math.trunc(this.GetLineBlankSpace(vDrawItemNo) / 2);

                vResult = this.FItems[itemNo].CoordInSelect(vX, vY);
            } else
                vResult = this.OffsetInSelect(itemNo, offset);
        }

        return vResult;
    }

    GetDrawItemText(drawItemNo) {
        let vDrawItem = this.FDrawItems[drawItemNo];
        return this.FItems[vDrawItem.ItemNo].Text.substr(vDrawItem.CharOffs - 1, vDrawItem.CharLen);
    }

    _GetNorAlignDrawItemOffsetWidth(drawItemNo, aDrawOffset, hclCanvas) {
        let vResult = 0, vText;
        
        if (HC.UNPLACEHOLDERCHAR) {
            vText = this.GetDrawItemText(drawItemNo);
            if (vText != "") {
                let vLen = vText.length;
                let vCharWArr = hclCanvas.getTextExtentExPoint(vText, vLen);
                vResult = vCharWArr[aDrawOffset - 1];
            }
        } else {
            let vDrawItem = this.FDrawItems[drawItemNo];
            vText = this.FItems[vDrawItem.ItemNo].Text.substr(vDrawItem.CharOffs - 1, aDrawOffset);
            if (vText != "")
                vResult = hclCanvas.TextWidth(vText);
        }

        return vResult;
    }

    GetDrawItemOffsetWidth(drawItemNo, drawOffs, styleCanvas = null) {
        let vResult = 0;
        if (drawOffs == 0)
            return vResult;

        let vDrawItem = this.FDrawItems[drawItemNo];
        let vStyleNo = this.FItems[vDrawItem.ItemNo].StyleNo;
        if (vStyleNo < THCStyle.Null) {
            if (drawOffs > HC.OffsetBefor)
                vResult = this.FDrawItems[drawItemNo].width;
        } else {
            let vCanvas = null;
            if (styleCanvas != null)
                vCanvas = styleCanvas;
            else {
                vCanvas = this.FStyle.TempCanvas;
                this.FStyle.ApplyTempStyle(vStyleNo);
            }

            let vAlignHorz = this.FStyle.ParaStyles[this.GetDrawItemParaStyle(drawItemNo)].AlignHorz;
            switch (vAlignHorz) {
                case TParaAlignHorz.Left:
                case TParaAlignHorz.Right:
                case TParaAlignHorz.Center:
                    vResult = this._GetNorAlignDrawItemOffsetWidth(drawItemNo, drawOffs, vCanvas);
                    break;

                case TParaAlignHorz.Justify:
                case TParaAlignHorz.Scatter: {
                    if (vAlignHorz == TParaAlignHorz.Justify) {
                        if (this.IsParaLastDrawItem(drawItemNo)) {
                            vResult = this._GetNorAlignDrawItemOffsetWidth(drawItemNo, drawOffs, vCanvas);
                            return vResult;
                        }
                    }

                    let vText = this.GetDrawItemText(drawItemNo);
                    let vLen = vText.length;
                    let vCharWArr = vCanvas.getTextExtentExPoint(vText, vLen);

                    let viSplitW = vDrawItem.width - vCharWArr[vLen - 1];
                    let vMod = 0;

                    let vSplitList = new TList();
                    let vSplitCount = this.GetJustifyCount(vText, vSplitList);
                    let vLineLast = this.IsLineLastDrawItem(drawItemNo);
                    if (vLineLast && (vSplitCount > 0))
                        vSplitCount--;

                    if (vSplitCount > 0) {
                        vMod = viSplitW % vSplitCount;
                        viSplitW = Math.trunc(viSplitW / vSplitCount);
                    }

                    let vExtra = 0, vInnerOffs = 0;
                    for (let i = 0; i <= vSplitList.count - 2; i++) {
                        if (vLineLast && (i == vSplitList.count - 2)) {
                            //
                        } else if (vMod > 0) {
                            vExtra += viSplitW + 1;
                            vMod--;
                        } else
                            vExtra += viSplitW;

                        vInnerOffs = vSplitList[i + 1] - 1;
                        if (vInnerOffs == drawOffs) {
                            vResult = vCharWArr[vInnerOffs - 1] + vExtra;
                            break;
                        } else if (vInnerOffs > drawOffs) {
                            vResult = vCharWArr[drawOffs - vSplitList[i]] + vExtra;
                            break;
                        }
                    }
                    
                    break;
                }
            }
        }

        return vResult;
    }

    GetRectItemInnerCaretInfo(rectItem, itemNo, drawItemNo, aDrawItem, caretInfo) {
        rectItem.GetCaretInfo(caretInfo);
        let vLineSpaceHalf = Math.trunc(this.GetLineBlankSpace(drawItemNo) / 2);
        let vDrawRect = aDrawItem.rect.inFlate(0, -vLineSpaceHalf, true);

        switch (this.FStyle.ParaStyles[this.FItems[itemNo].ParaNo].AlignVert) {
            case TParaAlignVert.Center: 
                caretInfo.y = caretInfo.y + vLineSpaceHalf + (vDrawRect.height - rectItem.Height) / 2;
                break;

            case TParaAlignVert.Top: 
                caretInfo.y = caretInfo.y + vLineSpaceHalf;
                break;
            
            default:
                caretInfo.y = caretInfo.y + vLineSpaceHalf + vDrawRect.height - rectItem.Height;
                break;
        }
    }

    GetItemActualOffset(itemNo, offset, after = false) {
        return HC.GetTextActualOffset(this.FItems[itemNo].Text, offset, after);
    }

    GetItemOffsetAfter(itemNo) {
        if (this.FItems[itemNo].StyleNo < THCStyle.Null)
            return HC.OffsetAfter;
        else
            return this.FItems[itemNo].length;
    }

    GetDataDrawItemRang(top, bottom, firstDItemNo, lastDItemNo) {
        firstDItemNo = -1;
        lastDItemNo = -1;

        for (let i = 0; i <= this.FDrawItems.count - 1; i++) {
            if ((this.FDrawItems[i].LineFirst)
                && (this.FDrawItems[i].rect.bottom > top)
                && (this.FDrawItems[i].rect.top < bottom))
            {
                firstDItemNo = i;
                break;
            }
        }

        if (firstDItemNo < 0)
            return {
                a: firstDItemNo,
                b: lastDItemNo
            };


        for (let i = firstDItemNo; i <= this.FDrawItems.count - 1; i++) {
            if ((this.FDrawItems[i].LineFirst) && (this.FDrawItems[i].rect.top >= bottom)) {
                lastDItemNo = i - 1;
                break;
            }
        }

        if (lastDItemNo < 0)
            lastDItemNo = this.FDrawItems.count - 1;

        return {
            a: firstDItemNo,
            b: lastDItemNo
        };
    }

    GetItemLastDrawItemNo(itemNo) {
        let vResult = -1;
        if (this.FItems[itemNo].FirstDItemNo < 0)                
            return vResult;

        vResult = this.FItems[itemNo].FirstDItemNo + 1;
        while (vResult < this.FDrawItems.count)
        {
            if (this.FDrawItems[vResult].ParaFirst || (this.FDrawItems[vResult].ItemNo != itemNo))
                break;
            else
                vResult++;
        }

        vResult--;
        return vResult;
    }

    OffsetInSelect(itemNo, offset) {
        let vResult = false;

        if ((itemNo < 0) || (offset < 0))
            return vResult;

        if (this.FItems[itemNo].StyleNo < THCStyle.Null) {
            if ((offset == HC.OffsetInner) && this.FItems[itemNo].IsSelectComplate)
                vResult = true;

            return vResult;
        }

        if (this.SelectExists()) {
            if ((itemNo > this.FSelectInfo.StartItemNo) && (itemNo < this.FSelectInfo.EndItemNo))
                vResult = true;
            else if (itemNo == this.FSelectInfo.StartItemNo) {
                if (itemNo == this.FSelectInfo.EndItemNo)
                    vResult = (offset >= this.FSelectInfo.StartItemOffset) && (offset <= this.FSelectInfo.EndItemOffset);
                else
                    vResult = (offset >= this.FSelectInfo.StartItemOffset);
            } else if (itemNo == this.FSelectInfo.EndItemNo)
                vResult = (offset <= this.FSelectInfo.EndItemOffset);
        }

        return vResult;
    }

    CoordToItemOffset(x, y, itemNo, offset, ax, ay) {
        ax = x;
        ay = y;
        if (itemNo < 0)
            return {
                x: ax,
                y: ay
            }

        let vDrawItemNo = this.GetDrawItemNoByOffset(itemNo, offset);
        let vDrawRect = this.FDrawItems[vDrawItemNo].rect.inFlate(0, -Math.trunc(this.GetLineBlankSpace(vDrawItemNo) / 2), true);

        ax = ax - vDrawRect.left;
        ay = ay - vDrawRect.top;
        if (this.FItems[itemNo].StyleNo < THCStyle.Null) {
            switch (this.FStyle.ParaStyles[this.FItems[itemNo].ParaNo].AlignVert) {
                case TParaAlignVert.Center: 
                    ay = ay - Math.trunc((vDrawRect.height - this.FItems[itemNo].Height) / 2);
                    break;

                case TParaAlignVert.Top: 
                    break;

                default:
                    ay = ay - (vDrawRect.height - this.FItems[itemNo].Height);
                    break;
            }
        }

        return {
            x: ax,
            y: ay
        }
    }

    GetDrawItemNoByOffset(itemNo, offset) {
        let vResult = this.FItems[itemNo].FirstDItemNo;
        if (this.FItems[itemNo].StyleNo > THCStyle.Null) {
            if (this.FItems[itemNo].length > 0) {
                let vDrawItem;
                for (let i = this.FItems[itemNo].FirstDItemNo; i <= this.FDrawItems.count - 1; i++) {
                    vDrawItem = this.FDrawItems[i];
                    if (vDrawItem.ItemNo != itemNo)
                        break;

                    if (offset - vDrawItem.CharOffs < vDrawItem.CharLen) {
                        vResult = i;
                        break;
                    }
                }
            }
        }

        return vResult;
    }

    IsLineLastDrawItem(drawItemNo) {
        return ((drawItemNo == this.FDrawItems.count - 1) || (this.FDrawItems[drawItemNo + 1].LineFirst));
    }
    
    IsParaLastDrawItem(drawItemNo) {
        let vResult = false;
        let vItemNo = this.FDrawItems[drawItemNo].ItemNo;
        if (vItemNo < this.FItems.count - 1) {
            if (this.FItems[vItemNo + 1].ParaFirst)
                vResult = (this.FDrawItems[drawItemNo].CharOffsetEnd() == this.FItems[vItemNo].length);
        } else
            vResult = (this.FDrawItems[drawItemNo].CharOffsetEnd() == this.FItems[vItemNo].length);

        return vResult;
    }

    IsParaLastItem(itemNo) {
        return ((itemNo == this.FItems.count - 1) || this.FItems[itemNo + 1].ParaFirst);
    }

    GetTopLevelData() {
        let vResult = null;
        if ((this.FSelectInfo.StartItemNo >= 0) && (this.FSelectInfo.EndItemNo < 0)) {
            if ((this.FItems[this.FSelectInfo.StartItemNo].StyleNo < THCStyle.Null) && (this.FSelectInfo.StartItemOffset == HC.OffsetInner))
                vResult = this.FItems[this.FSelectInfo.StartItemNo].GetActiveData();
        }

        if (vResult == null)
            vResult = this;

        return vResult;
    }

    GetTopLevelDataAt(x, y) {
        let vResult = null;

        let vItemNo = -1, vOffset = 0, vDrawItemNo = -1;
        let vRestrain = false;
        let vInfo = this.GetItemAt(x, y, vItemNo, vOffset, vDrawItemNo, vRestrain);
        vItemNo = vInfo.itemNo;
        vOffset = vInfo.offset;
        vDrawItemNo = vInfo.drawItemNo;
        vRestrain = vInfo.restrain;
        if ((!vRestrain) && (vItemNo >= 0)) {
            if (this.FItems[vItemNo].StyleNo < THCStyle.Null) {
                let vPoint = this.CoordToItemOffset(x, y, vItemNo, vOffset, 0, 0);
                vResult = this.FItems[vItemNo].GetTopLevelDataAt(vPoint.x, vPoint.y);
            }
        }
    
        if (vResult == null)
            vResult = this;

        return vResult;
    }

    GetActiveDrawItemNo() {
        if (this.FCaretDrawItemNo >= 0)
            return this.FCaretDrawItemNo;

        let vResult = -1;
        if (this.FSelectInfo.StartItemNo < 0) {
            //
        } else {
            let vItemNo = -1;

            if (this.SelectExists()) {
                if (this.FSelectInfo.EndItemNo >= 0)
                    vItemNo = this.FSelectInfo.EndItemNo;
                else
                    vItemNo = this.FSelectInfo.StartItemNo;
            } else
                vItemNo = this.FSelectInfo.StartItemNo;

            if (this.FItems[vItemNo].StyleNo < THCStyle.Null)
                vResult = this.FItems[vItemNo].FirstDItemNo;
            else {
                for (let i = this.FItems[vItemNo].FirstDItemNo; i <= this.FDrawItems.count - 1; i++) {
                    let vDrawItem = this.FDrawItems[i];
                    if (this.FSelectInfo.StartItemOffset - vDrawItem.CharOffs + 1 <= vDrawItem.CharLen) {
                        vResult = i;
                        break;
                    }
                }
            }
        }

        return vResult;
    }

    GetActiveDrawItem() {
        let vDrawItemNo = this.GetActiveDrawItemNo();
        if (vDrawItemNo < 0)
            return null;
        else
            return this.FDrawItems[vDrawItemNo];
    }

    GetActiveItemNo() {
        return this.FSelectInfo.StartItemNo;
    }

    GetActiveItem() {
        let vItemNo = this.GetActiveItemNo();
        if (vItemNo < 0)
            return null;
        else
            return this.FItems[vItemNo];
    }

    GetTopLevelItem() {
        let vResult = this.GetActiveItem();
        if ((vResult != null) && (vResult.StyleNo < THCStyle.Null))
            vResult = vResult.GetTopLevelItem();

        return vResult;
    }

    GetTopLevelDrawItem() {
        let vResult = null;
        let vItem = this.GetActiveItem();
        if (vItem.StyleNo < THCStyle.Null)
            vResult = vItem.GetTopLevelDrawItem();
        if (vResult == null)
            vResult = this.GetActiveDrawItem();

        return vResult;
    }

    GetTopLevelDrawItemCoord() {
        let vResult = TPoint.Create(0, 0);
        let vPt = TPoint.Create(0, 0);
        let vDrawItem = this.GetActiveDrawItem();
        if (vDrawItem != null) {
            vResult = vDrawItem.rect.TopLeft();
            let vItem = this.GetActiveItem();
            if (vItem.StyleNo < THCStyle.Null) {
                vPt = vItem.GetTopLevelDrawItemCoord();
                vPt.y = vPt.y + Math.trunc(this.FStyle.LineSpaceMin / 2);
            }

            vResult.x = vResult.x + vPt.x;
            vResult.y = vResult.y + vPt.y;
        }

        return vResult;
    }

    GetTopLevelRectDrawItem() {
        let vResult = null;

        let vItem = this.GetActiveItem();
        if (vItem.StyleNo < THCStyle.Null) {
            vResult = vItem.GetTopLevelRectDrawItem();
            if (vResult == null)
                vResult = this.GetActiveDrawItem();
        }

        return vResult;
    }

    GetTopLevelRectDrawItemCoord() {
        let vResult = TPoint.Create(-1, -1);
        let vItem = this.GetActiveItem();
        if ((vItem != null) && (vItem.StyleNo < THCStyle.Null)) {
            vResult = this.FDrawItems[vItem.FirstDItemNo].rect.TopLeft();
            let vPt = vItem.GetTopLevelRectDrawItemCoord();
            if (vPt.x >= 0) {
                vPt.y = vPt.y + Math.trunc(this.FStyle.LineSpaceMin / 2);
                vResult.x = vResult.x + vPt.x;
                vResult.y = vResult.y + vPt.y;
            }
        }

        return vResult;
    }

    GetItemStyle(itemNo) {
        return this.FItems[itemNo].StyleNo;
    }

    GetDrawItemStyle(drawItemNo) {
        return this.GetItemStyle(this.FDrawItems[drawItemNo].ItemNo);
    }

    GetItemParaStyle(itemNo) {
        return this.FItems[itemNo].ParaNo;
    }

    GetDrawItemParaStyle(drawItemNo) {
        return this.GetItemParaStyle(this.FDrawItems[drawItemNo].ItemNo);
    }

    GetDrawItemOffsetAt(drawItemNo, x) {
        let vResult = 0;

        let vDrawItem = this.FDrawItems[drawItemNo];
        let vItem = this.FItems[vDrawItem.ItemNo];

        if (vItem.StyleNo < THCStyle.Null)
            vResult = vItem.GetOffsetAt(x - vDrawItem.rect.left);
        else {
            vResult = vDrawItem.CharLen;
            let vText = vItem.SubString(vDrawItem.CharOffs, vDrawItem.CharLen);
            this.FStyle.ApplyTempStyle(vItem.StyleNo);
            let vParaStyle = this.FStyle.ParaStyles[vItem.ParaNo];
            let vWidth = x - vDrawItem.rect.left;

            switch (vParaStyle.AlignHorz) {
                case TParaAlignHorz.Left:
                case TParaAlignHorz.Right:
                case TParaAlignHorz.Center:
                    vResult = HC.GetNorAlignCharOffsetAt(this.FStyle.TempCanvas, vText, vWidth);
                    break;

                case TParaAlignHorz.Justify:
                case TParaAlignHorz.Scatter: {
                    if (vParaStyle.AlignHorz == TParaAlignHorz.Justify) {
                        if (this.IsParaLastDrawItem(drawItemNo)) {
                            vResult = HC.GetNorAlignCharOffsetAt(this.FStyle.TempCanvas, vText, vWidth);
                            return vResult;
                        }
                    }

                    let vLen = vText.length;
                    let vCharWArr = this.FStyle.TempCanvas.getTextExtentExPoint(vText, vLen);
                    let viSplitW = vDrawItem.width - vCharWArr[vLen - 1];
                    let vMod = 0;
                    
                    let vSplitList = new TList();
                    let vSplitCount = this.GetJustifyCount(vText, vSplitList);
                    let vLineLast = this.IsLineLastDrawItem(drawItemNo);

                    if (vLineLast && (vSplitCount > 0))
                        vSplitCount--;

                    if (vSplitCount > 0) {
                        vMod = viSplitW % vSplitCount;
                        viSplitW = Math.trunc(viSplitW / vSplitCount);
                    }

                    let vRight = 0, vExtraAll = 0, vExtra = 0;

                    //vSplitCount := 0;
                    for (let i = 0; i <= vSplitList.count - 2; i++) {
                        // 计算结束位置
                        if (vLineLast && (i == vSplitList.count - 2))
                            vExtra = 0;
                        else {
                            if (vMod > 0) {
                                vExtra = viSplitW + 1;
                                vMod--;
                            } else
                                vExtra = viSplitW;

                            vExtraAll += vExtra;
                        }
                        
                        vRight = vCharWArr[(vSplitList[i + 1] - 1) - 1] + vExtraAll;

                        if (vRight > vWidth) {
                            let j = vSplitList[i];
                            while (j < vSplitList[i + 1]) {
                                if (HC.UNPLACEHOLDERCHAR)
                                    j = HC.GetTextActualOffset(vText, j, true);
                                
                                if (vCharWArr[j - 1] + vExtraAll > vWidth) {
                                    if (HC.UNPLACEHOLDERCHAR)
                                        vRight = vExtraAll - Math.trunc(vExtra / 2) + HC.GetCharHalfFarfromUN(vText, j, vCharWArr);
                                    else
                                        vRight = vExtraAll - Math.trunc(vExtra / 2) + HC.GetCharHalfFarfrom(j, vCharWArr);

                                    if (vWidth > vRight)
                                        vResult = j;
                                    else {
                                        vResult = j - 1;
                                        if (HC.UNPLACEHOLDERCHAR) {
                                            if (HC.IsUnPlaceHolderChar(vText[vResult + 1 - 1]))
                                                vResult = HC.GetTextActualOffset(vText, vResult) - 1;
                                        }
                                    }

                                    break;
                                }
                            }

                            break;
                        }
                    }

                    break;
                }
            }
        }

        return vResult;
    }

    GetSelectStartDrawItemNo() {
        let vResult = -1;
        if (this.FSelectInfo.StartItemNo < 0)
            return vResult;
        else {
            vResult = this.GetDrawItemNoByOffset(this.FSelectInfo.StartItemNo,
                this.FSelectInfo.StartItemOffset);

            if ((this.FSelectInfo.EndItemNo >= 0) && (vResult < this.FItems.count - 1)
                && (this.FDrawItems[vResult].CharOffsetEnd() == this.FSelectInfo.StartItemOffset))
            {
                vResult++;
            }
        }

        return vResult;
    }

    GetSelectEndDrawItemNo() {
        let vResult = -1;
        
        if (this.FSelectInfo.EndItemNo < 0)
            return vResult;
        else
            vResult = this.GetDrawItemNoByOffset(this.FSelectInfo.EndItemNo, this.FSelectInfo.EndItemOffset);

        return vResult;
    }

    SelectInSameDrawItem() {
        let vStartDNo = this.GetSelectStartDrawItemNo();

        if (vStartDNo < 0)
            return false;
        else {
            if (this.GetDrawItemStyle(vStartDNo) < THCStyle.Null)
                return (this.FItems[this.FDrawItems[vStartDNo].ItemNo].IsSelectComplate && (this.FSelectInfo.EndItemNo < 0));
            else
                return (vStartDNo == this.GetSelectEndDrawItemNo());
        }
    }

    DisSelect() {
        let vResult = this.SelectExists();

        if (vResult) {
            // 如果选中是在RectItem中进，下面循环SelectInfo.EndItemNo<0，不能取消选中，所以单独处理StartItemNo
            let vItem = this.FItems[this.FSelectInfo.StartItemNo];
            vItem.DisSelect();
            vItem.Active = false;

            for (let i = this.FSelectInfo.StartItemNo + 1; i <= this.FSelectInfo.EndItemNo; i++) {
                vItem = this.FItems[i];
                vItem.DisSelect();
                vItem.Active = false;
            }

            this.FSelectInfo.EndItemNo = -1;
            this.FSelectInfo.EndItemOffset = -1;
        } else if (this.FSelectInfo.StartItemNo >= 0) {
            let vItem = this.FItems[this.FSelectInfo.StartItemNo];
            vItem.DisSelect();
            //vItem.Active = false;
        }

        this.FSelectInfo.StartItemNo = -1;
        this.FSelectInfo.StartItemOffset = -1;

        return vResult;
    }

    SelectedCanDrag() {
        let vResult = true;

        if (this.FSelectInfo.EndItemNo < 0) {
            if (this.FSelectInfo.StartItemNo >= 0)
                vResult = this.FItems[this.FSelectInfo.StartItemNo].CanDrag();
        } else {
            for (let i = this.FSelectInfo.StartItemNo; i <= this.FSelectInfo.EndItemNo; i++) {
                if (this.FItems[i].StyleNo < THCStyle.Null) {
                    if (!this.FItems[i].IsSelectComplate) {
                        vResult = false;
                        break;
                    }
                }

                if (!this.FItems[i].CanDrag()) {
                    vResult = false;
                    break;
                }
            }
        }

        return vResult;
    }

    SelectedResizing() {
        if ((this.FSelectInfo.StartItemNo >= 0) && (this.FSelectInfo.EndItemNo < 0) 
            && (this.FItems[this.FSelectInfo.StartItemNo].isClass(THCResizeRectItem)))
            return this.FItems[this.FSelectInfo.StartItemNo].Resizing;
        else
            return false;
    }

    IsEmptyData() {
        return ((this.FItems.count == 1) && this.IsEmptyLine(0));
    }

    IsEmptyLine(itemNo) {
        return (this.FItems[itemNo].StyleNo > THCStyle.Null) && (this.Items[itemNo].Text == "");
    }

    ApplyParaAlignHorz(align) {
        let vMatchStyle = new TParaAlignHorzMatch();
        vMatchStyle.Align = align;
        this.ApplySelectParaStyle(vMatchStyle);
    }

    ApplyParaAlignVert(align) {
        let vMatchStyle = new TParaAlignVertMatch();
        vMatchStyle.Align = align;
        this.ApplySelectParaStyle(vMatchStyle);
    }

    ApplyParaBackColor(color) {
        let vMatchStyle = new TParaBackColorMatch();
        vMatchStyle.BackColor = color;
        this.ApplySelectParaStyle(vMatchStyle);
    }

    ApplyParaBreakRough(rough) {
        let vMatchStyle = new TParaBreakRoughMatch();
        vMatchStyle.BreakRough = rough;
        this.ApplySelectParaStyle(vMatchStyle);
    }

    ApplyParaLineSpace(spaceMode, space) {
        let vMatchStyle = new TParaLineSpaceMatch();
        vMatchStyle.SpaceMode = spaceMode;
        vMatchStyle.Space = space;
        this.ApplySelectParaStyle(vMatchStyle);
    }

    ApplyParaLeftIndent(indent) {
        let vMatchStyle = new TParaLeftIndentMatch();
        vMatchStyle.Indent = indent;
        this.ApplySelectParaStyle(vMatchStyle);
    }

    ApplyParaRightIndent(indent) {
        let vMatchStyle = new TParaRightIndentMatch();
        vMatchStyle.Indent = indent;
        this.ApplySelectParaStyle(vMatchStyle);
    }

    ApplyParaFirstIndent(indent) {
        let vMatchStyle = new TParaFirstIndentMatch();
        vMatchStyle.Indent = indent;
        this.ApplySelectParaStyle(vMatchStyle);
    }

    ApplySelectTextStyle(matchStyle) { }

    ApplySelectParaStyle(matchStyle)  { }

    ApplyTableCellAlign(align) { }

    DeleteSelected() {
        return false;
    }

    ApplyTextStyle(fontStyle) {
        let vMatchStyle = new TTextStyleMatch();
        vMatchStyle.FontStyle = fontStyle;
        this.ApplySelectTextStyle(vMatchStyle);
    }

    ApplyTextFontName(fontName) {
        let vMatchStyle = new TFontNameStyleMatch();
        vMatchStyle.FontName = fontName;
        this.ApplySelectTextStyle(vMatchStyle);
    }

    ApplyTextFontSize(fontSize) {
        let vMatchStyle = new TFontSizeStyleMatch();
        vMatchStyle.FontSize = fontSize;
        this.ApplySelectTextStyle(vMatchStyle);
    }

    ApplyTextColor(color) {
        let vMatchStyle = new TColorStyleMatch();
        vMatchStyle.color = color;
        this.ApplySelectTextStyle(vMatchStyle);
    }

    ApplyTextBackColor(color) {
        let vMatchStyle = new TBackColorStyleMatch();
        vMatchStyle.color = color;
        this.ApplySelectTextStyle(vMatchStyle);
    }

    DrawItemSelectAll(fristDItemNo, lastDItemNo) {
        let vSelStartDItemNo = this.GetSelectStartDrawItemNo();
        let vSelEndDItemNo = this.GetSelectEndDrawItemNo();

        return  ( (vSelStartDItemNo < fristDItemNo)
                  || (
                        (vSelStartDItemNo == fristDItemNo)
                        && (this.FSelectInfo.StartItemOffset == this.FDrawItems[vSelStartDItemNo].CharOffs)
                     )
                )
                &&
                (
                    (vSelEndDItemNo > lastDItemNo)
                    || (
                            (vSelEndDItemNo == lastDItemNo)
                            && (this.SelectInfo.EndItemOffset == this.FDrawItems[vSelEndDItemNo].CharOffs + this.FDrawItems[vSelEndDItemNo].CharLen)
                        )
                );
    }

    DrawTextJsutify(hclCanvas, rect, text, lineLast, textDrawTop) {
        let vX = rect.left;
        let vLen = text.length;
        let vCharWArr = hclCanvas.getTextExtentExPoint(text, vLen);

        let viSplitW = rect.width - vCharWArr[vLen - 1];
        if (viSplitW > 0) {
            let vSplitList = new TList();
            let vSplitCount = this.GetJustifyCount(text, vSplitList);
            if (lineLast && (vSplitCount > 0))  // 行最后DrawItem，少分一个
                vSplitCount--;

            let vMod = 0;
            if (vSplitCount > 0) {
                vMod = viSplitW % vSplitCount;
                viSplitW = Math.trunc(viSplitW / vSplitCount);
            }

            vX = 0;
            let vExtra = 0;
            let vS;
            for (let i = 0; i <= vSplitList.count - 2; i++) {
                vLen = vSplitList[i + 1] - vSplitList[i];
                vS = text.substr(vSplitList[i] - 1, vLen);

                if (i > 0)
                    vX = vCharWArr[vSplitList[i] - 2] + vExtra;

                hclCanvas.textOut(rect.left + vX, textDrawTop, vS);

                if (lineLast && (i == vSplitList.count - 2)) {
                    //
                } else if (vMod > 0) {
                    vExtra += viSplitW + 1;
                    vMod--;
                } else
                    vExtra += viSplitW;
            }
        }
        else
            hclCanvas.textOut(vX, textDrawTop, text);
    }


    PaintDataRange(dataDrawLeft, dataDrawTop, dataDrawRight, dataDrawBottom, dataScreenTop, dataScreenBottom,
        voffset, firstDItemNo, lastDItemNo, hclCanvas, paintInfo)
    {
        if ((firstDItemNo < 0) || (lastDItemNo < 0))
            return;

        let vSelStartDNo = -1, vSelStartDOffs = -1, vSelEndDNo = -1, vSelEndDOffs = -1;
        let vDrawsSelectAll = false;

        if (!paintInfo.print) {
            vSelStartDNo = this.GetSelectStartDrawItemNo();
            if (vSelStartDNo < 0)
                vSelStartDOffs = -1;
            else
                vSelStartDOffs = this.FSelectInfo.StartItemOffset - this.FDrawItems[vSelStartDNo].CharOffs + 1;

            vSelEndDNo = this.GetSelectEndDrawItemNo();
            if (vSelEndDNo < 0)
                vSelEndDOffs = -1;
            else
                vSelEndDOffs = this.FSelectInfo.EndItemOffset - this.FDrawItems[vSelEndDNo].CharOffs + 1;

            vDrawsSelectAll = this.DrawItemSelectAll(firstDItemNo, lastDItemNo);
        }

        let vPrioStyleNo = THCStyle.Null;
        let vPrioParaNo = THCStyle.Null;
        let vTextHeight = 0;

        let vVOffset = dataDrawTop - voffset;

        hclCanvas.save();
        try {
            let vLineSpace = -1;
            if (!this.FDrawItems[firstDItemNo].LineFirst)
                vLineSpace = this.GetLineBlankSpace(firstDItemNo);

            let vDrawItem;
            let vDrawRect, vClearRect;
            let vAlignHorz = TParaAlignHorz.Left;
            let vItem;
            let vRectItem;
            let vText;

            for (let i = firstDItemNo; i <= lastDItemNo; i++) {
                vDrawItem = this.FDrawItems[i];
                vItem = this.FItems[vDrawItem.ItemNo];
                vDrawRect = vDrawItem.rect.offset(dataDrawLeft, vVOffset, true);

                if (this.FDrawItems[i].LineFirst)
                    vLineSpace = this.GetLineBlankSpace(i);

                this.DrawItemPaintBefor(this, vDrawItem.ItemNo, i, vDrawRect, dataDrawLeft, dataDrawRight, 
                    dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);

                if (vPrioParaNo != vItem.ParaNo) {
                    vPrioParaNo = vItem.ParaNo;
                    vAlignHorz = this.FStyle.ParaStyles[vItem.ParaNo].AlignHorz;
                }

                vClearRect = vDrawRect.inFlate(0, -Math.trunc(vLineSpace / 2), true);
                if (vItem.StyleNo < THCStyle.Null) {
                    vRectItem = vItem;
                    vPrioStyleNo = vRectItem.StyleNo;

                    if (vRectItem.JustifySplit()) {
                        if (((vAlignHorz == TParaAlignHorz.Justify)
                                    && (!this.IsLineLastDrawItem(i))
                                )
                                ||
                                (vAlignHorz == TParaAlignHorz.Scatter)
                            )
                        {
                            if (this.IsLineLastDrawItem(i))
                                vClearRect.offset(vClearRect.width - vRectItem.Width, 0);
                        }
                        else
                            vClearRect.right = vClearRect.left + vRectItem.Width;
                    }

                    switch (this.FStyle.ParaStyles[vItem.ParaNo].AlignVert) {
                        case TParaAlignVert.Center:
                            vClearRect.inFlate(0, -Math.trunc((vClearRect.height - vRectItem.Height) / 2));
                            break;

                        case TParaAlignVert.Top:
                            break;

                        default:
                            vClearRect.left = vClearRect.bottom - vRectItem.Height;
                            break;
                    }

                    this.DrawItemPaintContent(this, vDrawItem.ItemNo, i, vDrawRect, vClearRect, "", dataDrawLeft, dataDrawRight, dataDrawBottom,
                        dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);

                    if (vRectItem.IsSelectComplate) {
                        hclCanvas.brush.color = this.FStyle.SelColor;
                        hclCanvas.fillBounds(vDrawRect);
                    }

                    vItem.PaintTo(this.FStyle, vClearRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
                } else {
                    if (vItem.StyleNo != vPrioStyleNo) {
                        vPrioStyleNo = vItem.StyleNo;
                        this.FStyle.TextStyles[vPrioStyleNo].ApplyStyle(hclCanvas, paintInfo.ScaleY / paintInfo.Zoom);
                        this.FStyle.ApplyTempStyle(vPrioStyleNo);

                        vTextHeight = this.FStyle.TextStyles[vPrioStyleNo].FontHeight;
                        if (this.FStyle.TextStyles[vPrioStyleNo].FontStyles.has(TFontStyle.Superscript)
                            || this.FStyle.TextStyles[vPrioStyleNo].FontStyles.has(TFontStyle.Subscript))
                        {
                            vTextHeight = vTextHeight + vTextHeight;
                        }

                        if (vItem.HyperLink != "") {
                            hclCanvas.font.color = HC.HyperTextColor;
                            hclCanvas.font.styles.add(TFontStyle.Underline);
                        }
                    }

                    let vTextDrawTop;
                    switch (this.FStyle.ParaStyles[vItem.ParaNo].AlignVert) {
                        case TParaAlignVert.Center:
                            vTextDrawTop = vClearRect.top + Math.trunc((vClearRect.bottom - vClearRect.top - vTextHeight) / 2);
                            break;

                        case TParaAlignVert.Top:
                            vTextDrawTop = vClearRect.top;
                            break;

                        default:
                            vTextDrawTop = vClearRect.bottom - vTextHeight;
                            break;
                    }

                    if (this.FStyle.TextStyles[vPrioStyleNo].FontStyles.has(TFontStyle.Subscript))
                        vTextDrawTop = vTextDrawTop + Math.trunc(vTextHeight / 2);

                    if (this.FStyle.TextStyles[vPrioStyleNo].BackColor != HC.HCTransparentColor) {
                        hclCanvas.brush.color = this.FStyle.TextStyles[vPrioStyleNo].BackColor;
                        hclCanvas.fillRect(TRect.Create(vClearRect.left, vClearRect.top, vClearRect.left + vDrawItem.width, vClearRect.bottom));
                    }

                    vText = vItem.Text.substr(vDrawItem.CharOffs - 1, vDrawItem.CharLen);
                    this.DrawItemPaintContent(this, vDrawItem.ItemNo, i, vDrawRect, vClearRect, vText, dataDrawLeft, dataDrawRight,
                        dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);

                    if (!paintInfo.print) {
                        if (vDrawsSelectAll) {
                            hclCanvas.brush.color = this.FStyle.SelColor;
                            hclCanvas.fillBounds(TRect.Create(vDrawRect.left, vDrawRect.top, vDrawRect.left + vDrawItem.width, Math.min(vDrawRect.bottom, dataScreenBottom)));
                        } else if (vSelEndDNo >= 0) {
                            hclCanvas.brush.color = this.FStyle.SelColor;
                            if ((vSelStartDNo == vSelEndDNo) && (i == vSelStartDNo)) {
                                hclCanvas.fillRect(TRect.Create(vDrawRect.left + this.GetDrawItemOffsetWidth(i, vSelStartDOffs),
                                    vDrawRect.top,
                                    vDrawRect.left + this.GetDrawItemOffsetWidth(i, vSelEndDOffs, this.FStyle.TempCanvas),
                                    Math.min(vDrawRect.bottom, dataScreenBottom)));
                            }
                            else if (i == vSelStartDNo) {
                                hclCanvas.fillRect(TRect.Create(vDrawRect.left + this.GetDrawItemOffsetWidth(i, vSelStartDOffs, this.FStyle.TempCanvas),
                                    vDrawRect.top,
                                    vDrawRect.right,
                                    Math.min(vDrawRect.bottom, dataScreenBottom)));
                            } else if (i == vSelEndDNo) {
                                hclCanvas.fillRect(TRect.Create(vDrawRect.left,
                                    vDrawRect.top,
                                    vDrawRect.left + this.GetDrawItemOffsetWidth(i, vSelEndDOffs, this.FStyle.TempCanvas),
                                    Math.min(vDrawRect.bottom, dataScreenBottom)));
                            } else if ((i > vSelStartDNo) && (i < vSelEndDNo))
                                hclCanvas.fillRect(vDrawRect);
                        }
                    }

                    vItem.PaintTo(this.FStyle, vClearRect, dataDrawTop, dataDrawBottom,
                        dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);

                    if (vText != "") {
                        if (!(paintInfo.print && vItem.PrintInvisible)) {
                            hclCanvas.brush.style = TBrushStyle.Clear;

                            switch (vAlignHorz) {
                                case TParaAlignHorz.Left:
                                case TParaAlignHorz.Right:
                                case TParaAlignHorz.Center:
                                    hclCanvas.textOut(vClearRect.left, vTextDrawTop, vText);
                                    break;

                                case TParaAlignHorz.Justify:
                                case TParaAlignHorz.Scatter:
                                    this.DrawTextJsutify(hclCanvas, vClearRect, vText, this.IsLineLastDrawItem(i), vTextDrawTop);
                                    break;
                            }
                        }
                    } else {
                        if (!vItem.ParaFirst)
                            throw HC.HCS_EXCEPTION_NULLTEXT;
                    }
                }

                this.DrawItemPaintAfter(this, vDrawItem.ItemNo, i, vClearRect, dataDrawLeft, dataDrawRight, dataDrawBottom,
                    dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
            }
        } finally {
            hclCanvas.restore();
        }
    }

    PaintData(dataDrawLeft, dataDrawTop, dataDrawRight, dataDrawBottom,
        dataScreenTop, dataScreenBottom, voffset, hclCanvas, paintInfo)
    {
        if (this.FItems.count == 0)
            return;

        let vFirstDItemNo = -1, vLastDItemNo = -1;
        let vVOffset = dataDrawTop - voffset;
        
        let vRe = this.GetDataDrawItemRang(Math.max(dataDrawTop, dataScreenTop) - vVOffset,
            Math.min(dataDrawBottom, dataScreenBottom) - vVOffset, vFirstDItemNo, vLastDItemNo);
        vFirstDItemNo = vRe.a;
        vLastDItemNo = vRe.b;

        this.PaintDataRange(dataDrawLeft, dataDrawTop, dataDrawRight, dataDrawBottom, dataScreenTop,
            dataScreenBottom, voffset, vFirstDItemNo, vLastDItemNo, hclCanvas, paintInfo);
    }

    GetLineBlankSpace(drawNo) {
        let vFirst = drawNo;
        let vLast = -1;
        let vItemRang = this.GetLineDrawItemRang(vFirst, vLast);
        vFirst = vItemRang.a;
        vLast = vItemRang.b;

        let vMaxHi = 0;
        let vMaxDrawItemNo;
        let vHi;
        vMaxDrawItemNo = vFirst;
        for (let i = vFirst; i <= vLast; i++) {
            if (this.GetDrawItemStyle(i) < THCStyle.Null)
                vHi = this.FItems[this.FDrawItems[i].ItemNo].Height;
            else
                vHi = this.FStyle.TextStyles[this.FItems[this.FDrawItems[i].ItemNo].StyleNo].FontHeight;

            if (vHi > vMaxHi) {
                vMaxHi = vHi;
                vMaxDrawItemNo = i;
            }
        }

        if (this.GetDrawItemStyle(vMaxDrawItemNo) < THCStyle.Null)
            return this.FStyle.LineSpaceMin;
        else
            return this.GetDrawItemLineSpace(vMaxDrawItemNo) - vMaxHi;
    }

    GetDrawItemLineSpace(drawNo) {
        let vResult = this.FStyle.LineSpaceMin;

        if (this.GetDrawItemStyle(drawNo) >= THCStyle.Null)
            vResult = this.CalculateLineHeight(this.FStyle.TextStyles[this.GetDrawItemStyle(drawNo)],
                this.FStyle.ParaStyles[this.GetDrawItemParaStyle(drawNo)]);

        return vResult;
    }

    SelectExists(ifRectItem = true) {
        let vResult = false;

        if (this.FSelectInfo.StartItemNo >= 0) {
            if (this.FSelectInfo.EndItemNo >= 0) {
                if (this.FSelectInfo.StartItemNo != this.FSelectInfo.EndItemNo)
                    vResult = true;
                else
                    vResult = (this.FSelectInfo.StartItemOffset != this.FSelectInfo.EndItemOffset);
            } else if (ifRectItem && (this.FItems[this.FSelectInfo.StartItemNo].StyleNo < THCStyle.Null))
                vResult = this.FItems[this.FSelectInfo.StartItemNo].SelectExists();
        }

        return vResult;
    }

    MarkStyleUsed(mark) {
        let vItem;
        for (let i = 0; i <= this.FItems.count - 1; i++) {
            vItem = this.FItems[i];
            if (mark) {
                this.FStyle.ParaStyles[vItem.ParaNo].CheckSaveUsed = true;
                if (vItem.StyleNo < THCStyle.Null)
                    vItem.MarkStyleUsed(mark);
                else
                    this.FStyle.TextStyles[vItem.StyleNo].CheckSaveUsed = true;
            } else {
                vItem.ParaNo = this.FStyle.ParaStyles[vItem.ParaNo].TempNo;
                if (vItem.StyleNo < THCStyle.Null)
                    vItem.MarkStyleUsed(mark);
                else
                    vItem.StyleNo = this.FStyle.TextStyles[vItem.StyleNo].TempNo;
            }
        }
    }

    SaveItemToStream(stream, startItemNo, startOffset, endItemNo, endOffset) {
        let vBegPos = stream.position;
        stream.writeUInt64(vBegPos);

        let vCount = endItemNo - startItemNo + 1;
        stream.writeInt32(vCount);

        let vCountAct = 0;
        if (vCount > 0) {
            if (startItemNo != endItemNo) {
                if (this.DoSaveItem(startItemNo)) {
                    this.FItems[startItemNo].SaveToStream(stream, startOffset, this.FItems[startItemNo].Length);
                    vCountAct++;
                }

                for (let i = startItemNo + 1; i <= endItemNo - 1; i++) {
                    if (this.DoSaveItem(i)) {
                        this.FItems[i].SaveToStream(stream);
                        vCountAct++;
                    }
                }

                if (this.DoSaveItem(endItemNo)) {
                    this.FItems[endItemNo].SaveToStream(stream, 0, endOffset);
                    vCountAct++;
                }
            } else if (this.DoSaveItem(startItemNo)) {
                this.FItems[startItemNo].SaveToStream(stream, startOffset, endOffset);
                vCountAct++;
            }
        }
        
        let vEndPos = stream.position;
        stream.position = vBegPos;
        vBegPos = vEndPos - vBegPos - 8;
        stream.writeUInt64(vBegPos);
        if (vCount != vCountAct)
            stream.writeInt32(vCountAct);

        stream.position = vEndPos;
    }

    SaveToStream(stream) {
        this.SaveToStreamRange(stream, 0, 0, this.FItems.count - 1, this.FItems.last.length);
    }

    SaveToStreamRange(stream, startItemNo, startOffset, endItemNo, endOffset) {
        this.SaveItemToStream(stream, startItemNo, startOffset, endItemNo, endOffset);
    }

    SaveToText() {
        return this.SaveToTextRange(0, 0, this.FItems.count - 1, this.FItems.last.length);
    }

    SaveToTextRange(startItemNo, startOffset, endItemNo, endOffset) {
        let vResult = "";
        let vi = endItemNo - startItemNo + 1;
        if (vi > 0) {
            if (startItemNo != endItemNo) {
                if (this.DoSaveItem(startItemNo)) {
                    if (this.FItems[startItemNo].StyleNo > THCStyle.Null)
                        vResult = this.FItems[startItemNo].SubString(startOffset + 1, this.FItems[startItemNo].length - startOffset);
                    else
                        vResult = this.FItems[startItemNo].SaveSelectToText();
                }

                for (let i = startItemNo + 1; i <= endItemNo - 1; i++) {
                    if (this.DoSaveItem(i))
                        vResult = vResult + this.FItems[i].Text;
                }

                if (this.DoSaveItem(endItemNo)) {
                    if (this.FItems[endItemNo].StyleNo > THCStyle.Null)
                        vResult = vResult + this.FItems[endItemNo].SubString(1, endOffset);
                    else
                        vResult = this.FItems[endItemNo].SaveSelectToText();
                }
            } else if (this.DoSaveItem(startItemNo)) {
                if (this.FItems[startItemNo].StyleNo > THCStyle.Null)
                    vResult = this.FItems[startItemNo].SubString(startOffset + 1, endOffset - startOffset);
            }
        }

        return vResult;
    }
    
    SaveSelectToStream(stream) {
        if (this.SelectExists()) {
            if ((this.FSelectInfo.EndItemNo < 0) && (this.FItems[this.FSelectInfo.StartItemNo].StyleNo < THCStyle.Null)) {
                if (this.FItems[this.FSelectInfo.StartItemNo].IsSelectComplateTheory()) {
                    this.SaveToStreamRange(stream, this.FSelectInfo.StartItemNo, HC.OffsetBefor, this.FSelectInfo.StartItemNo, HC.OffsetAfter);
                } else
                    this.FItems[this.FSelectInfo.StartItemNo].SaveSelectToStream(stream);
            } else
                this.SaveToStreamRange(stream, this.FSelectInfo.StartItemNo, this.FSelectInfo.StartItemOffset, this.FSelectInfo.EndItemNo, this.FSelectInfo.EndItemOffset);
        }
    }

    SaveSelectToText() {
        let vResult = "";

        if (this.SelectExists()) {
            if ((this.FSelectInfo.EndItemNo < 0) && (this.FItems[this.FSelectInfo.StartItemNo].StyleNo < THCStyle.Null))
                vResult = this.FItems[this.FSelectInfo.StartItemNo].SaveSelectToText();
            else
                vResult = this.SaveToTextRange(this.FSelectInfo.StartItemNo, this.FSelectInfo.StartItemOffset,
                    this.FSelectInfo.EndItemNo, this.FSelectInfo.EndItemOffset);
        }

        return vResult;
    }

    GetSelectText() {
        return this.SaveSelectToText();
    }

    InsertStream(stream, style, fileVersion) {
        return false;
    }

    LoadFromStream(stream, style, fileVersion) {
        this.FLoading = true;
        try {
            this.DoLoadFromStream(stream, style, fileVersion);
        } finally {
            this.FLoading = false;
        }
    }

    ToHtml(path) {
        let vResult = "";
        for (let i = 0; i <= this.FItems.count - 1; i++) {
            if (this.FItems[i].ParaFirst) {
                if (i != 0)
                    vResult = vResult + HC.sLineBreak + "</p>";

                vResult = vResult + HC.sLineBreak + "<p class=\"ps" + this.FItems[i].ParaNo.ToString() + "\">";
            }

            vResult = vResult + HC.sLineBreak + this.FItems[i].ToHtml(path);
        }

        return vResult + HC.sLineBreak + "</p>";
    }

    ToXml(node) {

    }

    ParseXml(node) {
        this.clear();
    }

    get Style() {
        return this.FStyle;
    }

    get CurStyleNo() {
        return this.FCurStyleNo;
    }

    set CurStyleNo(val) {
        this.SetCurStyleNo(val);
    }

    get CurParaNo() {
        return this.FCurParaNo;
    }

    set CurParaNo(val) {
        this.SetCurParaNo(val);
    }

    get Items() {
        return this.FItems;
    }

    get DrawItems() {
        return this.FDrawItems;
    }

    get SelectInfo() {
        return this.FSelectInfo;
    }

    get DrawOptions() {
        return this.FDrawOptions;
    }

    set DrawOptions(val) {
        this.FDrawOptions = val;
    }

    get CaretDrawItemNo() {
        return this.FCaretDrawItemNo;
    }

    set CaretDrawItemNo(val) {
        this.SetCaretDrawItemNo(val);
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
}