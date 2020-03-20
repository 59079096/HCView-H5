import { TDialog } from "../hcl/Forms.js";
import { TLableEdit, TButton } from "../hcl/StdCtrls.js";

export class TFrmInsertTable extends TDialog {
    constructor() {
        super();
        this._height = 120;
        this.edtRowCount = new TLableEdit("行数", "2");
        this.edtRowCount.left = 20;
        this.edtRowCount.top = 20;
        this.edtRowCount.width = 70;
        this.addControl(this.edtRowCount);

        this.edtColCount = new TLableEdit("列数", "2");
        this.edtColCount.left = this.edtRowCount.left + this.edtRowCount.width + 20;
        this.edtColCount.top = 20;
        this.edtColCount.width = 70;
        this.addControl(this.edtColCount);

        this.btnOk = new TButton("确定");
        this.btnOk.onClick = () => {
            this.modalResult = true;
            this.close();
        }
        
        this.btnOk.left = Math.trunc((this.width - this.btnOk.width) / 2);
        this.btnOk.top = this.edtColCount.top + this.edtColCount.height + 10;
        this.addControl(this.btnOk);
    }
}