import {promisify, Store} from '../utils';
import * as Api from '@/api';

!function() {
	/**
	 *  Storage data
	 */
	const data = {
		name: undefined,
		login: undefined,
		avatar: undefined,
		token: undefined,                      // *required
		note: 'chrome extension access token',

		repo: undefined,                       // *required
		branch: 'master',                      // "master" | "gh-pages"
		path: '/_posts',                             // "/" | "/docs/_posts" | "/_posts"
		message: 'by chrome extension',

		postsIndex: null,  // @type Set 缓存文章索引

		editorWidthPercent: 0.5

		// TODO:
		// categories: ['笔记', '随笔', '前端'],
		// tags: ['Javascript', 'css'],
	};

	async function check(){
		// 初始化数据
		await initData();
		let token = await validToken();
		if(!token.success){
			return token;
		}
		return await checkConfig();
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
	}

	async function dev(){
		let info = await promisify(chrome.management.getSelf)();
		if(info.installType == 'development'){
			// await Store.set({
			// 	token: '',
			// 	login: 'CQByte',
			// 	repo: 'CQByte.github.io'
			// });
			console.log(data)
			Store.log();
		}
	}

	async function validToken(){
		if(!data.token) {
			return {success: false, message: 'token not set'}
		}

		// 通过获取用户信息判断token是否失效
		let user = await Api.getUserInfo();
		if(!user.success){
			await Store.remove('token')
			return {success: false, message: user.data.message};
		}
		return {success: true};
	}

	async function checkConfig(){
		if(!data.repo){
			return {success: false, message: 'repo not set'}
		}

		// 通过访问仓库检测配置是否有效
		let repo = await Api.getContents();
		return repo;
	}

	async function updateUserInfo(user){
		if(user){
			await Store.set({
				name: user.data.name,
				login: user.data.login,
				avatar: user.data.avatar_url,
			});
			user.success = true;
		}else{
			user = await Api.getUserInfo();
			if(user.success){
				await Store.set({
					name: user.data.name,
					login: user.data.login,
					avatar: user.data.avatar_url,
				});
			}
		}
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
		if(args.length == 1){
			await Store.set({
				token: args[0]
			});
			return await updateUserInfo();
		}else{
			// 查询旧的 PAT，若存在则删除
			let authorizations = await Api.listAuthorizations(...args);
			if(!authorizations.success){
				return authorizations;
			}
			let auth = authorizations.data.find(data => data.note == data.note);
			if(auth){
				let del = await Api.deleteAuthorization(...args, auth.id);
				if(!del){
					return del;
				}
			}
			// 创建新的 PAT
			auth = await Api.createAuthorization(...args, data.note)
			if(!auth.success){
				return auth;
			}
			await Store.set({
				token: auth.data.token
			});
			// 获取用户信息
			return await updateUserInfo();
		}
	}

	/**
	 * 设置目标仓库
	 *
	 * @param repoName
	 * @returns {Promise<void>}
	 */
	async function setRepo(repo, branch, path){
		let valid = await Api.getBranches(repo, branch);
		if(valid.success){

			await Store.set({repo, branch, path});
		}
		return valid;
	}

	check().catch( e => {
		return {success: false, message: e.message}
	}).then(res => {
		chrome.browserAction.onClicked.addListener(() => {
			if(res.success){
				chrome.tabs.create({
					url: 'editor.html'
				})
			}else{
				chrome.runtime.openOptionsPage();
				console.warn(res.message)
			}
		});
		console.log('extension is ready');
	});

	const Background = {
		doLogin,
		setRepo,
		getContents,
		createContent,
		checkConfig,
		validToken,
		save: Store.set,
		get: Store.get,
		remove: Store.remove,
		get postsIndex(){ return data.postsIndex; },
		get avatar(){ return data.avatar; },
		get login(){ return data.login; },
		get repo(){ return data.repo; },
		get branch(){ return data.branch; },
		get path(){ return data.path; },
		get width(){ return data.editorWidthPercent; }
	}

	window.actions = Background;
}();
