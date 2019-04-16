const axios = require('axios');

axios.interceptors.response.use(response => {
    console.log('interceptors', response);
    return response;
}, error => {
    console.log('interceptors', error)
    return Promise.reject(error);
})

axios({
    url: 'https://www.baidu.com',
    transformResponse: [
        function (data) {
            console.log('transformResponse', data)
            return data;
        }
    ]
})
