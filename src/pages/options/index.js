import React from 'react';
import ReactDom from 'react-dom';
import Utils from '../../utils';

ReactDom.render((
<div>
    <h1>options</h1>
</div>
), document.getElementById('root'));

document.getElementById('ajax').addEventListener('click', () => {
    Utils.request({
        url: 'https://api.github.com/users/octocat/orgs',
        headers: {
            Accept: 'application/vnd.github.v3+json'
        },
        data: {
            user: 'cqbyte'
        }
    })
})