// import '../../contentJS/oauth';
import React from 'react';
import ReactDom from 'react-dom';
import axios from 'axios';
import qs from 'qs';

class OAuth extends React.Component {
    constructor(props){
        super(props);
        this.state = {

        }
    }
    componentWillMount() {

    }

    componentWillUnmount() {

    }

    getCode(){
        location.href = 'https://github.com/login/oauth/authorize?' + qs.stringify({
            client_id: '91ed6a43c5964d91a6e6',
            redirect_uri: 'https://cqbyte.github.io/oauth-helper/',
            scope: 'user',
            state: '1234',
        }, {encode: false});
    }

    render(){
        return (
            <button onClick={this.getCode}>授权</button>
        );
    }

}

console.log('注入脚本成功')
let container = document.createElement('div');
document.body.appendChild(container);
ReactDom.render((
    <div>
        <p>注入脚本成功</p>
        <OAuth></OAuth>
    </div>
), container);
