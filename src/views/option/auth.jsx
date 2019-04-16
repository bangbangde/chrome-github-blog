import React, {Fragment} from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { withStyles } from '@material-ui/core/styles';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Files from "@/views/editor/files";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import Link from '@material-ui/core/Link';

const loginType = {
    PASSWORD: 'password',
    TOKEN: 'token'
}

class Auth extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginType: loginType.PASSWORD,
            username: 'chengqifw@gmail.com',
            password: 'cbd579923.github',
            token: '',
            errors: {},
            showPassword: false
        }
        this.background = chrome.extension.getBackgroundPage().actions;
    }

    changeType(loginType){
        this.setState({loginType})
    }

    handleChange(field){
        this.setState({[field]: event.target.value})
    }

    handleClickShowPassword(){
        let showPassword = !this.state.showPassword;
        this.setState({showPassword})
    }

    validate(params){
        for(let key of params){
            let val = this.state[key];
            if(!val){
                this.state.errors[key] = true;
                this.setState({errors: this.state.errors})
                return false;
            }else if(this.state.errors[key] == true){
                this.state.errors[key] = false;
                this.setState({errors: this.state.errors})
            }
        }
        return true;
    }

    submit(){
        let args = this.state.loginType == loginType.PASSWORD ? ['username', 'password'] : ['token'];
        if(this.validate(args)){
            this.props.onSubmit(new Promise((resolve, reject) => {
                let params = args.map(key => this.state[key]);
                this.background.doLogin(...params).then(res => {
                    if(res.success){
                        resolve();
                    }else{
                        reject(err.message);
                    }
                }).catch(err => {
                    reject(err.message);
                });
            }));
        }else{
            this.props.onSubmit(Promise.reject());
        }
    }

    genFieldsPWD(classes){
        return <fieldset className={classes.fieldset}>
            <Typography color="textSecondary" gutterBottom>
                提供你的 GitHub 账号密码进行授权
            </Typography>
            <TextField
                id="field-username"
                className={classes.field}
                label={this.state.username.error?this.state.username.info:'Username or email address'}
                onChange={this.handleChange.bind(this, 'username')}
                fullWidth
                error={this.state.errors.username}
                value={this.state.username}
                margin="dense"
            />
            <FormControl className={classes.field} fullWidth>
                <InputLabel htmlFor="field-password">{this.state.password.error?this.state.password.info:'Password'}</InputLabel>
                <Input
                    id="field-password"
                    type={this.state.showPassword ? 'text' : 'password'}
                    value={this.state.password}
                    error={this.state.errors.password}
                    onChange={this.handleChange.bind(this, 'password')}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="Toggle password visibility"
                                onClick={this.handleClickShowPassword.bind(this)}
                            >
                                {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                        </InputAdornment>
                    }
                />
                <FormHelperText>密码只用于获取 GitHub token，不会被存储到任何地方。</FormHelperText>
            </FormControl>
            <Link className={classes.linkBtn} variant='body2' onClick={this.changeType.bind(this, loginType.TOKEN)}>使用 token</Link>
        </fieldset>;
    }

    genFieldsToken(classes){
        return <fieldset className={classes.fieldset}>
            <Typography color="textSecondary" gutterBottom>
                提供你的 GitHub Private access token
            </Typography>
            <TextField
                id="field-token"
                className={classes.field}
                label="Private access token"
                fullWidth
                error={this.state.errors.token}
                onChange={this.handleChange.bind(this, 'token')}
                value={this.state.token}
                margin="dense"
            />
            <Link className={classes.linkBtn} variant='body2' onClick={this.changeType.bind(this, loginType.PASSWORD)}>密码登录</Link>
        </fieldset>;
    }

    render() {
        // 在导出时使用 withStyles 注入的
        const { classes } = this.props;
        return <React.Fragment>
            {this.state.loginType == loginType.PASSWORD ? this.genFieldsPWD(classes) : this.genFieldsToken(classes)}
            <div className={classes.actions}>
                <Button onClick={this.submit.bind(this)} color="primary" variant='contained'>确定</Button>
            </div>
        </React.Fragment>
    }
}
const styles = theme => ({
    fieldset: {
        border: 'none', margin: 0, padding: 0
    },
    field: {marginBottom: theme.spacing.unit},
    linkBtn: {cursor: 'pointer'},
    actions: {textAlign: 'right', marginTop: 8}
});

export default withStyles(styles)(Auth);
