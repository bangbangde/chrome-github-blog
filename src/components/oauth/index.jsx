import React from 'react';
import axios from 'axios';
import qs from "qs";

class OAuth extends React.Component {
    constructor(props){
        super(props);
        this.state = {}
    }
    componentWillMount() {
        if(location.search){
            let search = qs.parse(location.search.substr(1))
            console.log(search)
            if(search.code){
                this.setState({code: search.code})
                this.getAccessToken(search.code)
            }
        }

    }
    componentWillUnmount() {}

    getCode(){
        location.href = 'https://github.com/login/oauth/authorize?' + qs.stringify({
            client_id: '91ed6a43c5964d91a6e6',
            redirect_uri: 'callback://oauth-code',
            scope: 'user',
            state: '1234',
        }, {encode: false});
    }
    getAccessToken(code){
        axios.post('https://github.com/login/oauth/access_token', {
            client_id: '91ed6a43c5964d91a6e6',
            client_secret: 'b59832960c642ade343cdb205f72dd5a47a8b0d1',
            code,
            redirect_uri: 'callback://oauth-code',
            state: '1234'
        }).then(res => {
            this.setState({accessToken: res.data})
        })
    }
    render(){
        return (
            <div>{this.state.code?<div>{this.state.code}{this.state.accessToken}</div>:<button onClick={this.getCode}>授权</button>}</div>
        );
    }
}

export default OAuth;
