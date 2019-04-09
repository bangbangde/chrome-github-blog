import Util from "../../utils";
import url from 'url';

chrome.webNavigation.onCommitted.addListener(function(info) {
    console.log('onCommitted', info);
});

/**
 * hack 处理默认code回调
 */
chrome.webNavigation.onErrorOccurred.addListener(function(info) {
    console.log('onErrorOccurred', info);
    let test = 'htpps://callback.url';
    let url = Url.parse(info.url);
    console.log('test url:', url);
    // if(info.url.startsWith(url)){
    // 	chrome.tabs.update(null, {
    // 		url: './oauthDefault.html?code='+
    // 	})
    // }
});
/** @namespace chrome.webNavigation.onDOMContentLoaded */
/**
 * 向用户自定义的授权页面注入脚本
 */
chrome.webNavigation.onDOMContentLoaded.addListener(function(info) {
    console.log('onDOMContentLoaded', info);
    Util.storage.get('OAUTH_PAGE').then(data => {
        if(data.OAUTH_PAGE && info.url.startsWith(data.OAUTH_PAGE)){
            console.log('inject', info.url)
            chrome.tabs.executeScript(null, {file: "./js/runtime.js"})
            chrome.tabs.executeScript(null, {file: "./js/vendors.js"})
            chrome.tabs.executeScript(null, {file: "./js/oauth.js"})
        }else{
            console.log('no inject', info.url)
        }
    })
});
