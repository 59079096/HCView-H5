/*=======================================================

    Html Component Library 前端UI框架 V0.1
    框架环境单元 2019-11-26
    作者：荆通(18114532@qq.com)
    QQ群：649023932
    此代码仅做学习交流使用，商业使用请联系作者获取授权
    
=======================================================*/

import { application } from "./Application.js";
import { TCaret, TCursors, TKey, TKeyEventArgs, TMouseButton, TMouseEventArgs, TPopupWinControl, TShiftState, TMessage } from "./Controls.js";
import { THintInfo, TInterval } from "./ExtCtrls.js";
import { TMessageDialog } from "./Forms.js";
import { THCCanvas } from "./Graphics.js";
import { TList, TObject, TPoint, TRect } from "./System.js";
import { theme } from "./theme.js";
import { ime } from "./Ime.js";

class TWaitInfo extends TObject {
    constructor(text) {
        super();
        this.text = text;
    }
}

class TWaitList extends TList {
    constructor(ownsObjects = true) {
        super(ownsObjects);
        this.rect = TRect.CreateByBounds(0, 0, 300, 20);
    }
}

class THCL extends TObject {
    constructor() {
        super();

        this._updateCount = 0;
        this._handleSeq = 1000;
        theme.onImageLoad = () => { this.update(); }
        this._cursorPos = new TPoint();
        this._cursor = TCursors.Default;
        this._cursorControl = null;

        this._caret = new TCaret();

        this._idle = false;
        this._idleInterval = new TInterval(500);
        this._idleInterval.loop = true;
        this._idleInterval.onExecute = () => { this._doIdle(); }
        this._idleInterval.enabled = true;

        this.keyDownStates = new Array(255);  // bool array
        this.width_ = 854;
        this.height_ = 400;
        this.left_ = this._getAdjustLeft();
        this.top_ = 0;
        this.design_ = false;
        this._focus = false;
        this._mouseIn = false;
        this._horizontalCenter = true;
        this._autoWidth = false;
        this._autoHeight = true;

        this._focusLayer = null;
        this._captureLayer = null;
        this._mouseMoveLayer = null;
        this._capturePopupControl = null;
        this._mouseMovePopupControl = null;

        this._waitList = new TWaitList();
        this._waitList.onAdded = (item) => {
            this.update();
        }

        this._waitList.onRemoved = () => {
            this.update();
        }

        this._applicationLayer = new TList();

        this._popupLayer = new TList();
        this._popupLayer.onAdded = (item) => {
            this.update();
        }

        this._popupLayer.onRemoved = (item) => {
            item.clear();
            this.update();
        }

        this._hoverHintInfo = new THintInfo();

        this._scale = 1;
        this._hclH5Canvas = document.createElement("canvas");
        this._hclH5Canvas.setAttribute("id", "h5canvas");
        this._hclH5Canvas.width = this.width_;
        this._hclH5Canvas.height = this.height_;
        this._hclH5Canvas.style.position = "absolute";
        this._hclH5Canvas.style.left = this.left_ + "px";
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

    //#region 光标
    _createCaret_(control, image, width, height) {
        this._resetCaret_();
        this._caret.reset();
        this._caret.control = control;

        this._focusLayer = this._applicationLayer;
        if (this._popupLayer.count > 0) {
            let vControl = this._caret.control.parent;
            while (vControl != null) {
                if (vControl.isClass(TPopupWinControl)) {
                    this._focusLayer = this._popupLayer;
                    break;
                }

                vControl = vControl.parent;
            }
        }

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
            let vPt = this._caret.control.clientToScreenAt(0, 0);
            this._caret.left = vPt.x + x;
            this._caret.top = vPt.y + y;
            this._caret.controlScreenRect.resetBounds(vPt.x, vPt.y, this._caret.control.width, this._caret.control.height);
        }
    }

    _showCaret_(control) {
        if (this._caret.control != null)
            this._caret.visible = true;
    }

    _hideCaret_(control) {
        if (this._caret.control != control)
            return;

        if (this._caret.visible) {
            this._resetCaret_();
            this._caret.visible = false;
        }
    }

    _destroyCaret_(control) {
        if (this._caret.control != control)
            return;
            
        this._hideCaret_(control);
        this._caret.control = null;
    }

    _paintCaretShan() {
        // this._caret._data_ = this._hclCanvas.getImageData(this._caret.left, this._caret.top,
        //     this._caret.width, this._caret.height);

        // let vPopData = this._popupCanvas.getImageData(this._caret.left, this._caret.top,
        //     this._caret.width, this._caret.height);

        this._hclCanvas.brush.color = this._caret.color;
        //this._hclCanvas.fillBounds(this._caret.left, this._caret.top, this._caret.width, this._caret.height);
        this._hclCanvas.fillRect(this._caret.rect.intersection(this._caret.controlScreenRect));

        //this._appCanvas.setImageData(vPopData, this._caret.left, this._caret.top);
        if (this._popupLayer.count > 0 && this._focusLayer != this._popupLayer)
            this._hclCanvas.bitBlt(this._caret.left, this._caret.top - 1, this._caret.width, this._caret.height + 2,
                this._popupCanvas, this._caret.left, this._caret.top - 1, this._caret.width, this._caret.height + 2);
    }

    _doCaretShan_() {
        this._caret.shan = false;
        this._paintCaretShan();
        if (this._hoverHintInfo.visible && this._hoverHintInfo.rect.isIntersect(this._caret.rect))
            this._paintHintLayer();
    }

    _paintCaretShuo() {
        //this._hclCanvas.setImageData(this._caret._data_, this._caret.left, this._caret.top);
        this._hclCanvas.bitBlt(this._caret.left, this._caret.top - 1, this._caret.width, this._caret.height + 2,
            this._appCanvas, this._caret.left, this._caret.top - 1, this._caret.width, this._caret.height + 2);

        if (this._popupLayer.count > 0 && this._focusLayer != this._popupLayer)
            this._hclCanvas.bitBlt(this._caret.left, this._caret.top - 1, this._caret.width, this._caret.height + 2,
                this._popupCanvas, this._caret.left, this._caret.top - 1, this._caret.width, this._caret.height + 2);
                
    }

    _doCaretShuo_() {
        this._caret.shan = true;
        this._paintCaretShuo();
        if (this._hoverHintInfo.visible && this._hoverHintInfo.rect.isIntersect(this._caret.rect))
            this._paintHintLayer();
    }

    _resetCaret_() {
        if ((this._caret.visible) && (!this._caret.shan))  // 当前在闪
            this._doCaretShuo_();
    }

    _doCaretTimer_() {
        if (this._caret.visible) {
            if (this._caret.shan)
                this._doCaretShan_();
            else
                this._doCaretShuo_();
        }
    }
    //#endregion

    _closeHoverHint() {
        if (this._hoverHintInfo.visible) {
            this._hoverHintInfo.visible = false;
            this.updateRect(this._hoverHintInfo.rect);
        }
    }

    showHoverHint(control) {
        if (this._hoverHintInfo.visible) {
            if (this._hoverHintInfo.control === control)
                return;

            this._hoverHintInfo.visible = false;
            this.updateRect(this._hoverHintInfo.rect);
        }

        this._hoverHintInfo.control = control;
        if (control.hint == "")
           return;

        let vPt = control.clientToScreenAt(0, 0);
        this._hoverHintInfo.rect = control.getHintRect();  // 控件提供的Hint区域
        if (this._hoverHintInfo.rect.bottom + this._hoverHintInfo.rect.height + vPt.y + theme.marginSpace > this.height_)
            this._hoverHintInfo.rect.offset(vPt.x, vPt.y - this._hoverHintInfo.rect.height - theme.marginSpace);
        else
            this._hoverHintInfo.rect.offset(vPt.x, vPt.y + this._hoverHintInfo.rect.height + theme.marginSpace);

        this._hoverHintInfo.text = control.hint;
        this._hoverHintInfo.rect.resetSize(theme.getHoverHintSize(control.hint));

        if (this._hoverHintInfo.rect.left < 0)
            vPt.x = this._hoverHintInfo.rect.left;
        else if (this._hoverHintInfo.rect.right > this.width_)
            vPt.x = this._hoverHintInfo.rect.right - this.width_;
        else
            vPt.x = 0;

        if (this._hoverHintInfo.rect.top < 0)
            vPt.y = this._hoverHintInfo.rect.top;
        else if (this._hoverHintInfo.rect.bottom > this.height_)
            vPt.y = this._hoverHintInfo.rect.bottom - this.height_;
        else
            vPt.y = 0;

        this._hoverHintInfo.rect.offset(-vPt.x, -vPt.y);
        this._hoverHintInfo.visible = true;        
        this.updateRect(this._hoverHintInfo.rect);
    }

    _doIdle() {
        this._doCaretTimer_();
        
        if (this._idle && this._mouseIn) {
            if (this._cursorControl != null)
                this.showHoverHint(this._cursorControl);
        } else
            this._idle = true;
    }

    _cancelIdle() {
        this._idle = false;
        this._closeHoverHint();
    }

    _setCursorBy_(control) {
        let vControl = this._getControlAtPos(this._cursorPos.x, this._cursorPos.y);
        if (vControl === control) {
            this._cursorControl = control;
            if (this._cursor != control.cursor) {
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
        if (this._caret.visible)
            this._destroyCaret_(this._caret.control);

        /* 失去焦点时，取消输入法，防止原焦点控件忘记处理取消输入法，下次按键内容传递给原来焦点控件，
        设置焦点时因为浏览器在鼠标弹起时才激活的问题，所以放在了各控件自己的mouse事件中 */
        ime.removeControl(control);
    }

    _closePopupControl_(popupControl) {
        if (popupControl != null) {
            popupControl.closePopup();
            
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
                    vNext.closePopup();
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
        let vRight = Math.min(this.width_, this._getViewPortWidth());
        let vBottom = Math.min(this.height_, this._getViewPortHeight());

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
        let vPopupControl = this._mouseMovePopupControl;
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
        this._capturePopupControl = this._mouseMovePopupControl;
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

    _waitListResponsive(e) {
        return (this._waitList.count > 0) && (this._waitList.rect.pointInAt(e.x, e.y));
    }

    _waitListMouseDown(e) {
        return this._waitListResponsive(e);
    }

    _waitListMouseMove(e) {
        if (this._waitListResponsive(e)) {
            this._cursor = TCursors.Arrow;
            this._hclH5Canvas.style.cursor = theme.getCSSCursor(this._cursor);
            return true;
        }

        return false;
    }

    _waitListMouseUp(e) {
        if (this._waitListResponsive(e)) {
            this._waitList.delete(this._waitList.count - 1);
            this.update();
            return true;
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

        let vPopupControl = this._mouseMovePopupControl;
        if (vPopupControl !== null) {
            e.x -= vPopupControl.left;
            e.y -= vPopupControl.top;
            vPopupControl.mouseUp(e);
            return true;
        }

        return false;
    }

    _popupKeyDown(e) {
        if (this._focusLayer == this._popupLayer) {
            if (this._caret.control != null)
                this._caret.control.keyDown(e);

            return true;
        } else
            return false;
    }

    _popupKeyPress(e) {
        if (this._focusLayer == this._popupLayer) {
            if (this._caret.control != null)
                this._caret.control.keyPress(e);

            return true;
        } else
            return false;
    }

    _getPopupControlAtPos(x, y) {
        let vPopupControl = this._getPopupControlAt(x, y);
        if (vPopupControl !== null)
            return vPopupControl.getControlAtPos(x - vPopupControl.left, y - vPopupControl.top);

        return null;
    }


    //window.onkeydown = (e) =>
    windowKeyDown_(e) {
        //if (e.target === ime._input)  // 非输入型控件为什么不能接收按键
        if (this._focus)
            this._keyDown(e);
        //else
        //    e.preventDefault();
    }

    //window.onkeypress = (e) =>
    windowKeyPress_(e) {
        //if (e.target === ime._input)
        if (this._focus)
            this._keyPress(e);
        //else
        //    e.preventDefault();
    }

    //window.onkeyup = (e) =>
    windowKeyUp_(e) {
        //if (e.target === ime._input)  // 为什么要这样呢，导致快捷键比如shift + tab弹起时不能取消shift
        if (this._focus)
            this._keyUp(e);
        //else
        //    e.preventDefault();
    }

    //window.onresize = (e) =>
    windowResize_(e) {
        this._resize();
        //e.preventDefault();
    }

    //window.onfocus = (e) =>
    windowFocus_(e) {
        this._clearKeyState();
    }

    _initBindEvent() {
        if (!this._parentElement)
            return;
        
        window.removeEventListener("keydown", windowKeyDown);
        window.addEventListener("keydown", windowKeyDown, false);  // 冒泡事件 true：捕获事件

        window.removeEventListener("keypress", windowKeyPress, false);
        window.addEventListener("keypress", windowKeyPress, false);

        window.removeEventListener("keyup", windowKeyUp);
        window.addEventListener("keyup", windowKeyUp, false);

        window.removeEventListener("resize", windowResize);
        window.addEventListener("resize", windowResize, false);

        window.removeEventListener("focus", windowFocus);
        window.addEventListener("focus", windowFocus, false);

        if (this._parentElement === document.body)
            document.body.parentNode.style.overflowY = "hidden";

        this._parentElement.oncontextmenu = function(e) {
            e.returnValue = false;
        }

        ime._hclLoaded_(this);
    }

    //window.onmousedown = (e) =>
    windowMouseDown_(e) {
        if (e.target != this._hclH5Canvas) {
            this._focus = false;
            application.killFocusControl_();
            if (this._idleInterval.enabled) {
                this._idleInterval.enabled = false;
                this._cancelIdle();
            }
        } else {
            this._focus = true;
            if (!this._idleInterval.enabled)
                this._idleInterval.enabled = true;
        }
    }

    //window.onmousemove = (e) =>
    windowMouseMove_(e) {
        if (e.target != this._hclH5Canvas) {
            this._mouseIn = false;
            this._cancelIdle();
        } else
            this._mouseIn = true;
    }

    //window.onload =  (e) =>
    windowLoad_(e) {
        this._loaded = true;
        e.preventDefault();
    }

    //window.document.onvisibilitychange = (e) => 
    windowDocVisibilitychange_(e) {
        if (window.document.hidden)
            this._deactivate();
        else
            this._activate();

        e.preventDefault();
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

        window.removeEventListener("mousedown", windowMouseDown);
        window.addEventListener("mousedown", windowMouseDown, false);

        window.removeEventListener("mousemove", windowMouseMove);
        window.addEventListener("mousemove", windowMouseMove, false);

        window.removeEventListener("load", windowLoad);
        window.addEventListener("load", windowLoad, false);

        window.document.removeEventListener("visibilitychange", windowDocVisibilitychange);
        window.document.addEventListener("visibilitychange", windowDocVisibilitychange, false);

        this._initBindEvent();
    }

    _windowToCanvas(h5canvas, x, y) {
        let rect = h5canvas.getBoundingClientRect();
        return {
            x: (x - rect.left) * (h5canvas.width / rect.width) / this._scale,
            y: (y - rect.top) * (h5canvas.height / rect.height) / this._scale
        }
    }

    _getAdjustLeft() {
        let vLeft = (this._getViewPortWidth() - this.width_) / 2;
        if (this._loaded && (vLeft < this._parentElement.clientLeft))
            vLeft = this._parentElement.clientLeft;

        return 0;
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

    applicationRun() {
        this._resize();
    }
    
    _resize() {
        if (!this._parentElement)
            return;
            
        this.beginUpdate();
        try {
            if (this._autoWidth) {
                this.left_ = 0;
                this.width_ = this._getViewPortWidth();
            } else if (this._horizontalCenter)
                this.left_ = this._getAdjustLeft();

            if (this._autoHeight)
                this.height_ = this._getViewPortHeight();

            if (this._hclH5Canvas.style.left != this.left_ + "px")
                this._hclH5Canvas.style.left = this.left_ + "px";

            THCCanvas._setViewSize_(this.width_, this.height_);

            // to do:判断import是否都加载完成后再修改size可保持页面上的等待提示信息
            this._hclH5Canvas.width = this.width_;
            this._hclH5Canvas.height = this.height_;
            this._hclCanvas.prepareConext(this._scale);

            this._appH5Canvas.width = this.width_;
            this._appH5Canvas.height = this.height_;
            this._appCanvas.prepareConext(this._scale);

            this._popupH5Canvas.width = this.width_;
            this._popupH5Canvas.height = this.height_;
            this._popupCanvas.prepareConext(this._scale);

            if (application != null)
                application._resize_();
        }
        finally {
            this.endUpdate();
        }
    }

    _paintWaitList() {
        if (this._waitList.count > 0) {
            this._hclCanvas.font.name = "宋体";
            this._hclCanvas.font.size = 12;
            this._hclCanvas.font.color = "white";
            this._hclCanvas.brush.color = "black";
            let vAlpha = this._hclCanvas.alpha;
            this._hclCanvas.alpha = 0.6;
            this._hclCanvas.fillRect(this._waitList.rect);
            this._hclCanvas.alpha = vAlpha;
            this._hclCanvas.textOut(2, 2, "[" + this._waitList.count.toString() + "] " + this._waitList.last.text);
        }
    }

    _paintApplicationLayer(rect) {
        this._appCanvas.save();
        try {
            this._appCanvas.clearRect(rect); 
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

    _paintHintLayer() {
        if (this._hoverHintInfo.visible)
            theme.drawHoverHint(this._hclCanvas, this._hoverHintInfo);
    }

    _paint(rect) {
        if (application != null && application.runing) {
            this._hclCanvas.save();
            try {
                // 清除以前的图像，防止反走样重复绘制时锯齿叠加
                this._hclCanvas.clearRect(rect);  // 如果不清除，同一位置菜单多次绘制时阴影叠加导致加深
                // this._hclCanvas.brush.color = "White";
                // this._hclCanvas.fillRect(rect);
                /*
                this._hclCanvas.h5context.scale(4, 4);
                this._hclCanvas.h5context.font = "14pt 宋体";
                this._hclCanvas.h5context.fillStyle = "Black";
                this._hclCanvas.h5context.fillText("你好",1,10);
                */

                rect.right *= this._scale;
                rect.bottom *= this._scale;
                this._hclCanvas.clipRect(rect);
                this._paintApplicationLayer(rect);
                this._paintPopupLayer(rect);

                if (this._caret.visible && this._caret.shan && rect.isIntersect(this._caret.rect))
                    this._paintCaretShan();

                this._paintHintLayer();
                this._paintWaitList();
            } finally {
                this._hclCanvas.restore();
            }
        } else
            this._paintWaitList();
    }

    _deactivate() {
        //application.deactivate();
        this._cursorControl = null;
    }

    _activate() {   
        //application.activate();
        this.update();
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

        if (e.buttons == 0) {
            if (e.button == 1)
                vMouseArgs.button = TMouseButton.Left;
            else if (e.button == 4)
                vMouseArgs.button = TMouseButton.Middle;
            else if (e.button == 2)
                vMouseArgs.button = TMouseButton.Right;
        } else if (e.buttons == 1)
            vMouseArgs.button = TMouseButton.Left;
        else if (e.buttons == 4)
            vMouseArgs.button = TMouseButton.Middle;
        else if (e.buttons == 2)
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
        this._cancelIdle();
        let vMouseArgs = this._makeMouseEventArgs(e);        
        if (!this._popupMouseWheel(vMouseArgs))
            application.mouseWheel(vMouseArgs);
    }

    _mouseDown(e) {
        this._cancelIdle();

        if (this._waitListMouseDown(e))
            return;

        if (this._popupMouseDown(e))
            this._captureLayer = this._popupLayer;
        else {
            application.mouseDown(e);
            this._captureLayer = this._applicationLayer;
        }
    }

    _mouseMove(e) {
        this._cancelIdle();
        this._cursorPos.reset(e.x, e.y);

        if (this._waitListMouseMove(e))
            return;

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
            this._setCursorBy_(this._mouseMovePopupControl);  // this._getPopupControlAt(e.x, e.y));
        }
    }

    _mouseUp(e) {
        if (this._waitListMouseUp(e))
            return;

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

    _clearKeyState() {
        for (let i = 0, len = this.keyDownStates.length; i < len; i++)
            this.keyDownStates[i] = false;
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
        this._cancelIdle();
        if (this._isPreventKeyDown(e.keyCode))
            e.preventDefault();
        let vKeyEvent = this._makeKeyEventArgs(e);
        this._setKeyState(e.keyCode, e.code, true);

        if (!this._popupKeyDown(vKeyEvent))
            application.keyDown(vKeyEvent);
    }

    _keyPress(e) {
        this._cancelIdle();
        let vKeyEvent = this._makeKeyEventArgs(e);
        //this._setKeyState(e.keyCode, e.code, false);
        if (!this._popupKeyPress(vKeyEvent))
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
        //this.updateRect(TRect.CreateByBounds(0, 0, this.width_, this.height_)); 万一_updateCount不为0，多Create了
        if (this._updateCount > 0)
            return;

        this._paint(TRect.CreateByBounds(0, 0, this.width_, this.height_));
    }

    updateRect(rect) {
        if (this._updateCount > 0)
            return;

        this._paint(rect.inFlate(theme.shadow, theme.shadow, true));
    }

    showMessage(text) {
        let vMsgDialog = new TMessageDialog("提示", text);
        vMsgDialog.showModal();
    }

    messageDlg(text, msgType, msgBtns, callBack) {
        let vMsgDialog = new TMessageDialog("提示", text, msgBtns, msgType);
        vMsgDialog.showModal(callBack);
    }

    waitMessage(text, fun) {
        let vWaitInfo = new TWaitInfo(text);
        this._waitList.add(vWaitInfo);
        setTimeout(fun, 0);
        return vWaitInfo;
        // 低版本使用上面的写法
        // TTheard.executeWait(fun, () => {
        //         this.endWaitMessage(vWaitInfo);
        //     }
        // );
        // async function waite(finishFun) {
        //     await fun();
        //     finishFun();
        // }

        // waite(() => {this.endWaitMessage(vWaitInfo);});
    }

    endWaitMessage(waitInfo) {
        this._waitList.remove(waitInfo);
    }

    broadcast(message, wParam = 0, lParam = 0) {
        application.broadcast(message, wParam, lParam);
    }

    get parentElement() {
        return this._parentElement;
    }

    set parentElement(val) {
        if (val && (this._parentElement != val)) {
            this._parentElement = val;
            val.appendChild(this._hclH5Canvas);  // 会调用removeChild从原元素中移除
            this._resize();
            this._initBindEvent();
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

    get design() {
        return this.design_;
    }

    set design(val) {
        if (this.design_ != val) {
            this.design_ = val;
            this.broadcast(TMessage.Design, val);
            this.update();
        }
    }

    get left() {
        return this.left_;
    }

    get top() {
        return this.top_;
    }

    get width() {
        return this.width_;
    }

    get height() {
        return this.height_;
    }

    get cursorPos() {
        return this._cursorPos;
    }

    get cursor() {
        return this._cursor;
    }

    get homePath() {
        return theme.path;
    }

    set homePath(val) {
        theme.path = val;
    }

    onCatch(err) { }
}

function windowMouseDown(e) { hcl.windowMouseDown_(e); }
function windowMouseMove(e) { hcl.windowMouseMove_(e); }
function windowLoad(e) { hcl.windowLoad_(e); }
function windowDocVisibilitychange(e) { hcl.windowDocVisibilitychange_(e); }
function windowKeyDown(e) { hcl.windowKeyDown_(e); }
function windowKeyPress(e) { hcl.windowKeyPress_(e); }
function windowKeyUp(e) { hcl.windowKeyUp_(e); }
function windowResize(e) { hcl.windowResize_(e); }
function windowFocus(e) { hcl.windowFocus_(e); }

export var hcl = new THCL();