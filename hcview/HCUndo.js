import { TList, TObject, TStack, TStream } from "../hcl/System.js";
import { THCAction } from "./HCCommon.js";

export class THCMirrorUndoData extends TObject {
    constructor() {
        super();
        this.Stream = null;
    }
}

class THCBaseKeysUndoData extends TObject {
    constructor() {
        super();
        this.A = -1;
        this.B = -1;
    }
}

export class THCCellUndoData extends THCBaseKeysUndoData {
    constructor() {
        super();
    }

    get Row() {
        return this.A;
    }

    set Row(val) {
        this.A = val;
    }

    get Col() {
        return this.B;
    }

    set Col(val) {
        this.B = val;
    }
}

export class THCMulCellUndoData extends THCCellUndoData {
    constructor() {
        super();
    }
}

export class THCColSizeUndoData extends THCBaseKeysUndoData {
    constructor() {
        super();
        this.FCol = -1;
    }

    get Col() {
        return this.FCol;
    }

    set Col(val) {
        this.FCol = val;
    }

    get OldWidth() {
        return this.A;
    }

    set OldWidth(val) {
        this.A = val;
    }

    get NewWidth() {
        return this.B;
    }

    set NewWidth(val) {
        this.B = val;
    }
}

export class THCRowSizeUndoData extends THCBaseKeysUndoData {
    constructor() {
        super();
        this.FRow = -1;
    }

    get Row() {
        return this.FRow;
    }

    set Row(val) {
        this.FRow = val;
    }

    get OldHeight() {
        return this.A;
    }

    set OldHeight(val) {
        this.A = val;
    }

    get NewHeight() {
        return this.B;
    }

    set NewHeight(val) {
        this.B = val;
    }
}

export class THCSizeUndoData extends THCBaseKeysUndoData {
    constructor() {
        super();
        this.FNewWidth = 0;
        this.FNewHeight = 0;
    }

    get OldWidth() {
        return this.A;
    }

    set OldWidth(val) {
        this.A = val;
    }

    get OldHeight() {
        return this.B;
    }

    set OldHeight(val) {
        this.B = val;
    }

    get NewWidth() {
        return this.FNewWidth;
    }

    set NewWidth(val) {
        this.FNewWidth = val;
    }

    get NewHeight() {
        return this.FNewHeight;
    }

    set NewHeight(val) {
        this.FNewHeight = val;
    }
}

export class THCCustomUndoAction extends TObject {
    constructor() {
        super();
        this.Tag = null;
        this.ItemNo = -1;
        this.Offset = -1;
        this.ParaFirst = false;
    }
}

export class THCTextUndoAction extends THCCustomUndoAction {
    constructor() {
        super();
        this.Text = "";
    }
}

export class THCSetItemTextUndoAction extends THCTextUndoAction {
    constructor() {
        super();
        this.NextText = "";
    }
}

export var TItemProperty = {
    StyleNo: 0,
    ParaNo: 1,
    ParaFirst: 2,
    PageBreak: 3
}

export class THCItemPropertyUndoAction extends THCCustomUndoAction {
    constructor() {
        super();
        this.Tag = THCAction.ItemProperty;
        this.ItemProperty = null;
    }
}

export class THCItemStyleUndoAction extends THCItemPropertyUndoAction {
    constructor() {
        super();
        this.ItemProperty = TItemProperty.StyleNo;
        this.OldStyleNo = 0;
        this.NewStyleNo = 0;
    }
}

export class THCItemParaUndoAction extends THCItemPropertyUndoAction {
    constructor() {
        super();
        this.ItemProperty = TItemProperty.ParaNo;
        this.OldParaNo = 0;
        this.NewParaNo = 0;
    }
}

export class THCItemParaFirstUndoAction extends THCItemPropertyUndoAction {
    constructor() {
        super();
        this.ItemProperty = TItemProperty.ParaFirst;
        this.OldParaFirst = 0;
        this.NewParaFirst = 0;
    }
}

export class THCItemPageBreakUndoAction extends THCItemPropertyUndoAction {
    constructor() {
        super();
        this.ItemProperty = TItemProperty.PageBreak;
        this.OldPageBreak = 0;
        this.NewPageBreak = 0;
    }
}

export class THCItemUndoAction extends THCCustomUndoAction {
    constructor() {
        super();
        this.ItemStream = new TStream();
    }
}

export class THCItemSelfUndoAction extends THCCustomUndoAction {
    constructor() {
        super();
        this.Tag = THCAction.ItemSelf;
        this.Object = null;
    }
}

export class THCUndoActions extends TList {
    constructor() {
        super();
    }
}

export class THCCustomUndo extends TObject {
    constructor() {
        super();
        this.IsUndo = true;
        this.Actions = new THCUndoActions();
    }
}

export class THCUndo extends THCCustomUndo {
    constructor() {
        super();
        this.Data = null;
    }

    ActionAppend(tag, itemNo, offset, paraFirst) {
        let vResult = null;
        switch (tag) {
            case THCAction.BackDeleteText:
            case THCAction.DeleteText:
            case THCAction.InsertText:
                vResult = new THCTextUndoAction();
                break;

            case THCAction.SetItemText:
                vResult = new THCSetItemTextUndoAction();
                break;

            case THCAction.DeleteItem:
            case THCAction.InsertItem:
            case THCAction.ItemMirror:
                vResult = new THCItemUndoAction();
                break;

            case THCAction.ItemSelf:
                vResult = new THCItemSelfUndoAction();
                break;

            default:
                vResult = new THCCustomUndoAction();
                break;
        }

        vResult.Tag = tag;
        vResult.ItemNo = itemNo;
        vResult.Offset = offset;
        vResult.ParaFirst = paraFirst;

        this.Actions.add(vResult);

        return vResult;
    }
}

export class THCDataUndo extends THCUndo {
    constructor() {
        super();
        this.CaretDrawItemNo = -1;
    }
}

export class THCEditUndo extends THCDataUndo {
    constructor() {
        super();
        this.HScrollPos = 0;
        this.VScrollPos = 0;
    }
}

export class THCSectionUndo extends THCEditUndo {
    constructor() {
        super();
        this.SectionIndex = -1;
    }
}

export class THCUndoGroupBegin extends THCDataUndo {
    constructor() {
        super();
        this.ItemNo = -1;
        this.Offset = -1;
    }
}

export class THCUndoEditGroupBegin extends THCUndoGroupBegin {
    constructor() {
        super();
        this.HScrollPos = 0;
        this.VScrollPos = 0;
    }
}

export class THCSectionUndoGroupBegin extends THCUndoEditGroupBegin {
    constructor() {
        super();
        this.SectionIndex = -1;
    }
}

export class THCUndoGroupEnd extends THCDataUndo {
    constructor() {
        super();
        this.ItemNo = -1;
        this.Offset = -1;
    }
}

export class THCUndoEditGroupEnd extends THCUndoGroupEnd {
    constructor() {
        super();
        this.HScrollPos = 0;
        this.VScrollPos = 0;
    }
}

export class THCSectionUndoGroupEnd extends THCUndoEditGroupEnd {
    constructor() {
        super();
        this.SectionIndex = -1;
    }
}

export class THCUndoList extends TList {
    constructor() {
        super();
        this.FSeek = -1;
        this.FEnable = true;
        this.FEnableStateStack = new TStack();
        this.FMaxUndoCount = 99;
        this.FGroupWorking = false;
        this.FGroupBeginIndex = -1;
        this.FGroupEndIndex = -1;

        this.FOnUndoNew = null;
        this.FOnUndoGroupStart = null;
        this.FOnUndoGroupEnd= null;
        this.FOnUndo = null;
        this.FOnRedo = null;
        this.FOnUndoDestroy = null;
        this.FOnUndoDestroy = null;
    }

    doClear_() {
        super.doClear_();
        this.FSeek = -1;
        this.FGroupBeginIndex = -1;
        this.FGroupEndIndex = -1;
    }

    doRemoved_(item) {
        super.doRemoved_(item);
        if (this.FOnUndoDestroy != null)
            this.FOnUndoDestroy(item);
    }

    DoNewUndo(undo) {
        if (this.FSeek < this.count - 1) {
            if (this.FSeek > 0) {
                if (this[this.FSeek].IsUndo)
                    this.FSeek++;

                this.removeRange(this.FSeek, this.count - this.FSeek);
            } else
                this.clear();
        }

        if (this.count > this.FMaxUndoCount && !this.FGroupWorking) {
            let vOver = 0, vIndex = -1;

            if (this[0].isClass(THCUndoGroupBegin)) {
                for (let i = 1; i <= this.count - 1; i++) {
                    if (this[i].isClass(THCUndoGroupEnd)) {
                        if (vOver == 0) {
                            vIndex = i;
                            break;
                        } else
                            vOver--;
                    } else {
                        if (this[i].isClass(THCUndoGroupBegin))
                            vOver++;
                    }
                }

                this.removeRange(0, vIndex + 1);
            } else
                this.removeAt(0);
        }

        this.add(undo);
        this.FSeek = this.count - 1;
    }

    UndoGroupBegin(aItemNo, aOffset) {
        this.FGroupWorking = true;
        let vUndoGroupBegin = null;
        if (this.FOnUndoGroupStart != null)
            vUndoGroupBegin = this.FOnUndoGroupStart(aItemNo, aOffset);
        else
            vUndoGroupBegin = new THCUndoGroupBegin();

        vUndoGroupBegin.ItemNo = aItemNo;
        vUndoGroupBegin.Offset = aOffset;

        this.DoNewUndo(vUndoGroupBegin);
    }

    UndoGroupEnd(aItemNo, aOffset) {
        let vUndoGroupEnd = null;
        if (this.FOnUndoGroupEnd != null)
            vUndoGroupEnd = this.FOnUndoGroupEnd(aItemNo, aOffset);
        else
            vUndoGroupEnd = new THCUndoGroupEnd();

        vUndoGroupEnd.ItemNo = aItemNo;
        vUndoGroupEnd.Offset = aOffset;

        this.DoNewUndo(vUndoGroupEnd);
        this.FGroupWorking = false;
    }

    UndoNew() {
        let vResult = null;
        if (this.FOnUndoNew != null)
            vResult = this.FOnUndoNew();
        else
            vResult = new THCUndo();

        this.DoNewUndo(vResult);
        return vResult;
    }

    DoSeekUndoEx(seek) {
        if (this.FOnUndo != null)
            this.FOnUndo(this[seek]);

        this[seek].IsUndo = false;
        seek--;
        return seek;
    }

    Undo() {
        if (this.FSeek >= 0) {
            let vOver = 0, vBeginIndex = -1;

            if (this[this.FSeek].isClass(THCUndoGroupEnd)) {
                vOver = 0;
                vBeginIndex = 0;
                for (let i = this.FSeek - 1; i >= 0; i--) {
                    if (this[i].isClass(THCUndoGroupBegin)) {
                        if (vOver == 0) {
                            vBeginIndex = i;
                            break;
                        } else
                            vOver--;
                    } else {
                        if (this[i].isClass(THCUndoGroupEnd))
                            vOver++;
                    }
                }

                this.FGroupBeginIndex = vBeginIndex;
                this.FGroupEndIndex = this.FSeek;
                try {
                    this.FGroupWorking = true;
                    while (this.FSeek >= vBeginIndex) {
                        if (this.FSeek == vBeginIndex)
                            this.FGroupWorking = false;

                        this.FSeek = this.DoSeekUndoEx(this.FSeek);
                    }
                } finally {
                    this.FGroupWorking = false;
                    this.FGroupBeginIndex = -1;
                    this.FGroupEndIndex = -1;
                }
            } else
                this.FSeek = this.DoSeekUndoEx(this.FSeek);
        }
    }

    DoSeekRedoEx(seek) {
        seek++;
        if (this.FOnRedo != null)
            this.FOnRedo(this[seek]);

        this[seek].IsUndo = true;
        return seek;
    }

    Redo() {
        if (this.FSeek < this.count - 1) {
            let vOver = -1, vEndIndex = -1;
            if (this[this.FSeek + 1].isClass(THCUndoGroupBegin)) {
                vOver = 0;
                vEndIndex = this.count - 1;

                for (let i = this.FSeek + 2; i <= this.count - 1; i++) {
                    if (this[i].isClass(THCUndoGroupEnd)) {
                        if (vOver == 0) {
                            vEndIndex = i;
                            break;
                        } else
                            vOver--;
                    } else {
                        if (this[i].isClass(THCUndoGroupBegin))
                            vOver++;
                    }
                }

                this.FGroupBeginIndex = this.FSeek + 1;
                this.FGroupEndIndex = vEndIndex;
                try {
                    this.FGroupWorking = true;
                    while (this.FSeek < vEndIndex) {
                        if (this.FSeek == vEndIndex - 1)
                            this.FGroupWorking = false;

                        this.FSeek = this.DoSeekRedoEx(this.FSeek);
                    }
                } finally {
                    this.FGroupWorking = false;
                    this.FGroupBeginIndex = -1;
                    this.FGroupEndIndex = -1;
                }
            } else
                this.FSeek = this.DoSeekRedoEx(this.FSeek);
        }
    }

    SaveState() {
        this.FEnableStateStack.push(this.FEnable);
    }

    RestoreState() {
        if (this.FEnableStateStack.count > 0)
            this.FEnable = this.FEnableStateStack.pop();
    }

    get Enable() {
        return this.FEnable;
    }

    set Enable(val) {
        this.FEnable = val;
    }

    get MaxUndoCount() {
        return this.FMaxUndoCount;
    }

    set MaxUndoCount(val) {
        this.FMaxUndoCount = val;
    }

    get Seek() {
        return this.FSeek;
    }

    get GroupWorking() {
        return this.FGroupWorking;
    }

    get CurGroupBeginIndex() {
        return this.FGroupBeginIndex;
    }

    get CurGroupEndIndex() {
        return this.FGroupEndIndex;
    }

    get OnUndoNew() {
        return this.FOnUndoNew;
    }

    set OnUndoNew(val) {
        this.FOnUndoNew = val;
    }

    get OnUndoGroupStart() {
        return this.FOnUndoGroupStart;
    }

    set OnUndoGroupStart(val) {
        this.FOnUndoGroupStart = val;
    }

    get OnUndoGroupEnd() {
        return this.FOnUndoGroupEnd;
    }

    set OnUndoGroupEnd(val) {
        this.FOnUndoGroupEnd = val;
    }

    get OnUndoDestroy() {
        return this.FOnUndoDestroy;
    }

    set OnUndoDestroy(val) {
        this.FOnUndoDestroy = val;
    }

    get OnUndo() {
        return this.FOnUndo;
    }

    set OnUndo(val) {
        this.FOnUndo = val;
    }

    get OnRedo() {
        return this.FOnRedo;
    }

    set OnRedo(val) {
        this.FOnRedo = val;
    }
}