import React from "react";
import Button from '@material-ui/core/Button';
import './index.css';

/**
 * 登录方式
 *
 * @enum {string}
 */
const loginType = {
    PASSWORD: 'password',
    TOKEN: 'token'
}

class Popup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginType: loginType.PASSWORD,
            uid: '',
            pwd: '',
            token: ''
        }
    }

    changeType(loginType){
        this.setState({loginType})
    }

    handleChange(field){
        this.setState({[field]:event.target.value})
    }

    handleSubmit(){
        if(this.state.loginType == loginType.PASSWORD){
            let {uid, pwd} = this.state;
            let bg = chrome.extension.getBackgroundPage();
            bg.login(uid, pwd);
        }else{
            let token = this.state.token;
        }
        event.preventDefault();
    }

    render() {
        let fieldPwd =
            <fieldset className='fieldset'>
                <legend>用户名/密码</legend>

                <label>login</label>
                <input type="text" required value={this.state.uid} onChange={this.handleChange.bind(this, 'uid')}/>
                <label>password</label>
                <input type="password" required value={this.state.pwd} onChange={this.handleChange.bind(this, 'pwd')}/>

                <p>你的密码只用于获取 GitHub token，不会被存储到任何地方。</p>
                <Button size="small" onClick={this.changeType.bind(this, loginType.TOKEN)}>使用 token</Button>
            </fieldset>;

        let fieldToken =
            <fieldset className='fieldset'>
                <legend>Token</legend>
                <label>Token</label>
                <input type="text" value={this.state.token} onChange={this.handleChange.bind(this, 'token')}/>
                <Button size="small" onClick={this.changeType.bind(this, loginType.PASSWORD)}>密码登录</Button>
            </fieldset>;

        return <div className="container">
            <h4>登录到 GitHub</h4>
            <form onSubmit={this.handleSubmit.bind(this)}>
                {this.state.loginType == loginType.PASSWORD?fieldPwd:fieldToken}
                <Button type='submit' variant="contained" color="primary">登录</Button>
            </form>
        </div>
    }
}

export default Popup;
