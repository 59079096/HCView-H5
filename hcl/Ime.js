import { TPoint } from "./System.js";

export var TImeMode = {
    Disabled: 0,  // close
    Active: 1,    // chinese
    Inactive: 2,  // english
    Auto: 3       // open the default ime
}

class TIme {
    constructor() {
        this._control = null;
        this._active = false;

        this._input = document.createElement("input");
        this._input.type = "text";
        this._input.style.position = "absolute";
        this._input.style.opacity = 0;  // debug
        //this.input.style.pointerEvents = 'none';
        this._input.style.zIndex = -1;  // debug
        //this._input.style.zIndex = 5;
        // hide native blue text cursor on iOS
        //this.input.style.transform = 'scale(0)';
        this._input.style.left = "20px";
        this._input.style.top = "10px";
        this._input.style.width = "10px";
        this._input.style.height = "10px";

        this._input.onfocus = (e) => {  // eslint-disable-line
            this._doSetFocus();
        }

        this._input.onblur = (e) => {  // eslint-disable-line
            this._doKillFocus();
        }

        // ctrl+v粘贴时触发
        this._input.onpaste = (e) => {
            for (let i = 0, vCount = e.clipboardData.items.length; i < vCount; i++) {
                if (e.clipboardData.items[i].kind == "string")
                    e.clipboardData.items[i].getAsString((data) => { this._doInput(data, true); });
            }
        }

        this._input.addEventListener('compositionstart', (e) => {  // eslint-disable-line
            // 非直接输入开始(如中文输入过程开始)
            this._input.value = "";
            //console.log("非直接输入开始");
        });

        this._input.addEventListener('compositionend', (e) => {
            // 非直接输入结束(如中文输入过程开始)
            this._doInput(e.data);
            //console.log("非直接输入结束");
        });

        this._input.oninput = (e) => {
            if (!e.isComposing) {  // 非编码输入（直接键盘上的键）
                this._input.value = "";
                // 中文标点符号
                if ("·~！@#￥%……&*（）{}【】、|；：’‘“”，。《》/？".indexOf(e.data) >= 0)
                    this._doInput(e.data);
            }
            // 关闭以下代码，实现对中文输入法切换到英文模式输入的内容不处理
            // if (!e.isComposing)
            //     this._doInput(e.data);
        }

        document.body.appendChild(this._input);
    }

    _doSetFocus() {
        this._active = true;
    }

    _doKillFocus() {
        this._active = false;
    }

    _doInput(str, isPaste = false) {
        this._input.value = "";
        if (this._control !== null)
            this._control.imeInput(str, isPaste);
    }

    setControl(control) {
        if (control !== null) //&& (control.isClass(TInputControl)))
            this._control = control;
        else
            this._control = null;

        if (this._control !== null) {
            if (control.imeMode == TImeMode.Disabled)
                this._input.blur();
            else if (!this._active) {
                this.updatePosition(0, 0);
                this.updateSize(14);
                this._input.focus();
            }
        } else {
            this._input.blur();
            this._input.value = "";
        }
    }

    removeControl(control) {
        if (this._control === control) {
            this._control = null;
            this._input.blur();
            this._input.value = "";
        }
    }

    updateSize(h) {
        if (this._control !== null)
            this._input.style.height = h + "px";
    }

    updatePosition(x, y) {
        if (this._control !== null) {
            let vPoint = this._control.clientToScreen(TPoint.Create(x, y));
            //this._input.style.left = hcl.left + vPoint.x  + "px";
            this._input.style.left = vPoint.x  + "px";  // debug
            this._input.style.top = vPoint.y + "px";
        }
    }
}

export var ime = new TIme();