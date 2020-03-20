import { application } from "./Application.js";
import { TAlign, TCustomControl, theme } from "./Controls.js";
import { TFont } from "./Graphics.js";
import { hcl } from "./Kernel.js";
import { TMessage } from "./Messages.js";
import { TButton, TCaptionBar, TPanel } from "./StdCtrls.js";

export var TFormShowState = {
    fssClose: 0,
    fssHide: 1,
    fssShowNoActive: 2,
    fssShow: 3,
    fssShowModel: 4,
}

export class TCustomForm extends TCustomControl {
    constructor(width, height) {
        super();

        this._modalOkEvent = null;
        this.visible_ = false;
        this.width = width;
        this.height = height;
        this.closeFree = true;
        this.showState = TFormShowState.fssClose;
        this.modalResult = false;
    }

    doSetBounds_() {
        // the parent don't need reAlign()
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
        if (this.parent === null)
            application.addForm(this);
    }

    doVisibleChange_(val) {
        if (!val && (this.showState !== TFormShowState.fssShowModel))
            this.showState = TFormShowState.fssHide;

        super.doVisibleChange_(val);
    }

    doClose_() {
        let vCanClose = this.onCloseQuery();
        if (vCanClose) {
            this.visible = false;
            this.showState = TFormShowState.fssClose;
            this.onClose();
            if (this.modalResult && (this._modalOkEvent != null))
                this._modalOkEvent();

            this.modalResult = false;
            if (this.closeFree) {
                this.dispose();
            }
        }
    }    

    hide() {
        this.visible = false;
    }

    show(state = TFormShowState.fssShow) {
        this._checkParent();
        this.showState = state;
        this.visible = true;
    }

    showNoActive() {
        this.show(TFormShowState.fssShowNoActive);
    }

    showModal(modalOkEvent) {
        this._modalOkEvent = modalOkEvent;
        this.modalResult = false;
        this.show(TFormShowState.fssShowModel);
    }

    close() {
        this.doClose_();
    }

    activate() {
        //if (this.showState > TFormShowState.fssShowNoActive) { }
    }

    deactivate() {
        this.broadcast(TMessage.Deactivate, 0, 0);
    }

    onCloseQuery() {
        return true;
    }

    onClose() { }
}

export class TForm extends TCustomForm {
    constructor(width, height) {
        super(width, height);

        this.canFocus = false;
        this.font = new TFont();
        this.caption = "form";// + application.forms.count + 1;

        // 非客户区
        this.captionBar = new TCaptionBar();
        this.captionBar.align = TAlign.Top;
        this.captionBar.width = width;

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
        this.clientArea.color = this.color;
        this.clientArea.align = TAlign.Client;
        super.addControl(this.clientArea);
    }

    doSetColor_() {
        this.clientArea.color = this.color;
    }

    addControl(control) {
        this.clientArea.addControl(control)
    }

    get text() {
        return this.caption;
    }

    set text(val) {
        this.caption = val;
    }
}

export class TDialog extends TForm {
    constructor() {
        super(200, 100);
        this.left = Math.trunc((hcl.width - this.width) / 2);
        this.top = Math.trunc((hcl.height - this.height) / 2);
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

export class TMessageDialog extends TDialog {
    constructor(caption, text) {
        super();
        this.caption = caption;
        this.text = text;
    }

    doPaint_(hclCanvas) {
        super.doPaint_(hclCanvas);
        hclCanvas.font.assign(this.font);
        hclCanvas.textOut(Math.trunc((this.width - hclCanvas.textWidth(this.text)) / 2), Math.trunc(this.height / 2 + 5), this.text);
    }
}
