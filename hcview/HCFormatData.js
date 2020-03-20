import { TPoint, TRect } from "../hcl/System.js";
import { HC, TBreakPosition, TCharType } from "./HCCommon.js";
import { THCCustomData } from "./HCCustomData.js";
import { THCCustomDrawItem } from "./HCDrawItem.js";
import { TParaAlignHorz } from "./HCParaStyle.js";
import { THCStyle } from "./HCStyle.js";

export class THCFormatData extends THCCustomData {
    constructor(style) {
        super(style);
        this.FormatTextCut = 8192;
        this.FWidth = 0;
        this.FFormatCount = 0;
        this.FItemFormatHeight = 0;
        this.FFormatChange = false;
        this.FOnItemRequestFormat = null;
        this.FormatInit();
    }

    FormatRange(startDrawItemNo, lastItemNo) {
        let vPrioDrawItemNo = -1, vStartItemNo = -1, vStartOffset = -1;
        let vParaStyle = null;
        let vPos = new TPoint();

        this.FFormatStartDrawItemNo = startDrawItemNo;
        if (startDrawItemNo > 0) {
            vPrioDrawItemNo = startDrawItemNo - 1;  // 上一个最后的DrawItem
            vStartItemNo = this.DrawItems[startDrawItemNo].ItemNo;
            vStartOffset = this.DrawItems[startDrawItemNo].CharOffs;
            vParaStyle = this.Style.ParaStyles[this.Items[vStartItemNo].ParaNo];
            if (this.DrawItems[startDrawItemNo].LineFirst) {
                vPos.x = vParaStyle.LeftIndentPix;
                vPos.y = this.DrawItems[vPrioDrawItemNo].rect.bottom;
            } else {
                vPos.x = this.DrawItems[vPrioDrawItemNo].rect.right;
                vPos.y = this.DrawItems[vPrioDrawItemNo].rect.top;
            }
        } else {
            vPrioDrawItemNo = -1;
            vStartItemNo = 0;
            vStartOffset = 1;
            vParaStyle = this.Style.ParaStyles[this.Items[vStartItemNo].ParaNo];
            vPos.x = vParaStyle.LeftIndentPix;
            vPos.y = 0;
        }

        this.Style.ApplyTempStyle(THCStyle.Null);
        let vFmtInfo = this.FormatItemToDrawItems(vStartItemNo, vStartOffset, vParaStyle.LeftIndentPix,
            this.FWidth - vParaStyle.RightIndentPix, this.FWidth, vPos, vPrioDrawItemNo);

        vPos = vFmtInfo.pos;
        vPrioDrawItemNo = vFmtInfo.drawItemNo; 

        for (let i = vStartItemNo + 1; i <= lastItemNo; i++) {
            if (this.Items[i].ParaFirst) {
                vParaStyle = this.Style.ParaStyles[this.Items[i].ParaNo];
                vPos.x = vParaStyle.LeftIndentPix;
            }

            vFmtInfo = this.FormatItemToDrawItems(i, 1, vParaStyle.LeftIndentPix,
                this.FWidth - vParaStyle.RightIndentPix, this.FWidth, vPos, vPrioDrawItemNo);

            vPos = vFmtInfo.pos;
            vPrioDrawItemNo = vFmtInfo.drawItemNo;    
        }

        this.DrawItems.DeleteFormatMark();
    }

    CalcItemFormatHeigh(item) {
        if (this.Style.TempStyleNo != item.StyleNo) {
            this.Style.ApplyTempStyle(item.StyleNo);
            this.FLastFormatParaNo = item.ParaNo;
            this.FItemFormatHeight = this.CalculateLineHeight(this.Style.TextStyles[item.StyleNo], this.Style.ParaStyles[item.ParaNo]);
        } else if (this.FLastFormatParaNo != item.ParaNo) {
            this.FLastFormatParaNo = item.ParaNo;
            this.FItemFormatHeight = this.CalculateLineHeight(this.Style.TextStyles[item.StyleNo], this.Style.ParaStyles[item.ParaNo]);
        }
    }

    FinishLine(itemNo, lineEndDItemNo, remWidth) {
        let viSplitW, vW,
            vLineSpaceCount,
            vDItemSpaceCount,
            vExtraW,
            viSplitMod,
            vDLen;

        let vLineBegDItemNo = lineEndDItemNo;
        for (let i = lineEndDItemNo; i >= 0; i--) {
            if (this.DrawItems[i].LineFirst) {
                vLineBegDItemNo = i;
                break;
            }
        }
        
        let vMaxBottom = this.DrawItems[lineEndDItemNo].rect.bottom;
        for (let i = lineEndDItemNo - 1; i >= vLineBegDItemNo; i--) {
            if (this.DrawItems[i].rect.bottom > vMaxBottom)
                vMaxBottom = this.DrawItems[i].rect.bottom;
        }

        for (let i = lineEndDItemNo; i >= vLineBegDItemNo; i--)
            this.DrawItems[i].rect.bottom = vMaxBottom;

        let vParaStyle = this.Style.ParaStyles[this.Items[itemNo].ParaNo];
        switch (vParaStyle.AlignHorz) {
            case TParaAlignHorz.Left:
                break;

            case TParaAlignHorz.Right:
                for (let i = lineEndDItemNo; i >= vLineBegDItemNo; i--)
                    this.DrawItems[i].rect.offset(remWidth, 0);
                
                break;

            case TParaAlignHorz.Center:
                viSplitW = Math.trunc(remWidth / 2);
                for (let i = lineEndDItemNo; i >= vLineBegDItemNo; i--)
                    this.DrawItems[i].rect.offset(viSplitW, 0);
                
                break;

            case TParaAlignHorz.Justify:
            case TParaAlignHorz.Scatter: {
                if (vParaStyle.AlignHorz == TParaAlignHorz.Justify) {
                    if (this.IsParaLastDrawItem(lineEndDItemNo))
                        return;
                } else {
                    if (vLineBegDItemNo == lineEndDItemNo) {
                        if (this.Items[this.DrawItems[vLineBegDItemNo].ItemNo].length < 2) {
                            viSplitW = Math.trunc(remWidth / 2);
                            this.DrawItems[vLineBegDItemNo].rect.offset(viSplitW, 0);
                            return;
                        }
                    }
                }

                vLineSpaceCount = 0;
                vExtraW = 0;
                viSplitMod = 0;
                viSplitW = remWidth;
                let vDrawItemSplitCounts = new Array(lineEndDItemNo - vLineBegDItemNo + 1);

                for (let i = vLineBegDItemNo; i <= lineEndDItemNo; i++) {
                    if (this.GetDrawItemStyle(i) < THCStyle.Null) {
                        if (this.Items[this.DrawItems[i].ItemNo].JustifySplit()
                            && (vLineBegDItemNo != lineEndDItemNo))
                        {
                            if (i != lineEndDItemNo)
                                vDItemSpaceCount = 1;
                            else
                                vDItemSpaceCount = 0;
                        } else
                            vDItemSpaceCount = 0; // Tab等不占间距
                    } else {
                        vDItemSpaceCount = this.GetJustifyCount(this.GetDrawItemText(i), null);
                        if ((i == lineEndDItemNo) && (vDItemSpaceCount > 0))
                            vDItemSpaceCount--;
                    }

                    vDrawItemSplitCounts[i - vLineBegDItemNo] = vDItemSpaceCount;
                    vLineSpaceCount = vLineSpaceCount + vDItemSpaceCount;
                }

                if (vLineSpaceCount > 1) {
                    viSplitW = Math.trunc(remWidth / vLineSpaceCount);
                    viSplitMod = remWidth % vLineSpaceCount;
                }

                // 行中第一个DrawItem增加的空间 
                if (vDrawItemSplitCounts[0] > 0) {
                    this.DrawItems[vLineBegDItemNo].rect.width += vDrawItemSplitCounts[0] * viSplitW;

                    if (viSplitMod > 0) {
                        vDLen = this.DrawItems[vLineBegDItemNo].CharLen;
                        if (viSplitMod > vDLen) {
                            this.DrawItems[vLineBegDItemNo].rect.right += vDLen;
                            viSplitMod = viSplitMod - vDLen;
                        } else {
                            this.DrawItems[vLineBegDItemNo].rect.right += viSplitMod;
                            viSplitMod = 0;
                        }
                    }
                }

                for (let i = vLineBegDItemNo + 1; i <= lineEndDItemNo; i++) {
                    vW = this.DrawItems[i].width;  // DrawItem原来Width
                    if (vDrawItemSplitCounts[i - vLineBegDItemNo] > 0) {
                        vExtraW = vDrawItemSplitCounts[i - vLineBegDItemNo] * viSplitW;  // 多分到的width
                        if (viSplitMod > 0) {
                            if (this.GetDrawItemStyle(i) < THCStyle.Null) {
                                if (this.Items[this.DrawItems[i].ItemNo].JustifySplit()) {
                                    vExtraW++;  // 当前DrawItem多分一个像素
                                    viSplitMod--;  // 额外的减少一个像素
                                }
                            } else {
                                vDLen = this.DrawItems[i].CharLen;
                                if (viSplitMod > vDLen) {
                                    vExtraW = vExtraW + vDLen;
                                    viSplitMod = viSplitMod - vDLen;
                                } else {
                                    vExtraW = vExtraW + viSplitMod;
                                    viSplitMod = 0;
                                }
                            }
                        }
                    } else
                        vExtraW = 0;

                    this.DrawItems[i].rect.left = this.DrawItems[i - 1].rect.right;
                    this.DrawItems[i].rect.right = this.DrawItems[i].rect.left + vW + vExtraW;
                }
                
                break;
            }
        }
    }

    NewDrawItem(itemNo, charOffs, charLen, rect, paraFirst, lineFirst, lastDrawItemNo) {
        let vDrawItem = new THCCustomDrawItem();
        vDrawItem.ItemNo = itemNo;
        vDrawItem.CharOffs = charOffs;
        vDrawItem.CharLen = charLen;
        vDrawItem.ParaFirst = paraFirst;
        vDrawItem.LineFirst = lineFirst;
        vDrawItem.rect.resetRect(rect);
        lastDrawItemNo++;
        this.DrawItems.insert(lastDrawItemNo, vDrawItem);
        if (charOffs == 1)
            this.Items[itemNo].FirstDItemNo = lastDrawItemNo;

        return lastDrawItemNo;
    }

    GetHeadTailBreak(text, pos) {
        if (pos < 1)
            return pos;

        let vChar = text[pos + 1 - 1];
        if (HC.PosCharHC(vChar, HC.DontLineFirstChar) > 0) {
            pos--;
            pos = this.GetHeadTailBreak(text, pos);
        } else {
            vChar = text[pos - 1];
            if (HC.PosCharHC(vChar, HC.DontLineLastChar) > 0) {
                pos--;
                pos = this.GetHeadTailBreak(text, pos);
            }
        }

        return pos;
    }

    MatchBreak(prevType, posType, text, index) {
        switch (posType) {
            case TCharType.HZ:
                if ((prevType == TCharType.ZM)
                    || (prevType == TCharType.SZ)
                    || (prevType == TCharType.HZ)
                    || (prevType == TCharType.FH))  // 当前位置是汉字，前一个是字母、数字、汉字
                {
                    return TBreakPosition.Prev;
                }
                
                break;

            case TCharType.ZM:
                if ((prevType != TCharType.ZM) && (prevType != TCharType.SZ)) {
                    return TBreakPosition.Prev;
                }
                
                break;

            case TCharType.SZ:
                switch (prevType) {
                    case TCharType.ZM:
                    case TCharType.SZ:
                        break;

                    case TCharType.FH: {
                        let vChar = text[index - 1 - 1];
                        if (vChar == "￠") {
                            //
                        } else {
                            if ((vChar != ".") && (vChar != ":") && (vChar != "-") && (vChar != "^") && (vChar != "*") && (vChar != "/"))
                                return TBreakPosition.Prev;
                        }
                        
                        break;
                    }
                    
                    default:
                        return TBreakPosition.Prev;
                }
                
                break;

            case TCharType.FH:
                switch (prevType) {
                    case TCharType.FH:
                        break;

                    case TCharType.SZ: {
                        let vChar = text[index - 1];
                        if ((vChar != ".") && (vChar != ":") && (vChar != "-") && (vChar != "^") && (vChar != "*") && (vChar != "/"))
                            return TBreakPosition.Prev;
                        
                        break;
                    }

                    case TCharType.ZM:
                        if (text[index - 1] != ":")
                            return TBreakPosition.Prev;
                        
                        break;

                    default:
                        return TBreakPosition.Prev;
                }
                
                break;
        }

        return TBreakPosition.None;
    }

    FindLineBreak(text, breakRough, startPos, pos) {
        pos = this.GetHeadTailBreak(text, pos);
        if (pos < 1)
            return pos;

        if (breakRough)
            return pos;

        let vPosCharType = HC.GetUnicodeCharType(text[pos - 1]);  // 当前类型
        let vNextCharType = HC.GetUnicodeCharType(text[pos + 1 - 1]);  // 下一个字符类型

        if (this.MatchBreak(vPosCharType, vNextCharType, text, pos + 1) != TBreakPosition.Prev) {
            if (vPosCharType != TCharType.Break) {
                let vFindBreak = false;
                let vPrevCharType;
                for (let i = pos - 1; i >= startPos; i--) {
                    vPrevCharType = HC.GetUnicodeCharType(text[i - 1]);
                    if (this.MatchBreak(vPrevCharType, vPosCharType, text, i + 1) == TBreakPosition.Prev) {
                        pos = i;
                        vFindBreak = true;
                        break;
                    }

                    vPosCharType = vPrevCharType;
                }

                if (!vFindBreak)
                    pos = 0;
            }
        }

        return pos;
    }

    DoFormatRectItemToDrawItem(vRectItem, itemNo, fmtLeft, contentWidth, fmtRight, offset,
        vParaFirst, aParaStyle, pos, vRect, vLineFirst, lastDrawItemNo, vRemainderWidth)
    {
        vRectItem.FormatToDrawItem(this, itemNo);
        let vWidth = fmtRight - pos.x;
        if ((vRectItem.Width > vWidth) && (!vLineFirst)) {
            this.FinishLine(itemNo, lastDrawItemNo, vWidth);
            pos.x = fmtLeft;
            pos.y = this.DrawItems[lastDrawItemNo].rect.bottom;
            vLineFirst = true;
        }

        vRect.left = pos.x;
        vRect.top = pos.y;
        vRect.right = vRect.left + vRectItem.Width;
        vRect.bottom = vRect.top + vRectItem.Height + this.Style.LineSpaceMin;
        lastDrawItemNo = this.NewDrawItem(itemNo, offset, 1, vRect, vParaFirst, vLineFirst, lastDrawItemNo);
        vRemainderWidth = fmtRight - vRect.right;
        
        return {
            pos:pos,
            rect: vRect,
            lineFirst:vLineFirst,
            drawItemNo: lastDrawItemNo,
            remainderWidth: vRemainderWidth
        }
    }

    _FormatBreakTextDrawItem(itemNo, fmtLeft, fmtRight, drawItemNo,
        pos, rect, vRemainderWidth, vParaFirst)
    {
        let vDrawItem = this.DrawItems[drawItemNo];
        let vItemBK = this.Items[vDrawItem.ItemNo];
        let vLen = vItemBK.Text.length;

        this.CalcItemFormatHeigh(vItemBK);

        let vWidth = this.Style.TempCanvas.TextWidth(vItemBK.Text[vLen - 1]);
        // 分裂前
        vDrawItem.CharLen = vDrawItem.CharLen - 1;
        vDrawItem.rect.right = vDrawItem.rect.right - vWidth;
        vRemainderWidth = fmtRight - vDrawItem.rect.right;
        this.FinishLine(itemNo, drawItemNo, vRemainderWidth);
        // 分裂后
        pos.x = fmtLeft;
        pos.y = vDrawItem.rect.bottom;
        rect.left = pos.x;
        rect.top = pos.y;
        rect.right = rect.left + vWidth;
        rect.bottom = rect.top + this.FItemFormatHeight;
        drawItemNo = this.NewDrawItem(vDrawItem.ItemNo, vLen - 1, 1, rect, false, true, drawItemNo);
        vParaFirst = false;
        pos.x = rect.right;

        vRemainderWidth = fmtRight - rect.right;

        return {
            drawItemNo: drawItemNo,
            point: pos,
            rect: rect,
            remainderWidth: vRemainderWidth,
            paraFirst: vParaFirst
        }
    }

    DoFormatTextItemToDrawItems(vItem, offset, vText, charOffset, placeWidth, basePos, itemNo, vItemLen,
        fmtLeft, contentWidth, fmtRight, vCharWidths, paraStyle, vParaFirst, vLineFirst, pos, vRect,
        vRemainderWidth, lastDrawItemNo)
    {
        let viPlaceOffset, viBreakOffset, vFirstCharWidth;

        vLineFirst = vParaFirst || ((pos.x == fmtLeft) && (this.DrawItems[lastDrawItemNo].width != 0));
        viBreakOffset = 0;
        vFirstCharWidth = vCharWidths[charOffset - 1] - basePos;  // 第一个字符的宽度

        if (placeWidth < 0)
            viBreakOffset = 1;
        else {
            for (let i = charOffset - 1; i <= vItemLen - 1; i++) {
                if (vCharWidths[i] - basePos > placeWidth) {
                    viBreakOffset = i + 1;
                    break;
                }
            }
        }

        if (viBreakOffset < 1) {
            vRect.left = pos.x;
            vRect.top = pos.y;
            vRect.right = vRect.left + vCharWidths[vItemLen - 1] - basePos;  // 使用自定义测量的结果
            vRect.bottom = vRect.top + this.FItemFormatHeight;
            lastDrawItemNo = this.NewDrawItem(itemNo, offset + charOffset - 1, vItemLen - charOffset + 1, vRect, vParaFirst, vLineFirst, lastDrawItemNo);
            vParaFirst = false;

            vRemainderWidth = fmtRight - vRect.right;  // 放入最多后的剩余量
        } else if (viBreakOffset == 1) {
            if (vFirstCharWidth > fmtRight - fmtLeft) {
                vRect.left = pos.x;
                vRect.top = pos.y;
                vRect.right = vRect.left + vCharWidths[vItemLen - 1] - basePos;  // 使用自定义测量的结果
                vRect.bottom = vRect.top + this.FItemFormatHeight;
                lastDrawItemNo = this.NewDrawItem(itemNo, offset + charOffset - 1, 1, vRect, vParaFirst, vLineFirst, lastDrawItemNo);
                vParaFirst = false;

                vRemainderWidth = fmtRight - vRect.right;  // 放入最多后的剩余量
                this.FinishLine(itemNo, lastDrawItemNo, vRemainderWidth);

                // 偏移到下一行顶端，准备另起一行
                pos.x = fmtLeft;
                pos.y = this.DrawItems[lastDrawItemNo].rect.bottom;  // 不使用 vRect.bottom 因为如果行中间有高的，会修正vRect.bottom

                if (charOffset < vItemLen) {
                    let vFmtInfo = this.DoFormatTextItemToDrawItems(vItem, offset, vText, charOffset + 1, fmtRight - pos.x, vCharWidths[charOffset - 1],
                        itemNo, vItemLen, fmtLeft, contentWidth, fmtRight, vCharWidths, paraStyle,
                        vParaFirst, vLineFirst, pos, vRect, vRemainderWidth, lastDrawItemNo);

                    vParaFirst = vFmtInfo.paraFirst;
                    vLineFirst = vFmtInfo.lineFirst;
                    pos = vFmtInfo.pos;
                    vRect = vFmtInfo.rect;
                    vRemainderWidth = vFmtInfo.remainderWidth;
                    lastDrawItemNo = vFmtInfo.drawItemNo; 
                }
            } else if ((HC.PosCharHC(vText[charOffset - 1], HC.DontLineFirstChar) > 0)
                    && (this.Items[itemNo - 1].StyleNo > THCStyle.Null)
                    && (this.DrawItems[lastDrawItemNo].CharLen > 1))
                {
                    let vBreakInfo = this._FormatBreakTextDrawItem(itemNo, fmtLeft, fmtRight, lastDrawItemNo, pos, vRect, vRemainderWidth, vParaFirst);
                    lastDrawItemNo = vBreakInfo.drawItemNo;
                    pos = vBreakInfo.point;
                    vRect = vBreakInfo.rect;
                    vRemainderWidth = vBreakInfo.remainderWidth;
                    vParaFirst = vBreakInfo.paraFirst;

                    this.CalcItemFormatHeigh(vItem);

                    let vFmtInfo = this.DoFormatTextItemToDrawItems(vItem, offset, vText, charOffset, fmtRight - pos.x, basePos, itemNo, vItemLen, fmtLeft, contentWidth,
                        fmtRight, vCharWidths, paraStyle, vParaFirst, vLineFirst, pos, vRect, vRemainderWidth, lastDrawItemNo);

                    vParaFirst = vFmtInfo.paraFirst;
                    vLineFirst = vFmtInfo.lineFirst;
                    pos = vFmtInfo.pos;
                    vRect = vFmtInfo.rect;
                    vRemainderWidth = vFmtInfo.remainderWidth;
                    lastDrawItemNo = vFmtInfo.drawItemNo; 
                } else {
                    vRemainderWidth = placeWidth;
                    this.FinishLine(itemNo, lastDrawItemNo, vRemainderWidth);
                    // 偏移到下一行开始计算
                    pos.x = fmtLeft;
                    pos.y = this.DrawItems[lastDrawItemNo].rect.bottom;
                    let vFmtInfo = this.DoFormatTextItemToDrawItems(vItem, offset, vText, charOffset, fmtRight - pos.x, basePos,
                        itemNo, vItemLen, fmtLeft, contentWidth, fmtRight, vCharWidths, paraStyle,
                        vParaFirst, vLineFirst, pos, vRect, vRemainderWidth, lastDrawItemNo);

                    vParaFirst = vFmtInfo.paraFirst;
                    vLineFirst = vFmtInfo.lineFirst;
                    pos = vFmtInfo.pos;
                    vRect = vFmtInfo.rect;
                    vRemainderWidth = vFmtInfo.remainderWidth;
                    lastDrawItemNo = vFmtInfo.drawItemNo; 
                }
        } else {
            if (vFirstCharWidth > fmtRight - fmtLeft)  // Data的宽度不足一个字符
                viPlaceOffset = viBreakOffset;
            else
                viPlaceOffset = viBreakOffset - 1;  // 第viBreakOffset个字符放不下，前一个能放下

            viPlaceOffset = this.FindLineBreak(vText, paraStyle.BreakRough, charOffset, viPlaceOffset);  // 判断从viPlaceOffset后打断是否合适

            if ((viPlaceOffset == 0) && (pos.x > fmtLeft)) {
                vRemainderWidth = placeWidth;
                this.FinishLine(itemNo, lastDrawItemNo, vRemainderWidth);
                pos.x = fmtLeft;  // 偏移到下一行开始计算
                pos.y = this.DrawItems[lastDrawItemNo].rect.bottom;
                let vFmtInfo = this.DoFormatTextItemToDrawItems(vItem, offset, vText, charOffset, fmtRight - pos.x, basePos, itemNo, vItemLen,
                    fmtLeft, contentWidth, fmtRight, vCharWidths, paraStyle,
                    vParaFirst, vLineFirst, pos, vRect, vRemainderWidth, lastDrawItemNo);

                vParaFirst = vFmtInfo.paraFirst;
                vLineFirst = vFmtInfo.lineFirst;
                pos = vFmtInfo.pos;
                vRect = vFmtInfo.rect;
                vRemainderWidth = vFmtInfo.remainderWidth;
                lastDrawItemNo = vFmtInfo.drawItemNo; 
            } else {
                if (viPlaceOffset < charOffset) {
                    if (vFirstCharWidth > fmtRight - fmtLeft)  // Data的宽度不足一个字符
                        viPlaceOffset = viBreakOffset;
                    else
                        viPlaceOffset = viBreakOffset - 1;
                }

                vRect.left = pos.x;
                vRect.top = pos.y;
                vRect.right = vRect.left + vCharWidths[viPlaceOffset - 1] - basePos;  // 使用自定义测量的结果
                vRect.bottom = vRect.top + this.FItemFormatHeight;

                lastDrawItemNo = this.NewDrawItem(itemNo, offset + charOffset - 1, viPlaceOffset - charOffset + 1, vRect, vParaFirst, vLineFirst, lastDrawItemNo);
                vParaFirst = false;

                vRemainderWidth = fmtRight - vRect.right;  // 放入最多后的剩余量

                this.FinishLine(itemNo, lastDrawItemNo, vRemainderWidth);

                // 偏移到下一行顶端，准备另起一行
                pos.x = fmtLeft;
                pos.y = this.DrawItems[lastDrawItemNo].rect.bottom;  // 不使用 vRect.bottom 因为如果行中间有高的，会修正vRect.bottom

                if (viPlaceOffset < vItemLen) {
                    let vFmtInfo = this.DoFormatTextItemToDrawItems(vItem, offset, vText, viPlaceOffset + 1, fmtRight - pos.x, vCharWidths[viPlaceOffset - 1],
                        itemNo, vItemLen, fmtLeft, contentWidth, fmtRight, vCharWidths, paraStyle,
                        vParaFirst, vLineFirst, pos, vRect, vRemainderWidth, lastDrawItemNo);

                    vParaFirst = vFmtInfo.paraFirst;
                    vLineFirst = vFmtInfo.lineFirst;
                    pos = vFmtInfo.pos;
                    vRect = vFmtInfo.rect;
                    vRemainderWidth = vFmtInfo.remainderWidth;
                    lastDrawItemNo = vFmtInfo.drawItemNo; 
                }
            }
        }

        return {
            paraFirst: vParaFirst,
            lineFirst: vLineFirst,
            pos: pos,
            rect: vRect,
            remainderWidth: vRemainderWidth,
            drawItemNo: lastDrawItemNo
        }
    }

    FormatItemToDrawItems(itemNo, offset, fmtLeft, fmtRight, contentWidth, pos, lastDrawItemNo) {
        if (!this.Items[itemNo].visible)
            return {
                pos: pos,
                drawItemNo: lastDrawItemNo
            }

        let vParaFirst = false, vLineFirst = false;
        let vRectItem = null;
        let vText = "";
        let vRect = new TRect();

        let vRemainderWidth = 0;
        let vItem = this.Items[itemNo];
        let vParaStyle = this.Style.ParaStyles[vItem.ParaNo];

        if (vItem.ParaFirst && (offset == 1)) {
            vParaFirst = true;
            vLineFirst = true;
            pos.x += vParaStyle.FirstIndentPix;
        } else {
            vParaFirst = false;
            vLineFirst = (pos.x == fmtLeft) && (this.DrawItems[lastDrawItemNo].width != 0);
        }

        if (!vItem.visible) {
            vRect.left = pos.x;
            vRect.top = pos.y;
            vRect.right = vRect.left;
            vRect.bottom = vRect.top + 5;
            lastDrawItemNo = this.NewDrawItem(itemNo, offset, vItem.length, vRect, vParaFirst, vLineFirst, lastDrawItemNo);
        } else if (vItem.StyleNo < THCStyle.Null) {
            vRectItem = vItem;
            let vFmtInfo = this.DoFormatRectItemToDrawItem(vRectItem, itemNo, fmtLeft, contentWidth, fmtRight, offset, 
                vParaFirst, vParaStyle, pos, vRect, vLineFirst, lastDrawItemNo, vRemainderWidth);

            pos = vFmtInfo.pos;
            vRect = vFmtInfo.rect;
            vLineFirst = vFmtInfo.lineFirst;
            lastDrawItemNo = vFmtInfo.drawItemNo;
            vRemainderWidth = vFmtInfo.remainderWidth;            

            this.Style.ApplyTempStyle(THCStyle.Null);
        } else {
            this.CalcItemFormatHeigh(vItem);
            vRemainderWidth = fmtRight - pos.x;

            if (offset != 1)
                vText = vItem.Text.substr(offset - 1, vItem.length - offset + 1);
            else
                vText = vItem.Text;

            if (vText == "") {
                vRect.left = pos.x;
                vRect.top = pos.y;
                vRect.right = vRect.left;
                vRect.bottom = vRect.top + this.FItemFormatHeight;  //DefaultCaretHeight;
                vParaFirst = true;
                vLineFirst = true;
                lastDrawItemNo = this.NewDrawItem(itemNo, offset, 0, vRect, vParaFirst, vLineFirst, lastDrawItemNo);
                vParaFirst = false;
            } else {
                let vItemLen = vText.length;
                //if (vItemLen > 38347922)
                //    throw HC.HCS_EXCEPTION_STRINGLENGTHLIMIT;
                let vCharWidths = new Array(vItemLen);
                let vCharWArr = null;
                let viLen = vItemLen;
                //if (viLen > this.FormatTextCut)
                //    vCharWArr = new Array(this.FormatTextCut);
                let vIndex = 0, viBase = 0;
                while (viLen > this.FormatTextCut) {
                    vCharWArr = this.Style.TempCanvas.getTextExtentExPoint(vText.substr(vIndex, this.FormatTextCut), this.FormatTextCut);
                    for (let i = 0; i <= this.FormatTextCut - 1; i++)
                        vCharWidths[vIndex + i] = vCharWArr[i] + viBase;

                    viLen -= this.FormatTextCut;
                    vIndex += this.FormatTextCut;
                    viBase = vCharWidths[vIndex - 1];
                }

                vCharWArr = this.Style.TempCanvas.getTextExtentExPoint(vText.substr(vIndex, viLen), viLen);        
                for (let i = 0; i <= viLen - 1; i++)
                    vCharWidths[vIndex + i] = vCharWArr[i] + viBase;
        
                let vFmtInfo = this.DoFormatTextItemToDrawItems(vItem, offset, vText, 1, fmtRight - pos.x, 0, itemNo, vItemLen, fmtLeft, contentWidth,
                    fmtRight, vCharWidths, vParaStyle, vParaFirst, vLineFirst, pos, vRect, vRemainderWidth, lastDrawItemNo);

                vParaFirst = vFmtInfo.paraFirst;
                vLineFirst = vFmtInfo.lineFirst;
                pos = vFmtInfo.pos;
                vRect = vFmtInfo.rect;
                vRemainderWidth = vFmtInfo.remainderWidth;
                lastDrawItemNo = vFmtInfo.drawItemNo; 
            }
        }

        if (itemNo == this.Items.count - 1)
            this.FinishLine(itemNo, lastDrawItemNo, vRemainderWidth);
        else {
            if (this.Items[itemNo + 1].ParaFirst) {
                this.FinishLine(itemNo, lastDrawItemNo, vRemainderWidth);

                pos.x = 0;
                pos.y = this.DrawItems[lastDrawItemNo].rect.bottom;
            } else
                pos.x = vRect.right;
        }

        return {
            pos: pos,
            drawItemNo: lastDrawItemNo
        }
    }

    FormatInit() {
        this.FFormatHeightChange = false;
        this.FFormatDrawItemCountChange = false;
        this.FFormatStartTop = 0;
        this.FFormatEndBottom = 0;
        this.FFormatStartDrawItemNo = -1;
        this.FLastFormatParaNo = THCStyle.Null;
    }

    ReSetSelectAndCaret(itemNo) {
        this.ReSetSelectAndCaretByOffset(itemNo, this.GetItemOffsetAfter(itemNo));
    }

    ReSetSelectAndCaretByOffset(itemNo, offset, nextWhenMid = false) {
        this.SelectInfo.StartItemNo = itemNo;
        this.SelectInfo.StartItemOffset = offset;

        if (this.FFormatCount != 0)
            return;

        let vOffset = 0;
        if (this.Items[itemNo].StyleNo > THCStyle.Null) {
            if (this.SelectInfo.StartItemOffset > this.Items[itemNo].length)
                vOffset = this.Items[itemNo].length;
            else
                vOffset = offset;
        }
        else
            vOffset = offset;
    
        let vDrawItemNo = this.GetDrawItemNoByOffset(itemNo, vOffset);
        if (nextWhenMid
            && (vDrawItemNo < this.DrawItems.count - 1)
            && (this.DrawItems[vDrawItemNo + 1].ItemNo == itemNo)
            && (this.DrawItems[vDrawItemNo + 1].CharOffs == vOffset + 1))
        {
            vDrawItemNo++;
        }

        this.CaretDrawItemNo = vDrawItemNo;
    }

    GetFormatRange(firstDrawItemNo, lastItemNo) {
        let vRange = this.GetFormatRangeByOffset(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset, firstDrawItemNo, lastItemNo);
        return {
            firstDrawItemNo: vRange.firstDrawItemNo,
            lastItemNo: vRange.lastItemNo
        }
    }

    GetFormatRangeByOffset(itemNo, itemOffset, firstDrawItemNo, lastItemNo) {
        if (this.FFormatCount != 0)
            return {
                firstDrawItemNo: firstDrawItemNo,
                lastItemNo: lastItemNo
            }

        return {
            firstDrawItemNo: this.GetFormatFirstDrawItemByOffset(itemNo, itemOffset),
            lastItemNo: this.GetParaLastItemNo(itemNo)
        }
    }

    GetFormatFirstDrawItemByOffset(itemNo, itemOffset) {
        let vDrawItemNo = this.GetDrawItemNoByOffset(itemNo, itemOffset);
        return this.GetFormatFirstDrawItem(vDrawItemNo);
    }

    GetFormatFirstDrawItem(drawItemNo) {
        let vResult = drawItemNo;
        if (!this.DrawItems[vResult].ParaFirst) {
            if (this.DrawItems[vResult].LineFirst)
                vResult--;

            while (vResult > 0) {
                if (this.DrawItems[vResult].LineFirst)
                    break;
                else
                    vResult--;
            }
        }

        return vResult;
    }

    FormatPrepare(firstDrawItemNo, lastItemNo = -1) {
        if (this.FFormatCount != 0)
            return;
    
        this.FormatInit();

        if ((firstDrawItemNo > 0) && (!this.DrawItems[firstDrawItemNo].LineFirst))
            throw "行中格式化必需从行首开始，否则会影响分散的计算！";
        //vFirstDrawItemNo := Items[AStartItemNo].FirstDItemNo;

        let vLastItemNo = -1, vFmtTopOffset = -1;
        if (lastItemNo < 0)
            vLastItemNo = this.DrawItems[firstDrawItemNo].ItemNo;
        else
            vLastItemNo = lastItemNo;

        let vLastDrawItemNo = this.GetItemLastDrawItemNo(vLastItemNo);
        this.DrawItems.MarkFormatDelete(firstDrawItemNo, vLastDrawItemNo);
        if (firstDrawItemNo > 0) {
            this.FFormatStartTop = this.DrawItems[firstDrawItemNo - 1].rect.bottom;
            vFmtTopOffset = this.DrawItems[firstDrawItemNo].rect.top - this.FFormatStartTop;
        } else {
            this.FFormatStartTop = 0;
            vFmtTopOffset = 0;
        }

        for (let i = firstDrawItemNo + 1; i <= vLastDrawItemNo; i++) {
            if (this.DrawItems[i].LineFirst)
                vFmtTopOffset = vFmtTopOffset + this.DrawItems[i].rect.top - this.DrawItems[i - 1].rect.bottom;
        }

        if (vFmtTopOffset != 0)
            this.FFormatEndBottom = -1;
        else
            this.FFormatEndBottom = this.DrawItems[vLastDrawItemNo].rect.bottom - vFmtTopOffset;
    }

    ReFormatData(firstDrawItemNo, lastItemNo = -1, extraItemCount = 0, forceClearExtra = false) {
        if (this.FFormatCount != 0)
            return;
    
        let vLastItemNo = -1;
        if (lastItemNo < 0)
            vLastItemNo = this.DrawItems[firstDrawItemNo].ItemNo;
        else
            vLastItemNo = lastItemNo;

        let vDrawItemCount = this.DrawItems.count;  // 格式化前的DrawItem数量
        this.FormatRange(firstDrawItemNo, vLastItemNo);  // 格式化指定范围内的Item
        this.FFormatDrawItemCountChange = this.DrawItems.count != vDrawItemCount;  // 格式化前后DrawItem数量有变化
    
        // 计算格式化后段的底部位置变化
        let vLastDrawItemNo = this.GetItemLastDrawItemNo(vLastItemNo);
        if ((this.Items[vLastItemNo].StyleNo < THCStyle.Null) && this.Items[vLastItemNo].SizeChanged)
            this.FFormatHeightChange = true;
        else
            this.FFormatHeightChange = forceClearExtra
                || ((this.DrawItems[firstDrawItemNo].rect.top != this.FFormatStartTop)  // 段格式化后，高度的增量
                || (this.DrawItems[vLastDrawItemNo].rect.bottom != this.FFormatEndBottom));

        if (this.FFormatHeightChange || (extraItemCount != 0) || this.FFormatDrawItemCountChange) {
            this.FFormatChange = true;
            vLastItemNo = -1;
            let vFmtTopOffset = 0;
            let vClearFmtHeight = 0;

            for (let i = vLastDrawItemNo + 1; i <= this.DrawItems.count - 1; i++) {
                if ((extraItemCount != 0) || this.FFormatDrawItemCountChange) {
                    this.DrawItems[i].ItemNo = this.DrawItems[i].ItemNo + extraItemCount;
                    if (vLastItemNo != this.DrawItems[i].ItemNo) {
                        vLastItemNo = this.DrawItems[i].ItemNo;
                        this.Items[vLastItemNo].FirstDItemNo = i;
                    }
                }

                if (this.FFormatHeightChange) {
                    if (this.DrawItems[i].LineFirst)
                        vFmtTopOffset = this.DrawItems[i - 1].rect.bottom - this.DrawItems[i].rect.top;

                    this.DrawItems[i].rect.offset(0, vFmtTopOffset);

                    if (this.Items[this.DrawItems[i].ItemNo].StyleNo < THCStyle.Null) {
                        vClearFmtHeight = this.Items[this.DrawItems[i].ItemNo].ClearFormatExtraHeight();
                        this.DrawItems[i].rect.bottom = this.DrawItems[i].rect.bottom - vClearFmtHeight;
                    }
                }
            }
        }
    }

    ReFormat() {
        if (this.FFormatCount == 0) {
            this.DrawItems.clear();
            this.InitializeField();

            this.DrawItems.MarkFormatDelete(0, this.DrawItems.count - 1);
            
            this.FormatInit();
            this.FormatRange(0, this.Items.count - 1);
            
            this.FFormatHeightChange = true;
        }

        if ((this.SelectInfo.StartItemNo >= 0) && (this.SelectInfo.StartItemNo < this.Items.count))
            this.ReSetSelectAndCaret(this.SelectInfo.StartItemNo, this.SelectInfo.StartItemOffset);  // 防止清空后格式化完成后没有选中起始访问出错
        else
            this.ReSetSelectAndCaret(0, 0);
    }

    ReFormatActiveParagraph() {
        if (this.SelectInfo.StartItemNo >= 0) {
            let vFirstItemNo = -1, vLastItemNo = -1;
            let vItemRang = this.GetParaItemRang(this.SelectInfo.StartItemNo, vFirstItemNo, vLastItemNo);
            vFirstItemNo = vItemRang.a;
            vLastItemNo = vItemRang.b;
            this.FormatPrepare(this.Items[vFirstItemNo].FirstDItemNo, vLastItemNo);
            this.ReFormatData(this.Items[vFirstItemNo].FirstDItemNo, vLastItemNo);

            this.Style.updateInfoRePaint();
            this.Style.updateInfoReCaret();

            this.ReSetSelectAndCaret(this.SelectInfo.StartItemNo);
        }
    }

    ReFormatActiveItem() {
        if (this.SelectExists())
            return;

        if (this.SelectInfo.StartItemNo >= 0) {
            let vFirstDrawItemNo = -1, vLastItemNo = -1;
            let vRange = this.GetFormatRange(vFirstDrawItemNo, vLastItemNo);
            vFirstDrawItemNo = vRange.firstDrawItemNo;
            vLastItemNo = vRange.lastItemNo;
            this.FormatPrepare(vFirstDrawItemNo, vLastItemNo);
            this.ReFormatData(vFirstDrawItemNo, vLastItemNo);

            this.Style.updateInfoRePaint();
            this.Style.updateInfoReCaret();

            if (this.SelectInfo.StartItemOffset > this.Items[this.SelectInfo.StartItemNo].length)
                this.ReSetSelectAndCaret(this.SelectInfo.StartItemNo);
        }
    }

    ItemRequestFormat(item) {
        if (this.FOnItemRequestFormat != null)
            this.FOnItemRequestFormat(this, item);
    }

    BeginFormat() {
        this.FFormatCount++;
    }

    EndFormat(aReformat = true) {
        if (this.FFormatCount > 0)
            this.FFormatCount--;

        if ((this.FFormatCount == 0) && aReformat)
            this.ReFormat();
    }

    get width() {
        return this.FWidth;
    }

    set width(val) {
        this.FWidth = val;
    }

    get FormatStartDrawItemNo() {
        return this.FFormatStartDrawItemNo;
    }

    get FormatHeightChange() {
        return this.FFormatHeightChange;
    }

    get FormatDrawItemCountChange() {
        return this.FFormatDrawItemCountChange;
    }

    get FormatChange() {
        return this.FFormatChange;
    }

    set FormatChange(val) {
        this.FFormatChange = val;
    }

    get FormatCount() {
        return this.FFormatCount;
    }

    get OnItemRequestFormat() {
        return this.FOnItemRequestFormat;
    }

    set OnItemRequestFormat(val) {
        this.FOnItemRequestFormat = val;
    }
}