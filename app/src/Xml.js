import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";

function XML() {
    const [xml, setXml] = useState('');
    const [sshOutput, setSshOutput] = useState('');
    let { jobUuid } = useParams();

    let xmlFiles = xml.split('\n');

    useEffect(() =>{
        fetch('/xml')
            .then(response => response.text())
            .then(data => setXml(data))
        fetch(`/ssh/${jobUuid}`)
            .then(response => response.text())
            .then(data => setSshOutput(data))
    })

    return (
        <div className="Default">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                {xmlFiles.map(file =>
                    <a
                        className="App-link"
                        href={"/failed-tests/"+file}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {file}
                    </a>
                )}
            </header>
        </div>
    );
}

export default XML;
