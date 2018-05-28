/**
 * Created by Administrator on 2018/5/20.
 */

/**
 * 需注意把事件绑定方法里的this指向修改
 * 由事件绑定对象，即参数ele
 * 修改为Drap的实例
 */
let Drap = (function (window,Utils,PublishSubscribe) {
    if (typeof PublishSubscribe === "undefined") {
        throw new ReferenceError("no PublishSubscribe");
    }
    class Drap extends PublishSubscribe {
        constructor(ele) {
            super();

            this.ele = ele;

            ["startEvX", "startEvY", "startPosL", "startPosT"].forEach(item => {
                this[item] = null;
            });
            //修改事件绑定函数中的this指向
            this.DOWN = this.down.bind(this);
            this.ele.addEventListener("mousedown", this.DOWN);
        }



        down(ev) {
            ev.stopPropagation();
            let ele = this.ele,
                pos = Utils.getElePosition(ele);

            this.startEvX = ev.clientX;
            this.startEvY = ev.clientY;
            this.startPosL = pos.left;
            this.startPosT = pos.top;

            this.MOVE = this.move.bind(this);
            this.UP = this.up.bind(this);
            window.document.addEventListener("mousemove", this.MOVE);
            window.document.addEventListener("mouseup", this.UP);

            this.fire("down",ele);
        }

        move(ev) {
            ev.preventDefault();//此行非常重要！！！！
            let ele = this.ele;

            this.currentPosL = ev.clientX - this.startEvX + this.startPosL;
            this.currentPosT = ev.clientY - this.startEvY + this.startPosT;

            ele.style.left = this.currentPosL + "px";
            ele.style.top = this.currentPosT + "px";

            this.fire("move",ele);
        }

        up(ev) {
            let ele = this.ele;

            window.document.removeEventListener("mousemove", this.MOVE);
            window.document.removeEventListener("mouseup", this.UP);
            this.fire("up",ele);
        }

    }
    return Drap;
})(window,window.Utils,PublishSubscribe);
