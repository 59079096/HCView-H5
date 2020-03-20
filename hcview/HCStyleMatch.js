import { system, TObject } from "../hcl/System.js";
import { THCParaStyle, TParaAlignHorz, TParaAlignVert, TParaLineSpaceMode } from "./HCParaStyle.js";
import { THCFontStyle, THCTextStyle } from "./HCTextStyle.js";

export class THCStyleMatch extends TObject {
    constructor() {
        super();
        if (this.constructor.prototype === THCStyleMatch.prototype)
            system.exception("THCStyleMatch类为抽象类，不可直接实例使用！");

        if (typeof this.DoMatchCur !== "function")
            system.exception(this.prototype + " 没有实现DoMatchCur方法！");

        if (typeof this.DoMatchNew !== "function")
            system.exception(this.prototype + " 没有实现DoMatchNew方法！");

        this.FAppend = false;
        this.FLock = false;
        this.FOnTextStyle = null;
    }

    SetAppend(val) {
        if ((this.FAppend != val) && (!this.FLock))
            this.FAppend = val;
            
        this.FLock = true;
    }

    GetMatchStyleNo(style, curStyleNo) {
        if (this.DoMatchCur(style.TextStyles[curStyleNo]))
            return curStyleNo;

        let vTextStyle = new THCTextStyle();
        vTextStyle.AssignEx(style.TextStyles[curStyleNo]);
        this.DoMatchNew(vTextStyle);
        if (this.FOnTextStyle != null)
            this.FOnTextStyle(curStyleNo, vTextStyle);

        return style.GetStyleNo(vTextStyle, true);
    }

    StyleHasMatch(style, curStyleNo) {
        return false;
    }

    get Append() {
        return this.FAppend;
    }

    set Append(val) {
        this.SetAppend(val);
    }

    get OnTextStyle() {
        return this.FOnTextStyle;
    }

    set OnTextStyle(val) {
        this.FOnTextStyle = val;
    }
}

export class TTextStyleMatch extends THCStyleMatch {
    constructor() {
        super();
        this.FontStyle = 0;
    }

    DoMatchCur(textStyle) {
        return this.Append && textStyle.FontStyles.has(this.FontStyle);
    }

    DoMatchNew(textStyle) {
        if (this.Append) {
            if (this.FontStyle == THCFontStyle.Superscript)
                textStyle.FontStyles.remove(THCFontStyle.Subscript);
            else if (this.FontStyle == THCFontStyle.Subscript)
                textStyle.FontStyles.remove(THCFontStyle.Superscript);

            textStyle.FontStyles.add(this.FontStyle);
        } else
            textStyle.FontStyles.remove(this.FontStyle);
    }

    StyleHasMatch(style, curStyleNo) {
        return style.TextStyles[curStyleNo].FontStyles.has(this.FontStyle);
    }
}

export class TFontNameStyleMatch extends THCStyleMatch {
    constructor() {
        super();
        this.FontName = "";
    }

    DoMatchCur(textStyle) {
        return textStyle.Family == this.FontName;
    }

    DoMatchNew(textStyle) {
        textStyle.Family = this.FontName;
    }
}

export class TFontSizeStyleMatch extends THCStyleMatch {
    constructor() {
        super();
        this.FontSize = 10;
    }

    DoMatchCur(textStyle) {
        return textStyle.Size == this.FontSize;
    }

    DoMatchNew(textStyle) {
        textStyle.Size = this.FontSize;
    }
}

export class TColorStyleMatch extends THCStyleMatch {
    constructor() {
        super();
        this.Color = "black";
    }

    DoMatchCur(aTextStyle) {
        return aTextStyle.Color == this.Color;
    }

    DoMatchNew(aTextStyle) {
        aTextStyle.Color = this.Color;
    }
}

export class TBackColorStyleMatch extends THCStyleMatch {
    constructor() {
        super();
        this.Color = "white";
    }

    DoMatchCur(textStyle) {
        return textStyle.BackColor == this.Color;
    }

    DoMatchNew(textStyle) {
        textStyle.BackColor = this.Color;
    }
}

export class THCParaMatch extends TObject {
    constructor() {
        super();
        if (this.constructor.prototype === THCStyleMatch.prototype)
            system.exception("THCParaMatch类为抽象类，不可直接实例使用！");

        if (typeof this.DoMatchCurPara !== "function")
            system.exception(this.prototype + " 没有实现DoMatchCurPara方法！");

        if (typeof this.DoMatchNewPara !== "function")
            system.exception(this.prototype + " 没有实现DoMatchNewPara方法！");
    }

    GetMatchParaNo(style, curParaNo) {
        if (this.DoMatchCurPara(style.ParaStyles[curParaNo]))
            return curParaNo;

        let vParaStyle = new THCParaStyle();
        vParaStyle.AssignEx(style.ParaStyles[curParaNo]);
        this.DoMatchNewPara(vParaStyle);
        return style.GetParaNo(vParaStyle, true);
    }
}

export class TParaAlignHorzMatch extends THCParaMatch {
    constructor() {
        super();
        this.Align = TParaAlignHorz.Left;
    }

    DoMatchCurPara(paraStyle) {
        return paraStyle.AlignHorz == this.Align;
    }

    DoMatchNewPara(paraStyle) {
        paraStyle.AlignHorz = this.Align;
    }
}

export class TParaAlignVertMatch extends THCParaMatch {
    constructor() {
        super();
        this.Align = TParaAlignVert.Center;
    }

    DoMatchCurPara(paraStyle) {
        return paraStyle.AlignVert == this.Align;
    }

    DoMatchNewPara(paraStyle) {
        paraStyle.AlignVert = this.Align;
    }
}

export class TParaLineSpaceMatch extends THCParaMatch {
    constructor() {
        super();
        this.SpaceMode = TParaLineSpaceMode.PLS100;
        this.Space = 1;
    }

    DoMatchCurPara(paraStyle) {
        let vResult = this.SpaceMode == paraStyle.LineSpaceMode;
        if (vResult) {
            if (this.SpaceMode == TParaLineSpaceMode.Fix)
                return this.Space == paraStyle.LineSpace;
            else
            if (this.SpaceMode == TParaLineSpaceMode.Mult)
                return this.Space == paraStyle.LineSpace;
            else
                return true;
        }

        return false;
    }

    DoMatchNewPara(paraStyle) {
        paraStyle.LineSpaceMode = this.SpaceMode;
        paraStyle.LineSpace = this.Space;
    }
}

export class TParaBackColorMatch extends THCParaMatch {
    constructor() {
        super();
        this.BackColor = "white";
    }

    DoMatchCurPara(paraStyle) {
        return paraStyle.BackColor == this.BackColor;
    }

    DoMatchNewPara(paraStyle) {
        paraStyle.BackColor = this.BackColor;
    }
}

export class TParaBreakRoughMatch extends THCParaMatch {
    constructor() {
        super();
        this.BreakRough = false;
    }
    
    DoMatchCurPara(paraStyle) {
        return paraStyle.BreakRough == this.BreakRough;
    }

    DoMatchNewPara(paraStyle) {
        paraStyle.BreakRough = this.BreakRough;
    }
}

export class TParaFirstIndentMatch extends THCParaMatch {
    constructor() {
        super();
        this.Indent = 0;
    }

    DoMatchCurPara(paraStyle) {
        return paraStyle.FirstIndent == this.Indent;
    }

    DoMatchNewPara(paraStyle) {
        paraStyle.FirstIndent = this.Indent;
    }
}

export class TParaLeftIndentMatch extends THCParaMatch {
    constructor() {
        super();
        this.Indent = 0;
    }

    DoMatchCurPara(paraStyle) {
        return paraStyle.LeftIndent == this.Indent;
    }

    DoMatchNewPara(paraStyle) {
        paraStyle.LeftIndent = this.Indent;
    }
}

export class TParaRightIndentMatch extends THCParaMatch {
    constructor() {
        super();
        this.Indent = 0;
    }

    DoMatchCurPara(paraStyle) {
        return paraStyle.RightIndent == this.Indent;
    }

    DoMatchNewPara(paraStyle) {
        paraStyle.RightIndent = this.Indent;
    }
}