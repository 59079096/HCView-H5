import { THCEditItem } from "./HCEditItem.js";
import { THCStyle } from "./HCStyle.js";
import { TRect, system, TDateTime } from "../hcl/System.js";
import { THCCanvas } from "../hcl/Graphics.js";
import { TKey } from "../hcl/Controls.js";
import { HC } from "./HCCommon.js";

export var TDateTimeArea = {
    None: 1, 
    Year: 1 << 1, 
    Month: 1 << 2, 
    Day: 1 << 3, 
    Hour: 1 << 4, 
    Minute: 1 << 5, 
    Second: 1 << 6, 
    Millisecond: 1 << 7
}

export class THCDateTimePicker extends THCEditItem {
    constructor(ownerData, dateTime) {
        super(ownerData, dateTime.format("yyyy-MM-dd hh:mm:ss"));
        this.StyleNo = THCStyle.DateTimePicker;
        this.FFormat = "yyyy-MM-dd hh:mm:ss";
        this.FDateTime = dateTime;
        this.Width = 80;
        this.FPaddingLeft = 2;
        this.FActiveArea = TDateTimeArea.None;
        this.FAreaRect = new TRect();
        this.FNewYear = "";
        this.FJoinKey = false;
    }

    GetAreaPosition(char, upper) {
        let vFind = false;
        let vs = "";
        let vIndex = -1;
        let vCount = 0;
        for (let i = 0; i < this.FFormat.length; i++) {
            if (upper)
                vs = this.FFormat[i].toUpperCase();
            else
                vs = this.FFormat[i];

            if (vs == char) {
                if (!vFind)
                    vFind = true;

                if (vIndex < 0)
                    vIndex = i;

                vCount++;
            } else if (vFind) {
                return {
                    index: vIndex,
                    count: vCount
                }
            }
        }

        return {
            index: vIndex,
            count: vCount
        }
    }

    AppendFormat(hclCanvas, area, rect) {
        rect.reset(0, 0, 0, 0);
        let vIndex = 0, vCount = -1, vInfo;

        switch (area) {
            case TDateTimeArea.Year:
                vInfo = this.GetAreaPosition("y", false);
                vIndex = vInfo.index;
                vCount = vInfo.count;
                break;

            case TDateTimeArea.Month:
                vInfo = this.GetAreaPosition("M", true);
                vIndex = vInfo.index;
                vCount = vInfo.count;
                break;

            case TDateTimeArea.Day:
                vInfo = this.GetAreaPosition("d", false);
                vIndex = vInfo.index;
                vCount = vInfo.count;
                break;

            case TDateTimeArea.Hour:
                vInfo = this.GetAreaPosition("H", true);
                vIndex = vInfo.index;
                vCount = vInfo.count;
                break;

            case TDateTimeArea.Minute:
                vInfo = this.GetAreaPosition("m", false);
                vIndex = vInfo.index;
                vCount = vInfo.count;
                break;

            case TDateTimeArea.Second:
                vInfo = this.GetAreaPosition("s", false);
                vIndex = vInfo.index;
                vCount = vInfo.count;
                break;
        }

        if (vCount > 0) {
            let vs = "";
            if (vIndex > 0)
                vs = this.FFormat.substr(0, vIndex);

            rect.left = this.FPaddingLeft;
            if (vs != "")
                rect.left += hclCanvas.textWidth(vs);

            let vSize = hclCanvas.textMetric(this.FFormat.substr(vIndex, vCount));

            rect.top = Math.trunc((this.Height - vSize.height) / 2);
            rect.right = rect.left + vSize.width;
            rect.bottom = rect.top + vSize.height;
        }
    }

    GetAreaRect(area) {
        let vResult = new TRect();
        if (area == TDateTimeArea.None)
            return vResult;

        let vCanvas = THCCanvas.getCanvasTemp();
        this.OwnerData.Style.TextStyles[this.TextStyleNo].ApplyStyle(vCanvas);
        if (this.FFormat != "")
            this.AppendFormat(vCanvas, area, vResult);

        return vResult;
    }

    GetAreaAt(x, y) {
        if (this.GetAreaRect(TDateTimeArea.Year).pointInAt(x, y))
            return TDateTimeArea.Year;
        else if (this.GetAreaRect(TDateTimeArea.Month).pointInAt(x, y))
            return TDateTimeArea.Month;
        else if (this.GetAreaRect(TDateTimeArea.Day).pointInAt(x, y))
            return TDateTimeArea.Day;
        else if (this.GetAreaRect(TDateTimeArea.Hour).pointInAt(x, y))
            return TDateTimeArea.Hour;
        else if (this.GetAreaRect(TDateTimeArea.Minute).pointInAt(x, y))
            return TDateTimeArea.Minute;
        else if (this.GetAreaRect(TDateTimeArea.Second).pointInAt(x, y))
            return TDateTimeArea.Second;
        else if (this.GetAreaRect(TDateTimeArea.Millisecond).pointInAt(x, y))
            return TDateTimeArea.dtaMillisecond;
        else
            return TDateTimeArea.None;
    }

    SetDateTime(val) {
        if (this.FDateTime != val) {
            this.FDateTime = val;
            this.Text = this.FDateTime.format(this.FFormat);
            this.FAreaRect = this.GetAreaRect(this.FActiveArea);
        }
    }

    Power10(sqr) {
        let vResult = 10;
        for (let i = 2; i <= sqr; i++)
            vResult = vResult * 10;

        return vResult;
    }

    GetYear(year) {
        let vResult = this.FDateTime.year;
        let vYear = 1999;
        let vInfo = system.tryParseInt(year);
        if (vInfo.ok) {
            vYear = vInfo.value;
            if (vYear < vResult) {
                let vPie = this.Power10(year.length);
                vResult = Math.trunc(vResult / vPie);
                vResult = Math.trunc(vResult * vPie) + vYear;
            }
        }

        return vResult;
    }

    SetInputYear() {
        if (this.FNewYear != "") {
            this.DateTime = TDateTime.Create(this.GetYear(this.FNewYear), this.FDateTime.month, this.FDateTime.day,
                this.FDateTime.hour, this.FDateTime.minute, this.FDateTime.second);
            
            this.FNewYear = "";
        }
    }

    SetFormat(val) {
        if (this.FFormat != val) {
            this.FFormat = val;
            this.Text = this.FDateTime.format(this.FFormat);

            this.FAreaRect = this.GetAreaRect(this.FActiveArea);
        }
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        let vAreaRect = TRect.CreateByRect(this.FAreaRect);
        vAreaRect.offset(drawRect.left, drawRect.top);

        if ((this.FActiveArea != TDateTimeArea.None) && (!this.IsSelectComplate) && (!paintInfo.Print)) {
            hclCanvas.brush.color = style.SelColor;
            hclCanvas.fillRect(vAreaRect);
        }

        super.DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo);

        if ((this.FActiveArea == TDateTimeArea.Year) && (this.FNewYear != "") && (!paintInfo.Print)) {
            hclCanvas.brush.color = style.SelColor;
            hclCanvas.fillRect(vAreaRect);
            hclCanvas.textRect(vAreaRect, vAreaRect.left, vAreaRect.top, this.FNewYear);
        }
    }

    SetActive(val) {
        super.SetActive(val);
        if (!this.Active) {
            if (this.FActiveArea == TDateTimeArea.Year)
                this.SetInputYear();

            this.FActiveArea = TDateTimeArea.None;
        }
    }

    MouseDown(e) {
        this.Active = (TRect.Create(0, 0, this.Width, this.Height)).pointInAt(e.x, e.y);
        let vArea = this.GetAreaAt(e.x, e.y);
        if (vArea != this.FActiveArea) {
            if (this.FActiveArea == TDateTimeArea.Year)
                this.SetInputYear();

            this.FActiveArea = vArea;
            if (this.FActiveArea != TDateTimeArea.None)
                this.FAreaRect = this.GetAreaRect(this.FActiveArea);

            this.OwnerData.Style.updateInfoRePaint();
        }

        return true;
    }

    WantKeyDown(e) {
        return true;
    }

    KeyDown(e) {
        switch (e.keyCode) {
            case TKey.Escape:
                if (this.FNewYear != "") {
                    this.FNewYear = "";
                    this.OwnerData.Style.updateInfoRePaint();
                }
                break;

            case TKey.Return:
                if (this.FActiveArea == TDateTimeArea.Year) {
                    this.SetInputYear();
                    this.OwnerData.Style.updateInfoRePaint();
                }
                break;

            case TKey.Left:
                if (this.FActiveArea > TDateTimeArea.None) {
                    if (this.FActiveArea == TDateTimeArea.Year)
                        this.SetInputYear();

                    this.FActiveArea = this.FActiveArea >> 1;
                    this.FAreaRect = this.GetAreaRect(this.FActiveArea);
                    this.OwnerData.Style.updateInfoRePaint();
                }
                break;

            case TKey.Right:
                if (this.FActiveArea < TDateTimeArea.Millisecond) {
                    if (this.FActiveArea == TDateTimeArea.Year)
                        this.SetInputYear();

                    this.FActiveArea = this.FActiveArea << 1;
                    this.FAreaRect = this.GetAreaRect(this.FActiveArea);
                    this.OwnerData.Style.updateInfoRePaint();
                }
                break;
        }
    }

    KeyPress(key) {
        if (this.ReadOnly)
            return;

        let vKey = String.fromCharCode(key);
        let vNumber = 0;
        let vDateTime = TDateTime.CreateByDateTime(this.FDateTime);
        if (this.FActiveArea != TDateTimeArea.None) {
            if ("0123456789".indexOf(vKey) >= 0) {
                switch (this.FActiveArea) {
                    case TDateTimeArea.Year:
                        if (this.FNewYear.length > 3)
                            this.FNewYear = this.FNewYear.remove(0, 1);

                        this.FNewYear = this.FNewYear + vKey;
                        break;

                    case TDateTimeArea.Month:
                        vNumber = vDateTime.month;
                        if (vNumber > 9) {
                            if (vKey == "0")
                                return;

                            vDateTime = TDateTime.Create(vDateTime.year, parseInt(vKey), vDateTime.day, 
                                vDateTime.hour, vDateTime.minute, vDateTime.second);
                        } else if ((vNumber == 1) && this.FJoinKey) {
                            if ("012".indexOf(vKey) >= 0) {
                                vNumber = vNumber * 10 + parseInt(vKey);
                                vDateTime = TDateTime.Create(vDateTime.year, vNumber, vDateTime.day, 
                                    vDateTime.hour, vDateTime.minute, vDateTime.second);
                            } else
                                vDateTime = TDateTime.Create(vDateTime.year, parseInt(vKey), vDateTime.day, 
                                    vDateTime.hour, vDateTime.minute, vDateTime.second);
                        } else {
                            if (vKey == "0")
                                return;

                            vDateTime = TDateTime.Create(vDateTime.year, parseInt(vKey), vDateTime.day, 
                                vDateTime.hour, vDateTime.minute, vDateTime.second);
                        }
                        break;

                    case TDateTimeArea.Day:
                        vNumber = vDateTime.day;
                        if (vNumber > 9) {
                            if (key == "0")
                                return;

                            vDateTime = TDateTime.Create(vDateTime.year, vDateTime.month, parseInt(vKey), 
                                vDateTime.hour, vDateTime.minute, vDateTime.second);
                        } else if (this.FJoinKey) {
                            vNumber = vNumber * 10 + parseInt(vKey);
                            if (vNumber > TDateTime.DaysInMonth(vDateTime.year, vDateTime.month))
                                vNumber = parseInt(vKey);

                            vDateTime = TDateTime.Create(vDateTime.year, vDateTime.month, vNumber,
                                vDateTime.hour, vDateTime.minute, vDateTime.second);
                        }
                        break;

                    case TDateTimeArea.Hour:
                        vNumber = vDateTime.hour;
                        if (vNumber > 9) {
                            if (vKey == "0")
                                return;

                            vDateTime = TDateTime.Create(vDateTime.year, vDateTime.month, vDateTime.day,
                                parseInt(vKey), vDateTime.minute, vDateTime.second);
                        } else if (this.FJoinKey) {
                            vNumber = vNumber * 10 + parseInt(vKey);
                            if (vNumber > 23)
                                vNumber = parseInt(vKey);

                            vDateTime = TDateTime.Create(vDateTime.year, vDateTime.month, vDateTime.day,
                                vNumber, vDateTime.minute, vDateTime.second);
                        } else {
                            if (vKey == "0")
                                return;

                            vDateTime = TDateTime.Create(vDateTime.year, vDateTime.month, vDateTime.day,
                                parseInt(vKey), vDateTime.minute, vDateTime.second);
                        }
                        break;

                    case TDateTimeArea.Minute:
                        vNumber = vDateTime.minute;
                        if (vNumber > 9)  {
                            if (vKey == "0")
                                return;

                            vDateTime = TDateTime.Create(vDateTime.year, vDateTime.month, vDateTime.day,
                                vDateTime.hour, parseInt(vKey), vDateTime.second);
                        } else if (this.FJoinKey) {
                            vNumber = vNumber * 10 + parseInt(vKey);
                            if (vNumber > 59)
                                vNumber = parseInt(vKey);

                            vDateTime = TDateTime.Create(vDateTime.year, vDateTime.month, vDateTime.day,
                                vDateTime.hour, vNumber, vDateTime.second);
                        } else {
                            if (vKey == "0")
                                return;

                            vDateTime = TDateTime.Create(vDateTime.year, vDateTime.month, vDateTime.day,
                                vDateTime.minute, parseInt(vKey), vDateTime.second);
                        }
                        break;

                    case TDateTimeArea.Second: {
                            vNumber = vDateTime.second;
                            if (vNumber > 9) {
                                if (vKey == "0")
                                    return;

                                vDateTime = TDateTime.Create(vDateTime.year, vDateTime.month, vDateTime.day,
                                    vDateTime.hour, vDateTime.minute, parseInt(vKey));
                            } else if (this.FJoinKey) {
                                vNumber = vNumber * 10 + parseInt(vKey);
                                if (vNumber > 59)
                                    vNumber = parseInt(vKey);

                                vDateTime = TDateTime.Create(vDateTime.year, vDateTime.month, vDateTime.day,
                                    vDateTime.hour, vDateTime.minute, vNumber);
                            } else {
                                if (vKey == "0")
                                    return;

                                vDateTime = TDateTime.Create(vDateTime.year, vDateTime.month, vDateTime.day,
                                    vDateTime.hour, vDateTime.minute, parseInt(vKey));
                            }
                        }
                        break;

                    case TDateTimeArea.Millisecond:
                        break;
                }
            }

            if (this.FActiveArea != TDateTimeArea.Year) {
                this.FActiveArea = this.GetAreaAt(this.FAreaRect.left, this.FAreaRect.top);
                if (this.FActiveArea != TDateTimeArea.None)
                    this.FAreaRect = this.GetAreaRect(this.FActiveArea);

                this.FJoinKey = true;
                this.SetDateTime(vDateTime);
            }

            this.OwnerData.Style.updateInfoRePaint();
        }
    }

    InsertText(text) {
        return false;
    }

    GetCaretInfo(caretInfo) {
        caretInfo.visible = false;
    }

    // public
    Assign(source) {
        super.Assign(source);
        this.FFormat = source.Format;
        this.FDateTime = TDateTime.CreateByDateTime(source.DateTime);
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        HC.HCSaveTextToStream(stream, this.FFormat);
        stream.writeDateTime(this.FDateTime);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        this.FFormat = HC.HCLoadTextFromStream(stream, fileVersion);
        this.FDateTime = stream.readDateTime();
    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }

    get Format() {
        return this.FFormat;
    }

    set Format(val) {
        this.SetFormat(val);
    }

    get DateTime() {
        return this.FDateTime;
    }

    set DateTime(val) {
        this.SetDateTime(val);
    }
}