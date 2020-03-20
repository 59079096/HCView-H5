import { TKey, TKeyEventArgs, TMouseButton, TMouseEventArgs } from "../hcl/Controls.js";
import { TPoint, TRect } from "../hcl/System.js";
import { HC } from "./HCCommon.js";
import { THCFloatItems } from "./HCCustomFloatItem.js";
import { THCShapeStyle } from "./HCShape.js";
import { THCStyle } from "./HCStyle.js";
import { THCViewData } from "./HCViewData.js";

export class THCSectionData extends THCViewData {
    constructor(style) {
        super(style);
        this.FFloatItems = new THCFloatItems();
        this.FFloatItems.OnInsertItem = (item) => {
            this.DoInsertFloatItem(item);
        }

        this.FFloatItemIndex = -1;
        this.FMouseDownIndex = -1;
        this.FMouseMoveIndex = -1;

        this.FOnReadOnlySwitch = null;
        this.FOnGetScreenCoord = null;
        this.FOnCreateFloatItemByStyle = null;
        this.FOnInsertFloatItem = null;
    }

    GetFloatItemAt(x, y) {
        let vResult = -1;
        let vFloatItem = null;

        for (let i = 0; i <= this.FFloatItems.count - 1; i++) {
            vFloatItem = this.FFloatItems[i];

            if (vFloatItem.PointInClient(x - vFloatItem.left, y - vFloatItem.top)) {
                vResult = i;
                break;
            }
        }

        return vResult;
    }

    DoInsertFloatItem(item) {
        if (this.FOnInsertFloatItem != null)
            this.FOnInsertFloatItem(this, item);
    }

    SetReadOnly(val) {
        if (this.ReadOnly != val) {
            super.SetReadOnly(val);

            if (this.FOnReadOnlySwitch != null)
                this.FOnReadOnlySwitch(this, null);
        }
    }

    DoLoadFromStream(stream, style, fileVersion) {
        super.DoLoadFromStream(stream, style, fileVersion);

        if (fileVersion > 12) {
            let vFloatCount = stream.readInt32();
            while (vFloatCount > 0) {
                let vFloatItem = null;
                let vStyleNo = THCStyle.Null;
                vStyleNo = stream.readInt32();
                if ((fileVersion < 28) && (vStyleNo == THCShapeStyle.Line))
                    vFloatItem = new THCFloatLineItem(this);
                else
                    vFloatItem = this.CreateItemByStyle(vStyleNo);

                vFloatItem.LoadFromStream(stream, style, fileVersion);
                this.FFloatItems.add(vFloatItem);

                vFloatCount--;
            }
        }
    }

    UndoAction_FloatItemMirror(itemNo) { }

    MouseDownFloatItem(e) {
        let vResult = false;

        this.FMouseDownIndex = this.GetFloatItemAt(e.x, e.y);

        let vOldIndex = this.FFloatItemIndex;
        if (this.FFloatItemIndex != this.FMouseDownIndex) {
            if (this.FFloatItemIndex >= 0)
                this.FFloatItems[this.FFloatItemIndex].Active = false;
        
            this.FFloatItemIndex = this.FMouseDownIndex;
            this.Style.updateInfoRePaint();
            this.Style.updateInfoReCaret();
        }

        if (this.FFloatItemIndex >= 0) {
            if (this.ReadOnly)
                return true;

            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x = e.x - this.FFloatItems[this.FFloatItemIndex].left;
            vMouseArgs.y = e.y - this.FFloatItems[this.FFloatItemIndex].top;
            vResult = this.FFloatItems[this.FFloatItemIndex].MouseDown(vMouseArgs);
        }

        if ((this.FMouseDownIndex < 0) && (vOldIndex < 0))
            vResult = false;

        return vResult;
    }

    MouseMoveFloatItem(e) {
        let vResult = false;

        if ((e.button == TMouseButton.Left) && (this.FMouseDownIndex >= 0)) {
            if (this.ReadOnly)
                return true;

            let vFloatItem = this.FFloatItems[this.FMouseDownIndex];
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x = e.x - vFloatItem.left;
            vMouseArgs.y = e.y - vFloatItem.top;
            vResult = vFloatItem.MouseMove(vMouseArgs);

            if (vResult)
                this.Style.updateInfoRePaint();
        } else {
            let vItemIndex = this.GetFloatItemAt(e.x, e.y);
            if (this.FMouseMoveIndex != vItemIndex) {
                if (this.FMouseMoveIndex >= 0)
                    this.FFloatItems[this.FMouseMoveIndex].MouseLeave();
        
                this.FMouseMoveIndex = vItemIndex;
                if (this.FMouseMoveIndex >= 0)
                    this.FFloatItems[this.FMouseMoveIndex].MouseEnter();
            }
            
            if (vItemIndex >= 0) {
                let vFloatItem = this.FFloatItems[vItemIndex];
                let vMouseArgs = new TMouseEventArgs();
                vMouseArgs.assign(e);
                vMouseArgs.x = e.x - vFloatItem.left;
                vMouseArgs.y = e.y - vFloatItem.top;
                vResult = vFloatItem.MouseMove(vMouseArgs);
            }
        }

        return vResult;
    }

    MouseUpFloatItem(e) {
        let vResult = false;

        if (this.FMouseDownIndex >= 0) {
            if (this.ReadOnly)
                return true;

            this.Undo_New();
            this.UndoAction_FloatItemMirror(this.FMouseDownIndex);

            let vFloatItem = this.FFloatItems[this.FMouseDownIndex];
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x = e.x - vFloatItem.left;
            vMouseArgs.y = e.y - vFloatItem.top;
            vResult = vFloatItem.MouseUp(vMouseArgs);
            if (vResult)
                this.Style.updateInfoRePaint();
        }

        return vResult;
    }

    KeyDownFloatItem(e) {
        if (this.ReadOnly)
            return true;

        let vResult = true;

        if ((this.FFloatItemIndex >= 0) && !this.FFloatItems[this.FFloatItemIndex].lock) {
            let Key = e.keyCode;
            switch (Key) {
                case TKey.Back:
                case TKey.Delete:
                    this.FFloatItems.delete(this.FFloatItemIndex);
                    this.FFloatItemIndex = -1;
                    this.FMouseMoveIndex = -1;
                    break;

                case TKey.Left:
                    this.FFloatItems[this.FFloatItemIndex].left -= 1;
                    break;

                case TKey.Right:
                    this.FFloatItems[this.FFloatItemIndex].left += 1;
                    break;

                case TKey.Up:
                    this.FFloatItems[this.FFloatItemIndex].left -= 1;
                    break;

                case TKey.Down:
                    this.FFloatItems[this.FFloatItemIndex].left += 1;
                    break;

                default:
                    vResult = false;
                    break;
            }
        } else
            vResult = false;

        if (vResult)
            this.Style.updateInfoRePaint();

        return vResult;
    }

    clear() {
        this.FFloatItemIndex = -1;
        this.FMouseDownIndex = -1;
        this.FMouseMoveIndex = -1;
        this.FFloatItems.clear();

        super.clear();
    }

    GetCaretInfo(itemNo, offset, caretInfo) {
        if (this.FFloatItemIndex >= 0) {
            caretInfo.visible = false;
            return;
        }

        super.GetCaretInfo(itemNo, offset, caretInfo);
    }

    GetScreenCoord(x, y) {
        if (this.FOnGetScreenCoord != null)
            return this.FOnGetScreenCoord(x, y);
        else
            return new TPoint();
    }

    TraverseFloatItem(traverse) {
        if (traverse != null) {
            for (let i = 0; i < this.FFloatItems.count; i++) {
                if (traverse.Stop)
                    return;

                traverse.Process(this, i, traverse.Tag, traverse.DomainStack, traverse.Stop);
            }
        }
    }

    GetActiveItemNo() {
        if (this.FFloatItemIndex < 0)
            return super.GetActiveItemNo();
        else
            return -1;
    }

    GetActiveItem() {
        if (this.FFloatItemIndex < 0)
            return super.GetActiveItem();
        else
            return null;
    }

    GetActiveFloatItem() {
        if (this.FFloatItemIndex < 0)
            return null;
        else
            return this.FFloatItems[this.FFloatItemIndex];
    }

    InsertFloatItem(floatItem) {
        let vStartNo = this.SelectInfo.StartItemNo;
        let vStartOffset = this.SelectInfo.StartItemOffset;
        let vDrawNo = this.GetDrawItemNoByOffset(vStartNo, vStartOffset);
        
        floatItem.left = this.DrawItems[vDrawNo].rect.left
            + this.GetDrawItemOffsetWidth(vDrawNo, this.SelectInfo.StartItemOffset - this.DrawItems[vDrawNo].CharOffs + 1);
        floatItem.left = this.DrawItems[vDrawNo].rect.top;
        
        this.FloatItems.add(floatItem);
        this.FFloatItemIndex = this.FloatItems.count - 1;
        floatItem.Active = true;
        
        if (!this.DisSelect())
            this.Style.updateInfoRePaint();

        return true;
    }

    SaveToStreamRange(stream, startItemNo, startOffset, endItemNo, endOffset) {
        super.SaveToStreamRange(stream, startItemNo, startOffset, endItemNo, endOffset);

        stream.writeInt32(this.FFloatItems.count);
        for (let i = 0; i <= this.FFloatItems.count - 1; i++)
            this.FFloatItems[i].SaveToStream(stream, 0, HC.OffsetAfter);
    }

    ToXml(aNode) {
        // XmlElement vNode = aNode.OwnerDocument.CreateElement("items");
        // super.ToXml(vNode);
        // aNode.AppendChild(vNode);

        // vNode = aNode.OwnerDocument.CreateElement("floatitems");
        // vNode.SetAttribute("count", FFloatItems.count.ToString());
        // for (int i = 0; i < FFloatItems.count; i++)
        // {
        //     XmlElement vFloatItemNode = aNode.OwnerDocument.CreateElement("floatitem");
        //     FFloatItems[i].ToXml(vFloatItemNode);
        //     vNode.AppendChild(vFloatItemNode);
        // }

        // aNode.AppendChild(vNode);
    }

    ParseXml(aNode) {
        // XmlElement vItemsNode = aNode.SelectSingleNode("items") as XmlElement;
        // super.ParseXml(vItemsNode);

        // XmlElement vNode = null;
        // vItemsNode = aNode.SelectSingleNode("floatitems") as XmlElement;
        // for (int i = 0; i <= vItemsNode.ChildNodes.count - 1; i++)
        // {
        //     vNode = vItemsNode.ChildNodes[i] as XmlElement;
        //     HCCustomFloatItem vFloatItem = CreateItemByStyle(int.Parse(vNode.Attributes["sno"].Value)) as HCCustomFloatItem;
        //     vFloatItem.ParseXml(vNode);
        //     FFloatItems.add(vFloatItem);
        // }
    }

    PaintFloatItems(pageIndex, dataDrawLeft, dataDrawTop, voffset, hclCanvas, paintInfo) {
        let vFloatItem = null;
        for (let i = 0; i <= this.FFloatItems.count - 1; i++) {
            vFloatItem = this.FFloatItems[i];
            vFloatItem.drawRect.resetBounds(vFloatItem.left, vFloatItem.left, vFloatItem.Width, vFloatItem.Height);
            vFloatItem.drawRect.offset(dataDrawLeft, dataDrawTop - voffset);
            vFloatItem.PaintTo(this.Style, vFloatItem.drawRect, dataDrawTop, 0, 0, 0, hclCanvas, paintInfo);
        }
    }

    get FloatItemIndex() {
        return this.FFloatItemIndex;
    }

    get ActiveFloatItem() {
        return this.GetActiveFloatItem();
    }

    get FloatItems() {
        return this.FFloatItems;
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

    get OnCreateFloatItemByStyle() {
        return this.FOnCreateFloatItemByStyle;
    }

    set OnCreateFloatItemByStyle(val) {
        this.FOnCreateFloatItemByStyle = val;
    }

    get OnInsertFloatItem() {
        return this.FOnInsertFloatItem;
    }

    set OnInsertFloatItem(val) {
        this.FOnInsertFloatItem = val;
    }
}

export class THCHeaderData extends THCSectionData {
    constructor(style) {
        super(style);
    }
}

export class THCFooterData extends THCSectionData {
    constructor(style) {
        super(style);
    }
}

export class THCPageData extends THCSectionData {
    constructor(style) {
        super(style);

        this.FShowLineActiveMark = false;
        this.FShowUnderLine = false;
        this.FShowLineNo = false;
    }

    DoDrawItemPaintBefor(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight, dataDrawBottom,
        dataScreenTop, dataScreenBottom, hclCanvas, paintInfo)
    {
        super.DoDrawItemPaintBefor(data, itemNo, drawItemNo, drawRect, dataDrawLeft, dataDrawRight,
            dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);

        if (!paintInfo.print) {
            if (this.FShowLineActiveMark) {
                if (drawItemNo == this.GetSelectStartDrawItemNo()) {
                    hclCanvas.pen.color = "blue";

                    let vTop = drawRect.left + Math.trunc(this.DrawItems[drawItemNo].height / 2);
                    hclCanvas.beginPath();
                    try {
                        hclCanvas.moveTo(dataDrawLeft - 10, vTop);
                        hclCanvas.lineTo(dataDrawLeft - 11, vTop);
                        hclCanvas.moveTo(dataDrawLeft - 11, vTop - 1);
                        hclCanvas.lineTo(dataDrawLeft - 11, vTop + 2);
                        hclCanvas.moveTo(dataDrawLeft - 12, vTop - 2);
                        hclCanvas.lineTo(dataDrawLeft - 12, vTop + 3);
                        hclCanvas.moveTo(dataDrawLeft - 13, vTop - 3);
                        hclCanvas.lineTo(dataDrawLeft - 13, vTop + 4);
                        hclCanvas.moveTo(dataDrawLeft - 14, vTop - 4);
                        hclCanvas.lineTo(dataDrawLeft - 14, vTop + 5);
                        hclCanvas.moveTo(dataDrawLeft - 15, vTop - 2);
                        hclCanvas.lineTo(dataDrawLeft - 15, vTop + 3);
                        hclCanvas.moveTo(dataDrawLeft - 16, vTop - 2);
                        hclCanvas.lineTo(dataDrawLeft - 16, vTop + 3);
                    } finally {
                        hclCanvas.paintPath();
                    }
                }
            }
            
            if (this.FShowUnderLine) {
                if (this.DrawItems[drawItemNo].LineFirst) {
                    hclCanvas.pen.color = "black";
                    hclCanvas.moveTo(dataDrawLeft, drawRect.bottom);
                    hclCanvas.lineTo(dataDrawLeft + this.width, drawRect.bottom);
                }
            }

            if (this.FShowLineNo) {
                if (this.DrawItems[drawItemNo].LineFirst) {
                    let vLineNo = 0;
                    for (let i = 0; i <= drawItemNo; i++) {
                        if (this.DrawItems[i].LineFirst)
                            vLineNo++;
                    }

                    hclCanvas.font.size = 10;
                    hclCanvas.font.name = "Courier New";
                    hclCanvas.font.color = "rgb(180, 180, 180)";
                    hclCanvas.textOut(dataDrawLeft - 50, drawRect.left + Math.trunc((drawRect.height - 16) / 2), vLineNo.toString());
                }
            }
        }
    }

    DoLoadFromStream(stream, style, fileVersion) {
        this.FShowUnderLine = stream.readBoolean();
        super.DoLoadFromStream(stream, style, fileVersion);
    }

    MouseDown(e) {
        if (this.FShowLineActiveMark) {
            let vMouseDownItemNo = this.MouseDownItemNo;
            let vMouseDownItemOffset = this.MouseDownItemOffset;
            super.MouseDown(e);
            if ((vMouseDownItemNo != this.MouseDownItemNo)
                || (vMouseDownItemOffset != this.MouseDownItemOffset))
                this.Style.updateInfoRePaint();
        } else
            super.MouseDown(e);
    }

    SaveToStream(stream) {
        stream.writeBoolean(this.FShowUnderLine);
        super.SaveToStream(stream);
    }

    InsertStream(stream, style, fileVersion) {
        return super.InsertStream(stream, style, fileVersion);
    }

    PaintFloatItems(pageIndex, dataDrawLeft, dataDrawTop, voffset, hclCanvas, paintInfo) {
        let vFloatItem = null;

        for (let i = 0; i <= this.FloatItems.count - 1; i++) {
            vFloatItem = this.FloatItems[i];

            if (vFloatItem.PageIndex == pageIndex) {
                vFloatItem.drawRect.resetBounds(vFloatItem.left + dataDrawLeft,
                    vFloatItem.top + dataDrawTop - voffset, vFloatItem.Width, vFloatItem.Height);

                vFloatItem.PaintTo(this.Style, vFloatItem.drawRect, dataDrawTop, 0, 0, 0, hclCanvas, paintInfo);
            }
        }
    }

    InsertPageBreak() {
        if (this.SelectExists())
            return false;

        if ((this.Items[this.SelectInfo.StartItemNo].StyleNo < THCStyle.Null)
            && (this.SelectInfo.StartItemOffset == HC.OffsetInner))
            return false;

        let vKeyArgs = new TKeyEventArgs();
        vKeyArgs.keyCode = TKey.Return;
        this.KeyDown(vKeyArgs, true);

        return true;
    }

    get ShowLineActiveMark() {
        return this.FShowLineActiveMark;
    }

    set ShowLineActiveMark(val) {
        this.FShowLineActiveMark = val;
    }

    get ShowLineNo() {
        return this.FShowLineNo;
    }

    set ShowLineNo(val) {
        this.FShowLineNo = val;
    }

    get ShowUnderLine() {
        return this.FShowUnderLine;
    }

    set ShowUnderLine(val) {
        this.FShowUnderLine = val;
    }
}