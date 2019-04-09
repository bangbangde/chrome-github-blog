import React from 'react';
import ReactDom from 'react-dom';
import OAuth from '../components/oauth/index.jsx';

console.log('注入脚本成功')
let container = document.createElement('div');
document.body.appendChild(container);

ReactDom.render((
    <div>
        <p>注入脚本成功</p>
        <OAuth></OAuth>
    </div>
), container);
