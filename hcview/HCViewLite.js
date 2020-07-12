import { TObject, TList } from "../hcl/System.js";
import { THCStyle } from "./HCStyle.js";
import { HC } from "./HCCommon.js";


export class THCViewLite extends TObject {
    constructor() {
        this.FPageNoFormat = "";
        this.FStyle = new THCStyle(true, true);
        this.FSections = new TList();
        this.FActiveSectionIndex = 0;
    }

    NewDefaultSection() {
        let vResult = new THCSection(this.FStyle);
        vResult.OnPaintFooterAfter = (sender, pageIndex, rect, hclCanvas, paintInfo) => {
            this.DoSectionPaintFooterAfter(sender, pageIndex, rect, hclCanvas, paintInfo);
        }
        vResult.OnCreateItemByStyle = (data, styleNo) => { return this.DoSectionCreateStyleItem(data, styleNo); }
        return vResult;
    }

    DoLoadFromStream(stream, style, loadSectionProc) {
        stream.position = 0;

        let vInfo = HC._LoadFileFormatAndVersion(stream);
        let vFileExt = vInfo.fileExt;
        let vFileVersion = vInfo.fileVersion;
        let vLang = vInfo.lang;

        if (vFileExt != HC.HC_EXT)
            system.exception("加载失败，不是" + HC.HC_EXT + "文件！");

            if (vFileVersion > HC.HC_FileVersionInt)
                system.exception("加载失败，当前编辑器最高支持版本为"
                + HC.HC_FileVersionInt.toString() + "的文件，无法打开版本为" + vFileVersion.toString() + "的文件！");

        this.DoLoadStreamBefor(stream, vFileVersion);
        style.LoadFromStream(stream, vFileVersion);
        loadSectionProc(vFileVersion);
        this.DoLoadStreamAfter(stream, vFileVersion);
    }

    GetActiveSection() {
        return this.FSections[this.FActiveSectionIndex];
    }

    DoSectionPaintFooterAfter(sender, pageIndex, rect, hclCanvas, paintInfo) {
        let vSection = sender;
        if (vSection.PageNoVisible) {
            let vSectionIndex = this.FSections.indexOf(vSection);
            let vSectionStartPageIndex = 0;
            let vAllPageCount = 0;
            for (let i = 0; i <= this.FSections.count - 1; i++) {
                if (i == vSectionIndex)
                    vSectionStartPageIndex = vAllPageCount;

                vAllPageCount = vAllPageCount + this.FSections[i].PageCount;
            }

            let vS = this.FPageNoFormat.format(vSectionStartPageIndex + vSection.PageNoFrom + pageIndex, vAllPageCount);
            hclCanvas.font.size = 10;
            hclCanvas.font.name = "宋体";
            hclCanvas.textOut(rect.left + Math.trunc((rect.width - hclCanvas.textWidth(vS)) / 2), rect.top + vSection.Footer.height, vS);
        }
    }

    DoSectionCreateStyleItem(data, styleNo) {
        return null;
    }

    DoSaveStreamBefor(stream) { }

    DoSaveStreamAfter(stream) { }

    DoLoadStreamBefor(stream, fileVersion) { }

    DoLoadStreamAfter(stream, fileVersion) { }

    DeleteUnUsedStyle(style, sections, parts) {
        for (let i = 0; i <= style.TextStyles.count - 1; i++) {
            style.TextStyles[i].CheckSaveUsed = false;
            style.TextStyles[i].TempNo = THCStyle.Null;
        }

        for (let i = 0; i <= style.ParaStyles.count - 1; i++) {
            style.ParaStyles[i].CheckSaveUsed = false;
            style.ParaStyles[i].TempNo = THCStyle.Null;
        }

        for (let i = 0; i <= sections.count - 1; i++)
            sections[i].MarkStyleUsed(true, parts);
        
        let vUnCount = 0;
        for (let i = 0; i <= style.TextStyles.count - 1; i++) {
            if (style.TextStyles[i].CheckSaveUsed)
                style.TextStyles[i].TempNo = i - vUnCount;
            else
                vUnCount++;
        }
        
        vUnCount = 0;
        for (let i = 0; i <= style.ParaStyles.count - 1; i++) {
            if (style.ParaStyles[i].CheckSaveUsed)
                style.ParaStyles[i].TempNo = i - vUnCount;
            else
                vUnCount++;
        }

        let vData = null;
        for (let i = 0; i <= sections.count - 1; i++) {
            sections[i].MarkStyleUsed(false, parts);

            vData = sections[i].ActiveData.GetTopLevelData();
            if (vData.CurStyleNo > THCStyle.Null)
                vData.CurStyleNo = style.TextStyles[vData.CurStyleNo].TempNo;

            vData.CurParaNo = style.ParaStyles[vData.CurParaNo].TempNo;
        }

        for (let i = style.TextStyles.count - 1; i >= 0; i--) {
            if (!style.TextStyles[i].CheckSaveUsed)
                style.TextStyles.delete(i);
        }

        for (let i = style.ParaStyles.count - 1; i >= 0; i--) {
            if (!style.ParaStyles[i].CheckSaveUsed)
                style.ParaStyles.delete(i);
        }
    }

    Clear() {
        this.FStyle.initialize();
        this.FSections.removeRange(1, this.FSections.count - 1);
        this.FActiveSectionIndex = 0;
        this.FSections[0].clear();
    }

    GetPageCount() {
        let vResult = 0;
        for (let i = 0; i <= this.FSections.count - 1; i++)
            vResult = vResult + this.FSections[i].PageCount;

        return vResult;
    }

    GetSectionPageIndexByPageIndex(pageIndex, sectionPageIndex) {
        let vResult = -1, vPageCount = 0;

        for (let i = 0; i <= this.FSections.count - 1; i++) {
            if (vPageCount + this.FSections[i].PageCount > pageIndex) {
                vResult = i;
                sectionPageIndex = pageIndex - vPageCount;
                break;
            }
            else
                vPageCount = vPageCount + this.FSections[i].PageCount;
        }

        return {
            pageIndex: sectionPageIndex,
            result: vResult
        }
    }

    SaveToFile(fileName, quick = false) {

    }

    LoadFromFile(file) {
        let vResult = false;
        TStream.loadFromFile(file, (stream) => {
            vResult = this.LoadFromStream(stream);
        });

        return vResult;
    }

    SaveToText() {
        let vResult = this.FSections[0].SaveToText();
        for (let i = 1; i <= this.FSections.count - 1; i++)
            vResult = vResult + HC.sLineBreak + this.FSections[i].SaveToText();

        return vResult;
    }

    LoadFromText(text) {
        this.clear();
        this.FStyle.initialize();

        if (text != "")
            return this.ActiveSection.InsertText(text);
        else
            return false;
    }

    SaveToStream(stream, quick) {
        HC._SaveFileFormatAndVersion(stream);
        this.DoSaveStreamBefor(stream);

        let vArea = areas;
        if (vArea == null) {
            vArea = new Set([]);
            vArea.add(TSectionArea.Header);
            vArea.add(TSectionArea.Footer);
            vArea.add(TSectionArea.Page);
        }

        if (!quick)
            this.DeleteUnUsedStyle(this.FStyle, this.FSections, vArea);

        this.FStyle.SaveToStream(stream);
        stream.writeByte(this.FSections.count);
    
        for (let i = 0; i <= this.FSections.count - 1; i++)
            this.FSections[i].SaveToStream(stream, vArea);
        
        this.DoSaveStreamAfter(stream);
    }

    LoadFromStream() {
        this.FStyle.States.include(THCState.Loading);
        try {
            stream.position = 0;
            let vEvent = (fileVersion) => {
                let vByte = stream.readByte();  // 节数量
                this.FSections[0].LoadFromStream(stream, this.FStyle, fileVersion);
                for (let i = 1; i <= vByte - 1; i++) {
                    let vSection = this.NewDefaultSection();
                    vSection.LoadFromStream(stream, this.FStyle, fileVersion);
                    this.FSections.add(vSection);
                }
            }

            this.DoLoadFromStream(stream, this.FStyle, vEvent);
        } finally {
            this.FStyle.States.exclude(THCState.Loading);
        }

        return true;
    }

    get PageCount() {
        return this.GetPageCount();
    }

    get ActiveSection() {
        return this.GetActiveSection();
    }

    get Sections() {
        return this.FSections;
    }

    get Style() {
        return this.FStyle;
    }
}