const Url = require('url');

/**
 * 拦截 oauth 授权回调，获取 code
 * @param url
 */
function codeCallbackUrl(url = 'callback://oauth-code') {
    chrome.webNavigation.onErrorOccurred.addListener(function(info) {
        console.debug('onErrorOccurred', info);
        let target = Url.parse(info.url, true);
        let test = Url.parse(url);
        if(test.protocol != target.protocol || test.hostname != target.hostname){
            return
        }
        let code = target.query.code;
        if(code){
            console.log(code);
        }else{
            console.error(target.query);
        }
        // TODO: 进入授权结果页或主页
        // chrome.tabs.update(null, {
        //     url: './oauthDefault.html?code=' + target.query.substr(2)
        // });
    });
}

export default codeCallbackUrl;
