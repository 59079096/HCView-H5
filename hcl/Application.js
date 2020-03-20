import { theme, TModalResult, TMouseEventArgs } from "./Controls.js";
import { TCustomForm, TForm, TFormShowState } from "./Forms.js";
import { hcl } from "./Kernel.js";
import { system, TList, TObject, TPoint, TRect } from "./System.js";

class TApplication extends TObject {
    constructor() {
        super();

        this._updateCount = 0;
        this._runing = false;
        this.icon = new Image(16, 16);
        this.forms = new TList(false);
        this._activeForm = null;  // keybord相关操作时需要
        this._captureControl = null;
        this._mouseMoveForm = null;

        this.title = "HCL Application";
        this.mainForm = this.createMainForm();
        this.mainForm.captionBar.controls.clear();
    }

    _getActiveForm() {
        for (let i = this.forms.count - 1; i >= 0; i--) {
            if (this.forms[i].visible)
                return this.forms[i];
        }

        return null;
    }

    _showForm(form) {
        this.beginUpdate();
        try {
            if (this._activeForm != null)
                this._activeForm.deactivate();

            this._activeForm = form;
            form.activate();
        } finally {
            this.endUpdate();
        }
    }

    _hideForm(form) {  // eslint-disable-line
        this.beginUpdate();
        try {
            if (this._activeForm != null)
                this._activeForm.deactivate();

            this._activeForm = this._getActiveForm();
            if (this._activeForm != null)
                this._activeForm.activate();
        } finally {
            this.endUpdate();
        }
    }

    _resize_() {
        this.mainForm.width = hcl.width;
        this.mainForm.height = hcl.height;
    }

    setFocusControl_(control, accept) { }  // eslint-disable-line

    killFocusControl_(control) {
        hcl._killFocusControl_(this, control);
    }     

    controlVisible_(control, val) {
        if (val)
            this._showForm(control);
        else
            this._hideForm(control);
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

    addControl(control) {
        this.addForm(control);
    }

    addForm(form) {
        if (!form.isClass(TCustomForm)) {
            system.exception("application只能添加TCustomForm的子类！");
            return;
        }

        this.forms.add(form);
        form.added_(this);
    }

    removeControl(control) {
        this.beginUpdate();
        try {
            this.forms.remove(control);
            control.removed_();
            this._activeForm = this._getActiveForm();
            if (this._activeForm != null)
                this._activeForm.activate();
        } finally {
            this.endUpdate();
        }
    }

    getFormAt(x, y) {
        let vForm = null;
        for (let i = this.forms.count - 1; i >= 0; i--) {
            vForm = this.forms[i];
            if (vForm.visible && (vForm.bounds().pointInAt(x, y)))
                return vForm;
        }

        return null;
    }

    getControlAtPos(x, y, enabled = true) {
        let vForm = this.getFormAt(x, y);
        if (vForm != null) {
            x -= vForm.left;
            y -= vForm.top;
            return vForm.getControlAtPos(x, y, enabled);
        }

        return null;
    }
    
    removeForm(form) {
        this.removeControl(form);
    }

    setCapture(control) {
        this._captureControl = control;
    }

    releaseCapture() {
        this._captureControl = null;
    }

    createMainForm() {
        if (this.mainForm == null) {
            this.mainForm = new TForm(hcl.width, hcl.height);
            this.mainForm.captionBar.captureParent = false;
            this.addForm(this.mainForm);
        }

        return this.mainForm;
    }

    clientToScreen(point) {
        return point;
    }

    mouseWheel(e) {
        this._activeForm = this._mouseMoveForm;
        let vMouseArgs = new TMouseEventArgs();
        vMouseArgs.assign(e);
        vMouseArgs.x -= this._mouseMoveForm.left;
        vMouseArgs.y -= this._mouseMoveForm.top;
        this._mouseMoveForm.mouseWheel(vMouseArgs);        
    }

    mouseDown(e) {
        this._activeForm = this._mouseMoveForm;
        let vMouseArgs = new TMouseEventArgs();
        vMouseArgs.assign(e);
        vMouseArgs.x -= this._mouseMoveForm.left;
        vMouseArgs.y -= this._mouseMoveForm.top;
        this._mouseMoveForm.mouseDown(vMouseArgs);
    }

    // region mousemove
    doMouseMoveFromChange(control) {
        if (this._mouseMoveForm !== control) {
            if (this._mouseMoveForm !== null)
                this._mouseMoveForm.mouseLeave();

            this._mouseMoveForm = control;
            if (this._mouseMoveForm !== null)
                this._mouseMoveForm.mouseEnter();
        }
    }

    doFormMouseMove(e) {
        let vForm = null;
        for (let i = this.forms.count - 1; i >= 0; i--) {
            vForm = this.forms[i];
            if (vForm.visible) {
                if (vForm.modalResult == TModalResult.mrShowModel) {
                    this.doMouseMoveFromChange(vForm);
                    e.x -= vForm.left;
                    e.y -= vForm.top;
                    vForm.mouseMove(e);
                    return;
                }

                if (vForm.bounds().pointInAt(e.x, e.y)) {
                    this.doMouseMoveFromChange(vForm);
                    e.x -= vForm.left;
                    e.y -= vForm.top;
                    vForm.mouseMove(e);
                    return;
                }
            }
        }
    }

    doCaptureMouseMove(e) {
        this.doMouseMoveFromChange(this._captureControl);
        let vPoint = this._captureControl.clientToScreen(TPoint.Create(0, 0));
        e.x -= vPoint.x;
        e.y -= vPoint.y;
        this._captureControl.mouseMove(e);
    }

    mouseMove(e) {
        if (this._captureControl != null)
            this.doCaptureMouseMove(e);
        else
            this.doFormMouseMove(e);
    }
    // endregion mousemove

    // region mouseup
    doCaptureMouseUp(e) {
        let vPoint = this._captureControl.clientToScreen(TPoint.Create(0, 0));
        e.x -= vPoint.x;
        e.y -= vPoint.y;
        this._captureControl.mouseUp(e);
    }

    doMouseUp(e) {
        if (this._activeForm != null) {
            e.x -= this._activeForm.left;
            e.y -= this._activeForm.top;
            this._activeForm.mouseUp(e);
            return;
        }

        e.x -= this._mouseMoveForm.left;
        e.y -= this._mouseMoveForm.top;
        this._mouseMoveForm.mouseUp(e);
    }

    mouseUp(e) {
        if (this._captureControl != null)
            this.doCaptureMouseUp(e);
        else
            this.doMouseUp(e);
    }
    // endregion mouseup

    mouseEnter(e) {  // eslint-disable-line
        if (this._activeForm != null)
            this._activeForm.mouseEnter();
    }

    mouseLeave(e) {  // eslint-disable-line
        if (this._activeForm != null)
            this._activeForm.mouseLeave();
    }

    dblClick(e) {
        if (this._activeForm != null) {
            let vMouseArgs = new TMouseEventArgs();
            vMouseArgs.assign(e);
            vMouseArgs.x -= this._activeForm.left;
            vMouseArgs.y -= this._activeForm.top;
            this._activeForm.dblClick(vMouseArgs);
        }
    }

    keyDown(e) {
        if (this._activeForm != null)
            this._activeForm.keyDown(e);
        else
            this.mainForm.keyDown(e);
    }

    keyPress(e) {
        if (this._activeForm != null)
            this._activeForm.keyPress(e);
        else
            this.mainForm.keyPress(e);
    }

    keyUp(e) {
        if (this._activeForm != null)
            this._activeForm.keyUp(e);
        else
            this.mainForm.keyUp(e);
    }

    update() {
        this.updateRect(TRect.CreateByBounds(0, 0, hcl.width, hcl.height));
    }

    updateRect(rect) {
        if (this._updateCount > 0)
            return;

        hcl.updateRect(rect);
    }

    createCaret(control, image, width, height) {
        hcl._createCaret_(control, image, width, height);
    }

    setCaretPos(x, y) {
        hcl._setCaretPos_(x, y);
    }

    setCursorBy(control) {
        hcl._setCursorBy_(control);
    }

    showCaret(control) {
        hcl._showCaret_(control);
    }

    hideCaret(control) {
        hcl._hideCaret_(control);
    }

    destroyCaret(control) {
        hcl._destroyCaret_(control);
    }

    trackPopupControl(popupControl, root) {
        hcl._trackPopupControl_(popupControl, root);
    }

    closePopupControl(popupControl) {
        hcl._closePopupControl_(popupControl);
    }

    paint(hclCanvas) {
        if (this.forms.count === 0)
            return;

        if (this._updateCount > 0)
            return;

        let vForm = null;
        for (let i = 0; i < this.forms.count; i++) {
            vForm = this.forms[i];
            if (vForm.showState < TFormShowState.fssShow)
                continue;
            
            hclCanvas.save();
            try {
                hclCanvas.translate(vForm.left, vForm.top);
                //hclCanvas.clip(0, 0, form.width, form.height);
                hclCanvas.clip(-theme.shadow, -theme.shadow, vForm.width + theme.shadow * 2, vForm.height + theme.shadow * 2);
                vForm.paint(hclCanvas);
            } finally {
                hclCanvas.restore();
            }
        }
    }

    run() {
        this._runing = true;
        this.mainForm.show();
    }

    get runing() {
        return this._runing;
    }
}

export var application = new TApplication();