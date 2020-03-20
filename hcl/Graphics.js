import { TSize, TPoint, system, } from "./System.js";

export class TColor {
    static getRGBA(color) {
        contextTemp.clearRect(1, 1, 1, 1);
        //hclCanvasTemp.brush.color = "rgb(255, 255, 255)";
        //hclCanvasTemp.fillBounds(1, 1, 1, 1);
        hclCanvasTemp.brush.color = color;
        hclCanvasTemp.fillBounds(1, 1, 1, 1);
        let vImgData = contextTemp.getImageData(1, 1, 1, 1);
        if (vImgData.data[3] == 0)
            return {
                r: 255,
                g: 255,
                b: 255,
                a: 0
            }
        else return {
            r: vImgData.data[0],
            g: vImgData.data[1],
            b: vImgData.data[2],
            a: vImgData.data[3]
        }
    }
}

TColor.Red = "rgb(255, 0, 0)";
TColor.Green = "rgb(0, 255, 0)";
TColor.Blue = "rgb(0, 0, 255)";
TColor.Black = "rgb(0, 0, 0)";
TColor.White = "rgb(255, 255, 255)";
TColor.Gray = "gray";

class TGraphicObj {
    constructor () { }

    onChange() { }

    doChange_() {
        this.onChange();
    } 
}

export var TFontStyle = {
    Bold: 1,
    Italic: 2,
    Underline: 4,
    StrikeOut: 8,
    SuperScript: 16,
    SubScript: 32
}

export class TFontDetector {
    constructor() {
        // 将字体与三种默认字体进行比较，如果都不匹配，则该字体不可用。
        this._baseFonts = ['monospace', 'sans-serif', 'serif'];
        this._body = document.getElementsByTagName("body")[0];
        this._span = document.createElement("span");
        this._span.style.fontSize = "72px";  // 使用72px大小，当然越大越好
        this._span.innerHTML = "mmmmmmmmmmlli";  // 使用m 或 w 因为这2个占最大宽度，使用LLi区分相同的匹配字体
        this.defaultWidth = [];
        this.defaultHeight = [];
        for (let vFont in this._baseFonts) {
            //get the default width for the three base fonts
            this._span.style.fontFamily = this._baseFonts[vFont];
            this._body.appendChild(this._span);
            this.defaultWidth[this._baseFonts[vFont]] = this._span.offsetWidth;
            this.defaultHeight[this._baseFonts[vFont]] = this._span.offsetHeight;
            this._body.removeChild(this._span);
        }
    }

    detect(font) {
        let vDetected = false, vMatched;
        for (let index in this._baseFonts) {
            this._span.style.fontFamily = font + ',' + this._baseFonts[index]; // name of the font along with the base font for fallback.
            this._body.appendChild(this._span);
            vMatched = (this._span.offsetWidth != this.defaultWidth[this._baseFonts[index]]
                || this._span.offsetHeight != this.defaultHeight[this._baseFonts[index]]);

            this._body.removeChild(this._span);
            vDetected = vDetected || vMatched;
        }

        return vDetected;
    }
}

class TFontStyles {
    constructor() {
        this._value = 0;
        this.onChange = null;
    }

    doChange_() {
        if (this.onChange != null)
            this.onChange();
    }

    has(val) {
        return ((this._value & val) == val);
    }

    add(val) {
        this._value = this._value | val;
        this.doChange_();
    }

    remove(val) {
        this._value = this._value & ~val;
        this.doChange_();
    }

    clear() {
        this._value = 0;
        this.doChange_();
    }

    get value() {
        return this._value;
    }

    set value(val) {
        if (this._value != val) {
            this._value = val;
            this.doChange_();
        }
    }
}

export class TFont extends TGraphicObj {
    constructor() {
        super();
        this._name = "宋体";
        this._size = 10;
        //this._sizeUnit = "pt";
        this._height = 13;
        this._ascent = 11;
        this._descent = 2;
        this._externalLeading = 2;
        this._color = "black";
        this._advCharWidth = 7;
        //this._maxCharWidth = 13;
        this._styles = new TFontStyles();
        this._styles.onChange = () => { this.doChange_(); }
        this._CJK = true;
        this._trueType = true;
        this.onColorChange = null;
    }

    _reSetSize() {
        let vSpan = document.createElement("span");
        vSpan.style.font = this.contextFont();
        vSpan.innerText = "M";
        let vBlock = document.createElement("div");
        vBlock.style.display = "inline-block";
        vBlock.style.width = "1px";
        vBlock.style.height = "0px";
        let vDiv = document.createElement("div");
        //vDiv.style.display = "none";
        vDiv.style.position = "absolute";  // relative
        vDiv.style.left = "-100px";
        vDiv.append(vBlock, vSpan);
        document.body.append(vDiv);
        try {
            vBlock.style.verticalAlign = "baseline";
            this._ascent = (this._styles.has(TFontStyle.SuperScript) || this._styles.has(TFontStyle.SubScript)) ? 
                Math.trunc((vBlock.offsetTop - vSpan.offsetTop) / 2) : vBlock.offsetTop - vSpan.offsetTop;

            vBlock.style.verticalAlign = "bottom";
            let rect = vSpan.getBoundingClientRect();
            this._height = (this._styles.has(TFontStyle.SuperScript) || this._styles.has(TFontStyle.SubScript)) ? Math.trunc(rect.height / 2) : rect.height;
            this._descent = this._height - this._ascent;
            this._advCharWidth = (this._styles.has(TFontStyle.SuperScript) || this._styles.has(TFontStyle.SubScript)) ? Math.trunc(rect.width / 2) : rect.width;
        } finally {
            vDiv.remove();
        }
    }

    assign(src) {
        this._name = src.name;
        this._size = src.size;
        this._color = src.color;
        this._styles.value = src.styles.value;
        //this._sizeUnit = src.sizeUnit;
        this._height = src.height;
        this._ascent = src.ascent;
        this._descent = src.descent;
        this._externalLeading = src.externalLeading;
        this._advCharWidth = src.advCharWidth;
        this._CJK = src.CJK;
        this._trueType = src.trueType;
        this.doChange_();
    }

    // fromContext(context) {
    //     let ft = context.font.substr(0, context.font.indexOf(' '));
    //     this._sizeUnit = "pt"; // ft.substr(ft.length - 2);
    //     this.size = 10;  // ft.substr(0, ft.length - 2);
    //     this.name = context.font.substr(context.font.indexOf(' ') + 1);
    //     this.color = context.fillStyle;
    // }

    toContext(context) {
        context.font = this.contextFont();
        context.fillStyle = this._color;
    }

    contextFont() {
        return (this._styles.has(TFontStyle.Italic) ? "italic " : "")
            + (this._styles.has(TFontStyle.Bold) ? "bold " : "")
            + this._size + "pt " + this._name;
    }

    static fontSizeToPt(fontSize) {
        if (fontSize == "初号") return 42;
        else if (fontSize == "小初") return 36;
        else if (fontSize == "一号") return 26;
        else if (fontSize == "小一") return 24;
        else if (fontSize == "二号") return 22;
        else if (fontSize == "小二") return 18;
        else if (fontSize == "三号") return 16;
        else if (fontSize == "小三") return 15;
        else if (fontSize == "四号") return 14;
        else if (fontSize == "小四") return 12;
        else if (fontSize == "五号") return 10.5;
        else if (fontSize == "小五") return 9;
        else if (fontSize == "六号") return 7.5;
        else if (fontSize == "小六") return 6.5;
        else if (fontSize == "七号") return 5.5;
        else if (fontSize == "八号") return 5;
        else if (system.isNumber(fontSize)) return fontSize;
        else system.exception("无法识别的字号：" + fontSize);
    }

    static hasFont(fontName) {
        if (typeof fontName != "string")
            return false;
        
        let vDefFont = "Arial";
        if (fontName.toLowerCase() == vDefFont.toLowerCase())
            return true;
        
        let vChar = "a", vSize = 20, vW = 32, vH = 32;
        //canvasTemp.width = a;
        //canvasTemp.height = i;
        //contextTemp.textAlign = "center";
        //contextTemp.fillStyle = "black";
        //contextTemp.textBaseline = "middle";
        let vCheckFun = function (vFontName) {
            contextTemp.clearRect(0, 0, vW, vH);
            contextTemp.font = vSize + "px " + vFontName + ", " + vDefFont;
            contextTemp.fillText(vChar, vW / 2, vH / 2);
            let vData = contextTemp.getImageData(0, 0, vW, vH).data;
            return [].slice.call(vData).filter( function (fname) { return fname != 0 } )
        }
        
        return vCheckFun(vDefFont).join("") !== vCheckFun(fontName).join("");
    }

    get name() {
        return this._name;
    }

    set name(val) {
        if (this._name != val) {
            this._name = val;
            this._CJK = true;
            this._reSetSize();
            this.doChange_();
        }
    }

    get size() {
        return this._size;
    }

    set size(val) {
        let sz = val;  // val.replace(/[^\d.]/g, "");  // 容错，去掉单位
        if (this._size != sz) {
            this._size = sz;
            this._reSetSize();
            this.doChange_();
        }
    }

    get color() {
        return this._color;
    }

    set color(val) {
        if (this._color != val) {
            this._color = val;
            this.doChange_();
            if (this.onColorChange != null)
                this.onColorChange();
        }
    }

    get styles() {
        return this._styles;
    }

    set styles(val) {
        this._styles = val;
        this._reSetSize();
        this.doChange_();        
    }
    
    get height() {
        return this._height;
    }

    get advCharWidth() {
        return this._advCharWidth;
    }

    get CJK() {
        return this._CJK;
    }

    get trueType() {
        return this._trueType;
    }    

    get ascent() {
        return this._ascent;
    }

    get descent() {
        return this._descent;
    }

    get externalLeading() {
        return this._externalLeading;
    }
}

export var TPenStyle = {
    Solid: 1, 
    Dash: 2, 
    Dot: 3, 
    DashDot: 4, 
    DashDotDot: 5, 
    Clear: 6, 
    InsideFrame: 7, 
    UserStyle: 8, 
    Alternate: 9
}

class TPen extends TGraphicObj {
    constructor() {
        super();
        this._width = 1;
        this._color = 'Black';
        this._style = TPenStyle.Solid;
    }

    fromContext(context) {
        this.width = context.lineWdith;
        this.color = context.strokeStyle;
    }

    toContext(context) {
        context.lineWdith = this._width;
        context.strokeStyle = this._color;
    }    

    get width() {
        return this._width;
    }

    set width(val) {
        if (this._width != val) {
            this._width = val;
            this.doChange_();
        }
    }

    get color() {
        return this._color;
    }

    set color(val) {
        if (this._color != val) {
            this._color = val;
            this._style = TPenStyle.Solid;
            this.doChange_();
        } else if (this._style == TPenStyle.Clear) {
            this._style = TPenStyle.Solid;
            this.doChange_();
        }
    }

    static Create(context) {
        let pen = new TPen();
        pen.fromContext(context);
        return pen;
    }
}

export var TBrushStyle = {
    Solid: 0,
    Clear: 1,
    Horizontal: 2,
    Vertical: 3,
    FDiagonal: 4,
    BDiagonal: 5,
    Cross: 6,
    DiagCross: 7
}

class TBrush extends TGraphicObj {
    constructor() {
        super();
        this._color = 'White';
        this._style = TBrushStyle.Solid;
        this.onColorChange = null;
    }

    get color() {
        return this._color;
    }

    set color(val) {
        if (this._color != val) {
            this._color = val;
            this._style = TBrushStyle.Solid;
            this.doChange_();
            if (this.onColorChange != null)
                this.onColorChange();
        } else if (this._style == TBrushStyle.Clear) {
            this._style = TBrushStyle.Solid;
            this.doChange_();
        }
    }

    get style() {
        return this._style;
    }

    set style(val) {
        if (this._style != val) {
            this._style = val;
            this.doChange_();
        }
    }

    fromContext(context) {
        this.color = context.fillStyle;
    }

    toContext(context) {
        context.fillStyle = this._color;
    }

    static Create(context) {
        let brush = new TBrush();
        brush.fromContext(context);
        return brush;
    }
}

var TCanvasStates = {
    FontValid: 1, 
    PenValid: 2, 
    BrushValid: 3
}

export class THCCanvas {
    constructor(h5context) {
        this.h5context = h5context;
        this._states = new Set([]);
        this._pfst = false;  // 是lineTo时的第一个点吗
        this._px1 = 0;
        this._py1 = 0;
        this._px2 = 0;
        this._py2 = 0;
        this._brushColor = null;
        this._fontColor = null;
        this.pen = TPen.Create(h5context);
        this.pen.onChange = () => { this._penChanged(); }

        this.brush = TBrush.Create(h5context);
        this.brush.onChange = () => { this._brushChanged(); }
        this.brush.onColorChange = () => { this._brushColor = this.brush.color; }

        this.font = new TFont();
        this.font.onChange = () => { this._fontChanged(); }

        this.font.onColorChange = () => { this._fontColor = this.font.color; }

        this.scaleSize = TPoint.Create(1, 1);
        this.prepareConext();
    }

    _penChanged() {
        this._states.delete(TCanvasStates.PenValid);
    }

    _brushChanged() {
        this._states.delete(TCanvasStates.BrushValid);
    }

    _fontChanged() {
        this._states.delete(TCanvasStates.FontValid);
    }

    _requiredState(req) {
        let need = req.difference(this._states);
        if (need.size > 0) {
            if (need.has(TCanvasStates.PenValid)) {
                this.pen.toContext(this.h5context);
            }

            if (need.has(TCanvasStates.BrushValid)) {
                this.brush.toContext(this.h5context);
            }

            if (need.has(TCanvasStates.FontValid)) {
                this.font.toContext(this.h5context);
            }

            this._states = this._states.union(need);
        } else {
            if (req.has(TCanvasStates.BrushValid) && (this._brushColor != this._fontColor)) {
                this.brush.toContext(this.h5context);
                this._states = this._states.union([TCanvasStates.BrushValid]);
            }
            
            if (req.has(TCanvasStates.FontValid) && (this._brushColor != this._fontColor)) {
                this.font.toContext(this.h5context);
                this._states = this._states.union([TCanvasStates.FontValid]);
            }
        }
    }

    _pointConnect(x1, y1, x2, y2) {
        if (x1 == x2) {  // 竖线
            let style = this.h5context.fillStyle;
            this.h5context.fillStyle = this.h5context.strokeStyle;
            if (!this._pfst) {
                if (this._py1 == this._py2) {  // 横转竖
                    if (x1 == Math.max(this._px1, this._px2))  // 横的右面转竖
                        this.h5context.fillRect(x1 - this.h5context.lineWdith, y1, this.h5context.lineWdith, y2 - y1);
                    else
                        this.h5context.fillRect(x1, y1, this.h5context.lineWdith, y2 - y1);
                } else
                    this.h5context.fillRect(x1, y1, this.h5context.lineWdith, y2 - y1);
            } else
                this.h5context.fillRect(x1, y1, this.h5context.lineWdith, y2 - y1);

            this.h5context.fillStyle = style;
        } else if (y1 == y2) {  // 横线
            if (!this._pfst) {
                if (this._px1 == this._px2) {  // 竖转横
                    if (x2 < x1)  // 竖的左面转横
                        this.h5context.fillRect(x1, y1, x2 - x1 + this.h5context.lineWdith, this.h5context.lineWdith);
                    else
                        this.h5context.fillRect(x1, y1, x2 - x1, this.h5context.lineWdith);
                } else
                    this.h5context.fillRect(x1, y1, x2 - x1, this.h5context.lineWdith);
            }

            let style = this.h5context.fillStyle;
            this.h5context.fillStyle = this.h5context.strokeStyle;
            this.h5context.fillRect(x1, y1, x2 - x1, this.h5context.lineWdith);
            this.h5context.fillStyle = style;
        } else {
            if (this._pfst)
                this.h5context.moveTo(x1, y1);
            else
                this.h5context.moveTo(this._px2, this._py2);

            this.h5context.lineTo(x2, y2);
        }

        this._px1 = x1;
        this._py1 = y1;
        this._px2 = x2;
        this._py2 = y2;
        this._pfst = false;
    }

    prepareConext() {  // h5Canvas改变width或height等属性时，会恢复context的属性为默认值
        this.h5context.shadowColor = "black";
        this.h5context.textBaseline = "top";  // 文本基线，em方框的顶端
        this.h5context.textAlign = "left";  // 文本于横坐标的对齐方式，左对齐
        this.h5context.lineCap = "square";  // 向线条的每个末端添加正方形线帽 butt|round|square
        this.h5context.font = "10pt 宋体";
        this._states.clear();
    }

    // refresh() {
    //     this._states.clear();
    // }

    save() {
        this.h5context.save();
    }

    restore() {
        this.h5context.restore();
        this._states.clear();
    }

    translate(x, y) {
        this.h5context.translate(x, y);
    }

    clear(x, y, w, h) {
        this.h5context.clearRect(x, y, w, h);
    }

    clearRect(rect) {
        this.clear(rect.left, rect.top, rect.width, rect.height);
    }

    clip(x, y, w, h) {
        this.beginPath();
        this.h5context.rect(x, y, w, h);
        this.closePath();
        // debug
        //this.h5context.strokeStyle = "red";
        //this.h5context.stroke();
        this.h5context.clip();
    }

    clipRect(rect) {
        this.clip(rect.left, rect.top, rect.width, rect.height);
    }

    bitBlt(x, y, w, h, srcCanvas, srcx, srcy, srcw, srch) {
        //this.context.drawImage(h5Canvas, x, y, w, h);
        //let vData = srcCanvas.getImageData(srcx, srcy, srcw, srch);
        //this.setImageData(vData, x, y);
        let vH5Canvas = srcCanvas.h5context.canvas;
        this.h5context.drawImage(vH5Canvas, x, y, w, h, srcx, srcy, srcw, srch);
    }

    bitBltRect(rect, srcCanvas, srcRect) {
        this.bitBlt(rect.left, rect.top, rect.width, rect.height,
            srcCanvas, srcRect.left, srcRect.top, srcRect.width, srcRect.height);
    }

    getImageData(x, y, w, h) {
        return this.h5context.getImageData(x, y, w, h);
    }

    setImageData(data, x, y) {
        this.h5context.putImageData(data, x, y);
    }

    setImageDataBounds(data, x, y, dx, dy, dw, dh) {
        this.h5context.putImageData(data, x, y, dx, dy, dw, dh);
    }

    beginPath() {
        this.h5context.beginPath();
        this._requiredState(new Set([TCanvasStates.PenValid]));
    }

    closePath() {
        this.h5context.closePath();
    }

    paintPath() {
        this.h5context.closePath();
        this.h5context.stroke();
    }

    textOut(x, y, text) {
        this._requiredState(new Set([TCanvasStates.FontValid]));  // Bold、Italic
        if (this.font.styles.has(TFontStyle.SuperScript)) {
            this.h5context.scale(0.5, 0.5);
            x += x;
            y += y - this.font.height;
        } else if (this.font.styles.has(TFontStyle.SubScript)) {
            this.h5context.scale(0.5, 0.5);
            x += x;
            y += y + this.font.height;
        }

        this.h5context.fillText(text, x, y);
        let vW = 0;
        if (this.font.styles.has(TFontStyle.Underline)) {
            vW = this.h5context.measureText(text).width;
            this.pen.color = this.font.color;
            this.pen.width = 0.5;
            this.drawLineDriect(x, y + this.font.height, x + vW, y + this.font.height);
        }

        if (this.font.styles.has(TFontStyle.StrikeOut)) {
            if (vW == 0) {
                vW = this.h5context.measureText(text).width;
                this.pen.color = this.font.color;
                this.pen.width = 0.5;
            }

            let vMid = Math.trunc(this.font.height / 2);
            this.drawLineDriect(x, y + vMid, x + vW, y + vMid);
        }

        if (this.font.styles.has(TFontStyle.SuperScript) || this.font.styles.has(TFontStyle.SubScript))
            this.h5context.scale(2, 2);
    }

    textRect(rect, x, y, text) {
        //this.save();
        //try {
            this.clipRect(rect);
            this.textOut(x, y, text);
        //} finally {
        //    this.restore();
        //}
    }

    textOutShadow(x, y, text, shadow) {
        this.h5context.shadowBlur = shadow;
        this.textOut(x, y, text);
        this.h5context.shadowBlur = 0;
    }

    textWidth(text) {
        this._requiredState(new Set([TCanvasStates.FontValid]));
        return (this.font.styles.has(TFontStyle.SuperScript) || this.font.styles.has(TFontStyle.SubScript)) ?
            Math.trunc(this.h5context.measureText(text).width / 2) : this.h5context.measureText(text).width;
    }

    textHeight() {
        return this.font.height;
    }

    /**
     * 返回字符串每个字符的宽度
     * @param {String} text 
     * @param {Number} num 
     */
    getTextExtent(text, num = 0) {
        this._requiredState(new Set([TCanvasStates.FontValid]));

        let vArr = new Array();
        let vNum = text.length;
        if ((num > 0) && (num < vNum))
            vNum = num;

        let vScript = (this.font.styles.has(TFontStyle.SuperScript) || this.font.styles.has(TFontStyle.SubScript));
        if (vScript) {
            for (let i = 0; i < vNum; i++)
                vArr[i] = Math.round(this.h5context.measureText(text.charAt(i)).width / 2);
        } else {
            for (let i = 0; i < vNum; i++)
                vArr[i] = this.h5context.measureText(text.charAt(i)).width;
        }

        return vArr;
    }

    /**
     * 返回字符串每个字符的结束位置
     * @param {*} text 
     * @param {*} len 
     */
    getTextExtentExPoint(text, len = 0) {
        this._requiredState(new Set([TCanvasStates.FontValid]));

        let vArr = new Array();
        let vNum = text.length;
        if ((len > 0) && (len < vNum))
            vNum = len;

        let vLeft = 0;
        let vW = 0;
        let vScript = (this.font.styles.has(TFontStyle.SuperScript) || this.font.styles.has(TFontStyle.SubScript));
        if (vScript) {
            for (let i = 0; i < vNum; i++) {
                vW = Math.round(this.h5context.measureText(text.charAt(i)).width / 2);
                vArr[i] = vLeft + vW;
                vLeft += vW;
            }
        } else {
            for (let i = 0; i < vNum; i++) {
                vW = this.h5context.measureText(text.charAt(i)).width;
                vArr[i] = vLeft + vW;
                vLeft += vW;
            }
        }

        return vArr;
    }

    textMetric(text) {
        let vSize = new TSize();
        vSize.width = this.textWidth(text);
        vSize.height = this.font.height;
        return vSize;
    }    

    drawImage(x, y, image) {
        this.h5context.drawImage(image, x, y);
    }

    drawImageRect(rect, image) {
        this.h5context.drawImage(image, rect.left, rect.top, rect.width, rect.height);
    }

    moveTo(x, y) {
        //this.h5context.moveTo(x, y);
        this._pfst = true;
        this._px1 = x;
        this._py1 = y;
        this._px2 = -10000;
        this._py2 = -10000;
    }

    moveToPoint(pt) {
        this.moveTo(pt.x, pt.y);
    }

    lineTo(x, y) {
        if (this._pfst)
            this._pointConnect(this._px1, this._py1, x, y);
        else
            this._pointConnect(this._px2, this._py2, x, y);
    }

    lineToPoint(pt) {
        this.lineTo(pt.x, pt.y);
    }

    drawLine(x1, y1, x2, y2,) {
        this._pfst = true;
        this._pointConnect(x1, y1, x2, y2);
    }

    drawLineByPoints(array) {
        if (array.length < 2)
            return;

        this._pfst = true;
        for (let i = 0; i < array.length - 1; i++)
            this._pointConnect(array[i].x, array[i].y, array[i + 1].x, array[i + 1].y);
    }

    drawLineDriect(x1, y1, x2, y2) {
        this.beginPath();
        this.drawLine(x1, y1, x2, y2);
        this.paintPath();
    }

    ellipseBounds(x, y, w, h) {
        this._requiredState(new Set([TCanvasStates.PenValid, TCanvasStates.BrushValid]));
        let vRx = Math.trunc(w / 2);
        let vRy = Math.trunc(h / 2);
        this.h5context.ellipse(x + vRx, y + vRy, vRx, vRy, 0, 0, Math.PI * 2);
    }

    ellipseRect(rect) {
        this.ellipseBounds(rect.left, rect.top, rect.width, rect.height);
    }

    ellipseDriect(l, t, r, b) {
        this.ellipseBoundsDriect(l, t, r - l, b - t);
    }

    ellipseBoundsDriect(x, y, w, h) {
        this.beginPath();
        this.ellipseBounds(x, y, w, h);
        if (this.brush.style != TBrushStyle.Clear)
            this.h5context.fill();

        this.paintPath();
    }

    ellipseRectDriect(rect) {
        this.ellipseBoundsDriect(rect.left, rect.top, rect.width, rect.height);
    }

    /**
     * 直接绘制多个点组成的线段
     * @param {TPoint[]} array 
     */
    drawLineByPointsDriect(array) {
        this.beginPath();
        this.drawLineByPoints(array);
        this.paintPath();
    }

    fillBounds(x, y, w, h) {
        this._requiredState(new Set([TCanvasStates.BrushValid]));
        this.h5context.fillRect(x, y, w, h);
    }

    fillRect(rect) {
        this.fillBounds(rect.left, rect.top, rect.width, rect.height);
    }

    rectangleBounds(x, y, w, h) {
        this.beginPath();
        this.drawLine(x, y, x + w - this.pen.width, y);
        this.drawLine(x + w - this.pen.width, y, x + w - this.pen.width, y + h - this.pen.width);
        this.drawLine(x + w, y + h - this.pen.width, x, y + h - this.pen.width);
        this.drawLine(x, y + h - this.pen.width, x, y);
        this.paintPath();
    }

    rectangle(l, t, r, b) {
        this.rectangleBounds(l, t, r - l, b - t);
    }

    rectangleRect(rect) {
        this.rectangle(rect.left, rect.top, rect.right, rect.bottom);
    }

    _roundRectPath(x, y, w, h, r) {
        this.h5context.moveTo(x + r, y);
        this.h5context.arcTo(x + w, y, x + w, y + h, r);
        this.h5context.arcTo(x + w, y + h, x, y + h, r);
        this.h5context.arcTo(x, y + h, x, y, r);
        this.h5context.arcTo(x, y, x + w, y, r);
        this.h5context.closePath();
    }

    roundBounds(x, y, w, h, r) {
        this.beginPath();
        this._roundRectPath(x, y, w, h, r);
        this.paintPath();
    }

    roundRect(rect, r) {
        this.roundBounds(rect.left, rect.top, rect.width, rect.height, r);
    }

    fillRoundBounds(x, y, w, h, r) {
        this._requiredState(new Set([TCanvasStates.BrushValid]));
        this.beginPath();
        this._roundRectPath(x, y, w, h, r);
        this.h5context.fill();
        if (this.pen.style != TPenStyle.Clear)
            this.paintPath();
    }

    fillRoundRect(rect, r) {
        this.fillRoundBounds(rect.left, rect.top, rect.width, rect.height, r);
    }

    fillBoundShadow(x, y, w, h, shadow, offsetX = 0, offsetY = 0) {
        this.h5context.shadowBlur = shadow; 
        this.h5context.shadowOffsetX = offsetX;
        this.h5context.shadowOffsetY = offsetY;
        this.fillBounds(x, y, w, h);
        this.h5context.shadowBlur = 0;
        this.h5context.shadowOffsetX = 0;
        this.h5context.shadowOffsetY = 0;
        // this.pen.color = "red";
        // this.pen.width = 1;
        // this.drawLineDriect(x, y, x, y + h);
    }

    fillRectShadow(rect, shadow, offsetX = 0, offsetY = 0) {
        this.fillBoundShadow(rect.left, rect.top, rect.width, rect.height, shadow, offsetX, offsetY);
    }

    scale(x, y) {
        this.scaleSize.reset(x, y);
        this.h5context.scale(x, y);
    }

    get alpha() {
        return this.h5context.globalAlpha;
    }

    set alpha(val) {
        this.h5context.globalAlpha = val;
    }

    static textWidth(font, text) {
        hclCanvasTemp.font.assign(font);
        return Math.round(hclCanvasTemp.textWidth(text));
    }

    static getTextExtent(font, text, len = 0) {
        hclCanvasTemp.font.assign(font);
        return hclCanvasTemp.getTextExtent(text, len);
    }

    static getTextExtentExPoint(font, text, len = 0) {
        hclCanvasTemp.font.assign(font);
        return hclCanvasTemp.getTextExtentExPoint(text, len);
    }

    static getCanvasTemp() {
        return hclCanvasTemp;
    }

    static pointInPath(vPointArr, pt) {
        return THCCanvas.pointInPathAt(pt.x, pt.y);
    }

    static pointInPathAt(vPointArr, x, y) {
        contextTemp.beginPath();
        contextTemp.moveTo(vPointArr[0].x, vPointArr[0].y);
        for (let i = 1; i < vPointArr.length; i++)
            contextTemp.lineTo(vPointArr[i].x, vPointArr[i].y);

        contextTemp.closePath();
        return contextTemp.isPointInPath(x, y);
    }

    static pointInEllipse(l, t, r, b, px, py) {
        return THCCanvas.pointInEllipseBounds(l, t, r - l, b - t, px, py);
    }

    static pointInEllipseBounds(x, y, w, h, px, py) {
        contextTemp.beginPath();
        let vRx = Math.trunc(w / 2);
        let vRy = Math.trunc(h / 2);
        contextTemp.ellipse(x + vRx, y + vRy, vRx, vRy, 0, 0, Math.PI * 2);
        contextTemp.closePath();
        return contextTemp.isPointInPath(px, py);
    }

    static pointInEllipseRect(rect, px, py) {
        return THCCanvas.pointInEllipseBounds(rect.left, rect.top, rect.width, rect.height, px, py);
    }
}

let canvasTemp = document.createElement("canvas");
let contextTemp = canvasTemp.getContext("2d");
let hclCanvasTemp = new THCCanvas(contextTemp);