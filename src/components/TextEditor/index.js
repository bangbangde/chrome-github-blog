import React from "react";
import "./index.css"

// 功能键
const KEYS = {
    META: 'metaKey',
    CTRL: 'ctrlKey',
    SHIFT: 'shiftKey',
    ALT: 'altKey'
};

/**
 * 判断组合键
 *
 * @param array<KEYS> keys
 * @param string      key
 */
const testCompKey = (keys, key) => {
    let fks = new Set(['metaKey', 'ctrlKey', 'shiftKey', 'altKey']);
    for (let fk of keys) {
        if(typeof fk == 'object'){
            let count = 0;
            for(let sfk of fk){
                if(event[sfk]) count++;
                fks.delete(sfk)
            }
            if(count != 1){
                return false;
            }
        }else{
            if(event[fk]){
                fks.delete(fk)
            }else{
                return false;
            }
        }
    }
    for(let fk of fks.keys()){
        if(event[fk]) return false;
    }
    return event.key.toLowerCase() == key;
}




function TextEditor(props) {
    let tabSize = props.tabSize || 2;

    /**
     type keydown
     key s
     ctrlKey false
     shiftKey false
     altKey false
     metaKey true
     repeat false
     charCode 0
     keyCode 83
     which 83
     */
    function handleKeyDown(ev) {
        if(ev.key == 'Tab'){
            let selectionStart = ev.target.selectionStart;
            let start = ev.target.value.substring(0, selectionStart)
            let end = ev.target.value.substr(ev.target.selectionEnd)
            ev.target.value = start + Array(tabSize).fill(' ').join('') + end;
            ev.target.selectionStart = ev.target.selectionEnd = selectionStart+tabSize;
            ev.preventDefault();
        }

        // 自定义组合键
        if(testCompKey([[KEYS.CTRL, KEYS.META]], 's')){
            props.onKeyDown({
                type: 'save',
                value: event.target.value
            })
            ev.preventDefault();
        }

        // Force save Meta+Shift+s | Ctrl+Shift+s
        if(testCompKey([[KEYS.CTRL, KEYS.META], KEYS.SHIFT], 's')){
            props.onKeyDown({
                type: 'forceSave',
                value: event.target.value
            })
            ev.preventDefault();
        }
        // Cut line
        if(testCompKey([[KEYS.CTRL, KEYS.META]], 'x')){
            props.onKeyDown({
                type: 'cutLine',
                value: ''
            })
            ev.preventDefault();
        }

    }

    function handlePast(ev) {
        console.log(ev.clipboardData.types)
    }

    function onChangeListener() {
        props.onChange({
            type: 'onChange',
            value: event.target.value
        })
    }
    const view = (
        <div className={props.className + ' wrapper-editor'}>
            <textarea
                id="text-editor"
                // onKeyUp={handleKeyUp}
                onChange={onChangeListener}
                onKeyDown={handleKeyDown}
                onPaste={handlePast}
                value={props.value}
            ></textarea>
        </div>
    );
    return view;
}

export default TextEditor;
