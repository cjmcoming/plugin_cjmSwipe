;var cjmDom = {
    hasClass:function(obj,cls) {
        return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    },
    addClass:function(obj,cls) {
        if(!cjmDom.hasClass(obj,cls) ) obj.className += " " + cls;
    },
    removeClass:function(obj,cls) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        if(obj.className.match(new RegExp('(\\s|^)' + cls + '\\s') ) ) {
            obj.className = obj.className.replace(reg, ' ');
        }else if(obj.className.match(new RegExp('(\\s|^)' + cls + '$') ) ) {
            obj.className = obj.className.replace(reg, '');
        }
    },
    transform:function(element,value,key) {
        key = key || "Transform";
        ["Moz", "O", "Ms", "Webkit", ""].forEach(function(prefix) {
            element.style[prefix + key] = value;
        });
        return element;
    }
};

function CjmSwipe(oPara) {
    var _sel = this;
    _sel.oBox = document.querySelector("#"+oPara.sBoxId);
    _sel.oCon = document.querySelector("#"+oPara.sBoxId + " ." + oPara.sConClass);
    _sel.oItem = document.querySelectorAll("#"+oPara.sBoxId + " ." + oPara.sItemClass);
    _sel.oItemCon = document.querySelectorAll("#"+oPara.sBoxId + " ." + oPara.sItemConClass);
    _sel.sItemClassCur = oPara.sItemClassCur || oPara.sItemClass + "Cur";
    _sel.nIndexNow = oPara.nIndexNow || 0;
    _sel.nIndexLas = -1;
    _sel.nTouchTravel = oPara.nTouchTravel || 100;
    _sel.fCallFront = oPara.fCallFront;
    _sel.fCallBack = oPara.fCallBack;
    _sel.bLoop = oPara.bLoop || false;
    if(_sel.bLoop) {
        var oTemItemFir = _sel.oItem[0].cloneNode(true);
        var oTemItemLas = _sel.oItem[_sel.oItem.length-1].cloneNode(true);
        _sel.oCon.appendChild(oTemItemFir);
        _sel.oCon.insertBefore(oTemItemLas,_sel.oItem[0]);
        _sel.oItem = document.querySelectorAll("#"+oPara.sBoxId + " ." + oPara.sItemClass);
        _sel.oItemCon = document.querySelectorAll("#"+oPara.sBoxId + " ." + oPara.sItemConClass);
        _sel.nIndexNow += 1;
        if(typeof _sel.fCallBack !== "function") {
            _sel.fCallBack = _sel.fLoopFunc;
        }else{
            var fCallBackOld = _sel.fCallBack;
            _sel.fCallBack = function() {
                fCallBackOld.call(_sel);
                _sel.fLoopFunc();
            }
        }
    }
    _sel.nItemLen = _sel.oItem.length;
    _sel.oTouch = {bMoving:false,bTouchStar:false};

    cjmDom.addClass(_sel.oItem[_sel.nIndexNow],_sel.sItemClassCur);
    _sel.fInit(true);
    _sel.fListen();
    //调试
    //document.querySelector("#dFixed").innerHTML += document.querySelector(".bounceInImg").clientWidth;
};
CjmSwipe.prototype = {
    fInit:function(bFirst) {
        var _sel = this;
        _sel.nScreenHeight = document.documentElement.clientHeight || document.body.clientHeight;
        for (var i=0; i<_sel.nItemLen; i++) {
            _sel.oItem[i].style.height = _sel.nScreenHeight + "px";
            cjmDom.transform(_sel.oItem[i],_sel.nScreenHeight,"Perspective");
        };
        _sel.oCon.style.height = _sel.nScreenHeight*_sel.nItemLen + "px";
        if(_sel.nIndexNow != 0) {
            _sel.fMove(- _sel.nIndexNow * _sel.nScreenHeight);
            if(bFirst) {
                if(typeof _sel.fCallBack === "function") {_sel.fCallBack();}
            }
        }
    },
    fListen:function() {
        var _sel = this;
        _sel.oCon.addEventListener("touchstart",function(e) {
            //document.querySelector("#dFixed").innerHTML += "<br />bMoving="+_sel.oTouch.bMoving;
            //e.preventDefault();//为了避免阻止input、textarea、a的浏览器默认行为，改为下面这句
            /^(?:INPUT|TEXTAREA|A)$/.test(e.target.tagName)||e.preventDefault();

            if(_sel.oTouch.bTouchStar || _sel.oTouch.bMoving) return;
            _sel.oTouch.bTouchStar = true;
            _sel.oTouch.nStart = e.touches[0].pageY;
            _sel.oTouch.nDistance = 0;
            _sel.oTouch.nChange = 0;
        },false);
        _sel.oCon.addEventListener("touchmove",function(e) {
            if(!_sel.oTouch.bTouchStar || _sel.oTouch.bMoving) return;
            _sel.oTouch.nDistance = e.touches[0].pageY - _sel.oTouch.nStart;
            if(_sel.oTouch.nDistance > 0) {
                if(!cjmDom.hasClass(_sel.oItemCon[_sel.nIndexNow], "originTop") ) {
                    cjmDom.removeClass(_sel.oItemCon[_sel.nIndexNow], "originBot");
                    cjmDom.addClass(_sel.oItemCon[_sel.nIndexNow], "originTop");
                }
            }else{
                if(!cjmDom.hasClass(_sel.oItemCon[_sel.nIndexNow], "originBot") ) {
                    cjmDom.removeClass(_sel.oItemCon[_sel.nIndexNow], "originTop");
                    cjmDom.addClass(_sel.oItemCon[_sel.nIndexNow], "originBot");
                }
            }
            var nNum1 = - _sel.nIndexNow * _sel.nScreenHeight + _sel.oTouch.nDistance;
            var oRotate = {
                nIndex:_sel.nIndexNow,
                nDeg:-(_sel.oTouch.nDistance / _sel.nScreenHeight) * 116.5
            };
            _sel.fMove(nNum1,oRotate);
        },false);
        _sel.oCon.addEventListener("touchend",function(e) {
            if(!_sel.oTouch.bTouchStar || _sel.oTouch.bMovin) return;
            if(_sel.oTouch.nDistance == 0) {
                _sel.oTouch.bTouchStar = false;
                return;
            }
            cjmDom.addClass(_sel.oCon,"moving");
            cjmDom.addClass(_sel.oItemCon[_sel.nIndexNow],"moving");
            var oRotate = {nIndex:_sel.nIndexNow,nDeg:0};
            if(_sel.oTouch.nDistance > _sel.nTouchTravel) {
                if(_sel.nIndexNow > 0) {
                    _sel.nIndexLas = _sel.nIndexNow;
                    _sel.nIndexNow -= 1;
                    _sel.oTouch.nChange = -1;
                    oRotate.nDeg = -116.5;
                }
            }else if(_sel.oTouch.nDistance < -_sel.nTouchTravel) {
                if(_sel.nIndexNow < (_sel.nItemLen -1) ) {
                    _sel.nIndexLas = _sel.nIndexNow;
                    _sel.nIndexNow += 1;
                    _sel.oTouch.nChange = 1;
                    oRotate.nDeg = 116.5;
                }
            }
            if(typeof _sel.fCallFront === "function") {_sel.fCallFront();}
            _sel.fMove(- _sel.nIndexNow * _sel.nScreenHeight, oRotate);
            _sel.oTouch.bMoving = true;
            _sel.oTouch.bTouchStar = false;
        },false);
        _sel.oCon.addEventListener("webkitTransitionEnd",function() {
            cjmDom.removeClass(_sel.oCon,"moving");
            if(_sel.oTouch.nChange != 0) {
                cjmDom.removeClass(_sel.oItemCon[_sel.nIndexLas],"moving");
                cjmDom.transform(_sel.oItemCon[_sel.nIndexLas],"rotateX(0deg)");
            }else{
                cjmDom.removeClass(_sel.oItemCon[_sel.nIndexNow],"moving");
            }
            _sel.oTouch.bMoving = false;
            if(typeof _sel.fCallBack === "function") {_sel.fCallBack();}
            if(_sel.nIndexLas != -1) {
                cjmDom.removeClass(_sel.oItem[_sel.nIndexLas],_sel.sItemClassCur);
            }
            if(!_sel.bLoop || (_sel.nIndexNow > 0 && _sel.nIndexNow < (_sel.nItemLen - 1) ) ) {
                cjmDom.addClass(_sel.oItem[_sel.nIndexNow],_sel.sItemClassCur);
            }
        }, false);
        window.addEventListener("resize",function() {
            _sel.fInit();
        },false)
    },
    fMove:function(nNum,o) {
        var _sel = this;
        cjmDom.transform(_sel.oCon,"translateY("+ nNum +"px)");
        if(o) {
            cjmDom.transform(_sel.oItemCon[o.nIndex],"rotateX("+ o.nDeg +"deg)");
        }
    },
    fLoopFunc:function() {
        var _sel = this;
        if(_sel.nIndexNow > 0 && _sel.nIndexNow < (_sel.nItemLen -1) ) return;
        _sel.nIndexNow = _sel.nIndexNow == 0 ? _sel.nItemLen - 2 : 1;
        _sel.fMove(- _sel.nIndexNow * _sel.nScreenHeight);
    }
};