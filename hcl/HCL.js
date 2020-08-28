/*=======================================================

    Html Component Library 前端UI框架 V0.1
    框架环境单元 2019-11-26
    作者：荆通(18114532@qq.com)
    QQ群：649023932
    此代码仅做学习交流使用，商业使用请联系作者获取授权
    
=======================================================*/

import { TCaret, TCursors, TKey, TKeyEventArgs, TMouseButton, TMouseEventArgs, TPopupWinControl, TShiftState, TMessage } from "./Controls.js";
import { THintInfo, TInterval } from "./ExtCtrls.js";
import { TMessageDialog } from "./Forms.js";
import { THCCanvas } from "./Graphics.js";
import { TList, TObject, TPoint, TRect, TSystem } from "./System.js";
import { TTheme } from "./theme.js";
import { TIme } from "./Ime.js";
import { TClipboard, TLocalStorage } from "./Clipboard.js";
import { TApplication } from "./Application.js";

export let TBorwerType = {
    Chrome: 1,
    Firefox: 2,
    Safari: 3,
    Opera: 4,
    IE: 5

}

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

export class THCL extends TObject {
    constructor() {
        super();

        this.debug = false;
        this.brower = this.__GetBrowerType();
        this.system = new TSystem();
        this.ime = new TIme();
        this.clipboard = new TClipboard();
        this.localStorage = new TLocalStorage();
        this.theme = new TTheme();
        this.theme.onImageLoad = () => { this.update(); }

        this._curApplication = null;
        this._updateCount = 0;
        this._handleSeq = 1000;
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

        // 绑定页面事件
        this.__windowKeyDown = (e) => { this.windowKeyDown_(e) }
        this.__windowKeyPress = (e) => { this.windowKeyPress_(e); }
        this.__windowKeyUp = (e) => { this.windowKeyUp_(e); }
        this.__windowResize = (e) => { this.windowResize_(e); }
        this.__windowFocus = (e) => { this.windowFocus_(e); }

        this.__windowMouseMove = (e) => { this.windowMouseMove_(e); }
        this.__windowMouseDown = (e) => { this.windowMouseDown_(e); }
        this.__windowMouseWheel = (e) => { if (e.target === this._hclH5Canvas) this._mouseWheel(e); }

        this.__windowLoad = (e) => { this.windowLoad_(e); }
        this.__windowDocVisibilitychange = (e) => { this.windowDocVisibilitychange_(e); }

        this._hoverHintInfo = new THintInfo();

        this._scale = 1;

        // 各canvas在parentElement事件中创建
        this._hclH5Canvas = null;
        this._hclCanvas = null;
        this._appH5Canvas = null;
        this._appCanvas = null;
        this._popupH5Canvas = null;
        this._popupCanvas = null;

        this.parentElement = null;
    }

    static createInstance() {
        if (!hclIinstance)
            hclIinstance = new THCL();
    }

    static disposeInstance() {
        if (hclIinstance) {
            hclIinstance.dispose();
            hclIinstance = null;
        }
    }

    __GetBrowerType() {
        let vExplorer = window.navigator.userAgent;
        //console.log(vExplorer);
        //if (vExplorer.indexOf("MSIE") >= 0)  // 这样的判断不支持 IE11
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            if (CanvasRenderingContext2D.prototype.ellipse == undefined) {  // Canvas兼容 IE11
                CanvasRenderingContext2D.prototype.ellipse = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, antiClockwise) {
                    this.save();
                    this.translate(x, y);
                    this.rotate(rotation ? rotation : 0);
                    this.scale(radiusX, radiusY);
                    this.arc(0, 0, 1,
                        startAngle ? startAngle : 0,
                        endAngle ? endAngle : Math.PI,
                        antiClockwise ? antiClockwise : true);
                
                    this.restore();
                }
            }

            return TBorwerType.IE;
        } else if (vExplorer.indexOf("Firefox") >= 0)
            return TBorwerType.FireFox;
        else if(vExplorer.indexOf("Chrome") >= 0)
            return TBorwerType.Chrome;
        else if(vExplorer.indexOf("Opera") >= 0)
            return TBorwerType.Opera;
        else if(vExplorer.indexOf("Safari") >= 0)
            return TBorwerType.Safari;
    }

    //#region 光标
    __createCaret(control, image, width, height) {
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
        if (this._hoverHintInfo.rect.bottom + this._hoverHintInfo.rect.height + vPt.y + this.theme.marginSpace > this.height_)
            this._hoverHintInfo.rect.offset(vPt.x, vPt.y - this._hoverHintInfo.rect.height - this.theme.marginSpace);
        else
            this._hoverHintInfo.rect.offset(vPt.x, vPt.y + this._hoverHintInfo.rect.height + this.theme.marginSpace);

        this._hoverHintInfo.text = control.hint;
        this._hoverHintInfo.rect.resetSize(this.theme.getHoverHintSize(control.hint));

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
                this._hclH5Canvas.style.cursor = this.theme.getCSSCursor(this._cursor);
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
        this.ime.removeControl(control);
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
                if (popupControl.left + popupControl.width + this.theme.shadow > vRight)
                    popupControl.left = vRight - popupControl.width - this.theme.shadow;

                if (popupControl.top + popupControl.height + this.theme.shadow > vBottom)
                    popupControl.top = vBottom - popupControl.height - this.theme.shadow;
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
                if (popupControl.left + popupControl.width + this.theme.shadow > vRight)
                   popupControl.left = popupControl.forward.left - popupControl.width;

                if (popupControl.top + popupControl.height + this.theme.shadow > vBottom)
                    popupControl.top = vBottom - popupControl.height - this.theme.shadow;
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
            return this.application.getControlAtPos(x, y);
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
            this._hclH5Canvas.style.cursor = this.theme.getCSSCursor(this._cursor);
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
            this._mouseMovePopupControl = null;  // 防止不动位置继续左键按下取到movepopup又触发上次事件
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
        this.resize();
        //e.preventDefault();
    }

    //window.onfocus = (e) =>
    windowFocus_(e) {
        this._clearKeyState();
    }

    _removeBindEvent() {
        window.removeEventListener("keydown", this.__windowKeyDown);
        window.removeEventListener("keypress", this.__windowKeyPress, false);
        window.removeEventListener("keyup", this.__windowKeyUp);
        window.removeEventListener("resize", this.__windowResize);
        window.removeEventListener("focus", this.__windowFocus);
        window.removeEventListener("mousedown", this.__windowMouseDown);
        window.removeEventListener("mousemove", this.__windowMouseMove);
        window.removeEventListener("load", this.__windowLoad);
        //window.removeEventListener("focus")
        //window.removeEventListener("blur")
        window.document.removeEventListener("visibilitychange", this.__windowDocVisibilitychange);
        if (this.brower == TBorwerType.Firefox)
            window.removeEventListener("DOMMouseScroll", this.__windowMouseWheel);
    }

    _initBindEvent() {
        this._removeBindEvent();  // 先移除了

        window.addEventListener("keydown", this.__windowKeyDown, false);  // 冒泡事件 true：捕获事件
        window.addEventListener("keypress", this.__windowKeyPress, false);
        window.addEventListener("keyup", this.__windowKeyUp, false);
        window.addEventListener("resize", this.__windowResize, false);
        window.addEventListener("focus", this.__windowFocus, false);
        //windowMouseDown(e) { this.windowMouseDown_(e); }  // 如果封装成方法，由window触发时这里的this是window，并不是hcl
        window.addEventListener("mousedown", this.__windowMouseDown, false);
        window.addEventListener("mousemove", this.__windowMouseMove, false);
        window.addEventListener("load", this.__windowLoad, false);
        window.document.addEventListener("visibilitychange", this.__windowDocVisibilitychange, false);

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

        if (this.brower == TBorwerType.Firefox)
            window.addEventListener("DOMMouseScroll", this.__windowMouseWheel, false); 
        else
            this._hclH5Canvas.onmousewheel = (e) => { this._mouseWheel(e); }

        this._hclH5Canvas.onmouseleave = (e) => {
            this._mouseLeave(this._makeMouseEventArgs(e));
            //e.preventDefault();
        }

        this._hclH5Canvas.ondblclick = (e) => {
            this._dblClick(this._makeMouseEventArgs(e));
        }                

        if (this._parentElement === document.body)
            document.body.parentNode.style.overflowY = "hidden";

        this._parentElement.oncontextmenu = function(e) {
            e.returnValue = false;  // 屏蔽容器的右键菜单，还没有适配fireFox
        }

        this.ime.__hclLoaded(this);
    }

    //window.onmousedown = (e) =>
    windowMouseDown_(e) {
        if (e.target != this._hclH5Canvas) {
            this._focus = false;
            this.application.killFocusControl_();
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
        if (window.document.hidden)  // 页面在后台标签页中或者浏览器最小化
            this._deactivate();
        else
            this._activate();

        e.preventDefault();
    }

    dispose() {
        this._removeBindEvent();

        if (this._parentElement != null) {
            this.ime.__hclUnLoaded(this);
            this._parentElement.removeChild(this._hclH5Canvas);
        }

        this.ime = null;
        this.system = null;
        this.clipboard = null;
        this.localStorage.clear();
        this.localStorage = null;
        this.theme = null;
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
        if (!this._parentElement)
            this.parentElement = document.body;

        this.resize();
    }
    
    resize() {
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

            if (this.application != null)
                this.application._resize_();
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
            this.application.paint(this._appCanvas);
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
            this.theme.drawHoverHint(this._hclCanvas, this._hoverHintInfo);
    }

    _paint(rect) {
        if (this.application != null && this.application.runing) {
            this._hclCanvas.save();
            try {
                if (this.brower == TBorwerType.Safari)
                    rect.reset(0, 0, this.width_, this.height_);

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
        //this.application.deactivate();
        this._cursorControl = null;
    }

    _activate() {   
        //this.application.activate();
        this.update();
    }

    _makeMouseEventArgs(e) {
        let vPoint = this._windowToCanvas(this._hclH5Canvas, e.clientX, e.clientY);
        let vMouseArgs = new TMouseEventArgs();
        if (e.ctrlKey)
            vMouseArgs.shiftState.add(TShiftState.Ctrl);

        if (e.altKey)
            vMouseArgs.shiftState.add(TShiftState.Alt);

        if (e.shiftKey)
            vMouseArgs.shiftState.add(TShiftState.Shift);

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
        if (e.wheelDelta)  // IE/Opera/Chrome 
            vMouseArgs.delta = e.wheelDelta;
        else
            vMouseArgs.delta = -e.detail * 40;  // Firefox 

        vMouseArgs.clicks = e.detail;
        return vMouseArgs;
    }

    _mouseEnter(e) {
        let vMouseArgs = this._makeMouseEventArgs(e);
        this.application.mouseEnter(vMouseArgs);
    }

    _mouseLeave(e) {
        let vMouseArgs = this._makeMouseEventArgs(e);
        this.application.mouseLeave(vMouseArgs);
    }

    _mouseWheel(e) {
        this._cancelIdle();
        let vMouseArgs = this._makeMouseEventArgs(e);        
        if (!this._popupMouseWheel(vMouseArgs))
            this.application.mouseWheel(vMouseArgs);
    }

    _mouseDown(e) {
        this._cancelIdle();

        if (this._waitListMouseDown(e))
            return;

        if (this._popupMouseDown(e))
            this._captureLayer = this._popupLayer;
        else {
            this.application.mouseDown(e);
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
                this.application.mouseEnter(e);
            }

            this.application.mouseMove(e);
        } else if (this._mouseMoveLayer != this._popupLayer) {
            this._mouseMoveLayer = this._popupLayer;
            this.application.mouseLeave(e);
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
                this.application.mouseUp(e);
        } finally {
            this._captureLayer = null;
        }
    }

    _dblClick(e) {
        this.application.dblClick(e);
    }

    _makeKeyEventArgs(e) {
        let vKeyArgs = new TKeyEventArgs();
        if (e.ctrlKey)
            vKeyArgs.shiftState.add(TShiftState.Ctrl);

        if (e.altKey)
            vKeyArgs.shiftState.add(TShiftState.Alt);

        if (e.shiftKey)
            vKeyArgs.shiftState.add(TShiftState.Shift);

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

        this.ime.__innerPasted = true;
        if (e.target === this.ime._input 
            && (this.keyDownStates[TKey.ControlKey]
            && this.keyDownStates[TKey.ShiftKey]
            && e.keyCode == TKey.V)
            )  // ctrl+shift+v粘贴外部复制的内容
        {
            //e.preventDefault;
            this.ime.__innerPasted = false;
        } else if (!this._popupKeyDown(vKeyEvent))
            this.application.keyDown(vKeyEvent);
    }

    _keyPress(e) {
        this._cancelIdle();
        let vKeyEvent = this._makeKeyEventArgs(e);
        //this._setKeyState(e.keyCode, e.code, false);
        if (e.target === this.ime._input)
            return;
            
        if (!this._popupKeyPress(vKeyEvent))
        this.application.keyPress(vKeyEvent);
    }

    _keyUp(e) {
        let vKeyEvent = this._makeKeyEventArgs(e);
        this._setKeyState(e.keyCode, e.code, false);
        this.application.keyUp(vKeyEvent);
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

        if (this.brower == TBorwerType.IE)
            this._paint(rect);  // IE11 上绘制不能小于0的坐标所以不inFlate
        else
            this._paint(rect.inFlate(this.theme.shadow, this.theme.shadow, true));
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
        this.application.broadcast(message, wParam, lParam);
    }

    exception(msg) {
        throw "HCL异常:" + msg;
    }

    log(msg) {
        console.log(msg);
    }

    returnFalseLog(msg) {
        console.log(msg);
        return false;
    }

    returnTrueLog(msg) {
        console.log(msg);
        return true;
    }

    debugLog(msg) {
        if (this.debug)
            console.log("hcl_debug：" + msg);
    }

    get parentElement() {
        return this._parentElement;
    }

    set parentElement(val) {
        if (val && (this._parentElement != val)) {
            this._parentElement = val;
            this._hclH5Canvas = document.createElement("canvas");
            this._hclH5Canvas.setAttribute("id", "hclH5canvas_" + this.system.Timestamp);
            this._hclH5Canvas.innerText = "您的浏览器不支持canvas, 无法使用HC编辑器控件！";
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
            
            val.appendChild(this._hclH5Canvas);  // 会调用removeChild从原元素中移除
            this.resize();
            this._initBindEvent();
        }
    }

    get autoWidth() {
        return this._autoWidth;
    }

    set autoWidth(val) {
        if (this._autoWidth != val) {
            this._autoWidth = val;
            this.resize();
        }
    }

    get autoHeight() {
        return this._autoHeight;
    }

    set autoHeight(val) {
        if (this._autoHeight != val) {
            this._autoHeight = val;
            this.resize();
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
        return this.theme.path;
    }

    set homePath(val) {
        this.theme.path = val;
    }

    get application() {
        if (!this._curApplication)
            this._curApplication = new TApplication();

        return this._curApplication;
    }

    onCatch(err) { }
}

let hclIinstance = new THCL();
export { hclIinstance as hcl }
//export let hcl = new THCL();