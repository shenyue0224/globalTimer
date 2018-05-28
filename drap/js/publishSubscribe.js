/**
 * Created by Administrator on 2018/5/20.
 */

/**
 * 还未添加完善的参数验证，以及验证后的错误处理
 *
 * 进行this的绑定，this乍一看是publishScribe的实例，但是此发布订阅类是会被继承的，
 * this更大概率会是发布订阅类的子类的实例
 */
let PublishSubscribe = (function (Utils) {
    class PublishSubscribe {
        constructor() {
            this.list = {};
        }

        // 记住，fire函数体内可能会在循环过程中调用remove方法
        fire(type) {
            // if(arguments.length > 2 || Utils.type(arguments[1]) !== "object"){
            if(arguments.length > 2){
                throw new TypeError("Fire just needs two parameters");
            }

            let ele = arguments[1];

            if (this.list[type] && this.list[type].length) {
                //记住，在循环之前或之后，检查数组的null项，并去掉null项
                //老师的版本是在循环中遇到null再处理，并不刻意的用一整次循环来处理
                //此处不用老师的方法（进行优化，降低移位造成的损耗）
                let indexList = [],//记录需要删除的索引项
                    needHandle = false;
                for (let i = 0,l = this.list[type].length; i < l; i++) {
                    if (this.list[type][i] === null) {
                        // this.list[type].splice(i, 1);
                        indexList.push(i);
                        needHandle = true;
                    } else {
                        // 1 如果不用this绑定，这个回调函数中的this将指向全局，显然应该执行的是当前类的实例，或其子类实例
                        // 2 把fire带的参数，和add带的参数，加在一起给回调函数
                        this.list[type][i].fn.call(this, ele, this.list[type][i].param);
                    }
                }

                if(needHandle){
                    //一起删除所有为null的，且一起移位
                    for(let i = indexList.length - 1; i >= 0; i--){
                        Utils.removeAry(this.list[type],indexList[i]);
                    }
                }
            }
        }

        add(type, cb, cbParam={}) {
            if(Utils.type(cbParam) !== "object"){
                throw new TypeError("The third parameter of add must be object");
            }

            if (!this.list[type]) {
                this.list[type] = [];
                this.list[type].push({fn:cb,param:cbParam});
            } else {
                if (this.list[type].length > 0) {
                    // 去重！(记住，是直接忽略，而不是移动位置于最后)
                    let index = this.list[type].findIndex(item=>{
                        return (item &&item.fn) === cb;//此处item可能已经是null了
                    });
                    if(index === -1){
                        this.list[type].push({fn:cb,param:cbParam});
                    }
                } else {
                    this.list[type].push({fn:cb,param:cbParam});
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
                    let index = this.list[type].findIndex(item=>{
                        return (item && item.fn) === cb;//此处item可能已经是null了
                    });
                    index !== -1 ? this.list[type][index] = null : null;
                }
            }
        }

    }
    return PublishSubscribe;
})(window.Utils);
