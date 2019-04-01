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
  },

  toQueryString(data){
    return '?' + Object.keys(data).map(key => encodeURI(key)+'='+encodeURIComponent(JSON.stringify(data[key]))).join('&');
  },
  
  request({ 
    url, data, success, fail, complete, 
    method='GET', async=true,
    headers = {
      'content-Type': 'application/x-www-form-urlencode'
    }}){
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
      console.log(xhr)
    }
    if(data && method.toLocaleLowerCase() == 'get'){
      url += this.toQueryString(data)
    }
    xhr.open(method, url, async);
    Object.keys(headers).forEach(key => {
      xhr.setRequestHeader(key, headers[key]);
    })
    xhr.send(data)
    return {
      abort(){
        xhr.abort();
        xhr = null;
      }
    }
  }
}