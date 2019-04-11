import axios from 'axios';
import Mock from './mock';

axios.defaults.baseURL = 'https://api.github.com';
axios.defaults.headers.common['Accept'] = 'application/vnd.github.v3+json';
axios.defaults.validateStatus = function (status) {
    return status < 500; // Reject only if the status code is greater than or equal to 500
}

const mock = new Mock(axios.defaults.adapter);
axios.defaults.adapter = function (config) {
    return mock.test(config)
};

export async function createAuthorization(username, password, note, scopes) {
    return axios({
        url: 'authorizations',
        method: 'post',
        auth: {username, password},
        data: {
            "scopes": scopes || ["repo", "user"],
            "note": note || "chrome extension access token"
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

export async function listRepositories() {
    return axios({
        url: '/user/repos',
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

export function setToken(token) {
    axios.defaults.headers.common['Authorization'] = 'token ' + token;
}
