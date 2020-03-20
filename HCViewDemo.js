import { application } from "./hcl/Application.js";
import { TAlign } from "./hcl/Controls.js";
import { TOpenDialog } from "./hcl/Forms.js";
import { TFont } from "./hcl/Graphics.js";
import { hcl } from "./hcl/Kernel.js";
import { TCombobox, TDropDownStyle, TEdit, TFontCombobox, TLable, TPopupMenu, TToolBar, TToolMenuButton, TUrlLable } from "./hcl/StdCtrls.js";
import { TFileType, TDateTime, TStream } from "./hcl/System.js";
import { TParaAlignHorz, TParaLineSpaceMode } from "./hcview/HCParaStyle.js";
import { THCFontStyle } from "./hcview/HCTextStyle.js";
import { THCView } from "./hcview/HCView.js";
import { TFrmInsertTable } from "./hcview/frmInsertTable.js";
import { THCEditItem } from "./hcview/HCEditItem.js";
import { THCCheckBoxItem } from "./hcview/HCCheckBoxItem.js";
import { THCComboboxItem } from "./hcview/HCComboboxItem.js";
import { THCDateTimePicker } from "./hcview/HCDateTimePicker.js";
import { THCRadioGroup } from "./hcview/HCRadioGroup.js";
import { THCFractionItem } from "./hcview/HCFractionItem.js";
import { THCExpressItem } from "./hcview/HCExpressItem.js";
import { THCSupSubScriptItem } from "./hcview/HCSupSubScriptItem.js";
import { THCFloatLineItem } from "./hcview/HCFloatLineItem.js";
import { THCImageItem } from "./hcview/HCImageItem.js";
import { THCBarCodeItem } from "./hcview/HCBarCodeItem.js";
import { THCContentAlign, HC } from "./hcview/HCCommon.js";
import { clipboard, TDataFormat } from "./hcl/Clipboard.js";
import { THCCustomRectItem } from "./hcview/HCRectItem.js";
import { THCStyle } from "./hcview/HCStyle.js"; 
import { THCFloatBarCodeItem } from "./hcview/HCFloatBarCodeItem.js";

application.icon.src = "./image/hcview.png";
let mainForm = application.mainForm;
mainForm.captionBar.addButton("", false, application.icon.src).onClick = function() { hcl.showMessage("欢迎使用HCView！"); }
mainForm.captionBar.addButton("文件");
mainForm.captionBar.addButton("编辑");

let menuInsert = new TPopupMenu();
menuInsert.dropDownStyle = true;
menuInsert.addItem("表格").onClick = () => { 
    let vFrmInsertTable = new TFrmInsertTable();
    vFrmInsertTable.showModal(() => {
        hcView.InsertTable(vFrmInsertTable.edtRowCount.text, vFrmInsertTable.edtColCount.text);
    });
}

menuInsert.addItem("图片").onClick = () => {
    TOpenDialog.execute(String.format("{0}", TFileType.IMAGE), (openDlg) => {
        let vTopData = hcView.ActiveSectionTopLevelData();
        let vImageItem = new THCImageItem(vTopData);
        vImageItem.LoadFromBmpFile(openDlg.firstFile, () => {
            vImageItem.RestrainSize(vTopData.width, vImageItem.Height);
            hcView.InsertItem(vImageItem);
        });
    });
}
menuInsert.addItem("GIF动画");
let menuFormu = menuInsert.addItem("公式");
menuFormu.addItem("分数(分子/分母)").onClick = () => {
    let vFractionItem = new THCFractionItem(hcView.ActiveSectionTopLevelData(), "12", "2018");
    hcView.InsertItem(vFractionItem);
}
menuFormu.addItem("分数(上下左右)").onClick = () => {
    let vExpressItem = new THCExpressItem(hcView.ActiveSectionTopLevelData(),
        "12", "5-6", "2017-6-3", "28-30");
    hcView.InsertItem(vExpressItem);
}
menuFormu.addItem("上下标").onClick = () => {
    let vSupSubScriptItem = new THCSupSubScriptItem(hcView.ActiveSectionTopLevelData(), "20g", "先煎");
    hcView.InsertItem(vSupSubScriptItem);
}

menuInsert.addItem("横线").onClick = () => {
    hcView.InsertLine(1);
}

let menuControl = menuInsert.addItem("控件");
menuControl.addItem("CheckBox").onClick = () => {
    let vCheckBoxItem = new THCCheckBoxItem(hcView.ActiveSectionTopLevelData(), "勾选框", false);
    hcView.InsertItem(vCheckBoxItem);
}
menuControl.addItem("Combobox").onClick = () => {
    let vCombobox = new THCComboboxItem(hcView.ActiveSectionTopLevelData(), "下拉选择");
    vCombobox.Items.add("选项1");
    vCombobox.Items.add("选项2");
    vCombobox.Items.add("选项3");
    vCombobox.Items.add("选项4");
    vCombobox.Items.add("选项5");
    vCombobox.Items.add("选项6");
    hcView.InsertItem(vCombobox);
}
menuControl.addItem("DateTimePicker").onClick = () => {
    let vDateTimePicker = new THCDateTimePicker(hcView.ActiveSectionTopLevelData(), TDateTime.Now());
    hcView.InsertItem(vDateTimePicker);
}
menuControl.addItem("RadioGroup").onClick = () => {
    let vHCRadioGroup = new THCRadioGroup(hcView.ActiveSectionTopLevelData());
    vHCRadioGroup.AddItem("选项1");
    vHCRadioGroup.AddItem("选项2");
    vHCRadioGroup.AddItem("选项3");
    hcView.InsertItem(vHCRadioGroup);
}
menuControl.addItem("Edit").onClick = () => {
    let vEditItem = new THCEditItem(hcView.ActiveSectionTopLevelData(), "文本框");
    vEditItem.AutoSize = false;
    vEditItem.Width = 60;
    hcView.InsertItem(vEditItem);
}

menuInsert.addItem("分页").onClick = () => {
    hcView.InsertPageBreak();
}
menuInsert.addItem("分节").onClick = () => {
    hcView.InsertSectionBreak();
}
menuInsert.addItem("文档").onClick = () => {
    TOpenDialog.execute(String.format("{0}", ".hcf"), (openDlg) => {
        TStream.loadFromFile(openDlg.firstFile, (stream) => {
            hcView.InsertStream(stream);
        });
    });
}
menuInsert.addItem("文本").onClick = () => {
    hcView.InsertText("这是InsertText插入的内容^_^");
}
menuInsert.addItem("批注").onClick = () => {
    if (hcView.ActiveSection.ActiveData.SelectExists())
        hcView.InsertAnnotate("title", "text");
}
let menuCode = menuInsert.addItem("条码");
menuCode.addItem("一维码").onClick = () => {
    let vBarCodeItem = new THCBarCodeItem(hcView.ActiveSectionTopLevelData(), "123");
    hcView.InsertItem(vBarCodeItem);
}
menuCode.addItem("二维码");

let menuFloat = menuInsert.addItem("浮动对象");
menuFloat.addItem("直线").onClick = () => {
    let vFloatLineItem = new THCFloatLineItem(hcView.ActiveSection.ActiveData);
    hcView.InsertFloatItem(vFloatLineItem);
}
menuFloat.addItem("一维码").onClick = () => {
    let vFloatBarCodeItem = new THCFloatBarCodeItem(hcView.ActiveSection.ActiveData);
    hcView.InsertFloatItem(vFloatBarCodeItem);
}

menuInsert.addItem("超链接").onClick = () => {
    let vTopData = hcView.ActiveSectionTopLevelData();
    let vTextItem = vTopData.CreateDefaultTextItem();
    vTextItem.Text = "打开百度";
    vTextItem.HyperLink = "https://www.baidu.com";
    hcView.InsertItem(vTextItem);
}

menuInsert.addItem("域").onClick = () => {
    hcView.InsertDomain(null);
}

mainForm.captionBar.addButton("插入").onClick = (sender) => { menuInsert.popupControl(sender); }

mainForm.captionBar.addButton("视图");

let toolbar = new TToolBar();
toolbar.align = TAlign.Top;
toolbar.addButton("打开", false, "./image/open.png").onClick = function() {
    TOpenDialog.execute(String.format("{0},{1},{2}", TFileType.XML, TFileType.DOCX, ".hcf"), (openDlg) => {
        hcView.LoadFromFile(openDlg.firstFile);
    });
}

toolbar.addButton("新建", false, "./image/new.png").onClick = function() {
    hcView.clear();
}

toolbar.addButton("保存", false, "./image/save.png").onClick = function() {
    let vStream = new TStream();
    hcView.SaveToStream(vStream, false);
    let vByteData = new Uint8Array(vStream.buffer);
    let vBlob = new Blob([vByteData], {type:"application/octet-stream"});
    //let vBlob = new Blob(vStream.buffer, {type:"application/octet-stream"});
    let vDownloadUrl = window.URL.createObjectURL(vBlob);
    let vAnchor = document.createElement("a");
    vAnchor.href = vDownloadUrl;
    vAnchor.download = "HCView H5.hcf";
    vAnchor.click();
    window.URL.revokeObjectURL(vBlob);
}
toolbar.addButton("打印", false, "./image/print.png");
toolbar.addSpliter();
toolbar.addButton("撤销", false, "./image/undo.png").onClick = () => { hcView.Undo(); }
toolbar.addButton("恢复", false, "./image/redo.png").onClick = () => { hcView.Redo(); }
toolbar.addSpliter();
let cbbFont = new TFontCombobox("");
cbbFont.dropDownStyle = TDropDownStyle.DropDownList;
cbbFont.align = TAlign.Left;
cbbFont.onSelectedIndexChange = () => { hcView.ApplyTextFontName(cbbFont.text); }
toolbar.addControl(cbbFont);
let cbbFontSize = new TCombobox("");
cbbFontSize.width = 48;
cbbFontSize.dropDownWidth = 64;
cbbFontSize.dropDownStyle = TDropDownStyle.DropDownList;
cbbFontSize.align = TAlign.Left;
cbbFontSize.addItem("初号");
cbbFontSize.addItem("小初");
cbbFontSize.addItem("一号");
cbbFontSize.addItem("小一");
cbbFontSize.addItem("二号");
cbbFontSize.addItem("小二");
cbbFontSize.addItem("三号");
cbbFontSize.addItem("小三");
cbbFontSize.addItem("四号");
cbbFontSize.addItem("小四");
cbbFontSize.addItem("五号");
cbbFontSize.addItem("小五");
cbbFontSize.addItem("六号");
cbbFontSize.addItem("小六");
cbbFontSize.addItem("七号");
cbbFontSize.addItem("八号");
cbbFontSize.addItem("5");
cbbFontSize.addItem("5.5");
cbbFontSize.addItem("6.5");
cbbFontSize.addItem("7.5");
cbbFontSize.addItem("8");
cbbFontSize.addItem("9");
cbbFontSize.addItem("10");
cbbFontSize.addItem("10.5");
cbbFontSize.addItem("11");
cbbFontSize.addItem("12");
cbbFontSize.addItem("14");
cbbFontSize.addItem("16");
cbbFontSize.addItem("18");
cbbFontSize.addItem("20");
cbbFontSize.addItem("22");
cbbFontSize.addItem("24");
cbbFontSize.addItem("26");
cbbFontSize.addItem("28");
cbbFontSize.addItem("36");
cbbFontSize.addItem("48");
cbbFontSize.addItem("72");
cbbFontSize.itemIndex = 10;
cbbFontSize.onSelectedIndexChange = () => { hcView.ApplyTextFontSize(TFont.fontSizeToPt(cbbFontSize.text)); }
toolbar.addControl(cbbFontSize);
toolbar.addSpliter();
toolbar.addButton("加粗", false, "./image/bold.png").onClick = () => { hcView.ApplyTextStyle(THCFontStyle.Bold); }
toolbar.addButton("倾斜", false, "./image/italic.png").onClick = () => { hcView.ApplyTextStyle(THCFontStyle.Italic); }
toolbar.addButton("下划线", false, "./image/underline.png").onClick = () => { hcView.ApplyTextStyle(THCFontStyle.Underline); }
toolbar.addButton("中划线", false, "./image/strikeout.png").onClick = () => { hcView.ApplyTextStyle(THCFontStyle.StrikeOut); }
toolbar.addButton("上标", false, "./image/superscript.png").onClick = () => { hcView.ApplyTextStyle(THCFontStyle.Superscript); }
toolbar.addButton("下标", false, "./image/subscript.png").onClick = () => { hcView.ApplyTextStyle(THCFontStyle.Subscript); }
toolbar.addSpliter();
toolbar.addButton("左缩进", false, "./image/rightindent.png").onClick = () => { hcView.ApplyParaLeftIndentAdd(); }
toolbar.addButton("右缩进", false, "./image/leftindent.png").onClick = () => { hcView.ApplyParaLeftIndentAdd(false); }
toolbar.addButton("居左", false, "./image/left.png").onClick = () => { hcView.ApplyParaAlignHorz(TParaAlignHorz.Left); }
toolbar.addButton("居中", false, "./image/center.png").onClick = () => { hcView.ApplyParaAlignHorz(TParaAlignHorz.Center); }
toolbar.addButton("居右", false, "./image/right.png").onClick = () => { hcView.ApplyParaAlignHorz(TParaAlignHorz.Right); }
toolbar.addButton("两端", false, "./image/justify.png").onClick = () => { hcView.ApplyParaAlignHorz(TParaAlignHorz.Justify); }
toolbar.addButton("分散", false, "./image/scatter.png").onClick = () => { hcView.ApplyParaAlignHorz(TParaAlignHorz.Scatter); }

let menuLineSpace = new TPopupMenu();
menuLineSpace.addItem("单倍").onClick = () => { hcView.ApplyParaLineSpace(TParaLineSpaceMode.PLS100); }
menuLineSpace.addItem("1.15倍").onClick = () => { hcView.ApplyParaLineSpace(TParaLineSpaceMode.PLS115); }
menuLineSpace.addItem("1.5倍").onClick = () => { hcView.ApplyParaLineSpace(TParaLineSpaceMode.PLS150); }
menuLineSpace.addItem("2倍").onClick = () => { hcView.ApplyParaLineSpace(TParaLineSpaceMode.PLS200); }
menuLineSpace.addItem("固定值");

let menuBtn = new TToolMenuButton("行间距");
menuBtn.image.src = "./image/linespace.png";
menuBtn.dropDownMenu = menuLineSpace;
toolbar.addControl(menuBtn);

let edit = new TEdit("这是一个TEdit");
edit.align = TAlign.Left;
toolbar.addControl(edit);

let combobox = new TCombobox("");
combobox.align = TAlign.Left;
combobox.textPrompt = "请选择！";
combobox.addItem("选项1sf");
combobox.addItem("选项2aaassss");
combobox.addItem("选项3fsfasf");
combobox.addItem("选项4ghh");
combobox.addItem("选项5ejjjj");
combobox.addItem("选项6eee");
combobox.addItem("选项7yy");
combobox.addItem("选项8村");
combobox.addItem("选项99999");
toolbar.addControl(combobox);
mainForm.addControl(toolbar);

let statebar = new TToolBar();
statebar.align = TAlign.Bottom;
let lable = new TLable("Copyright© 2019-2020 HCView ");
lable.font.name = "Arial";
lable.align = TAlign.Left;
statebar.addControl(lable);
let urllable = new TUrlLable("www.hcview.cn");
urllable.url = "http://hcview.cn";
urllable.font.name = "Arial";
urllable.align = TAlign.Left;
statebar.addControl(urllable);
mainForm.addControl(statebar);

// // listbox
// let listBox = new TListBox();
// listBox.top = toolbar.height + 40;
// listBox.left = 380;
// listBox.width = 120;
// listBox.addItem("aaaaaaaaaaaaa");
// listBox.addItem("bbbb");
// listBox.addItem("这工工工");
// listBox.addItem("ddddd");
// listBox.addItem("eeeeeeeeee");
// listBox.addItem("ffff");
// listBox.addItem("11");
// listBox.addItem("222222");
// listBox.addItem("333333333");
// mainForm.addControl(listBox);

// checkbox
// let checkBox = new TCheckBox("这是一个勾选框");
// checkBox.font.size = TFont.fontSizeToPt("四号");
// checkBox.font.name = "楷体";
// checkBox.onClick = () => {
//     listBox.left = 380;
//     //listBox.left = 480;
//     TPropertyAnimate.Create(1000, listBox, "left", listBox.left, listBox.left + 300).start();
// }
// checkBox.top = toolbar.height + 40;
// checkBox.left = 40;
// mainForm.addControl(checkBox);
let viewPopup = new TPopupMenu();
viewPopup.onPupup = () => {
    if (hcView.AnnotatePre.activeDrawAnnotateIndex >= 0) {
        for (let i = 0; i < viewPopup.subItems.count; i++)
            viewPopup.subItems[i].visible = false;

        mniModAnnotate.visible = true;
        mniDelAnnotate.visible = true;
        return;
    } else {
        for (let i = 0; i < viewPopup.subItems.count; i++)
            viewPopup.subItems[i].visible = true;

        mniModAnnotate.visible = false;
        mniDelAnnotate.visible = false;
    }

    let vActiveData = hcView.ActiveSection.ActiveData;
    let vActiveItem = vActiveData.GetActiveItem();
    let vTopData = null;
    let vTopItem = vActiveItem;

    while (vTopItem.isSubClass(THCCustomRectItem)) {
        if (vTopItem.GetTopLevelData() != null) {
            if (vTopData != null) {
                vActiveData = vTopData;
                vActiveItem = vTopItem;
            }

            vTopData = vTopItem.GetTopLevelData();
            vTopItem = vTopData.GetActiveItem();
        } else
            break;
    }

    if (vTopData == null)
        vTopData = vActiveData;

    tableMenu.visible = vActiveItem.StyleNo == THCStyle.Table;
    if (tableMenu.visible) {
        let vTableItem = vActiveItem;
        mniInsertRowTop.enable = vTableItem.GetEditCell() != null;
        mniInsertRowBottom.enable = mniInsertRowTop.enabled;
        mniInsertColLeft.enabled = mniInsertRowTop.enabled;
        mniInsertColRight.enabled = mniInsertRowTop.enabled;
        mniSplitRow.enabled = mniInsertRowTop.enabled;
        mniSplitCol.enabled = mniInsertRowTop.enabled;

        mniDeleteCurRow.enabled = vTableItem.CurRowCanDelete();
        mniDeleteCurCol.enabled = vTableItem.CurColCanDelete();
        mniMerge.enabled = vTableItem.SelectedCellCanMerge();

        if (vTableItem.BorderVisible)
            mniDisBorder.text = "隐藏边框";
        else
            mniDisBorder.text = "显示边框";
    }

    mniCut.enabled = (!hcView.ActiveSection.ReadOnly) && vTopData.SelectExists();
    mniCopy.enabled = mniCut.enabled;
    mniPaste.enabled = (!hcView.ActiveSection.ReadOnly)
        && (clipboard.hasFormat(HC.HCExtFormat) || clipboard.hasFormat(TDataFormat.UnicodeText));
}

let mniCut = viewPopup.addItem("剪切 Ctrl+X");
mniCut.onClick = () => {
    hcView.Cut();
}

let mniCopy = viewPopup.addItem("复制 Ctrl+C");
mniCopy.onClick = () => {
    hcView.Copy();
}

let mniPaste = viewPopup.addItem("粘贴 Ctrl+V");
mniPaste.onClick = () => {
    hcView.Paste();
}

let tableMenu = viewPopup.addItem("表格");
let mniInsertRowTop = tableMenu.addItem("上方插入行");
mniInsertRowTop.onClick = () => {
    hcView.ActiveTableInsertRowBefor(1);
}
let mniInsertRowBottom = tableMenu.addItem("下方插入行");
mniInsertRowBottom.onClick = () => {
    hcView.ActiveTableInsertRowAfter(1);
}
tableMenu.addSpliter();
let mniInsertColLeft = tableMenu.addItem("左侧插入列");
mniInsertColLeft.onClick = () => {
    hcView.ActiveTableInsertColBefor(1);
}
let mniInsertColRight = tableMenu.addItem("右侧插入列");
mniInsertColRight.onClick = () => {
    hcView.ActiveTableInsertColAfter(1);
}
tableMenu.addSpliter();
let mniMerge = tableMenu.addItem("合并单元格");
mniMerge.onClick = () => {
    hcView.MergeTableSelectCells();
}
let cellAlign = tableMenu.addItem("对齐方式");
cellAlign.addItem("顶部左").onClick = () => {
    hcView.ApplyTableCellAlign(THCContentAlign.TopLeft);
}
cellAlign.addItem("顶部居中").onClick = () => {
    hcView.ApplyTableCellAlign(THCContentAlign.TopCenter);
}
cellAlign.addItem("顶部右").onClick = () => {
    hcView.ApplyTableCellAlign(THCContentAlign.TopRight);
}
cellAlign.addItem("居中左").onClick = () => {
    hcView.ApplyTableCellAlign(THCContentAlign.CenterLeft);
}
cellAlign.addItem("居中居中").onClick = () => {
    hcView.ApplyTableCellAlign(THCContentAlign.CenterCenter);
}
cellAlign.addItem("居中右").onClick = () => {
    hcView.ApplyTableCellAlign(THCContentAlign.CenterRight);
}
cellAlign.addItem("底部左").onClick = () => {
    hcView.ApplyTableCellAlign(THCContentAlign.BottomLeft);
}
cellAlign.addItem("底部居中").onClick = () => {
    hcView.ApplyTableCellAlign(THCContentAlign.BottomCenter);
}
cellAlign.addItem("底部右").onClick = () => {
    hcView.ApplyTableCellAlign(THCContentAlign.BottomRight);
}

tableMenu.addSpliter();
let mniSplitRow = tableMenu.addItem("拆分行");
mniSplitRow.onClick = () => {
    hcView.ActiveTableSplitCurRow();
}
let mniSplitCol = tableMenu.addItem("拆分列");
mniSplitCol.onClick = () => {
    hcView.ActiveTableSplitCurCol();
}
tableMenu.addSpliter();
let mniDeleteCurRow = tableMenu.addItem("删除当前行");
mniDeleteCurRow.onClick = () => {
    hcView.ActiveTableDeleteCurRow();
}
let mniDeleteCurCol = tableMenu.addItem("删除当前列");
mniDeleteCurCol.onClick = () => {
    hcView.ActiveTableDeleteCurCol();
}
tableMenu.addSpliter();
tableMenu.addItem("边框及背景").onClick = () => {
    //let vFrmBorderBackColor = new TfrmBorderBackColor();
    //vFrmBorderBackColor.SetView(hcView);
}
let mniDisBorder = tableMenu.addItem("显示/隐藏边框");
mniDisBorder.onClick = () => {
    let vTable = hcView.ActiveSection.ActiveData.GetActiveItem();
    if (vTable.isSubClass(THCTableItem)) {
        vTable.BorderVisible = !vTable.BorderVisible;
        hcView.UpdateView();
    }
}
tableMenu.addItem("属性").onClick = () => {
    //let vFrmTableProperty = new TFrmTableProperty();
    //vFrmTableProperty.SetView(hcView);
}

viewPopup.addItem("段落").onClick = () => {
    //let vFrmParagraph = new TfrmParagraph();
    //vFrmParagraph.SetView(hcView);
}

let mniModAnnotate = viewPopup.addItem("修改");
mniModAnnotate.onClick = () => {

}
let mniDelAnnotate = viewPopup.addItem("删除");
mniDelAnnotate.onClick = () => {
    hcView.AnnotatePre.deleteDataAnnotateByDraw(hcView.AnnotatePre.activeDrawAnnotateIndex);
}

let hcView = new THCView();
hcView.align = TAlign.Client;
hcView.popupMenu = viewPopup;
mainForm.addControl(hcView);
hcView.setFocus();
hcl.autoWidth = true;

application.run();