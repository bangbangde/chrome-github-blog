import React from 'react';
import ReactDom from 'react-dom';
import { SnackbarProvider } from "notistack";
import Editor from '@/views/editor/index';

window.background = chrome.extension.getBackgroundPage().actions;
const container = document.createElement('div');
const view = (
    <SnackbarProvider anchorOrigin={{ vertical: 'top', horizontal: 'center' }}  maxSnack={3}>
        <Editor></Editor>
    </SnackbarProvider>
);
ReactDom.render(view, container);
document.body.appendChild(container);
