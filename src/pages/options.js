import React from 'react';
import ReactDom from 'react-dom';

async function initView(){
    const Init = (await import('@/views/init/index')).default;
    let background = chrome.extension.getBackgroundPage().actions;
    let step =background.step;
    return <Init step={step}></Init>;
}

let container = document.createElement('div');
document.body.appendChild(container);
initView().then(view => {
    ReactDom.render(view, container);
})
