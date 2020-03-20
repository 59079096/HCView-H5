import { TPoint, TEnumSet, TList } from "./System.js";

export var TClipType = {
    None: 0,
    Intersection: 1,
    Union: 2,
    Difference: 3,
    Xor: 4
}

var TPathType = {
    Subject: 0, 
    Clip: 1
}

var TFillRule = {
    EvenOdd: 0, 
    NonZero: 1,
    Positive: 2,
    Negative: 3
}

var TVertexFlag = {
    OpenStart: 1, 
    OpenEnd: 1 << 1, 
    LocMax: 1 << 2, 
    LocMin: 1 << 3
}

class TVertex {
    constructor() {
        this.point = new TPoint();
        this.next = null;
        this.prev = null;
        this.flags = new TEnumSet();
    }
}

class TScanLine {
    constructor() {
        this.y = 0;
        this.next = null;
    }
}

class TLocalMinima {
    constructor() {
        this.vertex = new TVertex();
        this.polyType = TPathType.Subject;
        this.isOpen = false;
    }
}

export class TRegion extends TList {
    constructor() {
        super(true);
        this.isOpen = false;
        this.FBotY = 0;
        this.FActives = null;
        this.FSel = null;
        this.FScanLine = new TScanLine();
        this.FFillRule = TFillRule.EvenOdd;
        this.FClipType = TClipType.None;
        this.FCurrentLocMinIdx = 0;
        this.FLocMinListSorted = false;
        this.FHasOpenPaths = false;
        this.FLocMinList = new TList();
        this.FVertexList = new TList();
    }

    _addLocMin(vertex, pathType, isOpen) {
        if (vertex.flags.has(TVertexFlag.LocMin))
            return;
      
        vertex.flags.add(TVertexFlag.LocMin);
        let vLocalMinima = new TLocalMinima();
        vLocalMinima.vertex = vertex;
        vLocalMinima.polyType = pathType;
        vLocalMinima.isOpen = isOpen;
        this.FLocMinList.add(vLocalMinima);
    }

    _addPathToVertexList(pointArray, pathType, isOpen) {
        let vPathLen = pointArray.length;
        if (vPathLen < 2)
            return;
      
        let vP0IsMinima = false;
        let vP0IsMaxima = false;
        let vGoingUp = false;
        let i = 1;

        while ((i < vPathLen) && (pointArray[i].y == pointArray[0].y))
            i++;

        let vIsFlat = i == vPathLen;
        if (vIsFlat) {
            if (!isOpen)
                return;

            vGoingUp = false;
        } else {
            vGoingUp = pointArray[i].y < pointArray[0].y;
            if (vGoingUp) {
                i = vPathLen -1;
                while (pointArray[i].y == pointArray[0].y)
                    i--;

                vP0IsMinima = pointArray[i].y < pointArray[0].y;
            } else {
                i = vPathLen -1;
                while (pointArray[i].y == pointArray[0].y)
                    i--;

                vP0IsMaxima = pointArray[i].y > pointArray[0].y;
            }
        }

        let vVertex = null;
        let vVertexArray = new Array(0);
        for (let vC = 0; vC < vPathLen; vC++) {
            vVertex = new TVertex();
            vVertexArray.push(vVertex);
        }

        this.FVertexList.add(vVertexArray);
      
        vVertexArray[0].point.resetByPoint(pointArray[0]);
        //vVertexArray[0].flags.value = 0;
        if (isOpen) {
            vVertexArray[0].flags.add(TVertexFlag.OpenStart);
            if (vGoingUp)
                this._addLocMin(vVertexArray[0], pathType, isOpen);
            else
                vVertexArray[0].flags.add(TVertexFlag.LocMax);
        }
      
        i = 0;
        for (let j = 1; j < vPathLen; j++) {
            vVertexArray[j].point.resetByPoint(pointArray[j]);
            if (vVertexArray[j].point.equal(vVertexArray[i].point))
                continue;

            //vVertexArray[j].flags.value = 0;
            vVertexArray[i].next = vVertexArray[j];
            vVertexArray[j].prev = vVertexArray[i];
            if ((pointArray[j].y > pointArray[i].y) && vGoingUp) {
                vVertexArray[i].flags.add(TVertexFlag.LocMax);
                vGoingUp = false;
            } else if ((pointArray[j].y < pointArray[i].y) && (!vGoingUp)) {
                vGoingUp = true;
                this._addLocMin(vVertexArray[i]);
            }

            i = j;
        }

        vVertexArray[i].next = vVertexArray[0];
        vVertexArray[0].prev = vVertexArray[i];
      
        if (isOpen) {
            vVertexArray[i].flags.add(TVertexFlag.OpenEnd);
            if (vGoingUp)
                vVertexArray[i].flags.add(TVertexFlag.LocMax);
            else
                this._addLocMin(vVertexArray[i]);
        } else if (vGoingUp) {
            vVertex = vVertexArray[i];
            while (vVertex.next.point.y <= vVertex.point.y)
                vVertex = vVertex.next;

            vVertex.flags.has(TVertexFlag.LocMax);
            if (vP0IsMinima)
                this._addLocMin(vVertexArray[0]);
        } else {
            vVertex = vVertexArray[i];
            while (vVertex.next.point.y >= vVertex.point.y)
                vVertex = vVertex.next;
      
            this._addLocMin(vVertex);
            if (vP0IsMaxima)
                vVertexArray[0].flags.add(TVertexFlag.LocMax);
        }
    }

    _addPath(pointArray, pathType = TPathType.Subject, isOpen = false) {
        if (isOpen) {
            if (pathType == TPathType.Clip)
                system.exception("只有主路径才能处于Open状态");

            this.FHasOpenPaths = true;
        }
        
        this.LocMinListSorted = false;
        this._addPathToVertexList(pointArray, pathType, isOpen);
    }

    _addPaths(pathType, isOpen = false) {
        for (let i = 0; i < this.count; i++)
            this._addPath(this[i], pathType, isOpen);
    }

    _locMinListSort(item1, item2) {
        let dy = item2.vertex.point.y - item1.vertex.point.y;
        if (dy < 0)
            return -1;
        else if (dy > 0)
            return 1;
        else
            return 0;
    }

    _insertScanLine(y) {
        if (this.FScanLine == null) {
            let newSl = new TScanLine();
            newSl.y = y;
            this.FScanLine = newSl;
            newSl.next = null;
        } else if (y > this.FScanLine.y) {
            let newSl = new TScanLine();
            newSl.y = y;
            newSl.next = this.FScanLine;
            this.FScanLine = newSl;
        } else {
            let sl = this.FScanLine;
            while ((sl.next != null) && (Y <= sl.next.y))
                sl = sl.next;

            if (y == sl.y)
                return;

            let newSl = new TScanLine();
            newSl.y = y;
            newSl.next = sl.next;
            sl.next = newSl;
        }
    }

    _reset() {
        if (!this.FLocMinListSorted) {
            this.FLocMinList.sort(this._locMinListSort);
            this.FLocMinListSorted = true;
        }

        for (let i = this.FLocMinList.count -1; i >= 0; i--)
            this._insertScanLine(this.FLocMinList[i].vertex.point.y);
  
        this.FCurrentLocMinIdx = 0;
        this.FActives = null;
        this.FSel = null;
    }

    _popScanLine() {
        let vResult = this.FScanLine != null;
        if (!vResult) {
            return {
                result: false,
                y: 0
            }
        }

        let vY = this.FScanLine.y;
        //let vSL = FScanLine;
        this.FScanLine = this.FScanLine.next;
        //dispose(vSL);
        return {
            result: true,
            y: vY
        }
    }

    _topX(e, currentY) {
        if ((currentY == e.top.y) || (e.top.x == e.bot.x))
            return e.top.x;
        else
            return e.bot.x + Math.round(e.Dx * (currentY - e.bot.y));
    }

    _adjustCurrXAndCopyToSEL(topY) {
        this.FSel = this.FActives;
        let e = this.FActives;
        while (e != null) {
            e.prevInSEL = e.prevInAEL;
            e.nextInSEL = e.nextInAEL;
            e.currX = this._topX(e, topY);
            e = e.nextInAEL;
        }
    }

    _buildIntersectList(topY) {
        if ((this.FActives == null) || (this.FActives.nextInAEL = null))
            return false;
    
        this._adjustCurrXAndCopyToSEL(topY);

        let vJumpSize = 1, vLCnt, vRCnt;
        let vFirst, vSecond, vBase, vPrevBase, vP, vN, vTmp;
        while (true) {
            vFirst = this.FSel;
            vPrevBase = null;
            
            while (vFirst != null) {
                if (vJumpSize == 1) {
                    vSecond = vFirst.nextInSEL;
              
                    if (vSecond == null) {
                        vFirst.jump = null;
                        break;
                    }
                
                    vFirst.Jump = vSecond.nextInSEL;
                } else {
                    vSecond = vFirst.jump;
              
                    if (vSecond == null) {
                        vFirst.jump = null;
                        break;
                    }

                    vFirst.jump = vSecond.jump;
                }
      
                vBase = vFirst;
                vLCnt = vJumpSize;
                vRCnt = vJumpSize;
                while ((vLCnt > 0) && (vRCnt > 0)) {
                    if (vFirst.currX > vSecond.currX) {
                        vTmp = vSecond.prevInSEL;
      
                        for (let i = 1; i <= vLCnt; i++) {
                            this._addNewIntersectNode(vTmp, vSecond, topY);
                            vTmp = vTmp.prevInSEL;
                        }
        
                        if (vFirst === vBase) {
                            if (vPrevBase != null)
                                vPrevBase.jump = vSecond;
                    
                            vBase = vSecond;
                            vBase.jump = vFirst.jump;
                    
                            if (vFirst.prevInSEL == null) 
                                this.FSel = vSecond;
                        }

                        vTmp = vSecond.nextInSEL;
                        vP = vSecond.prevInSEL;
                        vN = vSecond.nextInSEL;
                        vP.nextInSEL = vN;
                        if (vN != null)
                            vN.PrevInSEL = vP;

                        vP = vFirst.prevInSEL;
                        if (vP != null)
                            vP.nextInSEL = vSecond;

                        vFirst.prevInSEL = vSecond;
                        vSecond.prevInSEL = vP;
                        vSecond.nextInSEL = vFirst;
        
                        vSecond = vTmp;
                        if (vSecond == null)
                            break;
        
                        vRCnt--;
                    } else {
                        vFirst = vFirst.nextInSEL;
                        vLCnt--;
                    }
                }

                vFirst = vBase.jump;
                vPrevBase = vBase;
            }

            if (this.FSel.jump == null)
                break;
            else
                vJumpSize = vJumpSize << 1;
        }
        
        return this.FIntersectList.count > 0;
    }

    _intersectListSort(node1, node2) {
        let vResult = node2.point.y - node1.point.y;
        if ((vResult = 0) && (node1 !== node2))
            vResult = node1.point.x - node2.point.x;

        return vResult;
    }

    _edgesAdjacentInAEL(node) {
        return (node.edge1.nextInAEL == node.edge2) || (node.edge1.prevInAEL == node.edge2);
    }
    
    _isOpen(e) {
        return e.locMin.isOpen;
    }

    _intersectEdges(Ae1, Ae2, Apt, AorientationCheckRequired = false) {
        let ve1WindCnt, ve2WindCnt, ve1WindCnt2, ve2WindCnt2;    
        if (this.FHasOpenPaths && (this._isOpen(Ae1) || this._isOpen(Ae2))) {
            if (this._isOpen(Ae1) && this._isOpen(Ae2)) 
                return;

            if (this._isOpen(Ae2))
                this._swapActives(Ae1, Ae2);
        
            switch (this.FClipType) {
                case TClipType.Intersection:
                case TClipType.Difference:
                    if (this._isSamePolyType(Ae1, Ae2) || (Math.abs(Ae2.windCnt) != 1))
                        return;
                        break;
        
                case TClipType.Union:
                    if (this._isHotEdge(Ae1) != ((Math.abs(Ae2.windCnt) != 1) || (this._isHotEdge(Ae1) != (Ae2.windCnt2 != 0))))
                        return;
                        break;
        
                case TClipType.Xor:
                    if (Math.abs(Ae2.windCnt) != 1)
                        return;
            }

            if (this._isHotEdge(Ae1)) {
                this._addOutPt(Ae1, Apt);
                this._terminateHotOpen(Ae1);
            } else
                this._startOpenPath(Ae1, Apt);
        
            return;
        }
        
        if (this._isSamePolyType(Ae1, Ae2)) {
            if (this.FFillRule == TFillRule.EvenOdd) {
                ve1WindCnt = Ae1.windCnt;
                Ae1.windCnt = Ae2.windCnt;
                Ae2.windCnt = ve1WindCnt;
            } else {
                if (Ae1.windCnt + Ae2.windDx == 0)
                    Ae1.windCnt = -Ae1.windCnt;
                else
                    Ae1.windCnt += Ae2.windDx;
        
                if (Ae2.windCnt - Ae1.windDx == 0)
                    Ae2.windCnt = -Ae2.windCnt;
                else
                    Ae2.windCnt -= Ae1.windDxw;
            }
        } else {
            if (this.FFillRule != TFillRule.EvenOdd)
                Ae1.windCnt2 += Ae2.windDx;
            else if (Ae1.windCnt2 == 0)
                Ae1.windCnt2 = 1;
            else
                Ae1.windCnt2 = 0;
        
            if (this.FFillRule != TFillRule.EvenOdd)
                Ae2.windCnt2 -= Ae1.windDx;
            else if (Ae2.windCnt2 == 0)
                Ae2.windCnt2 = 1;
            else
                Ae2.windCnt2 = 0;
        }
        
        switch (this.FFillRule) {
            case TFillRule.Positive:
                ve1WindCnt = Ae1.windCnt;
                ve2WindCnt = Ae2.windCnt;
                break;
        
            case TFillRule.Negative:
                ve1WindCnt = -Ae1.windCnt;
                ve2WindCnt = -Ae2.windCnt;
                break;

            default:
                ve1WindCnt = Math.abs(Ae1.windCnt);
                ve2WindCnt = Math.abs(Ae2.windCnt);
                break;
        }
        
        if ((!this._isHotEdge(Ae1) && !( (ve1WindCnt == 0) || (ve1WindCnt == 1) )) 
            || (!this._isHotEdge(Ae2) && !( (ve2WindCnt == 0) || (ve2WindCnt == 1) )))
            return;
        
        if (this._isHotEdge(Ae1) && this._isHotEdge(Ae2)) {
            if (!( (ve1WindCnt == 0) || (ve1WindCnt == 1) ) || !( (ve2WindCnt == 0) || (ve2WindCnt == 1) ) 
                || (!this._isSamePolyType(Ae1, Ae2) && (this.FClipType != TClipType.Xor)))
            {
                this._addLocalMaxPoly(Ae1, Ae2, Apt);
            } else if (this._isFront(Ae1) || (Ae1.outRec == Ae2.outRec)) {
                this._addLocalMaxPoly(Ae1, Ae2, Apt);
                this._addLocalMinPoly(Ae1, Ae2, Apt);
            } else {
                // right & left bounds touching, NOT maxima & minima ...
                this._addOutPt(Ae1, Apt);
                this._addOutPt(Ae2, Apt);
                this._swapOutRecs(Ae1, Ae2);
            }
        } else if (this._isHotEdge(Ae1)) {
            this._addOutPt(Ae1, Apt);
            this._swapOutRecs(Ae1, Ae2);
        } else if (this._isHotEdge(Ae2)) {
            this._addOutPt(Ae2, Apt);
            this._swapOutRecs(Ae1, Ae2);
        } else {
            switch (this.FFillRule) {
                case TFillRule.Positive:
                    ve1WindCnt2 = Ae1.windCnt2;
                    ve2WindCnt2 = Ae2.windCnt2;
                    break;

                case TFillRule.Negative:
                    ve1WindCnt2 = -Ae1.windCnt2;
                    ve2WindCnt2 = -Ae2.windCnt2;
                    break;
                
                default:
                    ve1WindCnt2 = Math.abs(Ae1.windCnt2);
                    ve2WindCnt2 = Math.abs(Ae2.windCnt2);
                    break;
            }
        
            if (!this._isSamePolyType(Ae1, Ae2))
                this._addLocalMinPoly(Ae1, Ae2, Apt, false, AorientationCheckRequired);
            else if ((ve1WindCnt == 1) && (ve2WindCnt == 1)) {
                switch (this.FClipType) {
                    case TClipType.Intersection:
                        if ((ve1WindCnt2 > 0) && (ve2WindCnt2 > 0))
                            this._addLocalMinPoly(Ae1, Ae2, Apt, false, AorientationCheckRequired);
                        break;

                    case TClipType.Union:
                        if ((ve1WindCnt2 <= 0) && (ve2WindCnt2 <= 0))
                            this._AddLocalMinPoly(Ae1, Ae2, Apt, false, AorientationCheckRequired);
                        break;

                    case TClipType.Difference:
                        if (((this._getPolyType(Ae1) == TPathType.Clip) && (ve1WindCnt2 > 0) && (ve2WindCnt2 > 0)) 
                            || ((this._getPolyType(Ae1) == TPathType.Subject) && (ve1WindCnt2 <= 0) && (ve2WindCnt2 <= 0)))
                            this._addLocalMinPoly(Ae1, Ae2, Apt, false, AorientationCheckRequired);
                        break;

                    case TClipType.Xor:
                        this._addLocalMinPoly(Ae1, Ae2, Apt, false, AorientationCheckRequired);
                        break;
                }
            }
        }
    }

    _processIntersectList() {
        this.FIntersectList.sort(this._intersectListSort);
        let vHighI = this.FIntersectList.count - 1;
        let j, vNode;
        for (let i = 0; i <= vHighI; i++) {
            if (!this._edgesAdjacentInAEL(this.FIntersectList[i])) {
                j = i + 1;
            
                while (!this._edgesAdjacentInAEL(this.FIntersectList[j]))
                    j++;
                
                vNode = this.FIntersectList[i];
                this.FIntersectList[i] = this.FIntersectList[j];
                this.FIntersectList[j] = vNode;
            }

            if ((i < vHighI) && (this.FIntersectList[i + 1].point.y > this.FIntersectList[i].point.y))
                this._intersectEdges(this.FIntersectList[i].edge1, this.FIntersectList[i].edge2, this.FIntersectList[i].point, true);
            else
                this._intersectEdges(this.FIntersectList[i].edge1, this.FIntersectList[i].edge2, this.FIntersectList[i].point);

            this._swapPositionsInAEL(this.FIntersectList[i].edge1, this.FIntersectList[i].edge2);
        }
    }

    _disposeIntersectNodes() {
        for (let i = 0; i < this.FIntersectList.count; i++)
            this.FIntersectList[i] = null;

        this.FIntersectList.clear;
    }

    _doIntersections(topY) {
        if (this._buildIntersectList(topY)) {
            try {
                this._processIntersectList;
            } finally {
                this._disposeIntersectNodes;
            }
        }
    }

    _doTopOfScanbeam(AY) {
        let ve;
        this.FSel = null;
        ve = this.FActives;
        while (ve != null) {
            if (ve.top.y == AY) {
                ve.currX = ve.top.x;
                if ((ve.prevInAEL != null) && (ve.prevInAEL.currX == ve.currX)
                    && (ve.prevInAEL.bot.y != AY) && this._isHotEdge(ve.prevInAEL))
                    this._addOutPt(ve.prevInAEL, ve.top);

                if ((ve.nextInAEL != null) && (ve.nextInAEL.currX == ve.currX)
                    && (ve.nextInAEL.top.y != AY) && this._isHotEdge(ve.nextInAEL))
                    this._addOutPt(ve.nextInAEL, ve.top);
            
                if (this._isMaxima(ve)) {
                    ve = this._doMaxima(ve);
                    continue;
                } else {
                    this._updateEdgeIntoAEL(ve);
                    if (this._isHotEdge(ve))
                        this._addOutPt(ve, ve.bot);

                    if (this._isHorizontal(ve))
                        this._pushHorz(ve);
                }
            }
            ve = ve.nextInAEL;
        }
    }

    _executeInternal(clipType, fillRule) {
        if (clipType == TClipType.None)
            return;

        this.FFillRule = fillRule;
        this.FClipType = clipType;
        this._reset();

        let vInfo = this._popScanLine();
        if (vInfo.result)
            return;

        let vActive = null;
        while (true) {
            this._insertLocalMinimaIntoAEL(vInfo.y);
            while (this._popHorz(vActive))
                this._doHorizontal(vActive);
          
            this.FBotY = vInfo.y;
            vInfo = this._popScanLine();
            if (!vInfo.result)
                break;

            this._doIntersections(vInfo.y);
            this._doTopOfScanbeam(vInfo.y);
        }
    }

    _bBuildResult() {
        try {
            let vCntClosed = 0, vCntOpen = 0;
            this.length = this.FOutRecList.count;
            let vOpenPaths = new TList();
            vOpenPaths.length = this.FOutRecList.count;
            let vOutRec, j;
            for (let i = 0; i < this.FOutRecList.count; i++) {
                vOutRec = this.FOutRecList[i];
                if (vOutRec.pts == null)
                    continue;
            
                if (this._isOpen(vOutRec)) {
                    vOpenPaths[vCntOpen] = this._buildPath(vOutRec.pts);
                    if (vOpenPaths[vCntOpen].length > 1)
                        vCntOpen++;
                } else {
                    this[vCntClosed] = this._buildPath(vOutRec.pts);
                    j = this[vCntClosed].length - 1;
                    if ((j > 1) && (this[vCntClosed][0].equal(this[vCntClosed][j])))
                        this[vCntClosed].length = j;
            
                    if (j > 1)
                        vCntClosed++;
                }
            }

            this.length = vCntClosed;
            vOpenPaths.length = vCntOpen;
            //Result := true;
        } catch (ex) {
            // false;
        }
    }

    _cleanUp() {
        try {
            while (this.FActives != null)
                this._deleteFromAEL(this.FActives);
          
            while (this.FScanLine != null)
                this._popScanLine();
      
            this._disposeIntersectNodes();
            this._disposeScanLineList();
            this._disposeAllOutRecs();
        } catch (e) {
            //
        }
    }

    _execute(clipType) {
        try {
            try {
                this._executeInternal(clipType);
                this._buildResult();
            } catch (e) {
                //
            }
        } finally {
            this._cleanUp();
        }
    }

    // newRgn(pointArray) {
    //     let vRegion = new TRegionMember();
    //     for (let i = 0; i < pointArray.length; i++)
    //         vRegion.points.add(TRegionPoint.Create(pointArray[i].x, pointArray[i].y));

    //     this.add(vRegion);
    // }

    combineRgn(pointArray, clipType = TClipType.Union) {
        this._addPaths(TPathType.Subject);
        this._addPath(pointArray, TPathType.Clip);
        this._execute(clipType, TFillRule.NonZero);
    }

    combineRect(rect) {
        let vLeftTop = TPoint.Create(rect.left, rect.top);
        let vRightTop = TPoint.Create(rect.right, rect.top);
        let vRightBottom = TPoint.Create(rect.right, rect.bottom);
        let vLeftBottom = TPoint.Create(rect.left, rect.bottom);
        this.combineRgn([vLeftTop, vRightTop, vRightBottom, vLeftBottom]);
    }
}