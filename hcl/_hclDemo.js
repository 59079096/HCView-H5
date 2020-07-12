import { application } from "./Application.js";
import { TAlign, TKey, TProgressBar, TTrackBar } from "./Controls.js";
import { TTimer } from "./ExtCtrls.js";
import { TForm, TOpenDialog } from "./Forms.js";
import { hcl } from "./HCL.js";
import { TButton, TButtonEdit, TCheckBox, TColorCombobox, TCombobox, TEdit, TGrid, TImage, TImageButton, TLable, TLableEdit, TListBox, TPageControl, TPanel, TPopupMenu, TToolBar, TToolMenuButton, TTreeView, TUrlLable } from "./StdCtrls.js";
import { TFileType } from "./System.js";
import { theme } from "./theme.js";

export class TFrmDemo extends TForm {
    constructor(width, height) {
        super(width, height);
        this.captionBar.captureParent = false;
        this.captionBar.controls.clear();
        this.captionBar.addButton("", false, application.icon.src).onClick = function() { hcl.showMessage("欢迎使用HCView！"); }

        let menuFile = new TPopupMenu();
        menuFile.dropDownStyle = true;
        let menuOpen = menuFile.addItem("打开");
        menuOpen.hint = "打开一张本地图片";
        menuOpen.onClick = () => { 
           TOpenDialog.execute(String.format("{0},{1},{2}", TFileType.BMP, TFileType.JPEG, ".png"), (openDlg) => {
                let vReader = new FileReader();
                vReader.onload = (e) => {
                    if (this.image == null) {
                        this.image = new TImage();
                        this.image.onImageLoaded = (e) => {  // eslint-disable-line
                            this.update();
                        }
                    }

                    this.image.src = vReader.result;
                    //this.imgControl.src = vReader.result;
                }
                vReader.readAsDataURL(openDlg.firstFile);
            }); 
        }

        let vMenu = menuFile.addItem("导出");
        vMenu.addItem("txt文件");
        vMenu.addItem("xml文件");
        vMenu.addSpliter();
        vMenu.addItem("图形文件");

        let btnFile = new TToolMenuButton("文件");
        btnFile.image.src = "../image/file.png";
        btnFile.textVisible = true;
        btnFile.hint = "文档处理";
        btnFile.dropDownMenu = menuFile;
        this.captionBar.addControl(btnFile);
        
        this.captionBar.addButton("新建", false, "../image/new.png").onClick = () => { hcl.showMessage("触发了新建事件"); };
        this.captionBar.addButton("保存", false, "../image/save.png").onClick = () => { hcl.showMessage("触发了保存事件"); };
        this.captionBar.addButton("打印", false, "../image/print.png");
        this.captionBar.addSpliter();
        this.captionBar.addButton("撤销", false, "../image/undo.png");
        this.captionBar.addButton("恢复", false, "../image/redo.png");

        this.cbbFontColor = new TColorCombobox();
        this.cbbFontColor.hint = "改变主题颜色";
        this.cbbFontColor.align = TAlign.Left;
        this.cbbFontColor.color = theme.backgroundStaticColor;
        this.cbbFontColor.onSelectedIndexChange = () => {
            theme.backgroundStaticColor = this.cbbFontColor.color;
            hcl.update();
        }
        this.captionBar.addControl(this.cbbFontColor);

        let toolBtn = this.captionBar.addButton("切换到设计期");
        toolBtn.onClick = () => {
            if (!hcl.design) {
                toolBtn.text = "多次按ESC键回到运行期";
                hcl.design = true;
            }
        }

        this.onKeyDown = (e) => {
            if (e.keyCode == TKey.Escape && hcl.design) {
                hcl.design = false;
                toolBtn.text = "切换到设计期";
            }
        }

        let lblHint = new TLable("这是一个普通TLable用12磅宋体");
        lblHint.font.size = 12;
        lblHint.left = 20;
        lblHint.top = 20;
        lblHint.autoSize = true;
        this.addControl(lblHint);

        let urlHCL = new TUrlLable("这是一个URL点击跳转到百度");
        urlHCL.url = "http://www.baidu.com";
        urlHCL.hint = urlHCL.url;
        urlHCL.left = lblHint.right + 40;
        urlHCL.top = lblHint.top;
        this.addControl(urlHCL);

        let btn = new TButton("普通按钮");
        btn.hint = "这是一个普通按钮";
        btn.left = 40;
        btn.top = lblHint.bottom + 20;
        btn.onClick = () => { hcl.showMessage("你点了普通按钮啦！弹出模态窗体！"); }
        this.addControl(btn);

        let imgBtn = new TImageButton("带图标按钮");
        imgBtn.image.src = "../image/file.png";
        imgBtn.left = btn.right + 40;
        imgBtn.top = btn.top;
        this.addControl(imgBtn);

        let hideBtn = new TButton("我运行时不可见");
        hideBtn.left = imgBtn.right + 40;
        hideBtn.top = imgBtn.top;
        hideBtn.width = 120;
        hideBtn.visible = false;
        this.addControl(hideBtn);

        this.imgControl = new TImage();
        this.imgControl.hint = "这是一个图片控件，可以用文件菜单里的打开更换本地图片";
        this.imgControl.left = hideBtn.right + 20;
        this.imgControl.top = imgBtn.top;
        this.imgControl.autoSize = true;
        this.imgControl.src = "../image/test.png";
        this.addControl(this.imgControl);

        let prgBar = new TProgressBar()
        prgBar.hint = "这是一个进度条，同时也使用了TTimer定时器";
        prgBar.left = 40;
        prgBar.top = btn.bottom + 20;
        prgBar.width = 200;
        prgBar.position = 50;
        this.addControl(prgBar);

        let timer = new TTimer(200);
        timer.onTimer = () => {
            if (prgBar.position < prgBar.max)
                prgBar.position++;
            else
                prgBar.position = prgBar.min;
        }
        timer.enabled = true;

        let trackBar = new TTrackBar();
        trackBar.hint = "拖动我改变整体不透明度";
        trackBar.left = 40;
        trackBar.top = prgBar.bottom + 20;
        trackBar.width = 200;
        trackBar.min = 20;
        trackBar.position = 100;
        trackBar.onChange = () => { this.alpha = trackBar.position / 100; }
        this.addControl(trackBar);

        let grid = new TGrid(25, 4);
        grid.hint = "我是一个Grid，但现在还没有编辑单元格的能力^_^||";
        grid.fixRowCount = 1;
        grid.setColWidth(0, 30);
        grid.setColWidth(1, 60);
        grid.setColWidth(2, 30);
        grid.setColWidth(3, 60);
        grid.rows[0][0].value = "床号";
        grid.rows[0][1].value = "住院号";
        grid.rows[0][2].value = "诊次";
        grid.rows[0][3].value = "姓名";
        grid.rows[1][0].value = "12";
        grid.rows[1][1].value = "2543";
        grid.rows[1][2].value = "2";
        grid.rows[1][3].value = "张三四";
        grid.left = 40;
        grid.transparent = true;
        grid.top = trackBar.bottom + 20;
        this.addControl(grid);

        this.panel = new TPanel();
        this.panel.hint = "我是一个panel，可作为容器";
        this.panel.left = grid.right + 20;
        this.panel.top = grid.top;
        this.addControl(this.panel);

        let chkBox = new TCheckBox("勾选控件");
        chkBox.left = 40;
        chkBox.top = grid.bottom + 20;
        this.addControl(chkBox);

        let edit = new TEdit();
        edit.textPrompt = "没内容时我就提示你";
        edit.left = chkBox.right + 20;
        edit.top = chkBox.top;
        edit.width_ = 150;
        this.addControl(edit);

        let lblEdit = new TLableEdit("姓名：", "带Lable的Edit");
        lblEdit.left = edit.right + 20;
        lblEdit.top = edit.top;
        lblEdit.width = 150;
        this.addControl(lblEdit);

        let btnEdit = new TButtonEdit("带button的Edit");
        btnEdit.left = 40;
        btnEdit.top = lblEdit.bottom + 20;
        this.addControl(btnEdit);

        let combobox = new TCombobox("");
        combobox.left = btnEdit.right + 20;
        combobox.top = btnEdit.top;
        combobox.textPrompt = "请选择！";
        combobox.addItem("选项1");
        combobox.addItem("选项2");
        combobox.addItem("选项3");
        combobox.addItem("选项4");
        combobox.addItem("选项5");
        this.addControl(combobox);

        let listBox = new TListBox();
        listBox.left = combobox.right + 20;
        listBox.top = combobox.top;
        listBox.addItem("项目一");
        listBox.addItem("项目二");
        listBox.addItem("项目三");
        listBox.addItem("项目四");
        listBox.addItem("项目五");
        listBox.addItem("项目六");
        this.addControl(listBox);

        let popupMenu = new TPopupMenu();
        popupMenu.addItem("菜单一");
        popupMenu.addItem("菜单二");
        popupMenu.addItem("菜单三");
        popupMenu.addSpliter();
        popupMenu.addItem("菜单四").addItem("子菜单一");
        popupMenu.addItem("菜单五");
        this.popupMenu = popupMenu;

        let pageControl = new TPageControl();
        pageControl.left = 20;
        pageControl.top = combobox.bottom + 20;
        pageControl.showCloseButton = true;
        let vPage1 = pageControl.addPage("一页");
        let vBtn = new TButton("按钮");
        vBtn.left = 20;
        vBtn.top = 20;
        vPage1.addControl(vBtn);
        pageControl.addPage("二页");
        pageControl.addPage("三页");
        this.addControl(pageControl);

        let treeView = new TTreeView();
        treeView.left = listBox.right + 20;
        treeView.top = pageControl.top;
        let vNode = treeView.addNode("节点一");
        vNode.addNode("子节点1");
        vNode.addNode("子节点2");
        vNode.addNode("子节点3").addNode("子节点");
        treeView.addNode("节点二");
        treeView.addNode("节点三").addNode("子节点");
        treeView.addNode("节点四");
        treeView.addNode("节点五");
        this.addControl(treeView);

        let statebar = new TToolBar();
        statebar.align = TAlign.Bottom;
        let lable = new TLable("Copyright© 2019-2020 HCView ");
        lable.font.name = "Arial";
        lable.align = TAlign.Left;
        statebar.addControl(lable);
        let urllable = new TUrlLable("京ICP备19050288号");
        urllable.hint = "京ICP备19050288号";
        urllable.url = "http://beian.miit.gov.cn";
        urllable.font.name = "Arial";
        urllable.align = TAlign.Left;
        statebar.addControl(urllable);
        this.addControl(statebar);
    }
}

application.icon.src = "../image/hcview.png";
let mainForm = new TFrmDemo(hcl.width, hcl.height);
application.addForm(mainForm);
hcl.homePath = "./";
hcl.autoWidth = true;
application.run();

// hcl.design = true;