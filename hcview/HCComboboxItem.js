import { THCEditItem } from "./HCEditItem.js";
import { THCStyle } from "./HCStyle.js";
import { TList, TSize, TRect } from "../hcl/System.js";
import { TMouseButton, TCursors, theme, TPopupControl, TAlign } from "../hcl/Controls.js";
import { TColor } from "../hcl/Graphics.js";
import { HC } from "./HCCommon.js";
import { TListBox } from "../hcl/StdCtrls.js";

export class THCComboboxItem extends THCEditItem {
    constructor(ownerData, text) {
        super(ownerData, text);
        this.StyleNo = THCStyle.Combobox;
        this.BTNWIDTH = 16;
        this.BTNMARGIN = 1;
        this.FPaddingRight = this.BTNWIDTH;
        this.Width = 80;
        this.FSaveItem = true;
        this.FItemValues = new TList();
        this.FButtonDrawRect = new TRect();
        this.FButtonRect = new TRect();
        this.FMouseInButton = false;
        this.FOnPopupItem = null;
        this._popupControl = null;
        this._dropDownCount = 8;

        this._listBox = new TListBox();
        this._listBox.width = 80;
        this._listBox.onUpdate = (rect) => { this._listBoxUpdate(rect); }

        this._listBox.onSelectedIndexChange = () => {
            this.Text = this._listBox.text;
            if (this.FOnPopupItem != null)
                this.FOnPopupItem();
        }
    }

    _listBoxUpdate(rect) {
        if (this._popupControl != null)
            this._popupControl.updateRect(rect);
    }

    FormatToDrawItem(richData, itemNo) {
        super.FormatToDrawItem(richData, itemNo);         
        this.FButtonRect.resetBounds(this.Width - this.BTNMARGIN - this.BTNWIDTH, this.BTNMARGIN, 
            this.BTNWIDTH, this.Height - this.BTNMARGIN - this.BTNMARGIN);

        this._listBox.width = this.Width;
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        super.DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);

        if (paintInfo.Print && this.PrintOnlyText)
            return;

        if (this.IsSelectComplate)
            hclCanvas.brush.color = style.SelColor;
        else if (this.FMouseInButton)
            hclCanvas.brush.color = HC.clMenu;
        else
            hclCanvas.brush.color = HC.clWindow;

        this.FButtonDrawRect.resetRect(this.FButtonRect);
        this.FButtonDrawRect.offset(drawRect.left, drawRect.top);
        hclCanvas.fillRect(this.FButtonDrawRect);

        hclCanvas.pen.color = TColor.Black;
        let vLeft = this.FButtonDrawRect.left + Math.trunc((this.BTNWIDTH - 7) / 2);
        let vTop = this.FButtonDrawRect.top + Math.trunc((this.FButtonDrawRect.height - 4) / 2);

        hclCanvas.beginPath();
        try {
            for (let i = 0; i <= 3; i++) {
                hclCanvas.drawLine(vLeft, vTop, vLeft + 7 - i - i, vTop);
                vLeft++;
                vTop++;
            }
        } finally {
            hclCanvas.paintPath();
        }
    }

    DoPopup() {
        if (this._popupControl == null) {
            this._listBox.width = this.Width;
            this._listBox.itemIndex = this._listBox.itemIndexOf(this.Text);
            let vDropH = this._dropDownCount * (this._listBox.font.height + theme.marginSpaceDouble);
            let vContentH = this._listBox.contentHeight;
            if (vContentH > vDropH)
                this._listBox.height = vDropH;
            else
                this._listBox.height = vContentH;

            this._popupControl = new TPopupControl();
            this._popupControl.width = this._listBox.width;
            this._popupControl.height = this._listBox.height;
            this._popupControl.dropDownStyle = true;
            this._popupControl.onClose = () => {
                this._popupControl = null;
            }

            this._popupControl.onPaint = (hclCanvas) => {
                this._listBox.paintTo(hclCanvas, 0, 0);
            }

            this._popupControl.onMouseEnter = () => {
                this._listBox.mouseEnter();
            }

            this._popupControl.onMouseLeave = () => {
                this._listBox.mouseLeave();
            }

            this._popupControl.onMouseWheel = (e) => {
                this._listBox.mouseWheel(e);
            }

            this._popupControl.onMouseDown = (e) => {
                this._popupDownInTextArea = this._listBox.textArea().pointInAt(e.x, e.y);
                this._listBox.mouseDown(e);
            }

            this._popupControl.onMouseMove = (e) => {
                this._listBox.mouseMove(e);
            }

            this._popupControl.onMouseUp = (e) => {
                this._listBox.mouseUp(e);
                if (this._popupDownInTextArea && this._listBox.textArea().pointInAt(e.x, e.y)) {
                    if (this._listBox.itemIndex >= 0)
                        this.text = this._listBox.selectItem.text;

                    this._popupControl.closePopup();
                }
            }
        }

        let vPt = this.OwnerData.GetScreenCoord(this.FButtonDrawRect.left - (this.Width - this.FButtonDrawRect.width),
            this.FButtonDrawRect.bottom + 1);

        if (this._popupAlign == TAlign.Left)
            ;
        else
            vPt.x += this.Width - this._popupControl.width;

        this._popupControl.popup(vPt.x, vPt.y, true);
    }

    MouseDown(e) {
        if (this.OwnerData.CanEdit() && (e.button == TMouseButton.Left) && this.FButtonRect.pointInAt(e.x, e.y)) {
            this.DoPopup();
            return true;
        } else
            return super.MouseDown(e);
    }

    MouseMove(e) {
        if (this.FButtonRect.pointInAt(e.x, e.y)) {
            if (!this.FMouseInButton) {
                this.FMouseInButton = true;
                this.OwnerData.Style.updateInfoRePaint();
            }
            
            HC.GCursor = TCursors.Default;
            return true;
        } else {
            if (this.FMouseInButton) {
                this.FMouseInButton = false;
                this.OwnerData.Style.updateInfoRePaint();
            }
            
            return super.MouseMove(e);
        }
    }

    MouseLeave() {
        super.MouseLeave();
        this.FMouseInButton = false;
    }

    GetCaretInfo(caretInfo) {
        super.GetCaretInfo(caretInfo);
        if ((!this.AutoSize) && (caretInfo.x > this.Width - this.BTNWIDTH))
            caretInfo.visible = false;
    }

    SetItemIndex(val) {
        if (!this.ReadOnly) {
            if ((val >= 0) && (val <= this._listBox.items.count - 1)) {
                this._listBox.itemIndex = val;
                this.Text = this._listBox.items[val];
            } else {
                this.FItemIndex = -1;
                this.Text = "";
            }
        }
    }

    Assign(source) {
        super.Assign(source);
        this._listBox.items.clear();
        for (let i = 0; i < source.Items.count; i++)
            this._listBox.items.add(source.Items[i]);

        this.FItemValues.clear();
        for (let i = 0; i < source.ItemValues.Count; i++)
            this.FItemValues.Add(source.ItemValues[i]);
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        stream.writeBoolean(this.FSaveItem)
        if (this.FSaveItem) {
            let vText = "";
            if (this._listBox.items.count > 0) {
                vText = this._listBox.items[0].text;
                for (let i = 1; i < this._listBox.items.count; i++)
                    vText = vText + HC.sLineBreak + this._listBox.items[i].text;
            }

            HC.HCSaveTextToStream(stream, vText);

            vText = "";
            if (this.FItemValues.count > 0) {
                vText = this.FItemValues[0];
                for (let i = 1; i < this.FItemValues.count; i++)
                    vText = vText + HC.sLineBreak + this.FItemValues[i];
            }

            HC.HCSaveTextToStream(stream, vText);
        }
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        this._listBox.items.clear();
        let vText = "";

        if (fileVersion > 36) {
            this.FSaveItem = stream.readBoolean();
            if (this.FSaveItem) {
                vText = HC.HCLoadTextFromStream(stream, fileVersion);
                let vStrings = vText.split(HC.sLineBreak);
                for (let i = 0, vLen = vStrings.length; i < vLen; i++)
                    this._listBox.items.add(vStrings[i]);

                vText = HC.HCLoadTextFromStream(stream, fileVersion);
                vStrings = vText.split(HC.sLineBreak);
                for (let i = 0, vLen = vStrings.length; i < vLen; i++)
                    this.FItemValues.add(vStrings[i]);
            }
        } else {
            vText = HC.HCLoadTextFromStream(stream, fileVersion);
            let vStrings = vText.split(HC.sLineBreak);
            for (let i = 0, vLen = vStrings.length; i < vLen; i++)
                this._listBox.items.add(vStrings[i]);

            if ((this._listBox.items.count > 0) && (fileVersion > 35)) {
                vText = HC.HCLoadTextFromStream(stream, fileVersion);
                vStrings = vText.split(HC.sLineBreak);
                for (let i = 0, vLen = vStrings.length; i < vLen; i++)
                    this.FItemValues.add(vStrings[i]);
            } else
                this.FItemValues.clear();

            this.FSaveItem = this._listBox.items.count > 0;
        }
    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }

    get Items() {
        return this._listBox.items;
    }

    get ItemValues() {
        return this.FItemValues;
    }

    get ItemIndex() {
        return this.FItemIndex;
    }

    set ItemIndex(val) {
        this.SetItemIndex(val);
    }

    get SaveItem() {
        return this.FSaveItem;
    }

    set SaveItem(val) {
        this.FSaveItem = val;
    }

    get onPopupItem() {
        return this.FOnPopupItem;
    }

    set onPopupItem(val) {
        this.FOnPopupItem = val;
    }
}