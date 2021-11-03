var express = require('express');
const {exec} = require("child_process");
var app = express();
var expressWs = require('express-ws')(app);
fs = require('fs');
let path = require('path');

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    console.log('middleware');
    req.testing = 'testing';
    return next();
});

app.get('/xml', function(req, res, next){
    const { exec } = require('child_process');

    const ls = exec('ls | grep *.xml', function (error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: '+error.code);
            console.log('Signal received: '+error.signal);
        }
        console.log('Child Process STDOUT: '+stdout);
        console.log('Child Process STDERR: '+stderr);

        res.send(stdout);
    });

    ls.on('exit', function (code) {
        console.log('Child process exited with exit code '+code);
    });
});

app.get('/xml/:filename', function(req, res, next){
    const { exec } = require('child_process');

    const ls = exec('junit2html ' + req.params.filename, function (error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: '+error.code);
            console.log('Signal received: '+error.signal);
        }
        console.log('Child Process STDOUT: '+stdout);
        console.log('Child Process STDERR: '+stderr);
    });

    ls.on('exit', function (code) {
        console.log('Child process exited with exit code '+code);
        fs.readFile(req.params.filename+'.html', 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            } else {
                res.send(data);
            }
        });
        fs.unlink(path.join(__dirname,req.params.filename+'.html'),function(err){
            if(err) return console.log(err);
            console.log(req.params.filename+'.html'+' deleted successfully');
        });
    });
});

app.get('/', function(req, res, next){
    console.log('get route', req.testing);
    res.end();
});

app.ws('/', function(ws, req) {
    ws.on('message', function(msg) {
        console.log(msg);
    });
    console.log('socket', req.testing);
});

app.listen(3000);
app.get
