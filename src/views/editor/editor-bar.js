import React from "react";
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';

import CloudUpload from '@material-ui/icons/CloudUploadOutlined';
import FolderOpen from '@material-ui/icons/FolderOpen';
import Laptop from '@material-ui/icons/Laptop';
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
                <div className={classes.group}>
                    <Tooltip title="本地缓存" aria-label="Add">
                        <Laptop onClick={this.props.local} className={classes.icon}></Laptop>
                    </Tooltip>
                    <Tooltip title="Github 目录" aria-label="Add">
                        <FolderOpen onClick={this.props.open} className={classes.icon}></FolderOpen>
                    </Tooltip>
                    <Tooltip title="上传到 Github" aria-label="Add">
                        <CloudUpload onClick={this.props.upload} className={classes.icon}></CloudUpload>
                    </Tooltip>
                </div>
            </div>
        );
    }
}

const styles = theme => ({
    root: {
        backgroundColor: '#2e2e2e',
        borderColor: '#2e2e2e',
        padding: theme.spacing.unit
    },
    group: {
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        fontSize: 24,
        cursor: 'pointer',
        color: '#b3b3b3',
        margin: '0 16px',
        '&:hover': {
            color: '#4d4d4d'
        }
    }
});

export default withStyles(styles)(EditorBar);
