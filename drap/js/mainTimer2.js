/**
 * Created by Administrator on 2018/5/21.
 */

let MainTimer = (function(Utils){
    class MainTimer{
        constructor(delay = 17){
            this.timer = null;
            this.isAllPause = true;
            this.timerDelay = delay;
            this.timerList = [];
        }
        startTimer(delay){
            if(!this.timer){
                if(delay) this.timerDelay = delay;
                this.timer = setInterval(this.timerHander,this.timerDelay);
            }
            this.isAllPause = false;
        }
        stopTimer(){
            if(this.timer){
                clearInterval(this.timer);
            }
            this.isAllPause = true;
            this.timerList.length = 0;
        }
        timerAdd(cb,cbIsPause = false){
            if(this.timerList.length > 0){
                // 去重
                let index = this.timerList.findIndex(item=>{
                    return item.fn === cb;
                });
                if(index === -1){
                    this.timerList.push({fn:cb,isPause:cbIsPause});
                }
            }else{
                this.timerList.push({fn:cb,isPause:cbIsPause});
            }
        }
        timerChange(cb,cbIsPause){
            let index = this.timerList.findIndex(item=>{
                return item.fn === cb;
            });
            index !== -1 ? this.timerList[index].isPause = cbIsPause : null;
        }
        timerRemove(cb){
            // 一样的，如果一个动画想停止另一个动画呢，会出现数组塌陷，所以这里不删只置为null
            // 此处不设清空所有动画为null，如有这个需求，直接stopTimer就办了
            let index = this.timerList.findIndex(item=>{
                return item.fn === cb
            });
            index !== -1 ? this.timerList[index] = null : null;
        }
        timerHander(){
            if(this.isAllPause) return;

            let length = this.timerList.length;
            if(length > 0){
                let indexList = [],//记录需要删除的索引项
                    needHandler = false;
                for(let i = 0; i < length; i++){
                    if(this.timerList[i]){
                        !this.timerList[i].isPause && this.timerList[i].fn();
                    }else{
                        indexList.push(i);
                        needHandler = true;
                    }
                }

                if(needHandler){
                    //一起删除所有为null的，且一起移位
                    for(let i = indexList.length - 1; i >= 0; i--){
                        Utils.removeAry(this.timerList,indexList[i]);
                    }

                    if(this.timerList.length === 0){
                        // timerList数组没值了,该清楚定时器了
                        this.stopTimer();
                    }
                }
            }else{
                throw new Error("timerList数组没值了，怎么定时器还开着？？");
            }
        }
    }
    return MainTimer;
})(window.Utils);
