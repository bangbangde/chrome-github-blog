/**
 * promise 风格转化，仅用于 Chrome extension API
 *
 * @param {Function} fn 异步 Chrome extension API
 * @param {Object} area 上下文对象，针对 chrome.storage 下的 get、set 等方法
 * @returns {function(...[*]): Promise<any>}
 */
let promisify = (fn, area) => function (...args) {
  return new Promise((resolve, reject) => {
    let callback = function (...args) {
      resolve(...args);
    }
    fn.apply(area || null, [...args, callback])
  });
};

let Store = {
  set: promisify(chrome.storage.sync.set, chrome.storage.sync),
  get: promisify(chrome.storage.sync.get, chrome.storage.sync),
  remove: promisify(chrome.storage.sync.remove, chrome.storage.sync),
  clear: promisify(chrome.storage.sync.clear, chrome.storage.sync),
  change: fn => chrome.storage.sync.onChanged.addListener(fn),
  log: () => chrome.storage.onChanged.addListener(changes => {
    for (let key in changes) {
      let storageChange = changes[key];
      console.log('Store:log: "%s" changed from "%s" to "%s".', key, storageChange.oldValue, storageChange.newValue);
    }
  })
};

/**
 * DateFormat(new Date(), "[ '北京时间' z yyyy-MM-dd a hh:mm:ss.SSSS EE]")
 * DateFormat("[ '北京时间' z yyyy-MM-dd a hh:mm:ss.SSSS EE]")
 * DateFormat()
 *
 * @param date
 * @param pattern
 * @returns {string}
 * @constructor
 */
function DateFormat(date, pattern) {
  if(arguments.length == 1 && typeof date == 'string'){
    pattern = date;
    date = null
  }
  var _p = pattern || 'yyyy/MM/dd HH:mm:ss'
  date = date||new Date()

  var _PLACEGOLDER = '_@@_'

  var AP = ['AM', 'PM']
  var WEEKDAY = ['日','一','二','三','四','五','六', '礼拜']

  var textIgnore = []
  var _i = 0

  _p = _p.replace(/('.*')/g, function(match){
    textIgnore.push(match.substring(1, match.length-1) )
    return _PLACEGOLDER
  })

  var lengthHandler= function(str, length){
    str += ''
    var l = length - str.length
    if(l > 0) {
      return (Math.pow(10, l)+'').substr(1) + str
    }else {
      return str.substr(0-l, length)
    }
  }

  var patterns = {}
  //Year
  patterns['y+'] = function (match, offset, string){
    let target = date.getFullYear()
    return lengthHandler(target, match.length)
  }
  //Month in year
  patterns['M+'] = function (match, offset, string){
    let target = date.getMonth() + 1
    return lengthHandler(target, match.length)
  }
  //Day in month
  patterns['d+'] = function (match, offset, string){
    let target = date.getDate()
    return lengthHandler(target, match.length)
  }
  //Am/pm marker
  patterns['a'] = function (match, offset, string){
    let target = date.getHours()
    if(target >= 0 && target < 12){
      target = AP[0]
    }else{
      target = AP[1]
    }
    return target
  }

  //Hour in day (0-23)
  patterns['H+'] = function (match, offset, string){
    let target = date.getHours()
    return lengthHandler(target, match.length)
  }

  //Hour in am/pm (1-12)
  patterns['h+'] = function (match, offset, string){
    let target = date.getHours()
    target = (target > 12 || target == 0) ? Math.abs(target - 12) : target
    return lengthHandler(target, match.length)
  }

  //Minute in hour(0-59)
  patterns['m+'] = function (match, offset, string){
    let target = date.getMinutes()
    return lengthHandler(target, match.length)
  }

  //Seconds in minute (0-59)
  patterns['s+'] = function (match, offset, string){
    let target = date.getSeconds()
    return lengthHandler(target, match.length)
  }

  //Millisecond
  patterns['S+'] = function (match, offset, string){
    let target = date.getSeconds()
    return lengthHandler(target, match.length)
  }

  //Day name in week
  patterns['E+'] = function (match, offset, string){
    let target = date.getDay()
    let length = match.length
    if(length == 1){
      return WEEKDAY[target]
    }else if(length == 2){
      return (WEEKDAY[7]||'周') + WEEKDAY[target]
    }

  }

  //Time zone
  patterns['z+'] = function (match, offset, string){
    let target = date.getTimezoneOffset()
    if(target > 0){
      return '-' + (target/60)
    }
    return '+' + (-target/60)
  }

  for(var k in patterns) {
    _p = _p.replace(new RegExp(k, 'g'), patterns[k]);
  }

  _p = _p.replace(new RegExp(_PLACEGOLDER, 'g'), function(){
    return textIgnore[_i++]
  })

  return _p
}

function pathJoin(...paths) {
  return paths.map(path => path.replace(/(^\/)|(\/$)/g, ''))
      .filter(i => i!='').join('/')
}

/**
 * 生成指定位数&基数的UUID
 * @param len
 * @param radix  (2-62)
 * @returns {string}
 */
function uuid(len, radix) {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let uuid = [], i;
  radix = radix || chars.length;

  if (len) {
    for (i = 0; i < len; i++)
      uuid[i] = chars[0 | Math.random()*radix];
  } else {
    // rfc4122, version 4 form
    var r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random()*16;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join('');
}


export {
  promisify, Store, DateFormat, pathJoin, uuid
}
