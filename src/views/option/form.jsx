import React from 'react';
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
import Paper from '@material-ui/core/Paper';

class Validate {
    constructor(props, config){
        this.fields = props;
        this.conf = Object.assign({
            passedKeys: false,
            breakFailed: true
        },config)
    }
    valid(){
        let keys, data;
        if(arguments.length == 0){
            throw new TypeError('missing parameter');
        }else if(arguments.length == 1){
            keys = Object.keys(this.fields)
            data = arguments[0]
        }else{
            keys = arguments[0]
            data = arguments[1]
        }

        let results = {};
        let size = 0;
        for(let key of keys){
            for(let checker of this.fields[key]){
                let method = checker[0];
                if(typeof method == 'string'){
                    method = this[method];
                }
                let pass = method(data[key]);
                if(pass){
                    if(this.conf.passedKeys) results[key] = undefined;
                }else{
                    results[key] = checker[1];
                    size++;
                    break;
                }
            }
        }
        Object.defineProperty(results, 'size', {
            value: size,

        })
        this.handler(results)
        return results.size == 0;
    }
    setHandler(cb){
        this.handler = cb
        return this;
    }
    require(data){
        return data != null && data !== '';
    }
}

class Config extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            repo: background.repo || background.login + '.github.io',
            branch: background.branch,
            path: background.path,
            error: {},
        }
        Validate.prototype.branch = (data) => /^\w+$/.test(data);
        Validate.prototype.path = (data) => /^\/(\w+\/?)+$/.test(data);
        this.validate = new Validate({
            repo: [
                ['require','请填写 repo 字段'],
            ],
            branch: [
                ['require','请填写 branch 字段'],
                ['branch', '请填写合法分支名称']
            ],
            path: [
                ['require','请填写 path 字段'],
                ['path', '请填写合法路径']
            ]
        }).setHandler(error => {
            this.setState({error})
        })
    }

    handleChange(field){
        this.setState({[field]: event.target.value})
    }
    handleFocus(field){
        if(this.state.error[field]){
            delete this.state.error[field];
            this.setState({error: this.state.error});
        }
    }

    submit(){
        let args = ['repo', 'branch', 'path'];
        console.log('before submit', this.state)
        if(this.validate.valid(this.state)){
            this.props.onSubmit(background.setRepo(this.state.repo, this.state.branch, this.state.path));
        }
    }


    componentDidUpdate(preProps, preState, snapShot) {
        if(preProps.submit != this.props.submit && this.props.submit)
            this.submit();
    }

    render() {
        // 在导出时使用 withStyles 注入的
        const { classes } = this.props;

        return (
            <React.Fragment>
                <Typography gutterBottom>
                    GitHub page 参数设置
                </Typography>
                <fieldset className={classes.fieldset}>
                    <TextField
                        id="field-repo"
                        className={classes.field}
                        label="repository"
                        fullWidth
                        onFocus={this.handleFocus.bind(this, 'repo')}
                        error={!!this.state.error.repo}
                        helperText={this.state.error.repo || "如果仓库已存在，不会进行任何操作，否则会自动创建它"}
                        onChange={this.handleChange.bind(this, 'repo')}
                        value={this.state.repo}
                        margin="dense"
                    />
                </fieldset>
                <fieldset className={classes.fieldset}>
                    <TextField
                        id="field-branch"
                        className={classes.field}
                        label="branch"
                        fullWidth
                        error={!!this.state.error.branch}
                        helperText={this.state.error.branch || "请确保分支存在，我不会为你创建分支"}
                        onFocus={this.handleFocus.bind(this, 'branch')}
                        onChange={this.handleChange.bind(this, 'branch')}
                        value={this.state.branch}
                        margin="dense"
                    />
                </fieldset>
                <fieldset className={classes.fieldset}>
                    <TextField
                        id="field-branch"
                        className={classes.field}
                        label="默认文章保存路径"
                        fullWidth
                        error={!!this.state.error.path}
                        helperText={this.state.error.path}
                        onFocus={this.handleFocus.bind(this, 'path')}
                        onChange={this.handleChange.bind(this, 'path')}
                        value={this.state.path}
                        margin="dense"
                    />
                </fieldset>
                <div className={classes.actions}>
                    <Button onClick={this.submit.bind(this)} color="primary" variant='contained'>确定</Button>
                </div>
            </React.Fragment>
        );
    }
}
const styles = theme => ({
    root: {
        padding: '0 24px 24px'
    },
    fieldset: {
        border: 'none', margin: 0, padding: 0
    },
    field: {marginBottom: theme.spacing.unit},
    linkBtn: {float: 'right'},
    actions: {textAlign: 'right', marginTop: 8}
});

export default withStyles(styles)(Config);
