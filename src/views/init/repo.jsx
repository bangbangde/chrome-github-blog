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

class Auth extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            repo: 'cqbyte.github.io',
            errors: {},
        }
        this.background = chrome.extension.getBackgroundPage().actions;
    }

    handleChange(field){
        this.setState({[field]: event.target.value})
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
        let args = ['repo'];
        if(this.validate(args)){
            let params = args.map(key => this.state[key]);
            this.background.setRepo(...params).then(res => {
                if(res.error){
                    this.props.toast(res.error, 'warning')
                    this.props.onSubmit(false);
                }else{
                    this.props.onSubmit(true);
                }
            })
        }else{
            this.props.onSubmit(false);
        }
    }


    componentDidUpdate(preProps, preState, snapShot) {
        if(preProps.submit != this.props.submit && this.props.submit)
            this.submit();
    }

    render() {
        // 在导出时使用 withStyles 注入的
        const { classes } = this.props;

        return <fieldset className={classes.fieldset}>
            <Typography color="textSecondary" gutterBottom>
                填写你的博客所在仓库名称
            </Typography>
            <TextField
                id="field-repo"
                className={classes.field}
                label="repository"
                fullWidth
                error={this.state.errors.repo}
                helperText="如果仓库已存在，不会进行任何操作，否则会自动创建它"
                onChange={this.handleChange.bind(this, 'repo')}
                value={this.state.repo}
                margin="dense"
            />
        </fieldset>;
    }
}
const styles = theme => ({
    root: {
        padding: '0 10%',
        maxWidth: '1000px',
        margin: 'auto'
    },
    fieldset: {
        border: 'none', margin: 0, padding: 0
    },
    field: {marginBottom: theme.spacing.unit},
    linkBtn: {float: 'right'}
});

export default withStyles(styles)(Auth);
