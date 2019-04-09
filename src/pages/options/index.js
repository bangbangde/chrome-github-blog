import React from 'react';
import ReactDom from 'react-dom';
import Option from "@/views/option/index";

let container = document.createElement('div');
document.body.appendChild(container);
ReactDom.render((
<div>
    <Option></Option>
</div>
), container);
