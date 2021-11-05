var express = require('express');
const {exec} = require("child_process");
var app = express();
var expressWs = require('express-ws')(app);
fs = require('fs');
let path = require('path');

const FRONT_END_PATH = path.join(__dirname, '..', 'app', 'build')

app.use(express.json());

app.use(express.static(FRONT_END_PATH));

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
                res.sendFile(path.join(__dirname, req.params.filename+'.html'));
                fs.unlink(req.params.filename+'.html', (err) => {
                    if (err) throw err;
                    console.log(req.params.filename+'.html was deleted');
                });
            }
        });
    });
});

app.get('/xml', function(req, res, next){
    const ls = exec('ls | grep *.xml', function (error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: '+error.code);
            console.log('Signal received: '+error.signal);
        }
        res.send(stdout);
    });

    ls.on('exit', function (code) {
        console.log('Child process exited with exit code '+code);
    });
});

app.get('/ssh/:jobUuid', function(req, res, next){
    var Client = require('ssh2').Client;
    var conn = new Client();

    conn.on('error', function(err) {
        console.log('SSH - Connection Error: ' + err);
        res.send(`No xml files found`)
    });

    conn.on('end', function() {
        console.log('SSH - Connection Closed');
    });

    conn.on('ready', function() {
        res.send(`it's ready`)
    });

    conn.connect({
        host: `${req.params.jobUuid}.lan`,
        username: 'root',
        password: 'password'
    });
});

app.get('*', (req, res) => res.sendFile(path.join(FRONT_END_PATH, 'index.html')));

app.listen(3000);
