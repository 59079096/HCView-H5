import { system } from "../hcl/System.js";

export class THCUnitConversion {
    constructor() {
        
    }

    static Initialization() {
        let vDPI = system.getDPI();
        THCUnitConversion.PixelsPerInchX = vDPI.x;  // 96
        THCUnitConversion.PixelsPerInchY = vDPI.y;  // 96

        THCUnitConversion.FontSizeScale = 72.0 / THCUnitConversion.PixelsPerInchX;
        THCUnitConversion.PixelsPerMMX = THCUnitConversion.PixelsPerInchX / 25.4;
        THCUnitConversion.PixelsPerMMY = THCUnitConversion.PixelsPerInchY / 25.4;
    }

    static twipToPixel(val, dpi) {
        return Math.round(val * dpi / 1440);
    }

    static pixelToTwip(val, dpi) {
        return Math.round(val * 1440 / dpi);
    }

    static twipToMillimeter(val) {
        return val * 25.4 / 1440;
    }

    static millimeterToTwip(val) {
        return val * 1440 / 25.4;
    }

    static pixXToMillimeter(val) {
        return val / THCUnitConversion.PixelsPerMMX;
    }

    static millimeterToPixX(val) {
        return Math.round(val * THCUnitConversion.PixelsPerMMX);
    }

    static pixYToMillimeter(val) {
        return val / THCUnitConversion.PixelsPerMMY;
    }

    static millimeterToPixY(val) {
        return Math.round(val * THCUnitConversion.PixelsPerMMY);
    }

    static ptToPixel(pt, dpi) {
        return Math.round(pt * dpi / 72);
    }

    static pixelToPt(pix, dpi) {
        return pix / dpi * 72;
    }
}

THCUnitConversion.PixelsPerInchX = 0;
THCUnitConversion.PixelsPerInchY = 0;

THCUnitConversion.FontSizeScale = 72.0 / THCUnitConversion.PixelsPerInchX;
THCUnitConversion.PixelsPerMMX = THCUnitConversion.PixelsPerInchX / 25.4;
THCUnitConversion.PixelsPerMMY = THCUnitConversion.PixelsPerInchY / 25.4;