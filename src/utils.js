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


export {
  promisify, Store
}
