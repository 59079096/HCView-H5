import { TList } from "../hcl/System.js";
import { THCTableCell } from "./HCTableCell.js";

export class THCTableRow extends TList {
    constructor(style, colCount) {
        super();
        this.FHeight = 10;
        this.FFmtOffset = 0;
        this.FAutoHeight = true;

        for (let i = 0; i < colCount; i++)
            this.add(new THCTableCell(style));
    }

    SetRowWidth(width) {
        let vWidth = Math.trunc(width / this.count);
        for (let i = 0; i <= this.count - 2; i++)
            this[i].Width = vWidth;

        this.last.Width = width - (this.count - 1) * vWidth;
    }

    SetHeight(val) {
        if (this.FHeight != val) {
            let vMaxDataHeight = 0;
            for (let i = 0, vLen = this.count; i < vLen; i++) {
                if ((this[i].CellData != null) && (this[i].RowSpan == 0)) {
                    if (this[i].CellData.height > vMaxDataHeight)
                        vMaxDataHeight = this[i].CellData.height;
                }
            }

            if (vMaxDataHeight < val)
                this.FHeight = val;
            else
                this.FHeight = vMaxDataHeight;
            
            for (let i = 0, vLen = this.count; i <vLen; i++)
                this[i].Height = this.FHeight;
        }
    }

    ToXml(aNode) {
        // aNode.SetAttribute("autoheight", FAutoHeight.ToString());
        // aNode.SetAttribute("height", FHeight.ToString());
        // for (int i = 0; i <= this.Count - 1; i++) {
        //     XmlElement vNode = aNode.OwnerDocument.CreateElement("cell");
        //     this[i].ToXml(vNode);
        //     aNode.AppendChild(vNode);
        // }
    }

    ParseXml(aNode) {
        // FAutoHeight = bool.Parse(aNode.Attributes["autoheight"].Value);
        // FHeight = int.Parse(aNode.Attributes["height"].Value);
        // for (int i = 0; i <= aNode.ChildNodes.Count - 1; i++)
        //     this[i].ParseXml(aNode.ChildNodes[i] as XmlElement);
    }

    get ColCount() {
        return this.count;
    }

    get Height() {
        return this.FHeight;
    }

    set Height(val) {
        this.SetHeight(val);
    }

    get AutoHeight() {
        return this.FAutoHeight;
    }

    set AutoHeight(val) {
        this.FAutoHeight = val;
    }

    get FmtOffset() {
        return this.FFmtOffset;
    }

    set FmtOffset(val) {
        this.FFmtOffset = val;
    }    
}