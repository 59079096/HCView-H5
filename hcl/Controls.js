import { TObject, TList, TRect, TPoint } from "./System.js";
import { TMessage } from "./Messages.js";
import { application } from "./Application.js";
import { TBrushStyle, TPenStyle, TColor } from "./Graphics.js";

/**
 * HCL枚举：对齐方式
 */
export var TAlign = {
    None: 0,    // 无对齐
    Left: 1,    // 左对齐
    Top: 2,     // 顶对齐
    Right: 3,   // 右对齐
    Bottom: 4,  // 底对齐
    Client: 5   // 充满客户区
}

export var TOrientation = {
    Horizontal: 0, 
    Vertical: 1
}

export var TModalResult = {
    Close: 0,
    Ok: 1,
    Cancel: 2
}

export var TMouseStates = {
    MouseIn: 1,
    MouseDown: 2
}

export var TShiftState = {
    Shift: 1,
    Alt: 2,
    Ctrl: 3
}

export var TMouseButton = {
    Left: 1,
    Right: 2,
    Middle: 3
}

export var TCursors = {
    Default: 0,
    Arrow: 1,
    Cross: 2,
    Drag: 3,
    HandPoint: 4,
    HourGlass: 5,
    HoriSplit: 6,
    Ibeam: 7,
    No: 8,
    NoDrop: 9,
    SizeAll: 10,
    SizeNESW: 11,
    SizeNS: 12,
    SizeNWSE: 13,
    SizeWE: 14,
    VertSplit: 15
}

export var THorizontalAlign = {
    Left: 0,
    Right: 1,
    Center: 2
}

export var TVerticalAlign = {
    Top: 0,
    Bottom: 1, 
    Center: 2
}

export var TKey = {
    None: 0,
    LButton: 1,
    RButton: 2,
    Cancel: 3,
    MButton: 4,
    XButton1: 5,
    XButton2: 6,
    Back: 8,
    Tab: 9,
    LineFeed: 10,
    Clear: 12,
    Return: 13,
    Enter: 13,
    ShiftKey: 16,
    ControlKey: 17,
    Menu: 18,
    Pause: 19,
    Capital: 20,
    CapsLock: 20,
    KanaMode: 21,
    HanguelMode: 21,
    HangulMode: 21,
    JunjaMode: 23,
    FinalMode: 24,
    HanjaMode: 25,
    KanjiMode: 25,
    Escape: 27,
    IMEConvert: 28,
    IMENonconvert: 29,
    IMEAccept: 30,
    IMEAceept: 30,
    IMEModeChange: 31,
    Space: 32,
    Prior: 33,
    PageUp: 33,
    Next: 34,
    PageDown: 34,
    End: 35,
    Home: 36,
    Left: 37,
    Up: 38,
    Right: 39,
    Down: 40,
    Select: 41,
    Print: 42,
    Execute: 43,
    Snapshot: 44,
    PrintScreen: 44,
    Insert: 45,
    Delete: 46,
    Help: 47,
    D0: 48,
    D1: 49,
    D2: 50,
    D3: 51,
    D4: 52,
    D5: 53,
    D6: 54,
    D7: 55,
    D8: 56,
    D9: 57,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    LWin: 91,
    RWin: 92,
    Apps: 93,
    Sleep: 95,
    NumPad0: 96,
    NumPad1: 97,
    NumPad2: 98,
    NumPad3: 99,
    NumPad4: 100,
    NumPad5: 101,
    NumPad6: 102,
    NumPad7: 103,
    NumPad8: 104,
    NumPad9: 105,
    Multiply: 106,
    Add: 107,
    Separator: 108,
    Subtract: 109,
    Decimal: 110,
    Divide: 111,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    F13: 124,
    F14: 125,
    F15: 126,
    F16: 127,
    F17: 128,
    F18: 129,
    F19: 130,
    F20: 131,
    F21: 132,
    F22: 133,
    F23: 134,
    F24: 135,
    NumLock: 144,
    Scroll: 145,
    LShiftKey: 160,
    RShiftKey: 161,
    LControlKey: 162,
    RControlKey: 163,
    LMenu: 164,
    RMenu: 165,
    BrowserBack: 166,
    BrowserForward: 167,
    BrowserRefresh: 168,
    BrowserStop: 169,
    BrowserSearch: 170,
    BrowserFavorites: 171,
    BrowserHome: 172,
    VolumeMute: 173,
    VolumeDown: 174,
    VolumeUp: 175,
    MediaNextTrack: 176,
    MediaPreviousTrack: 177,
    MediaStop: 178,
    MediaPlayPause: 179,
    LaunchMail: 180,
    SelectMedia: 181,
    LaunchApplication1: 182,
    LaunchApplication2: 183,
    OemSemicolon: 186,
    Oem1: 186,
    Oemplus: 187,
    Oemcomma: 188,
    OemMinus: 189,
    OemPeriod: 190,
    OemQuestion: 191,
    Oem2: 191,
    Oemtilde: 192,
    Oem3: 192,
    OemOpenBrackets: 219,
    Oem4: 219,
    OemPipe: 220,
    Oem5: 220,
    OemCloseBrackets: 221,
    Oem6: 221,
    OemQuotes: 222,
    Oem7: 222,
    Oem8: 223,
    OemBackslash: 226,
    Oem102: 226,
    ProcessKey: 229,
    Packet: 231,
    Attn: 246,
    Crsel: 247,
    Exsel: 248,
    EraseEof: 249,
    Play: 250,
    Zoom: 251,
    NoName: 252,
    Pa1: 253,
    OemClear: 254
}

export default class TPersistent extends TObject {
    constructor() {
        super();
    }

    assign(source) { }  // eslint-disable-line
}

export class TComponent extends TPersistent {
    constructor() {
        super();

        this.publishProperty = new TList();
    }

    addPublisProperty(propClass) {
        this.publishProperty.add(propClass);
    }
}

/**
 * HCL类：光标
 */
export class TCaret {
    constructor() {
        this.reset();
    }

    reset() {
        this.control = null;
        this.image = null;
        this._data_ = null;
        this.left = 0;
        this.top = 0;
        this.width = 2;
        this.height = 16;
        this.color = "black";
        this.shan = true;
        this.visible = false;
    }
}

export class TMouseEventArgs {
    constructor() {
        this.shift = new Set([]);
        this.button = 0;
        this.x = 0;
        this.y = 0;
        this.delta = 0;
        this.clicks = 0;
    }

    assign(src) {
        this.shift = src.shift;
        this.button = src.button;
        this.x = src.x;
        this.y = src.y;
        this.delta = src.delta;
        this.clicks = src.clicks;
    }
}

export class TKeyEventArgs {
    constructor() {
        this.shift = new Set([]);
        /** 键名 */
        this.key = "";
        /** 键码 */
        this.keyCode = 0;
    }

    assign(src) {
        this.shift = new Set([...src.shift]);
        this.key = src.key;
        this.keyCode = src.keyCode;
    }
}

/**
 * HCL类：主题类(已实例化为theme，无需重复实例化)
 */
class TTheme {
    constructor() {
        this.iconSize = 16;
        this.radioButtonWidth = 16;
        this.checkBoxWidth = 16;
        this.shadow = 10;
        this.marginSpace = 5;
        this.marginSpaceDouble = 10;
        this.popupMenuImagePadding = 30;
        this.dropDownButtonSize = 20;
        this.dropDownButtonColor = 'black';

        this.borderColor = "#848484";
        this.borderHotColor = "green";
        this.borderActiveColor = "blue";

        this.backgroundStaticColor = "#f0f0f0";
        this.backgroundLightColor = '#eaeaea';
        this.backgroundHotColor = '#dcdcdc';
        this.backgroundDownColor = '#c8c8c8';
        this.backgroundContentColor = "#ffffff";
        this.backgroundSelectColor = "#3390ff";

        this.textColor = "black";
        this.textDisableColor = "gray";
    }

    getCSSCursor(cursor) {
        switch (cursor) {
            case TCursors.Cross: 
                return "crosshair";
            
            case TCursors.Drag:
                return "grab";

            case TCursors.HandPoint:
                return "pointer";

            case TCursors.HourGlass:
                return "wait";

            case TCursors.HoriSplit:
                return "col-resize";

            case TCursors.Ibeam:
                return "text";

            case TCursors.No:
                return "not-allowed";

            case TCursors.SizeAll:
                return "all-scroll";

            case TCursors.SizeNESW:
                return "nesw-resize";

            case TCursors.SizeNS:
                return "ns-resize";

            case TCursors.SizeNWSE:
                return "nwse-resize";

            case TCursors.SizeWE:
                return "w-resize";

            case TCursors.VertSplit:
                return "row-resize";

            default:
                return "default";
        }
    }    

    drawDropDown(hclCanvas, rect) {
        hclCanvas.beginPath();
        hclCanvas.pen.color = this.dropDownButtonColor;
        let x = rect.left + Math.trunc((rect.width - 7) / 2);
        let y = rect.top + Math.trunc((rect.height - 4) / 2);
        hclCanvas.drawLine(x, y, x + 7, y);
        hclCanvas.drawLine(x + 1, y + 1, x + 6, y + 1);
        hclCanvas.drawLine(x + 2, y + 2, x + 5, y + 2);
        hclCanvas.drawLine(x + 3, y + 3, x + 4, y + 3);
        hclCanvas.paintPath();
    }

    drawDropRight(hclCanvas, rect) {
        hclCanvas.pen.width = 1;
        hclCanvas.pen.color = this.dropDownButtonColor;
        hclCanvas.beginPath();
        let x = rect.left + Math.trunc((rect.width - 4) / 2);
        let y = rect.top + Math.trunc((rect.height - 7) / 2);
        hclCanvas.drawLine(x, y, x, y + 7);
        hclCanvas.drawLine(x + 1, y + 1, x + 1, y + 6);
        hclCanvas.drawLine(x + 2, y + 2, x + 2, y + 5);
        hclCanvas.drawLine(x + 3, y + 3, x + 3, y + 4);
        hclCanvas.paintPath();
    }

    drawFrameControl(hclCanvas, rect, stateSet, style) {
        switch (style) {
            case TControlStyle.ButtonRadio: {
                    hclCanvas.pen.color = theme.borderColor;
                    hclCanvas.pen.style = TPenStyle.Solid;
                    hclCanvas.pen.width = 1;
                    hclCanvas.brush.style = TBrushStyle.Clear;
                    hclCanvas.ellipseBoundsDriect(rect.left, rect.top, this.radioButtonWidth, this.radioButtonWidth);

                    if (stateSet.has(TControlState.Checked)) {
                        hclCanvas.brush.color = theme.backgroundDownColor;
                        hclCanvas.brush.style = TBrushStyle.Solid;
                        hclCanvas.pen.style = TPenStyle.Clear;
                        rect.inFlate(-3, -3);
                        hclCanvas.ellipseRectDriect(rect);
                    }
                }
                break;

            case TControlStyle.CheckBox:
                hclCanvas.pen.color = theme.borderColor;
                rect.resetBounds(rect.left, rect.top, this.checkBoxWidth, this.checkBoxWidth);
                hclCanvas.rectangleRect(rect);

                if (stateSet.has(TControlState.Checked)) {
                    hclCanvas.font.color = TColor.Black;
                    hclCanvas.font.size = 8;
                    hclCanvas.textRect(rect, rect.left, rect.top, "√");
                }
                break;
        }
    }
}

/**
 * HCL实例：主题类的实例
 */
export let theme = new TTheme();

export class TControl extends TComponent {
    constructor() {
        super();

        this._marginLeft = 0;
        this._marginTop = 0;
        this._marginRight = 0;
        this._marginBottom = 0;

        this._paddingLeft = 0;
        this._paddingTop = 0;
        this._paddingRight = 0;
        this._paddingBottom = 0;        

        this.align_ = TAlign.None;
        this._parent = null;
        this.canFocus = false;
        this._focused = false;
        this.popupMenu = null;
        this._rotate = 0;
        //this.rotateCenter = new TPoint();
        this.transparent = false;  // 背景透明
        this._updateCount = 0;
        this._left = 0;
        this._top = 0;
        this._width = 75;
        this._height = 25;
        this.enabled = true;
        this.visible_ = true;
        this.cursor_ = TCursors.Default;
        this.handle_ = 0;//application.requestHandle();
        this.mouseStates = new Set([]);
        this.tag = null;
    }

    _setBounds() { 
        this.doSetBounds_();
        this.doResize_();
    }

    doSetBounds_() {
        if (this.parent != null)
            this.parent.reAlign();
    }

    doResize_() {
        this.onResize();
    }

    doSetFocus_(accept) { 
        this._focused = accept;
        if (this.parent != null)
            this.parent.setFocusControl_(this, accept);
    }

    doKillFocus_() { 
        this._focused = false;
        if (this.parent != null)
            this.parent.killFocusControl_(this);
    }

    added_(parent) {
        this._parent = parent;
    }

    removed_() {
        this._parent = null;
    }

    doSetParent_(val) {
        if (this._parent != val) {
            if (this._parent != null)
                this._parent.removeControl(this);

            if (val != null)
                val.addControl(this)
            else
                this.removed_();
        }
    }

    doVisibleChange_(val) { 
        if (this._parent != null)
            this._parent.controlVisible_(this, val);
    }

    doSetMarginLeft_(val) {
        this._marginLeft = val;
        this.reAlign();
    }

    doSetMarginTop_(val) {
        this._marginTop = val;
        this.reAlign();
    }

    doSetMarginRight_(val) {
        this._marginRight = val;
        this.reAlign();
    }

    doSetMarginBottom_(val) {
        this._marginBottom = val;
        this.reAlign();
    }    

    doSetPaddingLeft_(val) {
        this._paddingLeft = val;
        this.reAlign();
    }

    doSetPaddingTop_(val) {
        this._paddingTop = val;
        this.reAlign();
    }

    doSetPaddingRight_(val) {
        this._paddingRight = val;
        this.reAlign();
    }

    doSetPaddingBottom_(val) {
        this._paddingBottom = val;
        this.reAlign();
    }    

    doMouseEnter_() {
        this.mouseStates.add(TMouseStates.MouseIn);
        application.setCursorBy(this);
        this.onMouseEnter();
    }

    doMouseLeave_() {
        this.mouseStates.delete(TMouseStates.MouseIn);
        this.mouseStates.delete(TMouseStates.MouseDown);
        this.onMouseLeave();
    }

    doMouseWheel_(e) {
        this.onMouseWheel(e);
    }

    doMouseDown_(e) {
        this.mouseStates.add(TMouseStates.MouseDown);
        this.setFocus();
        this.onMouseDown(e);
    }

    doMouseMove_(e) {
        this.onMouseMove(e);
    }

    doMouseUp_(e) {
        if (this.mouseStates.has(TMouseStates.MouseDown)) {  // 按下弹起都在自己
            this.mouseStates.delete(TMouseStates.MouseDown);
            this.onMouseUp(e);
            if (e.button === TMouseButton.Left && this.clientRect().pointInAt(e.x, e.y))  // 不能用mouseIn，因为可能按下期间移出但并没有触发mouseLeave
                this.doClick_();
            else if (e.button === TMouseButton.Right)
                this.doContextMenu_(e.x, e.y);
        }
    }

    doClick_() {
        this.onClick(this);
    }

    doDblClick_(e) {
        this.onDblClick(e);
    }

    doKeyDown_(e) {
        this.onKeyDown(e);
    }

    doKeyPress_(e) {
        this.onKeyPress(e);
    }

    doKeyUp_(e) {
        this.onKeyUp(e);
    }

    doContextMenu_() {
        this.onContextmenu();
    }

    doPaintBackground_(hclCanvas) {
        this.onPaintBackground(hclCanvas);
    }

    doPaint_(hclCanvas) {
        this.onPaint(hclCanvas);
    }
    
    clientRect() {
        return TRect.Create(0, 0, this.width, this.height);
    }

    bounds() {
        return TRect.CreateByBounds(this.left, this.top, this.width, this.height);
    }

    location() {
        return TPoint.Create(this.left, this.top);
    }

    mouseEnter() {
        if (this.enabled)
            this.doMouseEnter_();
    }

    mouseLeave() {
        if (this.enabled)
            this.doMouseLeave_();
    }

    mouseDown(e) {
        if (this.enabled)
            this.doMouseDown_(e);
    }

    mouseWheel(e) {
        if (this.enabled)
            this.doMouseWheel_(e);
    }

    mouseMove(e) {
        if (this.enabled)
            this.doMouseMove_(e);
    }

    mouseUp(e) {
        if (this.enabled)
            this.doMouseUp_(e);
    }

    dblClick(e) {
        if (this.enabled)
            this.doDblClick_(e);
    }

    keyDown(e) {
        if (this.enabled)
            this.doKeyDown_(e);
    }

    keyPress(e) {
        if (this.enabled)
            this.doKeyPress_(e);
    }

    keyUp(e) {
        if (this.enabled)
            this.doKeyUp_(e);
    }

    dispose() {
        if (this._parent != null)
            this._parent.removeControl(this);
            
        super.dispose();
    }

    broadcast(msg, wparam, lparam) {  // eslint-disable-line
        if (msg == TMessage.Deactivate) {
            if (this.mouseStates.count > 0) {
                this.mouseStates.clear();
                this.update();
            }
        }
    }

    reAlign() {
        this.update();
    }

    offset(x, y) {
        this._left = this._left + x;
        this._top = this._top + y;
        this._setBounds();
    }

    setLocal(x, y) {
        this._left = x;
        this._top = y;
        this._setBounds();
    }

    clientToScreen(point) {
        point.x += this.left;
        point.y += this.top;
        return this.parent.clientToScreen(point);
    }

    setSize(w, h) {
        this._width = w;
        this._height = h;
        this._setBounds();
    }

    paint(hclCanvas) {
        if (this.visible && (this._updateCount == 0)) {
            if (!this.transparent)
                this.doPaintBackground_(hclCanvas);
            
            this.doPaint_(hclCanvas);
        }
    }

    paintTo(hclCanvas, x, y) {
        hclCanvas.save();
        try {
            hclCanvas.translate(x, y);
            this.paint(hclCanvas);
        } finally {
            hclCanvas.restore();
        }
    }

    updateRect(rect) {
        if (this.parent != null)
            this.parent.updateRect(rect.offset(this.left, this.top, true));
        else  // 无parent时给一个绘制到其他空间的机会
            this.onUpdate(rect);
    }

    update() {
        this.updateRect(this.clientRect());
    }

    setFocus() {
        if (!this._focused) {
            if (this.canFocus) {
                this.doSetFocus_(true);
                this.update();
            } else
                this.doSetFocus_(false)
        }
    }

    killFocus() {
        if (this._focused) {
            this.doKillFocus_();
            this.mouseStates.clear();
            this.update();
        }
    }

    beginUpdate() {
        this._updateCount++;
    }

    endUpdate() {
        if (this._updateCount > 0) {
            this._updateCount--;
            if (this._updateCount == 0)
                this.update();
        }
    }

    get left() {
        return this._left;
    }

    set left(val) {
        if (this._left != val) {
            this._left = val;
            this._setBounds();
        }
    }

    get top() {
        return this._top;
    }

    set top(val) {
        if (this._top != val) {
            this._top = val;
            this._setBounds();
        }
    }

    get width() {
        return this._width;
    }

    set width(val) {
        if (this._width != val) {
            this._width = val;
            this._setBounds();
        }
    }

    get height() {
        return this._height;
    }

    set height(val) {
        if (this._height != val) {
            this._height = val;
            this._setBounds();
        }
    }

    get rotate() {
        return this._rotate;
    }

    set rotate(val) {
        if (this._rotate != val) {
            this._rotate = val;
            this._setBounds();
        }
    }

    get mouseIn() {
        return this.mouseStates.has(TMouseStates.MouseIn);
    }

    get align() {
        return this.align_;
    }

    set align(val) {
        if (this.align_ != val) {
            this.align_ = val;
            if (this.parent != null)
                this.parent.reAlign();
        }
    }

    get marginLeft() {
        return this._marginLeft;
    }

    set marginLeft(val) {
        this.doSetMarginLeft_(val);
    }

    get marginTop() {
        return this._marginTop;
    }

    set marginTop(val) {
        this.doSetMarginTop_(val);
    }

    get marginRight() {
        return this._marginRight;
    }

    set marginRight(val) {
        this.doSetMarginRight_(val);
    }

    get marginBottom() {
        return this._marginBottom;
    }

    set marginBottom(val) {
        this.doSetMarginBottom_(val);
    }    

    get paddingLeft() {
        return this._paddingLeft;
    }

    set paddingLeft(val) {
        this.doSetPaddingLeft_(val);
    }

    get paddingTop() {
        return this._paddingTop;
    }

    set paddingTop(val) {
        this.doSetPaddingTop_(val);
    }

    get paddingRight() {
        return this._paddingRight;
    }

    set paddingRight(val) {
        this.doSetPaddingRight_(val);
    }

    get paddingBottom() {
        return this._paddingBottom;
    }

    set paddingBottom(val) {
        this.doSetPaddingBottom_(val);
    }

    get visible() {
        return this.visible_;
    }

    set visible(val) {
        if (this.visible_ != val) {
            this.visible_ = val;
            this.doVisibleChange_(val);
        }
    }

    get focused() {
        return this._focused;
    }

    get parent() {
        return this._parent;
    }

    set parent(val) {
        this.doSetParent_(val);
    }

    get cursor() {
        return this.cursor_;
    }

    set cursor(val) {
        if (this.cursor_ != val) {
            this.cursor_ = val;
            application.setCursorBy(this);
        }
    }

    onResize() { }

    onContextmenu() { }

    onMouseEnter() { }

    onMouseLeave() { }

    onPaintBackground(hclCanvas) { }  // eslint-disable-line

    onUpdate(rect) { }  // eslint-disable-line

    onPaint(hclCanvas) { }  // eslint-disable-line

    onMouseWheel(e) { }  // eslint-disable-line

    onMouseDown(e) { }  // eslint-disable-line

    onMouseMove(e) { }  // eslint-disable-line

    onClick(sender) { }  // eslint-disable-line

    onDblClick(sender) { }  // eslint-disable-line

    onMouseUp(e) { }  // eslint-disable-line

    onKeyDown(e) { }  // eslint-disable-line

    onKeyPress(e) { }  // eslint-disable-line

    onKeyUp(e) { }  // eslint-disable-line
}

export class TPopupControl extends TControl {
    constructor() {
        super();
        this._width = 100;
        this._height = 100;
        this.dropDownStyle = false;
        this.popupLinkedList = null;
        this.forward = null;
        this.next = null;
        this.onClose = null;
    }

    _doPaintShadow(hclCanvas, rect) {
        hclCanvas.brush.color = theme.backgroundStaticColor;
        hclCanvas.fillRectShadow(rect, theme.shadow);
    }

    doPaintBackground_(hclCanvas) {
        let rect = this.clientRect();
        if (this.dropDownStyle) {
            hclCanvas.save();
            try {
                hclCanvas.clip(rect.left - theme.shadow, rect.top, rect.width + theme.shadow * 2, rect.bottom + theme.shadow);
                this._doPaintShadow(hclCanvas, rect)
            } finally {
                hclCanvas.restore();
            }
        } else
            this._doPaintShadow(hclCanvas, rect);

        // hclCanvas.fillRect(rect);
        // hclCanvas.brush.color = "#00000080";
        // hclCanvas.fillBounds(rect.right, theme.shadow, theme.shadow, rect.bottom);
        // hclCanvas.fillBounds(rect.left + theme.shadow, rect.bottom, rect.right - theme.shadow, theme.shadow);

        super.doPaintBackground_(hclCanvas);
    }

    getControlAtPos(x, y) {  // eslint-disable-line
        return this;
    }

    updateRect(rect) {
        application.updateRect(rect.offset(this.left, this.top, true));
    }

    update() {
        this.updateRect(this.clientRect());
    }

    popup(x, y, root) {
        this.left = x;
        this.top = y;
        this.visible = true;
        application.trackPopupControl(this, root);
    }

    popupControl(control) {
        let point = control.clientToScreen(TPoint.Create(0, 0));
        this.popup(point.x, point.y + control.height, true);
    }

    closePopup() {  // 关闭popup链
        application.closePopupControl(this.popupLinkedList.first);
    }

    close() {  // 关闭我之后的
        application.closePopupControl(this);
        if (this.onClose != null)
            this.onClose();
    }
}

export var TScrollBarControl = {
    Bar: 0,
    LeftBtn: 1,
    Thum: 2,
    RightBtn: 3
}

export var TScrollBarCode = {
    LineUp: 0,
    LineDown: 1,
    PageUp: 2,
    PageDown: 3,
    Position: 4,
    Track: 5,
    Top: 6,
    Bottom: 7,
    EndScroll: 8
}

export class TScrollBar extends TControl {
    constructor() {
        super();
        this._width = 100;
        this._height = 20;
        this._min = 0;
        this._max = 0;
        this._pageSize = 0;
        this._position = 0;
        this._range = 0;
        this.percent_ = 0;
        this.leftBlank_ = 0;
        this.rightBlank_ = 0;
        this.buttonSize = 20;
        this._btnStep = 5;
        this.thumRect_ = new TRect();
        this.leftBtnRect_ = new TRect();
        this.rightBtnRect_ = new TRect();
        this.mouseDownPt_ = new TPoint();
        this.mouseDownControl_ = TScrollBarControl.Bar;
        this._orientation = TOrientation.Horizontal;
        this._onScroll = null;
    }

    _reCalcButtonRect() {
        if (this._orientation == TOrientation.Horizontal) {
            this.leftBtnRect_ = TRect.CreateByBounds(this.leftBlank_, 0, this.buttonSize, this.height);
            this.rightBtnRect_ = TRect.CreateByBounds(this.width - this.rightBlank_ - this.buttonSize, 0,
                this.buttonSize, this.height);
        }
        else {
            this.leftBtnRect_ = TRect.CreateByBounds(0, this.leftBlank_, this.width, this.buttonSize);
            this.rightBtnRect_ = TRect.CreateByBounds(0, this.height - this.rightBlank_ - this.buttonSize,
                this.width, this.buttonSize);
        }
    }

    _reCalcThumRect() {
        let vPer = 0;
        let vThumHeight = 0;

        if (this._orientation == TOrientation.Horizontal) {
            this.thumRect_.top = 0;
            this.thumRect_.bottom = this.height;
            if (this._pageSize < this._range) {
                vPer = this._pageSize / this._range;
                // 计算滑块的高度
                vThumHeight = Math.round((this.width - this.leftBlank_ - this.rightBlank_ - 2 * this.buttonSize) * vPer);
                if (vThumHeight < this.buttonSize)
                    vThumHeight = this.buttonSize;

                this.percent_ = (this.width - this.leftBlank_ - this.rightBlank_ - 2 * this.buttonSize
                    - vThumHeight) / (this._range - this._pageSize);  // 界面可滚动范围和实际代表范围的比率

                if (this.percent_ < 0)
                    return;

                if (this.percent_ == 0)
                    this.percent_ = 1;

                this.thumRect_.left = this.leftBlank_ + this.buttonSize + Math.round(this._position * this.percent_);
                this.thumRect_.right = this.thumRect_.left + vThumHeight;
            } else {
                this.thumRect_.left = this.leftBlank_ + this.buttonSize;
                this.thumRect_.right = this.width - this.rightBlank_ - this.buttonSize;
            }
        } else {
            this.thumRect_.left = 0;
            this.thumRect_.right = this.width;
            if (this._pageSize < this._range) {
                vPer = this._pageSize / this._range;  // 计算滑块比例
                // 计算滑块的高度
                vThumHeight = Math.round((this.height - this.leftBlank_ - this.rightBlank_ - 2 * this.buttonSize) * vPer);
                if (vThumHeight < this.buttonSize)
                    vThumHeight = this.buttonSize;

                this.percent_ = (this.height - this.leftBlank_ - this.rightBlank_ - 2 * this.buttonSize
                    - vThumHeight) / (this._range - this._pageSize);  // 界面可滚动范围和实际代表范围的比率

                if (this.percent_ < 0)
                    return;

                if (this.percent_ == 0)
                    this.percent_ = 1;

                this.thumRect_.top = this.leftBlank_ + this.buttonSize + Math.round(this._position * this.percent_);
                this.thumRect_.bottom = this.thumRect_.top + vThumHeight;
                //Scroll(scTrack, FPosition);  //鼠标移动改变滑块的垂直位置
            } else {  // 滚动轨道大于等于范围
                this.thumRect_.top = this.leftBlank_ + this.buttonSize;
                this.thumRect_.bottom = this.height - this.rightBlank_ - this.buttonSize;
            }
        }
    }    

    _setOrientation(val) {
        if (this._orientation != val) {
            this._orientation = val;
            if (val == TOrientation.Horizontal) {
                this._height = this.buttonSize;
                this.align = TAlign.Bottom;
            } else {
                this._width = this.buttonSize;
                this.align = TAlign.Right;
            }
        }
    }

    _setMin(val) {
        if (this._min != val) {
            if (val > this._max)
                this._min = this._max;
            else
                this._min = val;

            if (this._position < this._min)
                this._position = this._min;

            this._range = this._max - this._min;
            this._reCalcThumRect();
            this._updateRangRect();
        }
    }

    _setMax(val) {
        if (this._max != val) {
            if (val < this._min)
                this._max = this._min;
            else
                this._max = val;

            if (this._position + this._pageSize > this._max)
                this._position = Math.max(this._max - this._pageSize, this._min);

            this._range = this._max - this._min;
            this._reCalcThumRect();
            this._updateRangRect();
        }
    }

    _setPageSize(val) {
        if (this._pageSize != val) {
            this._pageSize = val;
            this._reCalcThumRect();
            this._updateRangRect();
        }
    }

    _setPosition(val) {
        let vPos = 0;
        if (val < this._min)
            vPos = this._min;
        else if (val + this._pageSize > this._max)
            vPos = Math.max(this._max - this._pageSize, this._min);
        else
            vPos = val;

        if (this._position != vPos) {
            this._position = vPos;
            this._reCalcThumRect();
            this._updateRangRect();

            if (this._onScroll != null)
                this._onScroll(TScrollBarCode.Position, this._position);
        }
    }

    scrollStep_(scrollCode) {
        let vPos = 0;
        switch (scrollCode) {
            case TScrollBarCode.LineUp:
                vPos = this._position - this._btnStep;
                if (vPos < this._min)
                    vPos = this._min;

                if (this._position != vPos)
                    this.position = vPos;

                break;

            case TScrollBarCode.LineDown:
                vPos = this._position + this._btnStep;
                if (vPos > this._range - this._pageSize)
                    vPos = this._range - this._pageSize;

                if (this._position != vPos)
                    this.position = vPos;

                break;

            case TScrollBarCode.PageUp:
                vPos = this._position - this._pageSize;
                if (vPos < this._min)
                    vPos = this._min;

                if (this._position != vPos)
                    this.position = vPos;

                break;

            case TScrollBarCode.PageDown:
                vPos = this._position + this._pageSize;
                if (vPos > this._range - this._pageSize)
                    vPos = this._range - this._pageSize;

                if (this._position != vPos)
                    this.position = vPos;

                break;

            default:
                break;
        }
    }

    doMouseDown_(e) {
        super.doMouseDown_(e);

        this.mouseDownPt_.x = e.x;
        this.mouseDownPt_.y = e.y;
        if (this.leftBtnRect_.pointIn(this.mouseDownPt_)) {
            this.mouseDownControl_ = TScrollBarControl.LeftBtn;
            this.scrollStep_(TScrollBarCode.LineUp);
        } else if (this.thumRect_.pointIn(this.mouseDownPt_)) {
            this.mouseDownControl_ = TScrollBarControl.Thum;
        } else if (this.rightBtnRect_.pointIn(this.mouseDownPt_)) {
            this.mouseDownControl_ = TScrollBarControl.RightBtn;
            this.scrollStep_(TScrollBarCode.LineDown);
        } else if (this._ptInLeftBlankArea(e.x, e.y)) {
            //
        } else if (this._ptInRightBlankArea(e.x, e.y)) {
            //
        } else {
            this.mouseDownControl_ = TScrollBarControl.Bar;
            if ((this.thumRect_.top > e.y) || (this.thumRect_.left > e.x))
                this.scrollStep_(TScrollBarCode.PageUp);
            else if ((this.thumRect_.bottom < e.y) || (this.thumRect_.right < e.x))
                this.scrollStep_(TScrollBarCode.PageDown);
        }
    }

    doMouseMove_(e) {
        super.doMouseMove_(e);

        let vOffs = 0;
        if (e.button == TMouseButton.Left) {
            if (this._orientation == TOrientation.Horizontal) {
                if (this.mouseDownControl_ == TScrollBarControl.Thum) {
                    vOffs = e.x - this.mouseDownPt_.x;
                    this.position = this._position + Math.round(vOffs / this.percent_);
                    this.mouseDownPt_.x = e.x;
                }
            } else {
                if (this.mouseDownControl_ == TScrollBarControl.Thum) {
                    vOffs = e.y - this.mouseDownPt_.y;
                    this.position = this._position + Math.round(vOffs / this.percent_);
                    this.mouseDownPt_.y = e.y;
                }
            }
        }
    }

    _updateRangRect() {
        this.update();
    }

    _ptInLeftBlankArea(x, y) {
        if (this.leftBlank_ != 0) {
            if (this._orientation == TOrientation.Horizontal)
                return TRect.CreateByBounds(0, 0, this.leftBlank_, this.height).pointInAt(x, y);
            else
                return TRect.CreateByBounds(0, 0, this.width, this.leftBlank_).pointInAt(x, y);
        }

        return false;
    }

    _ptInRightBlankArea(x, y) {
        if (this.rightBlank_ != 0) {
            if (this._orientation == TOrientation.Horizontal)
                return TRect.CreateByBounds(this.width - this.rightBlank_, 0, this.rightBlank_, this.height).pointInAt(x, y);
            else
                return TRect.CreateByBounds(0, this.height - this.rightBlank_, this.width, this.rightBlank_).pointInAt(x, y);
        }

        return false;
    }

    doResize_() {
        super.doResize_();
        if (this._orientation == TOrientation.Vertical)
            this._pageSize = this.height;
        else
            this._pageSize = this.width;

        if (this._position + this._pageSize > this._max)
            this._position = Math.max(this._max - this._pageSize, this._min);

        this._reCalcThumRect();
        this._reCalcButtonRect();
    }

    doPaint_(hclCanvas) {
        this.paintToEx(hclCanvas);
    }

    doDrawThumBefor_(hclCanvas, thumRect) { }  // eslint-disable-line

    paintToEx(hclCanvas) {
        hclCanvas.brush.color = theme.backgroundStaticColor;
        hclCanvas.fillBounds(0, 0, this.width, this.height);

        let vRect = TRect.CreateByRect(this.thumRect_);
        hclCanvas.pen.width = 1;
        if (this._orientation == TOrientation.Horizontal) {
            vRect.inFlate(0, -1);
            this.doDrawThumBefor_(hclCanvas, vRect);
            hclCanvas.brush.color = theme.backgroundHotColor;
            hclCanvas.fillRect(vRect);

            hclCanvas.beginPath();
            hclCanvas.pen.color = theme.borderColor;
            hclCanvas.drawLine(vRect.left, vRect.top, vRect.right, vRect.top);
            hclCanvas.drawLine(vRect.right, vRect.top, vRect.right, vRect.bottom);
            hclCanvas.drawLine(vRect.right, vRect.bottom - 1, vRect.left, vRect.bottom - 1);
            hclCanvas.drawLine(vRect.left, vRect.bottom, vRect.left, vRect.top);
            
            // 滑块上的修饰
            vRect.left = vRect.left + Math.trunc(vRect.width / 2);
            hclCanvas.drawLine(vRect.left, 5, vRect.left, this.height - 5);
            hclCanvas.drawLine(vRect.left + 3, 5, vRect.left + 3, this.height - 5);
            hclCanvas.drawLine(vRect.left - 3, 5, vRect.left - 3, this.height - 5);
            hclCanvas.paintPath();

            hclCanvas.beginPath();
            hclCanvas.pen.color = theme.backgroundHotColor;
            // 左按钮
            vRect.left = this.leftBtnRect_.left + Math.trunc((this.leftBtnRect_.width - 4) / 2) + 4;
            vRect.top = this.leftBtnRect_.top + Math.trunc((this.leftBtnRect_.height - 7) / 2); 
            hclCanvas.drawLine(vRect.left, vRect.top, vRect.left, vRect.top + 7); 
            hclCanvas.drawLine(vRect.left - 1, vRect.top + 1, vRect.left - 1, vRect.top + 6);
            hclCanvas.drawLine(vRect.left - 2, vRect.top + 2, vRect.left - 2, vRect.top + 5);
            hclCanvas.drawLine(vRect.left - 3, vRect.top + 3, vRect.left - 3, vRect.top + 4);
            // 右按钮
            vRect.left = this.rightBtnRect_.left + Math.trunc((this.rightBtnRect_.width - 4) / 2);
            vRect.top = this.rightBtnRect_.top + Math.trunc((this.rightBtnRect_.height - 7) / 2);
            hclCanvas.drawLine(vRect.left, vRect.top, vRect.left, vRect.top + 7);
            hclCanvas.drawLine(vRect.left + 1, vRect.top + 1, vRect.left + 1, vRect.top + 6);
            hclCanvas.drawLine(vRect.left + 2, vRect.top + 2, vRect.left + 2, vRect.top + 5);
            hclCanvas.drawLine(vRect.left + 3, vRect.top + 3, vRect.left + 3, vRect.top + 4);
            hclCanvas.paintPath();
        } else {
            // 滑块
            vRect.inFlate(-1, 0);
            this.doDrawThumBefor_(hclCanvas, vRect);
            hclCanvas.brush.color = theme.backgroundHotColor;
            hclCanvas.fillRect(vRect);

            hclCanvas.beginPath();
            hclCanvas.pen.color = theme.borderColor;
            hclCanvas.drawLine(vRect.left, vRect.top, vRect.right, vRect.top);
            hclCanvas.drawLine(vRect.right - 1, vRect.top, vRect.right - 1, vRect.bottom);
            hclCanvas.drawLine(vRect.right, vRect.bottom, vRect.left, vRect.bottom);
            hclCanvas.drawLine(vRect.left, vRect.bottom, vRect.left, vRect.top);            
            // 滑块上的修饰
            vRect.top = vRect.top + Math.trunc(vRect.height / 2);
            hclCanvas.drawLine(5, vRect.top, this.width - 5, vRect.top);
            hclCanvas.drawLine(5, vRect.top - 3, this.width - 5, vRect.top - 3);
            hclCanvas.drawLine(5, vRect.top + 3, this.width - 5, vRect.top + 3);
            hclCanvas.paintPath();

            hclCanvas.beginPath();
            hclCanvas.pen.color = theme.backgroundHotColor;
            // 上按钮
            vRect.left = this.leftBtnRect_.left + Math.trunc((this.leftBtnRect_.width - 7) / 2);
            vRect.top = this.leftBtnRect_.top + Math.trunc((this.leftBtnRect_.height - 4) / 2) + 4;
            hclCanvas.drawLine(6, 12, 13, 12);
            hclCanvas.drawLine(vRect.left, vRect.top, vRect.left + 7, vRect.top);
            hclCanvas.drawLine(vRect.left + 1, vRect.top - 1, vRect.left + 6, vRect.top - 1);
            hclCanvas.drawLine(vRect.left + 2, vRect.top - 2, vRect.left + 5, vRect.top - 2);
            hclCanvas.drawLine( vRect.left + 3, vRect.top - 3, vRect.left + 4, vRect.top - 3);
            // 下按钮
            vRect.left = this.rightBtnRect_.left + Math.trunc((this.rightBtnRect_.width - 7) / 2);
            vRect.top = this.rightBtnRect_.top + Math.trunc((this.rightBtnRect_.height - 4) / 2);
            hclCanvas.drawLine(vRect.left, vRect.top, vRect.left + 7, vRect.top);
            hclCanvas.drawLine(vRect.left + 1, vRect.top + 1, vRect.left + 6, vRect.top + 1);
            hclCanvas.drawLine(vRect.left + 2, vRect.top + 2, vRect.left + 5, vRect.top + 2);
            hclCanvas.drawLine(vRect.left + 3, vRect.top + 3, vRect.left + 4, vRect.top + 3);
            hclCanvas.paintPath();
        }
    }

    get orientation() {
        return this._orientation;
    }

    set orientation(val) {
        this._setOrientation(val);
    }

    get min() {
        return this._min;
    }

    set min(val) {
        this._setMin(val);
    }

    get max() {
        return this._max;
    }

    set max(val) {
        this._setMax(val);
    }

    get pageSize() {
        return this._pageSize();
    }

    set pageSize(val) {
        this._setPageSize(val);
    }

    get position() {
        return this._position;
    }

    set position(val) {
        this._setPosition(val);
    }

    get btnStep() {
        return this._btnStep;
    }

    set btnStep(val) {
        if (this._btnStep != val)
            this._btnStep = val;
    }

    get onScroll() {
        return this._onScroll;
    }

    set onScroll(val) {
        this._onScroll = val;
    }
}

export class TProgressBar extends TControl {
    constructor() {
        super();
        this._min = 0;
        this._max = 100;
        this._position = 0;
        this._precent = 0;
        this._width = 100;
        this._height = 20;
    }

    _reset() {
        if (this._min > this._max)
            this._min = this._max;

        if (this._position < this._min)
            this._position = this._min;

        if (this._position > this._max)
            this._position = this._max;

        if (this._max > this._min)  // 防止除0错
            this._precent = (this._position - this._min) / (this._max - this._min);
        else
            this._precent = 0;

        this.update();
    }

    doPaintBackground_(hclCanvas) {
        hclCanvas.brush.color = theme.backgroundStaticColor;
        hclCanvas.fillBounds(0, 0, this.width, this.height);
        hclCanvas.brush.color = theme.backgroundLightColor;
        hclCanvas.fillBounds(0, 0, Math.trunc(this.width * this._precent), this.height);
    }

    doPaint_(hclCanvas) { }  // eslint-disable-line

    get min() {
        return this._min;
    }

    set min(val) {
        if (this._min != val) {
            this._min = val;
            this._reset();
        }
    }

    get max() {
        return this._max;
    }

    set max(val) {
        if (this._max != val) {
            this._max = val;
            this._reset();
        }
    }

    get position() {
        return this._position;
    }

    set position(val) {
        if (this._position != val) {
            this._position = val;
            this._reset();
        }
    }
}

export var TControlState = {
    Creating: 1,
    Removing: 2,
    Checked: 3
}

export var TControlStyle = {
    ButtonRadio: 1,
    CheckBox: 2
}

// 此类实现了容器功能，可作为parent
export class TWinControl extends TControl {
    constructor() {
        super();

        this.state_ = new Set([TControlState.Creating]);
        this.handle_ = 0;
        this.image = null;
        
        this.controls = new TList();
        this.controls.onAdded = (control) => { this.doAddControl_(control); }
        
        this.controls.onRemoved = (control) => { this.doRemoveControl_(control); }

        this._focusControl = null;
        this._captureControl = null;
        this._mouseMoveControl = null;
        this.state_.delete(TControlState.Creating);
    }  

    doResize_() {
        super.doResize_();
        this.reAlign();
    }

    doAddControl_(control) {
        //control.parent = this;
        control.added_(this);
        this.reAlignControl(control);
    }

    removed_() {
        this.state_.add(TControlState.Removing);
        super.removed_();
        this.controls.clear();
    }

    doRemoveControl_(control) {
        control.removed_();
        this.reAlign();
    }

    childVisibleChange_(control, val) {  // eslint-disable-line
        this.reAlign();
    }

    broadcast(msg, wparam, lparam) { 
        let vControl = null;
        for (let i = this.controls.count - 1; i >= 0; i--) {
            vControl = this.controls[i];
            if (vControl.visible)
                vControl.broadcast(msg, wparam, lparam);
        }
    }

    addControl(control) {
        this.controls.add(control);
    }

    removeControl(control) {
        this.controls.remove(control);
    }

    reAlign() {
        if (this.state_.has(TControlState.Removing))
            return;
            
        let vLeft = this.paddingLeft;
        let vTop = this.paddingTop;
        let vRight = this.width - this.paddingRight;
        let vBottom = this.height - this.paddingBottom;
        let control = null;

        // TAlign.alTop
        for (let i = 0; i < this.controls.count; i++) {
            control = this.controls[i];
            if (control.visible && (control.align == TAlign.Top)) {
                control.left = this.paddingLeft + control.marginLeft;
                control.top = vTop + control.marginTop;
                control.width = this.width - this.paddingLeft - this.paddingRight 
                    - control.marginLeft - control.marginRight;
                control.reAlign();
                vTop = control.top + control.height + control.marginBottom;
            }
        }

        // TAlign.alBottom
        for (let i = 0; i < this.controls.count; i++) {
            control = this.controls[i];
            if (control.visible && (control.align == TAlign.Bottom)) {
                control.left = this.paddingLeft + control.marginLeft;
                control.width = this.width - this.paddingLeft - this.paddingRight 
                    - control.marginLeft - control.marginRight;
                vBottom = vBottom - control.marginBottom - control.height;
                control.top = vBottom;
                control.reAlign();
                vBottom = control.top - control.marginTop;
            }
        }

        // TAlign.alLeft
        for (let i = 0; i < this.controls.count; i++) {
            control = this.controls[i];
            if (control.visible && (control.align == TAlign.Left)) {
                control.left = vLeft + control.marginLeft;
                control.top = vTop + control.marginTop;
                control.height = this.height - this.paddingBottom - this.paddingTop 
                    - control.marginTop - control.marginBottom;
                control.reAlign();
                vLeft = control.left + control.width + control.marginRight;
            }
        }

        // TAlign.alRight
        for (let i = 0; i < this.controls.count; i++) {
            control = this.controls[i];
            if (control.visible && (control.align == TAlign.Right)) {
                vRight = vRight - control.marginRight - control.width;
                control.left = vRight;
                control.top = vTop + control.marginTop;
                control.height = this.height - this.paddingTop - this.paddingBottom
                    - control.marginTop - control.marginBottom;
                control.reAlign();
                vRight = control.left - control.marginLeft;
            }
        }

        // TAlign.alClient
        for (let i = 0; i < this.controls.count; i++) {
            control = this.controls[i];
            if (control.visible && (control.align == TAlign.Client)) {
                control.left = vLeft + control.marginLeft;
                control.top = vTop + control.marginTop;
                control.width = vRight - vLeft - control.marginLeft - control.marginTop;
                control.height = vBottom - vTop - control.marginTop - control.marginBottom;
                control.reAlign();
            }
        }

        super.reAlign();
    }

    reAlignControl(control) {
        if (control.align != TAlign.None)
            this.reAlign();
    }

    setFocusControl_(control, accept) {
        if (control != this._focusControl) {
            if (accept) {
                if (this._focusControl != null)
                    this._focusControl.killFocus();

                this._focusControl = control;
            }
        }

        if (this.parent != null)
            this.parent.setFocusControl_(control, accept);
    }

    killFocusControl_(control) {
        this._focusControl = null;
        if (this.parent != null)
            this.parent.killFocusControl_(control);
    }

    getControlIndexAt(x, y) {
        let vControl = null;
        for (let i = this.controls.count - 1; i >= 0; i--) {
            vControl = this.controls[i];
            if (vControl.visible && (vControl.bounds().pointInAt(x, y)))
                return i;
        }

        return -1;
    }

    getControlAt(x, y, enabled = true) {
        let vIndex = this.getControlIndexAt(x, y);
        if (vIndex >= 0) {
            let vControl = this.controls[vIndex];
            if (enabled && !vControl.enabled)
                return null;
            else
                return vControl;
        }

        return null;
    }

    getControlAtPos(x, y, enabled = true) {
        let vControl = this.getControlAt(x, y, enabled);
        if (vControl != null) {
            if (vControl.isClass(TWinControl))
                return vControl.getControlAtPos(x - vControl.left, y - vControl.top, enabled);
            else
                return vControl;
        }
        else
            return this;
    }

    doMouseLeave_() {
        if (this._mouseMoveControl != null) {
            this._mouseMoveControl.mouseLeave();
            this._mouseMoveControl = null;
        }

        super.doMouseLeave_();
    }

    doMouseWheel_(e) {
        if (this._mouseMoveControl != null) {
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x = e.x - this._mouseMoveControl.left;
            vMouseArgs.y = e.y - this._mouseMoveControl.top;
            this._mouseMoveControl.mouseWheel(vMouseArgs);
        }
        else
            super.doMouseDown_(e);
    }

    mouseDown(e) {
        this._captureControl = this.getControlAt(e.x, e.y);
        if (this._captureControl != null) {
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x = e.x - this._captureControl.left;
            vMouseArgs.y = e.y - this._captureControl.top;
            this._captureControl.mouseDown(vMouseArgs);
        }
        else
            super.mouseDown(e);
    }

    mouseMove(e) {
        if ((e.button == TMouseButton.Left) && (this._captureControl != null)) {  // 短路
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x = e.x - this._captureControl.left;
            vMouseArgs.y = e.y - this._captureControl.top;
            this._captureControl.mouseMove(vMouseArgs);
            return;
        }

        let vControl = this.getControlAt(e.x, e.y);
        if (vControl != this._mouseMoveControl) {
            if (this._mouseMoveControl != null)
                this._mouseMoveControl.mouseLeave();

            this._mouseMoveControl = vControl;
            if (this._mouseMoveControl != null)
                this._mouseMoveControl.mouseEnter();
        }

        if (this._mouseMoveControl != null) {
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x = e.x - this._mouseMoveControl.left;
            vMouseArgs.y = e.y - this._mouseMoveControl.top;
            this._mouseMoveControl.mouseMove(vMouseArgs);
        }
        else {
            application.setCursorBy(this);
            super.mouseMove(e);
        }
    }

    mouseUp(e) {
        if (this._captureControl !== null) {
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x = e.x - this._captureControl.left;
            vMouseArgs.y = e.y - this._captureControl.top;
            this._captureControl.mouseUp(vMouseArgs);
        } else
            super.mouseUp(e);

        this._captureControl = null;
    }

    doDblClick_(e) {
        let vControl = this.getControlAt(e.x, e.y);
        if (vControl != null) {
            let mouseArgs = new TMouseEventArgs();
            mouseArgs.assign(e);
            mouseArgs.x -= vControl.left;
            mouseArgs.y -= vControl.top;
            vControl.dblClick(mouseArgs);
        }
        else
            super.doDblClick_(e);
    }

    doKeyDown_(e) {
        if (this._focusControl != null)
            this._focusControl.keyDown(e);
        else
            super.doKeyDown_(e);
    }

    doKeyPress_(e) {
        if (this._focusControl != null)
            this._focusControl.keyPress(e);
        else
            super.doKeyPress_(e);
    }

    doKeyUp_(e) {
        if (this._focusControl != null)
            this._focusControl.keyUp(e);
        else
            super.doKeyUp_(e);
    }

    doPaintBackground_(hclCanvas) {
        if (this.image != null) 
            hclCanvas.drawImage(this.image, 0, 0, this.width, this.height);
        else {
            hclCanvas.brush.color = theme.backgroundStaticColor;
            hclCanvas.fillBounds(0, 0, this.width, this.height);
        }

        super.doPaintBackground_();
    }

    doPaint_(hclCanvas) {
        let vControl = null;
        for (let i = 0; i < this.controls.count; i++) {
            vControl = this.controls[i];
            hclCanvas.save();
            try {
                // to do 处理旋转的区域
                hclCanvas.translate(vControl.left, vControl.top);
                hclCanvas.clip(0, 0, vControl.width, vControl.height);
                vControl.paint(hclCanvas);
            } finally {
                hclCanvas.restore();
            }
        }
    }

    updateRect(rect) {
        if (this.visible_ && this.parent != null)
            this.parent.updateRect(rect.offset(this.left, this.top, true));
    }

    get handle() {
        return this.handle_;
    }

    get focusControl() {
        return this._focusControl;
    }
}

export class TCustomControl extends TWinControl {
    constructor() {
        super();
    }
}