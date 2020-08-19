# node-vim
open an vim editor in Unix-like system, notepad in windows or specified editor via nodejs.

## Install
`
$ npm install node-vim --save
`

## Usage

```javascript
var nv = require('node-vim');
var option = {};
nv.editor(option).then(function(content) {
    console.log(content);
});
console.log('execute first');
```

synchronous version
```javascript
var nv = require('node-vim');
var option = {};
var content = nv.editorSync(option);
console.log(content);
```