import { THCResizeRectItem } from "./HCRectItem.js";
import { THCShapeManager } from "./HCShape.js";
import { THCStyle } from "./HCStyle.js";
import { TImage, TImageSrcType } from "../hcl/StdCtrls.js";

export class THCImageItem extends THCResizeRectItem {
    constructor(ownereData) {
        super(ownereData);
        this.StyleNo = THCStyle.Image;
        this.FImage = null;
        this.FShapeManager = new THCShapeManager();
    }

    static Create(ownerData, width, height) {
        let vImageItem = new THCImageItem(ownerData);
        vImageItem.Width = width;
        vImageItem.Height = height;
        vImageItem.FCanResize = true;
        vImageItem.FGripSize = 8;
        return vImageItem;
    }

    GetWidth() {
        let vResult = super.GetWidth();
        if (vResult == 0)
            vResult = this.FImage.width;

        return vResult;
    }

    GetHeight() {
        let vResult = super.GetHeight();
        if (vResult == 0)
            vResult = this.FImage.height;

        return vResult;
    }

    DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenTop, dataScreenBottom, hclCanvas, paintInfo) {
        if ((this.FImage.width != this.Width) || (this.FImage.height != this.Height))
            hclCanvas.drawImageRect(drawRect, this.FImage.image);
        else
            hclCanvas.drawImage(drawRect.left, drawRect.top, this.FImage.image);

        this.FShapeManager.PaintTo(hclCanvas, drawRect, paintInfo);
        super.DoPaint(style, drawRect, dataDrawTop, dataDrawBottom, dataScreenBottom, dataScreenBottom, hclCanvas, paintInfo);
    }

    // public
    Assign(source) {
        super.Assign(source);
        this.FImage.assign(source.Image);
    }

    PaintTop(hclCanvas) {
        if (this.Resizing) {
            hclCanvas.save();
            try {
                hclCanvas.alpha = 0.5;
                hclCanvas.drawImageRect(this.ResizeRect, this.FImage.image);
                //hclCanvas.brush.color = "black";
                //hclCanvas.fillRect(this.ResizeRect);
            } finally {
                hclCanvas.restore();
            }
        }

        super.PaintTop(hclCanvas);
    }

    Clear() {
        this.FImage = TImage.Create(this.FImage.width, this.FImage.height);
    }

    RestrainSize(width, height) {
        if (this.Width > width) {
            let vBL = this.Width / width;
            this.Width = width;
            this.Height = Math.round(this.Height / vBL);
        }

        if (this.Height > height) {
            let vBL = this.Height / height;
            this.Height = height;
            this.Width = Math.round(this.Width / vBL);
        }
    }

    LoadFromBmpFile(file, loadedEvent) {
        let vReader = new FileReader();
        vReader.readAsDataURL(file);
        //vReader.readAsArrayBuffer(file);
        vReader.onload = (e) => {
            this.FImage = new TImage();
            this.FImage.onImageLoaded = () => {
                this.Width = this.FImage.width;
                this.Height = this.FImage.height;
                loadedEvent();
            }

            this.FImage.src = vReader.result;
        }
    }

    SaveToStream(stream, start, end) {
        super.SaveToStream(stream, start, end);
        this.FImage.saveToStream(stream);
        /*let vBase64 = this.FImage.src;
        let vSection = vBase64.split(",");
        let vBytes = TBytes.fromBase64(vSection[1]);
        stream.writeUInt32(vBytes.length);
        if (vBytes.length > 0)
            stream.writeBuffer(vBytes);*/

        this.FShapeManager.SaveToStream(stream);
    }

    LoadFromStream(stream, style, fileVersion) {
        super.LoadFromStream(stream, style, fileVersion);
        let vImageType = stream.readByte();
        if (vImageType > TImageSrcType.None) {
            stream.position -= Uint8Array.BYTES_PER_ELEMENT;
            if (this.FImage == null)
                this.FImage = new TImage();

            this.FImage.loadFromStream(stream);
        } else
            this.FImage = TImage.Create(this.Width, this.Height);

        if (fileVersion > 26)
            this.FShapeManager.LoadFromStream(stream);

        //this.DoImageChange(this);
    }

    ToHtml(path) {

    }

    ToXml(node) {
        super.ToXml(node);
    }

    ParseXml(node) {
        super.ParseXml(node);
    }

    RecoverOrigianlSize() {
        this.Width = this.FImage.width;
        this.Height = this.FImage.height;
    }

    get Image() {
        return this.FImage;
    }

    set Image(val) {
        this.FImage = val;
    }

    get ShapeManager() {
        return this.FShapeManager;
    }
}