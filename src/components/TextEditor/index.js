import React from "react";
import "./index.css"

function TextEditor(props) {
    let tabSize = props.tabSize || 2;
    function handleKeyUp(ev) {
        if(ev.keyCode && ev.keyCode == 9){ // Tab键
            let selectionStart = ev.target.selectionStart;
            let start = ev.target.value.substring(0, selectionStart)
            let end = ev.target.value.substr(ev.target.selectionEnd)
            ev.target.value = start + Array(tabSize).fill(' ').join('') + end;
            ev.target.selectionStart = ev.target.selectionEnd = selectionStart+tabSize;
            ev.preventDefault();
        }
        if(props.onUpdate && typeof props.onUpdate === 'function'){
            props.onUpdate({
                type: 'update',
                value: ev.target.value
            })
        }
    }

    function handleKeyDown(ev) {
        if(ev.altKey || ev.shiftKey || ev.metaKey){
            if(ev.key == 's' && ev.metaKey || ev.key == 's' && ev.shiftKey){
                props.onUpdate({
                    type: 'save',
                    value: ev.target.value
                })
                return ev.preventDefault();
            }
        }
    }
    const view = (
        <div className={props.className + ' wrapper-editor'}>
            <textarea
                id="text-editor"
                onKeyUp={handleKeyUp}
                onChange={handleKeyUp}
                onKeyDown={handleKeyDown}
                value={props.value}
            ></textarea>
        </div>
    );
    return view;
}

export default TextEditor;
