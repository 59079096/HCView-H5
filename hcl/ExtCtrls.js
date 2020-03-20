import { TComponent } from "./Controls.js";

export class TTimer extends TComponent {
    constructor(interval = 1000) {
        super();
        this.interval = interval;
        this._handle = 0;
        this._enable = false;
        this._nextTime = 0;
        this._deactivateEnable_ = false;
    }

    _doTimer() {
        let vOffset = Date.now() - this._nextTime;
        //if (vOffset > this.interval) 说明耗时超过时间间隔了，下面的Max(0, this.interval - vOffset)保证以最快的速度追回来       
        //console.log("误差：" + vOffset + "ms，下一次执行：" + (this.interval - vOffset) + "ms后");
        this._nextTime += this.interval;
        this.onTimer();
        this._handle = setTimeout(() => { this._doTimer(); }, Math.max(0, this.interval - vOffset));
    }

    _reset() {
        if (this._handle > 0)
            clearTimeout(this._handle);

        if (this._enable) {
            this._nextTime = Date.now() + this.interval;
            this._handle = setTimeout(() => { this._doTimer(); }, this.interval);
            //this._handle = setTimeout(this._doTimer(), this.interval);这么写有问题
        }
    }

    get enabled() {
        return this._enable;
    }

    set enabled(val) {
        if (this._enable != val) {
            this._enable = val;
            this._reset();
        }
    }

    onTimer() { }
}

export class TAnimate extends TComponent {
    constructor() {
        super();
        this._handle = 0;
        this._startTime = 0;
        this._lastExecTime = 0;
        this.object = null;
        this.time = 1000;
    }

    static Create(time, obj) {
        let vAnimate = new TAnimate();
        vAnimate.time = time;
        vAnimate.object = obj;
        return vAnimate;
    }

    _execute(now) {
        if (this._startTime == 0) {
            this._startTime = now;
        } else {        
            this.doExecute_(now - this._lastExecTime);
            if (now - this._startTime >= this.time) {
                this.doStop_();
                return;
            }
        }

        this._lastExecTime = now;
        this._handle = window.requestAnimationFrame((e) => this._execute(e));
    }

    doStart_() {
        this._startTime = 0;
    }

    doStop_() { }

    doExecute_(interval) { }  // eslint-disable-line

    start() {
        if (this.object != null) {
            this.doStart_();
            this._handle = window.requestAnimationFrame((e) => this._execute(e));
        }
    }

    stop() {
        if (this._handle > 0) {
            window.cancelAnimationFrame(this._handle);
            this.doStop_();
        }
    }
}

export class TPropertyAnimate extends TAnimate {
    constructor(obj, prop) {
        super();
        this.object = obj;
        this.objectProperty = prop;
        this._value = 0;
        this._intervalAdd = 0;
        this.startValue = 0;
        this.endValue = 0;
    }

    static Create(time, obj, prop, startVal, endVal) {
        let vAnimate = new TPropertyAnimate(obj, prop);
        vAnimate.time = time;
        vAnimate.startValue = startVal;
        vAnimate.endValue = endVal;
        return vAnimate;
    }

    doStart_() {
        this._value = this.endValue - this.startValue;
        //this._property = ;
        super.doStart_();
    }

    doExecute_(interval) {
        //let vStep = Math.trunc(this._width / this.time * interval);  // 整数保证control移动时绘制不会出现多余的"隐线"
        this._intervalAdd += interval;  // 时间间隔太小时累加后多次一起处理，防止因为间隔太小移动距离为0导致的不移动
        let vStep = Math.trunc(this._value / this.time * this._intervalAdd);  // 整数保证control移动时绘制不会出现多余的"隐线"
        if (vStep == 0)
           return;
        else
            this._intervalAdd = 0;

        if (this.object[this.objectProperty] + vStep > this.endValue)  // 如果以整数处理，不需要这里的判断了
            this.object[this.objectProperty] = this.endValue;
        else
            this.object[this.objectProperty] += vStep;
    }
}