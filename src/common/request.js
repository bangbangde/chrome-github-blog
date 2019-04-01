import Util from '../utils';
/**
 * 
 */
request = function(params){
    let xhr = new XMLHttpRequest();
    let promise = new Promise((resolve, reject) => {
        xhr.onload = function(){
            resolve(xhr);
        }
        xhr.ontimeout = function(){
            reject(xhr);
        }
    });

    if(params.data){
        if(params.method.toLowerCase() == 'get'){
            params.url = Util.toQueryString(params.data);
        }
    }else{
        params.data = null;
    }

    xhr.open(params.method, params.url, true);

    // 设置头部必须在open之后
    if(!params.headers) {params.headers = {}}
    if(!params.headers['content-Type']){
        params.headers['content-Type'] = 'application/x-www-form-urlencode';
    }
    for(let header in params.headers){
        xhr.setRequestHeader(header, params.headers[header]);
    }

    xhr.send(params.data);
    return promise;
}

request.get = (url, params) => {
    request({
        url,
        method: 'get',
        ...params
    })
}

request.post = (url, params) => {
    request({
        url,
        method: 'post',
        ...params
    })
}

export default request;