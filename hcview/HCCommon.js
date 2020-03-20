import { application } from "../hcl/Application.js";
import { TCursors, TKey } from "../hcl/Controls.js";
import { ime } from "../hcl/Ime.js";
import { TEnumSet, TUtf16Encoding, TUInt16, system } from "../hcl/System.js";
import { THCTableCellData } from "./HCTableCellData.js";
import { TColor } from "../hcl/Graphics.js";

export class HC {
    constructor() { }

    static IsKeyPressWant(e) {
        if (HC.UNPLACEHOLDERCHAR)
            return ((e.keyCode >= 32) && (e.keyCode <= 126))
                || ((e.keyCode >= 3840) && (e.keyCode <= 4095))  // 藏文
                || ((e.keyCode >= 6144) && (e.keyCode <= 6319));  // 蒙古文
        else
            return (e.keyCode >= 32) && (e.keyCode <= 126);
    }

    static IsKeyDownWant(key) {
        return ((key == TKey.Back)
            || (key == TKey.Delete)
            || (key == TKey.Left)
            || (key == TKey.Right)
            || (key == TKey.Up)
            || (key == TKey.Down)
            || (key == TKey.Return)
            || (key == TKey.Home)
            || (key == TKey.End)
            || (key == TKey.Tab));
    }

    static IsKeyDownEdit(key) {
        return ((key == TKey.Back)
            || (key == TKey.Delete)
            || (key == TKey.Return)
            || (key == TKey.Tab));
    }

    static IsDirectionKey(key) {
        return ((key == TKey.Left)
            || (key == TKey.Up)
            || (key == TKey.Right)
            || (key == TKey.Down));
    }  
    
    static PosCharHC(char, str)
    {
        let vResult = 0;
        for (let i = 1; i <= str.length; i++) {
            if (char == str[i - 1]) {
                vResult = i;
                return vResult;
            }
        }

        return vResult;
    }

    static IsUnPlaceHolderChar(char) {
        return HC.UnPlaceholderChar.indexOf(char) >= 0;
    }

    static GetTextActualOffset(text, offset, after = false) {
        let vResult = offset;

        let vLen = text.length;
        if (after) {
            while (vResult < vLen) {
                if (HC.UnPlaceholderChar.indexOf(text[vResult + 1 - 1]) >= 0)
                    vResult++;
                else
                    break;
            }
        } else {
            while (vResult > 1) {
                if (HC.UnPlaceholderChar.indexOf(text[vResult - 1]) >= 0)
                    vResult--;
                else
                    break;
            }
        }

        return vResult;
    }

    static GetCharHalfFarfromUN(text, offset, charWArr) {
        let vResult = 0;
        let vEndOffs = HC.GetTextActualOffset(text, offset, true);
        let vBeginOffs = HC.GetTextActualOffset(text, offset) - 1;
        if (vBeginOffs > 0) {
            if (vEndOffs == vBeginOffs) {
                if (vBeginOffs > 1)
                    vResult = charWArr[vBeginOffs - 2] + Math.trunc((charWArr[vEndOffs - 1] - charWArr[vBeginOffs - 2]) / 2);
                else
                    vResult = Math.trunc(charWArr[vBeginOffs - 1] / 2);
            } else
                vResult = charWArr[vBeginOffs - 1] + Math.trunc((charWArr[vEndOffs - 1] - charWArr[vBeginOffs - 1]) / 2);
        } else
            vResult = Math.trunc(charWArr[vEndOffs - 1] / 2);

        return vResult;
    }

    static GetCharHalfFarfrom(offset, charWArr) {
        let Result = 0;

        if (offset > 1)
            Result = charWArr[offset - 2] + Math.trunc((charWArr[offset - 1] - charWArr[offset - 2]) / 2);
        else
        if (offset == 1)
            Result = Math.trunc(charWArr[offset - 1] / 2);

        return Result;
    }

    static GetNorAlignCharOffsetAt(hclCanvas, text, x) {
        let vResult;

        if (x < 0)
            vResult = 0;
        else {
            let vLen = text.length;
            let vCharWArr = hclCanvas.getTextExtentExPoint(text, vLen);

            if (x > vCharWArr[vCharWArr.length - 1])
                vResult = vLen;
            else {
                let i = 1;
                while (i <= vLen)
                {
                    if (HC.UNPLACEHOLDERCHAR)
                        i = HC.GetTextActualOffset(text, i, true);

                    if (x == vCharWArr[i - 1]) {
                        vResult = i;
                        break;
                    } else if (x > vCharWArr[i - 1])
                        i++;
                    else {
                        if (HC.UNPLACEHOLDERCHAR && x > HC.GetCharHalfFarfromUN(text, i, vCharWArr)) {
                            vResult = i;
                        }
                        else if (!HC.UNPLACEHOLDERCHAR && HC.GetCharHalfFarfrom(i, vCharWArr)) {
                            vResult = i;
                        } else {
                            if (HC.UNPLACEHOLDERCHAR)
                                vResult = HC.GetTextActualOffset(text, i) - 1;
                            else
                                vResult = i - 1;
                        }

                        break;
                    }
                }
            }
        }

        return vResult;
    }

    static GetPaperSizeStr(paperSize) {
        let vResult = "";
        switch (paperSize) {
            case GDI.DMPAPER_A3: 
                vResult = "A3";
                break;

            case GDI.DMPAPER_A4: 
                vResult = "A4";
                break;

            case GDI.DMPAPER_A5: 
                vResult = "A5";
                break;

            case GDI.DMPAPER_B5: 
                vResult = "B5";
                break;

            default:
                vResult = "自定义";
                break;
        }

        return vResult;
    }

    static GetVersionAsInteger(version) {
        return version.replace(/[^0-9]/ig,""); 
    }

    static HCSaveTextToStream(stream, s){
        let vBytes = TUtf16Encoding.getBytes(s);
        let vLen = vBytes.length;   
        if (vLen > TUInt16.max)
            system.exception(HC.HCS_EXCEPTION_TEXTOVER);

        stream.writeUInt16(vLen);
        if (vLen > 0)
            stream.writeBuffer(vBytes);
    }

    static HCLoadTextFromStream(stream, fileVersion) {
        let vSize = stream.readUInt16();
        if (vSize > 0) {
            let vBuffer = stream.readBuffer(vSize);
            return TUtf16Encoding.getString(vBuffer);
        } else
            return "";
    }

    static _SaveFileFormatAndVersion(stream) {
        let vBuffer = TUtf16Encoding.getBytes(HC.HC_EXT);
        stream.writeBuffer(vBuffer);

        vBuffer = TUtf16Encoding.getBytes(HC.HC_FileVersion);
        stream.writeBuffer(vBuffer);

        stream.writeByte(HC.HC_PROGRAMLANGUAGE);
    }

    static _LoadFileFormatAndVersion(stream) {
        let vBuffer = stream.readBuffer(TUtf16Encoding.getByteCount(this.HC_EXT));
        let vFileFormat = TUtf16Encoding.getString(vBuffer, 0, vBuffer.length);

        vBuffer = stream.readBuffer(TUtf16Encoding.getByteCount(this.HC_FileVersion));
        let vFileVersion = TUtf16Encoding.getString(vBuffer, 0, vBuffer.length);
        let vVersion = HC.GetVersionAsInteger(vFileVersion);
        let vLang = 0;
        if (vVersion > 19)
            vLang = stream.readByte();

        return {
            fileExt: vFileFormat,
            fileVersion: vVersion,
            lang: vLang
        }
    }

    static HCSaveColorToStream(stream, color) {
        let vRGBA = TColor.getRGBA(color);
        stream.writeByte(vRGBA.a);
        stream.writeByte(vRGBA.r);
        stream.writeByte(vRGBA.g);
        stream.writeByte(vRGBA.b);
    }

    static HCLoadColorFromStream(stream) {
        // to do:不透明时要将argb转换为rgb
        let a = stream.readByte();
        let r = stream.readByte();
        let g = stream.readByte();
        let b = stream.readByte();
        return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
    }

    static GetXmlRGBColor(aColorStr) {
        // string[] vsRGB = aColorStr.Split(new string[] { "," }, StringSplitOptions.None);
        // if (vsRGB.Length > 3)
        // {
        //     if (vsRGB[0] == "0")
        //         return HCTransparentColor;
        //     else
        //         return Color.FromArgb(byte.Parse(vsRGB[1]), byte.Parse(vsRGB[2]), byte.Parse(vsRGB[3]));
        // }
        // else
        //     return Color.FromArgb(byte.Parse(vsRGB[0]), byte.Parse(vsRGB[1]), byte.Parse(vsRGB[2]));
    }

    static GetColorXmlRGB(aColor) {
        // if (aColor == HCTransparentColor)
        //     return "0,255,255,255";
        // else
        //     return string.Format("255,{0},{1},{2}", aColor.R, aColor.G, aColor.B);
    }

    static GetXmlRN(text) {
        //return text.Replace(((Char)10).ToString(), "\r\n");
    }

    static SetBorderSideByPro(aValue, aBorderSides) {
        // aBorderSides.Value = 0;
        // string[] vStrings = aValue.Split(new string[] { "," }, StringSplitOptions.RemoveEmptyEntries);

        // for (int i = 0; i < vStrings.Length; i++)
        // {
        //     if (vStrings[i] == "left")
        //         aBorderSides.InClude((byte)BorderSide.cbsLeft);
        //     else
        //     if (vStrings[i] == "top")
        //         aBorderSides.InClude((byte)BorderSide.cbsTop);
        //     else
        //     if (vStrings[i] == "right")
        //         aBorderSides.InClude((byte)BorderSide.cbsRight);
        //     else
        //     if (vStrings[i] == "bottom")
        //         aBorderSides.InClude((byte)BorderSide.cbsBottom);
        //     else
        //     if (vStrings[i] == "ltrb")
        //         aBorderSides.InClude((byte)BorderSide.cbsLTRB);
        //     else
        //     if (vStrings[i] == "rtlb")
        //         aBorderSides.InClude((byte)BorderSide.cbsRTLB);
        // }
    }

    static GetBorderSidePro(aBorderSides) {
        // string Result = "";
        // if (aBorderSides.Contains((byte)BorderSide.cbsLeft))
        //     Result = "left";

        // if (aBorderSides.Contains((byte)BorderSide.cbsTop))
        // {
        //     if (Result != "")
        //         Result = Result + ",top";
        //     else
        //         Result = "top";
        // }

        // if (aBorderSides.Contains((byte)BorderSide.cbsRight))
        // {
        //     if (Result != "")
        //         Result = Result + ",right";
        //     else
        //         Result = "right";
        // }

        // if (aBorderSides.Contains((byte)BorderSide.cbsBottom))
        // {
        //     if (Result != "")
        //         Result = Result + ",bottom";
        //     else
        //         Result = "bottom";
        // }

        // if (aBorderSides.Contains((byte)BorderSide.cbsLTRB))
        // {
        //     if (Result != "")
        //         Result = Result + ",ltrb";
        //     else
        //         Result = "ltrb";
        // }

        // if (aBorderSides.Contains((byte)BorderSide.cbsRTLB))
        // {
        //     if (Result != "")
        //         Result = Result + ",rtlb";
        //     else
        //         Result = "rtlb";
        // }

        // return Result;
    }

    static GraphicToBase64(aGraphic, imageFormat) {
        // using (MemoryStream vStream = new MemoryStream())
        // {
        //     using (Bitmap bitmap = new Bitmap(aGraphic))  // 解决GDI+ 中发生一般性错误，因为该文件仍保留锁定对于对象的生存期
        //     {
        //         bitmap.Save(vStream, imageFormat);  //  System.Drawing.Imaging.ImageFormat.Bmp
        //     }

        //     byte[] vArr = new byte[vStream.Length];
        //     vStream.Position = 0;
        //     vStream.Read(vArr, 0, (int)vStream.Length);
        //     vStream.Close();
        //     vStream.Dispose();
        //     return Convert.ToBase64String(vArr);
        // }
    }

    static Base64ToGraphic(aBase64) {
        // byte[] vArr = Convert.FromBase64String(aBase64);
        // using (MemoryStream vStream = new MemoryStream(vArr))
        // {
        //     return Image.FromStream(vStream);
        // }
    }

    static GetUnicodeCharType(char) {
        let vCode = char.charCodeAt(0);
        if ((vCode >= 0x2E80) && (vCode <= 0x2EF3)  // 部首扩展 115
            || (vCode >= 0x2F00) && (vCode <= 0x2FD5)  // 熙部首 214
            || (vCode >= 0x2FF0) && (vCode <= 0x2FFB)  // 汉字结构 12
            || (vCode == 0x3007)  // 〇 1
            || (vCode >= 0x3105) && (vCode <= 0x312F)  // 汉字注音 43
            || (vCode >= 0x31A0) && (vCode <= 0x31BA)  // 注音扩展 22
            || (vCode >= 0x31C0) && (vCode <= 0x31E3)  // 汉字笔划 36
            || (vCode >= 0x3400) && (vCode <= 0x4DB5)  // 扩展A 6582个
            || (vCode >= 0x4E00) && (vCode <= 0x9FA5)  // 基本汉字 20902个
            || (vCode >= 0x9FA6) && (vCode <= 0x9FEF)  // 基本汉字补充 74个
            || (vCode >= 0xE400) && (vCode <= 0xE5E8)  // 部件扩展 452
            || (vCode >= 0xE600) && (vCode <= 0xE6CF)  // PUA增补 207
            || (vCode >= 0xE815) && (vCode <= 0xE86F)  // PUA(GBK)部件 81
            || (vCode >= 0xF900) && (vCode <= 0xFAD9)  // 兼容汉字 477
            || (vCode >= 0x20000) && (vCode <= 0x2A6D6)  // 扩展B 42711个
            || (vCode >= 0x2A700) && (vCode <= 0x2B734)  // 扩展C 4149
            || (vCode >= 0x2B740) && (vCode <= 0x2B81D)  // 扩展D 222
            || (vCode >= 0x2B820) && (vCode <= 0x2CEA1)  // 扩展E 5762
            || (vCode >= 0x2CEB0) && (vCode <= 0x2EBE0)  // 扩展F 7473
            || (vCode >= 0x2F800) && (vCode <= 0x2FA1D)  // 兼容扩展 542
            )
            return TCharType.HZ;  // 汉字

        if ((vCode >= 0x0F00) && (vCode <= 0x0FFF))
            return TCharType.HZ;  // 汉字，藏文

        if ((vCode >= 0x1800) && (vCode <= 0x18AF))
            return TCharType.HZ;  // 汉字，蒙古字符

        if (   ((vCode >= 0x21) && (vCode <= 0x2F))  // !"#$%&'()*+,-./
            || ((vCode >= 0x3A) && (vCode <= 0x40))  // :;<=>?@
            || ((vCode >= 0x5B) && (vCode <= 0x60))  // [\]^_`
            || ((vCode >= 0x7B) && (vCode <= 0x7E))  // {|}~      
            || (vCode == 0xFFE0)  // ￠
            )
        {
            return TCharType.FH;
        }

        //0xFF01..0xFF0F,  // ！“＃￥％＆‘（）×＋，－。、

        if ((vCode >= 0x30) && (vCode <= 0x39))
        {
            return TCharType.SZ;  // 0..9
        }

        if (   ((vCode >= 0x41) && (vCode <= 0x5A))  // A..Z
            || ((vCode >= 0x61) && (vCode <= 0x7A))  // a..z               
            )
        {
            return TCharType.ZM;
        }
           
        return TCharType.Break;
    }
}

HC.TableCellData = THCTableCellData;

HC.AnnotationWidth = 200;
HC.HCExtFormat = 0;
HC.OffsetBefor = 0;
HC.OffsetInner = 1;
HC.OffsetAfter = 2;

HC.MinRowHeight = 5;
HC.MinColWidth = 5;

HC.clActiveBorder = "rgb(180, 180, 180)";
HC.clBtnFace = "rgb(240, 240, 240)";
HC.clMedGray = "rgb(160, 160, 164)";
HC.clMenu = "rgb(240, 240, 240)";
HC.clWindow = "rgb(255, 255, 255)";
HC.clHighlight = "rgb(51, 153, 255)";
HC.clInfoBk = "rgb(255, 255, 225)";
HC.AnnotateBKColor = "rgb(255, 213, 213)";
HC.AnnotateBKActiveColor = "rgb(168, 168, 255)";
HC.HyperTextColor = "rgb(5, 99, 193)";
HC.HCTransparentColor = "rgba(255, 255, 255, 0)";

HC.HC_TEXTMAXSIZE = 4294967295;

HC.GCursor = TCursors.Default;

HC.HC_PROGRAMLANGUAGE = 4;  // 1字节表示使用的编程语言 1:delphi, 2:C#, 3:C++, 4:HTML5 JAVA SCRIPT
HC.TabCharWidth = 28;  // 默认Tab宽度(五号) 14 * 2个

HC.DefaultColWidth = 50;
HC.PMSLineHeight = 24;
HC.AnnotationWidth = 200;
HC.DMPAPER_HC_16K = -1000;

HC.HC_EXCEPTION = "HC异常：";
HC.HCS_EXCEPTION_NULLTEXT = HC.HC_EXCEPTION + "文本Item的内容出现为空的情况！";
HC.HCS_EXCEPTION_TEXTOVER = HC.HC_EXCEPTION + "TextItem的内容超出允许的最大字节数4294967295！",
HC.HCS_EXCEPTION_MEMORYLESS = HC.HC_EXCEPTION + "复制时没有申请到足够的内存";
HC.HCS_EXCEPTION_VOIDSOURCECELL = HC.HC_EXCEPTION + "源单元格无法再获取源单元格！";
HC.HCS_EXCEPTION_TIMERRESOURCEOUTOF = HC.HC_EXCEPTION + "安装计时器的资源不足！";

HC.UNPLACEHOLDERCHAR = true;
HC.UnPlaceholderChar = "\u0F74\u0F7A\u0F7C\u0F72"
                + "\u0FB8\u0F7E\u0F83\u0F37\u0F35\u0F7F\u0FB7\u0FBA\u0F95"
                + "\u0F96\u0F7B\u0FB2\u0F9F\u0FB1\u0FAD\u0F80\u0F7D\u0FA5"
                + "\u0FA9\u0FAA\u0FAB\u0FB0\u0FB6\u0FA1\u0FA6\u0F94\u0FA8"
                + "\u0F84\u0F92\u0F92\u0FAE\u0FAF\u0FB4\u0F90\u0F91\u0FA4"
                + "\u0FA3\u0FA0\u0F97\u0F99\u0FBC\u0FBB\u0F19\u0F71\u0F3E"
                + "\u0F3F\u0F87\u0F86\u0F76\u0F77\u0F78\u0F79\u0F73\u0F9A"
                + "\u0F75\u0F73\u0F9C\u0FC6\u0FB5\u0FB9\u0F82\u0F9E\u0F9B";

HC.DontLineFirstChar = "`-=[]\\;,./~!@#$%^&*()_+{}|:\"\"<>?·－＝【】＼；’，。、～！＠＃￥％……＆×（）——＋｛｝｜：”《》？°" + HC.UnPlaceholderChar;
HC.DontLineLastChar = "/\\＼“‘",
HC.sLineBreak = "\r\n",
HC.HC_EXT = ".hcf",
HC.HC_EXT_DOCX = ".docx",
HC.HC_FileVersion = "3.8";
HC.HC_FileVersionInt = 38;
HC.HCExtFormat = 0;

export var TPaperOrientation = {
    Portrait: 0,
    Landscape: 1
}

export var TExpressArea = {
    None: 0, 
    Left: 1, 
    Top: 2, 
    Right: 3, 
    Bottom: 4
}

export var TBorderSide = {
    Left: 1,
    Top: 1 << 1,
    Right: 1 << 2,
    Bottom: 1 << 3,
    LTRB: 1 << 4,
    RTLB: 1 << 5
}

export var TSectionArea = {
    Header: 1, 
    Page: 1 << 1, 
    Footer: 1 << 2
}

export var TBreakPosition = {
    None: 0,
    Prev: 1
}

export var THCContentAlign = {
    TopLeft: 0,
    TopCenter: 1,
    TopRight: 2,
    CenterLeft: 3,
    CenterCenter: 4,
    CenterRight: 5,
    BottomLeft: 6,
    BottomCenter: 7,
    BottomRight: 8
}

export var THCState = {
    Loading: 0,
    Copying: 1,
    Pasting: 2,
    Undoing: 3,
    Redoing: 4,
    BatchInsert: 5,
    Destroying: 6
}

export var TCharType = {
    Break: 0,
    HZ: 1,
    ZM: 2,
    SZ: 3,
    FH: 4
}

export var THCAction = {
    BackDeleteText: 0,
    DeleteText: 1,
    InsertText: 2,
    ReturnItem: 3,
    SetItemText: 4,
    DeleteItem: 5,
    InsertItem: 6,
    ItemProperty: 7,
    ItemSelf: 8,
    ItemMirror: 9,
    ConcatText: 10
}

export var TPaperKind = {
    /**用户自定义纸张大小*/
    Custom: 0,
    /**Letter paper (8.5 in.by 11 in.)*/
    Letter: 1,
    /**Letter small paper (8.5 in.by 11 in.)*/
    LetterSmall: 2,
    /**Tabloid paper (11 in.by 17 in.)*/
    Tabloid: 3,
    /**Ledger paper (17 in.by 11 in.)*/
    Ledger: 4,
    /**Legal paper (8.5 in.by 14 in.)*/
    Legal: 5,
    /**Statement paper (5.5 in.by 8.5 in.)*/
    Statement: 6,
    /**Executive paper (7.25 in.by 10.5 in.)*/
    Executive: 7,
    /**A3 纸（297 毫米 × 420 毫米）*/
    A3: 8,
    /**A4 纸（210 毫米 × 297 毫米）*/
    A4: 9,
    /**A4 small 纸（210 毫米 × 297 毫米）*/
    A4Small: 10,
    /**A5 纸（148 毫米 × 210 毫米）*/
    A5: 11,
    /**B4 纸（250 × 353 毫米）*/
    B4: 12,
    /**B5 纸（176 毫米 × 250 毫米）*/
    B5: 13,
    /**Folio paper (8.5 in.by 13 in.)*/
    Folio: 14,
    /**Quarto 纸（215 毫米 × 275 毫米）*/
    Quarto: 15,
    /**Standard paper (10 in.by 14 in.)*/
    Standard10x14: 16,
    /**Standard paper (11 in.by 17 in.)*/
    Standard11x17: 17,
    /**Note paper (8.5 in.by 11 in.)*/
    Note: 18,
    /**#9 envelope (3.875 in.by 8.875 in.)*/
    Number9Envelope: 19,
    /**#10 envelope (4.125 in.by 9.5 in.)*/
    Number10Envelope: 20,
    /**#11 envelope (4.5 in.by 10.375 in.)*/
    Number11Envelope: 21,
    /**#12 envelope (4.75 in.by 11 in.)*/
    Number12Envelope: 22,
    /**#14 envelope (5 in.by 11.5 in.)*/
    Number14Envelope: 23,
    /**C paper (17 in.by 22 in.)*/
    CSheet: 24,
    /**D paper (22 in.by 34 in.)*/
    DSheet: 25,
    /**E paper (34 in.by 44 in.)*/
    ESheet: 26,
    /**DL 信封（110 毫米 × 220 毫米）*/
    DLEnvelope: 27,
    /**C5 信封（162 毫米 × 229 毫米）*/
    C5Envelope: 28,
    /**C3 信封（324 毫米 × 458 毫米）*/
    C3Envelope: 29,
    /**C4 信封（229 毫米 × 324 毫米）*/
    C4Envelope: 30,
    /**C6 信封（114 毫米 × 162 毫米）*/
    C6Envelope: 31,
    /**C65 信封（114 毫米 × 229 毫米）*/
    C65Envelope: 32,
    /**B4 信封（250 × 353 毫米）*/
    B4Envelope: 33,
    /**B5 信封（176 毫米 × 250 毫米）*/
    B5Envelope: 34,
    /**B6 信封（176 毫米 × 125 毫米）*/
    B6Envelope: 35,
    /**Italy envelope（110 毫米 × 230 毫米）*/
    ItalyEnvelope: 36,
    /**Monarch envelope (3.875 in.by 7.5 in.)*/
    MonarchEnvelope: 37,
    /**6 3/4 envelope (3.625 in.by 6.5 in.)*/
    PersonalEnvelope: 38,
    /**US standard fanfold (14.875 in.by 11 in.)*/
    USStandardFanfold: 39,
    /**German standard fanfold (8.5 in.by 12 in.)*/
    GermanStandardFanfold: 40,
    /**German legal fanfold (8.5 in.by 13 in.)*/
    GermanLegalFanfold: 41,
    /**ISO B4（250 毫米 × 353 毫米）
    IsoB4: 42,
    /**Japanese postcard（100 毫米 × 148 毫米）*/
    JapanesePostcard: 43,
    /**Standard paper (9 in.by 11 in.)*/
    Standard9x11: 44,
    /**Standard paper (10 in.by 11 in.)*/
    Standard10x11: 45,
    /**Standard paper (15 in.by 11 in.)*/
    Standard15x11: 46,
    /**邀请函信封（220 毫米 × 220 毫米）*/
    InviteEnvelope: 47,
    /**Letter extra paper (9.275 in.by 12 in.).该值特定于 PostScript 驱动程序，仅供 Linotronic 打印机使用以节省纸张*/
    LetterExtra: 50,
    /**Legal extra paper (9.275 in.by 15 in.).该值特定于 PostScript 驱动程序，仅供 Linotronic 打印机使用以节省纸张*/
    LegalExtra: 51,
    /**Tabloid extra paper (11.69 in.by 18 in.).该值特定于 PostScript 驱动程序，仅供 Linotronic打印机使用以节省纸张*/
    TabloidExtra: 52,
    /**A4 extra 纸（236 毫米 × 322 毫米）该值是针对 PostScript 驱动程序的，仅供 Linotronic 打印机使用以节省纸张*/
    A4Extra: 53,
    /**Letter transverse paper (8.275 in.by 11 in.)*/
    LetterTransverse: 54,
    /**A4 transverse 纸（210 毫米 × 297 毫米）*/
    A4Transverse: 55,
    /**Letter extra transverse paper (9.275 in.by 12 in.)*/
    LetterExtraTransverse: 56,
    /**SuperA/SuperA/A4 纸（227 毫米 × 356 毫米）*/
    APlus: 57,
    /**SuperB/SuperB/A3 纸（305 毫米 × 487 毫米）*/
    BPlus: 58,
    /**Letter plus paper (8.5 in.by 12.69 in.)*/
    LetterPlus: 59,
    /**A4 plus 纸（210 毫米 × 330 毫米）*/
    A4Plus: 60,
    /**A5 transverse 纸（148 毫米 × 210 毫米）*/
    A5Transverse: 61,
    /**JIS B5 transverse 纸（182 毫米 × 257 毫米）*/
    B5Transverse: 62,
    /**A3 extra 纸（322 毫米 × 445 毫米）*/
    A3Extra: 63,
    /**A5 extra 纸（174 毫米 × 235 毫米）*/
    A5Extra: 64,
    /**ISO B5 extra 纸（201 毫米 × 276 毫米）*/
    B5Extra: 65,
    /**A2 纸（420 毫米 × 594 毫米）*/
    A2: 66,
    /**A3 transverse 纸（297 毫米 × 420 毫米）*/
    A3Transverse: 67,
    /**A3 extra transverse 纸（322 毫米 × 445 毫米）*/
    A3ExtraTransverse: 68,
    /**Japanese double postcard（200 毫米 × 148 毫米）*/
    JapaneseDoublePostcard: 69,
    /**A6 纸（105 毫米 × 148 毫米）*/
    A6: 70,
    /**Japanese Kaku #2 envelope*/
    JapaneseEnvelopeKakuNumber2: 71,
    /**Japanese Kaku #3 envelope*/
    JapaneseEnvelopeKakuNumber3: 72,
    /**Japanese Chou #3 envelope*/
    JapaneseEnvelopeChouNumber3: 73,
    /**Japanese Chou #4 envelope*/
    JapaneseEnvelopeChouNumber4: 74,
    /**Letter rotated paper (11 in.by 8.5 in.)*/
    LetterRotated: 75,
    /**A3 rotated 纸（420 毫米 × 297 毫米）*/
    A3Rotated: 76,
    /**A4 rotated 纸（297 毫米 × 210 毫米）*/
    A4Rotated: 77,
    /**A5 rotated 纸（210 毫米 × 148 毫米）*/
    A5Rotated: 78,
    /**JIS B4 rotated paper (364 mm by 257 mm)*/
    B4JisRotated: 79,
    /**JIS B5 rotated 纸（257 毫米 × 182 毫米）*/
    B5JisRotated: 80,
    /**Japanese rotated postcard（148 毫米 × 100 毫米）*/
    JapanesePostcardRotated: 81,
    /**Japanese rotated double postcard（148 毫米 × 200 毫米）*/
    JapaneseDoublePostcardRotated: 82,
    /**A6 rotated 纸（148 毫米 × 105 毫米）*/
    A6Rotated: 83,
    /**Japanese rotated Kaku #2 envelope*/
    JapaneseEnvelopeKakuNumber2Rotated: 84,
    /**Japanese rotated Kaku #3 envelope*/
    JapaneseEnvelopeKakuNumber3Rotated: 85,
    /**Japanese rotated Chou #3 envelope*/
    JapaneseEnvelopeChouNumber3Rotated: 86,
    /**Japanese rotated Chou #4 envelope*/
    JapaneseEnvelopeChouNumber4Rotated: 87,
    /**JIS B6 纸（128 毫米 × 182 毫米）*/
    B6Jis: 88,
    /**JIS B6 rotated 纸 (182 × 128 毫米)*/
    B6JisRotated: 89,
    /**Standard paper (12 in.by 11 in.)*/
    Standard12x11: 90,
    /**Japanese You #4 envelope*/
    JapaneseEnvelopeYouNumber4: 91,
    /**Japanese You #4 rotated envelope*/
    JapaneseEnvelopeYouNumber4Rotated: 92,
    /**PRC 16K 纸（146 × 215 毫米）*/
    Prc16K: 93,
    /**PRC 32K 纸（97 × 151 毫米）*/
    Prc32K: 94,
    /**PRC 32K(Big) 纸（97 × 151 毫米）*/
    Prc32KBig: 95,
    /**PRC #1 envelope（102 × 165 毫米）*/
    PrcEnvelopeNumber1: 96,
    /**PRC #2 envelope（102 × 176 毫米）*/
    PrcEnvelopeNumber2: 97,
    /**PRC #3 envelope（125 × 176 毫米）*/
    PrcEnvelopeNumber3: 98,
    /**PRC #4 envelope（110 × 208 毫米）*/
    PrcEnvelopeNumber4: 99,
    /**PRC #5 envelope（110 × 220 毫米）*/
    PrcEnvelopeNumber5: 100,
    /**PRC #6 envelope（120 × 230 毫米）*/
    PrcEnvelopeNumber6: 101,
    /**PRC #7 envelope（160 × 230 毫米）*/
    PrcEnvelopeNumber7: 102,
    /**PRC #8 envelope（120 × 309 毫米）*/
    PrcEnvelopeNumber8: 103,
    /**PRC #9 envelope（229 × 324 毫米）*/
    PrcEnvelopeNumber9: 104,
    /**PRC #10 envelope（324 × 458 毫米）*/
    PrcEnvelopeNumber10: 105,
    /**PRC 16K rotated 纸（146 × 215 毫米）*/
    Prc16KRotated: 106,
    /**PRC 32K rotated 纸（97 × 151 毫米）*/
    Prc32KRotated: 107,
    /**PRC 32K rotated 纸（97 × 151 毫米）*/
    Prc32KBigRotated: 108,
    /**PRC #1 rotated envelope（165 × 102 毫米）*/
    PrcEnvelopeNumber1Rotated: 109,
    /**PRC #2 rotated envelope（176 × 102 毫米）*/
    PrcEnvelopeNumber2Rotated: 110,
    /**PRC #3 rotated envelope（176 × 125 毫米）*/
    PrcEnvelopeNumber3Rotated: 111,
    /**PRC #4 rotated envelope（208 × 110 毫米）*/
    PrcEnvelopeNumber4Rotated: 112,
    /**PRC #5 rotated envelope（220 × 110 毫米）*/
    PrcEnvelopeNumber5Rotated: 113,
    /**PRC #6 rotated envelope（230 × 120 毫米）*/
    PrcEnvelopeNumber6Rotated: 114,
    /**PRC #7 rotated envelope（230 × 160 毫米）*/
    PrcEnvelopeNumber7Rotated: 115,
    /**PRC #8 rotated envelope（309 × 120 毫米）*/
    PrcEnvelopeNumber8Rotated: 116,
    /**PRC #9 rotated envelope（229 × 324 毫米）*/
    PrcEnvelopeNumber9Rotated: 117,
    /**PRC #10 rotated envelope（458 × 324 毫米）*/
    PrcEnvelopeNumber10Rotated: 118
}

// export var TPaperSize = {
//     psCustom: 0, ps4A0: 1, ps2A0: 2, psA0: 3, psA1: 4, psA2: 5,
//     psA3: 6, psA4: 7, psA5: 8, psA6: 9, psA7: 10, psA8: 11,
//     psA9: 12, psA10: 13, psB0: 14, psB1: 15, psB2: 16, psB3: 17,
//     psB4: 18, psB5: 19, psB6: 20, psB7: 21, psB8: 22, psB9: 23,
//     psB10: 24, psC0: 25, psC1: 26, psC2: 27, psC3: 28, psC4: 29,
//     psC5: 30, psC6: 31, psC7: 32, psC8: 33, psC9: 34, psC10: 35,
//     psLetter: 36, psLegal: 37, psLedger: 38, psTabloid: 39,
//     psStatement: 40, psQuarto: 41, psFoolscap: 42, psFolio: 43,
//     psExecutive: 44, psMonarch: 45, psGovernmentLetter: 46,
//     psPost: 47, psCrown: 48, psLargePost: 49, psDemy: 50,
//     psMedium: 51, psRoyal: 52, psElephant: 53, psDoubleDemy: 54,
//     psQuadDemy: 55, psIndexCard3_5: 56, psIndexCard4_6: 57,
//     psIndexCard5_8: 58, psInternationalBusinessCard: 59,
//     psUSBusinessCard: 60, psEmperor: 61, psAntiquarian: 62,
//     psGrandEagle: 63, psDoubleElephant: 64, psAtlas: 65,
//     psColombier: 66, psImperial: 67, psDoubleLargePost: 68,
//     psPrincess: 69, psCartridge: 70, psSheet: 71, psHalfPost: 72,
//     psDoublePost: 73, psSuperRoyal: 74, psCopyDraught: 75,
//     psPinchedPost: 76, psSmallFoolscap: 77, psBrief: 78, psPott: 79,
//     psPA0: 80, psPA1: 81, psPA2: 82, psPA3: 83, psPA4: 84, psPA5: 85,
//     psPA6: 86, psPA7: 87, psPA8: 88, psPA9: 89, psPA10: 90, psF4: 91,
//     psA0a: 92, psJISB0: 93, psJISB1: 94, psJISB2: 95, psJISB3: 96,
//     psJISB4: 97, psJISB5: 98, psJISB6: 99, psJISB7: 100, psJISB8: 101,
//     psJISB9: 102, psJISB10: 103, psJISB11: 104, psJISB12: 105,
//     psANSI_A: 106, psANSI_B: 107, psANSI_C: 108, psANSI_D: 109,
//     psANSI_E: 110, psArch_A: 111, psArch_B: 112, psArch_C: 113,
//     psArch_D: 114, psArch_E: 115, psArch_E1: 116,
//     ps16K: 117, ps32K: 118
// }

export var TMarkType = {
    Beg: 0, 
    End: 1
}

export class THCBorderSides extends TEnumSet { constructor() { super(); } }

export class THCCaretInfo {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.height = 20;
        this.pageIndex = 0;
        this.visible = false;
    }
}

export class THCCaret {
    constructor(control) {
        this.FReCreate = false;
        this.FDisFocus = false;
        this.VScroll = false;
        this.HScroll = false;
        this.control = control;
        this.FWidth = 2;
        this.FHeight = 20;
        this.FX = 0;
        this.FY = 0;
    }

    setX_(val) {
        if (this.FX != val) {
            this.FX = val;
            this.show();
        }
    }

    setY_(val) {
        if (this.FY != val) {
            this.FY = val;
            this.show();
        }
    }

    setHeight_(val) {
        if (this.FHeight != val) {
            this.FHeight = val;
            this.FReCreate = true;
        }
    }

    setWidth_(val) {
        if (this.FWidth != val) {
            this.FWidth = val;
            this.FReCreate = true;
        }
    }

    reCreate() {
        application.destroyCaret(this.control);
        application.createCaret(this.control, null, this.FWidth, this.FHeight);
    }

    showAt(x, y) {
        this.FDisFocus = false;
        if (this.FReCreate)
            this.reCreate();

        ime.updatePosition(x, y);
        application.setCaretPos(x, y);
        application.showCaret(this.control);
    }

    show() {
        this.showAt(this.FX, this.FY);
    }

    hide(disFocus = false) {
        this.FDisFocus = disFocus;
        application.hideCaret(this.control);
    }

    get height() {
        return this.FHeight;
    }

    set height(val) {
        this.setHeight_(val);
    }

    get width() {
        return this.FWidth;
    }

    set width(val) {
        this.setWidth_(val);
    }

    get x() {
        return this.FX;
    }

    set x(val) {
        this.setX_(val);
    }

    get y() {
        return this.FY;
    }

    set y(val) {
        this.setY_(val);
    }

    get disFocus() {
        return this.FDisFocus;
    }
}