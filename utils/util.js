function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 判断输入金额是否正确
 * @param str
 * @returns {boolean}
 */
exports.checkFee = function checkFee(str) {
  if (parseFloat(str) == 0) {
    return false
  } else {
    return /^[0-9]{1}\d{0,4}(\.\d{1,2})?$/.test(str)
  }
}

/**
 * 金额输入过程中判断是否合法
 * @param str
 * @returns {boolean}
 */
exports.onInputCheck = function (str) {
  if (str.indexOf('.') == -1) {
    // 如果没有小数点
    if (str.length > 5) {
      return false
    } else {
      return true
    }
  } else {
    // 如果有小数点
    let arr = str.split('.')
    if (arr[1].length > 2) {
      return false
    } else {
      return true
    }
  }
}
/**
 * 转换优惠券处价格展示字符串
 * @param str
 * @returns {*}
 */
exports.switchFee = function (str) {
  if (str.indexOf('.') == -1) {
    if (str.length == 1) {
      return str + '.00'
    } else {
      return str + '.0'
    }
  } else {
    let arr = str.split('.')
    if (arr[0].length == 1) {
      if (arr[1].length == 1) {
        return str + '0'
      } else {
        return str
      }
    } else {
      if (arr[1].length == 1) {
        return str
      } else {
        return str.substr(0, str.length - 1)
      }
    }
  }
}
/**
 * 去除金额中多余的0
 * @param str
 * @returns {Number}
 */
exports.switchGoodsPrice = function (str) {
  return parseFloat(str)
}

/**
 * 姓名输入过程中判断是否包含数字
 * @param str
 * @returns {boolean}     有数字返回false   没数字返回true
 */
exports.onInputNameCheck = function (str) {
  if (str.length == 0) {
    return true
  }
  if (str.trim().length != str.length) {
    return false
  }
  if (/\d+/.test(str)) {
    return false
  } else {
    return true
  }
}