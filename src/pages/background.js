import {promisify, Store} from '../utils';
import * as Api from '@/api';

!function() {
	/**
	 *  Storage data
	 */
	const data = {
		token: undefined,                      // *required
		name: undefined,
		login: undefined,
		avatar: undefined,
		note: 'chrome extension access token',
		message: 'by chrome extension',

		repo: undefined,                       // *required
		branch: 'master',                      // "master" | "gh-pages"
		path: '/',                             // "/" | "/docs"
		categories: ['笔记', '随笔', '前端'],
		tags: ['Javascript', 'css']
	};

	/**
	 * Init
	 *
	 * @returns {Promise<void>}
	 */
	async function init(){
		let valid = false; // 数据完整性、有效性
		try {
			// 初始化数据
			await initData();
			if(data.token && data.repo){
				await updateUserInfo();
				valid = await validData();
			}
		}catch (e) {
			console.error(e);
		}finally {
			chrome.browserAction.onClicked.addListener(() => {
				if(valid){
					chrome.tabs.create({
						url: 'editor.html'
					})
				}else{
					chrome.runtime.openOptionsPage();
				}
			});
		}
	}

	/**
	 * Init data
	 *
	 * @returns {Promise<void>}
	 */
	async function initData() {
		let apiData = new Set(['token', 'login', 'repo', 'path', 'branch', 'note', 'message']);
		Store.change(function (changes) {
			for(let key in changes){
				data[key] = changes[key].newValue;
				if(apiData.has(key)){
					Api.setData(key, data[key]);
				}
			}
		});
		Object.assign(data, await Store.get());
		apiData.forEach(key => {
			Api.setData(key, data[key]);
		})
		await dev();
		console.log(data);
	}

	/**
	 * 通过访问仓库目录检验数据有效性
	 *
	 * @returns {Promise<boolean>}
	 */
	async function validData() {
		await getContents();
		return true;
	}

	async function updateUserInfo(){
		let user = await Api.getUserInfo();
		await Store.set({
			name: user.data.name,
			login: user.data.login,
			avatar: user.data.avatar_url,
		});
		return user;
	}

	function getContents(path, isRaw) {
		return Api.getContents(path, isRaw);
	}

	function createContent(path, content, sha) {
		return Api.updateContents(path, content, sha);
	}

	/**
	 * 登录
	 *
	 * @param args
	 * @returns {Promise<AxiosPromise>}
	 */
	async function doLogin(...args){
		// 查询旧的 PAT，若存在则删除
		let authorizations = await Api.listAuthorizations(...args);
		let auth = authorizations.data.find(data => data.note == data.note);
		if(auth){
			await Api.deleteAuthorization(...args, auth.id);
		}
		// 创建新的 PAT
		auth = await Api.createAuthorization(...args, data.note)
		await Store.set({
			token: auth.data.token
		});
		// 获取用户信息
		return await updateUserInfo();
	}

	/**
	 * 设置目标仓库
	 *
	 * @param repoName
	 * @returns {Promise<void>}
	 */
	async function setRepo(repoName){
		let repos = await Api.listRepositories();
		let repo = repos.data.find(repo => repo.name == repoName);
		if(!repo){
			repo = await Api.createRepository(repoName)
		}
		await Store.set({repo: repoName});
	}

	async function dev(){
		let info = await promisify(chrome.management.getSelf)();
		if(info.installType == 'development'){
			await Store.set({
				token: '18baef4eacc6b4e70a544a754561cc975357efb7',
				login: 'CQByte',
				repo: 'CQByte.github.io'
			});
			Store.log();
		}
	}

	init().then(() => {
		console.log('extension initialized');
	});

	/**
	 * 调用时务必处理异常
	 **/
	const Background = {
		doLogin,
		setRepo,
		getContents,
		createContent,
		validData,
		save: Store.set,
		get: Store.get,
		get categories(){ return data.categories; },
		get tags(){ return data.tags; },
		get avatar(){ return data.avatar; },
		get login(){ return data.login; },
		get repo(){ return data.repo; }
	}

	window.actions = Background;
}();
