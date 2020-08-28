/*=======================================================

    Html Component Library 前端UI框架 V0.1
    样式和主题单元
    作者：荆通(18114532@qq.com)
    QQ群：649023932

=======================================================*/

import { THCCanvas, TPenStyle, TBrushStyle } from "./Graphics.js";
import { TCursors, TControlStyle, TControlState } from "./Controls.js";
import { TRect } from "./System.js";

/**
 * HCL类：主题类(已实例化为theme，无需重复实例化)
 */
export class TTheme {
    constructor() {
        this.onImageLoad = null;
       
        this.iconSize = 16;
        this.iconWidth = 20;
        this.itemHeight = 20;
        this.radioButtonWidth = 16;
        this.checkBoxWidth = 16;
        this.shadow = 10;
        this.borderWidth = 1;
        this.marginSpace = 5;
        this.marginSpaceDouble = 10;
        this.popupMenuImagePadding = 30;
        this.dropDownButtonSize = 20;
        this.dropDownButtonColor = "black";

        this.borderColor = "#848484";
        this.borderHotColor = "green";
        this.borderActiveColor = "blue";

        this.backgroundStaticColor = "#f0f0f0";
        this.backgroundLightColor = "#eaeaea";
        this.backgroundHotColor = "#dcdcdc";
        this.backgroundDownColor = "#c8c8c8";
        this.backgroundContentColor = "#ffffff";
        this.backgroundSelectColor = "#3390ff";

        this.ShadowColor = "black";
        this.textColor = "black";
        this.textDisableColor = "gray";

        this._path = "";
        this.expandImage = new Image();
        this.expandImage.onload = () => {
            if (this.onImageLoad != null)
                this.onImageLoad();
        }

        this.foldImage = new Image();
        this.foldImage.onload = () => {
            if (this.onImageLoad != null)
                this.onImageLoad();
        }

        this.closeImage = new Image();
        this.closeImage.onload = () => {
            if (this.onImageLoad != null)
                this.onImageLoad();
        }
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
        hclCanvas.pen.width = 1;
        hclCanvas.pen.color = this.dropDownButtonColor;
        hclCanvas.beginPath();
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
        let vRect = TRect.CreateByBounds(rect.left + Math.trunc((rect.width - this.checkBoxWidth) / 2),
            rect.top + Math.trunc((rect.height - this.checkBoxWidth) / 2) + 1,
            this.checkBoxWidth - 2, this.checkBoxWidth - 2);
        //let vCanvas = THCCanvas.getCanvasTemp();

        switch (style) {
            case TControlStyle.ButtonRadio: {
                    hclCanvas.save();
                    try {
                        hclCanvas.pen.color = this.borderColor;
                        hclCanvas.pen.style = TPenStyle.Solid;
                        hclCanvas.pen.width = 1;
                        hclCanvas.brush.style = TBrushStyle.Clear;
                        hclCanvas.ellipseRectDriect(vRect);

                        if (stateSet.has(TControlState.Checked)) {
                            hclCanvas.brush.color = this.textColor;
                            hclCanvas.brush.style = TBrushStyle.Solid;
                            hclCanvas.pen.style = TPenStyle.Clear;
                            vRect.inFlate(-3, -3);
                            hclCanvas.ellipseRectDriect(vRect);
                        }
                    } finally {
                        hclCanvas.restore();
                    }
                    // vCanvas.brush.color = TColor.White;
                    // vCanvas.fillRect(vRect);
                    
                    // //vRect.inFlate(-1, -1);
                    // vCanvas.pen.color = this.borderColor;
                    // vCanvas.pen.style = TPenStyle.Solid;
                    // vCanvas.pen.width = 2;
                    // vCanvas.brush.style = TBrushStyle.Clear;
                    // vCanvas.ellipseRectDriect(vRect);

                    // if (stateSet.has(TControlState.Checked)) {
                    //     vCanvas.brush.color = this.backgroundDownColor;
                    //     //vCanvas.brush.style = TBrushStyle.Solid;
                    //     //vCanvas.pen.style = TPenStyle.Clear;
                    //     vRect.inFlate(-3, -3);
                    //     vCanvas.ellipseRectDriect(vRect);
                    // }

                    // hclCanvas.bitBltRect(rect, vCanvas, vRect);
                }

                break;

            case TControlStyle.CheckBox: {
                    hclCanvas.save();
                    try {
                        hclCanvas.pen.color = this.borderColor;
                        hclCanvas.pen.width = 1;
                        hclCanvas.rectangleRect(vRect);

                        if (stateSet.has(TControlState.Checked)) {
                            hclCanvas.pen.color = this.textColor;
                            hclCanvas.beginPath();
                            hclCanvas.moveTo(vRect.left + 3, vRect.top + this.checkBoxWidth / 2);
                            hclCanvas.lineTo(vRect.left - 2 + this.checkBoxWidth / 2, vRect.bottom - 3);
                            hclCanvas.lineTo(vRect.right - 3, vRect.top + 3);
                            hclCanvas.paintPath();
                        }
                    } finally {
                        hclCanvas.restore();
                    }

                    // vCanvas.brush.color = TColor.White;
                    // vCanvas.fillRect(vRect);
                    // vCanvas.pen.color = this.borderColor;
                    // vCanvas.pen.width = 1;
                    // vCanvas.rectangleRect(vRect);

                    // if (stateSet.has(TControlState.Checked)) {
                    //     vCanvas.pen.color = this.textColor;
                    //     vCanvas.beginPath();
                    //     vCanvas.moveTo(vRect.left + 4, vRect.top + this.checkBoxWidth / 2);
                    //     vCanvas.lineTo(vRect.left + this.checkBoxWidth / 2, vRect.bottom - 5);
                    //     vCanvas.lineTo(vRect.right - 4, vRect.top + 4);
                    //     vCanvas.paintPath();
                    // }

                    // hclCanvas.bitBltRect(rect, vCanvas, vRect);
                }

                break;
        }
    }

    getHoverHintSize(text) {
        return {
            width: this.marginSpace + THCCanvas.textWidth(THCCanvas.DefaultFont, text) + this.marginSpace,
            height: this.marginSpace + THCCanvas.DefaultFont.height + this.marginSpace
        }
    }

    drawHoverHint(hclCanvas, hoverHintInfo) {
        hclCanvas.pen.color = this.borderColor;
        hclCanvas.pen.width = 1;
        hclCanvas.brush.color = this.backgroundStaticColor;
        hclCanvas.fillRoundRect(hoverHintInfo.rect, 5);
        hclCanvas.font.assign(THCCanvas.DefaultFont);
        hclCanvas.textOut(hoverHintInfo.rect.left + this.marginSpace, hoverHintInfo.rect.top + this.marginSpace, hoverHintInfo.text);
    }

    drawDesign(hclCanvas, x, y, w, h) {
        hclCanvas.brush.color = this.backgroundSelectColor;
        hclCanvas.fillBounds(x - 2, y - 2, 4, 4);
        let vLeft = x + Math.trunc(w / 2);
        hclCanvas.fillBounds(vLeft - 2, y - 2, 4, 4);
        hclCanvas.fillBounds(x + w - 2, y - 2, 4, 4);
        let vTop = y + Math.trunc(h / 2);
        hclCanvas.fillBounds(x + w - 2, vTop - 2, 4, 4);
        hclCanvas.fillBounds(x + w - 2, y + h - 2, 4, 4);
        hclCanvas.fillBounds(vLeft - 2, y + h - 2, 4, 4);
        hclCanvas.fillBounds(x - 2, y + h - 2, 4, 4);
        hclCanvas.fillBounds(x - 2, vTop - 2, 4, 4);
    }

    drawShadow(hclCanvas, rect, dropDownStyle = false) {
        hclCanvas.brush.color = this.ShadowColor;

        if (dropDownStyle) {
            hclCanvas.save();
            try {
                hclCanvas.clip(rect.left - this.shadow, rect.top, rect.width + this.shadow + this.shadow, rect.bottom + this.shadow);
                hclCanvas.fillRectShadow(rect, this.shadow);
            } finally {
                hclCanvas.restore();
            }
        } else
            hclCanvas.fillRectShadow(rect, this.shadow);
    }

    get path() {
        return this._path;
    }

    set path(val) {
        if (this._path != val) {
            this._path = val;
            this.expandImage.src = this.path + "image/minus.png";
            this.foldImage.src = this.path + "image/plus.png";
            this.closeImage.src = this.path + "image/close.png";
        }
    }
}