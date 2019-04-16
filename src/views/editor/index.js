import React from "react";
import { withStyles } from '@material-ui/core/styles';
import EditorBar from './editor-bar';
import Files from './files';
import TextEditor from "@/components/TextEditor/index";
import Marken from "marked";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from "@material-ui/core/Button";
import {DateFormat} from "@/utils";
import CircularProgress from "@material-ui/core/CircularProgress";
import { withSnackbar } from 'notistack';


function setListener() {
    let handleMouseMove = ev => {
        this.setState({editorWidth: ev.pageX});
    }

    window.onresize = ev => {
        if(this.state.editorWidthPercent){
            this.setState({
                editorWidth: document.body.offsetWidth * this.state.editorWidthPercent
            });
        }
    }

    document.body.addEventListener('mousedown', ev => {
        if(ev.target.id === 'resizable'){
            document.body.addEventListener('mousemove', handleMouseMove);
        }
    })

    document.body.addEventListener('mouseup', ev => {
        if(ev.target.id === 'resizable'){
            document.body.removeEventListener('mousemove', handleMouseMove);
            let percent = ev.pageX/document.body.offsetWidth;
            this.setState({
                editorWidth: ev.pageX,
                editorWidthPercent: percent
            });
            background.save({
                editorWidthPercent: percent
            })
        }
    })
}

class PEDitor extends React.Component {
    constructor(props){
        super(props);
        let ewp = 0.5
        this.state = {
            editorWidth: ewp * document.body.offsetWidth,
            editorWidthPercent: ewp,
            info: '',
            source: '---\ntitle: no title\n---\n',
            result: '',
            path: '_post/' + DateFormat("yyyy-MM-dd-HHmmss.'md'"),
            sha: null,
            open: false
        };
        background.get(['editorWidthPercent']).then(res => {
            this.setState({
                editorWidthPercent: res.editorWidthPercent,
                editorWidth: res.editorWidthPercent * document.body.offsetWidth
            })
        });
        this.autoSaveTime = 10000;
        this.timerID = null;
        this.edited = false;
        this.ext = 'md';
        setListener.bind(this)();
    }

    toast(message, variant){
        // variant could be success, error, warning or info
        this.props.enqueueSnackbar(message, { variant });
    };

    open(){
        this.setState({
            open: true
        })
    }
    handleClose(){
        this.setState({open: false})
    }
    onCreateFile(path, name){
        console.log('onCreateFile', path, name)
        if(name){
            if(!/^\d{4}-\d{2}-\d{2}/.test(path)){
                name = DateFormat("yyyy-MM-dd-") + name;
            }
            let extExec = /\.(\w+)$/i.exec(name);
            if(extExec){
                this.ext = extExec[1]
            }else{
                name += '.md'
            }
        }else{
            name = DateFormat("yyyy-MM-dd-HHmmss.'md'")
        }
        this.setState({
            path: path + '/' + name,
            source: '---\ntitle: no title\n---\n',
            sha: null,
            open: false,
        })
    }
    doCreateFile(){
        if(this.lastChanged && this.lastChanged == this.state.source.trim()){
            return this.toast('内容没有改变')
        }
        this.showLoading();
        background.createContent(this.state.path, this.state.source, this.state.sha).then(res => {
            this.toast('保存成功', 'success');
            this.setState({
                sha: res.data.content.sha
            })
            this.lastChanged = this.state.source.trim();
        }).catch(err => {
            this.toast(err.message, 'error');
        }).then(()=>{
            this.hideLoading();
        })
    }
    onFileSelected(file){
        this.setState({
            path: file.path,
            sha: file.sha,
            open: false
        });
        let match = file.path.match(/\w*\.(\w+)$/)
        this.ext = match?match[1].toLowerCase():null;
        background.getContents(file.path, true).then(res => {
            if(typeof res.data == 'object'){
                let source = atob(res.data.content);
                this.setState({info: null, source, result: '暂不支持此文件预览'});
            }else if(this.ext == 'md'){
                this.preHandleMD(res.data)
            }else{
                this.setState({source: res.data, result: res.data});
            }
        })
    }
    preHandleMD(data){
        // let info = '';
        // let source = data.replace(/^---((\s*.*\s*)*)---/, (match, p1) => {
        //     info = p1;
        //     return '';
        // })
        this.setState({source: data, result: Marken(data)});
    }
    handleUpdate(ev){
        let result = this.ext == 'md' ? Marken(ev.value) : ev.value;
        this.setState({source: ev.value, result})
        if(!this.edited) this.edited = true;
        this.cache(ev.value, ev.type == 'save')
    }
    cache(source, save){
        if(save){
            if(this.timerID){
                clearTimeout(this.timerID);
                this.timerID = null;
            }
            localStorage.setItem('TMP_ARTICLE_SOURCE', JSON.stringify({
                ext: this.ext,
                path: this.state.path,
                sha: this.state.sha,
                content: source
            }))
            return;
        }
        if(this.timerID){
            clearTimeout(this.timerID);
        }
        this.timerID = setTimeout(() => {
            this.timerID = null;
            localStorage.setItem('TMP_ARTICLE_SOURCE', JSON.stringify({
                ext: this.ext,
                path: this.state.path,
                sha: this.state.sha,
                content: source
            }))
        }, this.autoSaveTime)
    }
    showLoading(){
        this.setState({
            progress: <div className={this.props.classes.globalProgress}>
                <CircularProgress/>
            </div>
        })
    }
    hideLoading(){
        this.setState({
            progress: null
        })
    }
    componentDidMount() {
        let data = localStorage.getItem('TMP_ARTICLE_SOURCE')
        if(data){
            data = JSON.parse(data);
            this.ext = data.ext;
            this.setState({path: data.path, sha: data.sha})
            this.preHandleMD(data.content)
        }
    }

    render() {
        const {classes} = this.props;
        return (
            <React.Fragment>
                <CssBaseline />
                <div className={classes.root}>
                    <EditorBar
                        className={classes.editorBar}
                        path={this.state.path}
                        upload={this.doCreateFile.bind(this)}
                        open={this.open.bind(this)}
                    />
                    <div className={classes.editorWrapper}>
                        <div className={classes.left} style={({width: this.state.editorWidth + 'px'})}>
                            <TextEditor className={classes.editor} value={this.state.source} onUpdate={this.handleUpdate.bind(this)} />
                        </div>
                        <div id="resizable" className={classes.divider}></div>
                        <div className={classes.right} dangerouslySetInnerHTML={{__html: this.state.result}}></div>
                    </div>
                </div>

                <Dialog
                    fullWidth
                    maxWidth={'sm'}
                    open={this.state.open}
                    onClose={this.handleClose.bind(this)}
                    aria-labelledby="fileSelector"
                >
                    <DialogTitle id="max-width-dialog-title">新建或打开文件</DialogTitle>
                    <DialogContent>
                        <Files
                            onCreate={this.onCreateFile.bind(this)}
                            onSelect={this.onFileSelected.bind(this)}
                        ></Files>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose.bind(this)} color="primary">
                            取消
                        </Button>
                    </DialogActions>
                </Dialog>
                {this.state.progress}
            </React.Fragment>
        );
    }
}

const styles = theme => ({
    root: {
        height: '100vh', width: '100vw',
        display: 'flex', flexDirection: 'column'
    },
    editorBar: {
        flex: '0 0 auto'
    },
    editorWrapper: {
        flex: '1 1 0',
        overflow: 'hidden',
        color: '#b3b3b3',
        backgroundColor: '#3d3d3d',
        display: 'flex',
        flexDirection: 'row'
    },
    left: {
        flex: '0 0 auto',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    divider: {
        flex: '0 0 auto',
        width: '4px',
        backgroundColor: 'rgba(0,0,0,.6)',
        cursor: 'col-resize'
    },
    right: {
        flex: '1 1 0',
        padding: '20px 40px 80px',
        backgroundColor: '#4d4d4d',
        fontSize: 16,
        overflow: 'auto'
    },
    editor: {flex: '1 1 0'},
    globalProgress: {
        position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,.6)',
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    }
})

export default withSnackbar(withStyles(styles)(PEDitor));
