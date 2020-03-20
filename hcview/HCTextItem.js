import { TUtf16Encoding, system } from "../hcl/System.js";
import { HC } from "./HCCommon.js";
import { THCCustomItem } from "./HCItem.js";

export class THCTextItem extends THCCustomItem {
    constructor(text) {
        super();
        this.FText = text;
        this.FHyperLink = "";
    }

    GetText() {
        return this.FText;
    }

    SetText(val) {
        this.FText = val.replace(HC.sLineBreak, "");
    }

    GetHyperLink() {
        return this.FHyperLink;
    }

    SetHyperLink(val) {
        this.FHyperLink = val;
    }

    GetLength() {
        return this.FText.length;
    }

    Assign(source) {
        super.Assign(source);
        this.FText = source.Text;
        this.FHyperLink = source.HyperLink;
    }

    BreakByOffset(offset) {
        let vResult = null;
        if ((offset >= this.length) || (offset <= 0)) {
            //
        } else {
            vResult = super.BreakByOffset(offset);
            vResult.Text = this.SubString(offset + 1, this.length - offset);
            this.FText = this.FText.substr(0, offset);
        }

        return vResult;
    }

    CanConcatItems(item)
    {
        let vResult = super.CanConcatItems(item);
        if (vResult)
            vResult = this.FHyperLink == item.HyperLink;

        return vResult;
    }

    SaveToStreamRange(stream, start, end) {
        super.SaveToStreamRange(stream, start, end);
        let vS = this.SubString(start + 1, end - start);
    
        let vBuffer = TUtf16Encoding.getBytes(vS);
        let vDSize = vBuffer.length;

        if (vDSize > HC.HC_TEXTMAXSIZE)
            system.exception(HC.HCS_EXCEPTION_TEXTOVER);

        stream.writeUInt32(vDSize);
        
        if (vDSize > 0)
            stream.writeBuffer(vBuffer);

        HC.HCSaveTextToStream(stream, this.FHyperLink);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        let vDSize = stream.readUInt32();
        if (vDSize > 0) {
            let vBuffer = stream.readBuffer(vDSize);
            this.FText = TUtf16Encoding.getString(vBuffer);
        }

        if (fileVersion > 34)
            this.FHyperLink = HC.HCLoadTextFromStream(stream, fileVersion);
        else
            this.FHyperLink = "";
    }

    ToHtml(aPath) {
        //return "<a class=\"fs" + StyleNo.ToString() + "\">" + Text + "</a>";
    }

    ToXml(aNode) {
        // super.ToXml(aNode);
        // aNode.SetAttribute("link", FHyperLink);
        // aNode.InnerText = Text;
    }

    ParseXml(aNode) {
        // super.ParseXml(aNode);
        // FHyperLink = aNode.Attributes["link"].Value;
        // FText = aNode.InnerText;
    }

    SubString(startOffs, length) {
        return this.FText.substr(startOffs - 1, length);
    }
}

THCTextItem.HCDefaultTextItemClass = THCTextItem;