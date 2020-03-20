import { TMouseEventArgs } from "../hcl/Controls.js";
import { TObject } from "../hcl/System.js";
import { TBorderSide, THCBorderSides, HC } from "./HCCommon.js";

export var TTableSite = {
    Outside: 0,
    Cell: 1,
    BorderLeft: 2,
    BorderTop: 3,
    BorderRight: 4,
    BorderBottom: 5
}

export class TResizeInfo {
    constructor() {
        this.TableSite = TTableSite.Outside;
        this.DestX = 0;
        this.DestY = 0;
    }
}

export class TOutsideInfo {
    constructor() {
        this.Row = -1;
        this.Leftside = true;
    }
}

export class TSelectCellRang extends TObject {
    constructor() {
        super();
        this.StartRow = -1;
        this.StartCol = -1;
        this.EndRow = -1;
        this.EndCol = -1;
    }

    SelectCellRang() {
        this.Initialize();
    }

    Initialize() {
        this.StartRow = -1;
        this.StartCol = -1;
        this.InitializeEnd();
    }

    InitializeEnd() {
        this.EndRow = -1;
        this.EndCol = -1;
    }

    SetStart(row, col) {
        this.StartRow = row;
        this.StartCol = col;
    }

    SetEnd(row, col) {
        this.EndRow = row;
        this.EndCol = col;
    }

    EditCell() {
        return ((this.StartRow >= 0) && (this.EndRow < 0));
    }

    SameRow() {
        return ((this.StartRow >= 0) && (this.StartRow == this.EndRow));
    }

    SameCol() {
        return ((this.StartCol >= 0) && (this.StartCol == this.EndCol));
    }

    SelectExists() {
        return ((this.StartRow >= 0) && (this.EndRow >= 0));
    }
}

export var THCAlignVert = {
    Top: 0,
    Center: 1,
    Bottom: 2
}

export class THCTableCell extends TObject {
    constructor(style) {
        super();
        this.FCellData = new HC.TableCellData(style);
        this.FAlignVert = THCAlignVert.Top;
        this.FBorderSides = new THCBorderSides();
        this.FBorderSides.add(TBorderSide.Left);
        this.FBorderSides.add(TBorderSide.Top);
        this.FBorderSides.add(TBorderSide.Right);
        this.FBorderSides.add(TBorderSide.Bottom);
        this.FBackgroundColor = style.BackgroundColor;
        this.FRowSpan = 0;
        this.FColSpan = 0;
        this.FWidth = 0;
        this.FHeight = 0;
    }

    GetActive() {
        if (this.FCellData != null)
            return this.FCellData.Active;
        else
            return false;
    }

    SetActive(val) {
        if (this.FCellData != null)
            this.FCellData.Active = val;
    }

    SetHeight(val) {
        if (this.FHeight != val) {
            this.FHeight = val;
            if (this.FCellData != null)
                this.FCellData.CellHeight = val;
        }
    }

    dispose() {
        super.Dispose();
        this.FCellData.dispose();
    }

    MouseDown(e, cellHPadding, cellVPadding) {
        this.Active = true;
        if (this.FCellData != null) {
            let vEvent = new TMouseEventArgs();
            vEvent.assign(e);
            vEvent.x -= cellHPadding;
            vEvent.y -= this.GetCellDataTop(cellVPadding);
            this.FCellData.MouseDown(vEvent);
        }
    }

    MouseMove(e, cellHPadding, cellVPadding) {
        if (this.FCellData != null) {
            let vEvent = new TMouseEventArgs();
            vEvent.assign(e);
            vEvent.x -= cellHPadding;
            vEvent.y -= this.GetCellDataTop(cellVPadding);
            this.FCellData.MouseMove(vEvent);
        }
    }

    MouseUp(e, cellHPadding, cellVPadding) {
        if (this.FCellData != null) {
            let vEvent = new TMouseEventArgs();
            vEvent.assign(e);
            vEvent.x -= cellHPadding;
            vEvent.y -= this.GetCellDataTop(cellVPadding);
            this.FCellData.MouseUp(vEvent);
        }
    }

    IsMergeSource() {
        return (this.FCellData == null);
    }

    IsMergeDest() {
        return ((this.FRowSpan > 0) || (this.FColSpan > 0));
    }

    ClearFormatExtraHeight() {
        if (this.FCellData != null)
            return this.FCellData.ClearFormatExtraHeight();
        else
            return 0;
    }

    SaveToStream(stream) {
        stream.writeInt32(this.FWidth);
        stream.writeInt32(this.FHeight);
        stream.writeInt32(this.FRowSpan);
        stream.writeInt32(this.FColSpan);

        stream.writeByte(this.FAlignVert);
        HC.HCSaveColorToStream(stream, this.FBackgroundColor);
        stream.writeByte(this.FBorderSides.value);

        let vNullData = (this.FCellData == null);
        stream.writeBoolean(vNullData);
        if (!vNullData)
            this.FCellData.SaveToStream(stream);
    }

    LoadFromStream(stream, style, fileVersion) {
        this.FWidth = stream.readInt32();
        this.FHeight = stream.readInt32();
        this.FRowSpan = stream.readInt32();
        this.FColSpan = stream.readInt32();

        if (fileVersion > 11) {
            this.FAlignVert = stream.readByte();
            this.FBackgroundColor = HC.HCLoadColorFromStream(stream);
        }

        if (fileVersion > 13)
            this.FBorderSides.value = stream.readByte();

        let vNullData = stream.readBoolean();
        if (!vNullData) {
            this.FCellData.LoadFromStream(stream, style, fileVersion);
            this.FCellData.CellHeight = this.FHeight;
        } else if ((this.FRowSpan < 0) || (this.FColSpan < 0)) {
            this.FCellData.dispose();
            this.FCellData = null;
        }
    }

    ToXml(aNode) {
        // aNode.SetAttribute("width", FWidth.ToString());
        // aNode.SetAttribute("height", FHeight.ToString());
        // aNode.SetAttribute("rowspan", FRowSpan.ToString());
        // aNode.SetAttribute("colspan", FColSpan.ToString());
        // aNode.SetAttribute("vert", ((byte)FAlignVert).ToString());
        // aNode.SetAttribute("bkcolor", HC.GetColorXmlRGB(FBackgroundColor));
        // aNode.SetAttribute("border", HC.GetBorderSidePro(FBorderSides));

        // if (FCellData != null)  // 存数据
        // {
        //     XmlElement vNode = aNode.OwnerDocument.CreateElement("items");
        //     FCellData.ToXml(vNode);
        //     aNode.AppendChild(vNode);
        // }
    }

    ParseXml(aNode) {
        // FWidth = int.Parse(aNode.Attributes["width"].Value);
        // FHeight = int.Parse(aNode.Attributes["height"].Value);
        // FRowSpan = int.Parse(aNode.Attributes["rowspan"].Value);
        // FColSpan = int.Parse(aNode.Attributes["colspan"].Value);
        // FAlignVert = (HCAlignVert)(byte.Parse(aNode.Attributes["vert"].Value));
        // FBackgroundColor = HC.GetXmlRGBColor(aNode.Attributes["bkcolor"].Value);
        // HC.SetBorderSideByPro(aNode.Attributes["border"].Value, FBorderSides);

        // if ((FRowSpan < 0) || (FColSpan < 0))
        // {
        //     FCellData.Dispose();
        //     FCellData = null;
        // }
        // else
        // {
        //     FCellData.Width = FWidth;  // // 不准确的赋值，应该减去2个水平padding，加载时使用无大碍
        //     FCellData.ParseXml(aNode.SelectSingleNode("items") as XmlElement);
        // }
    }

    GetCellDataTop(cellVPadding) {
        switch (this.FAlignVert) {
            case THCAlignVert.Top:
                return cellVPadding;

            case THCAlignVert.Center:
                return cellVPadding + Math.trunc((this.FHeight - cellVPadding - this.FCellData.Height - cellVPadding) / 2);

            default:
                return this.FHeight - cellVPadding - this.FCellData.Height;
        }
    }

    GetCaretInfo(itemNo, offset, cellHPadding, cellVPadding, caretInfo) {
        if (this.FCellData != null) {
            this.FCellData.GetCaretInfo(itemNo, offset, caretInfo);
            if (caretInfo.visible) {
                caretInfo.x += cellHPadding;
                caretInfo.y += this.GetCellDataTop(cellVPadding);
            }
        } else
            caretInfo.visible = false;
    }

    PaintTo(drawLeft, drawTop, drawRight, dataDrawBottom, dataScreenTop, dataScreenBottom,
        vOffset, cellHPadding, cellVPadding, hclCanvas, paintInfo)
    {
        if (this.FCellData != null) {
            let vTop = drawTop + this.GetCellDataTop(cellVPadding);
            this.FCellData.PaintData(drawLeft + cellHPadding, vTop, drawRight - cellHPadding, 
                dataDrawBottom, dataScreenTop, dataScreenBottom, vOffset, hclCanvas, paintInfo);
        }
    }

    get CellData() {
        return this.FCellData;
    }

    set CellData(val) {
        this.FCellData = val;
    }

    get Width() {
        return this.FWidth;
    }

    set Width(val) {
        this.FWidth = val;
    }

    get Height() {
        return this.FHeight;
    }

    set Height(val) {
        this.SetHeight(val);
    }

    get RowSpan() {
        return this.FRowSpan;
    }

    set RowSpan(val) {
        this.FRowSpan = val;
    }

    get ColSpan() {
        return this.FColSpan;
    }

    set ColSpan(val) {
        this.FColSpan = val;
    }

    get BackgroundColor() {
        return this.FBackgroundColor;
    }

    set BackgroundColor(val) {
        this.FBackgroundColor = val;
    }

    get Active() {
        return this.GetActive();
    }

    set Active(val) {
        this.SetActive(val);
    }

    get AlignVert() {
        return this.FAlignVert;
    }

    set AlignVert(val) {
        this.FAlignVert = val;
    }

    get BorderSides() {
        return this.FBorderSides;
    }

    set BorderSides(val) {
        this.FBorderSides = val;
    }
}