/*=======================================================

    Html Component Library 前端UI框架 V0.1
    常用控件单元
    作者：荆通(18114532@qq.com)
    QQ群：649023932

=======================================================*/

import { TComponent } from "./Controls.js";
import { TObject, TRect } from "./System.js";
import { hcl } from "./HCL.js";

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

export class TInterval extends TComponent {
    constructor(interval = 1000) {
        super();
        this._handle = 0;
        this._lastExecTime = 0;
        this._stoped = true;
        this.loop = false;
        this._interval = interval;
        this.onExecute = null;
    }

    _execute(now) {
        if (this._lastExecTime == 0)
            this._lastExecTime = now;
        else { 
            if (now - this._lastExecTime >= this._interval) {
                this.doExecute_();

                if (this.loop)
                    this._lastExecTime = now;
                else {
                    this.doStop_();
                    return;
                }
            }
        }

        if (!this._stoped)
            this._handle = window.requestAnimationFrame((e) => this._execute(e));
    }

    doStop_() {
        this._stoped = true;
    }

    doExecute_() {
        if (this.onExecute != null)
            this.onExecute();
     }

    start() {
        if (this._handle == 0) {
            this._stoped = false;
            this._lastExecTime = 0;
            this._handle = window.requestAnimationFrame((e) => this._execute(e));
        }
    }

    stop() {
        if (this._handle > 0) {
            window.cancelAnimationFrame(this._handle);
            this.doStop_();
            this._handle = 0;
        }
    }

    get enabled() {
        return !this._stoped;
    }

    set enabled(val) {
        if (val) {
            if (this._stoped)
                this.start();
        } else {
            if (!this._stoped)
                this.stop();
        }
    }
}

export class TAnimate extends TComponent {
    constructor() {
        super();
        this._handle = 0;
        this._startTime = 0;
        this._lastExecTime = 0;
        this._stoped = true;
        this.loop = false;
        this.object = null;
        this.time = 1000;  // 总共时长
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
            if (now - this._startTime >= this.time) {  // 动画时间到了
                if (this.loop)
                    this._startTime = now;
                else {
                    this.doStop_();
                    return;
                }
            }
        }

        if (!this._stoped) {
            this._lastExecTime = now;
            this._handle = window.requestAnimationFrame((e) => this._execute(e));
        }
    }

    doStart_() {
        this._startTime = 0;
        this._stoped = false;
    }

    doStop_() {
        this._stoped = true;
     }

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
            this._handle = 0;
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
        //let vStep = Math.trunc(this.width_ / this.time * interval);  // 整数保证control移动时绘制不会出现多余的"隐线"
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

export class TTheard extends TObject {
    constructor() {
        super();
    }

    static execute(fun, finishFun = null, errorFun = null) {
        let vPromise = new Promise((resolve, reject) => {
            try {
                fun();
                resolve();
            } catch (e) {
                reject();
            }
        });
        
        vPromise.then(
            () => {
                if (finishFun != null)
                    finishFun();
            },
            () => {
                if (errorFun != null)
                    errorFun();
            }
        );
    }

    static executeWait(fun, finishFun = null) {
        async function _sync_() {
            try {
                await fun();
            } finally {
                if (finishFun != null)
                    finishFun();
            }
        }

        _sync_();
    }
}

export class THintInfo extends TObject {
    constructor() {
        super();
        this.rect = new TRect();
        this.text = "";
        this.visible = false;
        this.control = null;
    }
}

let AudioContext = window.AudioContext || window.webkitAudioContext;

export let TPlayState = {
    Stop: 0,
    Pause:1,
    Play: 2,
    Loading: 3,
    Loaded: 4
}

export class TAudio extends TObject {
    constructor() {
        super();
        this.state_ = TPlayState.Stop;
        this.autoPlay = false;
        this.loop = false;
        this.audioContext_ = new AudioContext()
        this.bufferSourceNode_ = null;
        this.onStateChanged = null;
        this.onPlayFinish = null;
    }

    _setState(state) {
        if (this.state_ != state) {
            this.state_ = state;
            this.doStateChanged();
        }
    }

    _creatBuffer(buffer) {
        this.bufferSourceNode_ = this.audioContext_.createBufferSource();
        this.bufferSourceNode_.buffer = buffer;
        this.bufferSourceNode_.loop = this.loop;
        this.bufferSourceNode_.onended = () => {
            this.doPlayFinish();
        }

        this.bufferSourceNode_.connect(this.audioContext_.destination);
    }

    doStateChanged() {
        if (this.onStateChanged)
            this.onStateChanged();
    }

    doLoaded(buffer) {
        this._creatBuffer(buffer);
        this.bufferSourceNode_.connect(this.audioContext_.destination);
    }

    doPlayFinish() {
        this._setState(TPlayState.Stop);
        if (this.onPlayFinish != null)
            this.onPlayFinish();
    }

    loadFromFile(file) {
        let vReader = new FileReader();
        vReader.readAsArrayBuffer(file);
        this._setState(TPlayState.Loading);
        vReader.onload = () => {
            this.audioContext_.decodeAudioData(vReader.result, (buffer) => {
                if (!buffer) {
                    this._setState(TPlayState.Loaded);
                    this.stop();
                    hcl.exception("解码音频数据时发生错误！");
                }
                else {
                    this.doLoaded(buffer);
                    this._setState(TPlayState.Loaded);
                    if (this.autoPlay)
                        this.play();
                }
            });
        }
    }

    play() {
        if (this.state_ == TPlayState.Pause) {
            this._setState(TPlayState.Play);
            this.audioContext_.resume();
        } else {
            this._setState(TPlayState.Play);
            this.bufferSourceNode_.start(0, 0);
        }
    }

    stop() {
        this._setState(TPlayState.Stop);
        this.bufferSourceNode_.stop();
    }

    pause() {
        //this._time = this._audioContext.currentTime;
        this._setState(TPlayState.Pause);
        this.audioContext_.suspend();
    }

    close() {
        this.onStateChanged = null;
        this.onPlayFinish = null;
        this.audioContext_.close();
    }

    get state() {
        return this.state_;
    }
}

export class TRichAudio extends TAudio {
    constructor() {
        super();
        this._intervalID = 0;
        this.second = 0;
        this.duration = 0;
        this._gain = null;
        this.analyser = null;
        this.onProgress = null;
    }

    _startInterval() {
        if (this._intervalID > 0)
            this._stopInterval();
        else {
            this.doProgress();
            this._intervalID = setInterval(() => {
                this.second++;
                this.doProgress();
            }, 1000);
        }
    }

    _stopInterval() {
        if (this._intervalID > 0) {
            clearInterval(this._intervalID);
            this._intervalID = 0;
        }
    }

    doProgress() {
        if (this.onProgress != null)
            this.onProgress();
    }

    doLoaded(buffer) {
        super.doLoaded(buffer);
        this.duration = this.bufferSourceNode_.buffer.duration;  // 总时长
        this.analyser = this.audioContext_.createAnalyser();  // 频谱分析
        this.bufferSourceNode_.connect(this.analyser);
        //this._gain = this.audioContext_.createGain();  // 音量调节
        //this._analyserNode.connect(this._gain);
        this.analyser.connect(this.audioContext_.destination);
    }

    doStateChanged() {
        if (this.state_ == TPlayState.Stop) {
            this._stopInterval();
        } else if (this.state_ == TPlayState.Pause)
            this._stopInterval();
        else if (this.state_ == TPlayState.Play)
            this._startInterval();
        else if (this.state_ == TPlayState.Loaded)
            this.second = 0;
        
        super.doStateChanged();
    }

    stop() {
        this.second = 0;
        this.doProgress();
        super.stop();
    }

    close() {
        this.onProgress = null;
        super.close();
    }
}

export class TVideo extends TObject {
    constructor() {
        super();
    }
}

export let TWebSocketState = {
    Closed: 0,
    Closing: 1,
    Open: 2,
    Connecting: 3
}

export class TWebSocket extends TObject {
    constructor(url) {
        super();
        this.onOpen = null;
        this.onReceive = null;
        this.onClose = null;
        this.onError = null;

        this._socket = new WebSocket(url);
        this._socket.onopen = (e) => { this.doOpen(e); }
        this._socket.onmessage = (e) => { this.doMessage(e); }
        this._socket.onclose = (e) => { this.doClose(e); }
        this._socket.onerror = (e) => { this.doError(e); }
    }
    
    doOpen(e) {
        if (this.onOpen != null)
            this.onOpen(e);
    }

    doMessage(e) {
        if (this.onReceive != null)
            this.onReceive(e);
    }

    doClose(e) {
        if (this.onClose != null)
            this.onClose(e);
    }

    doError(e) {
        if (this.onError != null)
            this.onError(e);
    }

    snedBuffer(bytes) {
        this._socket.send(bytes);
    }

    sendText(text) {
        this._socket.send(text);
        this._socket.bufferedAmount
    }

    close() {
        this._socket.close();
    }

    get protocol() {
        return this._socket.protocol;
    }

    get state() {
        switch(this._socket.readyState) {
            case WebSocket.CONNECTING:  // 0
                return TWebSocketState.Connecting;

            case WebSocket.OPEN:  // 1
                return TWebSocketState.Open;

            case WebSocket.CLOSING:  // 2
                return TWebSocketState.Closing;
                
            default:  // WebSocket.CLOSED 3
                return TWebSocketState.Closed;
        }
    }
}

export class THttp extends TObject {
    constructor() {
        super();
    }

    static request(url, data, reqType, callBack = null, async = true) {
        let vXmlhttp = null;
        /*创建XMLHttpRequest对象，
         *老版本的 Internet Explorer（IE5 和 IE6）使用 ActiveX 对象：new ActiveXObject("Microsoft.XMLHTTP")
         * */
        if (window.XMLHttpRequest) {
            vXmlhttp = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            vXmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        /*判断是否支持请求*/
        if (vXmlhttp == null) {
            alert('你的浏览器不支持XMLHttp');
            return;
        }

        /*请求方式，并且转换为大写*/
        let httpType = reqType.toUpperCase();
        /*请求接口*/
        let httpUrl = url;
        /*是否异步请求*/
        let vAsync = async;
        /*请求参数--post请求参数格式为：foo=bar&lorem=ipsum*/
        let paramData = data || [];
        let param = [];
        for (let name in paramData)
            param.push(name + "=" + paramData[name]);

        let requestData = param.join("&");
        //console.log(requestData);

        /*请求接收*/
        vXmlhttp.onreadystatechange = function() {
            if(vXmlhttp.readyState == 4 && vXmlhttp.status == 200 && callBack != null)
                callBack(vXmlhttp.responseText);
            // else
            //     hcl.exception("http请求失败！");
        }

        vXmlhttp.onloadend = function(e) {  // 请求完成
            //callBack(null);
        }
        
        /*接口连接，先判断连接类型是post还是get*/
        if (httpType == "GET") {
            vXmlhttp.open("GET", httpUrl + "?" + requestData, vAsync);
            vXmlhttp.send(null);
        } else if (httpType == "POST") {
            vXmlhttp.open("POST", httpUrl, vAsync);
            //发送合适的请求头信息
            vXmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
            vXmlhttp.send(requestData); 
        }
    }

    static get(url, data = "", callBack = null, async = true) {
        THttp.request(url, data, "GET", callBack, async);
    }

    static post(url, data = "", callBack = null, async = true) {
        THttp.request(url, data, "POST", callBack, async);
    }
}