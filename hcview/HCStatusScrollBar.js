import { TScrollBar, TOrientation } from "../hcl/Controls.js";
import { TObject, TList, TRect } from "../hcl/System.js";

export class THCStatus extends TObject {
    constructor() {
        super();
        this.FWidth = 100;
        this.FText = "";
        this.FOnChange = null;
    }

    setWidth(val) {
        if (this.FWidth != val) {
            this.FWidth = val;
            this.doChange();
        }
    }

    setText(val) {
        if (this.FText != val) {
            this.FText = val;
            this.doChange();
        }
    }

    doChange() {
        if (this.FOnChange != null)
            this.FOnChange(this);
    }

    get width() {
        return this.FWidth;
    }

    set width(val) {
        this.setWidth(val);
    }

    get text() {
        return this.FText;
    }

    set text(val) {
        this.setText(val);
    }

    get onChange() {
        return this.FOnChange;
    }

    set onChange(val) {
        this.FOnChange = val;
    }
}

export class THCStatusScrollBar extends TScrollBar {
    constructor() {
        super();
        this.FStatuses = new TList(true);
    }

    DoStatusChange(sender) {
        this.update();
    }

    paintToEx(hclCanvas) {
        super.paintToEx(hclCanvas);

        if (this.orientation == TOrientation.Horizontal) {
            if (this.FStatuses.count > 0) {
                hclCanvas.brush.color = "#52596b";
                hclCanvas.fillRect(TRect.Create(2, 2, this.leftBtnRect_.left, this.height - 2));
                hclCanvas.font.size = 8;
                hclCanvas.font.color = "#d0d1d5";
                hclCanvas.font.name = "Arial";
                hclCanvas.font.styles.clear();

                let vLeft = 4;
                let vText = "";
                let vRect = TRect.Create(0, 2, 0, this.height - 2);
                for (let i = 0, vCount = this.FStatuses.count; i < vCount; i++) {
                    vText = this.FStatuses[i].text;
                    vRect.left = vLeft;
                    vRect.right = vLeft + this.FStatuses[i].width;
                    hclCanvas.textOut(vRect.left, vRect.top, vText);
                    //hclCanvas.TextRect(ref vRect, vText, User.DT_LEFT | User.DT_SINGLELINE | User.DT_VCENTER);
                    vLeft += this.FStatuses[i].width + 2;
                }
            }
        }
    }

    addStatus(width) {
        let vStatus = new THCStatus();
        vStatus.onChange = () => { this.DoStatusChange(); }
        vStatus.width = width;
        this.FStatuses.add(vStatus);

        let vWidth = 0;
        for (let i = 0, vCount = this.FStatuses.count; i < vCount; i++)
            vWidth += this.FStatuses[i].width;

        this.leftBlank_ = vWidth;
        this.update();
    }

    get Statuses() {
        return this.FStatuses;
    }
}