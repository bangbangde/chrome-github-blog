import React from "react";
import { withStyles } from '@material-ui/core/styles';
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import LinearProgress from '@material-ui/core/LinearProgress';

import SnackbarContent from '@material-ui/core/SnackbarContent';
import ErrorIcon from '@material-ui/icons/Error';
import Refresh from '@material-ui/icons/Refresh';
import IconButton from "@material-ui/core/IconButton";

class Files extends React.Component {
    constructor(props){
        super(props);
        let root = background.repo;
        this.state = {
            root,
            path: '',
            newFileName: '',
            netErr: '',
            paths: []
        };
        this.loading = false;
        this.getContents = (path, isRaw) => {
            this.loading = true;
            return background.getContents(path, isRaw).then(res => {
                this.loading = false;
                if(!path){
                    this.setState({
                        [this.state.root]: res.data,
                        netErr: ''
                    })
                }else{
                    this.setState({
                        [path]: res.data,
                        netErr: ''
                    })
                }
            }).catch(e => {
                this.loading = false;
                this.setState({
                    netErr: e.message
                })
            })
        };
    }

    handleChange(){
        this.setState({newFileName: event.target.value})
    }

    onCreateBtnClicked(){
        this.props.onCreate(this.state.path, this.state.newFileName)
    }

    handleFileClick(node){
        console.log('handleFileClick', node)
        if(node && node.type == 'file'){
            this.props.onSelect(node)
        }else{
            console.log('handleFileClick', node.path, node.path.split('/'))
            this.setState({
                path: node.path,
                paths: node.path.split('/')
            })
        }
    }

    onRefresh(){
        this.setState({
            netErr: ''
        })
    }

    handleRedirect(index){
        let paths = this.state.paths.slice(0, index+1);
        console.log('handleRedirect', this.state.loading, paths)
        if(!this.state.loading){
            this.setState({
                path: paths.join('/'),
                paths
            })
        }
    }

    render() {
        const { classes } = this.props;
        let iconDirectory = <svg aria-label="directory" className={classes.icon} viewBox="0 0 14 16" version="1.1" width="14" height="16" role="img"><path fillRule="evenodd" d="M13 4H7V3c0-.66-.31-1-1-1H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zM6 4H1V3h5v1z"></path></svg>;
        let iconFile = <svg aria-label="file" className={classes.icon} viewBox="0 0 12 16" version="1.1" width="12" height="16" role="img"><path fillRule="evenodd" d="M6 5H2V4h4v1zM2 8h7V7H2v1zm0 2h7V9H2v1zm0 2h7v-1H2v1zm10-7.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v12h10V5z"></path></svg>;

        const genPath = () => this.state.paths.map((path, index, {length}) => (
            <span
                key={path}
                className={[index + 1 < length ? classes.path : null].join(' ')}
                onClick={this.handleRedirect.bind(this, index)}
            >
                {path}/
            </span>
        ));

        const genNodes = () => {
            if(this.state.netErr){
                return <div className={classes.errWrap}>
                    <SnackbarContent
                        className={classes.error}
                        message={
                            <span className={classes.message}>
                            <ErrorIcon className={classes.iconErr}></ErrorIcon>
                                {this.state.netErr}
                        </span>
                        }
                        action={[
                            <IconButton
                                key="refresh"
                                aria-label="refresh"
                                color="inherit"
                                className={classes.refresh}
                                onClick={this.onRefresh.bind(this)}
                            >
                                <Refresh className={classes.iconRefresh} />
                            </IconButton>,
                        ]}
                    />
                </div>

            }
            let path = this.state.path;
            let cache = this.state[path || this.state.root];
            if(cache){
                return cache.map(node => (
                    <li
                        type={node.type}
                        key={node.path}
                    >
                        {node.type == 'file' ? iconFile : iconDirectory}
                        <span
                            className={classes.fileName}
                            onClick={this.handleFileClick.bind(this, node)}
                        >{node.name}</span>
                    </li>
                ))
            }else{
                if(!this.loading){
                    this.getContents(path)
                }
                return <LinearProgress variant="query" />
            }
        }

        return (
            <div className={classes.root}>
                <div className={classes.head}>
                    <span
                        className={classes.path}
                        onClick={this.handleRedirect.bind(this, -1)}
                    >{this.state.root}/</span>
                    {genPath()}
                    <TextField
                        className={classes.inputName}
                        onChange={this.handleChange.bind(this)}
                        type="text"
                        value={this.state.newFileName}
                        placeholder={'yyyy-MM-ddHHmmss.md'}
                    />
                    <Button
                        className={classes.btnNew}
                        onClick={this.onCreateBtnClicked.bind(this)}
                        color="primary" variant="contained">
                        新建
                    </Button>
                </div>
                <ul className={classes.directories}>
                    {genNodes()}
                </ul>
            </div>
        );
    }
}

const styles = theme => ({
    root: {
        minHeight: '40vh'
    },
    btnNew: { float: 'right', marginRight: 8},
    icon: {
        fill: 'rgba(3,47,98,.5)'
    },
    directories: {
        fontSize: '1.2em',
        listStyle: 'none',
        paddingBlockStart: '0',
        paddingInlineStart: '0',
        '&>li': {
            padding: 4
        }
    },
    fileName: {
        marginLeft: '8px',
        color: '#0366d6',
        cursor: 'pointer',
        '&:hover': {
            textDecoration: 'underline'
        }
    },
    path: {
        lineHeight: '32px',
        color: '#0366d6',
        cursor: 'pointer',
        '&:hover': {
            textDecoration: 'underline'
        }
    },
    errWrap: {
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '160px'
    },
    error: {
        backgroundColor: theme.palette.error.dark,
        position: 'relative',
        margin: '0 auto'

    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
    iconErr: {
        fontSize: 20,
        opacity: 0.9,
        marginRight: theme.spacing.unit,
    },
    inputName: {
        width: '180px',
        marginLeft: '4px'
    }
});

export default withStyles(styles)(Files);
