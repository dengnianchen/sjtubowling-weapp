var pinyin_dict_firstletter = require('./pinyin_dict_firstletter.js')

/**
 * 汉字与拼音互转工具，根据导入的字典文件的不同支持不同
 * 对于多音字目前只是将所有可能的组合输出，准确识别多音字需要完善的词库，而词库文件往往比字库还要大，所以不太适合web环境。
 * @start 2016-09-26
 * @last 2016-09-29
 */
var toneMap = {
    "ā": "a1",
    "á": "a2",
    "ǎ": "a3",
    "à": "a4",
    "ō": "o1",
    "ó": "o2",
    "ǒ": "o3",
    "ò": "o4",
    "ē": "e1",
    "é": "e2",
    "ě": "e3",
    "è": "e4",
    "ī": "i1",
    "í": "i2",
    "ǐ": "i3",
    "ì": "i4",
    "ū": "u1",
    "ú": "u2",
    "ǔ": "u3",
    "ù": "u4",
    "ü": "v0",
    "ǖ": "v1",
    "ǘ": "v2",
    "ǚ": "v3",
    "ǜ": "v4",
    "ń": "n2",
    "ň": "n3",
    "": "m2"
};

/**
 * 处理多音字，将类似['D', 'ZC', 'F']转换成['DZF', 'DCF']
 * 或者将 ['chang zhang', 'cheng'] 转换成 ['chang cheng', 'zhang cheng']
 */
function handlePolyphone(array, splitter, joinChar) {
    splitter = splitter || '';
    var result = [''],
        temp = [];
    for (var i = 0; i < array.length; i++) {
        temp = [];
        var t = array[i].split(splitter);
        for (var j = 0; j < t.length; j++) {
            for (var k = 0; k < result.length; k++)
                temp.push(result[k] + (result[k] ? joinChar : '') + t[j]);
        }
        result = temp;
    }
    return simpleUnique(result);
}

/**
 * 根据词库找出多音字正确的读音
 * 这里只是非常简单的实现，效率和效果都有一些问题
 * 推荐使用第三方分词工具先对句子进行分词，然后再匹配多音字
 * @param chinese 需要转换的汉字
 * @param result 初步匹配出来的包含多个发音的拼音结果
 * @param splitter 返回结果拼接字符
 */
function parsePolyphone(chinese, result, splitter, withtone) {
    var poly = window.pinyin_dict_polyphone;
    var max = 7; // 最多只考虑7个汉字的多音字词，虽然词库里面有10个字的，但是数量非常少，为了整体效率暂时忽略之
    var temp = poly[chinese];
    if (temp) // 如果直接找到了结果
    {
        temp = temp.split(' ');
        for (var i = 0; i < temp.length; i++) {
            result[i] = temp[i] || result[i];
            if (!withtone) result[i] = pinyinUtil.removeTone(result[i]);
        }
        return result.join(splitter);
    }
    for (var i = 0; i < chinese.length; i++) {
        temp = '';
        for (var j = 0; j < max && (i + j) < chinese.length; j++) {
            if (!/^[\u2E80-\u9FFF]+$/.test(chinese[i + j])) break; // 如果碰到非汉字直接停止本次查找
            temp += chinese[i + j];
            var res = poly[temp];
            if (res) // 如果找到了多音字词语
            {
                res = res.split(' ');
                for (var k = 0; k <= j; k++) {
                    if (res[k]) result[i + k] = withtone ? res[k] : pinyinUtil.removeTone(res[k]);
                }
                break;
            }
        }
    }
    // 最后这一步是为了防止出现词库里面也没有包含的多音字词语
    for (var i = 0; i < result.length; i++) {
        result[i] = result[i].replace(/ .*$/g, '');
    }
    return result.join(splitter);
}

// 简单数组去重
function simpleUnique(array) {
    var result = [];
    var hash = {};
    for (var i = 0; i < array.length; i++) {
        var key = (typeof array[i]) + array[i];
        if (!hash[key]) {
            result.push(array[i]);
            hash[key] = true;
        }
    }
    return result;
}

/**
 * 获取汉字的拼音首字母
 * @param str 汉字字符串，如果遇到非汉字则原样返回
 * @param polyphone 是否支持多音字，默认false，如果为true，会返回所有可能的组合数组
 */
function getFirstLetter(str, polyphone) {
    polyphone = polyphone == undefined ? false : polyphone;
    if (!str || /^ +$/g.test(str)) return '';
    var result = [];
    for (var i = 0; i < str.length; i++) {
        var unicode = str.charCodeAt(i);
        var ch = str.charAt(i);
        if (unicode >= 19968 && unicode <= 40869) {
            ch = pinyin_dict_firstletter.all.charAt(unicode - 19968);
            if (polyphone) ch = pinyin_dict_firstletter.polyphone[unicode] || ch;
        }
        result.push(ch);
    }
    if (!polyphone) return result.join(''); // 如果不用管多音字，直接将数组拼接成字符串
    else return handlePolyphone(result, '', ''); // 处理多音字，此时的result类似于：['D', 'ZC', 'F']
}

module.exports = { getFirstLetter: getFirstLetter };