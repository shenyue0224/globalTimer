/**
 * Created by Administrator on 2018/5/21.
 */


let DrapControlUtils = (function (Utils,MainTimer) {
    let fnList = [];
    return {
        // 一般是down时调用 切换z-index
        changeZIndex: function (ele, allEleAry) {
            if (Utils.type(allEleAry) !== "array") {
                throw new TypeError("allEleAry is no Array");
            }
            allEleAry.forEach(item => {
                if (item !== ele) {
                    item.style.zIndex = 0;
                } else {
                    item.style.zIndex = 1;
                }
            });
        },
        // 一般是down时调用 设置边界值
        initData:function(ele,boundaryObj = {}){
            let {
                minX = 0,
                maxX = 100,
                minY = 0,
                maxY = 100
            } = boundaryObj;

            ele.minX = minX;
            ele.maxX = maxX;
            ele.minY = minY;
            ele.maxY = maxY;

            console.log("down");

            fnList.forEach(item => {
                MainTimer.timerRemove(item);
            });
            fnList.length = 0;
        },
        // 一般是move时调用 处理边界
        handlerBoundary:function(ele){
            let currentPosL = ele.offsetLeft,
                currentPosT = ele.offsetTop;
            currentPosL = currentPosL > ele.maxX ? ele.maxX : (currentPosL < ele.minX ? ele.minX: currentPosL);
            currentPosT = currentPosT > ele.maxY ? ele.maxY : (currentPosT < ele.minY ? ele.minY: currentPosT);

            ele.style.left = currentPosL + "px";
            ele.style.top = currentPosT + "px";
        },
        // 需move时调用 计算最后松开时的速度
        computedMoveSpeed: function (ele) {
            if (!ele.speedPoint) {
                ele.speedPoint = {
                    //无论offsetParent是谁，这里都可以用，只是个相对位置而已。
                    prevPosL: ele.offsetLeft,
                    prevPosT: ele.offsetTop,
                    distanceX: 0,
                    distanceY: 0,
                };
                return;
            }
            ele.speedPoint.distanceX = ele.offsetLeft - ele.speedPoint.prevPosL;
            ele.speedPoint.distanceY = ele.offsetTop - ele.speedPoint.prevPosT;

            ele.speedPoint.prevPosL = ele.offsetLeft;
            ele.speedPoint.prevPosT = ele.offsetTop;
        },
        /**
         * // 需要up时调用
         * @param ele
         * @param directionObj
         *
         */
        fromSpeedToFly_damping:function(ele,directionObj = {}){
            if(typeof MainTimer === "undefined"){
                throw ReferenceError("Here is the need for MainTimer");
            }

            // 因为此方法需要speedPoint，此处防止出现：鼠标按下即抬起，没有move
            if (!ele.speedPoint) {
                return;
            }

            let speedPoint = ele.speedPoint;
            ele.speedPoint = null;

            let {
                directionX,
                directionY
            } = directionObj;
            if(directionX){
                let {
                    startSpeed = speedPoint.distanceX,//起始速度
                    dampingRate = 0.98,//阻尼率
                    minPos = ele.minX,
                    maxPos = ele.maxX
                } = directionX;
                let currentPos = ele.offsetLeft;// 有待验证是否需要用utils的方法

                let fn = function(){
                    if(startSpeed>0){
                        if((currentPos + startSpeed) > maxPos){
                            currentPos = maxPos - ((currentPos + startSpeed) - maxPos);
                            startSpeed *= -1;
                        }else{
                            currentPos += startSpeed;
                        }
                    }else if(startSpeed<0){
                        if((currentPos + startSpeed) < 0){
                            currentPos = 0 - (currentPos + startSpeed);
                            startSpeed *= -1;
                        }else{
                            currentPos += startSpeed;
                        }
                    }

                    if(startSpeed ==0 ){
                        MainTimer.timerRemove(fn);
                    }

                    startSpeed *= 0.98;
                    //offset的值都会四舍五入，所以用0.5即可
                    startSpeed = Math.abs(startSpeed) < 0.5 ? 0 : startSpeed;

                    ele.style.left = currentPos + "px";
                };
                fnList.push(fn);
                MainTimer.timerAdd(fn);
                if(!MainTimer.isStart()) MainTimer.startTimer();
            }
            if(directionY){

            }

        }
    }
})(window.Utils,MainTimer);


/*

// 手写mvvm视频中，讲了递归解析的方法（看了，并没有，解析方法有待解决）
// 准备了这么多参数，发布订阅里面怎么传参还没有解决呢
directionObj = {
    directionX:{
        hasAnimate:true,
        mode:{
            "damping":{
                startSpeed:0,
                dampingSpeed:0,
                minPosL:0,
                maxPosL:0
            },
            "gravity-rebound":{
                startSpeed:0,
                acceleratedSpeed:0,
                dampingSpeed:0,
                minPos:0,
                maxPos:0
            },
            "gravity":{
                startSpeed:0,
                acceleratedSpeed:0,
                minPos:0,
                maxPos:0
            }
        }
    }
}*/
