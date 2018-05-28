/**
 * Created by Administrator on 2018/5/21.
 */

let MainTimer = (function (Utils) {

    let timer = null,
        isAllPause = true,
        timerList = [];

    function isStart(){
        return !isAllPause;
    }

    function startTimer(delay = 17) {
        timer = setInterval(timerHander, delay);
        isAllPause = false;
        console.log("========startTimer=======");
    }

    function stopTimer() {
        if (timer) {
            clearInterval(timer);
        }
        isAllPause = true;
        timerList.length = 0;
        console.log("========stopTimer=======");
    }

    function timerAdd(cb, cbIsPause = false) {
        if(typeof cb !== "function"){
            throw new TypeError("The first parameter must be a function");
        }
        if (timerList.length > 0) {
            // 去重
            let index = timerList.findIndex(item=> {
                return (item && item.fn) === cb;//此处item可能已经是null了
            });
            if (index === -1) {
                timerList.push({fn: cb, isPause: cbIsPause});
            }
        } else {
            timerList.push({fn: cb, isPause: cbIsPause});
        }
    }

    function timerChange(cb, cbIsPause) {
        let index = timerList.findIndex(item=> {
            return (item && item.fn) === cb;//此处item可能已经是null了
        });
        index !== -1 ? timerList[index].isPause = cbIsPause : null;
    }

    function timerRemove(cb) {
        // 一样的，如果一个动画想停止另一个动画呢，会出现数组塌陷，所以这里不删只置为null
        // 此处不设清空所有动画为null，如有这个需求，直接stopTimer就办了
        let index = timerList.findIndex(item=> {
            return (item && item.fn) === cb;//此处item可能已经是null了
        });
        index !== -1 ? timerList[index] = null : null;
    }

    function timerHander() {
        if (isAllPause) return;

        let length = timerList.length;
        if (length > 0) {
            let indexList = [],//记录需要删除的索引项
                needHandler = false;
            for (let i = 0; i < length; i++) {
                if (timerList[i]) {
                    !timerList[i].isPause && timerList[i].fn();
                    // !timerList[i].isPause && setTimeout(timerList[i].fn, 0);
                    // !timerList[i].isPause && requestAnimationFrame(timerList[i].fn);
                } else {
                    indexList.push(i);
                    needHandler = true;
                }
            }

            if (needHandler) {
                //一起删除所有为null的，且一起移位
                for (let i = indexList.length - 1; i >= 0; i--) {
                    Utils.removeAry(timerList, indexList[i]);
                    console.log("========removeAry=======");
                }

                if (timerList.length === 0) {
                    // timerList数组没值了,该清楚定时器了
                    stopTimer();
                }
            }
        } else {
            throw new Error("timerList数组没值了，怎么定时器还开着？？");
        }
    }

    return {
        isStart,
        startTimer,
        stopTimer,
        timerAdd,
        timerChange,
        timerRemove,
        timerHander
    };
})(window.Utils);
