/**
 * Created by Administrator on 2018/5/21.
 */


let DrapControlUtils = (function (Utils,MainTimer) {
    return {
        // 一般是down时调用 切换z-index
        changeZIndex: function (ele, allEleObj = {}) {
            let allEleAry = allEleObj.ary;
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
        initDataAnimate:function(ele,boundaryObj = {}){
            // 初始化可以考虑放在外部主程序中
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

            if(ele.fnList && ele.fnList.length > 0){
                ele.fnList.forEach(item => {
                    MainTimer.timerRemove(item);
                });
                ele.fnList.length = 0;
            }
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

            // 速度数据存储给变量，并清空ele存储的速度值
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

                // let fn = moveEle.bind(this,ele,startSpeed,dampingRate,minPos,maxPos,currentPos);
                let fn = function moveEle(){
                    // let currentPos = ele.offsetLeft;
                    if(startSpeed>0){
                        if((currentPos + startSpeed) > maxPos){
                            currentPos = maxPos - ((currentPos + startSpeed) - maxPos);
                            startSpeed *= -1;
                        }else{
                            currentPos += startSpeed;
                        }
                    }else if(startSpeed<0){
                        if((currentPos + startSpeed) < minPos){
                            currentPos = minPos - (currentPos + startSpeed);
                            startSpeed *= -1;
                        }else{
                            currentPos += startSpeed;
                        }
                    }

                    if(startSpeed ==0 ){
                        MainTimer.timerRemove(fn);
                    }

                    startSpeed *= dampingRate;
                    //offset的值都会四舍五入，所以用0.5即可
                    startSpeed = Math.abs(startSpeed) < 0.5 ? 0 : startSpeed;
                    ele.style.left = currentPos + "px";
                };
                if(!ele.fnList){
                    ele.fnList= [];
                }
                ele.fnList.push(fn);
                MainTimer.timerAdd(fn);
                if(!MainTimer.isStart()) MainTimer.startTimer();
            }
            if(directionY){
                let {
                    startSpeed = speedPoint.distanceY,//起始速度
                    dampingRate = 0.98,//阻尼率
                    minPos = ele.minY,
                    maxPos = ele.maxY
                } = directionY;
                let currentPos = ele.offsetTop;// 有待验证是否需要用utils的方法

                //
                let fn = function moveEle(){
                    // let currentPos = ele.offsetLeft;
                    if(startSpeed>0){
                        if((currentPos + startSpeed) > maxPos){
                            currentPos = maxPos - ((currentPos + startSpeed) - maxPos);
                            startSpeed *= -1;
                        }else{
                            currentPos += startSpeed;
                        }
                    }else if(startSpeed<0){
                        if((currentPos + startSpeed) < minPos){
                            currentPos = minPos - (currentPos + startSpeed);
                            startSpeed *= -1;
                        }else{
                            currentPos += startSpeed;
                        }
                    }

                    if(startSpeed ==0 ){
                        MainTimer.timerRemove(fn);
                    }

                    startSpeed *= dampingRate;
                    //offset的值都会四舍五入，所以用0.5即可
                    startSpeed = Math.abs(startSpeed) < 0.5 ? 0 : startSpeed;
                    ele.style.top = currentPos + "px";
                };
                if(!ele.fnList){
                    ele.fnList= [];
                }
                ele.fnList.push(fn);
                MainTimer.timerAdd(fn);
                if(!MainTimer.isStart()) MainTimer.startTimer();
            }
        },

        /**
         * // 需要up时调用
         * 重力回弹
         */
        gravity_rebound:function(ele,gravityReboundObj = {}){
            if(typeof MainTimer === "undefined"){
                throw ReferenceError("Here is the need for MainTimer");
            }

            let {
                startSpeed = 10, //起始速度
                gravityAddSpeed = 9.8, //重力加速度默认值
                dampingRate = 0.98,//阻尼率
                minPos = ele.minY,
                maxPos = ele.maxY
            } = gravityReboundObj;
            let currentPos = ele.offsetTop,// 有待验证是否需要用utils的方法
                flag = 0;//
            let fn = function(){
                // console.log(flag);
                if(flag > 1 ){
                    MainTimer.timerRemove(fn);
                    return;
                }

                startSpeed += gravityAddSpeed;
                startSpeed *= dampingRate;
                //这句不要的话，动画会非常僵硬
                //看看是否可以用requestanimationframe来尝试解决
                //试过，貌似并不行
                let currentPos = ele.offsetTop;
                currentPos += startSpeed;
                if (currentPos >= maxPos) {
                    ele.style.top = maxPos + "px";
                    startSpeed *= -1;
                    flag++;
                    return;
                }
                if (currentPos <= minPos) {
                    ele.style.top = minPos + "px";
                    startSpeed *= -1;
                    throw new Error("测试下而已。。");
                    return;
                }
                ele.style.top = currentPos + 'px';
                flag = 0;
            };

            if(!ele.fnList){
                ele.fnList= [];
            }
            ele.fnList.push(fn);
            MainTimer.timerAdd(fn);
            if(!MainTimer.isStart()) MainTimer.startTimer();
        },

        // 监测碰撞
        ppp:function(){

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
