import { TMouseButton } from "../hcl/Controls.js";
import { TList, TPoint, TRect } from "../hcl/System.js";
import { THCResizeRectItem } from "./HCRectItem.js";

export class THCCustomFloatItem extends THCResizeRectItem {
    constructor(ownerData) {
        super(ownerData);
        this.FLeft = 0;
        this.FTop = 0;
        this.FLock = false;
        this.FPageIndex = -1;
        this.FDrawRect = new TRect;
        this.FMousePt = new TPoint();
    }

    PointInClient(x, y) {
        return TRect.CreateByBounds(0, 0, this.Width, this.Height).pointInAt(x, y);
    }

     Assign(source) {
        super.Assign(source);
        this.FLeft = source.left;
        this.FTop = source.top;
        this.Width = source.Width;
        this.Height = source.Height;
    }

    MouseDown(e) {
        if (this.FLock)
            return this.Active;
        else {
            let vResult = super.MouseDown(e);
            if (!this.Resizing)
                this.FMousePt.reset(e.x, e.y);

            return vResult;
        }
    }

    MouseMove(e) {
        if (this.FLock)
            return this.Active;
        else {
            let vResult = super.MouseMove(e);
            if ((!this.Resizing) && (e.button == TMouseButton.Left)) {
                this.FLeft += e.x - this.FMousePt.x;
                this.FTop += e.y - this.FMousePt.y;
            }

            return vResult;
        }
    }

    MouseUp(e) {
        if (this.FLock)
            return false;

        let vResult = false;

        if (this.Resizing) {
            this.Resizing = false;

            if ((this.ResizeWidth < 1) || (this.ResizeHeight < 1))
                return vResult;

            this.Width = this.ResizeWidth;
            this.Height = this.ResizeHeight;
            vResult = true;
        }

        return vResult;
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        super.DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom,
            hclCanvas, paintInfo);

        if (this.Active)
            hclCanvas.rectangleRect(this.FDrawRect);
    }

    SaveToStream(stream, start, end) {
        stream.writeInt32(this.StyleNo);
        stream.writeInt32(this.FLeft);
        stream.writeInt32(this.FTop);
        stream.writeInt32(this.Width);
        stream.writeInt32(this.Height);
        stream.writeInt32(this.FPageIndex);
        stream.writeBoolean(this.FLock);
    }

    LoadFromStream(stream, style, fileVersion) {
        this.FLeft = stream.readInt32();
        this.FTop = stream.readInt32();
        this.Width = stream.readInt32();
        this.Height = stream.readInt32();

        if (fileVersion > 28)
            this.FPageIndex = stream.readInt32();

        if (fileVersion > 37)
            this.FLock = stream.readBoolean();
        else
            this.FLock = false;
    }

    ToXml(aNode) {
        // aNode.SetAttribute("sno", StyleNo.ToString());
        // aNode.SetAttribute("left", FLeft.ToString());
        // aNode.SetAttribute("top", FTop.ToString());
        // aNode.SetAttribute("width", Width.ToString());
        // aNode.SetAttribute("height", Height.ToString());
        // aNode.SetAttribute("pageindex", FPageIndex.ToString());
    }

    ParseXml(aNode) {
        // StyleNo = int.Parse(aNode.Attributes["sno"].Value);
        // FLeft = int.Parse(aNode.Attributes["left"].Value);
        // FTop = int.Parse(aNode.Attributes["top"].Value);
        // Width = int.Parse(aNode.Attributes["width"].Value);
        // Height = int.Parse(aNode.Attributes["height"].Value);
        // FPageIndex = int.Parse(aNode.Attributes["pageindex"].Value);
    }

    get drawRect() {
        return this.FDrawRect;
    }

    set drawRect(val) {
        this.FDrawRect = val;
    }

    get left() {
        return this.FLeft;
    }

    set left(val) {
        this.FLeft = val;
    }

    get top() {
        return this.FTop;
    }

    set top(val) {
        this.FTop = val;
    }

    get pageIndex() {
        return this.FPageIndex;
    }

    set pageIndex(val) {
        this.FPageIndex = val;
    }

    get lock() {
        return this.FLock;
    }
    
    set lock(val) {
        this.FLock = val;
    }
}

export class THCFloatItems extends TList {
    constructor() {
        super();
        this.FOnInsertItem = null;
        this.FOnRemoveItem = null;
    }

    doAdded_(item) {
        super.doAdded_(item);
        if (this.FOnInsertItem != null)
            this.FOnInsertItem(item);
    }

    doRemoved_(item) {
        super.doRemoved_(item);
        if (this.FOnRemoveItem != null)
            this.FOnRemoveItem(item);
    }
}