var express = require('express');
var app = express();
fs = require('fs');
let path = require('path');
const fetch = require('node-fetch');
const Client = require('ssh2-sftp-client');
const fsPromise = require("fs").promises;
const FRONT_END_PATH = path.join(__dirname, '..', 'app', 'build')
const puppeteer = require('puppeteer');
const {XMLParser} = require("fast-xml-parser");
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
const remotePath = '/webappio/junitXML/';
const re = /.*\.xml$/;

async function getFileFromVM(fileName, config) {
    let sftp = new Client;
    await sftp.connect(config)
        .then(() => {
            return sftp.get(`${remotePath}/${fileName}`, fs.createWriteStream(`${dst}/${config.host}:${fileName}`), re);
        })
        .then(() => {
            parse(`${dst}/${config.host}:${fileName}`)
        })
        .then(() => {
            sftp.end();
        })
        .catch(err => {
            console.error(err.message);
        });
}

function parse(path, res) {
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
            res.sendFile(`${path}.html`);
        }
    });
}

app.use(express.json());

app.use(express.static(FRONT_END_PATH));

app.get('/api/runners/:jobUuid', function(req, res, next){
    fetch(`https://webapp.io/pluginapi/job/${req.params.jobUuid}/runner_ips`)
        .then(response => response.json())
        .then(data => res.send(data))
})

app.get('/stdout/:ip/:fileName/:testId', function(req, res, next) {
    try {
        (async () => {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox']
            });
            const [page] = await browser.pages();
            await page.goto(`${req.protocol}://${req.get('host')}/xml/${req.params.ip}/${req.params.fileName}`, {waitUntil: 'networkidle0'})
            let data = BACK_BUTTON + STDOUT_STYLE + await page.evaluate((testId) => document.getElementById(testId).parentElement.getElementsByTagName('pre')[0].outerHTML, req.params.testId);
            res.send(data)
            await browser.close();
        })();
    } catch (err) {
        console.err(`Failed to open ${req.params.filename}`)
        console.error(err)
    }

})

app.get('/api/all-tests/:ip', function(req, res, next){
    console.log(`received api request at ${req.path}`)
    const config = {
        host: req.params.ip,
        port: '22',
        username: 'root',
        password: 'password'
    };

    let sftp = new Client;
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
            return files.reduce(async (arr, file) => {
                try {
                    const data = await fsPromise.readFile(`${dst}/${req.params.ip}:${file.name}`, "utf8");
                    const output = parser.parse(data);
                    const testcases = output.testsuites.testsuite || [];
                    const test = testcases.reduce((obj, key) => {
                        const failures = parseInt(key['attr_failures']) || 0;
                        const tests = parseInt(key['attr_tests']) || 0;
                        const time = parseFloat(key['attr_time']) || 0;
                        return {
                            failures: failures + obj.failures,
                            tests: tests + obj.tests,
                            time: time + obj.time,
                        };
                    }, {failures: 0, tests: 0, time: 0});
                    return [...arr, test];
                } catch (e) {
                    console.log("Failed to read file, ", e);
                    return arr;
                }
            }, []);
        })
        .then((response) => {
            console.log({ response });
            res.send(response);
        })
        .then(() => {
            sftp.end();
        })
        .catch(err => {
            console.error(err, err.message);
            res.sendStatus(500)
        });
})

app.get('/api/tests/:ip/:fileName', function(req, res, next){
    let response = {
        failures: 0,
        tests: 0,
        time: 0,
    };
    fs.readFile(`${dst}/${req.params.ip}:${req.params.fileName}`, (err, data) => {
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

app.get('/api/failed-tests/:ip/:fileName', function(req, res, next){
    try {
        (async () => {
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox']
            });
            const page = await browser.newPage();
            await page.goto(`${req.protocol}://${req.get('host')}/xml/${req.params.ip}/${req.params.fileName}`, {waitUntil: 'networkidle0'});
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

app.get('/xml/:ip/:filename', function(req, res, next){
    fs.access(`${dst}/${req.params.ip}:${req.params.filename}.html`, fs.constants.F_OK, (err) => {
        err ? parse(`${dst}/${req.params.ip}:${req.params.filename}`, res) : res.sendFile(`${dst}/${req.params.ip}:${req.params.filename}.html`)
    })});

app.get('/api/ssh/:ip', function(req, res, next){
    console.log(`received api request at ${req.path}`)
    const config = {
        host: req.params.ip,
        port: '22',
        username: 'root',
        password: 'password'
    };
    let sftp = new Client;

    sftp.connect(config)
        .then(() => {
            return sftp.list(remotePath, re);
        })
        .then(data => {
            if (data.length === 0) {
                res.sendStatus(204);
            } else {
                res.send(data)
                data.forEach(file => {
                    getFileFromVM(file.name, config)
                        .then(() => {
                            console.log(`Downloaded ${file.name} from ${config.host}`)
                        })
                })
            }
        })
        .then(() => {
            sftp.end();
        })
        .catch(err => {
            console.error(err.message);
            res.send();
        });
});

app.get('*', (req, res) => res.sendFile(path.join(FRONT_END_PATH, 'index.html')));

app.listen(3000);
