const fs = require('fs');
const path = require('path');

// 读取构建后的HTML文件
const htmlPath = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 移除 type=module 属性
html = html.replace('type=module ', '');

// 写回文件
fs.writeFileSync(htmlPath, html);

console.log('HTML file fixed successfully!');
