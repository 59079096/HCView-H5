/*=======================================================

    Html Component Library 前端UI框架 V0.1
    粘贴板功能单元
    作者：荆通(18114532@qq.com)
    QQ群：649023932

=======================================================*/

import { TAnsiEncoding, TEncode, TObject, TUtf16Encoding, TUtf8Encoding, TList, TStream } from "./System.js";

export let TDataFormat = {
    AnsiText: 1,
    UnicodeText: 2,
    Bitmap: 3,
    JPEG: 4,
    PNG: 5,
    Wave: 6,
    RTF: 7,
    Custom: 8
}

export class TClipboard extends TObject {
    constructor() {
        super();
        this._customFormatID = TDataFormat.Custom;
        this._opening = false;
        this._formats = new TList();
        this._datas = new TList();
    }

    _getFormatIndex(format) {
        for (let i = 0; i < this._formats.count; i++) {
            if (this._formats[i] == format)
                return i;
        }

        return -1;
    }

    setFormatData(format, data) {
        let vIndex = this._getFormatIndex(format);
        if (vIndex < 0) {
            this._formats.add(format);
            this._datas.add(data);
        } else {
            this._formats[vIndex] = format;
            this._datas[vIndex] = data;
        }
    }

    removeFormat(format) {
        let vIndex = this._getFormatIndex(format);
        if (vIndex >= 0) {
            this._formats.delete(vIndex);
            this._datas.delete(vIndex);
        }
    }

    hasFormat(format) {
        return this._getFormatIndex(format) >= 0;
    }

    clear() {
        this._formats.clear();
        this._datas.clear();
    }

    registerFormat() {
        return this._customFormatID++;
    }

    getData(format) {
        let vIndex = this._getFormatIndex(format);
        if (vIndex >= 0)
            return this._datas[vIndex];
        else
            return null;
    }

    getAnsiText() {
        let vIndex = this._getFormatIndex(TDataFormat.AnsiText);
        if (vIndex >= 0)
            return TAnsiEncoding.getString(this._datas[vIndex]);
        else
            return null;
    }

    getUnicodeText() {
        let vIndex = this._getFormatIndex(TDataFormat.UnicodeText);
        if (vIndex >= 0)
            return TUtf16Encoding.getString(this._datas[vIndex]);
        else
            return null;
    }

    getText() {
        let vS = this.getUnicodeText();
        if (vS == null)
            vS = this.getAnsiText();

        return vS;
    }    

    setText(val) {
        //this.setFormatData(TDataFormat.AnsiText, TAnsiEncoding.getBytes(val));
        this.setFormatData(TDataFormat.UnicodeText, TUtf16Encoding.getBytes(val));
    }

    setEncodeText(val, encoding = TEncode.Utf16) {
        if (encoding == TEncode.Ansi)
            this.setFormatData(TDataFormat.AnsiText, TAnsiEncoding.getBytes(val));
        else
            this.setFormatData(TDataFormat.UnicodeText, TUtf16Encoding.getBytes(val));
    }    

    getEncodeText(encoding = TEncode.Utf16) {
        switch (encoding) {
            case TEncode.Ansi:
                return this.getAnsiText();

            case TEncode.Unicode:
                return this.getUnicodeText();

            default: {
                let vIndex = this._getFormatIndex(TDataFormat.UnicodeText);
                return TUtf8Encoding.getString(this._datas[vIndex]);
            }
        }
    }

    toBrowerClipboard(val) {
        let vInput = document.createElement("input");
        try {
            document.body.appendChild(vInput);
            vInput.setAttribute("value", val);
            vInput.setAttribute("readonly", "readonly");
            vInput.select();
            document.execCommand("copy");
        } finally {
            document.body.removeChild(vInput);
        }
    }

    fromBrowerClipboard() {
       // window.ClipboardJS.
    }
}

export class TLocalStorage {
    constructor() {

    }

    setString(key, val) {
        localStorage.setItem(key, val);
    }

    getString(key) {
        return localStorage.getItem(key);
    }

    setStream(key, stream) {
        this.setString(key, stream.buffer.toString());
    }

    getStream(key) {
        let vs = this.getString(key);
        let vBytes = vs.split(",");
        let vStream = new TStream();
        for (let i = 0, vLen = vBytes.length; i < vLen; i++)
            vStream.writeByte(vBytes[i]);

        vStream.position = 0;
        return vStream;
    }

    removeKey(key) {
        localStorage.removeItem(key);
    }

    hasKey(key) {
        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i) == key)
                return true;
        }

        return false;
    }

    clear() {
        localStorage.clear();
    }
}