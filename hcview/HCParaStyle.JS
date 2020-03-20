import { system, TObject } from "../hcl/System.js";
import { HC } from "./HCCommon.js";
import { THCUnitConversion } from "./HCUnitConversion.js";

export var TParaAlignHorz = {
    Left: 0,
    Center: 1,
    Right: 2,
    Justify: 3,
    Scatter: 4
}

export var TParaAlignVert = {
    Top: 0,
    Center: 1,
    Bottom: 2
}

export var TParaFirstLineIndent = {
    None: 0,
    Indented: 1,
    Hanging: 2
}

export var TParaLineSpaceMode = {
    PLS100: 0,
    PLS115: 1,
    PLS150: 2,
    PLS200: 3,
    PLSMin: 4,
    PLSFix: 5,
    PLSMult: 6
}

export class THCParaStyle extends TObject {
    constructor() {
        super();
        this.FLineSpaceMode = TParaLineSpaceMode.PLS100;
        this.FLineSpace = 1;
        this.FFirstIndentPix = 0;
        this.FLeftIndentPix = 0;
        this.FRightIndentPix = 0;
        this.FFirstIndent = 0;
        this.FLeftIndent = 0;
        this.FRightIndent = 0;
        this.FBreakRough = false;
        this.FBackColor = "silver";
        this.FAlignHorz = TParaAlignHorz.Justify;
        this.FAlignVert = TParaAlignVert.Center;
        this.CheckSaveUsed;
        this.TempNo;
    }

    SetFirstIndent(val) {
        if (this.FFirstIndent != val) {
            this.FFirstIndent = val;
            this.FFirstIndentPix = THCUnitConversion.millimeterToPixX(this.FFirstIndent);
        }
    }

    SetLeftIndent(val) {
        if (this.FLeftIndent != val) {
            this.FLeftIndent = val;
            this.FLeftIndentPix = THCUnitConversion.millimeterToPixX(this.FLeftIndent);
        }
    }

    SetRightIndent(val) {
        if (this.FRightIndent != val) {
            this.FRightIndent = val;
            this.FRightIndentPix = THCUnitConversion.millimeterToPixX(this.FRightIndent);
        }
    }

    EqualsEx(source) {
        return (this.FLineSpaceMode == source.LineSpaceMode)
            && (this.FLineSpace == source.LineSpace)
            && (this.FFirstIndent == source.FirstIndent)
            && (this.FLeftIndent == source.LeftIndent)
            && (this.FRightIndent == source.RightIndent)
            && (this.FBackColor == source.BackColor)
            && (this.FBreakRough == source.BreakRough)
            && (this.FAlignHorz == source.AlignHorz)
            && (this.FAlignVert == source.AlignVert);
    }

    AssignEx(source) {
        this.FLineSpaceMode = source.LineSpaceMode;
        this.FLineSpace = source.LineSpace;
        this.FirstIndent = source.FirstIndent;
        this.LeftIndent = source.LeftIndent;
        this.RightIndent = source.RightIndent;
        this.FBackColor = source.BackColor;
        this.FBreakRough = source.BreakRough;
        this.FAlignHorz = source.AlignHorz;
        this.FAlignVert = source.AlignVert;
    }

    SaveToStream(stream) {
        stream.writeByte(this.FLineSpaceMode);
        stream.writeSingle(this.FLineSpace);
        stream.writeSingle(this.FFirstIndent);
        stream.writeSingle(this.FLeftIndent);
        stream.writeSingle(this.FRightIndent);
        HC.HCSaveColorToStream(stream, this.FBackColor);

        let vByte = 0;
        if (this.FBreakRough)
            vByte = vByte | (1 << 7);

        stream.writeByte(vByte);

        vByte = this.FAlignHorz;
        stream.writeByte(vByte);

        vByte = this.FAlignVert;
        stream.writeByte(vByte);
    }

    LoadFromStream(stream, fileVersion) {
        if (fileVersion < 15)
            stream.readInt32();

        if (fileVersion > 16)
            this.FLineSpaceMode = stream.readByte();

        if (fileVersion > 30)
            this.FLineSpace = stream.readSingle();
        else
        if (this.FLineSpaceMode == TParaLineSpaceMode.Fix)
            this.FLineSpace = 12;

        if (fileVersion < 22) {
            this.FFirstIndentPix = stream.readInt32();
            this.FLeftIndentPix = stream.readInt32();
        } else  {
            this.FFirstIndent = stream.readSingle();
            this.FFirstIndentPix = THCUnitConversion.millimeterToPixX(this.FFirstIndent);

            this.FLeftIndent = stream.readSingle();
            this.FLeftIndentPix = THCUnitConversion.millimeterToPixX(this.FLeftIndent);

            this.FRightIndent = stream.readSingle();
            this.FRightIndentPix = THCUnitConversion.millimeterToPixX(this.FRightIndent);
        }

        this.FBackColor = HC.HCLoadColorFromStream(stream);

        let vByte = 0;
        if (fileVersion > 31) {
            vByte = stream.readByte();
            this.FBreakRough = system.isOdd(vByte >> 7);
        }
        
        this.FAlignHorz = stream.readByte();

        if (fileVersion > 17)
            this.FAlignVert = stream.readByte();
    }

    ToCSS() {
        // string Result = " text-align: ";
        // switch (FAlignHorz)
        // {
        //     case ParaAlignHorz.pahLeft:
        //         Result = Result + "left";
        //         break;

        //     case ParaAlignHorz.pahRight:
        //         Result = Result + "right";
        //         break;

        //     case ParaAlignHorz.pahCenter:
        //         Result = Result + "center";
        //         break;

        //     case ParaAlignHorz.pahJustify:
        //     case ParaAlignHorz.pahScatter:
        //         Result = Result + "justify";
        //         break;
        // }

        // switch (FLineSpaceMode)
        // {
        //     case ParaLineSpaceMode.pls100:
        //         Result = Result + "; line-height: 100%";
        //         break;

        //     case ParaLineSpaceMode.pls115:
        //         Result = Result + "; line-height: 115%";
        //         break;

        //     case ParaLineSpaceMode.pls150:
        //         Result = Result + "; line-height: 150%";
        //         break;

        //     case ParaLineSpaceMode.pls200:
        //         Result = Result + "; line-height: 200%";
        //         break;

        //     case ParaLineSpaceMode.plsFix:
        //         Result = Result + "; line-height: 10px";
        //         break;
        // }

        // return Result;
    }

    GetLineSpaceModeXML_() {
        switch (this.FLineSpaceMode)
        {
            case TParaLineSpaceMode.PLS100:
                return "100";

            case TParaLineSpaceMode.PLS115:
                return "115";

            case TParaLineSpaceMode.PLS150:
                return "150";

            case TParaLineSpaceMode.PLS200:
                return "200";

            case TParaLineSpaceMode.PLSMin:
                return "min";

            case TParaLineSpaceMode.PLSMult:
                return "mult";

            case TParaLineSpaceMode.PLSFix:
                return "fix";

            default:
                return "100";
        }
    }

    GetHorzXML_() {
        switch (this.FAlignHorz)
        {
            case TParaAlignHorz.Left:
                return "left";

            case TParaAlignHorz.Right:
                return "right";

            case TParaAlignHorz.Center:
                return "center";

            case TParaAlignHorz.Justify:
                return "justify";

            default:
                return "scatter";
        }
    }

    GetVertXML_() {
        switch (this.FAlignVert)
        {
            case TParaAlignVert.Top:
                return "top";

            case TParaAlignVert.Center:
                return "center";

            default:
                return "bottom";
        }
    }

    ToXml(aNode)
    {
        // aNode.SetAttribute("firstindent", FFirstIndent.ToString());
        // aNode.SetAttribute("leftindent", FLeftIndent.ToString());
        // aNode.SetAttribute("rightindent", FRightIndent.ToString());
        // aNode.SetAttribute("bkcolor", HC.GetColorXmlRGB(FBackColor));
        // if (FBreakRough)
        //     aNode.SetAttribute("breakrough", "1");

        // aNode.SetAttribute("spacemode", GetLineSpaceModeXML_());
        // aNode.SetAttribute("horz", GetHorzXML_());
        // aNode.SetAttribute("vert", GetVertXML_());
    }

    ParseXml(aNode) {
        // FirstIndent = float.Parse(aNode.Attributes["firstindent"].Value);
        // LeftIndent = float.Parse(aNode.Attributes["leftindent"].Value);
        // RightIndent = float.Parse(aNode.Attributes["rightindent"].Value);
        // FBackColor = HC.GetXmlRGBColor(aNode.Attributes["bkcolor"].Value);
        // FBreakRough = aNode.GetAttribute("breakrough") == "1";
        // //GetXMLLineSpaceMode_;
        // if (aNode.Attributes["spacemode"].Value == "100")
        //     FLineSpaceMode = ParaLineSpaceMode.pls100;
        // else
        // if (aNode.Attributes["spacemode"].Value == "115")
        //     FLineSpaceMode = ParaLineSpaceMode.pls115;
        // else
        // if (aNode.Attributes["spacemode"].Value == "150")
        //     FLineSpaceMode = ParaLineSpaceMode.pls150;
        // else
        // if (aNode.Attributes["spacemode"].Value == "200")
        //     FLineSpaceMode = ParaLineSpaceMode.pls200;
        // else
        // if (aNode.Attributes["spacemode"].Value == "min")
        //     FLineSpaceMode = ParaLineSpaceMode.plsMin;
        // else
        // if (aNode.Attributes["spacemode"].Value == "mult")
        //     FLineSpaceMode = ParaLineSpaceMode.plsMult;
        // else
        // if (aNode.Attributes["spacemode"].Value == "fix")
        //     FLineSpaceMode = ParaLineSpaceMode.plsFix;

        // //GetXMLHorz_;
        // if (aNode.Attributes["horz"].Value == "left")
        //     FAlignHorz = ParaAlignHorz.pahLeft;
        // else
        // if (aNode.Attributes["horz"].Value == "right")
        //     FAlignHorz = ParaAlignHorz.pahRight;
        // else
        // if (aNode.Attributes["horz"].Value == "center")
        //     FAlignHorz = ParaAlignHorz.pahCenter;
        // else
        // if (aNode.Attributes["horz"].Value == "justify")
        //     FAlignHorz = ParaAlignHorz.pahJustify;
        // else
        // if (aNode.Attributes["horz"].Value == "scatter")
        //     FAlignHorz = ParaAlignHorz.pahScatter;

        // //GetXMLVert_;
        // if (aNode.Attributes["vert"].Value == "top")
        //     FAlignVert = ParaAlignVert.pavTop;
        // else
        // if (aNode.Attributes["vert"].Value == "center")
        //     FAlignVert = ParaAlignVert.pavCenter;
        // else
        // if (aNode.Attributes["vert"].Value == "bottom")
        //     FAlignVert = ParaAlignVert.pavBottom;
    }
    
    get LineSpaceMode() {
        return this.FLineSpaceMode;
    }

    set LineSpaceMode(val) {
        this.FLineSpaceMode = val;
    }

    get LineSpace() {
        return this.FLineSpace;
    }

    set LineSpace(val) {
        this.FLineSpace = val;
    }

    get FirstIndent() {
        return this.FFirstIndent;
    }

    set FirstIndent(val) {
        this.SetFirstIndent(val);
    }

    get LeftIndent() {
        return this.FLeftIndent;
    }

    set LeftIndent(val) {
        this.SetLeftIndent(val);
    }

    get RightIndent() {
        return this.FRightIndent;
    }

    set RightIndent(val) {
        this.SetRightIndent(val);
    }

    get FirstIndentPix() {
        return this.FFirstIndentPix;
    }

    get LeftIndentPix() {
        return this.FLeftIndentPix;
    }

    get RightIndentPix() {
        return this.FRightIndentPix;
    }

    get BackColor() {
        return this.FBackColor;
    }

    set BackColor(val) {
        this.FBackColor = val;
    }

    get BreakRough() {
        return this.FBreakRough;
    }

    set BreakRough(val) {
        this.FBreakRough = val;
    }

    get AlignHorz() {
        return this.FAlignHorz;
    }

    set AlignHorz(val) {
        this.FAlignHorz = val;
    }

    get AlignVert() {
        return this.FAlignVert;
    }

    set AlignVert(val) {
        this.FAlignVert = val;
    }
}