import { TRect, system } from "../hcl/System.js";
import { TColor } from "../hcl/Graphics.js";

export var THCCode128Encoding = {
    None: 0,
    A: 1,
    B: 2,
    C: 3,
    AorB: 4
}

var TCodeLineType = {
    White: 0,
    Black: 1,
    BlackHalf: 2,
    BlackTrack: 3,
    BlackAscend: 4,
    BlackDescend: 5
}

const table128 = [
    //a,  b,   c,    data
    [" ", " ", "00", "212222"], 
    ["!", "!", "01", "222122"],  
    ["\"", "\"", "02", "222221"],
     ["#", "#", "03", "121223"],
    ["$", "$", "04", "121322"],
    ["%", "%", "05", "131222"],
    ["&", "&", "06", "122213"],
    ["'", "'", "07", "122312"],
    ["(", "(", "08", "132212"],
    [")", ")", "09", "221213"],
    ["*", "*", "10", "221312"],
    ["+", "+", "11", "231212"],
    [",", ",", "12", "112232"],
    ["-", "-", "13", "122132"],
    [".", ".", "14", "122231"],
    ["/", "/", "15", "113222"],
    ["0", "0", "16", "123122"],
    ["1", "1", "17", "123221"],
    ["2", "2", "18", "223211"],
    ["3", "3", "19", "221132"],
    ["4", "4", "20", "221231"],
    ["5", "5", "21", "213212"],
    ["6", "6", "22", "223112"],
    ["7", "7", "23", "312131"],
    ["8", "8", "24", "311222"],
    ["9", "9", "25", "321122"],
    [":", ":", "26", "321221"],
    [";", ";", "27", "312212"],
    ["<", "<", "28", "322112"],
    ["=", "=", "29", "322211"],
    [">", ">", "30", "212123"],
    ["?", "?", "31", "212321"],
    ["@", "@", "32", "232121"],
    ["A", "A", "33", "111323"],
    ["B", "B", "34", "131123"],
    ["C", "C", "35", "131321"],
    ["D", "D", "36", "112313"],
    ["E", "E", "37", "132113"],
    ["F", "F", "38", "132311"],
    ["G", "G", "39", "211313"],
    ["H", "H", "40", "231113"],
    ["I", "I", "41", "231311"],
    ["J", "J", "42", "112133"],
    ["K", "K", "43", "112331"],
    ["L", "L", "44", "132131"],
    ["M", "M", "45", "113123"],
    ["N", "N", "46", "113321"],
    ["O", "O", "47", "133121"],
    ["P", "P", "48", "313121"],
    ["Q", "Q", "49", "211331"],
    ["R", "R", "50", "231131"],
    ["S", "S", "51", "213113"],
    ["T", "T", "52", "213311"],
    ["U", "U", "53", "213131"],
    ["V", "V", "54", "311123"],
    ["W", "W", "55", "311321"],
    ["X", "X", "56", "331121"],
    ["Y", "Y", "57", "312113"],
    ["Z", "Z", "58", "312311"],
    ["[", "[", "59", "332111"],
    ["\\", "\\", "60", "314111"],
    ["]", "]", "61", "221411"],
    ["^", "^", "62", "431111"],
    ["_", "_", "63", "111224"],
    [String.fromCharCode(0), "`", "64", "111422"],
    [String.fromCharCode(1), "a", "65", "121124"],
    [String.fromCharCode(2), "b", "66", "121421"],
    [String.fromCharCode(3), "c", "67", "141122"],
    [String.fromCharCode(4), "d", "68", "141221"],
    [String.fromCharCode(5), "e", "69", "112214"],
    [String.fromCharCode(6), "f", "70", "112412"],
    [String.fromCharCode(7), "g", "71", "122114"],
    [String.fromCharCode(8), "h", "72", "122411"],
    [String.fromCharCode(9), "i", "73", "142112"],
    [String.fromCharCode(10), "j", "74", "142211"],
    [String.fromCharCode(11), "k", "75", "241211"],
    [String.fromCharCode(12), "l", "76", "221114"],
    [String.fromCharCode(13), "m", "77", "413111"],
    [String.fromCharCode(14), "n", "78", "241112"],
    [String.fromCharCode(15), "o", "79", "134111"],
    [String.fromCharCode(16), "p", "80", "111242"],
    [String.fromCharCode(17), "q", "81", "121142"],
    [String.fromCharCode(18), "r", "82", "121241"],
    [String.fromCharCode(19), "s", "83", "114212"],
    [String.fromCharCode(20), "t", "84", "124112"],
    [String.fromCharCode(21), "u", "85", "124211"],
    [String.fromCharCode(22), "v", "86", "411212"],
    [String.fromCharCode(23), "w", "87", "421112"],
    [String.fromCharCode(24), "x", "88", "421211"],
    [String.fromCharCode(25), "y", "89", "212141"],
    [String.fromCharCode(26), "z", "90", "214121"],
    [String.fromCharCode(27), "{", "91", "412121"],
    [String.fromCharCode(28), "|", "92", "111143"],
    [String.fromCharCode(29), "}", "93", "111341"],
    [String.fromCharCode(30), "~", "94", "131141"],
    [String.fromCharCode(31), " ", "95", "114113"],
    [" ", " ", "96", "114311"],
    [" ", " ", "97", "411113"],
    [" ", " ", "98", "411311"],
    [" ", " ", "99", "113141"],
    [" ", " ", "  ", "114131"],
    [" ", " ", "  ", "311141"],
    [" ", " ", "  ", "411131"],
    [" ", " ", "  ", "211412"],
    [" ", " ", "  ", "211214"],
    [" ", " ", "  ", "211232"]
]

export class THCCode128 {
    constructor(text) {
        this.FModul = 1;
        this.FZoom = 1;
        this.FWidth = 1;
        this.FHeight = 100;
        this.FModules = new Array(4);
        this.FText = "";
        this.FCode = "";
        this.FTextVisible = true;
        this.onWidthChanged = null;
        this.SetText(text);
    }

    
    IsDigit(char) {
        //let v = c.charCodeAt();
        //return (v >= '0'.charCodeAt()) && (v <= '9'.charCodeAt());
        return (char >= 0) && (char <= 9);
    }

    IsFourOrMoreDigits(code, index, anumDigits) {
        anumDigits = 0;
        let vLen = code.length;
        if (this.IsDigit(code[index]) && (index + 4 < vLen)) {
            while ((index + anumDigits < vLen) && this.IsDigit(code[index + anumDigits]))
                anumDigits++;
        }

        return {
            numDigits: anumDigits,
            result: anumDigits >= 4
        }
    }

    FindCodeA(char) {
        for (let i = 0, vLen = table128.length; i < vLen; i++) {
            if (char == table128[i][0])
                return i;
        }

        return -1;
    }

    FindCodeB(char) {
        for (let i = 0, vLen = table128.length; i < vLen; i++) {
            if (char == table128[i][1])
                return i;
        }

        return -1;
    }

    FindCodeC(code) {
        for (let i = 0, vLen = table128.length; i < vLen; i++) {
            if (code == table128[i][2])
                return i;
        }

        return -1;
    }

    GetNextChar(code, aindex, aencoding) {
        let vLen = code.length - 1;
        if (aindex > vLen) {
            return {
                index: aindex,
                encoding: aencoding,
                result: ""
            }
        }

        let vResult = "", vC = "";
        if ((code[aindex] == "&") && (aindex + 2 <= vLen) && (code[aindex + 2] == ";")) {
            vC = code[aindex + 1].toUpperCase ();
            if ((vC == "A") || (vC == "B") || (vC == "C") || (vC == "S") || (vC == "1") || (vC == "2") || (vC == "3") || (vC == "4")) {
                aindex += 3;
                vResult = "&" + vC + ";";
                return {
                    index: aindex,
                    encoding: aencoding,
                    result: vResult
                }
            }
        }

        if ((aencoding == THCCode128Encoding.C) && (aindex + 1 <= vLen)) {
            vResult = code.substr(aindex, 2);
            aindex += 2;
            return {
                index: aindex,
                encoding: aencoding,
                result: vResult
            }
        }

        vResult = code.substr(aindex, 1);
        aindex++;

        return {
            index: aindex,
            encoding: aencoding,
            result: vResult
        }
    }

    StripControlCodes(code, stripFNCodes) {
        let vResult = "";
        let vIndex = 0, vLen = code.length;
        let vEncoding = THCCode128Encoding.None;
        let vNextChar, vInfo;
        
        while (vIndex < vLen) {
            vInfo = this.GetNextChar(code, vIndex, vEncoding);
            vNextChar = vInfo.result;
            vIndex = vInfo.index;
            vEncoding = vInfo.encoding;
            if ((vNextChar != "&A;") && (vNextChar != "&B;") && (vNextChar != "&C;") && (vNextChar != "&S;")) {
                if ((!stripFNCodes) || ((vNextChar != "&1;") && (vNextChar != "&2;") && (vNextChar != "&3;") && (vNextChar != "&4;")))
                    vResult = vResult + vNextChar;
            }
        }

        return vResult;
    }

    GetNextPortion(code, aindex, aencoding) {
        let vLen = code.length;
        if (aindex > vLen - 1) {
            return {
                index: aindex,
                encoding: aencoding,
                result: ""
            }
        }

        let vIndexa, vIndexb, numDigits, numChars;
        let firstCharEncoding, nextCharEncoding;
        let prefix, vC = "";
        let vResult = "";
        
        if ((code[aindex] == "&") && (aindex + 2 < vLen) && (code[aindex + 2] == ";")) {
            vC = code[aindex + 1].toUpperCase();
            if ((vC == "A") || (vC == "B") || (vC == "C") || (vC == "S") || (vC == "1") || (vC == "2") || (vC == "3") || (vC == "4")) {
                vC = code.substr(aindex, 3);
                aindex += 3;
            } else
                vC = "";
        }

        vIndexa = this.FindCodeA(code[aindex]);
        vIndexb = this.FindCodeB(code[aindex]);
        firstCharEncoding = THCCode128Encoding.A;
        if ((vIndexa == -1) && (vIndexb != -1))
            firstCharEncoding = THCCode128Encoding.B;
        else if ((vIndexa != -1) && (vIndexb != -1))
            firstCharEncoding = THCCode128Encoding.AorB;

        numDigits = 0;
        let vInfo = this.IsFourOrMoreDigits(code, aindex, numDigits);
        numDigits = vInfo.numDigits;

        if (vInfo.result)
            firstCharEncoding = THCCode128Encoding.C;

        if (firstCharEncoding == THCCode128Encoding.C) {
            numDigits = parseInt(numDigits / 2) * 2;
            vResult = code.substr(aindex, numDigits);
            aindex += numDigits;
            if (aencoding != THCCode128Encoding.C)
                vResult = "&C;" + vC + vResult;
            else
                vResult = vC + vResult;

            aencoding = THCCode128Encoding.C;
            
            return {
                index: aindex,
                encoding: aencoding,
                result: vResult
            }
        }

        numChars = 1;
        while (aindex + numChars < vLen) {
            vIndexa = this.FindCodeA(code[aindex + numChars]);
            vIndexb = this.FindCodeB(code[aindex + numChars]);
            nextCharEncoding = THCCode128Encoding.A;
            if ((vIndexa == -1) && (vIndexb != -1))
                nextCharEncoding = THCCode128Encoding.B;
            else if ((vIndexa != -1) && (vIndexb != -1))
                nextCharEncoding = THCCode128Encoding.AorB;

            vInfo = this.IsFourOrMoreDigits(code, aindex + numChars, numDigits);
            numDigits = vInfo.numDigits;
            if (vInfo.result)
                nextCharEncoding = THCCode128Encoding.C;

            if ((nextCharEncoding != THCCode128Encoding.C) && (nextCharEncoding != firstCharEncoding)) {
                if (firstCharEncoding == THCCode128Encoding.AorB)
                    firstCharEncoding = nextCharEncoding;
                else if (nextCharEncoding == THCCode128Encoding.AorB)
                    nextCharEncoding = firstCharEncoding;
            }

            if (firstCharEncoding != nextCharEncoding)
                break;
            
            numChars++;
        }

        if (firstCharEncoding == THCCode128Encoding.AorB)
            firstCharEncoding = THCCode128Encoding.B;

        if (firstCharEncoding == THCCode128Encoding.A)
            prefix = "&A;";
        else
            prefix = "&B;";
        
        if ((aencoding != firstCharEncoding) && (numChars == 1) 
            && ((aencoding == THCCode128Encoding.A) || (aencoding == THCCode128Encoding.B))
            && ((firstCharEncoding == THCCode128Encoding.A) || (firstCharEncoding == THCCode128Encoding.B)))
            prefix = "&S;";
        else
            aencoding = firstCharEncoding;

        vResult = prefix + vC + code.substr(aindex, numChars);
        aindex += numChars;

        return {
            index: aindex,
            encoding: aencoding,
            result: vResult
        }
    }

    Encode(code) {
        code = this.StripControlCodes(code, false);
        let vResult = "";
        let vIndex = 0;
        let vEncoding = THCCode128Encoding.None;
        let vLen = code.length;
        let vInfo;
        while (vIndex < vLen) {
            vInfo = this.GetNextPortion(code, vIndex, vEncoding);
            vIndex = vInfo.index;
            vEncoding = vInfo.encoding;
            vResult = vResult + vInfo.result;
        }

        return vResult;
    }

    Convert(s) {
        let vResult = "", v;
        for (let i = 0, vLen = s.length; i < vLen; i++) {
            v = s[i].charCodeAt() - 1;
            if (!system.isOdd(i))
                v += 5;

            vResult += String.fromCharCode(v);
        }

        return vResult;
    }

    GetCode(text) {
        text = text.replace(/&FNC1;/g, "&1;");
        text = this.Encode(text);
        let vEncoding = THCCode128Encoding.None;
        let vIndex = 0, vChecksum, vCodewordPos, vIdx;
        let vInfo = this.GetNextChar(text, vIndex, vEncoding);
        vIndex = vInfo.index;
        vEncoding = vInfo.encoding;
        let nextChar = vInfo.result;
        let startCode = "";
      
        if (nextChar == "&A;") {
            vEncoding = THCCode128Encoding.A;
            vChecksum = 103;
            startCode = table128[103][3];
        } else if (nextChar == "&B;") {
            vEncoding = THCCode128Encoding.B;
            vChecksum = 104;
            startCode = table128[104][3];
        } else if (nextChar == "&C;") {
            vEncoding = THCCode128Encoding.C;
            vChecksum = 105;
            startCode = table128[105][3];
        } else
            system.exception("无效的条码内容！");
      
        let vResult = startCode;
        vCodewordPos = 1;
      
        let vLen = text.length;
        while (vIndex < vLen) {
            vInfo = this.GetNextChar(text, vIndex, vEncoding);
            vIndex = vInfo.index;
            vEncoding = vInfo.encoding;
            nextChar = vInfo.result;
      
            if (nextChar == "&A;") {
                vEncoding = THCCode128Encoding.A;
                vIdx = 101;
            } else if (nextChar == "&B;") {
                vEncoding = THCCode128Encoding.B;
                vIdx = 100;
            } else if (nextChar == "&C;") {
                vEncoding = THCCode128Encoding.C;
                vIdx = 99;
            } else if (nextChar == "&S;") {
                if (vEncoding == THCCode128Encoding.A) 
                    vEncoding = THCCode128Encoding.B;
                else
                    vEncoding = THCCode128Encoding.A;
                
                vIdx = 98;
            } else if (nextChar == "&1;")
                vIdx = 102;
            else if (nextChar == "&2;")
                vIdx = 97;
            else if (nextChar == "&3;")
                vIdx = 96;
            else if (nextChar == "&4;") {
                if (vEncoding == THCCode128Encoding.A)
                    vIdx = 101;
                else
                    vIdx = 100;
            } else {
                if (vEncoding == THCCode128Encoding.A)
                    vIdx = this.FindCodeA(nextChar[0]);
                else if (vEncoding == THCCode128Encoding.B)
                    vIdx = this.FindCodeB(nextChar[0]);
                else
                    vIdx = this.FindCodeC(nextChar);
            }
        
            if (vIdx < 0)
                system.exception("无效的条码内容！");
        
            vResult = vResult + table128[vIdx][3];
            vChecksum += vIdx * vCodewordPos;
            vCodewordPos++;
        
            if (nextChar == "&S;") {
                if (vEncoding == THCCode128Encoding.A)
                    vEncoding = THCCode128Encoding.B;
                else
                    vEncoding = THCCode128Encoding.A;
            }
        }
      
        vChecksum = vChecksum % 103;
        vResult = vResult + table128[vChecksum][3];
        vResult = vResult + "2331112";
        vResult = this.Convert(vResult);
        return vResult;
    }

    OneBarProps(code) {
        let vW = 0, vLT;
        switch (code) {
            case '0': 
                vW = this.FModules[0];
                vLT = TCodeLineType.White;
                break;

            case '1':
                vW = this.FModules[1];
                vLT = TCodeLineType.White;
                break;

            case '2':
                vW = this.FModules[2];
                vLT = TCodeLineType.White;
                break;

            case '3':
                vW = this.FModules[3];
                vLT = TCodeLineType.White;
                break;

            case '5':
                vW = this.FModules[0];
                vLT = TCodeLineType.Black;
                break;

            case '6':
                vW = this.FModules[1];
                vLT = TCodeLineType.Black;
                break;

            case '7':
                vW = this.FModules[2];
                vLT = TCodeLineType.Black;
                break;

            case '8':
                vW = this.FModules[3];
                vLT = TCodeLineType.Black;
                break;

            case 'A':
                vW = this.FModules[0];
                vLT = TCodeLineType.BlackHalf;
                break;

            case 'B':
                vW = this.FModules[1];
                vLT = TCodeLineType.BlackHalf;
                break;

            case 'C':
                vW = this.FModules[2];
                vLT = TCodeLineType.BlackHalf;
                break;

            case 'D':
                vW = this.FModules[3];
                vLT = TCodeLineType.BlackHalf;
                break;

            case 'F':
                vW = this.FModules[0];
                vLT = TCodeLineType.BlackTrack;
                break;

            case 'G':
                vW = this.FModules[0];
                vLT = TCodeLineType.BlackAscend;
                break;

            case 'H':
                vW = this.FModules[0];
                vLT = TCodeLineType.BlackDescend;
                break;
            default:
                system.exception("HCCode128计算宽度出错！")
                break;
        }

        return {
            w: vW,
            lineType: vLT
        }
    }

    GetBarWidth(code) {
        this.FModules[0] = this.FModul;
        this.FModules[1] = this.FModul * 2;  // 2为宽条宽度
        this.FModules[2] = parseInt(this.FModules[1] * 3 / 2);
        this.FModules[3] = this.FModules[1] * 2;

        let vResult = 0, vInfo;
        for (let i = 0, vLen = code.length; i < vLen; i++) {
            vInfo = this.OneBarProps(code[i]);
            vResult += vInfo.w;
        }

        return vResult;
    }

    PaintTo(hclCanvas, rect) {
        let vInfo, vX = 0, vLineType, vHeight = this.Height;
        if (this.FTextVisible)
            vHeight -= 12;

        let vRect = new TRect();
        for (let i = 0, vLen = this.FCode.length; i < vLen; i++) {
            vLineType = TCodeLineType.White;
            vInfo = this.OneBarProps(this.FCode[i]);
            vLineType = vInfo.lineType;
            if (vLineType != TCodeLineType.White)
                hclCanvas.brush.color = TColor.Black;
            else
                hclCanvas.brush.color = TColor.White;
    
            vRect.reset(vX, 0, vX + vInfo.w * this.FZoom, vHeight);
            vX = vRect.right;
            vRect.offset(rect.left, rect.top);
            hclCanvas.fillRect(vRect);
            
        }

        if (this.FCode == "") {
            hclCanvas.pen.width = 1;
            hclCanvas.pen.color = TColor.Black;
            hclCanvas.rectangleRect(rect);
        }

        if (this.FTextVisible) {
            hclCanvas.font.size = 8;
            hclCanvas.font.styles.clear();
            hclCanvas.font.name = "Arial";
            hclCanvas.font.color = TColor.Black;
            if (this.FCode != "") {
                hclCanvas.textOut(rect.left + (rect.width - hclCanvas.textWidth(this.FText)) / 2,
                    rect.top + vHeight + 2, this.FText);
            } else {
                hclCanvas.textOut(rect.left + Math.trunc((rect.width - hclCanvas.textWidth("无效条码" + this.FText)) / 2),
                    rect.top + Math.trunc((rect.height - hclCanvas.font.height) / 2), "无效条码" + this.FText);
            }
        }
    }

    _calcWidth() {
        let vW;
        if (this.FCode != "")
            vW = this.GetBarWidth(this.FCode) * this.FZoom;
        else
            vW = 60;

        if (vW != this.FWidth) {
            this.FWidth = vW;
            if (this.onWidthChanged != null)
                this.onWidthChanged();
        }
    }

    SetText(val) {
        if (this.FText != val) {
            this.FText = val;
            try {
                this.FCode = this.GetCode(this.FText);
            } catch (e) {
                this.FCode = "";
            }

            this._calcWidth();
        }
    }

    SetZoom(val) {
        if (this.FZoom != val) {
            this.FZoom = val;
            this._calcWidth();
        }
    }

    get Text() {
        return this.FText;
    }
     
    set Text(val) {
        this.SetText(val);
    }

    get TextVisible() {
        return this.FTextVisible;
    }

    set TextVisible(val) {
        this.FTextVisible = val;
    }

    get Width() {
        return this.FWidth;
    }

    get Height() {
        return this.FHeight;
    }

    set Height(val) {
        this.FHeight = val;
    }

    get Zoom() {
        return this.FZoom;
    }

    set Zoom(val) {
        this.SetZoom(val);
    }
}