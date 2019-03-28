import Util from './utils';

// background.js
chrome.runtime.onInstalled.addListener(init);

/**
 * 初始化
 */
function init(){
  console.log("ext:installed", Date());
  Util.storage.get('test').then(data => console.log('获取数据：', data));
  Util.storage.get('appid').then(data => {
    if(data.appid){
      setBrowserAction();
    }else{
      setBrowserAction(false);
    }
  })
}

/**
 * 设置 BrowserAction
 */
function setBrowserAction(enable = true){
  if(enable){
    chrome.browserAction.setPopup({popup: ''});
    chrome.browserAction.onClicked.addListener(tab => {
      console.log('clicked')
    });
  }else{
    chrome.browserAction.setPopup({popup: 'popup.html?flag=0'});
  }
}