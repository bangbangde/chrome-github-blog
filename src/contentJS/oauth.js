import React from 'react';
import ReactDom from 'react-dom';

console.log('注入脚本成功')
let container = document.createElement('div');
document.body.appendChild(container);
ReactDom.render((
    <div>
        <p>注入脚本成功</p>
    </div>
), container);