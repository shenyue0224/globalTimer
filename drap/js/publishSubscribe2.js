/**
 * Created by Administrator on 2018/5/20.
 */

/**
 * 还未添加完善的参数验证，以及验证后的错误处理
 *
 * 进行this的绑定，this乍一看是publishScribe的实例，但是此发布订阅类是会被继承的，
 * this更大概率会是发布订阅类的子类的实例
 */
(function (window) {
    let slice = Array.prototype.slice;
    class PublishSubscribe {
        constructor() {
            this.list = {};
        }

        // 记住，fire函数体内可能会在循环过程中调用remove方法
        fire(type) {
            let args = slice.call(arguments, 1);
            if (this.list[type] && this.list[type].length) {
                //记住，在循环之前或之后，检查数组的null项，并去掉null项
                //老师的版本是在循环中遇到null再处理，并不刻意的用一整次循环来处理
                //此处不用老师的方法（进行优化，降低移位造成的损耗）
                let indexList = [];//记录需要删除的索引项
                for (let i = 0,l = this.list[type].length; i < l; i++) {
                    if (this.list[type][i] === null) {
                        // this.list[type].splice(i, 1);
                        indexList.push(i);
                    } else {
                        // 用上apply的两个功能：
                        // 1 如果不用this绑定，这个回调函数中的this将指向全局，显然应该执行的是当前类的实例，或其子类实例
                        // 2 第二功能不用赘述
                        this.list[type][i].apply(this, args);
                    }
                }

                //一起删除，且一起移位
                for(let i = indexList.length - 1; i >= 0; i--){
                    Utils.removeAry(this.list[type],indexList[i]);
                }
            }
        }

        add(type, cb) {
            if (!this.list[type]) {
                this.list[type] = [];
                this.list[type].push(cb);
            } else {
                if (this.list[type].length > 0) {
                    // 去重！(记住，是直接忽略，而不是移动位置于最后)
                    if (!this.list[type].includes(cb)) {
                        this.list[type].push(cb);
                    }
                } else {
                    this.list[type].push(cb);
                }
            }
        }

        // cb允许不传
        // 记住，remove可能实际中会被在fire函数体内循环调用。
        remove(type, cb) {
            // 为防止数组塌陷，此处只记录为null，不删除。由fire方法在循环体前（或后）一起执行删除操作
            if (this.list[type] && this.list[type].length) {
                if (arguments.length < 2) {
                    //清楚该类型所有订阅
                    this.list[type].fill(null);
                } else {
                    let index = this.list[type].indexOf(cb);
                    index > -1 ? this.list[type][index] = null : null;
                }
            }
        }

    }
    window.PublishSubscribe = PublishSubscribe;
})(window,Utils);
