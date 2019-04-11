import {promisify, Store} from '../utils';
import * as Api from '@/api';

const Background = {
	data: {
		accessToken: '',
		name: '',
		avatar_url: '',
		repo: '',
		initStep: 0, // current init step
		note: 'chrome extension access token'
	},

	listeners: {
		async onInstallHandler(){
			console.log("ext:installed", Date());
			let info = await promisify(chrome.management.getSelf)();
			if(info.installType == 'development'){
				await Store.clear();
				Store.log();
			}
			Store.change(function (changes) {
				for(let key in changes){
					Background.data[key] = changes[key].newValue;
				}
			})
			Object.assign(Background.data, await Store.get());
			console.log(Background.data);
			Background.actions.setBrowserAction();
			Api.setToken(Background.data.accessToken)
		},
	},

	actions: {
		setBrowserAction(){
			chrome.browserAction.onClicked.addListener(tab => {
				if(Background.data.accessToken && Background.data.repo){
					chrome.tabs.create({
						url: 'editor.html'
					})
				}else{
					chrome.runtime.openOptionsPage();
				}
			});
		},

		/**
		 *
		 * @param args
		 * @returns {Promise<{error: *}|{data: null}>}
		 */
		async login(...args){
			let res;
			let authes = await Api.listAuthorizations(...args);
			console.log('listAuthorizations', authes);
			let auth = authes.data.find(data => data.note ==  Background.data.note);
			console.log('find Authorization', auth);
			if(auth){
				await Api.deleteAuthorization(...args, auth.id);
				console.log('delete Authorization');
			}
			res = await Api.createAuthorization(...args, Background.data.note)
			console.log('create Authorization', res);

			if(res.status == 201){
				Background.actions.setToken(res.data.token);
				let userInfo = null;
				userInfo = await Background.actions.updateUserInfo();
				return {data: userInfo};
			}else{
				return {
					error: res.message
				};
			}
		},

		async setRepo(repoName){
			let repos = await Api.listRepositories();
			let repo = repos.data.find(repo => repo.name == repoName);
			if(!repo){
				repo = await Api.createRepository(repoName)
			}
			Store.set({repo: repoName});
			return repo;
		},

		setToken(token){
			Api.setToken(token);
			Store.set({
				accessToken: token
			});
		},

		async updateUserInfo(){
			let res = await Api.getUserInfo(),
				data = null;
			if(res.status == 200){
				data = {
					name: res.data.name,
					avatar_url: res.data.avatar_url
				};
				Store.set(data);
			}
			return data;
		},

		get step(){
			return Background.data.initStep;
		},

		set step(index){
			Store.set({
				initStep: index
			});
		}
	}
}

chrome.runtime.onInstalled.addListener(Background.listeners.onInstallHandler);
window.actions = Background.actions;
