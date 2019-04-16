import React from 'react';
import { withSnackbar } from 'notistack';
import CssBaseline from '@material-ui/core/CssBaseline';

class Option extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
        this.toast = (message, variant='info') => {
            this.props.enqueueSnackbar(message, {
                variant: variant,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                }
            });
        }
    }

    componentDidMount() {
        this.toast('componentDidMount', 'success');
    }

    render(){
        return (
            <React.Fragment>
                <CssBaseline />
                <div>
                    <h1>用户信息</h1>
                </div>
                <div>
                    <h1>仓库设置</h1>
                </div>
                <div>
                    <h1>文章设置</h1>
                </div>
            </React.Fragment>
        );
    }
}

export default withSnackbar(Option);
