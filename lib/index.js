var express = require('express');
const {exec} = require("child_process");
var app = express();
var expressWs = require('express-ws')(app);
fs = require('fs');
let path = require('path');

const FRONT_END_PATH = path.join(__dirname, '..', 'app', 'build')
const puppeteer = require('puppeteer');
const STDOUT_STYLE = `<style>
.stdio, pre {
    min-height: 1em;
    background-color: #1e1e1e;
    color: silver;
    padding: 0.5em;
}
</style>
`


app.use(express.json());

app.use(express.static(FRONT_END_PATH));

app.get('/stdout/:fileName/:testId', function(req, res, next) {
    (async () => {
        const browser = await puppeteer.launch();
        const [page] = await browser.pages();

        await page.goto(`${req.protocol}://${req.get('host')}/xml/${req.params.fileName}`, { waitUntil: 'networkidle0' })
        let data = STDOUT_STYLE + await page.evaluate((testId) => document.getElementById(testId).parentElement.getElementsByTagName('pre')[0].outerHTML, req.params.testId);
        console.log(data)
        res.send(data)
        await browser.close();
    })();
})

app.get('/api/failed-tests/:fileName', function(req, res, next){
    (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`${req.protocol}://${req.get('host')}/xml/${req.params.fileName}`, { waitUntil: 'networkidle0' });
        await page.waitForSelector('.failure-index > ul:nth-child(1) > li');
        const list = (await page.$('.failure-index > ul:nth-child(1)'));
        const failedTests = (await page.$$('.failure-index > ul:nth-child(1) > li'))
        let failedTestIds = [];
        await Promise.all(failedTests.map(async test => {
                let id = (await test.evaluate(el => el.getElementsByTagName('a')[0].getAttribute('href'))).substring(1);
                failedTestIds.push(id)
            })
        )
        res.send(failedTestIds)

        await browser.close();
    })();
})

app.get('/xml/:filename', function(req, res, next){
    fs.stat(req.params.filename+'.html', function(err, stat) {
        if(err == null) {
            res.sendFile(path.join(__dirname, req.params.filename+'.html'));
        } else if(err.code === 'ENOENT') {
            // file does not exist
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
                res.sendFile(path.join(__dirname, req.params.filename+'.html'));
            });
        } else {
            console.log('Some other error: ', err.code);
        }
    });

});

app.get('/xml', function(req, res, next){
    const ls = exec("ls -R | grep '\.xml$'", function (error, stdout, stderr) {
        if (error) {
            console.log(error.stack);
            console.log('Error code: '+error.code);
            console.log('Signal received: '+error.signal);
        }
        res.send(stdout);
    });

    ls.on('exit', function (code, stdout, stderr) {
        console.log('Child Process STDOUT: '+stdout);
        console.log('Child Process STDERR: '+stderr);
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
