import axios from 'axios';
import Mock from './mock';
import { Base64 } from 'js-base64';

axios.defaults.baseURL = 'https://api.github.com';
axios.defaults.headers.common['Accept'] = 'application/vnd.github.v3+json';
const mock = new Mock(axios.defaults.adapter);
axios.defaults.adapter = config => mock.test(config);
axios.defaults.validateStatus = function (status) {
    return status < 500; // Reject only if the status code is greater than or equal to 500
}
axios.interceptors.response.use(res => {
    if(res.data && res.data.message){
        res.success = false
    }else{
        res.success = true
    }
    console.log('AXIOS response:', res.config.url, res.success?'success':'error')
    return res;
});
export function setData(key, value) {
    axios[key] = value;
    if(key == 'token'){
        axios.defaults.headers.common['Authorization'] = 'token ' + value;
    }
}

export async function createAuthorization(username, password) {
    return axios({
        url: 'authorizations',
        method: 'post',
        auth: {username, password},
        data: {
            "scopes": ["repo"],
            "note": axios.note
        },
    });
}

export async function listAuthorizations(username, password) {
    return axios({
        url: 'authorizations',
        method: 'get',
        auth: {username, password}
    });
}

export async function deleteAuthorization(username, password, id) {
    return axios({
        url: 'authorizations/' + id,
        method: 'delete',
        auth: {username, password}
    });
}

export async function getUserInfo() {
    return axios({
        url: 'user',
        method: 'get'
    });
}

export async function getRepositories() {
    return axios({
        url: '/user/repos',
        method: 'get'
    });
}

export async function getBranches(repo, branch = '') {
    return axios({
        url: `/repos/${axios.login}/${repo}/branches/${branch}`,
        method: 'get'
    });
}

export async function createRepository(name) {
    return axios({
        url: '/user/repos',
        method: 'post',
        data:{name}
    });
}

export async function getContents(path = '', isRaw = false) {
    return axios({
        url: `repos/${axios.login}/${axios.repo}/contents/${path}`,
        method: 'get',
        headers: {
            Accept: isRaw ? 'application/vnd.github.v3.raw+json' : 'application/vnd.github.v3+json'
        },
        param: {ref: axios.branch}
    });
}

export async function updateContents(path, content, sha) {
    return axios({
        url: `repos/${axios.login}/${axios.repo}/contents/${path}`,
        method: 'put',
        data: {
            message: axios.message,
            content: Base64.encode(content),
            branch: axios.branch,
            sha
        }
    });
}

export {axios}
