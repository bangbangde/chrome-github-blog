import React from 'react';
import { withSnackbar } from 'notistack';
import CssBaseline from '@material-ui/core/CssBaseline';
import Auth from './auth';
import Form from './form';
import CircularProgress from "@material-ui/core/CircularProgress";

const styles = {
    globalProgress: {
        position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,.6)',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    },
    main: {
        backgroundColor: 'white',
        minHeight: '230px',
        padding: '24px'
    }
}

class Option extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loaded: false,
            authShow: false
        };
    }

    showLoading(){
        this.setState({
            progress: <div style={styles.globalProgress}>
                <CircularProgress/>
            </div>
        })
    }
    hideLoading(){
        this.setState({
            progress: null
        })
    }

    componentWillMount() {
        this.showLoading();
        background.validToken().then(res => {
            this.setState({
                authShow: !res.success,
                loaded: res.success
            })
            this.hideLoading();
        })
    }

    toast(message, variant='info'){
        this.props.enqueueSnackbar(message, {
            variant: variant,
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
            }
        });
    }

    onAuthSubmit(pm){
        this.showLoading();
        pm.then(() => {
            this.setState({authShow: false, loaded: true})
            this.hideLoading();
        }).catch( msg => {
            this.hideLoading();
            this.toast(msg, 'warn')
        });
    }

    onFormSubmit(pm){
        this.showLoading();
        pm.then(res => {
            this.hideLoading();
            if(res.success){
                this.toast('信息已保存', 'success')
            }else{
                this.toast(res.message, 'error')
            }
        }).catch( e => {
            this.hideLoading();
            this.toast(e.message, 'warn');
        });
    }

    componentDidMount() {
        // this.toast('componentDidMount', 'success');
    }

    render(){
        return (
            <React.Fragment>
                <CssBaseline />
                {this.state.progress}
                <div style={styles.main}>
                    {this.state.authShow && <Auth show={this.state.authShow} onSubmit={this.onAuthSubmit.bind(this)} />}
                    {this.state.loaded && <Form onSubmit={this.onFormSubmit.bind(this)} />}
                </div>

            </React.Fragment>
        );
    }
}

export default withSnackbar(Option);
