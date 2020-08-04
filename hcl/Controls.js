/*=======================================================

    Html Component Library 前端UI框架 V0.1
    基本控件单元
    作者：荆通(18114532@qq.com)
    QQ群：649023932

=======================================================*/

import { application } from "./Application.js";
import { TColor, THCCanvas } from "./Graphics.js";
import { TList, TObject, TPoint, TRect } from "./System.js";
import { theme } from "./theme.js";

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
    Alt: 18,
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
    LAlt: 164,
    RMenu: 165,
    RAlt: 165,
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

export var TMessage = {
    Design: 10,
    Broadcast: 1001,
    Deactivate: 1002
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
        this.controlScreenRect = new TRect();
        this.image = null;
        this.left = 0;
        this.top = 0;
        this.width = 2;
        this.height = 16;
        this.color = TColor.Black;
        this.shan = true;
        this.visible = false;
    }

    get rect() {
        return TRect.CreateByBounds(this.left, this.top, this.width, this.height);
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

export class TControl extends TComponent {
    constructor() {
        super();

        this.state_ = new Set([TControlState.Creating]);
        this.designState = false;
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
        this.popupMenu_ = null;
        this._rotate = 0;
        //this.rotateCenter = new TPoint();
        this.transparent = false;  // 背景透明
        this.color_ = null;
        this.alpha_ = 1;  // 整体不透明度
        this._updateCount = 0;
        this.left_ = 0;
        this.top_ = 0;
        this.width_ = 75;
        this.height_ = 25;
        this.enabled_ = true;
        this.visible_ = true;
        this.hint_ = "";
        this.cursor_ = TCursors.Default;
        this.handle_ = 0;//application.requestHandle();
        this.mouseStates = new Set([]);
        this.tag = null;
        this.state_.delete(TControlState.Creating);

        this.onKillFocus = null;
    }

    hclSelect() {
        application.hclSelectControl(this);
    }

    _paintexec(hclCanvas) {
        if (!this.transparent)
            this.doPaintBackground_(hclCanvas);
            
        this.doPaint_(hclCanvas);
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

    doRequestFocus_() {
        if (!this.visible_ || !this.enabled_ || this.state_.has(TControlState.Creating))
            return false;
        else
            return true;
    }

    doSetFocus_(accept) {
        if (this.parent != null) {
            let vParentCanFocus = true, vControl = this;
            while (vControl.parent != null) {
                vControl = vControl.parent;
                if (!vControl.doRequestFocus_()) {
                    vParentCanFocus = false;
                    break;
                }
            }

            if (vParentCanFocus) {
                this._focused = accept;
                this.parent.setFocusControl_(this, accept);
            } else
                this.killFocus();
        }
    }

    doKillFocus_() { 
        this._focused = false;
        if (this.onKillFocus)
            this.onKillFocus();

        if (this.parent != null)
            this.parent.killFocusControl_(this);
    }

    getHint_() {
        return this.hint_;
    }

    setHint_(val) {
        this.hint_ = val;
    }

    added_(parent) {
        this._parent = parent;
        if (this.visible_)
            this.setFocus();
    }

    removed_() {
        this.deactivate();
        this._parent = null;
    }

    controlVisible_(control, val) { }

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

    doEnableChange_(val) {
        this.update();
    }

    doVisibleChange_(val) {
        this.state_.add(TControlState.VisibleChange);
        this.update();
        this.state_.delete(TControlState.VisibleChange);
        if (this._parent != null)
            this._parent.controlVisible_(this, val);

        if (this.visible_ && this.onShow)
            this.onShow();
        else if (!this.visible_ && this.onHide)
            this.onHide();
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
            else if (e.button === TMouseButton.Right) {
                this.doContextMenu_(e.x, e.y);
                this.onContextmenu();
            }
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

    doPaintBackground_(hclCanvas) {
        this.onPaintBackground(hclCanvas);
    }

    doPaint_(hclCanvas) {
        this.onPaint(hclCanvas);
    }

    doContextMenu_(x, y) {
        if (this.popupMenu_ != null) {
            let vPoint = this.clientToScreen(new TPoint(0, 0));
            this.popupMenu_.popup(vPoint.x + x, vPoint.y + y);
        }
    }

    doGetPopupMenu() {
        return this.popupMenu_;
    }

    doSetPopupMenu(val) {
        this.popupMenu_ = val;
    }

    setSize(w, h) {
        this.width_ = w;
        this.height_ = h;
        this._setBounds();
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
        if (this.enabled_)
            this.doMouseEnter_();
    }

    mouseLeave() {
        if (this.enabled_)
            this.doMouseLeave_();
    }

    mouseDown(e) {
        if (this.enabled_)
            this.doMouseDown_(e);
    }

    mouseWheel(e) {
        if (this.enabled_)
            this.doMouseWheel_(e);
    }

    mouseMove(e) {
        if (this.enabled_)
            this.doMouseMove_(e);
    }

    mouseUp(e) {
        if (this.enabled_)
            this.doMouseUp_(e);
    }

    dblClick(e) {
        if (this.enabled_)
            this.doDblClick_(e);
    }

    keyDown(e) {
        if (this.enabled_)
            this.doKeyDown_(e);
    }

    keyPress(e) {
        if (this.enabled_)
            this.doKeyPress_(e);
    }

    keyUp(e) {
        if (this.enabled_)
            this.doKeyUp_(e);
    }

    dispose() {
        if (this._parent != null)
            this._parent.removeControl(this);
            
        super.dispose();
    }

    broadcast(message, wParam = 0, lParam = 0) {
        switch (message) {
            case TMessage.Design:
                this.designState = wParam;
        }
    }

    activate() { }

    deactivate() {
        this.killFocus();
    }

    reAlign() {
        this.update();
    }

    offset(x, y) {
        this.left_ = this.left_ + x;
        this.top_ = this.top_ + y;
        this._setBounds();
    }

    setLocal(x, y) {
        this.left_ = x;
        this.top_ = y;
        this._setBounds();
    }

    clientToScreenAt(x, y) {
        return this.clientToScreen(TPoint.Create(x, y));
    }

    clientToScreen(point) {
        point.x += this.left_;
        point.y += this.top_;
        if (this.parent != null)
            return this.parent.clientToScreen(point);
        else
            return point;
    }

    isChildControl(control) {
        let vControl = this;
        while (vControl.parent != null) {
            vControl = vControl.parent;
            if (vControl === control)
                return true;
        }

        return false;
    }

    getHintRect() {
        return this.clientRect();
    }

    paint(hclCanvas) {
        if (this._updateCount > 0)
            return;

        // 绘制前判断过了 this.visible
        if (this.alpha_ != 1) {
            hclCanvas.save();
            try {
                hclCanvas.alpha = this.alpha_;
                this._paintexec(hclCanvas);
            } finally {
                hclCanvas.restore();
            }
        } else
            this._paintexec(hclCanvas);
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
        if (this._updateCount > 0)
            return;

        if (this.state_.has(TControlState.Aligning))
            return;
            
        if (this.visible_ || this.state_.has(TControlState.VisibleChange)) {
            if (this.parent != null)
                this.parent.updateRect(rect.offset(this.left, this.top, true));
            else  // 无parent时给一个绘制到其他空间的机会
                this.onUpdate(rect);
        }
    }

    update() {
        this.updateRect(this.clientRect());
    }

    setFocus() {
        if (!this._focused) {
            if (this.canFocus) {
                this.doSetFocus_(true);
                if (this._focused)
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
        return this.left_;
    }

    set left(val) {
        if (this.left_ != val) {
            this.left_ = val;
            this._setBounds();
        }
    }

    get top() {
        return this.top_;
    }

    set top(val) {
        if (this.top_ != val) {
            this.top_ = val;
            this._setBounds();
        }
    }

    get right() {
        return this.left_ + this.width_;
    }

    set right(val) {
        if (val > this.left_)
            this.width = val - this.left_;
    }

    get bottom() {
        return this.top_ + this.height_;
    }

    set bottom(val) {
        if (val > this.top_)
            this.height = val - this.top_;
    }

    get width() {
        return this.width_;
    }

    set width(val) {
        if (this.width_ != val) {
            this.width_ = val;
            this._setBounds();
        }
    }

    get height() {
        return this.height_;
    }

    set height(val) {
        if (this.height_ != val) {
            this.height_ = val;
            this._setBounds();
        }
    }

    get alpha() {
        return this.alpha_;
    }

    set alpha(val) {
        if (this.alpha_ != val) {
            this.alpha_ = val;
            this.update();
        }
    }

    get color() {
        return this.color_;
    }

    set color(val) {
        if (this.color_ != val) {
            this.color_ = val;
            this.update();
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

    get hint() {
        return this.getHint_();
    }

    set hint(val) {
        this.setHint_(val);
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

    get enabled() {
        return this.enabled_;
    }

    set enabled(val) {
        if (this.enabled_ != val) {
            this.enabled_ = val;
            this.doEnableChange_(val);
        }
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

    get popupMenu() {
        return this.doGetPopupMenu();
    }

    set popupMenu(val) {
        this.doSetPopupMenu(val);
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
        this.width_ = 100;
        this.height_ = 100;
        this.dropDownStyle = false;
        this.popupLinkedList = null;
        this.forward = null;
        this.next = null;
        this.onClose = null;
        this.onDone = null;
    }

    doPaintBackground_(hclCanvas) {
        let vRect = this.clientRect();
        theme.drawShadow(hclCanvas, vRect, this.dropDownStyle);

        hclCanvas.brush.color = theme.backgroundStaticColor;
        hclCanvas.fillRect(vRect);    
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
        let point = control.clientToScreenAt(0, 0);
        this.popup(point.x, point.y + control.height, true);
    }

    closePopup() {
        if (this.onClose != null)
            this.onClose();
    }

    donePopup() {  // 完成popup链
        application.closePopupControl(this.popupLinkedList.first);
        if (this.onDone != null)
            this.onDone();
    }

    close() {  // 我关闭后把我的后续popup链关闭(收起时关闭)
        application.closePopupControl(this);
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
        this.width_ = 100;
        this.height_ = 20;
        this.min_ = 0;
        this.max_ = 0;
        this.pageSize_ = 0;
        this.position_ = 0;
        this.range_ = 0;
        this.precent_ = 0;
        this.leftBlank_ = 0;
        this.rightBlank_ = 0;
        this.buttonSize = 20;
        this.btnStep_ = 5;
        this.thumRect_ = new TRect();
        this.leftBtnRect_ = new TRect();
        this.rightBtnRect_ = new TRect();
        this.mouseDownPt_ = new TPoint();
        this.mouseDownControl_ = TScrollBarControl.Bar;
        this.orientation_ = TOrientation.Horizontal;
        this.align_ = TAlign.Bottom;
        this._onScroll = null;
    }

    _reCalcButtonRect() {
        if (this.orientation_ == TOrientation.Horizontal) {
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

        if (this.orientation_ == TOrientation.Horizontal) {
            this.thumRect_.top = 0;
            this.thumRect_.bottom = this.height;
            if (this.pageSize_ < this.range_) {
                vPer = this.pageSize_ / this.range_;
                // 计算滑块的高度
                vThumHeight = Math.round((this.width - this.leftBlank_ - this.rightBlank_ - 2 * this.buttonSize) * vPer);
                if (vThumHeight < this.buttonSize)
                    vThumHeight = this.buttonSize;

                this.precent_ = (this.width - this.leftBlank_ - this.rightBlank_ - 2 * this.buttonSize
                    - vThumHeight) / (this.range_ - this.pageSize_);  // 界面可滚动范围和实际代表范围的比率

                if (this.precent_ < 0)
                    return;

                if (this.precent_ == 0)
                    this.precent_ = 1;

                this.thumRect_.left = this.leftBlank_ + this.buttonSize + Math.round(this.position_ * this.precent_);
                this.thumRect_.right = this.thumRect_.left + vThumHeight;
            } else {
                this.thumRect_.left = this.leftBlank_ + this.buttonSize;
                this.thumRect_.right = this.width - this.rightBlank_ - this.buttonSize;
            }
        } else {
            this.thumRect_.left = 0;
            this.thumRect_.right = this.width;
            if (this.pageSize_ < this.range_) {
                vPer = this.pageSize_ / this.range_;  // 计算滑块比例
                // 计算滑块的高度
                vThumHeight = Math.round((this.height - this.leftBlank_ - this.rightBlank_ - 2 * this.buttonSize) * vPer);
                if (vThumHeight < this.buttonSize)
                    vThumHeight = this.buttonSize;

                this.precent_ = (this.height - this.leftBlank_ - this.rightBlank_ - 2 * this.buttonSize
                    - vThumHeight) / (this.range_ - this.pageSize_);  // 界面可滚动范围和实际代表范围的比率

                if (this.precent_ < 0)
                    return;

                if (this.precent_ == 0)
                    this.precent_ = 1;

                this.thumRect_.top = this.leftBlank_ + this.buttonSize + Math.round(this.position_ * this.precent_);
                this.thumRect_.bottom = this.thumRect_.top + vThumHeight;
                //Scroll(scTrack, FPosition);  //鼠标移动改变滑块的垂直位置
            } else {  // 滚动轨道大于等于范围
                this.thumRect_.top = this.leftBlank_ + this.buttonSize;
                this.thumRect_.bottom = this.height - this.rightBlank_ - this.buttonSize;
            }
        }
    }

    _setOrientation(val) {
        if (this.orientation_ != val) {
            this.orientation_ = val;
            if (val == TOrientation.Horizontal) {
                this.height_ = this.buttonSize;
                this.align = TAlign.Bottom;
            } else {
                this.width_ = this.buttonSize;
                this.align = TAlign.Right;
            }
        }
    }

    _setMin(val) {
        if (this.min_ != val) {
            if (val > this.max_)
                this.min_ = this.max_;
            else
                this.min_ = val;

            if (this.position_ < this.min_)
                this.position_ = this.min_;

            this.range_ = this.max_ - this.min_;
            this._reCalcThumRect();
            this._updateRangRect();
        }
    }

    _setMax(val) {
        if (this.max_ != val) {
            if (val < this.min_)
                this.max_ = this.min_;
            else
                this.max_ = val;

            if (this.position_ + this.pageSize_ > this.max_)
                this.position_ = Math.max(this.max_ - this.pageSize_, this.min_);

            this.range_ = this.max_ - this.min_;
            this._reCalcThumRect();
            this._updateRangRect();
        }
    }

    _setPageSize(val) {
        if (this.pageSize_ != val) {
            this.pageSize_ = val;
            this._reCalcThumRect();
            this._updateRangRect();
        }
    }

    _setPosition(val) {
        let vPos = 0;
        if (val < this.min_)
            vPos = this.min_;
        else if (val + this.pageSize_ > this.max_)
            vPos = Math.max(this.max_ - this.pageSize_, this.min_);
        else
            vPos = val;

        if (this.position_ != vPos) {
            this.position_ = vPos;
            this._reCalcThumRect();
            this._updateRangRect();

            if (this._onScroll != null)
                this._onScroll(TScrollBarCode.Position, this.position_);
        }
    }

    scrollStep_(scrollCode) {
        let vPos = 0;
        switch (scrollCode) {
            case TScrollBarCode.LineUp:
                vPos = this.position_ - this.btnStep_;
                if (vPos < this.min_)
                    vPos = this.min_;

                if (this.position_ != vPos)
                    this.position = vPos;

                break;

            case TScrollBarCode.LineDown:
                vPos = this.position_ + this.btnStep_;
                if (vPos > this.range_ - this.pageSize_)
                    vPos = this.range_ - this.pageSize_;

                if (this.position_ != vPos)
                    this.position = vPos;

                break;

            case TScrollBarCode.PageUp:
                vPos = this.position_ - this.pageSize_;
                if (vPos < this.min_)
                    vPos = this.min_;

                if (this.position_ != vPos)
                    this.position = vPos;

                break;

            case TScrollBarCode.PageDown:
                vPos = this.position_ + this.pageSize_;
                if (vPos > this.range_ - this.pageSize_)
                    vPos = this.range_ - this.pageSize_;

                if (this.position_ != vPos)
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
            if (this.orientation_ == TOrientation.Horizontal) {
                if (this.mouseDownControl_ == TScrollBarControl.Thum) {
                    vOffs = e.x - this.mouseDownPt_.x;
                    this.position = this.position_ + Math.round(vOffs / this.precent_);
                    this.mouseDownPt_.x = e.x;
                }
            } else {
                if (this.mouseDownControl_ == TScrollBarControl.Thum) {
                    vOffs = e.y - this.mouseDownPt_.y;
                    this.position = this.position_ + Math.round(vOffs / this.precent_);
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
            if (this.orientation_ == TOrientation.Horizontal)
                return TRect.CreateByBounds(0, 0, this.leftBlank_, this.height).pointInAt(x, y);
            else
                return TRect.CreateByBounds(0, 0, this.width, this.leftBlank_).pointInAt(x, y);
        }

        return false;
    }

    _ptInRightBlankArea(x, y) {
        if (this.rightBlank_ != 0) {
            if (this.orientation_ == TOrientation.Horizontal)
                return TRect.CreateByBounds(this.width - this.rightBlank_, 0, this.rightBlank_, this.height).pointInAt(x, y);
            else
                return TRect.CreateByBounds(0, this.height - this.rightBlank_, this.width, this.rightBlank_).pointInAt(x, y);
        }

        return false;
    }

    doResize_() {
        super.doResize_();
        if (this.orientation_ == TOrientation.Vertical)
            this.pageSize_ = this.height;
        else
            this.pageSize_ = this.width;

        if (this.position_ + this.pageSize_ > this.max_)
            this.position_ = Math.max(this.max_ - this.pageSize_, this.min_);

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
        if (this.orientation_ == TOrientation.Horizontal) {
            vRect.inFlate(0, -1);
            this.doDrawThumBefor_(hclCanvas, vRect);
            hclCanvas.brush.color = theme.backgroundHotColor;
            hclCanvas.fillRect(vRect);

            hclCanvas.pen.color = theme.borderColor;
            hclCanvas.beginPath();
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

            hclCanvas.pen.color = theme.backgroundHotColor;
            hclCanvas.beginPath();
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

            hclCanvas.pen.color = theme.borderColor;
            hclCanvas.beginPath();
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

            hclCanvas.pen.color = theme.backgroundHotColor;
            hclCanvas.beginPath();
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
        return this.orientation_;
    }

    set orientation(val) {
        this._setOrientation(val);
    }

    get min() {
        return this.min_;
    }

    set min(val) {
        this._setMin(val);
    }

    get max() {
        return this.max_;
    }

    set max(val) {
        this._setMax(val);
    }

    get pageSize() {
        return this.pageSize_();
    }

    set pageSize(val) {
        this._setPageSize(val);
    }

    get position() {
        return this.position_;
    }

    set position(val) {
        this._setPosition(val);
    }

    get btnStep() {
        return this.btnStep_;
    }

    set btnStep(val) {
        if (this.btnStep_ != val)
            this.btnStep_ = val;
    }

    get onScroll() {
        return this._onScroll;
    }

    set onScroll(val) {
        this._onScroll = val;
    }
}

class TCustomProgress extends TControl {
    constructor() {
        super();
        this.min_ = 0;
        this.max_ = 100;
        this.position_ = 0;
        this.precent_ = 0;
        this.width_ = 100;
        this.height_ = 20;
        this.onChange = null;
    }

    doReset() {
        if (this.min_ > this.max_)
            this.min_ = this.max_;

        if (this.position_ < this.min_)
            this.position_ = this.min_;

        if (this.position_ > this.max_)
            this.position_ = this.max_;

        if (this.max_ > this.min_)  // 防止除0错
            this.precent_ = (this.position_ - this.min_) / (this.max_ - this.min_);
        else
            this.precent_ = 0;
    }

    reset() {
        this.doReset();
        this.update();
    }

    doPaintBackground_(hclCanvas) {
        hclCanvas.brush.color = theme.backgroundStaticColor;
        hclCanvas.fillBounds(0, 0, this.width, this.height);
        hclCanvas.brush.color = theme.backgroundDownColor;
        hclCanvas.fillBounds(0, 0,  Math.trunc(this.width * this.precent_), this.height);
    }

    doPaint_(hclCanvas) { }  // eslint-disable-line

    get min() {
        return this.min_;
    }

    set min(val) {
        if (this.min_ != val) {
            this.min_ = val;
            this.reset();
        }
    }

    get max() {
        return this.max_;
    }

    set max(val) {
        if (this.max_ != val) {
            this.max_ = val;
            this.reset();
        }
    }

    get position() {
        return this.position_;
    }

    set position(val) {
        if (this.position_ != val) {
            this.position_ = val;
            this.reset();
            if (this.onChange != null)
                this.onChange();
        }
    }
}

export class TProgressBar extends TCustomProgress {
    constructor() {
        super();
        this.borderVisible_ = true;
        this.percentVisible_ = true;
    }

    doPaintBackground_(hclCanvas) {
        super.doPaintBackground_(hclCanvas);

        if (this.percentVisible_) {
            hclCanvas.font.assign(THCCanvas.DefaultFont);
            let vLeft = Math.trunc(this.width * this.precent_)
                - hclCanvas.textWidth(Math.trunc(this.precent_ * 100) + "%");

            if (vLeft < 1)
                vLeft = 1;

            hclCanvas.textOut(vLeft, (this.height - THCCanvas.DefaultFont.height) / 2,
                Math.trunc(this.precent_ * 100) + "%");
        }

        if (this.borderVisible_) {
            hclCanvas.pen.width = 1;
            hclCanvas.pen.color = theme.borderColor;
            hclCanvas.rectangleBounds(0, 0, this.width, this.height);
        }
    }

    get percentVisible() {
        return this.percentVisible_;
    }

    set percentVisible(val) {
        if (this.percentVisible_ != val) {
            this.percentVisible_ = val;
            this.update();
        }
    }

    get borderVisible() {
        return this.borderVisible_;
    }

    set borderVisible(val) {
        if (this.borderVisible_ != val) {
            this.borderVisible_ = val;
            this.update();
        }
    }
}

export class TTrackBar extends TCustomProgress {
    constructor() {
        super();
        this.thumHotRect_ = TRect.CreateByBounds(0, 2, theme.iconSize, this.height - 4);
        this.thumRect_ = TRect.CreateByBounds(0, 0, theme.iconSize, this.height);
        this.trackHeight_ = 5;
        this.downPos_ = 0;
        this.downX_ = 0;
        this.orientation_ = TOrientation.Horizontal;
    }

    doReset() {
        super.doReset();
        let vPos = Math.trunc(this.width * this.precent_);
        this.thumRect_.resetBounds(vPos - 8, (this.height - this.trackHeight_) / 2, theme.iconSize, this.trackHeight_);
        this.thumHotRect_.resetBounds(this.thumRect_.left, 2, theme.iconSize, this.height - 4);
    }

    doPaintBackground_(hclCanvas) {
        hclCanvas.brush.color = theme.backgroundDownColor;
        hclCanvas.fillBounds(0, Math.trunc((this.height - this.trackHeight_) / 2), this.width, this.trackHeight_);
        
        hclCanvas.brush.color = theme.backgroundSelectColor;
        if (this.mouseIn)
            hclCanvas.fillRect(this.thumHotRect_);
        else
            hclCanvas.fillRect(this.thumRect_);
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
        if (this.thumHotRect_.pointInAt(e.x, e.y)) {
            this.downPos_ = this.position_;
            this.downX_ = e.x;
        }
        else
            this.downX_ = -1;
    }

    doMouseMove_(e) {
        super.doMouseMove_(e);

        let vOffs = 0;
        if (e.button == TMouseButton.Left) {
            if (this.orientation_ == TOrientation.Horizontal) {
                if (this.downX_ > 0) {
                    vOffs = e.x - this.downX_;
                    this.position = this.downPos_ + Math.round(vOffs / this.width * (this.max_ - this.min_));
                }
            } else {
                if (this.downX_ > 0) {
                    vOffs = e.y - this.downX_;
                    this.position = this.downPos_ + Math.round(vOffs / this.height * (this.max_ - this.min_));
                }
            }
        }
    }
}

export var TControlState = {
    Creating: 1,
    Removing: 2,
    Checked: 3,
    Aligning: 4,
    VisibleChange: 5
}

export var TControlStyle = {
    ButtonRadio: 1,
    CheckBox: 2
}

// 此类实现了容器功能，可作为parent
export class TWinControl extends TControl {
    constructor() {
        super();

        this.state_.add(TControlState.Creating);
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
        this.reAlign();
        super.doResize_();
    }

    added_(parent) {
        super.added_(parent);
        if (this.visible_ && !this.canFocus && this.focusControl != null)
            this.focusControl.doSetFocus_(true);
    }

    doAddControl_(control) {
        //control.parent = this;
        control.added_(this);
        this.reAlignControl(control);
    }
    
    doAlign_() {
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
                control.height = vBottom - vTop - control.marginTop - control.marginBottom;
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
                control.height = vBottom - vTop - control.marginTop - control.marginBottom;
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
                control.width = vRight - vLeft - control.marginLeft - control.marginRight;
                control.height = vBottom - vTop - control.marginTop - control.marginBottom;
                control.reAlign();
            }
        }
    }

    removed_() {
        this.state_.add(TControlState.Removing);
        super.removed_();
        this.controls.clear();
    }

    doRemoveControl_(control) {
        if (this._focusControl === control)
            this._focusControl = null;

        if (this._captureControl === control)
            this._captureControl = null;

        if (this._mouseMoveControl === control)
            this._mouseMoveControl = null;

        control.removed_();
        //control = null; controls会根据ownsObjects处理为null
        this.reAlign();
    }

    controlVisible_(control, val) {  // eslint-disable-line
        if (!val && this.focusControl) {  // 隐藏不显示
            if (this.focusControl == control || this.focusControl.isChildControl(control))
                this.focusControl.killFocus();
        }

        this.reAlignControl(control);
    }

    addControl(control) {
        this.controls.add(control);
    }

    removeControl(control) {
        this.controls.remove(control);
    }

    reAlign() {
        if (this.state_.has(TControlState.Creating))
            return;

        if (this.state_.has(TControlState.Aligning))  // 防止child reAlign时再次触发其parent的reAlign
            return;
        
        if (this.state_.has(TControlState.Removing))
            return;
            
        this.state_.add(TControlState.Aligning);
        try {
            this.doAlign_();
            super.reAlign();
        } finally {
            this.state_.delete(TControlState.Aligning);
            this.update();
        }
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

        if (this.visible_ && this.parent != null)
            this.parent.setFocusControl_(control, accept);
    }

    killFocusControl_(control) {
        this._focusControl = null;
        if (this.parent != null)
            this.parent.killFocusControl_(control);
        else
            application.killFocusControl_(control);
    }

    killFocus() {
        if (this.focused)
            super.killFocus();
        else if (this._focusControl != null)
            this._focusControl.killFocus();
    }

    deactivate() {
        this.killFocus();
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

    getControlAt(x, y, enabled = true) {  // 指定位置的control(不再进入control内部)
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

    getControlAtPos(x, y, enabled = true) {  // 指定位置的control(进入control内部)
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
        let vControl = this.getControlAt(e.x, e.y);

        if (this.designState) {
            if (vControl != null)
                vControl.hclSelect();
            else
                this.hclSelect();
        }

        if (vControl != null) {
            this._captureControl = vControl;
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x = e.x - this._captureControl.left;
            vMouseArgs.y = e.y - this._captureControl.top;
            this._captureControl.mouseDown(vMouseArgs);
        } else {
            if (this._focusControl != null)
                this._focusControl.killFocus();

            super.mouseDown(e);
        }
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
            hclCanvas.drawImage(0, 0, this.image.image);
        else {
            if (this.color != null)
                hclCanvas.brush.color = this.color;
            else
                hclCanvas.brush.color = theme.backgroundStaticColor;
                
            hclCanvas.fillBounds(0, 0, this.width, this.height);
        }

        super.doPaintBackground_(hclCanvas);
    }

    doPaint_(hclCanvas) {
        let vControl = null;
        for (let i = 0; i < this.controls.count; i++) {
            vControl = this.controls[i];
            if (!vControl.visible)
                continue;

            hclCanvas.save();
            try {
                // to do 处理旋转的区域
                hclCanvas.translate(vControl.left, vControl.top);
                if (vControl.drawShadow)  // 为实现emr数据元弹出窗体阴影临时加的
                    theme.drawShadow(hclCanvas, TRect.CreateByBounds(0, 0, vControl.width, vControl.height), true);
                
                hclCanvas.clip(0, 0, vControl.width, vControl.height);
                vControl.paint(hclCanvas);
            } finally {
                hclCanvas.restore();
            }
        }

        super.doPaint_(hclCanvas);
    }

    broadcast(message, wParam = 0, lParam = 0) {
        for (let i = 0; i < this.controls.count; i++)
            this.controls[i].broadcast(message, wParam, lParam);

        super.broadcast(message, wParam, lParam);
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

export class TPopupWinControl extends TCustomControl {
    constructor() {
        super();
        this.dropDownStyle = false;
        this.popupLinkedList = null;
        this.forward = null;
        this.next = null;
        this.onDone = null;
    }

    _doPaintShadow(hclCanvas, rect) {
        hclCanvas.brush.color = theme.backgroundStaticColor;
        hclCanvas.fillRectShadow(rect, theme.shadow);
    }

    doPaintBackground_(hclCanvas) {
        let vRect = this.clientRect();
        theme.drawShadow(hclCanvas, vRect, this.dropDownStyle);
        super.doPaintBackground_(hclCanvas);
    }

    updateRect(rect) {
        application.updateRect(rect.offset(this.left, this.top, true));
    }

    popup(x, y, root) {
        this.left = x;
        this.top = y;
        this.visible = true;
        application.trackPopupControl(this, root);
    }

    popupControl(control) {
        let point = control.clientToScreenAt(0, 0);
        this.popup(point.x, point.y + control.height, true);
    }

    donePopup() {  // 完成popup链
        application.closePopupControl(this.popupLinkedList.first);
        if (this.onDone != null)
            this.onDone();
    }

    closePopup() {
        this.deactivate();
        if (this.onClose != null)
            this.onClose();
    }

    close() {  // 我关闭后把我的后续popup链关闭
        application.closePopupControl(this);
    }

    // _controlUpdate(rect) {
    //     this.updateRect(rect.offset(this._winControl.left, this._winControl.top));
    // }

    // _setControl(val) {
    //     if (this._winControl !== val) {
    //         this._winControl = val;
    //         this._winControl.onUpdate = (rect) => {
    //             this._controlUpdate(rect);
    //         }
    //     }
    // }

    // get control() {
    //     return this._winControl;
    // }

    // set control(val) {
    //     this._setControl(val);
    // }
}