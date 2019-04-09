import {promisify, Store} from '../../utils';

const Background = {
	data: {},

	init(){
		chrome.runtime.onInstalled.addListener(this.onInstallHandler);
	},

	async onInstallHandler(){
		console.log("ext:installed", Date());
		let info = await promisify(chrome.management.getSelf)();
		if(info.installType == 'development'){
			await Store.clear();
			Store.log();
			await Store.set({
				clientId: '91ed6a43c5964d91a6e6',
				callbackUrl: 'callback://oauth-code',
				oauthUrl: 'https://cqbyte.github.io/oauth-helper/',
				accessToken: '',
				code: '',
			});
		}
		Store.change(function (changes) {
			changes.forEach((key, item) => {
				this.data[key] = item.newValue;
			})
		})
		Background.data = await Store.get();
		Background.setBrowserAction();
	},

	setBrowserAction(){
		if(this.data.accessToken){
			chrome.browserAction.setPopup({popup: 'popup.html'});
		}else{
			chrome.browserAction.setPopup({popup: ''});
			chrome.browserAction.onClicked.addListener(tab => {
				chrome.runtime.openOptionsPage();
			});
		}
	}
}

Background.init();
