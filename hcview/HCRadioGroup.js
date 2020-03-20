import { THCControlItem } from "./HCRectItem.js";
import { TPoint, TList, TRect, TSize } from "../hcl/System.js";
import { THCStyle } from "./HCStyle.js";
import { HC } from "./HCCommon.js";
import { TControlState, TControlStyle, TMouseButton, TCursors, theme } from "../hcl/Controls.js";

export var THCRadioStyle = {
    Radio: 0,
    CheckBox: 1
}

export class THCRadioButton {
    constructor() {
        this.FChecked = false;
        this.OnSetChecked = null;
        this.Text = "";
        this.TextValue = "";
        this.Position = new TPoint();
    }

    SetChecked(val) {
        if (this.FChecked != val) {
            this.FChecked = val;
            if (this.OnSetChecked != null)
                this.OnSetChecked(this);
        }
    }

    get Checked() {
        return this.FChecked;
    }

    set Checked(val) {
        this.SetChecked(val);
    }
}

export class THCRadioGroup extends THCControlItem {
    constructor(ownerData) {
        super(ownerData);
        this.StyleNo = THCStyle.RadioGroup;
        this.Width = 100;
        this.FMulSelect = false;
        this.FMouseIn = false;
        this.FItems = new TList();
        this.FItems.onAdded = (item) => { this.DoItemNotify(item); }
        this.FRadioStyle = THCRadioStyle.Radio;
        this.RadioButtonWidth = 16;
    }

    GetItemAt(x, y) {
        let vResult = -1;
        let vRect = null;
        this.OwnerData.Style.ApplyTempStyle(this.TextStyleNo);
        for (let i = 0; i <= this.FItems.count - 1; i++) {
            vRect = TRect.CreateByBounds(this.FItems[i].Position.x, this.FItems[i].Position.y,
                this.RadioButtonWidth, this.RadioButtonWidth);
            if (vRect.pointInAt(x, y)) {
                vResult = i;
                break;
            }
        }

        return vResult;
    }

    DoItemNotify(item) {
        item.OnSetChecked = (item) => { this.DoItemSetChecked(item); }
    }

    DoItemSetChecked(sender) {
        if ((!this.FMultSelect) && sender.Checked) {
            let vIndex = this.FItems.indexOf(sender);
            for (let i = 0; i < this.FItems.count; i++) {
                if (i != vIndex)
                    this.FItems[i].Checked = false;
            }
        }
    }

    FormatToDrawItem(richData, itemNo) {
        this.Height = this.FMinHeight;

        richData.Style.ApplyTempStyle(this.TextStyleNo);

        let vLeft = this.FPaddingLeft;
        let vTop = this.FPaddingTop;
        let vSize = new TSize();

        for (let i = 0; i <= this.FItems.count - 1; i++) {
            if (this.FItems[i].Text != "")
                vSize = richData.Style.TempCanvas.textMetric(this.FItems[i].Text);
            else
                vSize = richData.Style.TempCanvas.textMetric("H");
            
            if (this.AutoSize && vLeft + vSize.width + this.RadioButtonWidth > this.Width) {
                vLeft = this.FPaddingLeft;
                vTop = vTop + vSize.height + this.FPaddingBottom;
            }

            this.FItems[i].Position.x = vLeft;
            this.FItems[i].Position.y = vTop;

            vLeft = vLeft + this.RadioButtonWidth + vSize.width + this.FPaddingRight;
        }

        if (this.AutoSize)
            this.Width = vLeft;

        this.Height = vTop + vSize.height + this.FPaddingBottom;
        
        if (this.Width < this.FMinWidth)
            this.Width = this.FMinWidth;
        if (this.Height < this.FMinHeight)
            this.Height = this.FMinHeight;
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        super.DoPaint(style, drawRect, dataDrawTop, dataDrawBottom,
            dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);
        
        if (this.FMouseIn) {
            hclCanvas.brush.color = HC.clBtnFace;
            hclCanvas.fillRect(drawRect);
        }

        style.TextStyles[this.TextStyleNo].ApplyStyle(hclCanvas, paintInfo.ScaleY / paintInfo.Zoom);
        
        let vPoint = new TPoint();
        let vItemRect = new TRect();
        for (let i = 0; i <= this.FItems.count - 1; i++) {
            vPoint.x = this.FItems[i].Position.x;
            vPoint.y = this.FItems[i].Position.y;
            vPoint.offset(drawRect.left, drawRect.top);
            vItemRect.resetBounds(vPoint.x, vPoint.y, this.RadioButtonWidth, this.RadioButtonWidth);
            if (this.FItems[i].Checked)
                theme.drawFrameControl(hclCanvas, vItemRect, new Set([TControlState.Checked]), (this.FRadioStyle == THCRadioStyle.Radio ? TControlStyle.ButtonRadio : TControlStyle.CheckBox));
            else
                theme.drawFrameControl(hclCanvas, vItemRect, new Set([]), (this.FRadioStyle == THCRadioStyle.Radio ? TControlStyle.ButtonRadio : TControlStyle.CheckBox));
            
            hclCanvas.textOut(vPoint.x + this.RadioButtonWidth, vPoint.y, this.FItems[i].Text);
        }
    }

    MouseDown(e) {
        let vResult = super.MouseDown(e);
        if (this.OwnerData.CanEdit() && (e.button == TMouseButton.Left)) {
            let vIndex = this.GetItemAt(e.x, e.y);
            if (vIndex >= 0)
                this.FItems[vIndex].Checked = !this.FItems[vIndex].Checked;
        }

        return vResult;
    }

    MouseMove(e) {
        HC.GCursor = TCursors.Default;
        return super.MouseMove(e);
    }

    MouseEnter() {
        super.MouseEnter();
        this.FMouseIn = true;
    }

    MouseLeave() {
        super.MouseLeave();
        this.FMouseIn = false;
    }

    GetCaretInfo(caretInfo) {
        if (this.Active)
            caretInfo.visible = false;
    }

    GetOffsetAt(x) {
        if (x <= this.FPaddingLeft)
            return HC.OffsetBefor;
        else if (x >= this.Width - this.FPaddingRight)
            return HC.OffsetAfter;
        else
            return HC.OffsetInner;
    }

    Assign(source) {
        super.Assign(source);
        this.FItems.clear();
        for (let i = 0; i < source.Items.count; i++)
            this.AddItem(source.Items[i].Text, source.Items[i].TextValue, source.Items[i].Checked);
    }

    AddItem(text, textValue = "", checked = false) {
        let vRadioButton = new THCRadioButton();
        vRadioButton.Checked = checked;
        vRadioButton.Text = text;
        vRadioButton.TextValue = textValue;
        this.FItems.add(vRadioButton);
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        let vTexts = "", vTextValues = "";
        if (this.FItems.Count > 0) {
            vTexts = this.FItems[0].Text;
            vTextValues = this.FItems[0].TextValue;
            for (let i = 1; i < this.FItems.count; i++) {
                vTexts = vTexts + HC.sLineBreak + this.FItems[i].Text;
                vTextValues = vTextValues + HC.sLineBreak + this.FItems[i].TextValue;
            }
        }

        HC.HCSaveTextToStream(stream, vTexts);
        HC.HCSaveTextToStream(stream, vTextValues);

        for (let i = 0; i < this.FItems.count; i++)
            stream.writeBoolean(this.FItems[i].Checked);

        stream.writeByte(this.FRadioStyle);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        this.FItems.clear();

        let vS = HC.HCLoadTextFromStream(stream, fileVersion);
        if (vS != "") {
            let vStrings = vS.split(HC.sLineBreak);
            for (let i = 0; i < vStrings.length; i++)
                this.AddItem(vStrings[i]);

            if (fileVersion > 35) {
                vS = HC.HCLoadTextFromStream(stream, fileVersion);
                if (vS != "") {
                    vStrings = vS.split(HC.sLineBreak);
                    for (let i = 0; i < vStrings.length; i++)
                        this.FItems[i].TextValue = vStrings[i];
                }
            }

            for (let i = 0; i < this.FItems.count; i++)
                this.FItems[i].Checked = stream.readBoolean();
        }

        if (fileVersion > 33)
            this.FRadioStyle = stream.readByte();
    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }

    get MultSelect() {
        return this.FMultSelect;
    }

    set MultSelect(val) {
        this.FMultSelect = val;
    }

    get RadioStyle() {
        return this.FRadioStyle;
    }

    set RadioStyle(val) {
        this.FRadioStyle = val;
    }

    get Items() {
        return this.FItems;
    }
}