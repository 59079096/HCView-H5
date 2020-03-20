import { TPoint } from "../hcl/System.js";
import { THCCustomFloatItem } from "./HCCustomFloatItem.js";
import { THCShapeLine, THCShapeLineObj } from "./HCShape.js";
import { THCStyle } from "./HCStyle.js";
import { TMouseButton } from "../hcl/Controls.js";
import { HC } from "./HCCommon.js";
import { TColor } from "../hcl/Graphics.js";

export var THCLineObj = {
    None: 0,
    Line: 1,
    LeftOrTop: 2,
    RightOrBottom: 3
}

export class THCFloatLineItem extends THCCustomFloatItem {
    constructor(ownerData) {
        super(ownerData);
        this.StyleNo = THCStyle.FloatLine;
        this.Width = 100;
        this.Height = 70;
        this.FLeftTop = null;
        this.FShapeLine = THCShapeLine.Create(TPoint.Create(0, 0), TPoint.Create(this.Width, this.Height));
    }

    GetShapeLeftTop() {
        let vResult = new TPoint();

        if (this.FShapeLine.StartPt.x < this.FShapeLine.EndPt.x)
            vResult.x = this.FShapeLine.StartPt.x;
        else
            vResult.x = this.FShapeLine.EndPt.x;

        if (this.FShapeLine.StartPt.y < this.FShapeLine.EndPt.y)
            vResult.y = this.FShapeLine.StartPt.y;
        else
            vResult.y = this.FShapeLine.EndPt.y;

        return vResult;
    }

    SetActive(val) {
        super.SetActive(val);
        this.FShapeLine.Active = this.Active;
    }

    PointInClient(x, y) {
        return this.FShapeLine.PointInClient(x, y);
    }

    Assign(source) {
        super.Assign(source);
        this.FShapeLine.Assign(source.FShapeLine);
    }

    MouseDown(e) {
        let vResult = this.FShapeLine.MouseDown(e);
        this.Active = (this.FShapeLine.ActiveObj != THCShapeLineObj.None);
        if (this.Active) {
            if (e.button == TMouseButton.Left) {
                this.Resizing = ((this.FShapeLine.ActiveObj == THCShapeLineObj.Start) || (this.FShapeLine.ActiveObj == THCShapeLineObj.End));

                if (this.Resizing) {
                    this.FResizeX = e.x;
                    this.FResizeY = e.y;
                    this.FLeftTop = this.GetShapeLeftTop();
                } else if (this.FShapeLine.ActiveObj == THCShapeLineObj.Line)
                    this.FLeftTop = this.GetShapeLeftTop();
            }
        }

        return vResult;
    }

    MouseMove(e) {
        let vResult = this.FShapeLine.MouseMove(e);
        if (this.Active) {
            if (this.Resizing) {
                this.FResizeX = e.x;
                this.FResizeY = e.y;
            }
        }
        
        if (vResult)
            HC.GCursor = this.FShapeLine.Cursor;

        return vResult;
    }

    _CalcNewLeftTop() {
        let vNewLeftTop = this.GetShapeLeftTop();
        this.left = this.left + vNewLeftTop.x - this.FLeftTop.x;
        this.top = this.top + vNewLeftTop.y - this.FLeftTop.y;
        this.FShapeLine.StartPt.reset(this.FShapeLine.StartPt.x - vNewLeftTop.x, this.FShapeLine.StartPt.y - vNewLeftTop.y);
        this.FShapeLine.EndPt.reset(this.FShapeLine.EndPt.x - vNewLeftTop.x, this.FShapeLine.EndPt.y - vNewLeftTop.y);
    }

    MouseUp(e) {
        if (this.Resizing) {
            this.Resizing = false;
            this._CalcNewLeftTop();

            this.Width = Math.abs(this.FShapeLine.EndPt.x - this.FShapeLine.StartPt.x);
            this.Height = Math.abs(this.FShapeLine.EndPt.y - this.FShapeLine.StartPt.y);
        } else if (this.FShapeLine.ActiveObj == THCShapeLineObj.Line)
            this._CalcNewLeftTop();

        return this.FShapeLine.MouseUp(e);
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        this.FShapeLine.PaintTo(hclCanvas, drawRect, paintInfo);
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        this.FShapeLine.SaveToStream(stream);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        if (fileVersion > 26)
            this.FShapeLine.LoadFromStream(stream);
        else {
            this.FShapeLine.Width = 1;
            this.FShapeLine.Color = TColor.Black;
            let vX = stream.readInt32();
            let vY = stream.readInt32();
            this.FShapeLine.StartPt.reset(vX, vY);
            
            vX = stream.readInt32();
            vY = stream.readInt32();
            this.FShapeLine.EndPt.reset(vX, vY);
        }
    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }
}