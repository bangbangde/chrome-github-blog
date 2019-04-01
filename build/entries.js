const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let pages = fs.readdirSync('src/pages');

function entries () {
    let entries = {};
    pages.forEach(name => {
        entries[path.join(name)] = path.resolve('./src', 'pages', name, 'index.js');
    });
    fs.readdirSync('src/contentJS').forEach(name => {
        entries[path.join(path.basename(name, '.js'))] = path.resolve('./src', 'contentJS', name);
    });
    entries.background = path.resolve('./src', 'background.js');
    return entries;
}

function htmlPlugins() {
    return pages.map(name =>{
        let param = {
            template: path.resolve('./src', 'pages', name, 'index.html'),
            filename: path.join('./', name + '.html'),
            chunks: [path.join(name), 'vendors'],
        };
        try {
            fs.accessSync(param.template)
        }catch(e){
            delete param.template;
        }
        return new HtmlWebpackPlugin(param);
    })
}

module.exports = {entries, htmlPlugins};