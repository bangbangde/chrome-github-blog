import React from 'react';
import ReactDom from 'react-dom';
const container = document.createElement('div');
function View(){
    const styles = {
        info: {
            minWidth: '100px',
            margin: '24px'
        }
    }
    return (<div style={styles.info}>正在初始化一些数据，请稍等...</div>)
}
ReactDom.render(<View></View>, container);
document.body.appendChild(container);
