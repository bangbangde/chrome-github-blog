import React from 'react';
import ReactDom from 'react-dom';

let container = document.createElement('div');
document.body.appendChild(container);
ReactDom.render((
	<div>popup</div>
), container);
