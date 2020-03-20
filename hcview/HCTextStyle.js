import { TBrushStyle, TFontStyle } from "../hcl/Graphics.js";
import { TEnumSet, TObject, TUInt16 } from "../hcl/System.js";
import { HC } from "./HCCommon.js";

export var THCFontStyle = {
    Bold: 1,
    Italic: 2,
    Underline: 4,
    StrikeOut: 8,
    Superscript: 16,
    Subscript: 32
}

export class THCTextStyle extends TObject {
    constructor() {
        super();

        this.DefaultFontSize = 10.5;
        this.DefaultFontFamily = "宋体";
        this.MaxFontSize = 512;

        this.FSize = this.DefaultFontSize;
        this.FFontHeight = 14;
        this.FFamily = this.DefaultFontFamily;
        this.FFontStyles = new TEnumSet();
        this.FColor = "black";
        this.FBackColor = HC.HCTransparentColor;
        this.FCJKFont = true;
        this.FTrueType = true;
        // this.FOutMetSize = 0;
        // this.FOutlineTextmetric_otmfsSelection = 0;
        this.FTextmetric_tmAscent = 12;
        this.FTextmetric_tmDescent = 2;
        // this.FOutlineTextmetric_otmEMSquare = 0;
        // this.FFontHeader_Ascender = 0;
        // this.FFontHeader_Descender = 0;
        this.FTextMetric_tmAveCharWidth = 7;
        this.FTextMetric_tmExternalLeading = 2;
        this.FTextMetric_tmHeight = 14;
        this.CheckSaveUsed = false;
        this.TempNo = -1;
    }

    SetFamily(val) {
        if (this.FFamily != val)
            this.FFamily = val;
    }

    SetSize(val) {
        if (this.FSize != val)
            this.FSize = val;
    }

    SetFontStyles(val) {
        if (this.FFontStyles != val)
            this.FFontStyles = val;
    }

    ApplyStyle(hclCanvas, scale = 1) {
        if (this.FBackColor == HC.HCTransparentColor)
            hclCanvas.brush.style = TBrushStyle.Clear;
        else
            hclCanvas.brush.color = this.FBackColor;

        hclCanvas.font.color = this.FColor;
        hclCanvas.font.name = this.FFamily;
        // if ((this.FFontStyles.has(TFontStyle.SuperScript)) || (this.FFontStyles.has(TFontStyle.SubScript)))
        //     hclCanvas.font.size = Math.trunc(this.FSize / 2);
        // else
        hclCanvas.font.size = this.FSize;
        hclCanvas.font.styles.value = this.FFontStyles.value;
        this.FTextMetric_tmAveCharWidth = hclCanvas.font.advCharWidth;
        this.FTextMetric_tmExternalLeading = hclCanvas.font.externalLeading;  // vTextMetric.tmExternalLeading;
        this.FTextMetric_tmHeight = hclCanvas.font.height;  // vTextMetric.tmHeight;
        this.FFontHeight = hclCanvas.font.height; // .TextHeight("H");
        this.FCJKFont = hclCanvas.font.CJK;
        this.FTrueType = hclCanvas.font.trueType;
        // this.FOutMetSize = 250;
        // this.FOutlineTextmetric_otmfsSelection = 64;// vOutlineTextmetric.otmfsSelection;
        this.FTextmetric_tmAscent = hclCanvas.font.ascent;  // vOutlineTextmetric.otmAscent;
        this.FTextmetric_tmDescent = hclCanvas.font.descent; // vOutlineTextmetric.otmDescent;
        // this.FOutlineTextmetric_otmEMSquare = 256;//vOutlineTextmetric.otmEMSquare;

        // this.FFontHeader_Ascender = hclCanvas.font.ascent;
        // this.FFontHeader_Descender = hclCanvas.font.descent;
    }

    EqualsEx(source) {
        return (this.FSize == source.Size)
            && (this.FFontStyles.value == source.FontStyles.value)
            && (this.FFamily == source.Family)
            && (this.FColor == source.Color)
            && (this.FBackColor == source.BackColor);
    }

    AssignEx(source) {
        this.FSize = source.Size;
        this.FFontStyles.value = source.FontStyles.value;
        this.FFamily = source.Family;
        this.FColor = source.Color;
        this.FBackColor = source.BackColor;
    }

    SaveToStream(stream) {
        stream.writeSingle(this.FSize);
        HC.HCSaveTextToStream(stream, this.FFamily);
        stream.writeByte(this.FFontStyles.value);
        HC.HCSaveColorToStream(stream, this.FColor);
        HC.HCSaveColorToStream(stream, this.FBackColor);
    }

    LoadFromStream(stream, fileVersion) {
        if (fileVersion < 12) {
            let vOldSize = stream.readInt32();
            this.FSize = new TUInt16(vOldSize).value;
        } else
            this.FSize = stream.readSingle();

        this.FFamily = HC.HCLoadTextFromStream(stream, fileVersion);
        this.FFontStyles.value = stream.readByte();
        this.FColor = HC.HCLoadColorFromStream(stream);
        this.FBackColor = HC.HCLoadColorFromStream(stream);
    }

    GetTextDecoration() {
        let vResult = "";
        if (this.FFontStyles.has(TFontStyle.Underline))
            vResult = " underline";

        if (this.FFontStyles.has(TFontStyle.StrikeOut)) {
            if (vResult != "")
                vResult = vResult + ", line-through";
            else
                vResult = " line-through";
        }

        return "text-decoration:" + vResult + ";";
    }

    ToCSS() {
        // let vResult = string.Format(" font-size: {0:N1}pt", FSize)
        //     + string.Format(" font-family: {0};", FFamily)
        //     + string.Format(" color:rgb({0}, {1}, {2});", FColor.R, FColor.G, FColor.B);

        // if (((FBackColor.R != 255) && (FBackColor.G != 255) && (FBackColor.B != 255)) && (FBackColor != HC.HCTransparentColor))
        //     vResult += string.Format(" background-color:rgb({0}, {1}, {2});", FBackColor.R, FBackColor.G, FBackColor.B);

        // if (FFontStyles.Contains((byte)HCFontStyle.tsItalic))
        //     vResult = vResult + string.Format(" font-style: {0};", "italic");
        // else
        //     vResult = vResult + string.Format(" font-style: {0};", "normal");

        // if (FFontStyles.Contains((byte)HCFontStyle.tsBold) || FFontStyles.Contains((byte)HCFontStyle.tsStrikeOut))
        //     vResult = vResult + string.Format(" font-weight: {0};", "bold");
        // else
        //     vResult = vResult + string.Format(" font-weight: {0};", "normal");

        // if (FFontStyles.Contains((byte)HCFontStyle.tsUnderline) || FFontStyles.Contains((byte)HCFontStyle.tsStrikeOut))
        //     vResult = vResult + " " + GetTextDecoration();

        // if (FFontStyles.Contains((byte)HCFontStyle.tsSuperscript))
        //     vResult = vResult + " " + " vertical-align:super;";

        // if (FFontStyles.Contains((byte)HCFontStyle.tsSubscript))
        //     vResult = vResult + " " + " vertical-align:sub;";

        // return vResult;
    }

    GetFontStyleXML() {
        // string vResult = "";
        // if (FFontStyles.Contains((byte)HCFontStyle.tsBold))
        //     vResult = "bold";

        // if (FFontStyles.Contains((byte)HCFontStyle.tsItalic))
        // {
        //     if (vResult != "")
        //         vResult = vResult + ", italic";
        //     else
        //         vResult = "italic";
        // }

        // if (FFontStyles.Contains((byte)HCFontStyle.tsUnderline))
        // {
        //     if (vResult != "")
        //         vResult = vResult + ", underline";
        //     else
        //         vResult = "underline";
        // }

        // if (FFontStyles.Contains((byte)HCFontStyle.tsStrikeOut))
        // {
        //     if (vResult != "")
        //         vResult = vResult + ", strikeout";
        //     else
        //         vResult = "strikeout";
        // }

        // if (FFontStyles.Contains((byte)HCFontStyle.tsSuperscript))
        // {
        //     if (vResult != "")
        //         vResult = vResult + ", sup";
        //     else
        //         vResult = "sup";
        // }

        // if (FFontStyles.Contains((byte)HCFontStyle.tsSubscript))
        // {
        //     if (vResult != "")
        //         vResult = vResult + ", sub";
        //     else
        //         vResult = "sub";
        // }

        // return vResult;
    }

    ToXml(aNode) {
        // aNode.SetAttribute("size", string.Format("{0:0.#}", FSize));
        // aNode.SetAttribute("color", HC.GetColorXmlRGB(FColor));
        // aNode.SetAttribute("bkcolor", HC.GetColorXmlRGB(FBackColor));
        // aNode.SetAttribute("style", GetFontStyleXML());
        // aNode.InnerText = FFamily;
    }

    ParseXml(aNode) {
        // FFamily = aNode.InnerText;
        // FSize = float.Parse(aNode.Attributes["size"].Value);
        // FColor = HC.GetXmlRGBColor(aNode.Attributes["color"].Value);
        // FBackColor = HC.GetXmlRGBColor(aNode.Attributes["bkcolor"].Value);

        // string[] vsStyles = aNode.Attributes["style"].Value.Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries);
        // for (int i = 0; i < vsStyles.length; i++)
        // {
        //     if (vsStyles[i] == "bold")
        //         FFontStyles.InClude((byte)HCFontStyle.tsBold);
        //     else
        //     if (vsStyles[i] == "italic")
        //         FFontStyles.InClude((byte)HCFontStyle.tsItalic);
        //     else
        //     if (vsStyles[i] == "underline")
        //         FFontStyles.InClude((byte)HCFontStyle.tsUnderline);
        //     else
        //     if (vsStyles[i] == "strikeout")
        //         FFontStyles.InClude((byte)HCFontStyle.tsStrikeOut);
        //     else
        //     if (vsStyles[i] == "sup")
        //         FFontStyles.InClude((byte)HCFontStyle.tsSuperscript);
        //     else
        //     if (vsStyles[i] == "sub")
        //         FFontStyles.InClude((byte)HCFontStyle.tsSubscript);
        // }
    }

    // get OutMetSize() {
    //     return this.FOutMetSize;
    // }

    get trueType() {
        return this.FTrueType;
    }

    get CJKFont() {
        return this.FCJKFont;
    }

    // get OutlineTextmetric_otmfsSelection() {
    //     return this.FOutlineTextmetric_otmfsSelection;
    // }

    get Textmetric_tmAscent() {
        return this.FTextmetric_tmAscent;
    }

    get Textmetric_tmDescent() {
        return this.FTextmetric_tmDescent;
    }

    // get OutlineTextmetric_otmEMSquare() {
    //     return this.FOutlineTextmetric_otmEMSquare;
    // }

    // get FontHeader_Ascender() {
    //     return this.FFontHeader_Ascender;
    // }

    // get FontHeader_Descender() {
    //     return this.FFontHeader_Descender;
    // }

    get TextMetric_tmAveCharWidth() {
        return this.FTextMetric_tmAveCharWidth;
    }

    get TextMetric_tmExternalLeading() {
        return this.FTextMetric_tmExternalLeading;
    }

    get TextMetric_tmHeight() {
        return this.FTextMetric_tmHeight;
    }

    get Family() {
        return this.FFamily;
    }

    set Family(val) {
        this.SetFamily(val);
    }

    get Size() {
        return this.FSize;
    }
    
    set Size(val) {
        this.SetSize(val);
    }

    get FontHeight() {
        return this.FFontHeight;
    }

    get FontStyles() {
        return this.FFontStyles;
    }

    set FontStyles(val) {
        this.SetFontStyles(val);
    }

    get Color() {
        return this.FColor;
    }
    
    set Color(val) {
        this.FColor = val;
    }

    get BackColor() {
        return this.FBackColor;
    }
    
    set BackColor(val) {
        this.FBackColor = val;
    }
}