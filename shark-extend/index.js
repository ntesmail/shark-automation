/**
 * 这个方法是为了解决目前市场上extend的方法，对于数组处理不能满足要求而新增的
 * 一般extend时，extend({1:[1]}, {1:[2]}),得到的结果是{1:[2]},而目前的需求希望是{1:[1,2]}
 * 因为这种特殊性，所以对于参数to和from有这些限制：
 * 1：是对象{key:value}
 * 2：相同字段的值是同一类型
 */

function extend(d) {
    if (arguments.length < 2) {
        return d;
    }
    for (var i = 1; i < arguments.length; i++) {
        d = assignObject(d, arguments[i]);
    }
    return d;
}

function assignObject(d, s) {
    for (var key in s) {
        if (s.hasOwnProperty(key) && s.propertyIsEnumerable(key)) {
            var type = getType(s[key]);
            if (type === 'object') {
                d[key] = extend(d[key] || {}, s[key]);
            } else if (type === 'array') {
                //同一个字段，认为两个对象是有相同类型的
                var t = getType(d[key]);
                t === 'array' ? '' : d[key] = [];
                d[key] = d[key].concat(s[key]);
            } else {
                d[key] = s[key];
            }
        }
    }
    return d;
}

function getType(val) {
    var type = typeof val,
        rst = '';
    if (type === 'object') {
        var _t = Object.prototype.toString.call(val);
        if (_t.indexOf('Array') > -1) {
            rst = 'array';
        } else if (_t.indexOf('Date') > -1) {
            rst = 'date';
        } else {
            rst = 'object';
        }
    } else {
        rst = type;
    }
    return rst;
}

module.exports = extend;