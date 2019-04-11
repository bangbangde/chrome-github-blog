import React from "react";
import "./index.css";
import TextEditor from "@/components/TextEditor/index";
import EditorBar from "@/components/EditorBar";
import Marken from "marked";

function handleMouseMove(ev) {
    this.setState({
        editorWidth: ev.pageX,
        editorWidthPercent: ev.pageX/document.body.offsetWidth});
}

class PEDitor extends React.Component {
    constructor(props){
        super(props);
        let ewp = props.editorWidthPercent || 0.5
        this.state = {
            editorWidth: ewp * document.body.offsetWidth,
            editorWidthPercent: ewp,
            source: '',
            result: ''
        };
        this.autoSaveTime = 10000;
        this.timerID = null;

        handleMouseMove = handleMouseMove.bind(this);

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
            document.body.removeEventListener('mousemove', handleMouseMove);
        })
    }

    handleUpdate(ev){
        let result = Marken(ev.value)
        this.setState({source: ev.value, result})
        this.cache(ev.value, ev.type == 'save')
    }

    cache(source, save){
        if(save){
            if(this.timerID){
                clearTimeout(this.timerID);
                this.timerID = null;
            }
            localStorage.setItem('TMP_ARTICLE_SOURCE', source)
            return;
        }
        if(this.timerID){
            clearTimeout(this.timerID);
        }
        this.timerID = setTimeout(() => {
            this.timerID = null;
            localStorage.setItem('TMP_ARTICLE_SOURCE', source)
        }, this.autoSaveTime)
    }
    componentDidMount() {
        let source = localStorage.getItem('TMP_ARTICLE_SOURCE')
        if(source){
            this.setState({source, result: Marken(source)})
        }
    }

    render() {
        return (
            <div
                className="editor-container"
            >
                <div className="left" style={({width: this.state.editorWidth + 'px'})}>
                    <input className="editor-title" type="text" placeholder="标题"/>
                    <EditorBar className="editor-bar"/>
                    <TextEditor value={this.state.source} onUpdate={this.handleUpdate.bind(this)} className="editor-text" />
                </div>
                <div id="resizable" className="divider"></div>
                <div className="right" dangerouslySetInnerHTML={{__html: this.state.result}}></div>
            </div>
        );
    }
}

export default PEDitor;
