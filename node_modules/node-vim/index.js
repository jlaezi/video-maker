var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');

var spawn = childProcess.spawn;
var spawnSync = childProcess.spawnSync;

var tempFile = path.resolve('/tmp', `temp-${process.pid}${Date.now()}.tmp`)

var ed = /^win/.test(process.platform) ? 'notepad' : 'vim';
ed = process.env.VISUAL || process.env.EDITOR || ed;

exports.editor = function(option) {
    option = option || {};
    var tempFile = path.resolve('/tmp', `temp-${process.pid}${Date.now()}.tmp`)
    return new Promise(function(resolve, reject) {
        var ps = spawn(option.editor || ed, [tempFile], {
            stdio: 'inherit'
        });

        ps.on('exit', function(code, signal) {
            if (code) {
                var err = new Error(`Exited code: ${code}`);
                err.code = code;
                reject(err);
            }
            if (signal) {
                var err = new Error(`Exited with signal: ${signal}`);
                err.signal = signal;
                reject(err);
            }

            fs.readFile(tempFile, 'utf8', function(e, content) {
                if (err) {
                    throw err;
                }
                resolve(content);
            });
        })
    })
    
}

exports.editorSync = function(option) {
    option = option || {};
    var tempFile = path.resolve('/tmp', `temp-${process.pid}${Date.now()}.tmp`);

    spawnSync(option.editor || ed, [tempFile], {
        stdio: 'inherit'
    });

    var contents = fs.readFileSync(tempFile, 'utf8');
    
    return contents;
}
