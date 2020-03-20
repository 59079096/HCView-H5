import { TPoint, TRect } from "../hcl/System.js";
import { THCStyle } from "./HCStyle.js";
import { THCViewData } from "./HCViewData.js";

export class THCTableCellData extends THCViewData {
    constructor(style) {
        super(style);
        this.FActive = false;
        this.FCellSelectedAll = false;
        this.FCellHeight = 20;
        this.FOnGetRootData = null;
    }

    PointInCellRect(point) {
        return TRect.CreateByBounds(0, 0, this.Width, this.FCellHeight).pointIn(point);
    }

    GetHeight() {
        let vResult = super.GetHeight();
        if (this.DrawItems.count > 0)
            vResult += this.DrawItems[0].rect.top;

        return vResult;
    }

    DoLoadFromStream(stream, style, fileVersion) {
        this.BeginFormat();
        try {
            super.DoLoadFromStream(stream, style, fileVersion);
        } finally {
            this.EndFormat(false);
        }
    }

    ReSetSelectAndCaret(itemNo, offset, nextWhenMid = false) {
        if (this.FActive)
            super.ReSetSelectAndCaret(itemNo, offset, nextWhenMid);
        else {
            this.SelectInfo.Initialize();
            this.SelectInfo.StartItemNo = itemNo;
            this.SelectInfo.StartItemOffset = offset;
        }
    }

    DisSelect() {
        let vResult = super.DisSelect();
        this.FCellSelectedAll = false;
        return vResult;
    }

    DeleteSelected() {
        let vResult = super.DeleteSelected();
        this.FCellSelectedAll = false;
        return vResult;
    }

    SetActive(val) {
        if (this.FActive != val)
            this.FActive = val;

        if (!this.FActive) {
            this.DisSelect();
            this.InitializeField();
            this.Style.updateInfoRePaint();
        }
    }

    ApplySelectTextStyle(matchStyle) {
        if (this.FCellSelectedAll)
            this.CurStyleNo = this.Items[0].StyleNo;
        
        super.ApplySelectTextStyle(matchStyle);
    }

    ApplySelectParaStyle(matchStyle) {
        if (this.FCellSelectedAll)
            this.CurParaNo = this.Items[0].ParaNo;

        super.ApplySelectParaStyle(matchStyle);
    }

   SelectAll() {
        super.SelectAll();
        this.FCellSelectedAll = true;
    }

    CoordInSelect(x, y, aItemNo, aOffset, aRestrain) {
        if (this.FCellSelectedAll)
            return this.PointInCellRect(TPoint.Create(x, y));
        else
            return super.CoordInSelect(x, y, aItemNo, aOffset, aRestrain);
    }

    GetItemAt(x, y, itemNo, offset, drawItemNo, restrain) {
        let vInfo = super.GetItemAt(x, y, itemNo, offset, drawItemNo, restrain);
        if (this.FCellSelectedAll)
            vInfo.restrain = !this.PointInCellRect(TPoint.Create(x, y));

        return vInfo;
    }

    GetRootData() {
        if (this.FOnGetRootData != null)
            return this.FOnGetRootData();
        else
            return super.GetRootData();
    }

    SelectFirstItemOffsetBefor() {
        if ((!this.SelectExists()) && (this.SelectInfo.StartItemNo == 0))
            return this.SelectInfo.StartItemOffset == 0;
        else
            return false;
    }

    SelectLastItemOffsetAfter() {
        if ((!this.SelectExists()) && (this.SelectInfo.StartItemNo == this.Items.count - 1))
            return this.SelectInfo.StartItemOffset == this.GetItemOffsetAfter(this.SelectInfo.StartItemNo);
        else
            return false;
    }

    SelectFirstLine() {
        return (this.GetParaFirstItemNo(this.SelectInfo.StartItemNo) == 0);
    }

    SelectLastLine() {
        return (this.GetParaLastItemNo(this.SelectInfo.StartItemNo) == this.Items.count - 1);
    }

    ClearFormatExtraHeight() {
        let vResult = 0;
        let vFmtOffset = 0;
        for (let i = 1, vCount = this.DrawItems.count; i < vCount; i++) {
            if (this.DrawItems[i].LineFirst) {
                if (this.DrawItems[i].rect.top != this.DrawItems[i - 1].rect.bottom) {
                    vFmtOffset = this.DrawItems[i].rect.top - this.DrawItems[i - 1].rect.bottom;
                    if (vFmtOffset > vResult)
                        vResult = vFmtOffset;
                }
            }

            this.DrawItems[i].rect.offset(0, -vFmtOffset);

            if (this.Items[this.DrawItems[i].ItemNo].StyleNo < THCStyle.Null) {
                let vFormatIncHight = this.Items[this.DrawItems[i].ItemNo].ClearFormatExtraHeight();
                this.DrawItems[i].rect.bottom = this.DrawItems[i].rect.bottom - vFormatIncHight;
            }
        }

        return vResult;
    }

    get CellSelectedAll() {
        return this.FCellSelectedAll;
    }

    set CellSelectedAll(val) {
        this.FCellSelectedAll = val;
    }

    get CellHeight() {
        return this.FCellHeight;
    }

    set CellHeight(val) {
        this.FCellHeight = val;
    }

    get Active() {
        return this.FActive;
    }

    set Active(val) {
        this.SetActive(val);
    }

    get onGetRootData() {
        return this.FOnGetRootData;
    }

    set onGetRootData(val) {
        this.FOnGetRootData = val;
    }    
}