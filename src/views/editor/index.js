import React from "react";
import {withStyles} from '@material-ui/core/styles';
import EditorBar from './editor-bar';
import Files from './files';
import TextEditor from "@/components/TextEditor/index";
import Marken from "marked";
import CssBaseline from '@material-ui/core/CssBaseline';
import {DateFormat, pathJoin} from "@/utils";
import CircularProgress from "@material-ui/core/CircularProgress";
import {withSnackbar} from 'notistack';
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Drawer from "@material-ui/core/Drawer";
import './style.css'
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Delete from '@material-ui/icons/Delete';

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
function parse(data) {
    // TODO:// 检查正则表达式，运行就卡死
    // let source = data.replace(/^---((\s+.*)*)\s---/, (match, p1) => {
    //     info = p1;
    //     return '';
    // })
    let index = data.indexOf('---', 3);
    if(index){
        return Marken(data.substr(index+3))
    }
    return Marken(data)
}

class MDEditor extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            showFiles: false,
            showDrawer: false,
            showAlert: false,

            editorWidth: document.body.offsetWidth * background.width,
            editorWidthPercent: background.width,

            source: undefined,
            result: undefined,
            // 当前打开文档相关信息
            path: undefined,
            sha: undefined,
            index: -1,

            postsIndex: background.postsIndex || [],
        };
        // 节流使用的变量
        this.saveInterval = 10000;
        this.lastSaveTime = 0;
        /**
         * @type { path: string,sha:string,lastModified:string }
         */
        this.post = null; // 指向 postsIndexList 成员
    }
    componentWillMount() {
        setListener.bind(this)();
        this.loadData();
        console.log('show time', this.state)
    }

    loadData(data){
        let date = DateFormat('yyyy-MM-dd')
        let defMeta = `---\nlayout: post\ntitle: ${date}\nsubtitle:\ndate: ${date}\ntags: ['随笔']\n# categories:\n# cover:\n---\n`;
        if(!data){ // 默认新文章
            data = {
                source: defMeta,
                path: pathJoin(background.path, DateFormat("yyyy-MM-dd-HHmmss.'md'"))
            }
        }else if(!data.source){ // 新建文章
            data.source = defMeta;
        }
        data.result = parse(data.source);
        this.setState(data);
    }
    onCreateFile(path){
        this.setState({showFiles: false})
        this.loadData({path});
    }
    onFileSelected(file){
        this.setState({showFiles: false});
        if(this.post && this.post.path == file.path) return;
        let index = this.state.postsIndex.findIndex(item => item.path == file.path)
        if(index != -1){
            this.post = this.state.postsIndex[index];
            this.toast('为你打开的是该文件的本地缓存，请先提交或删除此缓存', 'info');
            background.get(this.post.path).then(res => {
                this.loadData({
                    path: this.post.path,
                    sha: this.post.sha,
                    source: res[this.post.path],
                    postIndex: index
                })
            });
        }else{
            this.showLoading()
            background.getContents(file.path, true).then(res => {
                let source = null;
                if(typeof res.data == 'object'){
                    source = atob(res.data.content);
                }else{
                    source = res.data;
                }
                this.loadData({source, path: file.path, sha: file.sha})
                this.hideLoading();
            }).catch(e => {
                this.hideLoading()
                this.toast(e.message, 'error')
            })
        }
    }
    onOpenLocalFile(index){
        if(this.state.index == index) return;
        this.post = this.state.postsIndex[index];
        background.get(this.post.path).then(res => {
            this.loadData({
                path: this.post.path,
                sha: this.post.sha,
                source: res[this.post.path],
                index: index
            })
        });
    }
    handleUpdate(ev){
        this.setState({source: ev.value, result: parse(ev.value)})
        this.cache(ev.value)
    }
    handleKeyDown(ev){
        switch (ev.type) {
            case 'save':
                this.saveData()
                break
        }
    }
    cache(){
        if(Date.now() - this.lastSaveTime > this.saveInterval){
            this.lastSaveTime = Date.now();
            this.saveData();
        }
    }
    saveData(){
        background.save({
            [this.state.path]: this.state.source
        }).then(res => {
            let {path, sha, postsIndex} = this.state;
            if(this.post){
                this.post.lastModified = DateFormat();
            }else{
                this.post = postsIndex.find(item => item.path == path);
                if(this.post){
                    this.post.lastModified = DateFormat();
                }else{
                    this.post = {path,sha,lastModified: DateFormat()};
                    postsIndex.unshift(this.post)
                }
            }
            this.setState({postsIndex});
            background.save({postsIndex});
        })
    }
    onFileCanceled(){
        this.setState({showFiles: false})
    }
    showDrawer(){
        this.setState({showDrawer: !this.state.showDrawer});
    }
    open(){
        this.setState({
            showFiles: true
        })
    }
    upload(){
        this.setState({
            showAlert: true
        })
    }
    handleClose(field){
        this.setState({
            [field]: false
        })
    }
    deletePostCache(index){
        if(index == this.state.index){
            this.loadData()
        }
        let path = this.state.postsIndex.splice(index, 1)[0].path;
        this.setState({postsIndex: this.state.postsIndex})
        background.save({
            postsIndex: this.state.postsIndex
        })
        background.remove(path);
        event.preventDefault();
    }
    uploadConfirm(){
        this.setState({
            showAlert: false
        })
        this.showLoading();

        background.createContent(this.state.path, this.state.source, this.state.sha).then(res => {
            this.toast('保存成功', 'success');
            this.setState({
                sha: res.data.content.sha
            })

            this.state.postsIndex.splice(this.state.index, 1);
            this.setState({postsIndex: this.state.postsIndex})
            background.save({postsIndex: this.state.postsIndex})
            background.remove(this.state.path);
            this.loadData();
        }).catch(err => {
            this.toast(err.message, 'error');
        }).then(()=>{
            this.hideLoading();
        })
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
    toast(message, variant){
        // variant could be success, error, warning or info
        this.props.enqueueSnackbar(message, { variant });
    };
    render() {
        const {classes} = this.props;
        const {progress, showFiles, showDrawer, editorWidth, source, result, postsIndex} = this.state;
        return (
            <React.Fragment>
                <div className={classes.root}>
                    <CssBaseline />
                    {progress}
                    {showFiles && <Files
                        onCreate={this.onCreateFile.bind(this)}
                        onSelect={this.onFileSelected.bind(this)}
                        onCancel={this.onFileCanceled.bind(this)}
                        path={this.state.path}
                        toast={this.toast.bind(this)}
                    />}
                    <Drawer
                        className={classes.drawer}
                        anchor="left"
                        variant={'temporary'}
                        classes={{paper: classes.drawerPaper}}
                        open={showDrawer}
                        onClose={this.showDrawer.bind(this)}
                    >
                        <Button onClick={this.showDrawer.bind(this)} color={'secondary'}>关闭</Button>
                        <Typography className={classes.drawerHeader} classes={{root: classes.textColor}} variant={'body2'} align={'center'}>
                            这里是存储在扩展中还没有同步到Github的文章
                        </Typography>
                        <Divider />
                        <List>
                            {postsIndex.map((posts, index) => (
                                <ListItem button key={posts.path}
                                          onClick={this.onOpenLocalFile.bind(this, index)}
                                >
                                    <ListItemIcon onClick={this.deletePostCache.bind(this, index)}>{<Delete className={classes.iconDelete}></Delete>}</ListItemIcon>
                                    <ListItemText
                                        primaryTypographyProps={{classes: {root: classes.textColor}}}
                                        primary={posts.path} />
                                </ListItem>
                            ))}
                        </List>
                    </Drawer>
                    <main className={classes.content}>
                        <EditorBar
                            className={classes.editorBar}
                            localNew={()=>this.loadData()}
                            local={this.showDrawer.bind(this)}
                            open={this.open.bind(this)}
                            upload={this.upload.bind(this)}
                        />

                        <div className={classes.editorWrapper}>
                            <div className={classes.left} style={({width: editorWidth + 'px'})}>
                                <TextEditor className={classes.editor} value={source} onKeyDown={this.handleKeyDown.bind(this)} onChange={this.handleUpdate.bind(this)} />
                            </div>
                            <div id="resizable" className={classes.divider} />
                            <div className={classes.right + ' main-content'} dangerouslySetInnerHTML={{__html: result}} />
                        </div>
                    </main>
                    <div className={classes.path}>{this.state.path}</div>
                </div>

                <Dialog
                    open={this.state.showAlert}
                >
                    <DialogTitle>{"提交到 GitHub?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            提交当前文件到 Github，同时会删除本地缓存
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose.bind(this, 'showAlert')} color="primary">
                            取消
                        </Button>
                        <Button onClick={this.uploadConfirm.bind(this)} color="primary" autoFocus>
                            确定
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

let drawerWidth = 320;
const styles = theme => ({
    root: {
        height: '100vh', width: '100vw'
    },
    path: {
        position: 'absolute', padding: '2px 8px',
        left: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,.2)', color: '#b3b3b3'
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
        backgroundColor: '#2e2e2e'
    },
    drawerHeader: {
        padding: theme.spacing.unit
    },
    textColor: {color: '#b3b3b3'},

    content: {
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
    },
    listItem: {
      fontSize: 50
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
    },
    iconDelete: {
        color: theme.palette.secondary.main
    }
})

export default withSnackbar(withStyles(styles, { withTheme: true })(MDEditor));
