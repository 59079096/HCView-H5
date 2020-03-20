import { THCCanvas } from "../hcl/Graphics.js";
import { TList, TObject } from "../hcl/System.js";
import { THCState } from "./HCCommon.js";
import { THCParaStyle } from "./HCParaStyle.js";
import { THCTextStyle } from "./HCTextStyle.js";

class TUpdateInfo {
    constructor() {
        this.rePaint = false;
        this.reCaret = false;
        this.reStyle = false;
        this.reScroll = false;
        this.selecting = false;
        this.draging = false;
    }
}

class THCStateDictionary {
    constructor() {
        this.state = THCState.Loading;
        this.count = 0;
    }
}

class THCStates {
    constructor() {
        this.FStates = new TList();
    }

    _deleteState(index) {
        this.FStates.delete(index);
    }

    _getStateIndex(state) {
        for (let i = 0; i < this.FStates.count; i++) {
            if (this.FStates[i].state === state)
                return i;
        }

        return -1;
    }

    include(state) {
        let vIndex = this._getStateIndex(state);
        if (vIndex >= 0)
            this.FStates[vIndex].count++;
        else {
            let vStateDic = new THCStateDictionary();
            vStateDic.state = state;
            vStateDic.count = 1;
            this.FStates.add(vStateDic);
        }
    }

    exclude(state)
    {
        let vIndex = this._getStateIndex(state);
        if (vIndex >= 0) {
            if (this.FStates[vIndex].count > 1)
                this.FStates[vIndex].count--;
            else
                this._deleteState(vIndex);
        }
    }

    contain(state) {
        return this._getStateIndex(state) >= 0;
    }
}

export class THCStyle extends TObject {
    constructor(defTextStyle = false, defParaStyle = false) {
        super();
        this.FTempCanvas = this.createStyleCanvas();
        this.FTempStyleNo = THCStyle.Null;
        this.FBackgroundColor = "#ffffff";
        this.FSelColor = "#a6caf0";
        this.FLineSpaceMin = 8;
        this.FShowParaLastMark = true;
        this.FFormatVersion = 1;
        this.FStates = new THCStates();
        this.FUpdateInfo = new TUpdateInfo();
        this.FDefaultTextStyle = new THCTextStyle();
        this.FTextStyles = new TList();
        this.FParaStyles = new TList();

        if (defTextStyle)
            this.newDefaultTextStyle();

        if (defParaStyle)
            this.newDefaultParaStyle();

        this.FOnInvalidateRect = null;
    }

    initialize() {
        this.FTextStyles.removeRange(1, this.FTextStyles.count - 1);
        this.FParaStyles.removeRange(1, this.FParaStyles.count - 1);
    }

    updateInfoRePaint() {
        this.FUpdateInfo.rePaint = true;
    }

    updateInfoReStyle() {
        this.FUpdateInfo.reStyle = true;
    }

    updateInfoReScroll() {
        this.FUpdateInfo.reScroll = true;
    }

    updateInfoReCaret(caretStyle = true) {
        this.FUpdateInfo.reCaret = true;
        this.FUpdateInfo.reStyle = caretStyle;
    }

    addTextStyle(textStyle) {
        this.FTextStyles.add(textStyle);
        return this.FTextStyles.count - 1;
    }

    createStyleCanvas() {
        let vH5Canvas = document.createElement("canvas");
        let vContext = vH5Canvas.getContext("2d");
        return new THCCanvas(vContext);
    }

    destroyStyleCanvas(hclCanvas) {
        hclCanvas.h5context.canvas = null;
    }

    newDefaultTextStyle() {
        let vTextStyle = new THCTextStyle();
        this.FTextStyles.add(vTextStyle);
        return this.FTextStyles.count - 1;
    }

    newDefaultParaStyle() {
        let vParaStyle = new THCParaStyle();
        this.FParaStyles.add(vParaStyle);
        return this.FParaStyles.count - 1;
    }

    GetStyleNo(textStyle, createIfNull) {
        let vResult = -1;
        for (let i = 0; i <= this.FTextStyles.count - 1; i++) {
            if (this.FTextStyles[i].EqualsEx(textStyle)) {
                vResult = i;
                return vResult;
            }
        }

        if (createIfNull && (vResult < 0)) {
            let vTextStyle = new THCTextStyle();
            vTextStyle.AssignEx(textStyle);
            this.FTextStyles.add(vTextStyle);
            vResult = this.FTextStyles.count - 1;
        }

        return vResult;
    }

    GetParaNo(paraStyle, createIfNull) {
        let vResult = -1;
        for (let i = 0; i <= this.FParaStyles.count - 1; i++) {
            if (this.FParaStyles[i].EqualsEx(paraStyle)) {
                vResult = i;
                return vResult;
            }
        }

        if (createIfNull && (vResult < 0)) {
            let vParaStyle = new THCParaStyle();
            vParaStyle.AssignEx(paraStyle);
            this.FParaStyles.add(vParaStyle);
            vResult = this.FParaStyles.count - 1;
        }

        return vResult;
    }

    ApplyTempStyle(val, scale = 1) {
        if (this.FTempStyleNo != val) {
            this.FTempStyleNo = val;
            if (val > THCStyle.Null)
                this.FTextStyles[val].ApplyStyle(this.FTempCanvas, scale);
        }
    }

    SaveParaStyles(stream) {
        let vCount = this.FParaStyles.count;
        stream.writeInt32(vCount);
        for (let i = 0; i <= this.FParaStyles.count - 1; i++)
            this.FParaStyles[i].SaveToStream(stream);
    }

    SaveTextStyles(stream) {
        let vCount = this.TextStyles.count;
        stream.writeInt32(vCount);
        for (let i = 0; i <= this.FTextStyles.count - 1; i++)
            this.FTextStyles[i].SaveToStream(stream);
    }

    SaveToStream(stream) {
        let vBegPos = stream.position;
        stream.writeUInt64(vBegPos);

        stream.writeByte(this.FFormatVersion);
        this.SaveParaStyles(stream);
        this.SaveTextStyles(stream);

        let vEndPos = stream.position;
        stream.position = vBegPos;
        vBegPos = vEndPos - vBegPos - 8;

        stream.writeUInt64(vBegPos);
        stream.position = vEndPos;
    }

    LoadParaStyles(stream, fileVersion) {
        this.FParaStyles.clear();
        let vStyleCount = stream.readInt32();
        for (let i = 0; i <= vStyleCount - 1; i++)
            this.FParaStyles[this.newDefaultParaStyle()].LoadFromStream(stream, fileVersion);
    }

    LoadTextStyles(stream, fileVersion) {
        this.FTextStyles.clear();
        let vStyleCount = stream.readInt32();

        for (let i = 0; i <= vStyleCount - 1; i++)
            this.FTextStyles[this.newDefaultTextStyle()].LoadFromStream(stream, fileVersion);
    }

    LoadFromStream(stream, fileVersion) {
        let vDataSize = stream.readInt64();
        if (fileVersion > 33)
            this.FFormatVersion = stream.readByte();
        else
            this.FFormatVersion = 1;

        this.LoadParaStyles(stream, fileVersion);
        this.LoadTextStyles(stream, fileVersion);
    }

    GetHtmlFileTempName(reset = false) {
        if (reset)
            this.FHtmlFileTempName = 0;
        else
            this.FHtmlFileTempName++;

        return this.FHtmlFileTempName.ToString();
    }

    ToCSS() {
        // let vResult = "<style type=\"text/css\">";
        // for (int i = 0; i <= FTextStyles.count - 1; i++) {
        //     vResult = vResult + HC.sLineBreak + "a.fs" + i.ToString() + " {";
        //     vResult = vResult + FTextStyles[i].ToCSS() + " }"; 
        // }

        // for (int i = 0; i <= FParaStyles.count - 1; i++) {
        //     vResult = vResult + HC.sLineBreak + "p.ps" + i.ToString() + " {";
        //     vResult = vResult + FParaStyles[i].ToCSS() + " }";
        // }

        // return vResult + HC.sLineBreak + "</style>";
    }

    ToXml(aNode) {
        // aNode.SetAttribute("fscount", FTextStyles.count.ToString());
        // aNode.SetAttribute("pscount", FParaStyles.count.ToString());

        // XmlElement vNode = aNode.OwnerDocument.CreateElement("textstyles");
        // for (int i = 0; i <= FTextStyles.count - 1; i++)
        // {
        //     XmlElement vStyleNode = vNode.OwnerDocument.CreateElement("ts");
        //     FTextStyles[i].ToXml(vStyleNode);
        //     vNode.AppendChild(vStyleNode);
        // }
        // aNode.AppendChild(vNode);

        // vNode = aNode.OwnerDocument.CreateElement("parastyles");
        // for (int i = 0; i <= FParaStyles.count - 1; i++)
        // {
        //     XmlElement vParaNode = vNode.OwnerDocument.CreateElement("ps");
        //     FParaStyles[i].ToXml(vParaNode);
        //     vNode.AppendChild(vParaNode);
        // }
        // aNode.AppendChild(vNode);
    }

    ParseXml(aNode) {
        // for (int i = 0; i <= aNode.ChildNodes.count - 1; i++)
        // {
        //     if (aNode.ChildNodes[i].Name == "textstyles")
        //     {
        //         FTextStyles.Clear();
        //         XmlElement vNode = aNode.ChildNodes[i] as XmlElement;
        //         for (int j = 0; j <= vNode.ChildNodes.count - 1; j++)
        //             FTextStyles[this.newDefaultTextStyle()].ParseXml(vNode.ChildNodes[j] as XmlElement);
        //     }
        //     else
        //     if (aNode.ChildNodes[i].Name == "parastyles")
        //     {
        //         FParaStyles.Clear();
        //         XmlElement vNode = aNode.ChildNodes[i] as XmlElement;
        //         for (int j = 0; j <= vNode.ChildNodes.count - 1; j++)
        //             FParaStyles[this.newDefaultParaStyle()].ParseXml(vNode.ChildNodes[j] as XmlElement);
        //     }
        // }
    }

    InvalidateRect(rect) {
        if (this.FOnInvalidateRect != null)
            this.FOnInvalidateRect(rect);
    }

    get DefaultTextStyle() {
        return this.FDefaultTextStyle;
    }

    get TextStyles() {
        return this.FTextStyles;
    }

    set TextStyle(val) {
        this.FTextStyles = val;
    }

    get ParaStyles() {
        return this.FParaStyles;
    }

    set ParaStyles(val) {
        this.FParaStyles = val;
    }

    get BackgroundColor() {
        return this.FBackgroundColor;
    }
    
    set BackgroundColor(val) {
        this.FBackgroundColor = val;
    }

    get SelColor() {
        return this.FSelColor;
    }

    set SelColor(val) {
        this.FSelColor = val;
    }

    get LineSpaceMin() {
        return this.FLineSpaceMin;
    }

    set LineSpaceMin(val) {
        this.FLineSpaceMin = val;
    }

    get TempStyleNo() {
        return this.FTempStyleNo;
    }

    get TempCanvas() {
        return this.FTempCanvas;
    }

    get updateInfo() {
        return this.FUpdateInfo;
    }

    get ShowParaLastMark() {
        return this.FShowParaLastMark;
    }

    set ShowParaLastMark(val) {
        this.SetShowParaLastMark(val);
    }

    get States() {
        return this.FStates;
    }

    get FormatVersion() {
        return this.FFormatVersion;
    }

    get onInvalidateRect() {
        return this.FOnInvalidateRect;
    }

    set onInvalidateRect(val) {
        this.FOnInvalidateRect = val;
    }
}

THCStyle.Null = -1,
THCStyle.Image = -2,
THCStyle.Table = -3,
THCStyle.Tab = -4,
THCStyle.Line = -5,
THCStyle.Express = -6,
THCStyle.Vector = -7,
THCStyle.Domain = -8,
THCStyle.PageBreak = -9,
THCStyle.CheckBox = -10,
THCStyle.Gif = -11,
THCStyle.Control = -12,
THCStyle.Edit = -13,
THCStyle.Combobox = -14,
THCStyle.QRCode = -15,
THCStyle.BarCode = -16,
THCStyle.Fraction = -17,
THCStyle.DateTimePicker = -18,
THCStyle.RadioGroup = -19,
THCStyle.SupSubScript = -20,
THCStyle.FloatLine = -101,
THCStyle.FloatBarCode = -102,
THCStyle.Custom = -1000;