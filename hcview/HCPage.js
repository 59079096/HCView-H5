import { TList } from "../hcl/System.js";
import { THCUnitConversion } from "./HCUnitConversion.js";
import { TPaperKind } from "./HCCommon.js";

export class THCPaper {
    constructor() {
        this.FSize = TPaperKind.A4;
        this.FWidth = 0;
        this.FHeight = 0;
        this.FWidthPix = 0;
        this.FHeightPix = 0;
        this.FMarginTop = 0;
        this.FMarginLeft = 0;
        this.FMarginRight = 0;
        this.FMarginBottom = 0;
        this.FMarginTopPix = 0;
        this.FMarginLeftPix = 0;
        this.FMarginRightPix = 0;
        this.FMarginBottomPix = 0;

        this.marginLeft = 25;
        this.marginTop = 25;
        this.marginRight = 20;
        this.marginBottom = 20;
        this.size = TPaperKind.A4;
        this.width = 210;
        this.height = 297;
    }

    setSize_(val) {
        if (this.FSize != val)
            this.FSize = val;
    }

    setWidth_(val) {
        this.FWidth = val;
        this.FWidthPix = THCUnitConversion.millimeterToPixX(this.FWidth);
    }

    setHeight_(val) {
        this.FHeight = val;
        this.FHeightPix = THCUnitConversion.millimeterToPixY(this.FHeight);
    }

    setMarginTop_(val) {
        this.FMarginTop = val;
        this.FMarginTopPix = THCUnitConversion.millimeterToPixY(this.FMarginTop);
    }

    setMarginLeft_(val) {
        this.FMarginLeft = val;
        this.FMarginLeftPix = THCUnitConversion.millimeterToPixX(this.FMarginLeft);
    }

    setMarginRight_(val) {
        this.FMarginRight = val;
        this.FMarginRightPix = THCUnitConversion.millimeterToPixX(this.FMarginRight);
    }

    setMarginBottom_(val) {
        this.FMarginBottom = val;
        this.FMarginBottomPix = THCUnitConversion.millimeterToPixY(this.FMarginBottom);
    }

    saveToStream(stream) {
        let vBegPos = stream.position;
        stream.writeUInt64(vBegPos);
        stream.writeInt32(this.FSize);
        stream.writeSingle(this.FWidth);
        stream.writeSingle(this.FHeight);
        stream.writeSingle(this.FMarginLeft);
        stream.writeSingle(this.FMarginTop);
        stream.writeSingle(this.FMarginRight);
        stream.writeSingle(this.FMarginBottom);

        let vEndPos = stream.position;
        stream.position = vBegPos;
        vBegPos = vEndPos - vBegPos - 8;

        stream.writeUInt64(vBegPos);
        stream.position = vEndPos;
    }

    loadFromStream(stream, fileVersion) {
        let vDataSize = stream.readInt64();
        this.size = stream.readInt32();
        this.width = stream.readSingle();
        this.height = stream.readSingle();
        this.marginLeft = stream.readSingle();
        this.marginTop = stream.readSingle();
        this.marginRight = stream.readSingle();
        this.marginBottom = stream.readSingle();
    }

    get size() {
        return this.FSize;
    }

    set size(val) {
        this.setSize_(val);
    }

    get width() {
        return this.FWidth;
    }

    set width(val) {
        this.setWidth_(val);
    }

    get height() {
        return this.FHeight;
    }

    set height(val) {
        this.setHeight_(val);
    }

    get marginTop() {
        return this.FMarginTop;
    }

    set marginTop(val) {
        this.setMarginTop_(val);
    }

    get marginLeft() {
        return this.FMarginLeft;
    }

    set marginLeft(val) {
        this.setMarginLeft_(val);
    }

    get marginRight() {
        return this.FMarginRight;
    }

    set marginRight(val) {
        this.setMarginRight_(val);
    }

    get marginBottom() {
        return this.FMarginBottom;
    }

    set marginBottom(val) {
        this.setMarginBottom_(val);
    }

    get widthPix() {
        return this.FWidthPix;
    }

    get heightPix() {
        return this.FHeightPix;
    }

    get marginTopPix() {
        return this.FMarginTopPix;
    }

    get marginLeftPix() {
        return this.FMarginLeftPix;
    }

    get marginRightPix() {
        return this.FMarginRightPix;
    }

    get marginBottomPix() {
        return this.FMarginBottomPix;
    }
}

export class THCPage {
    constructor() {
        this.clear();
    }

    assign(src) {
        this.FStartDrawItemNo = src.startDrawItemNo;
        this.FEndDrawItemNo = src.endDrawItemNo;
    }

    clear() {
        this.FStartDrawItemNo = 0;
        this.FEndDrawItemNo = 0;
    }

    get startDrawItemNo() {
        return this.FStartDrawItemNo;
    }

    set startDrawItemNo(val) {
        this.FStartDrawItemNo = val;
    }

    get endDrawItemNo() {
        return this.FEndDrawItemNo;
    }

    set endDrawItemNo(val) {
        this.FEndDrawItemNo = val;
    }
}

export class THCPages extends TList {
    constructor() {
        super();
    }

    clearEx() {
        this.removeRange(1, this.count - 1);
        this[0].clear();
    }
}