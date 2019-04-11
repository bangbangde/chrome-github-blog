import React from 'react';
import ReactDom from 'react-dom';
import Editor from '@/views/editor/index';

let container = document.createElement('div');
document.body.appendChild(container);
ReactDom.render(<Editor></Editor>, container);
