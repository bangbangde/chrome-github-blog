import React from "react";
import Auth from './auth';
import Repo from './repo';
import Done from './done';

import Button from '@material-ui/core/Button';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import { SnackbarProvider, withSnackbar } from 'notistack';

import { withStyles } from '@material-ui/core/styles';

const StepData = {
    steps: ['授权访问 GitHub', '填写仓库名称', '初始化项目'],
    buttons: ['授权', '下一步', '开始写作'],
    getContent: function (index) {
        switch (index) {
            case 0: return <Auth submit={this.state.submit} onSubmit={this.onSubmit} toast={this.toast}></Auth>
            case 1: return <Repo submit={this.state.submit} onSubmit={this.onSubmit} toast={this.toast}></Repo>
            case 2: return <Done submit={this.state.submit} onSubmit={this.onSubmit} toast={this.toast}></Done>
        }
    }
}

class Init extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStep: props.step,
            submit: false,
            loading: false,
            logo: 'assets/images/github-logo.svg'
        }
        StepData.getContent = StepData.getContent.bind(this);
        this.toast = this.toast.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.background = chrome.extension.getBackgroundPage().actions;
    }

    toast(message, variant){
        // variant could be success, error, warning or info
        this.props.enqueueSnackbar(message, { variant });
    };

    nextStep(){
        this.setState({submit: true, loading: true});
        console.log('nextStep')
    }

    onSubmit(res){
        console.log('onSubmit')
        this.setState({
            submit: false,
            loading: false
        })
        if(res){
            switch (this.state.activeStep) {
                case 0:
                    this.background.step = 1;
                    this.setState({
                        activeStep: 1
                    })
                    break;
                case 1:
                    this.background.step = 2;
                    this.setState({
                        activeStep: 2,
                        loading: false
                    })
                    break;
                case 2:
                    chrome.tabs.update({
                        'url': 'editor.html'
                    });
                    break;
            }
        }
    }

    resetRepo(){
        this.background.step = 1;
        this.setState({
            activeStep: 1,
            loading: false
        })
    }

    render() {
        // 在导出时使用 withStyles 注入的
        const { classes } = this.props;
        const { activeStep } = this.state;
        const buttonText = StepData.buttons[activeStep];
        const content = StepData.getContent(activeStep);

        return <div className={classes.root}>
            <div className={classes.logo}>
                <img src={this.state.logo} alt="github-logo"/>
            </div>

            <Stepper activeStep={activeStep} alternativeLabel>
                {StepData.steps.map(label => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Card className={classes.card}>
                <CardContent>
                    {content}
                </CardContent>
            </Card>

            <div className={classes.actions}>
                {this.state.activeStep == 2 &&
                <Button
                    size='large'
                    disabled={this.state.loading}
                    onClick={this.resetRepo.bind(this)}
                    variant="contained"
                >
                    重置仓库
                </Button>
                }
                <span className={classes.wrapper}>
                    <Button
                        size='large'
                        disabled={this.state.loading}
                        onClick={this.nextStep.bind(this)}
                        variant="contained"
                        color="primary"
                    >
                        {buttonText}
                    </Button>

                    {this.state.loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                </span>
            </div>
        </div>
    }
}
const styles = theme => ({
    root: {
        padding: '0 10%',
        maxWidth: '1000px',
        margin: 'auto'
    },
    logo: {
        margin: '50px',
        textAlign: 'center'
    },
    card: {
        margin: '0 10%'
    },
    actions: {
        textAlign: 'center',
        marginTop: 50
    },
    wrapper: {
        margin: theme.spacing.unit,
        position: 'relative',
    },
    buttonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
});

const MyApp = withSnackbar(withStyles(styles)(Init));

function IntegrationNotistack(props) {
    return (
        <SnackbarProvider maxSnack={3}>
            <MyApp step={props.step} />
        </SnackbarProvider>
    );
}

export default IntegrationNotistack;
