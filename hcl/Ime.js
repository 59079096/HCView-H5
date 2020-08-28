/*=======================================================

    Html Component Library 前端UI框架 V0.1
    输入法交互单元
    作者：荆通(18114532@qq.com)
    QQ群：649023932

=======================================================*/

import { hcl } from "./HCL.js";
import { TPoint, TFileExt } from "./System.js";

export let TImeMode = {
    Disabled: 0,  // close
    Active: 1,    // chinese
    Inactive: 2,  // english
    Auto: 3       // open the default ime
}

export class TIme {
    constructor() {
        //this.innerPasted = false;
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
            if (this.__innerPasted) // hcl体系内部响应了
                return;

            for (let i = 0, vCount = e.clipboardData.items.length; i < vCount; i++) {
                if (e.clipboardData.items[i].kind == "string") {
                    if (e.clipboardData.items[i].type == "text/plain") {
                        e.clipboardData.items[i].getAsString((data) => {
                            hcl.clipboard.clear();
                            hcl.localStorage.clear();
                            hcl.localStorage.setString(TFileExt.Text, data);
                            if (this._control !== null)
                                this._control.imePaste();
                        });
                    } else if (e.clipboardData.items[i].type == "text/html") {
                        e.clipboardData.items[i].getAsString((data) => {
                            //hcl.clipboard.clear();
                            //this._doInputHtml(data, true);
                        });
                    }
                }
            }
        }

        this._input.addEventListener("compositionstart", (e) => {  // eslint-disable-line
            // 非直接输入开始(如中文输入过程开始)
            this._input.value = "";
            //console.log("非直接输入开始");
        });

        this._input.addEventListener("compositionend", (e) => {
            // 非直接输入结束(如中文输入过程结束)
            this._doInput(e.data);
            //console.log("非直接输入结束");
        });

        this._input.oninput = (e) => {
            if (!e.isComposing) {  // 非编码输入（直接键盘上的键）
                if (e.inputType != "insertText") {  // insertFromPaste
                    this._input.value = "";  // 把ctrl+v进来的内容清除了，防止下次按键上屏时带上复制的内容
                    return;
                }
                /* 使用下面兼容firefox的写法
                this._input.value = "";
                // 中文标点符号
                //if ("·~！@#￥%……&*（）{}【】、|；：’‘“”，。《》/？ ".indexOf(e.data) >= 0)
                    this._doInput(e.data);
                */

                // 兼容firefox
                this._doInput(this._input.value);
                this._input.value = "";
            }
            // 关闭以下代码，实现对中文输入法切换到英文模式输入的内容不处理
            // if (!e.isComposing)
            //     this._doInput(e.data);
        }
    }

    __hclLoaded(hcl) {
        this._input.setAttribute("id", "hclInput_" + hcl.system.Timestamp);
        hcl.parentElement.appendChild(this._input);
    }

    __hclUnLoaded(hcl) {
        hcl.parentElement.removeChild(this._input);
    }

    _doSetFocus() {
        this._active = true;
    }

    _doKillFocus() {
        this._active = false;
    }

    _doInput(str) {
        this._input.value = "";
        if (this._control !== null)
            this._control.imeInput(str);
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
                this.updateSize(14);
                this._input.focus();
                this._control.imeActive();
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