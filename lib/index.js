const express = require('express');
const app = express();
fs = require('fs');
let path = require('path');
const fetch = require('node-fetch');
const Client = require('ssh2-sftp-client');
const fsPromise = require("fs").promises;
const FRONT_END_PATH = path.join(__dirname, '..', 'app', 'build')
const {XMLParser} = require("fast-xml-parser");
const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );const STDOUT_STYLE = `
<style>
pre {
    min-height: 1em;
    background-color: #1e1e1e;
    color: silver;
    padding: 0.5em;
}
</style>
`
const BACK_BUTTON = `<input type="button" value="Back" onclick="history.back()" />`
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

app.get('/api/runners/:jobUuid', function(req, res){
    fetch(`https://webapp.io/pluginapi/job/${req.params.jobUuid}/runner_ips`)
        .then(response => response.json())
        .then(data => {
            res.send(data)
            data.forEach(runner => {
                const config = {
                    host: runner.running_pod_ip4,
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
                            console.log('no running runners');
                        } else {
                            if (!myCache.set( `${runner.running_pod_ip4}`, data, 600 )) {
                                console.log('failed to write into cache');
                            }
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
                    });
            })
        })
})

app.get('/stdout/:ip/:fileName/:testName', function(req, res) {
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
            let testcases = Array.isArray(testsuite.testcase) ? testsuite.testcase : [testsuite.testcase];
            testcases.forEach(testcase => {
                if (`${testcase.attr_classname}:${testcase.attr_name}` === req.params.testName) {
                    let data = BACK_BUTTON + STDOUT_STYLE + "<pre>" +testcase.failure.attr_message + "</pre>";
                    res.send(data);
                }
            })
        })
    })
})

app.get('/api/all-tests/:ip', function(req, res){
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

app.get('/api/tests/:ip/:fileName', function(req, res){
    let tests = myCache.get(`${req.params.ip}:${req.params.fileName}`);
    if ( tests ){
        res.send(tests);
        console.log('successfully read from cache');
    } else {
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
    }
})

app.get('/api/failed-tests/:ip/:fileName', function(req, res){
    const options = {
        ignoreAttributes: false,
        attributeNamePrefix : "attr_"
    };
    const parser = new XMLParser(options);
    fs.readFile(`${dst}/${req.params.ip}:${req.params.fileName}`, (err, data) => {
        if (err) {
            console.log(`${req.params.fileName} does not exist`);
            return
        }
        const output = parser.parse(data);
        let response = [];
        output.testsuites.testsuite.forEach(testsuite => {
            let testcases = Array.isArray(testsuite.testcase) ? testsuite.testcase : [testsuite.testcase];
            testcases.forEach(testcase => {
                if (testcase.failure) {
                    response.push({testName: `${testcase.attr_classname}:${testcase.attr_name}`});
                }
            })
        })
        res.send(response);
    })
})

app.get('/xml/:ip/:filename', function(req, res){
    fs.access(`${dst}/${req.params.ip}:${req.params.filename}.html`, fs.constants.F_OK, (err) => {
        err ? parse(`${dst}/${req.params.ip}:${req.params.filename}`, res) : res.sendFile(`${dst}/${req.params.ip}:${req.params.filename}.html`)
    })});

app.get('/api/ssh/:ip', function(req, res){
    console.log(`received api request at ${req.path}`)
    const config = {
        host: req.params.ip,
        port: '22',
        username: 'root',
        password: 'password'
    };
    let files = myCache.get(req.params.ip);
    if ( files ){
        res.send(files);
        console.log('successfully read from cache');
    } else {
        let sftp = new Client;
        sftp.connect(config)
            .then(() => {
                return sftp.list(remotePath, re);
            })
            .then(data => {
                if (data.length === 0) {
                    res.sendStatus(204);
                } else {
                    res.send(data);
                    data.forEach(file => {
                        getFileFromVM(file.name, config)
                            .then(() => {
                                console.log(`Downloaded ${file.name} from ${config.host}`)
                            })
                    })
                    files = data;
                }
            })
            .then(() => {
                sftp.end();
            })
            .catch(err => {
                console.error(err.message);
                res.send();
            });
    }
    let response = {
        failures: 0,
        tests: 0,
        time: 0,
    };
    files.forEach(file => {
        fs.readFile(`${dst}/${req.params.ip}:${file}`, (err, data) => {
            if (err) {
                console.log(`${req.params.fileName} does not exist`);
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
            myCache.set(`${req.params.ip}:${file}`, response, 600);
        })
    })
});

app.get('*', (req, res) => res.sendFile(path.join(FRONT_END_PATH, 'index.html')));

app.listen(3000);
