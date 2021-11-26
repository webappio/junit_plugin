var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
fs = require('fs');
let path = require('path');
const Client = require('ssh2-sftp-client');

const FRONT_END_PATH = path.join(__dirname, '..', 'app', 'build')
const puppeteer = require('puppeteer');
const {exec} = require("child_process");
const {XMLParser} = require("fast-xml-parser");
const {response} = require("express");
const STDOUT_STYLE = `
<style>
.stdio, pre {
    min-height: 1em;
    background-color: #1e1e1e;
    color: silver;
    padding: 0.5em;
}
</style>
`
const BACK_BUTTON = `<input type="button" value="Back" onclick="history.back(-1)" />`
const dst = '/var/tmp';
const remotePath = '/layercidata/junitXML/';
const re = /.*\.xml$/;

async function getFileFromVM(fileName, config) {
    fs.access(`${path}.html`, fs.constants.F_OK, function(err) {
        if(err == null) {
            console.log(`${path} exists, no need to download`)
            return
        }
    })
    let sftp = new Client;
    await sftp.connect(config)
        .then(() => {
            return sftp.get(`${remotePath}/${fileName}`, fs.createWriteStream(`${dst}/${fileName}`),re);
        })
        .then(() => {
            checkReportOrParse(`${dst}/${fileName}`)
        })
        .then(() => {
            sftp.end();
        })
        .catch(err => {
            console.error(err.message);
        });
}

function checkReportOrParse(path, res) {
    fs.access(`${path}.html`, fs.constants.F_OK, function(err) {
        if(err == null) {
            if (res) {
                res.sendFile(`${path}.html`);
            }
        } else if (err.code === 'ENOENT') {
            // file does not exist
            const { exec } = require('child_process');

            const ls = exec(`junit2html ${path} ${path}.html`, function (error, stdout, stderr) {
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
                if (res) {
                    res.sendFile(path);
                }
            });
        } else {
            console.log('Some other error: ', err.code);
            if (res) {
                res.send(err)
            }
        }
    });
}

app.use(express.json());

app.use(express.static(FRONT_END_PATH));

app.get('/stdout/:fileName/:testId', function(req, res, next) {
    try {
        (async () => {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox']
            });
            const [page] = await browser.pages();
            await page.goto(`${req.protocol}://${req.get('host')}/xml/${req.params.fileName}`, {waitUntil: 'networkidle0'})
            let data = BACK_BUTTON + STDOUT_STYLE + await page.evaluate((testId) => document.getElementById(testId).parentElement.getElementsByTagName('pre')[0].outerHTML, req.params.testId);
            res.send(data)
            await browser.close();
        })();
    } catch (err) {
        console.err(`Failed to open ${req.params.filename}`)
        console.error(err)
    }
})

// TODO: doesn't work
app.get('/api/all-tests/:jobUuid', function(req, res, next){
    console.log(`received api request at ${req.path}`)
    const config = {
        host: `${req.params.jobUuid}.lan`,
        username: 'root',
        password: 'password'
    };
    let sftp = new Client;
    let response = [];
    sftp.connect(config)
        .then(() => {
            return sftp.list(remotePath, re);
        })
        .then(async files => {
            for (const file of files) {
                await getFileFromVM(file.name, config)
            }
            return files
        })
        .then(async (files) => {
            const options = {
                ignoreAttributes: false,
                attributeNamePrefix: "attr_"
            };
            const parser = new XMLParser(options);
            await Promise.all(files.map(async (file) => {
                await fs.readFile(`${dst}/${file.name}`, (err, data) => {
                let test = {
                    failures: 0,
                    tests: 0,
                    time: 0,
                };
                if (err) {
                    console.log(`${req.params.fileName} does not exist`);
                    return
                }
                const output = parser.parse(data);
                for (const testsuite of output.testsuites.testsuite) {
                    test.failures = parseInt(testsuite.attr_failures);
                    test.tests = parseInt(testsuite.attr_tests);
                    test.time = parseFloat(testsuite.attr_time);
                }
                response.push(test)
            })}));
            return response
        })
        .then((response) => {
            res.send(response);
        })
        .then(() => {
            sftp.end();
        })
        .catch(err => {
            console.error(err.message);
        });
})

app.get('/api/tests/:fileName', function(req, res, next){
    let response = {
        failures: 0,
        tests: 0,
        time: 0,
    };
    fs.readFile(`${dst}/${req.params.fileName}`, (err, data) => {
        if (err) {
            console.log(`${req.params.fileName} does not exist`);
            res.send()
            return
        }
        const options = {
            ignoreAttributes: false,
            attributeNamePrefix : "attr_"
        };
        const parser = new XMLParser(options);
        const output = parser.parse(data);
        output.testsuites.testsuite.forEach(testsuite => {
            response.failures += parseInt(testsuite.attr_failures);
            response.tests += parseInt(testsuite.attr_tests);
            response.time += parseFloat(testsuite.attr_time);
        })
        res.send(response)
    })
})

app.get('/api/failed-tests/:fileName', function(req, res, next){
    try {
        (async () => {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox']
            });
            const page = await browser.newPage();
            await page.goto(`${req.protocol}://${req.get('host')}/xml/${req.params.fileName}`, {waitUntil: 'networkidle0'});
            await page.waitForSelector('.failure-index > ul:nth-child(1) > li');
            const failedTests = (await page.$$('.failure-index > ul:nth-child(1) > li'))
            let response = [];
            await Promise.all(failedTests.map(async test => {
                    let id = (await test.evaluate(el => el.getElementsByTagName('a')[0].getAttribute('href'))).substring(1);
                    let text = (await test.evaluate(el => el.getElementsByTagName('a')[0].textContent.substring(4)))
                    response.push({id: id, text: text})
                })
            )
            res.send(response)

            await browser.close();
        })();
    } catch (err) {
        console.err(`Failed to open ${req.params.filename}`)
        console.error(err)
    }
})

app.get('/xml/:filename', function(req, res, next){
    fs.access(`${dst}/${req.params.filename}`, fs.constants.F_OK, (err) => {
        err ? console.log(`${req.params.filename} does not exist`) : checkReportOrParse(`${dst}/${req.params.filename}`, res)
    })
});

app.get('/api/xml', async function (req, res, next) {
    let response = [];
    try {
        const files = await fs.promises.readdir(dst);
        for (const file of files)
            if (file.endsWith('.xml')) {
                response.push(file)
            }
    } catch (err) {
        console.error(err);
    }
    res.send(response)
});

app.get('/api/ssh/:jobUuid', function(req, res, next){
    console.log(`received api request at ${req.path}`)
    const config = {
        host: `${req.params.jobUuid}.lan`,
        username: 'root',
        password: 'password'
    };
    let sftp = new Client;

    sftp.connect(config)
        .then(() => {
            return sftp.list(remotePath, re);
        })
        .then(data => {
            res.send(data);
            data.forEach(file => {
                fs.access(`${dst}/${file.name}`, fs.constants.F_OK, (err) => {
                    err ? getFileFromVM(file.name, config) : console.log(`${file.name} exists, no need to download`)
                })
            })
        })
        .then(() => {
            sftp.end();
        })
        .catch(err => {
            console.error(err.message);
        });
});

app.get('*', (req, res) => res.sendFile(path.join(FRONT_END_PATH, 'index.html')));

app.listen(3000);
