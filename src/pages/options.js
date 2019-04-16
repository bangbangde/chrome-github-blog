import React from 'react';
import ReactDom from 'react-dom';
import { SnackbarProvider } from 'notistack';
import Option from '@/views/option';

const container = document.createElement('div');
const view = (
    <SnackbarProvider maxSnack={3}>
        <Option></Option>
    </SnackbarProvider>
);
ReactDom.render(view, container);

window.background = chrome.extension.getBackgroundPage().actions;
document.body.appendChild(container);
