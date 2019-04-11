import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

class Done extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true
        }
    }
    componentDidUpdate(preProps, preState, snapShot) {
        console.log(preProps.submit, this.props.submit)
        if(preProps.submit != this.props.submit && this.props.submit)
            this.props.onSubmit(true);
    }
    render() {
        // 在导出时使用 withStyles 注入的
        const { classes } = this.props;

        return <div className={classes.root}>
            <Typography variant='h5' gutterBottom>准备就绪，你可以开始写作了</Typography>
            <Typography variant='subtitle1' color="textSecondary" gutterBottom>如果你变更了仓库，请返回上一步重新登记</Typography>
            {/*<CircularProgress size={80} className={classes.progress} />*/}
        </div>;
    }
}
const styles = theme => ({
    root: {textAlign: 'center'},
    progress: {}
});

export default withStyles(styles)(Done);
