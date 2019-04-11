import Url from "url";

const mock = {
    'get /authorizations': config => new Promise(resolve => {
        resolve({
            status: 200,
            data: []
        })
    }),
    'post /authorizations': config => new Promise(resolve => {
        resolve({
            status: 201,
            data: {
                token: '18baef4eacc6b4e70a544a754561cc975357efb7'
            }
        })
    })
}

class Mock{
    constructor(adapter) {
        this.adapter = adapter;
    }
    test(config){
        let path = Url.parse(config.url).path;
        let key = `${config.method} ${path}`;
        if(mock[key]){
            return mock[key]();
        }else{
            return this.adapter(config)
        }
    }
}
export default Mock;
