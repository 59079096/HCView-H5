/*=======================================================

    Html Component Library 前端UI框架 V0.1
    窗体单元
    作者：荆通(18114532@qq.com)
    QQ群：649023932

=======================================================*/

import { application } from "./Application.js";
import { TAlign, TCustomControl } from "./Controls.js";
import { THCCanvas } from "./Graphics.js";
import { hcl } from "./HCL.js";
import { TButton, TCaptionBar, TEdit, TLable, TPanel } from "./StdCtrls.js";
import { theme } from "./theme.js";
import { system } from "./System.js";

export var TFormShowState = {
    Close: 0,
    Hide: 1,
    Show: 2,
    ShowNoActive: 3,
    ShowModel: 4,
}

export var TModalResult = {
    Close: 0,
    Ok: 1,
    Cancel: 2
}

export class TCustomForm extends TCustomControl {
    constructor(width, height) {
        super();

        this._modalOkEvent = null;
        this.visible_ = false;
        this.width_ = width;
        this.height_ = height;
        this.closeFree = true;
        this.showState = TFormShowState.Close;
        this.modalResult = TModalResult.Close;
    }

    doSetBounds_() {
        // the parent don't need reAlign()
        if (this.parent != null && this.parent.isClass(TCustomControl))
            super.doSetBounds_();
    }

    doPaintBorder_(hclCanvas) {
        hclCanvas.brush.color = "#909090";
        if (this.paddingLeft > 0) 
            hclCanvas.fillBounds(0, 0, this.paddingLeft, this.height);

        if (this.paddingTop)
            hclCanvas.fillBounds(0, 0, this.width, this.paddingTop);

        if (this.paddingRight > 0)
            hclCanvas.fillBounds(this.width - this.paddingRight, 0, this.paddingRight, this.height);

        if (this.paddingBottom > 0)
            hclCanvas.fillBounds(0, this.height - this.paddingBottom, this.width, this.paddingBottom);
    }

    _checkParent() {
        if (this.parent == null)
            application.addForm(this);
    }

    doVisibleChange_(val) {
        if (!val && (this.showState != TFormShowState.ShowModel))
            this.showState = TFormShowState.Hide;

        super.doVisibleChange_(val);
    }

    doCloseQuery() {
        if (this.onCloseQuery != null)
            return this.onCloseQuery();
        else
            return true;
    }

    doClose_() {
        let vCanClose = this.doCloseQuery();
        if (vCanClose) {
            this.visible = false;
            this.showState = TFormShowState.Close;
            this.onClose();
            if ((this.modalResult == TModalResult.Ok) && (this._modalOkEvent != null))
                this._modalOkEvent(this);

            this.modalResult = TModalResult.Close;
            if (this.closeFree) {
                this.dispose();
            }
        }
    }    

    hide() {
        this.visible = false;
    }

    show(state = TFormShowState.Show) {
        if (!this.visible_) {
            this._checkParent();
            this.showState = state;
            this.visible = true;
        }
    }

    showNoActive() {
        this.show(TFormShowState.ShowNoActive);
    }

    showModal(modalOkEvent = null) {
        this._modalOkEvent = modalOkEvent;
        this.modalResult = TModalResult.Close;
        this.show(TFormShowState.ShowModel);
    }

    moveCenter() {
        this.left = Math.trunc((hcl.width - this.width) / 2);
        this.top = Math.trunc((hcl.height - this.height) / 2);
    }

    close() {
        this.doClose_();
    }

    onClose() { }
}

export class TForm extends TCustomForm {
    constructor(width, height) {
        super(width, height);

        this.canFocus = false;

        // 非客户区
        this.captionBar = new TCaptionBar();
        this.captionBar.transparent = true;
        this.captionBar.align = TAlign.Top;
        this.captionBar.paddingLeft = 5;
        this.captionBar.paddingRight = 5;
        this.captionBar.width = width;

        this.lblCaption = new TLable("form" + (application.forms.count + 1).toString());
        this.lblCaption.align = TAlign.Left;
        this.captionBar.addControl(this.lblCaption);

        this.btnClose = new TButton("关闭");
        this.btnClose.autoWidth = true;
        this.btnClose.align = TAlign.Right;
        this.btnClose.onClick = () => {
            this.close();
        }

        this.captionBar.addControl(this.btnClose);
        super.addControl(this.captionBar);

        // 客户区
        this.clientArea = new TPanel();
        this.clientArea.borderVisible = false;
        this.clientArea.transparent = true;
        this.clientArea.align = TAlign.Client;
        super.addControl(this.clientArea);
    }

    doGetPopupMenu() {
        return this.clientArea.popupMenu;
    }

    doSetPopupMenu(val) {
        this.clientArea.popupMenu = val;
    }

    doSetColor_() {
        this.clientArea.color = this.color;
    }

    addControl(control) {
        this.clientArea.addControl(control)
    }

    get caption() {
        return this.lblCaption.text;
    }

    set caption(val) {
        this.lblCaption.text = val;
    }
}

export class TDialog extends TForm {
    constructor() {
        super(200, 120);
        this.moveCenter();
    }

    doPaintBackground_(hclCanvas) {
        hclCanvas.brush.color = theme.backgroundStaticColor;
        hclCanvas.fillRectShadow(this.clientRect(), theme.shadow);
        //this.doPaintBorder_(hclCanvas);
    }
}

export class TOpenDialog extends TDialog {
    constructor() {
        super();
        this._reset();
        this._onExecute = null;
    }

    _reset() {
        this._fileName = "";
        this._firstFile = null;
        this._files = null;
    }

    execute(ext) {
        this._reset();
        let vInput = document.createElement("input");
        vInput.setAttribute("type", "file");
        vInput.setAttribute("style", "visibility:hidden");
        vInput.setAttribute("accept", ext != null ? ext : "");
        vInput.onchange = (e) => {  // eslint-disable-line
            if (vInput.files.length > 0) {
                this._fileName = vInput.value;
                this._firstFile = vInput.files[0];
                this._files = vInput.files;
                if (this._onExecute != null)
                    this._onExecute();
            }
        }
    
        document.body.appendChild(vInput);
        try {
            vInput.click();
        } finally {
            document.body.removeChild(vInput);
        }
    }

    get fileName() {
        return this._fileName;
    }

    get firstFile() {
        return this._firstFile;
    }

    get files() {
        return this._files;
    }

    get onExecute() {
        return this._onExecute;
    }

    set onExecute(val) {
        this._onExecute = val;
    }

    static execute(ext, callBack) {
        let vOpenDlg = new TOpenDialog();
        vOpenDlg.onExecute = () => {
            callBack(vOpenDlg);
        }

        vOpenDlg.execute(ext);
    }
}

export var TMsgDlgType = {
    Warning: 0,
    Error: 1,
    Information: 2,
    Confirmation: 3,
    Custom: 4
}

export var TMsgDlgBtn = {
    Yes: 1, 
    No: 2,
    OK: 4,
    Cancel: 8,
    Abort: 16,
    Retry: 32,
    Ignore: 64,
    All: 128,
    NoToAll: 256,
    YesToAll: 512
}

export class TMessageDialog extends TDialog {
    constructor(caption, text, dlgBtns = [], dlgType = TMsgDlgType.Custom) {
        super();
        this.caption = caption;
        this.text = text;
        this.dlgBtn = null; 

        let vArr = text.split(system.lineBreak), vW = 0, vWidth = 0;
        for (let i = 0; i < vArr.length; i++) {
            vW = THCCanvas.textWidth(null, vArr[i]) + 40;
            if (vWidth < vW)
                vWidth = vW;
        }

        this.contentHeight = vArr.length * (THCCanvas.DefaultFont.height + 5);
        this.height = Math.max(this.height_, this.contentHeight + 40);
        this.width = Math.max(this.width_, vWidth);
        this.moveCenter();
        
        let vBtn, vLeft = Math.trunc((this.width - (dlgBtns.length * 75 + (dlgBtns.length - 1) * theme.marginSpace)) / 2);
        for (let i = 0; i < dlgBtns.length; i++) {
            switch (dlgBtns[i]) {
                case TMsgDlgBtn.Yes:
                    vBtn = new TButton("是");
                    break;

                case TMsgDlgBtn.No:
                    vBtn = new TButton("否");
                    break;

                case TMsgDlgBtn.OK:
                    vBtn = new TButton("确定");
                    break;

                case TMsgDlgBtn.Cancel:
                    vBtn = new TButton("取消");
                    break;

                case TMsgDlgBtn.Abort:
                    vBtn = new TButton("中止");
                    break;

                case TMsgDlgBtn.Retry:
                    vBtn = new TButton("重试");
                    break;

                case TMsgDlgBtn.Ignore:
                    vBtn = new TButton("忽略");
                    break;

                case TMsgDlgBtn.All:
                    vBtn = new TButton("全部");
                    break;

                case TMsgDlgBtn.NoToAll:
                    vBtn = new TButton("全部否");
                    break;

                case TMsgDlgBtn.YesToAll:                    
                    vBtn = new TButton("全部是");
                    break;

                default:
                    vBtn = new TButton("确定");
                    break;
            }

            vBtn.onClick = () => {
                this.dlgBtn = dlgBtns[i];
                this.modalResult = TModalResult.Ok;
                this.close();
            }

            vBtn.left = vLeft;
            vLeft += vBtn.width + theme.marginSpace;
            vBtn.top = this.clientArea.height - 10 - vBtn.height;
            this.addControl(vBtn);
        }
    }

    doPaint_(hclCanvas) {
        super.doPaint_(hclCanvas);
        //hclCanvas.font.assign(this.font);

        let vArr = this.text.split(system.lineBreak), vTop = Math.trunc((this.clientArea.height - this.contentHeight) / 2 + 5);
        for (let i = 0; i < vArr.length; i++) {
            hclCanvas.textOut(20, vTop, vArr[i])
            vTop += THCCanvas.DefaultFont.height + 5;
        }
    }
}

export class TInputBox extends TDialog {
    constructor(caption, text) {
        super();
        this.caption = caption;
        this.text = text;

        this.btn = new TButton("确定");
        this.btn.onClick = () => {
            this.modalResult = TModalResult.Ok;
            this.close();
        }
        this.btn.left_ = 60;
        this.btn.top_ = 65;
        this.addControl(this.btn);

        this.edit = new TEdit();
        this.edit.left_ = 20;
        this.edit.top_ = 30;
        this.edit.width_ = 160;
        this.addControl(this.edit);
    }

    // doAlign_() {
    //     if (this.btn == null)
    //         return;

    //     this.btn.left = Math.trunc((this.width - this.btn) / 2);
    //     this.btn.top = this.clientArea.height - 10 - this.btn.height;
    //     super.doAlign_();
    // }

    doPaint_(hclCanvas) {
        super.doPaint_(hclCanvas);
        //hclCanvas.font.assign(this.font);
        hclCanvas.textOut(20, 30, this.text);
    }

    inputText() {
        return this.edit.text;
    }

    static Query(caption, text, callBack) {
        let vInput = new TInputBox(caption, text);
        vInput.showModal(callBack);
    }
}