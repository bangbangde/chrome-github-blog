export default {
  storage:{
    /**
     * sync: true:自动同步到其它设备, false:仅存在本地
     */
    set: (obj, sync = true) => new Promise((resolve, reject) => {
      let method = sync?'sync':'local';
      chrome.storage[method].set(obj, function(){
        resolve();
      });
    }),
    get: (keys, sync = true) => new Promise((resolve, reject) => {
      let method = sync?'sync':'local';
      chrome.storage[method].get(keys, function(items){
        resolve(items)
      })
    }),
    /**
     * 
     * @param {*} callback(change) | change: {oldValue, newValue}
     * 
     */
    onChange(callback){
      chrome.storage.onChanged.addListener(callback);
    }
  }
}