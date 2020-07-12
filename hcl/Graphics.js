/*=======================================================

    Html Component Library 前端UI框架 V0.1
    绘图单元
    作者：荆通(18114532@qq.com)
    QQ群：649023932

=======================================================*/

import { TSize, TPoint, system, TRect, TStack } from "./System.js";
import { theme } from "./theme.js";

export class TColor {
    static colorToRGBA(color) {
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

    static rgbaToColor(r, g, b, a = 1) {
        return "rgba(" + r.toString() + ", " + g.toString() + ", " + b.toString() + ", " + a.toString() + ")";
    }

    static getColorPad(radius) {
        let vWidth = radius + radius;
        contextTemp.clearRect(0, 0, vWidth, vWidth);
        //hclCanvasTemp.brush.color = TColor.White;
        //hclCanvasTemp.fillBounds(0, 0, vWidth, vWidth);
        let vR = 255, vG = 0, vB = 0;

        let vColor = TColor.rgbaToColor(vR, vG, vB);
        hclCanvasTemp.brush.color = vColor;
        
        let vX = vWidth + 1;
        let vY = radius + 1;
        let vRect = TRect.Create(vWidth, radius, vX, vY);
        hclCanvasTemp.fillRect(vRect);

        let vPerimeter, vArc, vStep, vDegree;
        for (let i = 0; i <= vWidth; i ++) {
            vPerimeter = (vWidth - i) * Math.PI + 1;
            vArc = vPerimeter / 6;
            vStep = 255 * 6 / vPerimeter;
            for (let j = 0; j <= vPerimeter; j++) {
                vDegree = 360 / vPerimeter * j;
                vX = Math.cos(vDegree * Math.PI / 180) * (vWidth - i + 1) / 2 + radius;
                vY = Math.sin(vDegree * Math.PI / 180) * (vWidth - i + 1) / 2 + radius;

                if ((vDegree > 0) && (vDegree <= 60)) {
                    vR = 255;
                    vG = 0;
                    vB = vStep * j;
                }

                if ((vDegree > 60) && (vDegree <= 120)) {
                    if (vPerimeter / 3 / 120 * (vDegree - 60) > 1)
                        vR = 255 - vStep * (j - vArc);
                    else
                        vR = 255 - vStep * Math.abs(j - vArc);

                    vG = 0;
                    vB = 255;
                }

                if ((vDegree > 120) && (vDegree <= 180)) {
                    vR = 0;

                    if (vPerimeter / 3 / 120 * (vDegree - 120) > 1) 
                        vG = vStep * (j - 2 * vArc);
                    else
                        vG = vStep * Math.abs(j - 2 * vArc);

                    vB = 255;
                }

                if ((vDegree > 180) && (vDegree <= 240)) {
                    vR = 0;
                    vG = 255;

                    if (vPerimeter / 3 / 120 * (vDegree - 120) > 1)
                        vB = 255 - vStep * (j - vPerimeter / 2);
                    else
                        vB = 255 - vStep * Math.abs(j - vPerimeter / 2);
                }

                if ((vDegree > 240) && (vDegree <= 300)) {
                    if (vPerimeter / 3 / 120 * (vDegree - 240) > 1)
                        vR = vStep * (j - 4 * vArc);
                    else
                        vR = vStep * Math.abs(j - 4 * vArc);

                    vG = 255;
                    vB = 0;
                }

                if ((vDegree > 300) && (vDegree <= 360)) {
                    vR = 255;
                    if (vPerimeter / 3 / 120 * (vDegree - 300) > 1)
                        vG = 255 - vStep * (j - 5 * vArc);
                    else
                        vG = 255 - vStep * Math.abs(j - 5 * vArc);

                    vB = 0;
                }

                vColor = TColor.rgbaToColor(
                    Math.round(vR + (255 - vR) / vWidth * i),
                    Math.round(vG + (255 - vG) / vWidth * i),
                    Math.round(vB + (255 - vB) / vWidth * i));

                hclCanvasTemp.brush.color = vColor;

                if ((vDegree >= 0) && (vDegree <= 45)) {
                    vRect.reset(vX, vY, vX - 2, vY - 1);
                    hclCanvasTemp.fillRect(vRect);
                }

                if ((vDegree > 45) && (vDegree <= 135)) {
                    vRect.reset(vX, vY, vX - 1, vY - 2);
                    hclCanvasTemp.fillRect(vRect);
                }

                if ((vDegree > 135) && (vDegree <= 225)) {
                    vRect.reset(vX, vY, vX + 2, vY + 1);
                    hclCanvasTemp.fillRect(vRect);
                }

                if ((vDegree > 215) && (vDegree <= 315)) {
                    vRect.reset(vX, vY, vX + 1, vY + 2);
                    hclCanvasTemp.fillRect(vRect);
                }

                if ((vDegree > 315) && (vDegree <= 360)) {
                    vRect.reset(vX, vY, vX - 2, vY - 1);
                    hclCanvasTemp.fillRect(vRect);
                }
            }
        }

        return contextTemp.getImageData(0, 0, vWidth, vWidth);
    }
}

TColor.Red = "rgb(255, 0, 0)";
TColor.Green = "rgb(0, 255, 0)";
TColor.Blue = "rgb(0, 0, 255)";
TColor.Black = "rgb(0, 0, 0)";
TColor.White = "rgb(255, 255, 255)";
TColor.Gray = "gray";
TColor.Pink = "rgb(255, 192, 203)";
TColor.Crimson = "rgb(220, 20, 60)";
TColor.Violet = "rgb(238, 130, 238)";
TColor.Magenta = "rgb(255, 0, 255)";
TColor.Purple = "rgb(128, 0, 128)";
TColor.MediumBlue = "rgb(0, 0, 205)";
TColor.DarkBlue = "rgb(0, 0, 139)";
TColor.Navy = "rgb(0, 0, 128)";
TColor.Cyan = "rgb(0, 255, 255)";
TColor.Teal = "rgb(0, 128, 128)";
TColor.Lime = "rgb(0, 255, 0)";
TColor.DarkGreen = "rgb(0, 100, 0)";
TColor.Gold = "rgb(255, 215, 0)";
TColor.Orange = "rgb(255, 165, 0)";
TColor.DarkOrange = "rgb(255, 140, 0)";
TColor.OrangeRed = "rgb(255, 69, 0)";
TColor.Brown = "rgb(165, 42, 42)";
TColor.DarkRed = "rgb(139, 0, 0)";
TColor.DarkGray = "rgb(169, 169, 169)";
TColor.LightGray = "rgb(211, 211, 211)";
TColor.Silver = "rgb(192, 192, 192)";

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
        this._body = document.body;//.getElementsByTagName("body")[0];
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
            this._span.style.fontFamily = font + ',' + this._baseFonts[index];
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

    get bold() {
        return this.has(TFontStyle.Bold);
    }

    get italic() {
        return this.has(TFontStyle.Italic);
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
        this._measured = false;
        this._height = 13;
        this._ascent = 11;
        this._otmMacAscent = 0;
        this._otmMacDescent = 0;
        this._externalLeading = 2;
        this._color = TColor.Black;
        this._advCharWidth = 7;
        this._CJK = true;
        this._trueType = true;
        //this._maxCharWidth = 13;
        this._styles = new TFontStyles();
        this._styles.onChange = () => { this.doChange_(); }
        this.onColorChange = null;
    }

    _getMeasure() {
        let vSize = TFont.fontSizeToPt(this._size);
        this._measured = false;
        this._height = 0;

        switch (this._name) {
            case "宋体":
                //#region 
                this._trueType = true;
                this._CJK = true;
                this._advCharWidth = 6;
                switch (vSize) {
                    case 5:
                    case 5.5:
                        this._height = 7; this._ascent = 6;
                        break;

                    case 6.5:
                        this._height = 9; this._ascent = 8;
                        break;

                    case 7.5:
                        this._height = 10; this._ascent = 9;
                        break;

                    case 8:
                        this._height = 11; this._ascent = 9;
                        break;

                    case 9:
                        this._height = 12; this._ascent = 10;
                        break;

                    case 10:
                        this._height = 13; this._ascent = 11;
                        break;

                    case 10.5:
                        this._height = 14; this._ascent = 12;
                        break;

                    case 11:
                        this._height = 15; this._ascent = 13;
                        break;

                    case 12:
                        this._height = 16; this._ascent = 14;
                        break;

                    case 14:
                        this._height = 19; this._ascent = 16;
                        break;

                    case 15:
                        this._height = 20; this._ascent = 17;
                        break;

                    case 16:
                        this._height = 21; this._ascent = 18;
                        break;

                    case 18:
                        this._height = 24; this._ascent = 21;
                        break;

                    case 20:
                        this._height = 27; this._ascent = 23;
                        break;

                    case 22:
                        this._height = 29; this._ascent = 25;
                        break;

                    case 24:
                        this._height = 33; this._ascent = 28;
                        break;

                    case 26:
                        this._height = 35; this._ascent = 30;
                        break;

                    case 28:
                        this._height = 37; this._ascent = 32;
                        break;

                    case 36:
                        this._height = 48; this._ascent = 41;
                        break;

                    case 42:
                        this._height = 56; this._ascent = 48;
                        break;

                    case 48:
                        this._height = 64; this._ascent = 55;
                        break;

                    case 72:
                        this._height = 97; this._ascent = 83;
                        break;
                }
                break;
                //#endregion

            case "Arial":
                //#region 
                this._trueType = true;
                this._CJK = false;
                this._advCharWidth = 5;
                switch (vSize) {
                    case 5:
                    case 5.5:
                        this._height = 7; this._ascent = 6;
                        break;

                    case 6.5:
                        if (this._styles.bold) { this._height = 11; this._ascent = 9; }
                        else { this._height = 12; this._ascent = 9; }
                        break;

                    case 7.5:
                        if (this._styles.value == 3) { this._height = 11; this._ascent = 9; }
                        else if (this._styles.bold) { this._height = 12; this._ascent = 10; }
                        else { this._height = 13; this._ascent = 10; }
                        break;
                        
                    case 8:
                        if (this._styles.value == 3) { this._height = 13; this._ascent = 11; }
                        else { this._height = 14; this._ascent = 11; }
                        break;

                    case 9:
                        this._height = 15; this._ascent = 12;
                        break;

                    case 10:
                    case 10.5:
                        this._height = 16; this._ascent = 13;
                        break;

                    case 11:
                        if (this._styles.bold && !this._styles.italic) { this._height = 18; this._ascent = 14; }
                        else { this._height = 17; this._ascent = 14; }
                        break;

                    case 12:
                        if (this._styles.bold && !this._styles.italic) { this._height = 19; this._ascent = 15; }
                        else if (!this._styles.bold && this._styles.italic) { this._height = 19; this._ascent = 16; }
                        else { this._height = 18; this._ascent = 15; }
                        break;

                    case 14:
                        if (this._styles.italic) { this._height = 23; this._ascent = 18; }
                        else { this._height = 22; this._ascent = 18; }
                        break;

                    case 15:
                        if (this._styles.value == 0) { this._height = 23; this._ascent = 19; }
                        else { this._height = 24; this._ascent = 19; }
                        break;

                    case 16:
                        this._height = 24; this._ascent = 19;
                        break;

                    case 18:
                        if (this._styles.italic) { this._height = 28; this._ascent = 22; }
                        else if (this._styles.bold) { this._height = 29; this._ascent = 23; }
                        else { this._height = 27; this._ascent = 21; }
                        break;

                    case 20:
                        if (this._styles.bold && !this._styles.italic) { this._height = 32; this._ascent = 25; }
                        else if (!this._styles.bold && this._styles.italic) { this._height = 31; this._ascent = 25; } 
                        else { this._height = 32; this._ascent = 26; }
                        break;

                    case 22:
                        if (this._styles.bold || this._styles.italic) { this._height = 34; this._ascent = 27; }
                        else { this._height = 33; this._ascent = 27; }
                        break;

                    case 24:
                        if (this._styles.bold && !this._styles.italic) { this._height = 37; this._ascent = 30; }
                        else if (!this._styles.bold && this._styles.italic) { this._height = 37; this._ascent = 29; } 
                        else { this._height = 36; this._ascent = 29; }
                        break;

                    case 26:
                        if (this._styles.bold && !this._styles.italic) { this._height = 41; this._ascent = 32; }
                        else { this._height = 40; this._ascent = 32; }
                        break;

                    case 28:
                        if (this._styles.bold && !this._styles.italic) { this._height = 44; this._ascent = 35; }
                        else if (!this._styles.bold && this._styles.italic) { this._height = 43; this._ascent = 34; } 
                        else { this._height = 42; this._ascent = 34; }
                        break;

                    case 36:
                        if (this._styles.bold && !this._styles.italic) { this._height = 56; this._ascent = 45; }
                        else if (!this._styles.bold && this._styles.italic) { this._height = 55; this._ascent = 44; } 
                        else { this._height = 55; this._ascent = 45; }
                        break;

                    case 42:
                        if (!this._styles.bold && this._styles.italic) { this._height = 64; this._ascent = 51; } 
                        else { this._height = 65; this._ascent = 52; }
                        break;

                    case 48:
                        if (this._styles.italic) { this._height = 74; this._ascent = 59; }
                        else if (this._styles.bold) { this._height = 75; this._ascent = 60; } 
                        else { this._height = 72; this._ascent = 58; }
                        break;

                    case 72:
                        if (this._styles.bold && !this._styles.italic) { this._height = 111; this._ascent = 89; }
                        else if (!this._styles.bold && this._styles.italic) { this._height = 109; this._ascent = 87; }
                        else if (this._styles.bold && this._styles.italic) { this._height = 110; this._ascent = 88; } 
                        else { this._height = 107; this._ascent = 86; }
                        break;
                }
                break;
                //#endregion
        }

        this._measured = this._height > 0;
    }

    _reSetSize() {
        this._getMeasure();
        if (this._measured)
            return;

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
            //this._descent = this._height - this._ascent;
            this._advCharWidth = (this._styles.has(TFontStyle.SuperScript) || this._styles.has(TFontStyle.SubScript)) ? Math.trunc(rect.width / 2) : rect.width;
        } finally {
            //vDiv.remove();
            document.body.removeChild(vDiv);
        }
    }

    assign(src) {
        this._name = src.name;
        this._size = src.size;
        this._color = src.color;
        this._styles.value = src.styles.value;
        this._measured = src._measured;
        this._height = src.height;
        this._ascent = src.ascent;
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
        if (this._color != null)
            context.fillStyle = this._color;
        else
            context.fillStyle = theme.textColor;
    }

    contextFont() {
        return (this._styles.has(TFontStyle.Italic) ? "italic " : "")
            + (this._styles.has(TFontStyle.Bold) ? "bold " : "")
            //+ (this._measured ? this._height + "px " : this._size + "pt ") + this._name;
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

    static fontPtToSize(pt) {
        if (pt == 42) return "初号"
        else if (pt == 36) return "小初"
        else if (pt == 26) return "一号"
        else if (pt == 24) return "小一"
        else if (pt == 22) return "二号"
        else if (pt == 18) return "小二"
        else if (pt == 16) return "三号"
        else if (pt == 15) return "小三"
        else if (pt == 14) return "四号"
        else if (pt == 12) return "小四"
        else if (pt == 10.5) return "五号"
        else if (pt == 9) return "小五"
        else if (pt == 7.5) return "六号"
        else if (pt == 6.5) return "小六"
        else if (pt == 5.5) return "七号"
        else if (pt == 5) return "八号"
        else
            return pt.toString();
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
            this._CJK = (/^[\u3220-\uFA29]+$/.test(val));
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
        return this._height - this._ascent;
    }

    get externalLeading() {
        return this._externalLeading;
    }
}

export var TCapStyle = {
    Square:0,
    Butt: 1,
    Round: 2
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
        this._color = TColor.Black;
        this._style = TPenStyle.Solid;
        this._capType = TCapStyle.Square;
        this._userStyleDash = new Array(0);
    }

    assign(source) {
        this._width = source._width;
        this._color = source._color;
        this._style = source._style;
        this._capType = source._capType;
        this._userStyleDash = new Array(...source._userStyleDash);
    }

    fromContext(context) {
        this.width = context.lineWidth;
        switch (context.lineCap) {
            case "butt":
                this._capType = TCapStyle.Butt;
                break;

            case "round":
                this._capType = TCapStyle.Round;
                break;

            default:
                this._capType = TCapStyle.Square;
                break;
        }

        let vArr = context.getLineDash();
        if (vArr.length > 0)
            this._style = TPenStyle.Dash;
        else
            this._style = TPenStyle.Solid;

        this.color = context.strokeStyle;
    }

    toContext(context) {
        context.lineWidth = this._width;
        switch (this._capType) {
            case TCapStyle.Butt:
                context.lineCap = "butt";
                break;

            case TCapStyle.Round:
                context.lineCap = "round";
                break;

            default:
                context.lineCap = "square";
                break;
        }
        
        switch (this._style) {
            case TPenStyle.Dash:
                context.setLineDash([5 * this._width, 5 * this._width]);  // [实线长度, 间隙长度]可为多个如[5, 5, 10, 2]
                context.lineDashOffset = 0;
                break;

            case TPenStyle.Dot:
                context.setLineDash([4 * this._width, 2 * this._width]);
                context.lineDashOffset = 0;
                break;

            default:
                context.setLineDash([]);
                break;            
        }

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
            if (this._style != TPenStyle.Clear)
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

    static Create(context) {
        let pen = new TPen();
        pen.fromContext(context);
        return pen;
    }
}

export var TBrushStyle = {
    Solid: 0,
    Clear: 1,
    Gradient: 2
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
        } else if (this._style != TBrushStyle.Solid) {
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
        this._scale = 1;
        this._states = new Set([]);
        this._pfrist = false;  // 是lineTo时的第一个点吗
        this._px1 = -1;
        this._py1 = -1;
        this._px2 = -1;
        this._py2 = -1;
        this._pywidth = 0;
        this._brushColor = null;
        this._fontColor = null;
        this.pen = new TPen();//.Create(h5context);
        this.pen.onChange = () => { this._penChanged(); }
        this._penStack = new TStack();
        this._fontStack = new TStack();

        this.gradientBrush = null;
        this.brush = new TBrush();//.Create(h5context);
        this.brush.onChange = () => { this._brushChanged(); }
        this.brush.onColorChange = () => { this._brushColor = this.brush.color; }

        this.font = new TFont();
        this.font.onChange = () => { this._fontChanged(); }

        this.font.onColorChange = () => { this._fontColor = this.font.color; }

        this.scaleSize = TPoint.Create(1, 1);
        this.prepareConext(1);
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
                if (this.brush.style == TBrushStyle.Gradient)
                    this.h5context.fillStyle = this.gradientBrush;
            }

            if (need.has(TCanvasStates.FontValid)) {
                this.font.toContext(this.h5context);
            }

            this._states = this._states.union(need);
        } else {
            if (req.has(TCanvasStates.BrushValid) && (this._brushColor != this._fontColor)) {
                this.brush.toContext(this.h5context);
                if (this.brush.style == TBrushStyle.Gradient)
                    this.h5context.fillStyle = this.gradientBrush;
                    
                this._states = this._states.union([TCanvasStates.BrushValid]);
            }
            
            if (req.has(TCanvasStates.FontValid) && (this._brushColor != this._fontColor)) {
                this.font.toContext(this.h5context);
                this._states = this._states.union([TCanvasStates.FontValid]);
            }
        }
    }

    _pointConnect(x1, y1, x2, y2) {
        if (this.pen.style >= TPenStyle.Dash && this.pen.style <= TPenStyle.DashDotDot) {
            if (x1 == x2) {
                if (this._pfrist)
                    this.h5context.moveTo(x1 + 0.5, y1);
                else
                    this.h5context.moveTo(this._px2 + 0.5, this._py2);

                this.h5context.lineTo(x2 + 0.5, y2);
            } else if (y1 == y2) {
                if (this._pfrist)
                    this.h5context.moveTo(x1, y1 + 0.5);
                else
                    this.h5context.moveTo(this._px2, this._py2 + 0.5);

                this.h5context.lineTo(x2, y2 + 0.5);
            } else {
                if (this._pfrist)
                    this.h5context.moveTo(x1, y1);
                else
                    this.h5context.moveTo(this._px2, this._py2);

                this.h5context.lineTo(x2, y2);
            }
        } else if (x1 == x2) {  // 竖线
            let vFillStyle = this.h5context.fillStyle;
            this.h5context.fillStyle = this.h5context.strokeStyle;
            if (!this._pfrist) {
                if (this._py1 == this._py2) {  // 横转竖
                    if (x1 == Math.max(this._px1, this._px2))  // 横的右面转竖
                        this.h5context.fillRect(x1 - this.h5context.lineWidth, y1, this.h5context.lineWidth, y2 - y1);
                    else
                        this.h5context.fillRect(x1, y1, this.h5context.lineWidth, y2 - y1);
                } else
                    this.h5context.fillRect(x1, y1, this.h5context.lineWidth, y2 - y1);
            } else
                this.h5context.fillRect(x1, y1, this.h5context.lineWidth, y2 - y1);

            this.h5context.fillStyle = vFillStyle;
        } else if (y1 == y2) {  // 横线
            let vFillStyle = this.h5context.fillStyle;
            this.h5context.fillStyle = this.h5context.strokeStyle;

            if (!this._pfrist) {
                if (this._px1 == this._px2) {  // 原来是竖要转横
                    if (x2 < x1)  // 竖左转横
                        this.h5context.fillRect(x1 + this._pywidth, y1, x2 - x1 - this._pywidth, this.h5context.lineWidth);
                    else  // 竖右转横
                        this.h5context.fillRect(x1 - this._pywidth, y1, x2 - x1 + this._pywidth, this.h5context.lineWidth);
                } else
                    this.h5context.fillRect(x1, y1, x2 - x1, this.h5context.lineWidth);
            } else
                this.h5context.fillRect(x1, y1, x2 - x1, this.h5context.lineWidth);
            
            this.h5context.fillStyle = vFillStyle;
        } else {  // 斜线
            if (this._pfrist)
                this.h5context.moveTo(x1, y1);
            else
                this.h5context.moveTo(this._px2, this._py2);

            this.h5context.lineTo(x2, y2);
        }

        this._px1 = x1;
        this._py1 = y1;
        this._px2 = x2;
        this._py2 = y2;
        this._pywidth = this.h5context.lineWidth;
        this._pfrist = false;
    }

    prepareConext(scale) {  // h5Canvas改变width或height等属性时，会恢复context的属性为默认值
        this._scale = scale;
        this.h5context.scale(scale, scale);
        this.h5context.shadowColor = "black";
        this.h5context.textBaseline = "top";  // 文本基线，em方框的顶端
        this.h5context.textAlign = "left";  // 文本于横坐标的对齐方式，左对齐
        this.h5context.lineCap = "square";  // 向线条的每个末端添加正方形线帽 butt|round|square
        this.h5context.setLineDash([]);
        this.h5context.lineDashOffset = 0;
        this.h5context.font = "10pt 宋体";
        this.font.name = "宋体";
        this.font.size = 10;
        this.font.styles.clear();
        this._states.clear();
    }

    // refresh() {
    //     this._states.clear();
    // }

    save() {
        this.h5context.save();
        let vPen = new TPen();
        vPen.assign(this.pen);
        this._penStack.push(vPen);
        let vFont = new TFont();
        vFont.assign(this.font);
        this._fontStack.push(vFont);
    }

    restore() {
        this.h5context.restore();
        let vPen = this._penStack.pop();
        this.pen.assign(vPen);
        let vFont = this._fontStack.pop();
        this.font.assign(vFont);
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
        this.h5context.drawImage(vH5Canvas, x, y, w, h, srcx / this._scale, srcy / this._scale, srcw / this._scale, srch / this._scale);
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

    drawImageData(data, x, y, w, h) {
        contextTemp.putImageData(data, 0, 0);
        this.bitBlt(x, y, w, h, hclCanvasTemp, 0, 0, w, h);
    }

    createLinearGradient(x0, y0, x1, y1) {
        return this.h5context.createLinearGradient(x0, y0, x1, y1);
    }

    beginPath() {
        this._requiredState(new Set([TCanvasStates.PenValid]));
        this.h5context.beginPath();
    }

    closePath() {
        this.h5context.closePath();
    }

    paintPath() {
        this.h5context.stroke();
    }

    textOut(x, y, text) {
        this._requiredState(new Set([TCanvasStates.FontValid]));  // Bold、Italic
        if (this.font.styles.has(TFontStyle.SuperScript)) {
            this.h5context.scale(0.5, 0.5);
            x += x;
            y += y;
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
        this.save();
        try {
            this.clipRect(rect);
            this.textOut(x, y, text);
        } finally {
           this.restore();
        }
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

    /**
     * 返回图片的Base64编码
     * @param {*} type 图片格式 
     */
    toImage(type) {
        return this.h5context.canvas.toDataURL("image/" + type ? "png" : type);
    }

    moveTo(x, y) {
        //this.h5context.moveTo(x, y);
        this._pfrist = true;
        this._px1 = x;
        this._py1 = y;
        this._px2 = -10000;
        this._py2 = -10000;
    }

    moveToPoint(pt) {
        this.moveTo(pt.x, pt.y);
    }

    lineTo(x, y) {
        if (this._pfrist)
            this._pointConnect(this._px1, this._py1, x, y);
        else
            this._pointConnect(this._px2, this._py2, x, y);
    }

    lineToPoint(pt) {
        this.lineTo(pt.x, pt.y);
    }

    drawLine(x1, y1, x2, y2,) {
        //if (!this._pfrist)
        //    this._pfrist = !(((x1 == this._px1) && (y1 == this._py1)) || ((x2 == this._px1) && (y2 == this._py1))
        //        || ((x1 == this._px2) && (y1 == this._py2)) || ((x2 == this._px2) && (y2 == this._py2)));            
        this._pfrist = true;
        this._pointConnect(x1, y1, x2, y2);
    }

    drawLineByPoints(array) {
        if (array.length < 2)
            return;

        this._pfrist = true;
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
        // let a = w / 2;
        // let b = h / 2;
        // let vX = x + a, vY = y + b;
        // let step = (a > b) ? 1 / a : 1 / b;  // 增加的度数
        // this.h5context.beginPath();
        // this.h5context.moveTo(vX + a, vY); //从椭圆的左端点开始绘制
        // for (let i = 0; i < 2 * Math.PI; i += step) {
        //     //参数方程为x = a * cos(i), y = b * sin(i)，
        //     //参数为i，表示度数（弧度）
        //     this.h5context.lineTo(vX + a * Math.cos(i), vY + b * Math.sin(i));
        // }
        // this.h5context.closePath();
        // this.h5context.stroke();
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
        this.paintPath();
        if (this.brush.style != TBrushStyle.Clear)
            this.h5context.fill();
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
    }

    roundBounds(x, y, w, h, r) {
        this.beginPath();
        this._roundRectPath(x, y, w, h, r);
        this.paintPath();
    }

    roundRect(rect, r) {
        this.roundBounds(rect.left, rect.top, rect.width, rect.height, r);
    }

    fillBounds(x, y, w, h) {
        if (this.brush.style != TBrushStyle.Clear) {
            this._requiredState(new Set([TCanvasStates.BrushValid]));
            this.h5context.fillRect(x, y, w, h);
        }
    }

    fillRect(rect) {
        this.fillBounds(rect.left, rect.top, rect.width, rect.height);
    }    

    fillRoundBounds(x, y, w, h, r) {
        this._requiredState(new Set([TCanvasStates.BrushValid]));
        this.beginPath();
        this._roundRectPath(x, y, w, h, r);
        this.closePath();
        this.h5context.fill();
        if (this.pen.style != TPenStyle.Clear)
            this.paintPath();
            //this.h5context.stroke();
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

    fillEllipseRect(rect) {
        this.fillEllipseBounds(rect.left, rect.top, rect.width, rect.height);
    }

    fillEllipseBounds(x, y, w, h) {
        // 可能不能用this.h5context.ellipse，得用线条绘制以实现有效的path
        this._requiredState(new Set([TCanvasStates.PenValid, TCanvasStates.BrushValid]));
        let vRx = Math.trunc(w / 2);
        let vRy = Math.trunc(h / 2);
        this.beginPath();
        this.h5context.ellipse(x + vRx, y + vRy, vRx, vRy, 0, 0, Math.PI * 2);
        this.closePath();
        this.h5context.fill();
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
        if (font != null)
            hclCanvasTemp.font.assign(font);
        else
            hclCanvasTemp.font.assign(THCCanvas.DefaultFont);

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

    static _setViewSize_(w, h) {
        canvasTemp.width = w;
        canvasTemp.height = h;
        hclCanvasTemp.prepareConext(1);
        //canvasTemp.style.position = "absolute";
        //canvasTemp.style.left = "0px";
        //canvasTemp.style.top = "0px";
        //canvasTemp.style.imeMode = "active";        
    }

    static CreateTemp(w, h) {
        let vTemp = document.createElement("canvas");
        vTemp.width = w;
        vTemp.height = h;
        let vContext = vTemp.getContext("2d");
        return new THCCanvas(vContext);
    }

    static DestroyTemp(hcCanvas) {
        hcCanvas.h5context.canvas.remove();
    }
}

THCCanvas.DefaultFont = new TFont();

let canvasTemp = document.createElement("canvas");
let contextTemp = canvasTemp.getContext("2d");
let hclCanvasTemp = new THCCanvas(contextTemp);