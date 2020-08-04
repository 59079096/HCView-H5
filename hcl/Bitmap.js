import { THCCanvas } from "./Graphics.js";
import { hcl } from "./HCL.js";
import { TObject } from "./System.js";

export class TBitmap extends TObject {
    constructor(width, height) {
        super();
        this._canvas = document.createElement("canvas");
        if (width)
            this._canvas.width = width;
        else
            this._canvas.width = 100;

        if (height)
            this._canvas.height = height;
        else    
            this._canvas.height = 100;

        this._context = this._canvas.getContext("2d");
        this.canvas = new THCCanvas(this._context);
        this.canvas.prepareConext(hcl._scale);
    }

    get width() {
        return this._canvas.width;
    }

    set width(val) {
        this._canvas.width = val;
    }

    get height() {
        return this._canvas.height;
    }

    set height(val) {
        this._canvas.height = val;
    }
}