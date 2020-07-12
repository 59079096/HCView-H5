import { TObject, TList } from "./System.js";

export class TXmlItem extends TObject {
    constructor() {
        super();
        this.Name = "";
        this.InnerText = "";
    }
}

export class TXmlNode extends TXmlItem {
    constructor() {
        super()
        this.Attributes = null;
        this.ChildNodes = null;
    }

    static Create(name, val) {
        let vNode = new TXmlNode();
        vNode.Name = name;
        if (val)
            vNode.InnerText = val;

        return vNode;
    }

    SetAttribute(name, val) {
        if (!this.Attributes)
            this.Attributes = new TList();

        let vAttr = new TXmlItem();
        vAttr.Name = name;
        vAttr.InnerText = val;
        this.Attributes.add(vAttr);
    }

    AppendChild(node) {
        if (!this.ChildNodes)
            this.ChildNodes = new TList();

        this.ChildNodes.add(node);
    }

    ToString() {
        let vS = "<" + this.Name;
        if (this.Attributes && this.Attributes.count > 0) {
            for (let i = 0; i < this.Attributes.count; i++)
                vS += " " + this.Attributes[i].Name + "=\"" + this.Attributes[i].InnerText +"\"";
        }

        vS += ">";
        
        if (this.ChildNodes && this.ChildNodes.count > 0) {
            for (let i = 0; i < this.ChildNodes.count; i++)
                vS += this.ChildNodes[i].ToString();
        } else
            vS += this.InnerText;
            
        vS += "</" + this.Name + ">";

        return vS;
    }
}

export class TXmlDocument extends TXmlNode {
    constructor() {
        super();
        this.Version = "1.0";
        this.Encoding = "UTF-8";
    }

    CreateNode(name, val) {
        return TXmlNode.Create(name, val);
    }

    ToString() {
        let vS = "<?xml version=\"" + this.Version + "\" encoding=\"" + this.Encoding + "\"?>";
        if (this.ChildNodes && this.ChildNodes.count > 0) {
            for (let i = 0; i < this.ChildNodes.count; i++)
                vS += this.ChildNodes[i].ToString();
        }
        return vS;
    }

    get Text() {
        return this.ToString();
    }
}