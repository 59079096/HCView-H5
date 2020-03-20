import { TList, TObject, TRect } from "../hcl/System.js";

export var TDrawOption = {
    doLineFirst: 0,
    doLineLast: 1,
    doParaFirst: 2
}

export class THCCustomDrawItem extends TObject {
    constructor() {
        super();
        this.FOptions = new Set([]);
        this.ItemNo = -1;
        this.CharOffs = -1;
        this.CharLen = -1;
        this.rect = new TRect();
    }

    GetLineFirst() {
        return this.FOptions.has(TDrawOption.doLineFirst);
    }

    SetLineFirst(val) {
        if (val)
            this.FOptions.add(TDrawOption.doLineFirst);
        else
            this.FOptions.delete(TDrawOption.doLineFirst);
    }

    GetParaFirst() {
        return this.FOptions.has(TDrawOption.doParaFirst);
    }

    SetParaFirst(val) {
        if (val)
            this.FOptions.add(TDrawOption.doParaFirst);
        else
            this.FOptions.delete(TDrawOption.doParaFirst);
    }

    CharOffsetEnd() {
        return this.CharOffs + this.CharLen - 1;
    }

    get width() {
        return this.rect.width;
    }

    get height() {
        return this.rect.height;
    }

    get LineFirst() {
        return this.GetLineFirst();
    }

    set LineFirst(val) {
        this.SetLineFirst(val);
    }

    get ParaFirst() {
        return this.GetParaFirst();
    }

    set ParaFirst(val) {
        this.SetParaFirst(val);
    }
}

export class THCDrawItems extends TList {
    constructor() {
        super();
        this.FDeleteStartDrawItemNo = -1;
        this.FDeleteCount = 0;
    }

    insert(index, item) {
        if (this.FDeleteCount == 0) {
            return super.insert(index, item);
        } else {
            this.FDeleteStartDrawItemNo++;
            this.FDeleteCount--;

            let vItem = this[index];
            this.splice(index, 1, item);
            this.doRemoved_(vItem);
            let vObj = Object.getPrototypeOf(vItem);
            if (vObj instanceof TObject)
                vItem.dispose();

            vItem = null;
            //this[index] = item;
            return true;
        }
    }

    clear() {
        super.clear();
        this.ClearFormatMark();
    }

    MarkFormatDelete(aStartDrawItemNo, aEndDrawItemNo) {
        this.FDeleteStartDrawItemNo = aStartDrawItemNo;
        this.FDeleteCount = aEndDrawItemNo - aStartDrawItemNo + 1;
    }

    DeleteFormatMark() {
        this.removeRange(this.FDeleteStartDrawItemNo, this.FDeleteCount);
        this.FDeleteStartDrawItemNo = -1;
        this.FDeleteCount = 0;
    }

    ClearFormatMark() {
        this.FDeleteStartDrawItemNo = -1;
        this.FDeleteCount = 0;
    }
}