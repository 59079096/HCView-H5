import { TCursors, TMouseButton, TKey } from "../hcl/Controls.js";
import { TList, TRect, system, TPoint } from "../hcl/System.js";
import { TColor, TPenStyle, THCCanvas, TBrushStyle } from "../hcl/Graphics.js";
import { HC } from "./HCCommon.js";

export var THCShapeStyle = {
    None: 0,
    Line: 1,
    Rectangle: 2,
    Ellipse: 3,
    Polygon: 4
}

export var THCStructState = {
    Stop: 0,
    Start: 1,
    Structing: 2
}

export class THCShape {
    constructor() {
        this.FStyle = THCShapeStyle.None;
        this.FStructState = THCStructState.Stop;
        this.FVersion = 0;
        this.FColor = TColor.Black;
        this.Cursor = TCursors.Default;
        this.FActive = false;
        this.PointSize = 5;
        this.FOnStructOver = null;
    }

    PaintAnchor(hclCanvas, rect) { }

    SetActive(val) {
        if (this.FActive != val) {
            this.FActive = val;
            if (!val)
                this.FStructState = THCStructState.Stop;
        }
    }

    SetColor(val) {
        if (this.FColor != val)
            this.FColor = val;
    }

    get Version() {
        return this.FVersion;
    }

    set Version(val) {
        this.FVersion = val;
    }

    get StructState() {
        return this.FStructState;
    }

    set StructState(val) {
        this.FStructState = val;
    }

    Assign(source) {
        this.FStyle = source.Style;
        this.FVersion = source.Version;
        this.FColor = source.Color;
    }

    MouseDown(e) {
        this.Active = true;
        return this.FActive;
    }

    MouseMove(e) {
        return this.FActive;
    }

    MouseUp(e) {
        return this.FActive;
    }

    KeyDown(e) {
        return false;
    }

    KeyPress(e) {
        return false;
    }

    KeyUp(e) {
        return false;
    }

    PaintTo(hclCanvas, rect, paintInfo) { }

    PointInClient(x, y) {
        return this.ClientRect().pointInAt(x, y);
    }

    ClientRect() {
        return TRect.CreateByBounds(0, 0, 0, 0);
    }

    SaveToStream(stream) {
        if (this.FStyle == THCShapeStyle.None)
            system.exception("HCShape保存失败，无效的样式值！");

        stream.writeByte(this.FStyle);
        stream.writeByte(this.FVersion);
        HC.HCSaveColorToStream(stream, this.FColor);
    }

    LoadFromStream(stream) {
        this.FStyle = stream.readByte();
        this.FVersion = stream.readByte();
        this.FColor = HC.HCLoadColorFromStream(stream);
    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }

    StructStart() {
        this.FStructState = THCStructState.Start;
    }

    StructOver() {
        this.FStructState = THCStructState.Stop;
        if (this.FOnStructOver != null)
            this.FOnStructOver(this);
    }

    get Style() {
        return this.FStyle;
    }

    set Style(val) {
        this.FStyle = val;
    }

    get Active() {
        return this.FActive;
    }

    set Active(val) {
        this.SetActive(val);
    }

    get Color() {
        return this.FColor;
    }

    set Color(val) {
        this.SetColor(val);
    }

    get OnStructOver() {
        return this.FOnStructOver;
    }

    set OnStructOver(val) {
        this.FOnStructOver = val;
    }
}

export var THCShapeLineObj = {
    None: 0,
    Line: 1,
    Start: 2,
    End: 3
}

export class THCShapeLine extends THCShape {
    constructor() {
        super();
        this.Style = THCShapeStyle.Line;
        this.FStartPt = TPoint.Create(0, 0);
        this.FEndPt = TPoint.Create(0, 0);
        this.FWidth = 1;
        this.FActiveOjb = THCShapeLineObj.None;
        this.FLineStyle = TPenStyle.Solid;
        this.FMousePt = TPoint.Create(0, 0);
    }

    static Create(startPt, endPt) {
        let vShapeLine = new THCShapeLine();
        vShapeLine.FStartPt.reset(startPt.x, startPt.y);
        vShapeLine.FEndPt.reset(endPt.x, endPt.y);
        return vShapeLine;
    }

    SetWidth(val) {
        if (this.FWidth != val)
            this.FWidth = val;
    }

    SetLineStyle(val) {
        if (this.FLineStyle != val)
            this.FLineStyle = val;
    }

    PaintAnchor(hclCanvas, rect) {
        hclCanvas.pen.color = TColor.Black;
        hclCanvas.pen.width = 1;
        hclCanvas.pen.style = TPenStyle.Solid;
        hclCanvas.brush.color = TColor.White;

        hclCanvas.rectangleBounds(this.FStartPt.x + rect.left - this.PointSize, this.FStartPt.y + rect.top - this.PointSize,
            this.PointSize + this.PointSize, this.PointSize + this.PointSize);

        hclCanvas.rectangleBounds(this.FEndPt.x + rect.left - this.PointSize, this.FEndPt.y + rect.top - this.PointSize,
            this.PointSize + this.PointSize, this.PointSize + this.PointSize);
    }

    SetActive(val) {
        super.SetActive(val);
        if (!this.Active)
            this.FActiveOjb = THCShapeLineObj.None;
    }

    GetObjAt(x, y) {
        let vResult = THCShapeLineObj.None;

        if (TRect.Create(this.FStartPt.x - this.PointSize, this.FStartPt.y - this.PointSize,
            this.FStartPt.x + this.PointSize, this.FStartPt.y + this.PointSize).pointInAt(x, y))
            vResult = THCShapeLineObj.Start;
        else
        if (TRect.Create(this.FEndPt.x - this.PointSize, this.FEndPt.y - this.PointSize,
                this.FEndPt.x + this.PointSize, this.FEndPt.y + this.PointSize).pointInAt(x, y))
            vResult = THCShapeLineObj.End;
        else {
            let vPointArr = new Array(4);
            vPointArr[0] = TPoint.Create(this.FStartPt.x - this.PointSize, this.FStartPt.y);
            vPointArr[1] = TPoint.Create(this.FStartPt.x + this.PointSize, this.FStartPt.y);
            vPointArr[2] = TPoint.Create(this.FEndPt.x + this.PointSize, this.FEndPt.y);
            vPointArr[3] = TPoint.Create(this.FEndPt.x - this.PointSize, this.FEndPt.y);

            if (THCCanvas.pointInPathAt(vPointArr, x, y))
                vResult = THCShapeLineObj.Line;
        }

        return vResult;
    }

    Assign(source) {
        super.Assign(source);
        this.FStartPt.resetByPoint(source.FStartPt);
        this.FEndPt.resetByPoint(source.FEndPt);
    }

    MouseDown(e) {
        if (e.button != TMouseButton.Left)
            return false;

        let vResult = false;

        if (this.StructState != THCStructState.Stop) {
            if (this.StructState == THCStructState.Start) {
                this.FStartPt.reset(e.x, e.y);
                this.FEndPt.reset(e.x, e.y);
                this.StructState = THCStructState.Structing;
            } else
                this.StructOver();

            vResult = true;
        } else {
            let vLineObje = this.GetObjAt(e.x, e.y);
            if (this.FActiveOjb != vLineObje) {
                this.FActiveOjb = vLineObje;
                this.Active = this.FActiveOjb != THCShapeLineObj.None;
                vResult = this.Active;
            } else
                vResult = vLineObje != THCShapeLineObj.None;

            if ((vResult) && (this.FActiveOjb == THCShapeLineObj.Line))
                this.FMousePt.reset(e.x, e.y);
        }

        return vResult;
    }

    MouseMove(e) {
        if (this.StructState == THCStructState.Structing) {
            this.FEndPt.reset(e.x, e.y);
            return true;
        }

        let vResult = false;
        if ((e.button == TMouseButton.Left) && (this.FActiveOjb != THCShapeLineObj.None)) {
            vResult = true;

            switch (this.FActiveOjb) {
                case THCShapeLineObj.Line:
                    this.FStartPt.x = this.FStartPt.x + e.x - this.FMousePt.x;
                    this.FStartPt.y = this.FStartPt.y + e.y - this.FMousePt.y;
                    this.FEndPt.x = this.FEndPt.x + e.x - this.FMousePt.x;
                    this.FEndPt.y = this.FEndPt.y + e.y - this.FMousePt.y;
                    this.FMousePt.x = e.x;
                    this.FMousePt.y = e.y;
                    break;

                case THCShapeLineObj.Start:
                    this.FStartPt.x = e.x;
                    this.FStartPt.y = e.y;
                    break;

                case THCShapeLineObj.End:
                    this.FEndPt.x = e.x;
                    this.FEndPt.y = e.y;
                    break;
            }
        } else {
            let vLineOjb = this.GetObjAt(e.x, e.y);
            if (this.Active && ((vLineOjb == THCShapeLineObj.Start) || (vLineOjb == THCShapeLineObj.End)))
                this.Cursor = TCursors.Cross;
            else if (vLineOjb != THCShapeLineObj.None)
                this.Cursor = TCursors.SizeAll;

            vResult = vLineOjb != THCShapeLineObj.None;
        }

        return vResult;
    }

    MouseUp(e) {
        return false;
    }

    PaintTo(hclCanvas, rect, paintInfo) {
        hclCanvas.pen.color = this.Color;
        hclCanvas.pen.width = this.FWidth;
        hclCanvas.pen.style = this.FLineStyle;
        hclCanvas.drawLineDriect(this.FStartPt.x + rect.left, this.FStartPt.y + rect.top,
            this.FEndPt.x + rect.left, this.FEndPt.y + rect.top);

        if ((!paintInfo.Print) && (this.Active))
            this.PaintAnchor(hclCanvas, rect);
    }

    PointInClient(x, y) {
        return this.GetObjAt(x, y) != THCShapeLineObj.None;
    }

    ClientRect() {
        let vResult = new TRect();

        if (this.FStartPt.x < this.FEndPt.x) {
            vResult.left = this.FStartPt.x;
            vResult.right = this.FEndPt.x;
        } else {
            vResult.left = this.FEndPt.x;
            vResult.right = this.FStartPt.x;
        }

        if (this.FStartPt.y < this.FEndPt.y) {
            vResult.top = this.FStartPt.y;
            vResult.bottom = this.FEndPt.y;
        } else {
            vResult.top = this.FEndPt.y;
            vResult.bottom = this.FStartPt.y;
        }

        return vResult;
    }

    SaveToStream(stream) {
        super.SaveToStream(stream);
        stream.writeByte(this.FWidth);
        stream.writeByte(this.FLineStyle);
        stream.writeInt32(this.FStartPt.x);
        stream.writeInt32(this.FStartPt.y);
        stream.writeInt32(this.FEndPt.x);
        stream.writeInt32(this.FEndPt.y);
    }

    LoadFromStream(stream) {
        super.LoadFromStream(stream);
        this.FWidth = stream.readByte();
        this.FLineStyle = stream.readByte();
        this.FStartPt.x = stream.readInt32();
        this.FStartPt.y = stream.readInt32();
        this.FEndPt.x = stream.readInt32();
        this.FEndPt.y = stream.readInt32();
    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }

    get StartPt() {
        return this.FStartPt;
    }

    set startPt(val) {
        this.FStartPt = val;
    }

    get EndPt() {
        return this.FEndPt;
    }

    set endPt(val) {
        this.FEndPt = val;
    }

    get Width() {
        return this.FWidth;
    }

    set Width(val) {
        this.SetWidth(val);
    }

    get LineStyle() {
        return this.FLineStyle;
    }

    set LineStyle(val) {
        this.SetLineStyle(val);
    }

    get ActiveObj() {
        return this.FActiveOjb;
    }
}

export class THCShapeRectangle extends THCShapeLine {
    constructor() {
        super();
        this.Style = THCShapeStyle.Rectangle;
        this.FBackColor = HC.HCTransparentColor;
    }

    GetObjAt(x, y) {
        let vResult = THCShapeLineObj.None;

        if (TRect.Create(this.StartPt.x - this.PointSize, this.StartPt.y - this.PointSize,
                this.StartPt.x + this.PointSize, this.StartPt.y + this.PointSize).pointInAt(x, y))
            vResult = THCShapeLineObj.Start;
        else if (TRect.Create(this.EndPt.x - this.PointSize, this.EndPt.y - this.PointSize,
                this.EndPt.x + this.PointSize, this.EndPt.y + this.PointSize).pointInAt(x, y))
            vResult = THCShapeLineObj.End;
        else {
            let vRect = this.ClientRect();
            vRect.inFlate(this.PointSize, this.PointSize);
            if (vRect.pointInAt(x, y)) {
                vRect.inFlate(-this.PointSize - this.PointSize, -this.PointSize - this.PointSize);
                if (!vRect.pointInAt(x, y))
                    vResult = THCShapeLineObj.Line;
            }
        }

        return vResult;
    }

    PaintTo(hclCanvas, rect, paintInfo) {
        hclCanvas.pen.color = this.Color;
        hclCanvas.pen.width = this.Width;
        hclCanvas.pen.style = this.LineStyle;

        if (this.FBackColor == HC.HCTransparentColor)
            hclCanvas.brush.style = TBrushStyle.Clear;

        hclCanvas.rectangle(this.StartPt.x + rect.left, this.StartPt.y + rect.top,
            this.EndPt.x + rect.left, this.EndPt.y + rect.top);

        if (!paintInfo.Print && this.Active)
            this.PaintAnchor(hclCanvas, rect);
    }

    get BackColor() {
        return this.FBackColor;
    }

    set BackColor(val) {
        this.FBackColor = val;
    }
}

export class THCShapeEllipse extends THCShapeRectangle {
    constructor() {
        super();
        this.Style = THCShapeStyle.Ellipse;
    }

    GetObjAt(x, y) {
        let vResult = THCShapeLineObj.None;

        if (TRect.Create(this.StartPt.x - this.PointSize, this.StartPt.y - this.PointSize,
                this.StartPt.x + this.PointSize, this.StartPt.y + this.PointSize).pointInAt(x, y))
            vResult = THCShapeLineObj.Start;
        else if (TRect.Create(this.EndPt.x - this.PointSize, this.EndPt.y - this.PointSize,
                this.EndPt.x + this.PointSize, this.EndPt.y + this.PointSize).pointInAt(x, y))
            vResult = THCShapeLineObj.End;
        else {
            let vRect = this.ClientRect();
            vRect.inFlate(this.PointSize, this.PointSize);
            if (THCCanvas.pointInEllipseRect(vRect, x, y)) {
                vRect.inFlate(-this.PointSize - this.PointSize, -this.PointSize - this.PointSize);
                if (!THCCanvas.pointInEllipseRect(vRect, x, y))
                        vResult = THCShapeLineObj.Line;
            }
        }

        return vResult;
    }

    PaintTo(hclCanvas, rect, paintInfo) {
        hclCanvas.pen.color = this.Color;
        hclCanvas.pen.width = this.Width;
        hclCanvas.pen.style = this.LineStyle;
        
        if (this.BackColor == HC.HCTransparentColor)
            hclCanvas.brush.style = TBrushStyle.Clear;

        hclCanvas.ellipse(this.StartPt.x + rect.left, this.StartPt.y + rect.top,
            this.EndPt.x + rect.left, this.EndPt.y + rect.top);

        if (!paintInfo.Print && this.Active)
            this.PaintAnchor(hclCanvas, rect);
    }
}

export class THCShapePolygon extends THCShape {
    constructor() {
        super();
        this.Style = THCShapeStyle.Polygon;
        this.FWidth = 1;
        this.FLineStyle = TPenStyle.Solid;
        this.FPoints = new TList();
        this.FActivePointIndex = -1;
        this.FActiveLineIndex = -1;
        this.FMousePt = new TPoint();
    }

    OffsetPoints(x, y) {
        for (let i = 0; i < this.FPoints.count; i++)
            this.FPoints[i].offset(x, y);
    }

    SetWidth(val) {
        if (this.FWidth != val)
            this.FWidth = val;
    }

    SetLineStyle(val) {
        if (this.FLineStyle != val)
            this.FLineStyle = val;
    }

    PaintAnchor(hclCanvas, rect) {
        hclCanvas.pen.color = TColor.Black;
        hclCanvas.pen.width = 1;
        hclCanvas.pen.style = TPenStyle.Solid;
        hclCanvas.brush.color = TColor.White;

        for (let i = 0; i < this.FPoints.count; i++) {
            hclCanvas.rectangle(this.FPoints[i].x + rect.left - this.PointSize, this.FPoints[i].y + rect.top - this.PointSize,
                this.FPoints[i].x + rect.left + this.PointSize, this.FPoints[i].y + rect.top + this.PointSize);
        }

        if (this.FActivePointIndex >= 0) {
            hclCanvas.pen.color = TColor.Red;
            if (this.StructState == THCStructState.Structing)
                hclCanvas.pen.style = TPenStyle.Dot;

            hclCanvas.rectangle(
                this.FPoints[this.FActivePointIndex].x + rect.left - this.PointSize,
                this.FPoints[this.FActivePointIndex].y + rect.top - this.PointSize,
                this.FPoints[this.FActivePointIndex].x + rect.left + this.PointSize,
                this.FPoints[this.FActivePointIndex].y + rect.top + this.PointSize);
        }
    }

    SetActive(val) {
        super.SetActive(val);
        if (!this.Active) {
            this.FActivePointIndex = -1;
            this.FActiveLineIndex = -1;
        }
    }

    GetPointAt(x, y) {
        let vPoint = null;

        for (let i = 0; i < this.FPoints.count; i++) {
            vPoint = this.FPoints[i];
            if (TRect.Create(vPoint.x - this.PointSize, vPoint.y - this.PointSize,
                    vPoint.x + this.PointSize, vPoint.y + this.PointSize).pointInAt(x, y))
            {
                return i;
            }
        }

        return -1;
    }

    GetLineAt(x, y) {
        let vPointArr = new Array(4);

        for (let i = 0; i < this.FPoints.count; i++) {
            vPointArr[0] = new TPoint(this.FPoints[i].x - this.PointSize, this.FPoints[i].y);
            vPointArr[1] = new TPoint(this.FPoints[i].x + this.PointSize, this.FPoints[i].y);

            if (i == this.FPoints.count - 1) {
                vPointArr[2] = new TPoint(this.FPoints[0].x + this.PointSize, this.FPoints[0].y);
                vPointArr[3] = new TPoint(this.FPoints[0].x - this.PointSize, this.FPoints[0].y);
            } else {
                vPointArr[2] = new TPoint(this.FPoints[i + 1].x + this.PointSize, this.FPoints[i + 1].y);
                vPointArr[3] = new TPoint(this.FPoints[i + 1].x - this.PointSize, this.FPoints[i + 1].y);
            }

            if (THCCanvas.pointInPathAt(vPointArr, x, y))
                return i;
        }

        return -1;
    }

    get Points() {
        return this.FPoints;
    }

    Assign(source) {
        super.Assign(source);

        let vPoint = null;
        this.FPoints.Clear();
        for (let i = 0; i < source.Points.count; i++) {
            vPoint = TPoint.Create(source.Points[i].x, source.Points[i].y);
            this.FPoints.add(vPoint);
        }
    }

    MouseDown(e) {
        if (e.button == TMouseButton.Right) {
            if (this.StructState == THCStructState.Structing)
                this.StructOver();

            return false;
        }

        if (e.button != TMouseButton.Left)
            return false;

        let vPoint = null;
        let vResult = false;
        if (this.StructState != THCStructState.Stop) {
            if (this.StructState == THCStructState.Start) {
                vPoint = TPoint.Create(e.x, e.y);
                this.FPoints.add(vPoint);

                vPoint = TPoint.Create(e.x, e.y);
                this.FPoints.add(vPoint);
                this.FActivePointIndex = this.FPoints.count - 1;
                this.StructState = THCStructState.Structing;
            } else if (this.StructState == THCStructState.Structing) {
                vPoint = TPoint.Create(e.x, e.y);
                this.FPoints.add(vPoint);
                this.FActivePointIndex = this.FPoints.count - 1;
            } else
                this.StructOver();

            vResult = true;
        } else {
            let vIndex = this.GetPointAt(e.x, e.y);
            if (this.FActivePointIndex != vIndex) {
                this.FActivePointIndex = vIndex;
                this.Active = this.FActivePointIndex >= 0;
                vResult = this.Active;
            } else
                vResult = vIndex >= 0;

            if (!vResult) {
                vIndex = this.GetLineAt(e.x, e.y);
                if (this.FActiveLineIndex != vIndex) {
                    this.FActiveLineIndex = vIndex;
                    this.Active = this.FActiveLineIndex >= 0;
                    vResult = this.Active;
                } else
                    vResult = vIndex >= 0;
            }

            if (vResult)
                this.FMousePt.reset(e.x, e.y);
        }

        return vResult;
    }

    MouseMove(e) {
        if (this.StructState == THCStructState.Structing) {
            this.FPoints[this.FActivePointIndex].reset(e.x, e.y);
            return true;
        }

        if (e.button == TMouseButton.Left) {
            if (this.FActivePointIndex >= 0) {
                this.FPoints[this.FActivePointIndex].reset(e.x, e.y);
                return true;
            } else if (this.FActiveLineIndex >= 0) {
                this.OffsetPoints(e.x - this.FMousePt.x, e.y - this.FMousePt.y);
                this.FMousePt.reset(e.x, e.y);
                return true;
            }
        } else {
            let vIndex = this.GetPointAt(e.x, e.y);
            if (vIndex >= 0) {
                this.Cursor = TCursors.Cross;
                return true;
            } else {
                vIndex = this.GetLineAt(e.x, e.y);
                if (vIndex >= 0) {
                    this.Cursor = TCursors.SizeAll;
                    return true;
                }
            }
        }

        return false;
    }

    MouseUp(e) {
        return false;
    }

    KeyDown(e) {
        if ((e.keyCode == TKey.Back) || (e.keyCode == TKey.Delete)) {
            if ((this.StructState == THCStructState.Stop) && (this.FActivePointIndex >= 0)) {
                if (this.FPoints.count > 2) {
                    this.FPoints.removeAt(this.FActivePointIndex);
                    this.FActivePointIndex = -1;
                    return true;
                }
            }
        }

        return false;
    }

    PaintTo(hclCanvas, rect, paintInfo) {
        hclCanvas.pen.color = this.Color;
        hclCanvas.pen.width = this.FWidth;
        hclCanvas.pen.style = this.FLineStyle;

        hclCanvas.beginPath();
        hclCanvas.moveTo(this.FPoints[0].x + rect.left, this.FPoints[0].y + rect.top);
        for (let i = 1; i < this.FPoints.count; i++)
            hclCanvas.lineTo(this.FPoints[i].x + rect.left, this.FPoints[i].y + rect.top);

        if (this.FPoints.count > 1)
            hclCanvas.lineTo(this.FPoints[0].x + rect.left, this.FPoints[0].y + rect.top);

        if ((!paintInfo.Print) && this.Active)
            this.PaintAnchor(hclCanvas, rect);
    }

    PointInClient(x, y) {
        let vIndex = this.GetPointAt(x, y);
        if (vIndex >= 0)
            return true;
        else {
            vIndex = this.GetLineAt(x, y);
            if (vIndex >= 0)
                return true;
        }

        return false;
    }

    StructOver() {
        this.FActivePointIndex = -1;
        this.FActiveLineIndex = -1;
        if (this.FPoints.count > 2)
            this.FPoints.removeAt(this.FPoints.count - 1);

        super.StructOver();
    }

    SaveToStream(stream) {
        super.SaveToStream(stream);
        stream.writeByte(this.FWidth);
        stream.writeByte(this.FLineStyle);
        stream.writeInt32(this.FPoints.count);

        for (let i = 0; i < this.FPoints.count; i++) {
            stream.writeInt32(this.FPoints[i].x);
            stream.writeInt32(this.FPoints[i].y);
        }
    }

    LoadFromStream(stream) {
        this.FPoints.clear();
        super.LoadFromStream(stream);
        this.FWidth = stream.readByte();
        this.FLineStyle = stream.readByte();
        let vCount = stream.readInt32();
        let vX = 0, vY = 0, vPoint = null;
        for (let i = 0; i < vCount; i++) {
            vX = stream.readInt32();
            vY = stream.readInt32();
            vPoint = TPoint.Create(vX, vY);
            this.FPoints.add(vPoint);
        }
    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }
}

export class THCShapeManager extends TList {
    constructor() {
        super();
        this.FActiveIndex = -1;
        this.FHotIndex = -1;
        this.FOperStyle = THCShapeStyle.None;
        this.FOnStructOver = null;
    }

    NewShape(style) {
        let vShpae = null;

        switch (style) {
            case THCShapeStyle.None:
                break;

            case THCShapeStyle.Line:
                vShpae = new THCShapeLine();
                break;

            case THCShapeStyle.Rectangle:
                vShpae = new THCShapeRectangle();
                break;

            case THCShapeStyle.Ellipse:
                vShpae = new THCShapeEllipse();
                break;

            case THCShapeStyle.Polygon:
                vShpae = new THCShapePolygon();
                break;
        }

        if (vShpae != null) {
            vShpae.OnStructOver = (sender) => { this.DoShapeStructOver(sender); }
            this.add(vShpae);
            return this.count - 1;
        }

        return -1;
    }

    DoShapeStructOver(sender) {
        this.ActiveIndex = -1;
        if (this.FOnStructOver != null)
            this.FOnStructOver(sender);
    }

    SetOperStyle(val) {
        if (this.FOperStyle != val) {
            this.ActiveIndex = -1;
            this.FOperStyle = val;
        }
    }

    SetActiveIndex(val) {
        if (this.FActiveIndex != val) {
            if (this.FActiveIndex >= 0)
                this[this.FActiveIndex].Active = false;

            this.FActiveIndex = val;
            if (this.FActiveIndex >= 0)
                this[this.FActiveIndex].Active = true;
        }
    }

    MouseDown(e) {
        let vResult = false;

        if (this.FOperStyle != THCShapeStyle.None) {
            if (this.FActiveIndex < 0) {
                this.ActiveIndex = this.NewShape(this.FOperStyle);
                this[this.FActiveIndex].StructStart();
            }

            if (this.FActiveIndex >= 0)
                vResult = this[this.FActiveIndex].MouseDown(e);
        } else {
            let vIndex = -1;
            for (let i = 0; i < this.count; i++) {
                if (this[i].PointInClient(e.x, e.y)) {
                    if (this[i].MouseDown(e)) {
                        vIndex = i;
                        vResult = true;
                        break;
                    }
                }
            }

            if (vIndex != this.FActiveIndex) {
                this.ActiveIndex = vIndex;
                vResult = true;
            }
        }

        return vResult;
    }

    MouseMove(e) {
        if (this.FActiveIndex >= 0) {
            if (this[this.FActiveIndex].MouseMove(e)) {
                this.FHotIndex = this.FActiveIndex;
                return true;
            }
        }

        this.FHotIndex = -1;
        for (let i = 0; i < this.count; i++) {
            if (this[i].PointInClient(e.x, e.y)) {
                if (this[i].MouseMove(e)) {
                    this.FHotIndex = i;
                    return true;
                }
            }
        }

        return false;
    }

    MouseUp(e) {
        for (let i = 0; i < this.count; i++) {
            if (this[i].MouseUp(e))
                return true;
        }

        return false;
    }

    KeyDown(e) {
        if (this.FActiveIndex >= 0) {
            if (this[this.FActiveIndex].KeyDown(e))
                return true;
            else if ((e.keyCode == TKey.Back) || (e.keyCode == TKey.Delete)) {
                this.removeAt(this.FActiveIndex);
                this.FActiveIndex = -1;
                return true;
            }
        }

        return false;
    }

    DisActive() {
        this.FOperStyle = THCShapeStyle.None;
        if (this.FActiveIndex >= 0)
            this[this.FActiveIndex].Active = false;
    }

    PaintTo(hclCanvas, rect, paintInfo) {
        for (let i = 0; i < this.count; i++)
            this[i].PaintTo(hclCanvas, rect, paintInfo);
    }

    SaveToStream(stream) {
        stream.writeInt32(this.count);
        for (let i = 0; i < this.count; i++)
            this[i].SaveToStream(stream);
    }

    LoadFromStream(stream) {
        this.clear();

        let vCount = stream.readInt32();
        let vShape = null;
        let vStyle = THCShapeStyle.None;
        for (let i = 0; i < vCount; i++) {
            vStyle = stream.readByte();

            switch (vStyle) {
                case THCShapeStyle.None:
                    system.exception("HCShape读取失败，无效的样式值！");
                    break;

                case THCShapeStyle.Line:
                    vShape = new THCShapeLine();
                    break;

                case THCShapeStyle.Rectangle:
                    vShape = new THCShapeRectangle();
                    break;

                case THCShapeStyle.Ellipse:
                    vShape = new THCShapeEllipse();
                    break;

                case THCShapeStyle.Polygon:
                    vShape = new THCShapePolygon();
                    break;
            }

            stream.position = stream.position - 1;
            vShape.LoadFromStream(stream);
            this.add(vShape);
        }
    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }

    get OperStyle() {
        return this.FOperStyle;
    }

    set OperStyle(val) {
        this.SetOperStyle(val);
    }

    get ActiveIndex() {
        return this.FActiveIndex;
    }

    set ActiveIndex(val) {
        this.SetActiveIndex(val);
    }

    get HotIndex() {
        return this.FHotIndex;
    }

    get OnStructOver() {
        return this.FOnStructOver;
    }

    set OnStructOver(val) {
        this.FOnStructOver = val;
    }
}