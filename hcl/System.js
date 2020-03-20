export var TCharSet = {
    Ansi: 0,
    Unicode: 1,
    GBK2312: 2
}

export var TEncode = {
    Asni: 0,
    Utf8: 1,
    Utf16: 2
}

export class TFileType {

}

TFileType.XML = "application/xml";
TFileType.DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
TFileType.PNG = "image/png";
TFileType.BMP = "application/x-bmp";
TFileType.JPEG = "image/jpeg";
TFileType.IMAGE = TFileType.PNG + "," + TFileType.JPEG + "," + TFileType.BMP;

/**
 * HCL类：系统类(已实例化为system，无需重复实例化)
 */
class TSystem {
    getDPI() {
        let vDPI = {};
        if (window.screen.deviceXDPI != undefined ) {
            vDPI.x = window.screen.deviceXDPI;
            vDPI.y = window.screen.deviceYDPI;
        }
        else {
            let vNode = document.createElement("div");
            vNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
            document.body.appendChild(vNode);
            vDPI.x = parseInt(vNode.offsetWidth);
            vDPI.y = parseInt(vNode.offsetHeight);
            vNode.parentNode.removeChild(vNode);
        }
        
        return vDPI;
    }

    isOdd(n) {
        return (n & 1) == 1 ? true : false;
    }

    tryParseInt(val) {
        let vI = 0;
        let vResult = false;
        try {
            vI = parseInt(val);
            vResult = true;
        } catch (e) {
            vResult = false;
        }
        
        return {
            value: vI,
            ok: vResult
        }
   }

    openURL(url) {
        window.open(url);
    }

    /**
     * 是否是数字（正负整数、浮点数、0）
     * @param {*} val 
     */
    isNumber(val){
        let regPos = /^\d+(\.\d+)?$/;  // 非负浮点数
        let regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/;  // 负浮点数
        if (regPos.test(val) || regNeg.test(val))
            return true;
        else
            return false;   
    }

    assigned(obj) {
        return obj != null;
    }

    beep() { }

    exception(msg) {
        throw "HCL异常:" + msg;
    }

    log(msg) {
        console.log(msg);
    }
}

/**
 * HCL实例：系统类的实例
 */
export let system = new TSystem();

export class TBytes extends Array {
    constructor(len) {
        super(len);
    }

    static fromBase64(base64) {
        let vRawData = window.atob(base64);  // atob仅windows下？
        let vBytes = new TBytes(vRawData.length);
        //let vBytes = new Uint8Array(vRawData.length);
        for (let i = 0; i < vRawData.length; ++i)
            vBytes[i] = vRawData.charCodeAt(i);

        return vBytes;
    }

    toText() {
        return String.fromCharCode.apply(null, new Uint16Array(this));
    }

    toBase64() {
        let vS = this.toText();
        return window.btoa(vS);
    }
}

class TEncoding {
    constructor(){
        if (this.constructor.prototype === TEncoding.prototype)
            system.exception("TEncoding类为抽象类，不可直接实例使用！");

        if (typeof this.getByteCount !== "function")
            system.exception(this.prototype + " 没有实现getByteCount方法！");

        if (typeof this.getBytes !== "function")
            system.exception(this.prototype + " 没有实现getBytes方法！");

        if (typeof this.getString !== "function")
            system.exception(this.prototype + " 没有实现getString方法！");
    }
}

export class TAnsiEncoding extends TEncoding {
    constructor() {
        super();
    }
}

export class TUtf8Encoding extends TEncoding {
    constructor() {
        super();
    }

    getByteCount(str) {
        let vCharCode, vResult = 0;
        for (let i = 0, vLen = str.lenght; i < vLen; i++) {
            vCharCode = str.charCodeAt(i);
        if (vCharCode >= 0 && vCharCode <= 0x7f)
            vResult += 1;
        else if (vCharCode >= 0x80 && vCharCode <= 0x7ff)
            vResult += 2;
        else if (vCharCode >= 0x800 && vCharCode <= 0xffff)
            vResult += 3;
        else if (vCharCode > 0x10000 && vCharCode <= 0x1FFFFF)
            vResult += 4;
        else if (vCharCode > 0x200000 && vCharCode <= 0x3FFFFFF)
            vResult += 5;
        else if (vCharCode > 0x4000000 && vCharCode <= 0x7FFFFFFF)
            vResult += 6;
        }

        return vResult;
    }

    static getString(bytes) {
        let vUInt8Arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
        let vUInt16Arr = new Uint16Array(vUInt8Arr.buffer);
        return String.fromCharCode.apply(null, vUInt16Arr);
    }    
}

export class TUtf16Encoding extends TEncoding {
    constructor(){
        super();
    }

    static getBytes(str) {
        let vArr = new TBytes(0), vCharCode;
        for (let i = 0, vLen = str.length; i < vLen; i++) {
            vCharCode = str.charCodeAt(i);
            if (vCharCode <= 0xffff) {
                vArr.push(vCharCode & 0xFF);
                vArr.push(vCharCode >> 8);
            } else {
                vArr.push(vCharCode & 0xFF);
                vArr.push((vCharCode & 0xFF00) >> 8);
                vArr.push((vCharCode & 0xFF0000) >> 16);
                vArr.push((vCharCode & 0xFF000000) >> 24);
            }
        }

        return vArr;
    }

    static getByteCount(str) {
        let vCharCode, vResult = 0;
        for (let i = 0, vLen = str.length; i < vLen; i++) {
            vCharCode = str.charCodeAt(i);
            if (vCharCode <= 0xffff)
                vResult += 2;
            else
                vResult += 4;
        }

        return vResult;
    }

    static getString(bytes) {
        let vUInt8Arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
        let vUInt16Arr = new Uint16Array(vUInt8Arr.buffer);
        return String.fromCharCode.apply(null, vUInt16Arr);
    }    

    static toUtf8(str) {
        let vUtf8Arr = new TBytes(0), vCharCode;
        //let vSize = 0;
        for (let i = 0, vLen = str.lenght; i < vLen; i++) {
            vCharCode = str.charCodeAt(i);
            if (vCharCode >= 0x00 && vCharCode <= 0x7f) {
                //vSize += 1;
                vUtf8Arr.push(vCharCode);
            } else if (vCharCode >= 0x80 && vCharCode <= 0x7ff) {
                //vSize += 2;
                vUtf8Arr.push((0xC0 | (0x1F & (vCharCode >> 6))));
                vUtf8Arr.push((0x80 | (0x3F & vCharCode)));
            } else if (vCharCode >= 0x800 && vCharCode <= 0xffff) {  // ((vCharCode >= 0x800 && vCharCode <= 0xd7ff) || (vCharCode >= 0xe000 && vCharCode <= 0xffff))
                //vSize += 3;
                vUtf8Arr.push((0xE0 | (0x0F & (vCharCode >> 12))));
                vUtf8Arr.push((0x80 | (0x3F & (vCharCode >> 6))));
                vUtf8Arr.push((0x80 | (0x3F & vCharCode)));
            } else if (vCharCode >= 0x10000 && vCharCode <= 0x10ffff) {
                //vSize += 4;
                vUtf8Arr.push((0xF0 | (0x07 & (vCharCode >> 18))));
                vUtf8Arr.push((0x80 | (0x3F & (vCharCode >> 12))));
                vUtf8Arr.push((0x80 | (0x3F & (vCharCode >> 6))));
                vUtf8Arr.push((0x80 | (0x3F & vCharCode)));
            } else if (vCharCode > 0x200000 && vCharCode <= 0x3FFFFFF) {
                //vSize += 5;
                vUtf8Arr.push((0xF8 | (0x03 & (vCharCode >> 24))));
                vUtf8Arr.push((0x80 | (0x3F & (vCharCode >> 18))));
                vUtf8Arr.push((0x80 | (0x3F & (vCharCode >> 12))));
                vUtf8Arr.push((0x80 | (0x3F & (vCharCode >> 6))));
                vUtf8Arr.push((0x80 | (0x3F & vCharCode)));
            } else if (vCharCode > 0x4000000 && vCharCode <= 0x7FFFFFFF) {
                //vSize += 6;
                vUtf8Arr.push((0xFC | (0x01 & (vCharCode >> 30))));
                vUtf8Arr.push((0x80 | (0x3F & (vCharCode >> 24))));
                vUtf8Arr.push((0x80 | (0x3F & (vCharCode >> 18))));
                vUtf8Arr.push((0x80 | (0x3F & (vCharCode >> 12))));
                vUtf8Arr.push((0x80 | (0x3F & (vCharCode >> 6))));
                vUtf8Arr.push((0x80 | (0x3F & vCharCode)));
            }
        }

        return vUtf8Arr;
    }
}

/**
 * 8位有符号整数，-128..127
 */
export class TInt8 {
    constructor(val = 0) {
        if (val < -128 || val > 127)
            system.exception(String.format("值 {0} 不在 -128..127内！", val));

        this._val = new Int8Array(1);
        this._val[0] = val;
    }

    size() {
        return this._val.BYTES_PER_ELEMENT;
    }

    toString() {
        return this._val[0].toString();
    }

    toUInt8() {
        return this._val[0] < 0 ? this._val[0] + 256 : this._val[0];
    }

    get value() {
        return this._val[0];
    }

    set value(val) {
        this._val[0] = val;
    }

    static get min() {
        return -128;
    }

    static get max() {
        return 127;
    }

    static include(val) {
        return (val >= TInt8.min && val <= TInt8.max);
    }
}

/**
 * 8位无符号整数，0..255
 */
export class TUInt8 {
    constructor(val = 0) {
        if (val < 0 || val > 255)
            system.exception(String.format("值 {0} 不在 0..255内！", val));

        this._val = new Uint8Array(1);
        this._val[0] = val;
    }

    size() {
        return this._val.BYTES_PER_ELEMENT;
    }

    toString() {
        return this._val[0].toString();
    }

    toInt8() {
        return this._val[0] < 128 ? this._val[0] : this._val[0] - 256;
    }

    get value() {
        return this._val[0];
    }

    set value(val) {
        this._val[0] = val;
    }

    static get min() {
        return 0;
    }

    static get max() {
        return 255;
    }

    static include(val) {
        return (val >= TUInt8.min && val <= TUInt8.max);
    }
}

/**
 * 8位无符号整数，同UInt8(0 - 255)
 */
export class TByte extends TUInt8 { constructor(val = 0) {super(val)} }

/**
 * 有符号16位，-32768..32767
 */
export class TInt16 {
    constructor(val = 0) {
        if (val < -32768 || val > 32767)
            system.exception(String.format("值 {0} 不在 -32768..32767内！", val));

        this._val = new Int16Array(1);
        this._val[0] = val;
    }

    size() {
        return this._val.BYTES_PER_ELEMENT;
    }

    toString() {
        return this._val[0].toString();
    }

    toInt8() {
        let vInt8 = new Int8Array(1);
        vInt8[0] = this._val[0];
        return vInt8[0];
    }

    toUInt8() {
        let vUInt8 = new Uint8Array(1);
        vUInt8[0] = this._val[0];
        return vUInt8[0];
    }

    toUInt16() {
        return this._val[0] < 0 ? this._val[0] + 65536 : this._val[0];
    }

    get value() {
        return this._val[0];
    }

    set value(val) {
        this._val[0] = val;
    }

    static get min() {
        return -32768;
    }

    static get max() {
        return 32767;
    }

    static include(val) {
        return (val >= TInt16.min && val <= TInt16.max);
    }
}

/**
 * 无符号16位，0..65535
 */
export class TUInt16 {
    constructor(val = 0) {
        if (val < 0 || val > 65536)
            system.exception(String.format("值 {0} 不在 0..65535内！", val));

        this._val = new Uint16Array(1);
        this._val[0] = val;
    }

    size() {
        return this._val.BYTES_PER_ELEMENT;
    }

    toString() {
        return this._val[0].toString();
    }

    toInt8() {
        let vInt8 = new Int8Array(1);
        vInt8[0] = this._val[0];
        return vInt8[0];
    }

    toUInt8() {
        let vUInt8 = new Uint8Array(1);
        vUInt8[0] = this._val[0];
        return vUInt8[0];
    }

    toInt16() {
        return this._val[0] < 32768 ? this._val[0] : this._val[0] - 65536;
    }

    get value() {
        return this._val[0];
    }

    set value(val) {
        this._val[0] = val;
    }

    static get min() {
        return 0;
    }

    static get max() {
        return 65535;
    }

    static include(val) {
        return (val >= TUInt16.min && val <= TUInt16.max);
    }
}

/**
 * 有符号32位，-2147483648..2147483647
 */
export class TInt32 {
    constructor(val = 0) {
        if (val < -2147483648 || val > 2147483647)
            system.exception(String.format("值 {0} 不在 -2147483648..2147483647内！", val));

        this._val = new Int32Array(1);
        this._val[0] = val;
    }

    size() {
        return this._val.BYTES_PER_ELEMENT;
    }

    toString() {
        return this._val[0].toString();
    }

    toInt8() {
        let vInt8 = new Int8Array(1);
        vInt8[0] = this._val[0];
        return vInt8[0];
    }

    toUInt8() {
        let vUInt8 = new Uint8Array(1);
        vUInt8[0] = this._val[0];
        return vUInt8[0];
    }

    toInt16() {
        let vInt16 = new Int16Array(1);
        vInt16[0] = this._val[0];
        return vInt16[0];
    }

    toUInt16() {
        let vUInt16 = new Uint16Array(1);
        vUInt16[0] = this._val[0];
        return vUInt16[0];
    }

    toUInt32() {
        return this._val[0] < 0 ? this._val[0] + 4294967296 : this._val[0];
    }

    get value() {
        return this._val[0];
    }

    set value(val) {
        this._val[0] = val;
    }

    static get min() {
        return -2147483648;
    }

    static get max() {
        return 2147483647;
    }

    static include(val) {
        return (val >= TInt32.min && val <= TInt32.max);
    }
}

/**
 * 无符号32位，0..4294967295
 */
export class TUInt32 {
    constructor(val = 0) {
        if (val < 0 || val > 4294967295)
            system.exception(String.format("值 {0} 不在 0..4294967295内！", val));

        this._val = new Uint32Array(1);
        this._val[0] = val;
    }

    size() {
        return this._val.BYTES_PER_ELEMENT;
    }

    toString() {
        return this._val[0].toString();
    }

    toInt8() {
        let vInt8 = new Int8Array(1);
        vInt8[0] = this._val[0];
        return vInt8[0];
    }

    toUInt8() {
        let vUInt8 = new Uint8Array(1);
        vUInt8[0] = this._val[0];
        return vUInt8[0];
    }

    toInt16() {
        let vInt16 = new Int16Array(1);
        vInt16[0] = this._val[0];
        return vInt16[0];
    }

    toUInt16() {
        let vUInt16 = new Uint16Array(1);
        vUInt16[0] = this._val[0];
        return vUInt16[0];
    }

    toInt32() {
        return this._val[0] < 2147483648 ? this._val[0] : this._val[0] - 4294967296;
    }

    get value() {
        return this._val[0];
    }

    set value(val) {
        this._val[0] = val;
    }

    static get min() {
        return 0;
    }

    static get max() {
        return 4294967295;
    }

    static include(val) {
        return (val >= TUInt32.min && val <= TUInt32.max);
    }
}

export class TSingle {
    constructor(val = 0) {
        this._val = new Float32Array(1);
        this._val[0] = val;
    }
}

export class TUInt64 {
    constructor(val = 0) {
        if (val < Number.MIN_SAFE_INTEGER || val > Number.MAX_SAFE_INTEGER)
            system.exception(String.format("值 {0} 不在 {1}..{2}内！", val, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER));

        if (val > TUInt32.max) {
            let vsBin = val.toString(2);
            //vsBin = vsBin.substr(0, vsBin.length - 32);
            this.hi32 = parseInt(vsBin.substr(0, vsBin.length - 32), 2);
            this.lo32 = parseInt(vsBin.substr(vsBin.length - 32), 2);
        } else {
            this.hi32 = 0;
            this.lo32 = val;  // littleEndian
        }
    }

    size() {
        return this._val.BYTES_PER_ELEMENT + this._val.BYTES_PER_ELEMENT;
    }

    toString() {
        let vVal = (this._val[1] << 32) + this.val[0];
        return vVal.toString();
    }

    get buffer() {
        let vBuffer = new Array(8);
        let vUInt8 = new Uint8Array(1);
        vUInt8[0] = this.lo32;
        vBuffer[0] = vUInt8[0];
        vUInt8[0] = this.lo32 >> 8;
        vBuffer[1] = vUInt8[0];
        vUInt8[0] = this.lo32 >> 16;
        vBuffer[2] = vUInt8[0];
        vUInt8[0] = this.lo32 >> 24;
        vBuffer[3] = vUInt8[0];

        vUInt8[0] = this.hi32;
        vBuffer[4] = vUInt8[0];
        vUInt8[0] = this.hi32 >> 8;
        vBuffer[5] = vUInt8[0];
        vUInt8[0] = this.hi32 >> 16;
        vBuffer[6] = vUInt8[0];
        vUInt8[0] = this.hi32 >> 24;
        vBuffer[7] = vUInt8[0];
        return vBuffer; 
    }
}

/**
 * 枚举类的集合，方便的判断是否包含指定的枚举，注意添加的枚举序号不能大于256。
 */
export class TEnumSet {
    constructor() {
        this.value = 0;
    }

    has(val) {
        return ((this.value & val) == val);
    }

    add(val) {
        this.value = this.value | val;
    }

    remove(val) {
        this.value = this.value & ~val;
    }

    clear() {
        this.value = 0;
    }
}

/**
 * HCL类：HCL基类
 */
export class TObject {
    constructor() {
        this._className = this.constructor.name;
    }

    dispose() { }

    isClass(cls) {
        return this instanceof cls;
    }

    isSubClass(cls) {
        if (cls === TObject)
            return true;

        let vObj = Object.getPrototypeOf(this);  // let vObj = this.constructor;
        return vObj.isClass(cls);
    }

    newInstance() {
        //return Object.create(this);
        //return new Object(this);
        return new this.constructor;
    }

    get className() {
        return this._className;
    }
}

/**
 * HCL类：点，包含x、y
 */
export class TPoint {
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    static Create(x, y) {
        let point = new TPoint();
        point.x = x;
        point.y = y;
        return point;
    }

    static CreateByPoint(pt) {
        return TPoint.Create(pt.x, pt.y);
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
    }

    resetByPoint(pt) {
        this.reset(pt.x, pt.y);
    }

    equal(pt) {
        return (this.x == pt.x) && (this.y == pt.y);
    }

    offset(x, y, clone) {
        if (!clone) {
            this.x += x;
            this.y += y;
        } else
            return TPoint.Create(this.x + x, this.y + y);
    }
}

/**
 * HCL类：尺寸，包含width、height
 */
export class TSize {
    constructor() {
        this.width = 0;
        this.height = 0;
    }

    reset(w, h) {
        this.width = w;
        this.height = h;
    }
}

/**
 * HCL类：矩形区域
 */
export class TRect {
    constructor() {
        this.left = 0;
        this.top = 0;
        this.right = 0;
        this.bottom = 0;
    }

    static Create(left, top, right, bottom) {
        let rect = new TRect();
        rect.left = left;
        rect.top = top;
        rect.right = right;
        rect.bottom = bottom;
        return rect;
    }

    static CreateByRect(rect) {
        return this.Create(rect.left, rect.top, rect.right, rect.bottom);
    }

    static CreateByBounds(left, top, width, height) {
        var rect = new TRect();
        rect.left = left;
        rect.top = top;
        rect.right = left + width;
        rect.bottom = top + height;
        return rect;
    }

    reset(l, t, r, b) {
        this.left = l;
        this.top = t;
        this.right = r;
        this.bottom = b;
    }

    resetRect(rect) {
        this.reset(rect.left, rect.top, rect.right, rect.bottom);
    }

    resetBounds(l, t, w, h) {
        this.reset(l, t, l + w, t + h);
    }

    offset(x, y, clone = false) {
        if (!clone) {
            this.left = this.left + x;
            this.top = this.top + y;
            this.right = this.right + x;
            this.bottom = this.bottom + y;
        } else
            return TRect.Create(this.left + x, this.top + y, this.right + x, this.bottom + y);
    }

    intersection(rect) {
        let re = new TRect();
        if (rect.right <= this.left)
            return re;

        if (rect.top >= this.bottom)
            return re;

        if (rect.left >= this.right)
            return re;

        if (rect.bottom <= this.top)
            return re;

        if (rect.left > this.left)
            re.left = rect.left;
        else
            re.left = this.left;

        if (rect.top > this.top)
            re.top = rect.top;
        else
            re.top = this.top;

        if (rect.right > this.right)
            re.right = this.right;
        else
            re.right = rect.right;

        if (rect.bottom > this.bottom)
            re.bottom = this.bottom;
        else
            re.bottom = rect.bottom;

        return re;
    }

    union(rect) {
        let re = new TRect();
        if (rect.left < this.left)
            re.left = rect.left;
        else
            re.left = this.left;

        if (rect.top < this.top)
            re.top = rect.top;
        else
            re.top = this.top;

        if (rect.right > this.right)
            re.right = rect.right;
        else
            re.right = this.right;

        if (rect.bottom > this.bottom)
            re.bottom = rect.bottom;
        else
            re.bottom = this.bottom;

        return re;
    }

    inFlate(w, h, clone = false) {
        if (!clone) {
            this.left -= w;
            this.right += w;
            this.top -= h;
            this.bottom += h;
        } else
            return TRect.Create(this.left - w, this.top - h, this.right + w, this.bottom + h);
    }

    pointInAt(x, y) {
        return (x >= this.left) && (x <= this.right) && (y >= this.top) && (y <= this.bottom);
    }

    pointIn(pt) {
        return this.pointInAt(pt.x, pt.y);
    }

    get leftTop() {
        return TPoint.Create(this.left, this.top);
    }

    get rightTop() {
        return TPoint.Create(this.right, this.top);
    }

    get leftBottom() {
        return TPoint.Create(this.left, this.bottom);
    }

    get rightBottom() {
        return TPoint.Create(this.right, this.bottom);
    }

    get width() {
        return this.right - this.left;
    }

    set width(val) {
        this.right = this.left + val;
    }

    get height() {
        return this.bottom - this.top;
    }

    set height(val) {
        this.bottom = this.top + val;
    }
}

/**
 * HCL类：列表
 */
export class TList extends Array {
    constructor(ownsObjects = true) {
        super();
        this._onAdded = null;
        this._onRemoved = null;
        this.ownsObjects = ownsObjects;
    }

    doAdded_(item) {
        if (this._onAdded != null)
            this._onAdded(item);
    }

    doRemoved_(item) {
        if (this._onRemoved != null)
            this._onRemoved(item);

        if (this.ownsObjects) {
            let vObj = Object.getPrototypeOf(item);
            if (vObj instanceof TObject)
                item.dispose();    
        }        
    }

    doClear_() { }

    add(item) {
        this[this.length] = item;
        this.doAdded_(item);
    }

    indexOf(item) {
        for (let i = 0; i < this.length; i++) {
            if (this[i] === item)
                return i;
        }

        return -1;
    }

    removeAt(index) {
        if (index >= 0) {
            let vItem = this[index];
            this.splice(index, 1);
            this.doRemoved_(vItem);
            vItem = null;
            return true;
        }

        return false;
    }

    remove(item) {
        return this.removeAt(this.indexOf(item));
    }

    removeRange(index, count) {
        if (index >= 0) {
            let vItem = null;
            let vObj;
            
            for (let i = index; i < index + count; i++) {
                vItem = this[i];
                this.doRemoved_(vItem);
                vObj = Object.getPrototypeOf(vItem);
                if (vObj instanceof TObject)
                    vItem.dispose();

                vItem = null;
            }

            this.splice(index, count);
            return true;
        }

        return false;
    }

    delete(index) {
        return this.removeAt(index);
    }

    insert(index, item) {
        if ((index >= 0) && (index <= this.length)) {
            this.splice(index, 0, item);
            this.doAdded_(index, item);
            return true;
        }

        return false;
    }

    clear() {
        let vItem = null;
        for (let i = this.length - 1; i >= 0; i--) {
            vItem = this[i];
            this.splice(i, 1);
            this.doRemoved_(vItem);
            vItem = null;
        }

        this.doClear_();
        //this.splice(0, this.length);
    }

    contains(item) {
        return this.indexOf(item) >= 0;
    }

    get first() {
        return this[0];
    }

    get last() {
        return this[this.length - 1];
    }

    get count() {
        return this.length;
    }

    get onAdded() {
        return this._onAdded;
    }

    set onAdded(val) {
        this._onAdded = val;
    }

    get onRemoved() {
        return this._onRemoved;
    }

    set onRemoved(val) {
        this._onRemoved = val;
    }
}

/**
 * HCL类：栈
 */
export class TStack extends Array {
    constructor() {
        super();
    }

    peek() {
        return this[this.length - 1];
    }

    clear() {
        this.splice(0, this.length);
    }

    get count() {
        return this.length;
    }
}

/**
 * HCL类：队列
 */
export class TQueue extends Array {
    constructor() {
        super();
    }

    enqueue(item) {
        return this.push(item);
    }

    dequeue() {
        return this.shift();
    }

    clear() {
        this.splice(0, this.length);
    }

    get count() {
        return this.length;
    }
}

export class TDateTime {
    constructor() {
        this._datetime = new Date;
    }

    format(fmt) {   
        let o = {   
            "M+" : this.month,
            "d+" : this.day,
            "h+" : this.hour,
            "m+" : this.minute,
            "s+" : this.second,
            //"q+" : Math.floor((this.month + 3) / 3), //季度   
            "S"  : this.millisecond,
            "z"  : this.millisecond
        };   
  
        if (/(y+)/.test(fmt))   
            fmt = fmt.replace(RegExp.$1, (this.year + "").substr(4 - RegExp.$1.length));   

        for (let k in o) {  
            if(new RegExp("("+ k +")").test(fmt))   
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
        }

        return fmt;   
    }

    toString() {
        return this.format("yyyy-MM-dd hh:mm:ss");
    }
    
    toOADate() {
        this._datetime.toUTCString();
    }

    fromOAData(utc) {
        this._datetime.setUTCMilliseconds(utc);
    }

    get year() {
        return this._datetime.getFullYear();
    }

    set year(val) {
        this._datetime.setFullYear(val);
    }

    get month() {
        return this._datetime.getMonth() + 1;
    }

    set month(val) {
        this._datetime.setMonth(val - 1);
    }

    get day() {
        return this._datetime.getDate();
    }

    set day(val) {
        this._datetime.setDate(val);
    }

    get hour() {
        return this._datetime.getHours();
    }

    set hour(val) {
        this._datetime.setHours(val);
    }

    get minute() {
        return this._datetime.getMinutes();
    }

    set minute(val) {
        this._datetime.setMinutes(val);
    }

    get second() {
        return this._datetime.getSeconds();
    }

    set second(val) {
        this._datetime.setSeconds(val);
    }

    get millisecond() {
        return this._datetime.getMilliseconds();
    }

    set millisecond(val) {
        this._datetime.setMilliseconds(val);
    }

    static Create(year, month = 1, day = 1, hour = 0, minute = 0, second = 0, millisecond = 0) {
        let vDateTime = new TDateTime();
        vDateTime.year = year;
        vDateTime.month = month;
        vDateTime.day = day;
        vDateTime.hour = hour;
        vDateTime.minute = minute;
        vDateTime.second = second;
        vDateTime.millisecond = millisecond;
        return vDateTime;
    }

    static CreateByDateTime(dateTime) {
        let vDateTime = new TDateTime();
        vDateTime.year = dateTime.year;
        vDateTime.month = dateTime.month;
        vDateTime.day = dateTime.day;
        vDateTime.hour = dateTime.hour;
        vDateTime.minute = dateTime.minute;
        vDateTime.second = dateTime.second;
        vDateTime.millisecond = dateTime.millisecond;
        return vDateTime;
    }

    static Now() {
        return new TDateTime();
    }

    //传入年份和月份 获取该年对应月份的天数
    static DaysInMonth(year, month){
        switch (month) {
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12:
                return 31;
            case 4:
            case 6:
            case 9:
            case 11:
                return 30;
            case 2:
                return ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) ? 29 : 28;
            default:
                return 0;
        }
    }
}

export class TStream {
    constructor() {
        this._size = 0;
        this._position = 0;
        this._bytes = new TBytes(0);
        //this._arr = new Array(0);
        //this._buffer = new Uint8Array(this._size);
        //this._dataview = new DataView(new ArrayBuffer(0), 0);
        this.onLoadStart = null;
        this.onLoadProgress = null;
        this.onLoadFinish = null;
    }

    loadFromFile(blob) {
        //console.log('loadFromFile');
        //new Promise((resolveEvent, rejectEvent) => {
            let vReader = new FileReader();
            vReader.onloadstart = (e) => {  // 开始读取
                this._size = 0;
                this._position = 0;
                this._buffer = null;// new ArrayBuffer(this._size);
                //console.log('onloadstart');
                if (this.onLoadStart != null)
                    this.onLoadStart();
            }

            vReader.onload = (e) => {  // 读取成功
                //console.log('onload');
                this._bytes = Array.prototype.slice.call(new Uint8Array(e.target.result));
                //this._arr = Array.prototype.slice.call(new Uint8Array(e.target.result));
                //this._buffer = new Uint8Array(e.target.result);
                //this._dataview = new DataView(e.target.result, 0);
                this._size = e.total;
                this._position = 0;
                if (this.onLoadFinish != null)
                    this.onLoadFinish();
                //resolveEvent();
            }

            vReader.onloadend = (e) => {  // 读取完成，无论成功或失败

            }

            vReader.onabort = (e) => {  // 读取中断时触发

            }

            vReader.onprogress = (e) => {  // 读取过程
                //console.log('onprogress');
                if (this.onLoadProgress != null)
                    this.onLoadProgress(e.loaded, e.total);
            }

            vReader.onerror = (e) => {  // 读取发生错误
                //console.log('onerror');
            }

            vReader.readAsArrayBuffer(blob);    
        // }).then(() => {  // 成功
        //     console.log('成功');
        //     callBack();
        // }).catch(() => {  // 失败
        //     console.log('失败');
        // });
    }

    readBuffer(len) {
        //let vBuffer = this._dataview.buffer.slice(this._position, this._position + len);
        //let vBuffer = this._buffer.slice(this._position, this._position + len);
        //let vBuffer = this._arr.slice(this._position, this._position + len);
        let vBuffer = this._bytes.slice(this._position, this._position + len);
        this._position += len;
        return vBuffer;
    }

    writeBuffer(bytes) {
        for (let i = 0, vLen = bytes.length; i < vLen; i++) {
            if (this._position < this._size)
                this._bytes.splice(this._position, 1, bytes[i]);
            else {
                this._bytes.push(bytes[i]);
                this._size++;
            }

            this._position++;
        }

        //let vLen = bytes.length;
        //this._arr.splice(this._position, vLen, uint8Arr);
        //this._bytes.splice(this._position, 0, bytes);
        //this._position += vLen;
    }

    readByte() {
        return this.readUInt8();
    }

    writeByte(byte) {
        this.writeUInt8(byte);
    }

    readInt8() {
        return new TInt8(this.readBuffer(1)[0]).value;  // Int8Array.BYTES_PER_ELEMENT
    }

    writeInt8(int8) {
        let vBuffer = new Uint8Array(1);
        vBuffer[0] = int8;
        this.writeBuffer(vBuffer);
    }

    readUInt8() {
        return this.readBuffer(1)[0];
    }

    writeUInt8(uint8) {
        let vBuffer = new Uint8Array(1);
        vBuffer[0] = uint8;
        this.writeBuffer(vBuffer);
    }

    readInt16() {
        let vBuffer = this.readBuffer(2);
        return new TInt16((vBuffer[1] << 8) + vBuffer[0]).value;
    }

    writeInt16(int16) {
        let vBuffer = new Uint16Array(1);
        vBuffer[0] = int16;
        vBuffer = new Uint8Array(vBuffer.buffer, vBuffer.byteOffset, vBuffer.byteLength);
        this.writeBuffer(vBuffer);
    }

    readUInt16() {
        let vBuffer = this.readBuffer(2);
        return (vBuffer[1] << 8) + vBuffer[0];
    }

    writeUInt16(uint16) {
        let vBuffer = new Uint16Array(1);
        vBuffer[0] = uint16;
        vBuffer = new Uint8Array(vBuffer.buffer, vBuffer.byteOffset, vBuffer.byteLength);
        this.writeBuffer(vBuffer);
    }

    readInt32() {
        let vBuffer = this.readBuffer(4);
        return new TInt32((vBuffer[3] << 24) + (vBuffer[2] << 16) + (vBuffer[1] << 8) + vBuffer[0]).value;
    }

    writeInt32(int32) {
        let vBuffer = new Uint32Array(1);
        vBuffer[0] = int32;
        vBuffer = new Uint8Array(vBuffer.buffer, vBuffer.byteOffset, vBuffer.byteLength);
        this.writeBuffer(vBuffer);
    }

    readUInt32() {
        let vBuffer = this.readBuffer(4);
        return (vBuffer[3] << 24) + (vBuffer[2] << 16) + (vBuffer[1] << 8) + vBuffer[0];
    }

    writeUInt32(uint32) {
        let vBuffer = new Uint32Array(1);
        vBuffer[0] = uint32;
        vBuffer = new Uint8Array(vBuffer.buffer, vBuffer.byteOffset, vBuffer.byteLength);
        this.writeBuffer(vBuffer);
    }

    readInt64() {
        let vBuffer = this.readBuffer(8);
        let vDV = new DataView(new Uint8Array(vBuffer).buffer);
        return vDV.getUint32(0, true) + (vDV.getUint32(4, true) << 32);  // littleEndian
        //return (vDV.getUint32(0, false) << 32) + vDV.getUint32(4, false);
        //return (vBuffer[7] << 56) + (vBuffer[6] << 48) + (vBuffer[5] << 40) + (vBuffer[4] << 32) 
        //    + (vBuffer[3] << 24) + (vBuffer[2] << 16) + (vBuffer[1] << 8) + vBuffer[0];
    }

    writeInt64(int64) {
        
    }

    readUInt64() {
        let vBuffer = this.readBuffer(8);
        return (vBuffer[7] << 56) + (vBuffer[6] << 48) + (vBuffer[5] << 40) + (vBuffer[4] << 32) 
            + (vBuffer[3] << 24) + (vBuffer[2] << 16) + (vBuffer[1] << 8) + vBuffer[0];
    }

    writeUInt64(uint64) {
        let vInt64 = new TUInt64(uint64);
        this.writeBuffer(vInt64.buffer);
    }

    readSingle() {
        let vBuffer = this.readBuffer(4);
        let vF = new Float32Array(new Uint8Array(vBuffer).buffer);  //vBuffer.byteOffset, vBuffer.byteLength
        return vF[0];
    }

    writeSingle(single) {
        let vBuffer = new Float32Array(1);
        vBuffer[0] = single;
        vBuffer = new Uint8Array(vBuffer.buffer, vBuffer.byteOffset, vBuffer.byteLength);
        this.writeBuffer(vBuffer);
    }

    readDouble() {
        let vBuffer = this.readBuffer(8);
        let vF = new Float64Array(vBuffer);  // vBuffer.byteOffset, vBuffer.byteLength
        return vF[0];
    }

    writeDouble(double) {
        let vBuffer = new Float64Array(1);
        vBuffer[0] = double;
        vBuffer = new Uint8Array(vBuffer.buffer, vBuffer.byteOffset, vBuffer.byteLength);
        this.writeBuffer(vBuffer);
    }

    readBoolean() {
        return this.readByte() != 0 ? true : false;
    }

    writeBoolean(bool) {
        this.writeByte(bool ? 1 : 0);
    }

    readDateTime() {
        let vdb = this.readDouble();
        return (new TDateTime()).fromOAData(vdb);
    }

    writeDateTime(dt) {
        let vdb = parseInt(dt.toOADate());
        this.writeDouble(vdb);
    }

    get size() {
        return this._size;
    }

    get buffer() {
        return this._bytes;
    }

    get position() {
        return this._position;
    }

    set position(val) {
        if (val < 0)
            this._position = 0;
        else
        if (val > this._size)
            this._position = this._size;
        else
            this._position = val;
    }

    static loadFromFile(file, callBack) {
        let vStream = new TStream();
        vStream.onLoadFinish = () => {
            callBack(vStream);
        }

        vStream.loadFromFile(file);
    }
}

//======================= 自定义扩展 =============================

// String
String.prototype.format = function() {
    let vValues = arguments;
    return this.replace(/\{(\d+)\}/g, function (match, index) {
        if (vValues.length > index)
            return vValues[index];
        else
            return "";
    });
}

String.format = function() {
    let vValues = arguments;
    if (vValues.length > 0) {
        if (vValues.length > 1) {
            //let vFmt = vValues[0].toString();
            let vIndex = -1;
            return vValues[0].replace(/\{(\d+)\}/g, function (match, index) {
                vIndex = parseInt(index);
                if (vValues.length > vIndex + 1)
                    return vValues[vIndex + 1];
                else
                    return "";
            });
        } else
            return vValues[0];
    }
}

String.prototype.insert = function(index, text) {
    return this.slice(0, index) + text + this.slice(index)
}

String.prototype.delete = function(index, length) {
    return this.substring(0, index) + this.substring(index + length, this.length);
}

String.prototype.remove = function(index, length) {
    return this.delete(index, length);
}

// Set
Object.defineProperty(Set.prototype, "count", {
    get() {
        return this.size;
    }
})

Set.prototype.remove = function(e) {
    this.delete(e);
}

Set.prototype.union = function(s) {
    return new Set([...this, ...s]);
}

Set.prototype.intersection = function(s) {
    return new Set([...this].filter(x => s.has(x)));
}

Set.prototype.difference = function(s) {
    return new Set([...this].filter(x => !s.has(x)));
}

Set.prototype.compare = function(s) {
    if (this.size != s.size)
        return false;

    for (let vItem of this)
        if (!s.has(vItem))
            return false;
            
    return true;
}