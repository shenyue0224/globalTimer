/**
 * Created by Administrator on 2018/5/21.
 */
(function (window) {
    let emptyAry = [],
        emptyObj = {},
        // slice = emptyAry.prototype.slice,
        typeStr = "Boolean Number String Function Array Date RegExp Object Error",
        typeObj = emptyObj;

    typeStr.split(" ").forEach(item=> {
        typeObj[`[object ${item}]`] = item.toLowerCase();
    });

    window.Utils = {
        // 工具方法,判断类型
        type: function (obj) {
            if (obj == null) {
                return obj + "";
            }

            return typeof obj === "object" || typeof obj === "function" ? typeObj[toString.call(obj)] || "object" : typeof obj;
        },

        // 工具方法,不使用splice删除数组
        removeAry: function (ary, from, to) {
            let length = ary.length,
                afterAry = ary.slice((to || from) + 1 || length);
            ary.length = from < 0 ? length + from : from;
            return ary.push(...afterAry);
        },

        // 工具方法
        // 使用offetLeft/Top获取坐标，（还有一种方法可以获取：window.getComputedStyle）
        getElePosition: function (ele, parentEle = window.document.body) {
            let point = {left: 0, top: 0};
            point.left += ele.offsetLeft;
            point.top += ele.offsetTop;

            ele = ele.offsetParent;
            while (ele && ele !== parentEle) {
                //offsetLeft/Top计算坐标时，是未计算边框的
                point.left += ele.clientLeft;
                point.top += ele.clientTop;

                point.left += ele.offsetLeft;
                point.top += ele.offsetTop;
                ele = ele.offsetParent;
            }
            return point;
        }
    }
})(window);