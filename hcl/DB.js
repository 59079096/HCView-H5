/*=======================================================

    Html Component Library 前端UI框架 V0.1
    数据库操作单元
    作者：荆通(18114532@qq.com)
    QQ群：649023932

=======================================================*/

import { TObject, system } from "./System.js";

export class TIndexedDB extends TObject {
    constructor() {
        super();
        this._indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        if (!this._indexedDB)
            system.exception("当前浏览器不支持indexedDB！");

        this.name = "";
        this.db = null;
        this.onOpen = null;
        this.onUpgradeneeded = null;
    }

    open(dbname, version = 1) {
        let vRequest = this._indexedDB.open(dbname, version);
        vRequest.onerror = (e) => {
            system.exception(e.currentTarget.error.message);
        }
    
        vRequest.onsuccess = (e) => {
            this.db = e.target.result;
            this.name = dbname;
            if (this.onOpen != null)
                this.onOpen();
        }
    
        vRequest.onupgradeneeded = (e) => {
            this.db = e.target.result;
            if (this.onUpgradeneeded != null)
                this.onUpgradeneeded();
        }
    }

    close() {
        this.db.close();
    }

    deleteDB(name) {
        this._indexedDB.deleteDatabase(name);
    }

    select(tableName, where, callBack) {
        let vTransaction = this.db.transaction([tableName]);
        let vObjectStore = vTransaction.objectStore(tableName);
        let vRequest = vObjectStore.get(where);
     
        vRequest.onerror = (e) => {
            //console.log('事务失败');
        }
     
        vRequest.onsuccess = (e) => {
            callBack(vRequest.result);
        }
    }

    insert(tableName, data) {
        let vTransaction = this.db.transaction([tableName], "readwrite");
        vTransaction.onsuccess = (e) => {
            // 新记录增加成功
        }

        vTransaction.onerror = (e) => {
            // 新记录增加出错 ,e
        }

        let vStore = vTransaction.objectStore(tableName);
        vStore.add({ data });  // uid:uidVal, uname:unameVal, uemail:emailVal
    }

    update(tableName, data) {
        let vRequest = this.db.transaction([tableName], 'readwrite').objectStore(tableName).put({ data });
        vRequest.onsuccess = (e) => {
            //console.log('数据更新成功');
        }
        
        vRequest.onerror = (e) => {
            //console.log('数据更新失败');
        }
    }

    delete(tableName, data) {
        let vRequest = this.db.transaction([tableName], 'readwrite').objectStore(tableName).delete({ data });
        vRequest.onsuccess = (e) => {
            //console.log('数据更新成功');
        }
        
        vRequest.onerror = (e) => {
            //console.log('数据更新失败');
        }
    }
}