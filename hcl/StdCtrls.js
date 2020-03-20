import { application } from "./Application.js";
import { clipboard } from "./Clipboard.js";
import { TAlign, TControl, TCursors, TCustomControl, theme,
    THorizontalAlign, TKey, TMouseButton, TMouseEventArgs,
    TMouseStates, TOrientation, TPopupControl, TScrollBar, TShiftState, TVerticalAlign } from "./Controls.js";
import { TFont, TFontDetector, TFontStyle, THCCanvas, TColor } from "./Graphics.js";
import { ime, TImeMode } from "./Ime.js";
import { system, TList, TObject, TPoint, TRect, TUtf16Encoding, TBytes } from "./System.js";

export default class ThisIsHCL { }

export var TImageSrcType = {
    None: 0,
    URL: 1,
    Base64: 2
}

export class TImage extends TControl {
    constructor() {
        super();
        this.autoSize = true;
        this._srcType = TImageSrcType.None;
        this._imageType = "";
        this._onImageLoaded = null;
        this.image = new Image();
        this.image.onload = (e) => {  // eslint-disable-line
            this.doImageLoad_();
        }
    }

    assign(source) {
        this.autoSize = source.autoSize;
        this._srcType = source._srcType;
        this._imageType = source._imageType;
        this.image = new this.image();
        this.image.src = source.image.src;
    }

    static Create(width = 16, height = 16) {
        let vImage = new TImage();
        vImage.width = width;
        vImage.height = height;
        return vImage;
    }

    doImageLoad_() {
        this.loaded = true;
        if (this.autoSize) {
            this.width = this.image.width;
            this.height = this.image.height;
        }
        
        if (this.image.src.indexOf("data:image") > -1) {
            this._srcType = TImageSrcType.Base64;
            let vBase64 = this.image.src;
            let vSection = vBase64.split(",");
            this._imageType = vSection[0].match(/:(.*?);/)[1];  // 文件类型
        } else {
            this._srcType = TImageSrcType.URL;
            let v = this.image.src.lastIndexOf(".");
            this._imageType = this.image.src.substring(v);
        }

        if (this._onImageLoaded != null)
            this._onImageLoaded();

        this.update();
    }

    doPaint_(hclCanvas) {
        if (this.loaded)
            hclCanvas.drawImage(0, 0, this.image);
    }

    doPaintBackground_(hclCanvas) {  // eslint-disable-line
        //super.doPaintBackground_(hclCanvas);
    }

    saveToStream(stream) {
        stream.writeByte(this._srcType);

        let vBytes;
        switch (this._srcType) {
            case TImageSrcType.URL:
                vBytes = TUtf16Encoding.getBytes(this.image.src);
                break;

            case TImageSrcType.Base64: {
                    let vBase64 = this.image.src;
                    let vSection = vBase64.split(",");
                    vBytes = TBytes.fromBase64(vSection[1]);
                }
                break;
            
            default:
                return;
        }

        stream.writeUInt32(vBytes.length);
        stream.writeBuffer(vBytes);
    }

    loadFromStream(stream) {
        this._srcType = stream.readByte();
        if (this._srcType == TImageSrcType.None)
            return;

        let vSize = stream.readUInt32();
        if (vSize > 0) {
            let vBytes = stream.readBuffer(vSize);
            switch (this._srcType) {
                case TImageSrcType.URL:
                    this.image.src = vBytes.toText();
                    break;

                case TImageSrcType.Base64:
                    this.image.src = "data:image/png;base64," + vBytes.toBase64();
                    break;
                
                default:
                    return;
            }
        }
    }

    get src() {
        return this.image.src;
    }

    set src(val) {
        this.image.src = val;
    }

    get srcType() {
        return this._srcType;
    }

    get imageType() {
        return this._imageType;
    }

    get onImageLoaded() {
        return this._onImageLoaded;
    }

    set onImageLoaded(val) {
        this._onImageLoaded = val;
    }
}

export class TSpliter extends TControl {
    constructor() {
        super();
        this.width = 3;
        this.align = TAlign.Left;
    }

    doPaintBackground_(hclCanvas) {
        hclCanvas.pen.width = 1;
        hclCanvas.pen.color = theme.borderColor;
        hclCanvas.beginPath();
        hclCanvas.drawLine((this.width - hclCanvas.pen.width) / 2, 2,
            (this.width - hclCanvas.pen.width) / 2, this.height - 2);
        hclCanvas.paintPath();
    }
}

export class TTextControl extends TControl {
    constructor(text) {
        super();
        this._text = text;
        this.font = new TFont();
        this.borderVisible_ = false;
        this.borderWidth_ = 1;
        this._horiAlign = THorizontalAlign.Left;
        this._vertAlign = TVerticalAlign.Top;
        this._autoWidth = false;
        this._autoHeight = false;
        this._width = 75;
        this._onChange = null;
    }

    doSetPaddingLeft_(val) {
        if (this.paddingLeft != val) {
            super.doSetPaddingLeft_(val);
            if (this._autoWidth)
                this.doSetAutoWidth_();
        }
    }

    doSetPaddingTop_(val) {
        if (this.paddingTop != val) {
            super.doSetPaddingTop_(val);
            if (this._autoHeight)
                this.doSetAutoHeight_();
        }
    }

    doSetPaddingRight_(val) {
        if (this.paddingRight != val) {
            super.doSetPaddingRight_(val);
            if (this._autoWidth)
                this.doSetAutoWidth_();
        }
    }

    doSetPaddingBottom_(val) {
        if (this.paddingBottom != val) {
            super.doSetPaddingBottom_(val);
            if (this._autoHeight)
                this.doSetAutoHeight_();
        }
    }    

    doSetAutoWidth_() {
        let vW = this.paddingLeft + this.paddingRight + THCCanvas.textWidth(this.font, this.text);
        if (this.width != vW)
            this.width = vW;
    }

    doSetAutoHeight_() {
        let vH = this.paddingTop + this.paddingBottom + this.font.height;
        if (this.height != vH)
            this.height = vH;
    }

    doChange_() {
        this.beginUpdate()
        try {
            if (this._autoWidth)
                this.doSetAutoWidth_();

            if (this._autoHeight)
                this.doSetAutoHeight_();
        } finally {
            this.endUpdate();
        }

        if (this._onChange != null)
            this._onChange();
    }

    doPaintText_(hclCanvas, x, y) {
        hclCanvas.textOut(x, y, this._text);
    }

    doPaint_(hclCanvas) {
        if (this._text.length > 0) {
            hclCanvas.font.assign(this.font);

            let vY = 0;
            switch (this._vertAlign) {
                case TVerticalAlign.Bottom:
                    vY = this.height - this.paddingBottom;  // - this.font.height;
                    break;

                case TVerticalAlign.Center:
                    vY = this.paddingTop + Math.max(0, (this.height - this.paddingTop - this.paddingBottom - this.font.height) / 2);
                    break;

                default:
                    vY = this.paddingTop;
                    break;
            }

            let vX = 0; let vW = THCCanvas.textWidth(this.font, this._text);
            switch (this._horiAlign) {
                case THorizontalAlign.Right:
                    vX = this.width - vW - this.paddingRight;
                    break;

                case THorizontalAlign.Center:
                    vX = this.paddingLeft + Math.max(0, (this.width - this.paddingLeft - this.paddingRight - vW) / 2);
                    break;

                default:
                    vX = this.paddingLeft;
                    break;
            }
            
            this.doPaintText_(hclCanvas, vX, vY);
        }
    }

    doSetBorderVisible_() {
        this.update();
    }

    doSetText_() {
        this.doChange_();
    }

    textArea() {
        return TRect.Create(this.paddingLeft + (this.borderVisible_ ? this.borderWidth_ : 0), 
            this.paddingTop + (this.borderVisible_ ? this.borderWidth_ : 0), 
            this.width - (this.borderVisible_ ? this.borderWidth_ : 0) - this.paddingRight,
            this.height - (this.borderVisible_ ? this.borderWidth_ : 0) - this.paddingBottom);
    }

    get autoWidth() {
        return this._autoWidth;
    }

    set autoWidth(val) {
        if (this._autoWidth != val) {
            this._autoWidth = val;
            if (val)
                this.doSetAutoWidth_();
        }
    }

    get autoHeight() {
        return this._autoHeight;
    }

    set autoHeight(val) {
        if (this._autoHeight != val) {
            this._autoHeight = val;
            if (val)
                this.doSetAutoHeight_();
        }
    }

    get text() {
        return this._text;
    }

    set text(val) {
        if (this._text != val) {
            this._text = val;
            this.doSetText_();
        }
    }

    get borderVisible() {
        return this.borderVisible_;
    }

    set borderVisible(val) {
        if (this.borderVisible_ != val) {
            this.borderVisible_ = val;
            this.doSetBorderVisible_();
        }
    }

    get onChange() {
        return this._onChange;
    }

    set onChange(val) {
        this._onChange = val;
    }
}

export class TLable extends TTextControl {
    constructor(text) {
        super(text);
        this._vertAlign = TVerticalAlign.Center;
        this.transparent = true;
        this.autoWidth = true;
        this.autoHeight = true;
    }
}

export class TUrlLable extends TLable {
    constructor(text) {
        super(text);
        this.cursor = TCursors.HandPoint;
        this.url = "";
    }

    doMouseEnter_() {
        super.doMouseEnter_();
        this.update();
    }

    doMouseLeave_() {
        super.doMouseLeave_();
        this.update();
    }

    doPaintText_(hclCanvas, x, y) {
        if (this.mouseIn) {
            hclCanvas.font.color = TColor.Blue;
            hclCanvas.font.styles.add(TFontStyle.Underline);
        }

        super.doPaintText_(hclCanvas, x, y);
    }

    doClick_() {
        if (this.url != "")
            system.openURL(this.url);

        super.doClick_();
    }
}

export class TButton extends TTextControl {
    constructor(text) {
        super(text);

        this._horiAlign = THorizontalAlign.Center;
        this._vertAlign = TVerticalAlign.Center;
        this._paddingLeft = 5;
        this._paddingTop = 5;
        this._paddingRight = 5;
        this._paddingBottom = 5;
        this.textVisible_ = true;  
        this.canFocus = true;
        this.width = 75;
    }

    doMouseEnter_() {
        super.doMouseEnter_();
        this.update();
    }

    doMouseLeave_() {
        super.doMouseLeave_();
        this.update();
    }

    doMouseDown_(e) {
        super.doMouseDown_(e);
        this.update();
    }

    doMouseUp_(e) {
        super.doMouseUp_(e);
        this.update();
    }

    doSetAutoWidth_() {
        if (this.textVisible_)
            super.doSetAutoWidth_();
        else if (this.width > 20)
            this.width = 20;
    }

    doPaintStaticBackground_(hclCanvas) {
        hclCanvas.brush.color = theme.backgroundLightColor;
        hclCanvas.fillBounds(0, 0, this.width, this.height);
    }

    doPaintHotBackground_(hclCanvas) {
        if (this.mouseStates.has(TMouseStates.MouseDown))
            hclCanvas.brush.color = theme.backgroundDownColor;
        else
            hclCanvas.brush.color = theme.backgroundHotColor;

        hclCanvas.fillBounds(0, 0, this.width, this.height);
    }

    doPaintBackground_(hclCanvas) {
        if (this.mouseStates.has(TMouseStates.MouseIn)) 
            this.doPaintHotBackground_(hclCanvas);
        else
            this.doPaintStaticBackground_(hclCanvas);

        super.doPaintBackground_(hclCanvas);
    }

    doPaint_(hclCanvas) {
        if (this.textVisible_)
            super.doPaint_(hclCanvas);
    }

    get textVisible() {
        return this.textVisible_;
    }

    set textVisible(val) {
        if (this.textVisible_ != val) {
            this.textVisible_ = val;
            this.doSetAutoWidth_();
        }
    }
}

export class TImageButton extends TButton {
    constructor(text) {
        super(text);

        this.image = TImage.Create(16, 16);
        this.image.left = 2;
        this.image.onImageLoaded = () => {
            this.updateRect(this.image.bounds());
        }
    }

    doSetAutoWidth_() {
        super.doSetAutoWidth_();
        if (this.image.loaded)
            this.width += this.image.width;
    }

    doPaintStaticBackground_(hclCanvas) { }

    doPaint_(hclCanvas) {
        if (this.image.src != "") {
            this.image.top = (this.height - this.image.height) / 2;
            this.image.paintTo(hclCanvas, this.image.left, this.image.top);
            hclCanvas.save();
            try {
                hclCanvas.translate(this.image.left + this.image.width + 2, 0);
                super.doPaint_(hclCanvas);
            } finally {
                hclCanvas.restore();
            }
        }
        else
            super.doPaint_(hclCanvas);
    }
}

export class TMenuButton extends TImageButton {
    constructor(text) {
        super(text);
        this.dropDownMenu = null;
    }

    doSetAutoWidth_() {
        super.doSetAutoWidth_();
        this.width += theme.dropDownButtonSize;
    }

    doClick_() {
        if (this.dropDownMenu != null) {
            this.dropDownMenu.dropDownStyle = true;
            this.dropDownMenu.popupControl(this)
        }

        super.doClick_();
    }

    doPaintBackground_(hclCanvas) {
        super.doPaintBackground_(hclCanvas);
        theme.drawDropDown(hclCanvas, TRect.CreateByBounds(this.width - theme.dropDownButtonSize,
            0, theme.dropDownButtonSize, this.height));
    }
}

export class TToolButton extends TImageButton {
    constructor(text) {
        super(text);

        this.canFocus = false;
        this._checked = false;
        this.textVisible_ = false;
        this.align = TAlign.Left;
        this.autoWidth = true;
    }

    doPaintBackground_(hclCanvas) {
        if (this._checked) {
            hclCanvas.brush.color = theme.backgroundDownColor;
            hclCanvas.fillBounds(0, 0, this.width, this.height);
        } else
            super.doPaintBackground_(hclCanvas);
    }

    get checked() {
        return this._checked;
    }

    set checked(val) {
        if (this._checked != val) {
            this._checked = val;
            this.update();
        }
    }    
}

export class TToolMenuButton extends TMenuButton {
    constructor(text) {
        super(text);

        this.canFocus = false;
        this._checked = false;
        this.textVisible_ = false;
        this.align = TAlign.Left;
        this.autoWidth = true;
    }
}

export class TPanel extends TCustomControl { }

export class TToolBar extends TCustomControl {
    constructor() {
        super();
        this.height = 22;
    }

    reAlign() {
        let vLeft = this.paddingLeft;
        let vRight = this.width - this.paddingRight;
        let vControl = null;

        for (let i = 0; i < this.controls.count; i++) {
            vControl = this.controls[i];
            if (vControl.align == TAlign.Left) {  // 左对齐
                vControl.left = vLeft + vControl.marginLeft;
                vControl.top = this.paddingTop + vControl.marginTop;
                vControl.height = this.height - this.paddingTop - this.paddingBottom
                    - vControl.marginTop - vControl.marginBottom;
                vLeft = vControl.left + vControl.width + vControl.marginRight;
            }
            else {  // 非左即右
                vRight = vRight - vControl.marginRight - vControl.width;
                vControl.left = vRight;
                vControl.top = this.paddingTop + vControl.marginTop;
                vControl.height = this.height - this.paddingTop - this.paddingBottom
                    - vControl.marginTop - vControl.marginBottom;
                vRight = vRight - vControl.marginLeft;
            }
        }

        this.update();
    }

    addButton(text, textVisible = true, img = "") {
        let vButton = new TToolButton(text);
        vButton.textVisible = textVisible;

        if (img != "")
            vButton.image.src = img;

        this.addControl(vButton);
        return vButton;
    }

    addSpliter() {
        let vSpliter = new TSpliter();
        this.addControl(vSpliter);
    }
}

export class TCaptionBar extends TToolBar {
    constructor() {
        super();
        this._x = 0;
        this._y = 0;
        this.captureParent = true;
    }

    doMouseDown_(e) {
        super.doMouseDown_(e);

        this._x = e.x;
        this._y = e.y;

        if ((e.button == TMouseButton.Left && this.captureParent && this.getControlAt(e.x, e.y, false) === null)) {
            application.setCapture(this);
            this.captured = true;
        }
        else
            this.captured = false;
    }

    doMouseMove_(e) {
        super.doMouseMove_(e);
        if (this.captured && this.captureParent) {
            let vControl = this.parent;
            let vOldRect = this.parent.bounds();
            let vRect = vOldRect.offset(e.x - this._x, e.y - this._y, true);
            vRect = vRect.union(vOldRect);
            vRect.offset(-1, -1);
            vControl.left += e.x - this._x;
            vControl.top += e.y - this._y;
            application.updateRect(vRect); 

            // while (control != null) {
            //     if (control instanceof TForm) {
            //         let point = control.clientToScreen(TPoint.Create(0, 0));
            //         let oldRect = TRect.CreateByBounds(point.x, point.y, control.width, control.height);
            //         let rect = oldRect.offset(e.x - this._x, e.y - this._y, true);
            //         rect = rect.union(oldRect);
            //         rect.offset(-1, -1);
            //         control.left += e.x - this._x;
            //         control.top += e.y - this._y;
            //         application.updateRect(rect);
            //         break;
            //     }
            //     else
            //         control = control.parent;
            // }
        }
    }

    doMouseUp_(e) {
        super.doMouseUp_(e);
        if (this.captured) {
            application.releaseCapture();
            this.captured = false;
        }
    }
}

export class TCheckBox extends TLable {
    constructor(text) {
        super(text);
        this._checked = false;
        this._downInCheck = false;
        this._checkByText = false;
        this.paddingLeft = theme.iconSize;
    }

    _getBoxRect() {
        return TRect.CreateByBounds(1, 1, theme.iconSize - 2, theme.iconSize - 2);
    }

    doSetBounds_() {
        this._height = theme.iconSize;
        super.doSetBounds_();
    }

    doMouseEnter_() {
        super.doMouseEnter_();
        this.updateRect(this._getBoxRect());
    }

    doMouseLeave_() {
        super.doMouseLeave_();
        this.updateRect(this._getBoxRect());
    }

    doMouseDown_(e) {
        if (this._checkByText)
            this._downInCheck = true;
        else
            this._downInCheck = this._getBoxRect().pointInAt(e.x, e.y);

        super.doMouseDown_(e);
    }

    doMouseUp_(e) {
        if (this._downInCheck) {
            if (!this._checkByText && !this._getBoxRect().pointInAt(e.x, e.y)) {
                //;
            } else
                this.checked = !this._checked;
        }
        
        super.doMouseUp_(e);
    }

    doPaint_(hclCanvas) {
        if (this.mouseIn)
            hclCanvas.pen.color = theme.borderHotColor;
        else
            hclCanvas.pen.color = theme.borderColor;

        let vBoxRect = this._getBoxRect();
        hclCanvas.rectangleRect(vBoxRect);

        if (this._checked)
            hclCanvas.textOut(vBoxRect.left, vBoxRect.top, "√");

        super.doPaint_(hclCanvas);
    }

    get checked() {
        return this._checked;
    }

    set checked(val) {
        if (this._checked != val) {
            this._checked = val;
            this.updateRect(this._getBoxRect());
        }
    }
}

export class TInputControl extends TTextControl {
    constructor(text) {
        super(text);        
        this._readOnly = false;
        this.cursor_ = TCursors.Ibeam;
        this.imeMode = TImeMode.Disabled;

        this.popupMenu = new TPopupMenu();
        this._copyMenuItem = this.popupMenu.addItem("复制");
        this._copyMenuItem.onClick = () => {
            this.doCopy_();
        }

        this._copyToBrowerMenuItem = this.popupMenu.addItem("复制到浏览器");
        this._copyToBrowerMenuItem.onClick = () => {
            this.doCopyToBrower_();
        }

        this._cutMenuItem = this.popupMenu.addItem("剪切");
        this._cutMenuItem.onClick = () => {
            this.doCut_();
        }

        this._pasteMenuItem = this.popupMenu.addItem("粘贴");
        this._pasteMenuItem.onClick = () => {
            this.doPaste_();
        }

        this.popupMenu.addSpliter();
        let vItem = this.popupMenu.addItem("删除");
        vItem.addItem("全部删除");
        let vItem2 = vItem.addItem("增量删除");
        vItem2.addItem("1111111");
        vItem2.addItem("2222222");
        vItem2.addItem("3333333");
        vItem2 = vItem.addItem("删除选中");
        vItem2.addItem("aaaa");
        vItem2.addItem("bbbb");
        vItem2.addItem("cccc");
    }

    removed_() {
        super.removed_();
        ime.removeControl(this);
    }

    doKillFocus_() {
        super.doKillFocus_();
        ime.removeControl(this);
    }

    doContextMenu_(x, y) {
        //super.doContextMenu_();
        this._copyMenuItem.enabled = this.canCopy_();
        this._cutMenuItem.enabled = this.canCut_();
        this._pasteMenuItem.enabled = this.canPaste_();

        let vPoint = this.clientToScreen(new TPoint(0, 0));
        this.popupMenu.popup(vPoint.x + x, vPoint.y + y);
    }

    doMouseDown_(e) {
        super.doMouseDown_(e);
    }

    doMouseUp_(e) {
        if (!this._readOnly && this.mouseStates.has(TMouseStates.MouseDown)) {
            if (this.imeMode == TImeMode.Active)
                ime.setControl(this);
        }

        super.doMouseUp_(e);
    }

    doSetReadOnly_() { }

    doCopy_() { }

    doCopyToBrower_() { }

    doCut_() { }

    doPaste_() { }

    canCopy_() {
        return false;
    }

    canCut_() {
        return false;
    }

    canPaste_() {
        return false;
    }

    insertText(index, text) {
        this.text = this.text.insert(index, text);
    }

    deleteText(index, length) {
        this.text = this.text.delete(index, length);
    }

    imeInput(text, isPaste) { }  // eslint-disable-line

    get readOnly() {
        return this._readOnly;
    }

    set readOnly(val) {
        if (this._readOnly != val) {
            this._readOnly = val;
            this.doSetReadOnly_();
        }
    }
}

export class TEdit extends TInputControl {
    constructor(text) {
        super(text);
        this.canFocus = true;
        this.borderVisible_ = true;
        this._innerPasted = false;  // 内部响应了粘贴
        this._vertAlign = TVerticalAlign.Center;
        this._selStart = -1;
        this._selEnd = -1;
        this._selMove = -1;
        this._leftOffset = 0;
        this._marginLeft = 2;
        this._marginTop = 2;
        this._marginRight = 2;
        this._marginBottom = 2;
        this._paddingLeft = 2;
        this._paddingTop = 2;
        this._paddingRight = 2;
        this._paddingBottom = 2;
        this._textPrompt = "";
        this.imeMode = TImeMode.Active;
    }

    _selectActionLeft() {
        if (this.selectExists()) {
            if (this._selMove == this._selStart && this._selStart > 0) {
                this._selStart--;
                this._selMove = this._selStart;
            } else if (this._selMove == this._selEnd && this._selEnd <= this.text.length) {
                this._selEnd--;
                if (this._selEnd == this._selStart) {
                    this._selEnd = -1;
                    this._selMove = this._selStart;
                } else
                    this._selMove = this._selEnd;
            }

            this.scrollAdjust_(this._selMove);
            this.resetSelect_();
        } else if (this._selStart > 0) {
            this._selEnd = this._selStart;
            this._selStart--;
            this._selMove = this._selStart;
            this.scrollAdjust_(this._selMove);
            this.resetSelect_();
        }
    }

    _selectActionRight() {
        if (this.selectExists()) {
            if (this._selMove == this._selStart && this._selStart < this.text.length) {
                this._selStart++;
                if (this._selStart == this._selEnd)
                    this._selEnd = -1;
                
                this._selMove = this._selStart;
            } else if (this._selMove == this._selEnd && this._selEnd < this.text.length) {
                this._selEnd++;
                this._selMove = this._selEnd;
            }

            this.scrollAdjust_(this._selMove);
            this.resetSelect_();
        } else if (this._selStart < this.text.length) {
            this._selEnd = this._selStart + 1;
            this._selMove = this._selEnd;
            this.scrollAdjust_(this._selMove);
            this.resetSelect_();
        }
    }

    _createCaret() {
        application.createCaret(this, null, 0, this.font.height + 1);
    }

    _destroyCaret() {
        application.destroyCaret(this);
    }    

    getCharOffsetAt_(x, y) {  // eslint-disable-line
        let vX = x - (this.borderVisible_ ? this.borderWidth_ : 0) - this.paddingLeft + this._leftOffset;

        if (this.text.length > 0) {
            let vArr = THCCanvas.getTextExtent(this.font, this.text);
            let vLeft = 0;
            for (let i = 0; i < vArr.length; i++) {
                vLeft += vArr[i];
                if (vLeft >= vX) {
                    if (Math.trunc(vLeft - vArr[i] / 2) > vX)
                        return i;
                    else
                        return i + 1;
                }
            }

            if (vX > vLeft)
                return this.text.length;
        }
            
        return 0;
    }

    getCharLeft_(offset) {
        let vResult = 0;
        if (offset > 0) {
            let vArr = THCCanvas.getTextExtent(this.font, this.text, offset);
            for (let i = 0; i < offset; i++)
                vResult += vArr[i];
        }

        return vResult + (this.borderVisible_ ? this.borderWidth_ : 0) + this.paddingLeft - this._leftOffset;
    }

    getCharTop_() {
        switch (this._vertAlign) {
            case TVerticalAlign.Bottom:
                return this.height - this.paddingBottom - (this.borderVisible_ ? this.borderWidth_ : 0);

            case TVerticalAlign.Center:
                return this.paddingTop + (this.borderVisible_ ? this.borderWidth_ : 0)
                    + Math.max(0, (this.height - this.paddingTop - this.paddingBottom
                        - (this.borderVisible_ ? this.borderWidth_ + this.borderWidth_ : 0) - this.font.height) / 2);

            default:
                return this.paddingTop + (this.borderVisible_ ? this.borderWidth_ : 0);
        }
    }

    resetSelect_() {
        if (this.selectExists())
            this.hideCaret_();
        else if (this._selStart >= 0)
            this.showCaret_();

        this.update();
    }
    
    scrollAdjust_(index) {
        let vRect = this.textArea();
        let vW = THCCanvas.textWidth(this.font, this.text);
        if (vW < vRect.width) {
            this._leftOffset = 0;
            return;
        }

        if (vW - this._leftOffset < vRect.width) {
            this._leftOffset = vW - vRect.width;
            return;
        }
        
        let vText = this.text.substring(0, index);
        let vRight = THCCanvas.textWidth(this.font, vText) + vRect.left - this._leftOffset;

        if (vRight > vRect.right)
            this._leftOffset += vRight - vRect.right;
        else if (vRight < vRect.left)
            this._leftOffset -= vRect.left - vRight;
    }

    doPaintBorder_(hclCanvas, rect) {
        hclCanvas.pen.width = this.borderWidth_;
        if (this._readOnly)
            hclCanvas.pen.color = theme.borderColor;
        else
        if (this.focused)
            hclCanvas.pen.color = theme.borderActiveColor;
        else
        if (this.mouseIn)
            hclCanvas.pen.color = theme.borderHotColor;
        else
            hclCanvas.pen.color = theme.borderColor;
            
        hclCanvas.rectangleRect(rect);
    }

    doPaintSelected_(hclCanvas) {
        hclCanvas.brush.color = theme.backgroundSelectColor;
        let vLeft = this.getCharLeft_(this._selStart);
        let vRight = this.getCharLeft_(this._selEnd);
        let vRect = this.textArea();
        vLeft = Math.max(vRect.left, Math.min(vLeft, vRect.right));
        vRight = Math.max(vRect.left, Math.min(vRight, vRect.right));
        hclCanvas.fillBounds(vLeft, vRect.top, vRight - vLeft, vRect.height);
    }

    showCaret_() {
        if (this._selStart < 0)
            return;

        let vX = this.getCharLeft_(this._selStart) - 1;
        ime.updatePosition(vX, 0);
        application.setCaretPos(vX, this.getCharTop_() - 1);
        application.showCaret(this);
    }

    hideCaret_() {
        application.hideCaret(this);
    }

    doCopy_() {
        this.copy();
    }

    doCopyToBrower_() {
        this.copyToBrower();
    }

    doCut_() {
        this.cut();
    }

    doPaste_() {
        this.paste();
    }

    canCopy_() {
        return this.selectExists();
    }

    canCut_() {
        return !this.readOnly && this.selectExists();
    }

    canPaste_() {
        return !this.readOnly;
    }

    doBackKeyDown_() {
        this.beginUpdate();
        try {
            if (this.selectExists())
                this.deleteSelect();
            else if (this._selStart > 0) {
                this.deleteText(this._selStart - 1, 1);
                this._selStart--;
                this._selMove = this._selStart;
                this.scrollAdjust_(this._selMove);
                this.showCaret_();
            }
        } finally {
            this.endUpdate();
        }
    }

    doDeleteKeyDown_() {
        this.beginUpdate();
        try {
            if (this.selectExists())
                this.deleteSelect();
            else 
            if (this._selStart < this.text.length) {
                this.deleteText(this._selStart, 1);
                this.showCaret_();
            }
        } finally {
            this.endUpdate();
        }
    }

    doLeftKeyDown_() {
        this.beginUpdate();
        try {
            if (!this.selectExists() && this._selStart > 0)
                this._selStart--;

            this._selEnd = -1;
            this._selMove = this._selStart;
            this.scrollAdjust_(this._selMove);
            this.showCaret_();
        } finally {
            this.endUpdate();
        }
    }

    doRightKeyDown_() {
        this.beginUpdate();
        try {
            if (!this.selectExists() && this._selStart < this.text.length)
                this._selStart++;
            
            this._selEnd = -1;
            this._selMove = this._selStart;
            this.scrollAdjust_(this._selMove);
            this.showCaret_();
        } finally {
            this.endUpdate();
        }
    }

    doHomeKeyDown_() {
        this.beginUpdate();
        try {
            this._selEnd = -1;
            this._selStart = 0;
            this._selMove = this._selStart;
            this.scrollAdjust_(this._selMove);
            this.showCaret_();
        } finally {
            this.endUpdate();
        }
    }

    doEndKeyDown_() {
        this.beginUpdate();
        try {
            this._selEnd = -1;
            this._selStart = this.text.length;
            this._selMove = this._selStart;
            this.scrollAdjust_(this._selMove);
            this.showCaret_();
        } finally {
            this.endUpdate();
        }
    }

    doMouseEnter_() {
        super.doMouseEnter_();
        if (!this._readOnly)
            this.update();
    }

    doMouseLeave_() {
        super.doMouseLeave_();
        if (!this._readOnly)
            this.update();
    }

    doMouseDown_(e) {
        super.doMouseDown_(e);
        if (e.button == TMouseButton.Left) {
            this.disSelect();
            //this._selEnd = -1;
            if (e.x > 0 && e.x < this.width - (this.borderVisible_ ? this.borderWidth_ : 0) - this.paddingRight) {
                this._selStart = this.getCharOffsetAt_(e.x, e.y);
                this._selMove = this._selStart;
                this.scrollAdjust_(this._selMove);
                this.resetSelect_();
            }
        } else if (this._selStart < 0) {
            this._selStart = this.getCharOffsetAt_(e.x, e.y);
            this._selMove = this._selStart;
            this.scrollAdjust_(this._selMove);
            this.resetSelect_();
        }
    }

    doMouseMove_(e) {
        let vTextRect = this.textArea();
        if (e.button === TMouseButton.Left) {  // left button down
            if (e.x < 0)
                this._leftOffset = Math.max(0, this._leftOffset - this.font.advCharWidth);
            else if (e.x > 0) {
                let vW = THCCanvas.textWidth(this.font, this._text);
                if (e.x > vTextRect.right)
                    this._leftOffset = Math.max(0, Math.min(vW - vTextRect.width, this._leftOffset + this.font.advCharWidth));
            }
            
            this._selEnd = this.getCharOffsetAt_(e.x, e.y);
            this._selMove = this._selEnd;
            if (!this.selectExists()) {
                if (this._selEnd >= 0) {
                    this._selEnd = -1;
                    this._selMove = this._selStart;
                }
            }

            this.scrollAdjust_(this._selMove);
            this.resetSelect_();
        }

        if (vTextRect.pointInAt(e.x, e.y))
            this.cursor = TCursors.Ibeam;
        else
            this.cursor = TCursors.Default;

        super.doMouseMove_(e);
    }

    doMouseUp_(e) {
        if (e.button == TMouseButton.Left && this._selEnd >= 0 && this._selEnd < this._selStart) {
            let vSel = this._selStart;
            this._selStart = this._selEnd;
            this._selEnd = vSel;
        }

        super.doMouseUp_(e);
    }

    doKeyDown_(e) {
        if (this.readOnly)
            return;

        switch (e.keyCode) {
            case TKey.Back:
                this.doBackKeyDown_();
                break;

            case TKey.Delete:
                this.doDeleteKeyDown_();
                break;

            case TKey.Left:
                if (e.shift.compare(new Set([TShiftState.Shift])))
                    this._selectActionLeft();
                else
                    this.doLeftKeyDown_();

                break;

            case TKey.Right:
                if (e.shift.compare(new Set([TShiftState.Shift])))
                    this._selectActionRight();
                else
                    this.doRightKeyDown_();

                break;

            case TKey.Home:
                this.doHomeKeyDown_();
                break;

            case TKey.End:
                this.doEndKeyDown_();
                break;

            case TKey.A:
                if (e.shift.compare(new Set([TShiftState.Ctrl])))
                    this.selectAll();
                
                break;

            case TKey.C:
                if (e.shift.compare(new Set([TShiftState.Ctrl])))
                    this.copy();
                
                break;
    
            case TKey.V:
                if (e.shift.compare(new Set([TShiftState.Ctrl])))
                    this.paste();

                break;

            case TKey.X:
                if (e.shift.compare(new Set([TShiftState.Ctrl]))) 
                    this.cut();
            
                break;
        }     
    }

    doKeyPress_(e) {
        this.insertText(this._selStart, e.key);
    }

    doSetFocus_(accept) {
        super.doSetFocus_(accept);
        this._createCaret();        
    }

    doKillFocus_() {
        this.disSelect();
        this._selStart = -1;
        this._selMove = -1;
        this._leftOffset = 0;
        super.doKillFocus_();
    }

    doDblClick_(e) {
        this.selectAll();
        super.doDblClick_(e);
    }

    doPaintBackground_(hclCanvas) {
        let vRect = this.clientRect();
        // background
        vRect.left = this.paddingLeft;
        hclCanvas.brush.color = theme.backgroundContentColor;
        hclCanvas.fillRect(vRect);

        // selected background
        if (this.selectExists()) 
            this.doPaintSelected_(hclCanvas);

        // border
        if (this.borderVisible_) {
            vRect.left -= this.borderWidth_;
            this.doPaintBorder_(hclCanvas, vRect);
        }

        vRect = this.textArea();
        // more hint
        if (this._leftOffset > 0) {
            hclCanvas.brush.color = this.font.color;
            hclCanvas.fillBounds(vRect.left - 1, vRect.top + 1, 1, vRect.height - 2);
        }

        let vW = THCCanvas.textWidth(this.font, this._text);
        if (vW > this._leftOffset + vRect.width) {
            hclCanvas.brush.color = this.font.color;
            hclCanvas.fillBounds(vRect.right + 1, vRect.top + 1, 1, vRect.height - 2);
        }
    }

    doPaintText_(hclCanvas, x, y) {
        if (this._text != "")
            hclCanvas.textOut(x - this._leftOffset, y, this._text);
    }

    doPaint_(hclCanvas) {
        hclCanvas.save();
        try {
            let vRect = this.textArea();
            hclCanvas.clipRect(vRect);
            if (this.text != "")
                super.doPaint_(hclCanvas);
            else if (!this.focused && this._textPrompt != "") {
                hclCanvas.font.styles.value = TFontStyle.Italic;
                hclCanvas.font.color = TColor.Gray;
                hclCanvas.textOut(this.getCharLeft_(0), this.getCharTop_(), this._textPrompt);
            }
        } finally {
            hclCanvas.restore();
        }
    }

    doSetText_() {
        this.disSelect();
        if (this._selStart > this.text.length)
            this._selStart = this.text.length;

        super.doSetText_();
    }

    dispose() {
        this._destroyCaret();        
    }

    insertText(index, text) {
        this.beginUpdate();
        try {
            if (this.selectExists())
                this.deleteSelect();

            super.insertText(index, text);

            if (this._selStart >= 0) {
                this._selStart += text.length;
                this._selMove = this._selStart;
                this.scrollAdjust_(this._selMove);
                this.showCaret_();
            }
        } finally {
            this.endUpdate();
        }
    }

    copy() {
        if (this.selectExists())
            clipboard.setText(this.selectText());
    }

    copyToBrower() {
        if (this.selectExists())
            clipboard.toBrowerClipboard(this.selectText());
    }

    cut() {
        this.copy();
        this.deleteSelect();
    }

    paste() {
        this._innerPasted = false;
        let vText = clipboard.getText();
        if (vText != null) {
            this._innerPasted = true;
            this.insertText(this._selStart, vText);
        }
    }

    deleteSelect() {
        this.beginUpdate();
        try {
            this.deleteText(this._selStart, this.selLength);
            this._selEnd = -1;
            this._selMove = this._selStart;
            this.scrollAdjust_(this._selMove);
            this.showCaret_();
        } finally {
            this.endUpdate();
        }
    }

    disSelect() {
        this._selMove = this._selStart;
        if (this.selectExists()) {
            this._selEnd = -1;
            this.resetSelect_();
        } 
    }

    select(start, length = 0) {
        if (start < 0)
            return;

        this._selStart = start;
        if (length >= 0) {
            this._selEnd = start + length;
            this._selMove = this._selEnd;
        } else {
            this._selEnd = -1;
            this._selMove = this._selStart;
        }

        this.scrollAdjust_(this._selMove);
        this.resetSelect_();
    }

    selectAll() {
        this.select(0, this.text.length);
    }

    selectText() {
        if (this._selEnd >= 0)
            return this.text.substring(this._selStart, this._selEnd);

        return "";
    }

    selectExists() {
        if ((this._selEnd >= 0) && (this._selEnd != this._selStart))
            return true;
        
        return false;
    }

    imeInput(text, isPaste) {
        if (isPaste && this._innerPasted)
            return;

        if (!this.readOnly) {
            this.insertText(this._selStart, text);
        }
    }

    get selStart() {
        if (this.selectExists() && (this._selEnd < this._selStart))
            return this._selEnd;

        return this._selStart;
    }

    get selLength() {
        if (this._selEnd < 0) 
            return 0;

        return Math.abs(this._selEnd - this._selStart);
    }

    get helpText() {
        return this._textPrompt;
    }

    set textPrompt(val) {
        if (this._textPrompt != val) {
            this._textPrompt = val;
            this.update();
        }
    }
}

export class TLableEdit extends TEdit {
    constructor(lableText, text) {
        super(text);
        this._lableText = lableText;
        this._paddingLeft = theme.marginSpaceDouble + THCCanvas.textWidth(this.font, this._lableText);
    }

    doPaintBackground_(hclCanvas) {
        hclCanvas.textOut(theme.marginSpace, this.getCharTop_(), this._lableText);
        super.doPaintBackground_(hclCanvas);
    }
}

export class TButtonEdit extends TEdit {
    constructor(text) {
        super(text);
        
        this.image = new Image(theme.iconSize, theme.iconSize);
        this.image.onload = (e) => {  // eslint-disable-line
            this._updateButtonRect();
        }

        this._paddingRight = theme.iconSize;
        this._buttonMouseIn = false;
        this._buttonDown = false;
        this.calcButtonRect_();
    }

    doButtonClick_() {
        this.onButtonClick();
    }

    _updateButtonRect() {
        this.updateRect(this._buttonRect);
    }

    calcButtonRect_() {
        this._buttonRect = TRect.Create(this.width - this._paddingRight + 1,  // 让出右侧未显示内容提示线 
            this.borderWidth_, this.width - this.borderWidth_, this.height - this.borderWidth_);
    }

    doPaintBackground_(hclCanvas) {
        super.doPaintBackground_(hclCanvas);
        if (this._buttonMouseIn) {
            if (this._buttonDown)
                hclCanvas.brush.color = theme.backgroundDownColor;
            else 
                hclCanvas.brush.color = theme.backgroundHotColor;

            hclCanvas.fillRect(this._buttonRect);
        }

        if (this.image.loaded)
            hclCanvas.drawImage(this._buttonRect.left, this._buttonRect.top, this.image);
        else
            theme.drawDropDown(hclCanvas, this._buttonRect)
    }

    doMouseEnter_() {
        super.doMouseEnter_();
        this.cursor = TCursors.Ibeam;  // 按钮点击后移出控件，为下次从非按钮移入做准备
    }

    doMouseLeave_() {
        this._buttonMouseIn = false;
        this._buttonDown = false;
        super.doMouseLeave_();
    }

    doMouseDown_(e) {
        if (this._buttonRect.pointInAt(e.x, e.y)) {
            this.hideCaret_();
            this._buttonDown = true;
            this._updateButtonRect();
            if (!this.focused)  // 首次直接点在按钮上
                super.doMouseDown_(e);
        } else {
            this._buttonDown = false;
            super.doMouseDown_(e);
        }
    }

    doMouseMove_(e) {
        if (this._buttonRect.pointInAt(e.x, e.y)) {
            if (!this._buttonMouseIn) {
                this._buttonMouseIn = true;
                this._updateButtonRect();
                this.cursor = TCursors.Default;
            }
        } else if (this._buttonMouseIn) {
            this._buttonMouseIn = false;
            this._updateButtonRect();
            this.cursor = TCursors.Ibeam;
        }

        if (!this._buttonDown)
            super.doMouseMove_(e);
    }

    doMouseUp_(e) {
        if (this._buttonDown) {
            this._buttonDown = false;
            this._updateButtonRect();
            if (this._buttonRect.pointInAt(e.x, e.y))
                this.doButtonClick_();            
        } else
            super.doMouseUp_(e);
    }

    doDblClick_(e) {
        if (!this._buttonRect.pointInAt(e.x, e.y))
            super.doDblClick_(e);
    }

    doResize_() {
        super.doResize_();
        this.calcButtonRect_();
    }

    onButtonClick() { }
}

export class TListItem extends TObject {
    constructor() {
        super();
        this.text = "";
        this.object = null;
    }

    static Create(text, obj) {
        let vItem = new TListItem();
        vItem.text = text;
        vItem.object = obj;
        return vItem;
    }
}

export class TListItems extends TList {
    constructor(ownsObjects = true) {
        super(ownsObjects)
    }

    add(text, obj = null) {
        super.add(TListItem.Create(text, obj));
    }
}

export class TListBox extends TTextControl {
    constructor() {
        super("");
        this._height = 100;
        this._itemIndex = -1;
        this._hotIndex = -1;
        this._displayFirst = -1;
        this._displayLast = -1;
        this._paddingLeft = 2;
        this._paddingTop = 2;
        this._paddingRight = 2;
        this._paddingBottom = 2;
        this.borderVisible_ = true;
        this._mouseDownScrollBar = false;
        this._scrollBar = new TScrollBar;
        this._scrollBar.width = 20;
        this._scrollBar.orientation = TOrientation.Vertical;
        this._scrollBar.onScroll = (scrollCode, position) => {  // eslint-disable-line
            this._calcDisplayItem();
            this.update();
        }

        this._items = new TListItems();
        this._items.onAdded = (item) => {  // eslint-disable-line
            this._reSetContent();
        }

        this._items.onRemoved = (item) => {  // eslint-disable-line
            this._itemIndex = -1;
            this._hotIndex = -1;
            this._reSetContent();
        }

        this._onSelectedIndexChange = null;
    }

    _getTopOffset() {
        if (this._scrollBar.visible)
            return this._scrollBar.position;
        else
            return 0;
    }

    _calcDisplayItem() {
        if (this._items.count > 0) {
            this._displayFirst = 0;
            let vTop = this.paddingTop - this._getTopOffset() + this.font.height + theme.marginSpaceDouble;
            for (let i = 0; i < this._items.count; i++) {
                if (vTop > 0) {
                    this._displayFirst = i;
                    break;
                }
                else
                    vTop = vTop + this.font.height + theme.marginSpaceDouble;
            }

            this._displayLast = this._items.count - 1;
            for (let i = this._displayFirst; i < this._items.count; i++) {
                if (vTop > this._height - this.paddingBottom) {
                    this._displayLast = i;
                    break;
                }
                else
                    vTop = vTop + this.font.height + theme.marginSpaceDouble;
            }
        } else {
            this._displayFirst = -1;
            this._displayLast = -1;
        }
    }

    _getItemRect(index) {
        return TRect.CreateByBounds(this.paddingLeft, 
            index * (this.font.height + theme.marginSpaceDouble) - this._getTopOffset() + this.paddingTop + (this.borderVisible_ ? this.borderWidth_ : 0), 
            this.width - this._paddingLeft - this.paddingRight, this.font.height + theme.marginSpaceDouble);
    }

    _getItemIndexAt(x, y) {
        if (x > 0 && x < (this._scrollBar.visible ? this._scrollBar.left : this.width)) {
            let vTop = -this._getTopOffset();
            for (let i = 0; i < this._items.count; i++) {
                if (y > vTop && y <= vTop + this.font.height + theme.marginSpaceDouble)
                    return i;
                else
                    vTop += this.font.height + theme.marginSpaceDouble;
            }
        }

        return -1;
    }

    _getContentHeight() {
        return this._items.count * (this.font.height + theme.marginSpaceDouble);
    }

    _setHotIndex(val) {
        if (val != this._hotIndex) {
            let vIndex = this._hotIndex;            
            this._hotIndex = val;
            if (vIndex >= 0)
                this.updateRect(this._getItemRect(vIndex));
                
            if (this._hotIndex >= 0)
                this.updateRect(this._getItemRect(this._hotIndex));
        }
    }

    doSelectedIndexChange_() {
        if (this._onSelectedIndexChange != null)
            this._onSelectedIndexChange();
    }

    _setItemIndex(val) {
        if (val != this._itemIndex) {
            let vIndex = this._itemIndex;            
            this._itemIndex = val;
            if (vIndex >= 0)
                this.updateRect(this._getItemRect(vIndex));
                
            if (this._itemIndex >= 0 && this._itemIndex < this._items.count) {
                this.text = this._items[this._itemIndex].text;
                let vRect = this._getItemRect(this._itemIndex);
                if (vRect.top < this.paddingTop)
                    this._scrollBar.position -= this.paddingTop - vRect.top;
                else
                if (vRect.bottom > this.height - this.paddingBottom)
                    this._scrollBar.position += vRect.bottom - this.height + this.paddingBottom;
                else
                    this.update();
            } else
                this.text = "";

            this.doSelectedIndexChange_();
        }
    }

    _reSetContent() {
        let vH = this._getContentHeight();
        if (vH > this.height) {
            //this._paddingRight = this._paddingRight + this._scrollBar.width;
            //this._scrollBar.width = this._paddingRight;
            
            if (this.borderVisible_) {
                this._scrollBar.height = this.height - this.borderWidth_ - this.borderWidth_ - 1;
                this._scrollBar.left = this.width - this._scrollBar.width - this._paddingRight - this.borderWidth_ + 2;
                this._scrollBar.top = this.borderWidth_ + 1;
            } else {
                this._scrollBar.height = this.height;
                this._scrollBar.left = this.width - this._scrollBar.width - this._paddingRight;
                this._scrollBar.top = 0;
            }                

            this._scrollBar.max = vH;
            this._scrollBar.visible = true;
        }
        else {
            //this._paddingRight = this._paddingRight - this._scrollBar.width;
            this._scrollBar.visible = false;
        }

        this._calcDisplayItem();
        this.update();
    }

    doSetPaddingRight_(val) {
        super.doSetPaddingRight_(val);
    }

    doResize_() {
        super.doResize_();
        this._reSetContent();
    }

    doMouseEnter_() {
        super.doMouseEnter_();
        this.update();
    }

    doMouseLeave_() {
        this._hotIndex = -1;
        super.doMouseLeave_();
        this.update();
    }

    doMouseWheel_(e) {
        if (this._scrollBar.visible) {
            if (e.delta < 0)
                this._scrollBar.position += 20;
            else
                this._scrollBar.position -= 20;
        }

        super.doMouseWheel_(e);
    }

    doMouseDown_(e) {
        this._mouseDownScrollBar = false;
        if (this._scrollBar.visible) {
            let vRect = this._scrollBar.bounds();
            if (vRect.pointInAt(e.x, e.y)) {
                this._mouseDownScrollBar = true;
                let vMouseArgs = new TMouseEventArgs();
                vMouseArgs.assign(e);
                vMouseArgs.x -= vRect.left;
                vMouseArgs.y -= vRect.top;
                this._scrollBar.mouseDown(vMouseArgs);
                return;
            }
        }

        if (this.textArea().pointInAt(e.x, e.y))
            super.doMouseDown_(e);
    }

    doMouseMove_(e) {
        let vBarHandled = false;
        if (this._scrollBar.visible) {
            let vRect = this._scrollBar.bounds();
            if (vRect.pointInAt(e.x, e.y)) {
                vBarHandled = true;
                let vMouseArgs = new TMouseEventArgs();
                vMouseArgs.assign(e);
                vMouseArgs.x -= vRect.left;
                vMouseArgs.y -= vRect.top;
                this._scrollBar.mouseMove(vMouseArgs);
            } else if (this._mouseDownScrollBar) {
                vBarHandled = true;
                let vMouseArgs = new TMouseEventArgs();
                vMouseArgs.assign(e);
                vMouseArgs.x = vRect.left;  // 约束到滚动条位置
                vMouseArgs.y -= vRect.top;
                this._scrollBar.mouseMove(vMouseArgs);
            }
        }

        if (vBarHandled && this._hotIndex >= 0) {
            this._setHotIndex(-1);
            return;
        }

        if (this._mouseDownScrollBar)
            this._setHotIndex(-1);
        else
            this._setHotIndex(this._getItemIndexAt(e.x, e.y));

        super.doMouseMove_(e);
    }

    doMouseUp_(e) {
        if (this._mouseDownScrollBar) {
            if (this._scrollBar.visible) {
                let vRect = this._scrollBar.bounds();
                if (vRect.pointInAt(e.x, e.y)) {
                    let vMouseArgs = new TMouseEventArgs();
                    vMouseArgs.assign(e);
                    vMouseArgs.x -= vRect.left;
                    vMouseArgs.y -= vRect.top;
                    this._scrollBar.mouseUp(vMouseArgs);
                }
            }

            this._mouseDownScrollBar = false;
            return;
        }
        
        if (this._scrollBar.visible) {
            let vRect = this._scrollBar.bounds();
            if (vRect.pointInAt(e.x, e.y))
                return;
        }

        if (e.button == TMouseButton.Left && this.textArea().pointInAt(e.x, e.y))
            this.itemIndex = this._getItemIndexAt(e.x, e.y);

        super.doMouseUp_(e);
    }    

    _doPaintBorder(hclCanvas, rect) {
        hclCanvas.pen.width = this.borderWidth_;
        if (this._readOnly)
            hclCanvas.pen.color = theme.borderColor;
        else if (this.focused)
            hclCanvas.pen.color = theme.borderActiveColor;
        else if (this.mouseIn)
            hclCanvas.pen.color = theme.borderHotColor;
        else
            hclCanvas.pen.color = theme.borderColor;
            
        hclCanvas.rectangleRect(rect);
    }

    _doPaintSelected(hclCanvas) { }  // eslint-disable-line

    doPaintBackground_(hclCanvas) {
        let vRect = this.clientRect();

        // background
        hclCanvas.brush.color = theme.backgroundContentColor;
        hclCanvas.fillRect(vRect);

        // selected or hot background
        if (this._itemIndex >= 0 || this._hotIndex >= 0) {
            let vTextRect = this.textArea();
            if (this._itemIndex >= 0) {
                let vItemRect = this._getItemRect(this._itemIndex);
                vItemRect = vTextRect.intersection(vItemRect);
                hclCanvas.brush.color = theme.backgroundSelectColor;
                hclCanvas.fillRect(vItemRect);
            }

            if (this._hotIndex >= 0 && this._hotIndex != this._itemIndex) {
                let vHotRect = this._getItemRect(this._hotIndex);
                vHotRect = vTextRect.intersection(vHotRect);
                hclCanvas.brush.color = theme.backgroundHotColor;
                hclCanvas.fillRect(vHotRect);
            }            
        }

        // border
        if (this.borderVisible_)
            this._doPaintBorder(hclCanvas, vRect);
    }

    doPaintText_(hclCanvas, x, y) {  // eslint-disable-line
        let vLeft = this.paddingLeft + theme.marginSpace + (this.borderVisible_ ? this.borderWidth_ : 0);
        if (this._displayLast < 0)
            return;

        let vTop = this._getItemRect(this._displayFirst).top;  // this.paddingTop - this._getTopOffset();
        for (let i = this._displayFirst; i <= this._displayLast; i++) {
            hclCanvas.textOut(vLeft, vTop + theme.marginSpace, this._items[i].text);
            vTop += this.font.height + theme.marginSpaceDouble;
        }
    }

    doSetBorderVisible_() {
        this._reSetContent();
        super.doSetBorderVisible_();
    }

    doPaint_(hclCanvas) {
        let vRect = this.textArea();
        hclCanvas.save();
        try {
            hclCanvas.clipRect(vRect);
            this.doPaintText_(hclCanvas, this.paddingLeft, this.paddingTop);
        } finally {
            hclCanvas.restore();
        }

        if (this._scrollBar.visible) {
            vRect = this.clientRect();
            hclCanvas.save();
            try {
                hclCanvas.clipRect(vRect);
                this._scrollBar.paintTo(hclCanvas, this._scrollBar.left, this._scrollBar.top);
            } finally {
                hclCanvas.restore();
            }
        }
    }

    dispose() {
        this._items.clear();        
    }

    textArea() {
        let rect = super.textArea();
        if (this._scrollBar.visible)
            rect.right = rect.right - this._scrollBar.width + 2;

        return rect;
    }

    addItem(text, obj = null) {
        this._items.add(text, obj);
    }

    deleteItem(index) {
        if (index >= 0 && index < this._items.count)
            this._items.removeAt(index);
    }

    itemIndexOf(text) {
        for (let i = 0; i < this._items.count; i++) {
            if (this._items[i].text == text)
                return i;
        }

        return -1;
    }

    get items() {
        return this._items;
    }

    set items(val) {
        this._items = val;
        this._reSetContent();
    }

    get selectItem() {
        if (this._itemIndex >= 0)
            return this._items[this._itemIndex];
        else
            return null;
    }

    get itemIndex() {
        return this._itemIndex;
    }

    set itemIndex(val) {
        this._setItemIndex(val);
    }

    get contentHeight() {
        return this._getContentHeight();
    }

    get onSelectedIndexChange() {
        return this._onSelectedIndexChange;
    }

    set onSelectedIndexChange(val) {
        this._onSelectedIndexChange = val;
    }
}

export var TDropDownStyle = {
    DropDown: 1,
    DropDownList: 2
}

export class TCombobox extends TButtonEdit {
    constructor(text) {
        super(text);
        this._dropDownStyle = TDropDownStyle.DropDown;
        this._popupAlign = TAlign.Left;
        this._DropDownWidth = 100;
        this._dropDownCount = 8;
        this._popupDownInTextArea = false;
        this._onSelectedIndexChange = null;
        this._listBox = new TListBox();
        this._listBox.paddingLeft = 0;
        this._listBox.paddingTop = 0;
        this._listBox.paddingRight = 0;
        this._listBox.paddingBottom = 0;
        //this._listBox.canFocus = false;
        this._listBox.onUpdate = (rect) => {
            this._listBoxUpdate(rect);
        }

        this._listBox.onSelectedIndexChange = () => {
            this.text = this._listBox.text;
            if (this._onSelectedIndexChange != null)
                this._onSelectedIndexChange();
        }

        this._popupControl = null;
    }

    _listBoxUpdate(rect) {
        if (this._popupControl != null)
            this._popupControl.updateRect(rect);
    }

    _popup() {
        if (this._popupControl == null) {
            this._listBox.width = this._DropDownWidth;
            this._listBox.itemIndex = this._listBox.itemIndexOf(this.text);
            let vDropH = this._dropDownCount * (this._listBox.font.height + theme.marginSpaceDouble);
            let vContentH = this._listBox.contentHeight;
            if (vContentH > vDropH)
                this._listBox.height = vDropH;
            else
                this._listBox.height = vContentH;

            this._popupControl = new TPopupControl();
            this._popupControl.width = this._listBox.width;
            this._popupControl.height = this._listBox.height;
            this._popupControl.dropDownStyle = true;
            this._popupControl.onClose = () => {
                this._popupControl = null;
            }

            this._popupControl.onPaint = (hclCanvas) => {
                this._listBox.paintTo(hclCanvas, 0, 0);
            }

            this._popupControl.onMouseEnter = () => {
                this._listBox.mouseEnter();
            }

            this._popupControl.onMouseLeave = () => {
                this._listBox.mouseLeave();
            }

            this._popupControl.onMouseWheel = (e) => {
                this._listBox.mouseWheel(e);
            }

            this._popupControl.onMouseDown = (e) => {
                this._popupDownInTextArea = this._listBox.textArea().pointInAt(e.x, e.y);
                this._listBox.mouseDown(e);
            }

            this._popupControl.onMouseMove = (e) => {
                this._listBox.mouseMove(e);
            }

            this._popupControl.onMouseUp = (e) => {
                this._listBox.mouseUp(e);
                if (this._popupDownInTextArea && this._listBox.textArea().pointInAt(e.x, e.y)) {
                    if (this._listBox.itemIndex >= 0)
                        this.text = this._listBox.selectItem.text;

                    this._popupControl.closePopup();
                }
            }
        }

        let vPoint = this.clientToScreen(TPoint.Create(0, 0));
        if (this._popupAlign == TAlign.Left)
            vPoint.x += this.paddingLeft - (this.borderVisible_ ? this.borderWidth_ : 0);
        else
            vPoint.x += this.width - this._popupControl.width;

        this._popupControl.popup(vPoint.x, vPoint.y + this.height, true);
    }

    doButtonClick_() {
        if (!this.readOnly)
            this._popup();

        super.doButtonClick_();
    }

    addItem(text, obj = null) {
        this._listBox.addItem(text, obj);
    }

    removeItem(index) {
        this._listBox.removeItem(index);
    }

    get dropDownWidth() {
        return this._DropDownWidth;
    }

    set dropDownWidth(val) {
        this._DropDownWidth = val;
    }

    get itemIndex() {
        return this._listBox.itemIndex;
    }

    set itemIndex(val) {
        this._listBox.itemIndex = val;
    }

    get dropDownStyle() {
        return this._dropDownStyle;
    }

    set dropDownStyle(val) {
        this._dropDownStyle = val;
    }

    get onSelectedIndexChange() {
        return this._onSelectedIndexChange;
    }

    set onSelectedIndexChange(val) {
        this._onSelectedIndexChange = val;
    }
}

export class TFontCombobox extends TCombobox {
    constructor() {
        super();
        this.dropDownStyle = TDropDownStyle.DropDownList;
        let vDetect = new TFontDetector();
        if (vDetect.detect("宋体"))
            this.addItem("宋体");

        if (vDetect.detect("幼圆"))
            this.addItem("幼圆");

        if (vDetect.detect("楷体"))
            this.addItem("楷体");

        if (vDetect.detect("隶书"))
            this.addItem("隶书");

        if (vDetect.detect("黑体"))
            this.addItem("黑体");

        if (vDetect.detect("Arial"))
            this.addItem("Arial");

        if (vDetect.detect("Tahoma"))
            this.addItem("Tahoma");

        if (vDetect.detect("Calibri"))
            this.addItem("Calibri");

        if (vDetect.detect("Courier New"))
            this.addItem("Courier New");

        this.itemIndex = 0;
    }
}

class TCustomMenuItem extends TObject {
    constructor(text) {
        super();
        this.text = text;
        this.subItems = new TList();
        this.enabled = true;
        this.visible = true;
        this.left = 0;
        this.top = 0;
        this.shortCut = 0;
        this.width = theme.popupMenuImagePadding + theme.marginSpaceDouble;
        this.height = theme.marginSpaceDouble;
    }

    paint(hclCanvas) {
        let vTop;
        if (!this.isSpliter) {
            vTop = this.top + Math.trunc((this.height - hclCanvas.font.height) / 2);
            hclCanvas.textOut(this.left + theme.popupMenuImagePadding + theme.marginSpace, vTop, this.text);
            if (this.subItems.count > 0)
                theme.drawDropRight(hclCanvas, TRect.CreateByBounds(this.left + this.width - theme.iconSize, this.top, theme.iconSize, this.height));
        } else {
            vTop = this.top + Math.trunc(this.height / 2);
            hclCanvas.drawLineDriect(this.left + theme.popupMenuImagePadding, vTop,
                this.left + this.width - theme.marginSpace, vTop);
        }
    }

    bounds() {
        return TRect.CreateByBounds(this.left, this.top, this.width, this.height);
    }

    get isSpliter() {
        return this.text == "-";
    }    
}

class TMenuItem extends TCustomMenuItem {
    constructor(text) {
        super(text);
        this._popupControl = null;
        this.dropDownStyle = false;
        this.image = TImage.Create(16, 16);
        this._onClick = null;
        this.onPupup = null;
    }

    _closePopupControl_() {
        if (this._popupControl != null)
            this._popupControl.close();
    }

    paint(hclCanvas) {
        if (!this.enabled)
            hclCanvas.font.color = theme.textDisableColor;
        else
            hclCanvas.font.color = theme.textColor;
        
        super.paint(hclCanvas);
    }

    visibleCount() {
        let vCount = 0;
        for (let i = 0; i < this.subItems.count; i++)
            if (this.subItems[i].visible)
                vCount++;

        return vCount;
    }

    addItem(text) {
        let vItem = new TMenuItem(text);
        this.subItems.add(vItem);
        return vItem;
    }

    addControl(control) {
        // to do: new TMenuItemControl
        this.subItems.add(control);
    }

    addSpliter() {
        this.addItem("-");
    }

    popup(x, y, root = true) {
        if (this.visibleCount() > 0 && this._popupControl == null) {
            if (this.onPupup != null)
                this.onPupup();

            this._popupControl = new TPopupMenuControl(this);  // 创建并计算PopupControl的大小
            this._popupControl.dropDownStyle = this.dropDownStyle;
            this._popupControl.onClose = () => {
                this._popupControl = null;
            }

            this._popupControl.popup(x, y, root);
        }
    }

    popupControl(control, root = true) {
        let vPoint = control.clientToScreen(TPoint.Create(0, 0));
        this.popup(vPoint.x, vPoint.y + control.height, root);
    }

    get hasSubItem() {
        return this.subItems.count > 0;
    }

    get onClick() {
        return this._onClick;
    }

    set onClick(val) {
        this._onClick = val;
    }
}

export class TPopupMenu extends TMenuItem {
    constructor() {
        super("");
    }
}

class TPopupMenuControl extends TPopupControl {
    constructor(menuItem) {
        super();
        this.font = new TFont();
        this._mouseMoveIndex = -1;
        this.menuItem = menuItem;
        this.adjustPosition = true;
        this._calcPopupControl();
    }

    _calcPopupControl() {
        let vHeight = 0, vTop = 0, vMaxWidth = 100; 
        let vItem = null;

        // TAlign.alTop
        for (let i = 0, vCount = this.menuItem.subItems.count; i < vCount; i++) {
            vItem = this.menuItem.subItems[i];
            if (vItem.visible) {
                vItem.left = 0;
                vItem.top = vTop;
                
                if (vItem.isSpliter) {
                    vItem.width = theme.marginSpaceDouble;
                    vItem.height = theme.marginSpace;
                } else {
                    vItem.width = theme.popupMenuImagePadding + theme.marginSpace
                        + THCCanvas.textWidth(this.font, vItem.text) + theme.iconSize;

                    vItem.height = this.font.height + theme.marginSpaceDouble;
                }

                if (vMaxWidth < vItem.width)
                    vMaxWidth = vItem.width;

                vTop = vItem.top + vItem.height;
                vHeight += vItem.height;
            }
        }

        for (let i = 0, vCount = this.menuItem.subItems.count; i < vCount; i++) {
            vItem = this.menuItem.subItems[i];
            if (vItem.visible)
                vItem.width = vMaxWidth;
        }

        this.width = vMaxWidth;
        this.height = vHeight;
    }

    _getItemIndexAt(x, y) {
        for (let i = 0; i < this.menuItem.subItems.count; i++) {
            if (!this.menuItem.subItems[i].isSpliter && this.menuItem.subItems[i].visible && this.menuItem.subItems[i].bounds().pointInAt(x, y))
                return i;
        }

        return -1;
    }

    _getItemAt(x, y) {
        let vIndex = this._getItemIndexAt(x, y);
        if (vIndex >= 0)
            return this.items[vIndex];

        return null;
    }

    doMouseMove_(e) {
        super.doMouseMove_(e);
        let vIndex = this._getItemIndexAt(e.x, e.y);
        if (this._mouseMoveIndex != vIndex) {
            if (this._mouseMoveIndex >= 0)
                this.menuItem.subItems[this._mouseMoveIndex]._closePopupControl_();

            this._mouseMoveIndex = vIndex;
            if (this._mouseMoveIndex >= 0) {
                let vItem = this.menuItem.subItems[this._mouseMoveIndex];
                if (vItem.visible && vItem.enabled)
                    vItem.popup(this.left + this.width, this.top + vItem.top, false);
            }
            
            this.update();
        }
    }

    doMouseUp_(e) {
        super.doMouseUp_(e);
        if (this._mouseMoveIndex >= 0) {
            let vItem = this.menuItem.subItems[this._mouseMoveIndex];
            if (vItem.enabled && vItem.onClick != null) {
                vItem.onClick();
                this.closePopup();
            }
        }
    }

    doPaintBackground_(hclCanvas) {
        super.doPaintBackground_(hclCanvas);
        if (this._mouseMoveIndex >= 0) {
            let vItem = this.menuItem.subItems[this._mouseMoveIndex];
            if (!vItem.isSpliter && vItem.visible) {
                if (vItem.enabled)
                    hclCanvas.brush.color = theme.backgroundSelectColor;
                else
                    hclCanvas.brush.color = theme.backgroundHotColor;

                hclCanvas.fillRect(vItem.bounds());
            }
        }

        hclCanvas.pen.width = 1;
        hclCanvas.pen.color = TColor.Gray;
        hclCanvas.drawLineDriect(theme.popupMenuImagePadding, 0, theme.popupMenuImagePadding, this.height);
    }

    doPaint_(hclCanvas) {
        super.doPaint_(hclCanvas);
        hclCanvas.font.assign(this.font);
        for (let i = 0, vCount = this.menuItem.subItems.count; i < vCount; i++) {
            if (this.menuItem.subItems[i].visible)
                this.menuItem.subItems[i].paint(hclCanvas);
        }
    }
}