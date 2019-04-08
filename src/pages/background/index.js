import Util from '../../utils';

// background.js
chrome.runtime.onInstalled.addListener(init);

chrome.webNavigation.onDOMContentLoaded.addListener(function(info) {
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


/**
 * 初始化
 */
function init(){
	console.log("ext:installed", Date());
	mockStore();
	Util.storage.get(null).then(data => console.log('获取数据：', data));
	setBrowserAction();
}
/**
 * 设置 BrowserAction
 */
function setBrowserAction(enable = true){
	if(enable){
		chrome.browserAction.setPopup({popup: ''});
		chrome.browserAction.onClicked.addListener(tab => {
			console.log('clicked')
			chrome.tabs.create({
			  url: 'https://cqbyte.github.io/oauth-helper/'
			}, tab => {})
		});
	}else{
		chrome.browserAction.setPopup({popup: 'popup.html?flag=0'});
	}
}

function mockStore(){
	Util.storage.set({
		'GITHUB_APPID': '000000000000',
		'OAUTH_PAGE': 'https://cqbyte.github.io/oauth-helper/'
	});
}
