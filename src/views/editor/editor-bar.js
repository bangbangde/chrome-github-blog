import React from "react";
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';

import CloudUpload from '@material-ui/icons/CloudUpload';
import CloudDownload from '@material-ui/icons/CloudDownload';
import Cached from '@material-ui/icons/Cached';
import Tooltip from "@material-ui/core/Tooltip";

class EditorBar extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
    }



    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <Avatar alt="github avatar" sizes='48' src={background.avatar} className={classes.avatar} />
                <span className={classes.path}>{background.repo}/{this.props.path}</span>
                <div className={classes.right}>
                    <Tooltip title="本地缓存" aria-label="Add">
                        <Cached onClick={this.props.create} className={classes.icon}></Cached>
                    </Tooltip>
                    <Tooltip title="上传到 Github" aria-label="Add">
                        <CloudUpload onClick={this.props.upload} className={classes.icon}></CloudUpload>
                    </Tooltip>
                    <Tooltip title="Github 目录" aria-label="Add">
                        <CloudDownload onClick={this.props.open} className={classes.icon}></CloudDownload>
                    </Tooltip>
                </div>
            </div>
        );
    }
}

const styles = theme => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#2e2e2e',
        borderColor: '#2e2e2e'
    },
    avatar: {
        margin: 10
    },
    path: {
        color: '#b3b3b3'
    },
    right: {
        textAlign: 'right',
        flex: '1 1 0',
        overflow: 'hidden'
    },
    icon: {
        fontSize: 30,
        cursor: 'pointer',
        color: '#b3b3b3',
        margin: '0 16px',
        '&:hover': {
            color: '#4d4d4d'
        }
    }
});

export default withStyles(styles)(EditorBar);
