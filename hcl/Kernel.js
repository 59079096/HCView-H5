/*================================================

    Html Visual Component Library 前端UI框架 V0.1 2019-11-26
    作者：荆通(18114532@qq.com)
    QQ群：
    
================================================*/

import { application } from "./Application.js";
import { TCaret, TCursors, theme, TKey, TKeyEventArgs, TMouseButton, TMouseEventArgs, TShiftState } from "./Controls.js";
import { TTimer } from "./ExtCtrls.js";
import { TMessageDialog } from "./Forms.js";
import { THCCanvas } from "./Graphics.js";
import { TList, TObject, TPoint, TRect } from "./System.js";

class THCL extends TObject {
    constructor() {
        super();    

        this._updateCount = 0;
        this._handleSeq = 1000;
        this._cursorPos = new TPoint();
        this._cursor = TCursors.Default;

        this._caret = new TCaret();
        this._caretTimer = new TTimer(530);
        this._caretTimer.onTimer = () => { this._doCaretTimer_(); }

        this.keyDownStates = new Array(255);  // bool array
        this._width = 854;
        this._height = 400;  // 640 480        
        this._left = this._getAdjustLeft();;
        this._top = 0;
        this._horizontalCenter = true;
        this._autoWidth = false;
        this._autoHeight = true;

        this._captureLayer = null;
        this._mouseMoveLayer = null;
        this._capturePopupControl = null;
        this._mouseMovePopupControl = null;

        this._applicationLayer = new TList();

        this._popupLayer = new TList();
        this._popupLayer.onAdded = (item) => {
            this.update();
        }

        this._popupLayer.onRemoved = (item) => {
            item.clear();
            this.update();
        }

        this._scale = 1;
        this._hclH5Canvas = document.createElement("canvas");
        this._hclH5Canvas.setAttribute("id", "h5canvas");
        this._hclH5Canvas.width = this._width;
        this._hclH5Canvas.height = this._height;
        this._hclH5Canvas.style.position = "absolute";
        this._hclH5Canvas.style.left = this._left + "px";
        this._hclH5Canvas.style.top = "0px";
        this._hclH5Canvas.style.imeMode = "active";
        this._hclCanvas = new THCCanvas(this._hclH5Canvas.getContext("2d"));

        this._appH5Canvas = document.createElement("canvas");      
        //this._popupH5Canvas.style.position = "absolute";
        this._appCanvas = new THCCanvas(this._appH5Canvas.getContext("2d"));

        this._popupH5Canvas = document.createElement("canvas");      
        //this._popupH5Canvas.style.position = "absolute";
        this._popupCanvas = new THCCanvas(this._popupH5Canvas.getContext("2d"));

        this.parentElement = document.body;
        this._initEvent();
    }

    // region 光标
    _createCaret_(control, image, width, height) {
        this._caretTimer.enabled = false;
        this._resetCaret_();
        this._caret.reset();
        this._caret.control = control;
        this._caret.image = image;
        if (width > 0)
            this._caret.width = width;

        if (height > control.height)
            this._caret.height = control.height;
        else
            this._caret.height = height;
    }

    _setCaretPos_(x, y) {
        if (this._caret.control != null) {
            this._resetCaret_();
            let vPoint = this._caret.control.clientToScreen(TPoint.Create(0, 0));
            this._caret.left = vPoint.x + x;
            this._caret.top = vPoint.y + y;
        }
    }

    _showCaret_(control) {
        if (this._caret.control != null) {
            if (!this._caretTimer.enabled)
                this._caretTimer.enabled = true;

            this._caret.visible = true;
        }
    }

    _hideCaret_(control) {
        if (this._caret.control != control)
            return;

        if (this._caret.visible) {
            this._resetCaret_();
            this._caret.visible = false;
            this._caretTimer.enabled = false;
        }
    }

    _destroyCaret_(control) {
        if (this._caret.control != control)
            return;
            
        this._hideCaret_(control);
        this._caret.control = null;
    }

    _doCaretShan_() {
        // this._caret._data_ = this._hclCanvas.getImageData(this._caret.left, this._caret.top,
        //     this._caret.width, this._caret.height);

        // let vPopData = this._popupCanvas.getImageData(this._caret.left, this._caret.top,
        //     this._caret.width, this._caret.height);

        this._hclCanvas.brush.color = this._caret.color;
        this._hclCanvas.fillBounds(this._caret.left, this._caret.top,
            this._caret.width, this._caret.height);

        //this._appCanvas.setImageData(vPopData, this._caret.left, this._caret.top);
        if (this._popupLayer.count > 0)
            this._hclCanvas.bitBlt(this._caret.left, this._caret.top, this._caret.width, this._caret.height,
                this._popupCanvas, this._caret.left, this._caret.top, this._caret.width, this._caret.height);

        this._caret.shan = false;
    }

    _doCaretShuo_() {
        //this._hclCanvas.setImageData(this._caret._data_, this._caret.left, this._caret.top);
        this._hclCanvas.bitBlt(this._caret.left, this._caret.top, this._caret.width, this._caret.height,
            this._appCanvas, this._caret.left, this._caret.top, this._caret.width, this._caret.height);

        if (this._popupLayer.count > 0)
            this._hclCanvas.bitBlt(this._caret.left, this._caret.top, this._caret.width, this._caret.height,
                this._popupCanvas, this._caret.left, this._caret.top, this._caret.width, this._caret.height);
                
        this._caret.shan = true;
    }

    _resetCaret_() {
        if ((this._caret.visible) && (!this._caret.shan))  // 当前在闪
            this._doCaretShuo_();
    }

    _doCaretTimer_() {
        if (this._caret.shan)
            this._doCaretShan_();
        else
            this._doCaretShuo_();
    }
    // endregion

    _setCursorBy_(control) {
        if (this._cursor != control.cursor) {
            let vControl = this._getControlAtPos(this._cursorPos.x, this._cursorPos.y);
            if (vControl === control) {
                this._cursor = control.cursor;
                this._hclH5Canvas.style.cursor = theme.getCSSCursor(this._cursor);
            }
        }
    }

    _isPreventKeyDown(key) {
        return ((key == TKey.Back)
            || (key == TKey.Delete)
            || (key == TKey.Left)
            || (key == TKey.Right)
            || (key == TKey.Up)
            || (key == TKey.Down)
            || (key == TKey.Return)
            || (key == TKey.Home)
            || (key == TKey.End)
            || (key == TKey.Tab));
    }

    _killFocusControl_(app, control) {
        if (this._caret.visible) {
            this._destroyCaret_(this._caret.control);
        }
    }

    _closePopupControl_(popupControl) {
        if (popupControl != null) {
            let vPopupLinkedList = popupControl.popupLinkedList;
            if (popupControl.forward != null) {
                let vNext = popupControl;
                while (vNext.next !== null)
                    vNext = vNext.next;
                
                let vForward;
                while (vNext !== popupControl) {
                    vForward = vNext.forward;
                    vForward.next = null
                    vNext.forward = null;
                    vPopupLinkedList.remove(vNext);
                    vNext = vForward;
                }

                popupControl.forward.next = null;
                popupControl.forward = null;
                vPopupLinkedList.remove(popupControl);
                this.update();
                if (vPopupLinkedList.count == 0) {
                    this._popupLayer.remove(vPopupLinkedList);
                    this._reAdjustMouseMove();
                }
            } else {
                this._popupLayer.remove(vPopupLinkedList);
                this.update();
                this._reAdjustMouseMove();
            }
        }
    }

    _trackPopupControl_(popupControl, root) {
        let vRight = Math.min(this._width, this._getViewPortWidth());
        let vBottom = Math.min(this._height, this._getViewPortHeight());

        if (root) {
            if (popupControl.adjustPosition) {
                if (popupControl.left + popupControl.width + theme.shadow > vRight)
                    popupControl.left = vRight - popupControl.width - theme.shadow;

                if (popupControl.top + popupControl.height + theme.shadow > vBottom)
                    popupControl.top = vBottom - popupControl.height - theme.shadow;
            }

            let vPopupLinkedList = new TList();
            vPopupLinkedList.onAdded = (item) => {
                this.update();
            }

            vPopupLinkedList.onRemoved = (item) => {
                item.onClose();
            }

            popupControl.popupLinkedList = vPopupLinkedList;
            vPopupLinkedList.add(popupControl);
            this._popupLayer.add(vPopupLinkedList);
        } else if (this._popupLayer.count > 0) {
            popupControl.forward = this._popupLayer.last.last;
            this._popupLayer.last.last.next = popupControl;

            if (popupControl.adjustPosition) {
                if (popupControl.left + popupControl.width + theme.shadow > vRight)
                   popupControl.left = popupControl.forward.left - popupControl.width;

                if (popupControl.top + popupControl.height + theme.shadow > vBottom)
                    popupControl.top = vBottom - popupControl.height - theme.shadow;
            }

            popupControl.popupLinkedList = this._popupLayer.last;
            this._popupLayer.last.add(popupControl);
        }
        
        this._reAdjustMouseMove();
    }       

    _getControlAtPos(x, y) {
        let vControl = this._getPopupControlAtPos(x, y);
        if (vControl !== null)
            return vControl;
        else
            return application.getControlAtPos(x, y);
    } 

    _reAdjustMouseMove() {
        let vMouseArgs = new TMouseEventArgs();
        vMouseArgs.x = this._cursorPos.x;
        vMouseArgs.y = this._cursorPos.y;
        this._mouseMove(vMouseArgs);
    }

    _getPopupControlAt(x, y) {
        if (this._popupLayer.count > 0) {
            let vPopupLinkedList = null;
            for (let i = this._popupLayer.count - 1; i >= 0; i--) {
                vPopupLinkedList = this._popupLayer[i];
                for (let j = vPopupLinkedList.count - 1; j >=0; j--) {
                    if (vPopupLinkedList[j].bounds().pointInAt(x, y))
                        return vPopupLinkedList[j];
                }
            }
        }

        return null;
    }

    _popupMouseWheel(e) {
        let vPopupControl = this._mouseMovePopupControl;// this._getPopupControlAt(e.x, e.y);
        if (vPopupControl !== null) {
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x -= vPopupControl.left;
            vMouseArgs.y -= vPopupControl.top;
            vPopupControl.mouseWheel(vMouseArgs);
            return true;
        }

        return false;
    }

    _popupMouseDown(e) {
        this._capturePopupControl = this._mouseMovePopupControl;// this._getPopupControlAt(e.x, e.y);
        if (this._capturePopupControl !== null) {
            e.x -= this._capturePopupControl.left;
            e.y -= this._capturePopupControl.top;
            this._capturePopupControl.mouseDown(e);
            return true;
        }

        if (this._popupLayer.count > 0) {
            for (let i = this._popupLayer.count - 1; i >= 0; i--)
                this._closePopupControl_(this._popupLayer[i].first);
        }

        return false;
    }

    _popupMouseMove(e) {
        if (this._capturePopupControl !== null) {
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x -= this._capturePopupControl.left;
            vMouseArgs.y -= this._capturePopupControl.top;
            this._capturePopupControl.mouseMove(vMouseArgs);
            return true;
        }

        let vPopupControl = this._getPopupControlAt(e.x, e.y);
        if (vPopupControl != this._mouseMovePopupControl) {
            if (this._mouseMovePopupControl != null)
                this._mouseMovePopupControl.mouseLeave();

            this._mouseMovePopupControl = vPopupControl;
            if (this._mouseMovePopupControl != null)
                this._mouseMovePopupControl.mouseEnter();
        }

        if (this._mouseMovePopupControl !== null) {
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x -= this._mouseMovePopupControl.left;
            vMouseArgs.y -= this._mouseMovePopupControl.top;
            this._mouseMovePopupControl.mouseMove(vMouseArgs);
            return true;
        }

        return false;
    }

    _popupMouseUp(e) {
        if (this._capturePopupControl !== null) {
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x = e.x - this._capturePopupControl.left;
            vMouseArgs.y = e.y - this._capturePopupControl.top;
            this._capturePopupControl.mouseUp(vMouseArgs);
            this._capturePopupControl = null;
            return true;
        }

        let vPopupControl = this._mouseMovePopupControl;// this._getPopupControlAt(e.x, e.y);
        if (vPopupControl !== null) {
            e.x -= vPopupControl.left;
            e.y -= vPopupControl.top;
            vPopupControl.mouseUp(e);
            return true;
        }

        return false;
    }

    _getPopupControlAtPos(x, y) {
        let vPopupControl = this._getPopupControlAt(x, y);
        if (vPopupControl !== null)
            return vPopupControl.getControlAtPos(x - vPopupControl.left, y - vPopupControl.top);

        return null;
    }

    _initEvent() {
        this._hclH5Canvas.onmousedown = (e) => {
            this._mouseDown(this._makeMouseEventArgs(e));
            //e.preventDefault();
        }

        this._hclH5Canvas.onmousemove = (e) => {
            this._mouseMove(this._makeMouseEventArgs(e));
            //e.preventDefault();
        }

        this._hclH5Canvas.onmouseup = (e) => {
            let vMouseArgs = this._makeMouseEventArgs(e);
            if (e.buttons === 0) {
                if (e.button === 0)
                    vMouseArgs.button = TMouseButton.Left;
                else if (e.button === 1)
                    vMouseArgs.button = TMouseButton.Middle;
                else if (e.button === 2)
                    vMouseArgs.button = TMouseButton.Right;
            }

            this._mouseUp(vMouseArgs);
            //e.preventDefault();
        }

        this._hclH5Canvas.onmouseenter = (e) => {
            this._mouseEnter(this._makeMouseEventArgs(e));
            //e.preventDefault();
        }

        this._hclH5Canvas.onmousewheel = (e) => {
            this._mouseWheel(e);
        }

        this._hclH5Canvas.onmouseleave = (e) => {
            this._mouseLeave(this._makeMouseEventArgs(e));
            //e.preventDefault();
        }

        this._hclH5Canvas.ondblclick = (e) => {
            this._dblClick(this._makeMouseEventArgs(e));
        }

        window.onkeydown = (e) => {
            this._keyDown(e);
        }

        window.onkeypress = (e) => {
            this._keyPress(e);
            //e.preventDefault();
        }

        window.onkeyup = (e) => {
            this._keyUp(e);
            //e.preventDefault();
        }

        window.onresize = (e) => {
            this._resize();
            //e.preventDefault();
        }

        window.onload = (e) => {
            this._loaded = true;
            e.preventDefault();
        }

        window.document.onvisibilitychange = (e) => {
            if (window.document.hidden)
                this._deactivate();
            else
                this._activate();
        }

        window.document.body.oncontextmenu = function(e) {
            e.returnValue = false;
        }
    }

    _windowToCanvas(h5canvas, x, y) {
        let rect = h5canvas.getBoundingClientRect();
        return {
            x: (x - rect.left) * (h5canvas.width / rect.width),
            y: (y - rect.top) * (h5canvas.height / rect.height)
        }
    }

    _getAdjustLeft() {
        let vLeft = (this._getViewPortWidth() - this._width) / 2;
        if (vLeft < document.body.clientLeft)
            vLeft = document.body.clientLeft;

        return vLeft;
    }

    // 获取可视区域的宽度
    _getViewPortWidth() {
        if (this._parentElement != null) {
            if (this._parentElement != document.body)
                return this._parentElement.clientWidth;
        }

        return document.documentElement.clientWidth || document.body.clientWidth;
    }

    _getViewPortHeight() {
        if (this._parentElement != null) {
            if (this._parentElement != document.body)
                return this._parentElement.clientHeight;// || this._parentElement.offsetHeight;
        }

        return document.documentElement.clientHeight || document.body.clientHeight;
    }
    
    _resize() {
        this.beginUpdate();
        try {
            if (this._autoWidth) {
                this._hclH5Canvas.style.left = "0px";
                this._width = this._getViewPortWidth();
            } else if (this._horizontalCenter) {
                    this._left = this._getAdjustLeft();
                    if (this._hclH5Canvas.style.left != this._left + "px")
                        this._hclH5Canvas.style.left = this._left + "px";
            }

            if (this._autoHeight)
                this._height = this._getViewPortHeight();

            this._hclH5Canvas.width = this._width;
            this._hclH5Canvas.height = this._height;
            this._hclCanvas.prepareConext();
            this._hclCanvas.h5context.scale(this._scale, this._scale);

            this._appH5Canvas.width = this._width;
            this._appH5Canvas.height = this._height;
            this._appCanvas.prepareConext();

            this._popupH5Canvas.width = this._width;
            this._popupH5Canvas.height = this._height;
            this._popupCanvas.prepareConext();

            if (application != null)
                application._resize_();
        }
        finally {
            this.endUpdate();
        }
    }

    _paintWaiting(text) {
        this._hclCanvas.brush.color = 'white';
        this._hclCanvas.fillBounds(0, 0, this._width, this._height);
        this._hclCanvas.font.name = "宋体";
        this._hclCanvas.font.size = "16";
        this._hclCanvas.font.color = "blue";
        this._hclCanvas.textOut(40, 40, text);
    }

    _paintApplicationLayer(rect) {
        this._appCanvas.save();
        try {
            this._appCanvas.clipRect(rect);
            application.paint(this._appCanvas);
        } finally {
            this._appCanvas.restore();
        }

        this._hclCanvas.bitBltRect(rect, this._appCanvas, rect);
    }

    _paintPopupLayer(rect) {
        if (this._popupLayer.count == 0)
            return;

        this._popupCanvas.clearRect(rect);  // 如果不清除，同一位置菜单多次绘制时阴影叠加导致加深

        let vPopupLinkedList = null;
        let vPopupControl = null;
        for (let i = 0; i < this._popupLayer.count; i++) {
            vPopupLinkedList = this._popupLayer[i];
            for (let j = 0; j < vPopupLinkedList.count; j++) {
                vPopupControl = vPopupLinkedList[j];
                this._popupCanvas.save();
                try {
                    this._popupCanvas.translate(vPopupControl.left, vPopupControl.top);
                    vPopupControl.paint(this._popupCanvas);
                } finally {
                    this._popupCanvas.restore();
                }
            }
        }

        this._hclCanvas.bitBltRect(rect, this._popupCanvas, rect);
    }

    _paint(rect) {
        //this._hclCanvas.prepareConext();
        if (application != null) {
            if (!application.runing)
                this._paintWaiting("等待 {0} 启动...".format(application.title));
            else {
                this._hclCanvas.save();
                try {
                    //this._hclCanvas.clipRect(rect);
                    this._paintApplicationLayer(rect);
                    this._paintPopupLayer(rect);
                } finally {
                    this._hclCanvas.restore();
                }
            }

            return;
        }

        this._paintWaiting("HCL 正在准备运行环境...");
    }

    _deactivate() {
        if (this._caretTimer.enabled) {
            this._caretTimer.enabled = false;
            this._caretTimer._deactivateEnable_ = true;
        }
        else
            this._caretTimer._deactivateEnable_ = false;

        //application.deactivate();
    }

    _activate() {
        if (this._caretTimer._deactivateEnable_ && !this._caretTimer.enabled) 
            this._caretTimer.enabled = true;        
        //application.activate();
    }

    _makeMouseEventArgs(e) {
        let vPoint = this._windowToCanvas(this._hclH5Canvas, e.clientX, e.clientY);
        let vMouseArgs = new TMouseEventArgs();
        if (e.ctrlKey)
            vMouseArgs.shift.add(TShiftState.Ctrl);

        if (e.altKey)
            vMouseArgs.shift.add(TShiftState.Alt);

        if (e.shiftKey)
            vMouseArgs.shift.add(TShiftState.Shift);

        if (e.buttons === 0) {
            if (e.button === 1)
                vMouseArgs.button = TMouseButton.Left;
            else if (e.button === 4)
                vMouseArgs.button = TMouseButton.Middle;
            else if (e.button === 2)
                vMouseArgs.button = TMouseButton.Right;
        } else if (e.buttons === 1)
            vMouseArgs.button = TMouseButton.Left;
        else if (e.buttons === 4)
            vMouseArgs.button = TMouseButton.Middle;
        else if (e.buttons === 2)
            vMouseArgs.button = TMouseButton.Right;

        vMouseArgs.x = vPoint.x;
        vMouseArgs.y = vPoint.y;
        vMouseArgs.delta = e.wheelDelta;
        vMouseArgs.clicks = e.detail;
        return vMouseArgs;
    }

    _mouseEnter(e) {
        let vMouseArgs = this._makeMouseEventArgs(e);
        application.mouseEnter(vMouseArgs);
    }

    _mouseLeave(e) {
        let vMouseArgs = this._makeMouseEventArgs(e);
        application.mouseLeave(vMouseArgs);
    }

    _mouseWheel(e) {
        let vMouseArgs = this._makeMouseEventArgs(e);        
        if (!this._popupMouseWheel(vMouseArgs))
            application.mouseWheel(vMouseArgs);
    }

    _mouseDown(e) {
        if (this._popupMouseDown(e))
            this._captureLayer = this._popupLayer;
        else if (application.mouseDown(e))
            this._captureLayer = this._applicationLayer;
    }

    _mouseMove(e) {
        this._cursorPos.reset(e.x, e.y);
        if (this._captureLayer == this._popupLayer) {
            this._popupMouseMove(e);
            return;
        }

        if (!this._popupMouseMove(e)) {
            if (this._mouseMoveLayer != this._applicationLayer) {
                this._mouseMoveLayer = this._applicationLayer;
                application.mouseEnter(e);
            }

            application.mouseMove(e);
        } else if (this._mouseMoveLayer != this._popupLayer) {
            this._mouseMoveLayer = this._popupLayer;
            application.mouseLeave(e);
            this._setCursorBy_(this._getPopupControlAt(e.x, e.y));  // 如果将来直接记录鼠标下的popupControl可直接使用
        }
    }

    _mouseUp(e) {
        try {
            if (this._captureLayer == this._popupLayer)
                this._popupMouseUp(e)
            else
                application.mouseUp(e);
        } finally {
            this._captureLayer = null;
        }
    }

    _dblClick(e) {
        application.dblClick(e);
    }

    _makeKeyEventArgs(e) {
        let vKeyArgs = new TKeyEventArgs();
        if (e.ctrlKey)
            vKeyArgs.shift.add(TShiftState.Ctrl);

        if (e.altKey)
            vKeyArgs.shift.add(TShiftState.Alt);

        if (e.shiftKey)
            vKeyArgs.shift.add(TShiftState.Shift);

        vKeyArgs.keyCode = e.keyCode;
        vKeyArgs.key = e.key;
        return vKeyArgs;
    }

    _setKeyState(keyCode, code, down) {
        this.keyDownStates[keyCode] = down;
        switch (code) {
            case "ControlLeft":
                this.keyDownStates[TKey.LControlKey] = down;
                this.keyDownStates[TKey.ControlKey] = down;
                break;

            case "ControlRight":
                this.keyDownStates[TKey.RControlKey] = down;
                this.keyDownStates[TKey.ControlKey] = down;
                break;

            case "ShiftLeft":
                this.keyDownStates[TKey.LShiftKey] = down;
                this.keyDownStates[TKey.ShiftKey] = down;
                break;

            case "ShiftRight":
                this.keyDownStates[TKey.RShiftKey] = down;
                this.keyDownStates[TKey.ShiftKey] = down;
                break;

            case "AltLeft":
                this.keyDownStates[TKey.LMenu] = down;
                this.keyDownStates[TKey.Menu] = down;
                break;

            case "AltRight":
                this.keyDownStates[TKey.RMenu] = down;
                this.keyDownStates[TKey.Menu] = down;
                break;
        }
    }

    _keyDown(e) {
        if (this._isPreventKeyDown(e.keyCode))
            e.preventDefault();
        let vKeyEvent = this._makeKeyEventArgs(e);
        this._setKeyState(e.keyCode, e.code, true);
        application.keyDown(vKeyEvent);
    }

    _keyPress(e) {
        let vKeyEvent = this._makeKeyEventArgs(e);
        //this._setKeyState(e.keyCode, e.code, false);
        application.keyPress(vKeyEvent);
    }

    _keyUp(e) {
        let vKeyEvent = this._makeKeyEventArgs(e);
        this._setKeyState(e.keyCode, e.code, false);
        application.keyUp(vKeyEvent);
    }

    handleAllocate() {
        return ++this._handleSeq;
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

    update() {
        this.updateRect(TRect.CreateByBounds(0, 0, this._width, this._height));
    }

    updateRect(rect) {
        if (this._updateCount > 0)
            return;

        rect.inFlate(theme.shadow, theme.shadow);
        this._paint(rect);
    }

    showMessage(text) {
        let vMsgDialog = new TMessageDialog("提示", text);
        vMsgDialog.showModal();
    }

    get parentElement() {
        return this._parentElement;
    }

    set parentElement(val) {
        if (this._parentElement != val) {
            this._parentElement = val;
            val.appendChild(this._hclH5Canvas);  // 会调用removeChild从原元素中移除
            this._resize();
        }
    }

    get autoWidth() {
        return this._autoWidth;
    }

    set autoWidth(val) {
        if (this._autoWidth != val) {
            this._autoWidth = val;
            this._resize();
        }
    }

    get autoHeight() {
        return this._autoHeight;
    }

    set autoHeight(val) {
        if (this._autoHeight != val) {
            this._autoHeight = val;
            this._resize();
        }
    }

    get left() {
        return this._left;
    }

    get top() {
        return this._top;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get cursorPos() {
        return this._cursorPos;
    }

    get cursor() {
        return this._cursor;
    }

    onCatch(err) { }
}

export var hcl = new THCL();